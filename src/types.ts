export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  createdAt: number;
};

export type Presence = {
  isOnline: boolean;
  lastSeen: number | null;
};

export type Contact = UserProfile & Presence;

export type MessageType = 'text' | 'location';

export type ChatMessage = {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
};

export type UserChat = {
  partnerId: string;
  lastMessage: string;
  lastMessageType: MessageType;
  lastMessageAt: number;
  lastSenderId: string;
  unreadMessages?: Record<string, true>;
};

export type ChatListItem = {
  id: string;
  peer: Contact;
  lastMessage: string;
  lastMessageType: MessageType;
  lastMessageAt: number;
  unreadCount: number;
  lastSenderId: string;
};

export type ChatRouteParams = {
  chatId: string;
  peerId: string;
  peerName: string;
};

export type HomeStackParamList = {
  HomeList: undefined;
  ChatDetail: ChatRouteParams;
};

export type ContactsStackParamList = {
  ContactsList: undefined;
  ChatDetail: ChatRouteParams;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ContactsTab: undefined;
  NotiTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};
