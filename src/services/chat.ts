import {
  onValue,
  orderByChild,
  push,
  query,
  ref,
  runTransaction,
  serverTimestamp,
  update,
  type DataSnapshot,
} from 'firebase/database';
import { getFirebaseServices } from './firebase';
import type { ChatMessage, MessageType, UserChat } from '../types';

type ChatListListener = (chats: Record<string, UserChat>) => void;
type MessagesListener = (messages: ChatMessage[]) => void;
type ListenerError = (error: Error) => void;

function encodeUid(uid: string): string {
  return encodeURIComponent(uid).replace(/\./g, '%2E');
}

export function getDirectChatId(firstUid: string, secondUid: string): string {
  const [first, second] = [firstUid, secondUid].sort();
  const encodedFirst = encodeUid(first);
  const encodedSecond = encodeUid(second);
  return `pair_${encodedFirst.length}_${encodedFirst}_${encodedSecond.length}_${encodedSecond}`;
}

function hasMembers(value: unknown, firstUid: string, secondUid: string): boolean {
  if (typeof value !== 'object' || value === null || !('members' in value)) {
    return false;
  }
  const members = value.members;
  return (
    typeof members === 'object' &&
    members !== null &&
    'first' in members &&
    'second' in members &&
    (members.first === firstUid || members.second === firstUid) &&
    (members.first === secondUid || members.second === secondUid)
  );
}

export async function ensureDirectChat(
  currentUid: string,
  partnerUid: string,
): Promise<string> {
  if (!currentUid || !partnerUid || currentUid === partnerUid) {
    throw new Error('Không thể tạo cuộc trò chuyện với tài khoản này.');
  }

  const { database } = getFirebaseServices();
  const chatId = getDirectChatId(currentUid, partnerUid);
  const chatRef = ref(database, `chats/${chatId}`);
  const chatResult = await runTransaction(
    chatRef,
    current =>
      current ??
      {
        members: {
          first: [currentUid, partnerUid].sort()[0],
          second: [currentUid, partnerUid].sort()[1],
        },
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageAt: 0,
        lastMessageType: 'text',
        lastSenderId: '',
      },
    { applyLocally: false },
  );

  if (!chatResult.committed || !hasMembers(chatResult.snapshot.val(), currentUid, partnerUid)) {
    throw new Error('Dữ liệu cuộc trò chuyện không hợp lệ.');
  }

  const initialChat: UserChat = {
    partnerId: partnerUid,
    lastMessage: '',
    lastMessageType: 'text',
    lastMessageAt: 0,
    lastSenderId: '',
  };
  const currentUserChatRef = ref(database, `userChats/${currentUid}/${chatId}`);
  const partnerUserChatRef = ref(database, `userChats/${partnerUid}/${chatId}`);

  const [currentUserResult, partnerResult] = await Promise.all([
    runTransaction(
      currentUserChatRef,
      current => current ?? { ...initialChat, partnerId: partnerUid },
      { applyLocally: false },
    ),
    runTransaction(
      partnerUserChatRef,
      current => current ?? { ...initialChat, partnerId: currentUid },
      { applyLocally: false },
    ),
  ]);

  if (
    !currentUserResult.committed ||
    !partnerResult.committed ||
    currentUserResult.snapshot.val()?.partnerId !== partnerUid ||
    partnerResult.snapshot.val()?.partnerId !== currentUid
  ) {
    throw new Error('Không thể đồng bộ danh sách cuộc trò chuyện.');
  }

  return chatId;
}

export function subscribeToChatList(
  uid: string,
  onChats: ChatListListener,
  onError: ListenerError,
): () => void {
  const { database } = getFirebaseServices();
  return onValue(
    ref(database, `userChats/${uid}`),
    snapshot => {
      const chats: Record<string, UserChat> = {};
      snapshot.forEach(child => {
        const value = child.val() as UserChat | null;
        if (child.key && value && typeof value.partnerId === 'string') {
          chats[child.key] = value;
        }
      });
      onChats(chats);
    },
    onError,
  );
}

function messageFromSnapshot(snapshot: DataSnapshot): ChatMessage | null {
  const value = snapshot.val() as Omit<ChatMessage, 'id'> | null;
  if (
    !snapshot.key ||
    !value ||
    typeof value.senderId !== 'string' ||
    (value.type !== 'text' && value.type !== 'location') ||
    typeof value.createdAt !== 'number'
  ) {
    return null;
  }
  return { ...value, id: snapshot.key };
}

export function subscribeToMessages(
  chatId: string,
  onMessages: MessagesListener,
  onError: ListenerError,
): () => void {
  const { database } = getFirebaseServices();
  const messagesQuery = query(
    ref(database, `chats/${chatId}/messages`),
    orderByChild('createdAt'),
  );

  return onValue(
    messagesQuery,
    snapshot => {
      const messages: ChatMessage[] = [];
      snapshot.forEach(child => {
        const message = messageFromSnapshot(child);
        if (message) {
          messages.push(message);
        }
      });
      onMessages(messages);
    },
    onError,
  );
}

async function writeMessage(
  chatId: string,
  senderId: string,
  recipientId: string,
  type: MessageType,
  content: { text: string } | { latitude: number; longitude: number },
): Promise<void> {
  const { database } = getFirebaseServices();
  const messageRef = push(ref(database, `chats/${chatId}/messages`));
  const messageId = messageRef.key;
  if (!messageId) {
    throw new Error('Không thể tạo mã tin nhắn.');
  }

  const preview = type === 'text' ? content.text : 'Đã gửi vị trí';
  const timestamp = serverTimestamp();
  const updates: Record<string, unknown> = {
    [`chats/${chatId}/messages/${messageId}`]: {
      senderId,
      type,
      ...content,
      createdAt: timestamp,
    },
  };

  for (const uid of [senderId, recipientId]) {
    updates[`userChats/${uid}/${chatId}/lastMessage`] = preview;
    updates[`userChats/${uid}/${chatId}/lastMessageType`] = type;
    updates[`userChats/${uid}/${chatId}/lastMessageAt`] = timestamp;
    updates[`userChats/${uid}/${chatId}/lastSenderId`] = senderId;
  }

  updates[`chats/${chatId}/lastMessage`] = preview;
  updates[`chats/${chatId}/lastMessageType`] = type;
  updates[`chats/${chatId}/lastMessageAt`] = timestamp;
  updates[`chats/${chatId}/lastSenderId`] = senderId;
  if (senderId !== recipientId) {
    updates[`userChats/${recipientId}/${chatId}/unreadMessages/${messageId}`] = true;
  }

  await update(ref(database), updates);
}

export async function sendTextMessage(
  chatId: string,
  senderId: string,
  recipientId: string,
  text: string,
): Promise<void> {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return;
  }
  await writeMessage(chatId, senderId, recipientId, 'text', { text: trimmedText });
}

export async function sendLocationMessage(
  chatId: string,
  senderId: string,
  recipientId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  await writeMessage(chatId, senderId, recipientId, 'location', { latitude, longitude });
}

export async function markChatRead(uid: string, chatId: string): Promise<void> {
  const { database } = getFirebaseServices();
  await runTransaction(
    ref(database, `userChats/${uid}/${chatId}/unreadMessages`),
    current => (current === null ? current : null),
    { applyLocally: false },
  );
}
