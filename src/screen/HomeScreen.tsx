import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatItem } from '../components/ChatItem';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import type { HomeStackParamList } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeList'>;

export function HomeScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { chats, chatsLoading, chatsError } = useChat();
  const data = chats.filter(item =>
    item.peer.displayName.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.headerTitle}>Trò chuyện</Text>
      <SearchBar value={search} onChangeText={setSearch} />
      {chatsError ? <Text style={styles.message}>{chatsError}</Text> : null}
      {chatsLoading ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatItem
              item={item}
              currentUid={user?.uid ?? ''}
              onPress={() =>
                navigation.navigate('ChatDetail', {
                  chatId: item.id,
                  peerId: item.peer.uid,
                  peerName: item.peer.displayName,
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.message}>
              {search ? 'Không tìm thấy cuộc trò chuyện.' : 'Chưa có cuộc trò chuyện nào.'}
            </Text>
          }
          contentContainerStyle={data.length === 0 ? styles.emptyList : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 26, fontWeight: '800', marginHorizontal: 16, marginTop: 12, color: '#0F172A' },
  loader: { marginTop: 32 },
  message: { color: '#64748B', textAlign: 'center', padding: 24 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
});
