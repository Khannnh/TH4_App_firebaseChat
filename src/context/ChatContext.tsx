import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthErrorMessage } from '../services/auth';
import { ensureDirectChat, subscribeToChatList } from '../services/chat';
import { startPresence, subscribeToUsers } from '../services/users';
import { useAuth } from './AuthContext';
import type { ChatListItem, Contact, UserChat } from '../types';

type ChatContextValue = {
  chats: ChatListItem[];
  contacts: Contact[];
  chatsLoading: boolean;
  contactsLoading: boolean;
  chatsError: string | null;
  contactsError: string | null;
  openChatWith: (contact: Contact) => Promise<string>;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const [chatRows, setChatRows] = useState<Record<string, UserChat>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setChatRows({});
      setContacts([]);
      setChatsLoading(false);
      setContactsLoading(false);
      return;
    }

    setChatsLoading(true);
    setContactsLoading(true);
    setChatsError(null);
    setContactsError(null);

    const stopPresence = startPresence(user.uid);
    const stopUsers = subscribeToUsers(
      user.uid,
      nextContacts => {
        setContacts(nextContacts);
        setContactsLoading(false);
      },
      error => {
        setContactsError(getAuthErrorMessage(error));
        setContactsLoading(false);
      },
    );
    const stopChats = subscribeToChatList(
      user.uid,
      nextChats => {
        setChatRows(nextChats);
        setChatsLoading(false);
      },
      error => {
        setChatsError(getAuthErrorMessage(error));
        setChatsLoading(false);
      },
    );

    return () => {
      stopPresence();
      stopUsers();
      stopChats();
    };
  }, [user]);

  const chats = useMemo(() => {
    const contactByUid = new Map(contacts.map(contact => [contact.uid, contact]));
    return Object.entries(chatRows)
      .map(([id, row]): ChatListItem | null => {
        const peer = contactByUid.get(row.partnerId);
        if (!peer) {
          return null;
        }
        return {
          id,
          peer,
          lastMessage: row.lastMessage ?? '',
          lastMessageType: row.lastMessageType ?? 'text',
          lastMessageAt: row.lastMessageAt ?? 0,
          unreadCount: Object.values(row.unreadMessages ?? {}).filter(Boolean).length,
          lastSenderId: row.lastSenderId ?? '',
        };
      })
      .filter((chat): chat is ChatListItem => chat !== null)
      .sort((left, right) => right.lastMessageAt - left.lastMessageAt);
  }, [chatRows, contacts]);

  const value = useMemo<ChatContextValue>(
    () => ({
      chats,
      contacts,
      chatsLoading,
      contactsLoading,
      chatsError,
      contactsError,
      openChatWith: contact => {
        if (!user) {
          return Promise.reject(new Error('Bạn cần đăng nhập để bắt đầu trò chuyện.'));
        }
        return ensureDirectChat(user.uid, contact.uid);
      },
    }),
    [
      chats,
      contacts,
      chatsLoading,
      contactsLoading,
      chatsError,
      contactsError,
      user,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
