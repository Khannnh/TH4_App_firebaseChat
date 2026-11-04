import React, { createContext, useContext, useState } from 'react';
import { MOCK_CHATS } from '../data';

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'other' | 'me';
};

type Chat = (typeof MOCK_CHATS)[number];

type ChatContextValue = {
  chats: Chat[];
  messagesByChat: Record<string, ChatMessage[]>;
  sendMessage: (chatName: string, text: string) => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: React.PropsWithChildren) => {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>(() =>
    MOCK_CHATS.reduce<Record<string, ChatMessage[]>>((messages, chat) => {
      messages[chat.name] = [
        { id: `${chat.id}-last`, text: chat.lastMessage, sender: 'other' },
      ];
      return messages;
    }, {}),
  );

  const sendMessage = (chatName: string, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setMessagesByChat(current => ({
      ...current,
      [chatName]: [
        ...(current[chatName] ?? []),
        { id: Date.now().toString(), text: trimmedText, sender: 'me' },
      ],
    }));

    const time = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setChats(current => {
      const updatedChats = current.map(chat =>
        chat.name === chatName
          ? { ...chat, lastMessage: `Bạn: ${trimmedText}`, time, unreadCount: 0 }
          : chat,
      );
      const chatIndex = updatedChats.findIndex(chat => chat.name === chatName);
      if (chatIndex <= 0) return updatedChats;
      return [updatedChats[chatIndex], ...updatedChats.filter((_, index) => index !== chatIndex)];
    });
  };

  return (
    <ChatContext.Provider value={{ chats, messagesByChat, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
