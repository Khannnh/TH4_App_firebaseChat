import React, { useState } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatItem } from '../components/ChatItem';
import { SearchBar } from '../components/SearchBar';
import { useChat } from '../context/ChatContext';

export const HomeScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const { chats } = useChat();
  const data = chats.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.headerTitle}>Trò chuyện</Text>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatItem item={item} onPress={() => navigation.navigate('ChatDetail', { name: item.name })} />}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 26, fontWeight: '800', marginHorizontal: 16, marginTop: 12, color: '#0F172A' },
});