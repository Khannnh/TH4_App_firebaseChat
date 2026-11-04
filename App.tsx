// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ChatProvider } from './src/context/ChatContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatProvider>
        <AppNavigator />
      </ChatProvider>
    </SafeAreaProvider>
  );
}