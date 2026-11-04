import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ContactItem } from '../components/ContactItem';
import { SearchBar } from '../components/SearchBar';
import { getAuthErrorMessage } from '../services/auth';
import { useChat } from '../context/ChatContext';
import type { ContactsStackParamList, Contact } from '../types';

type Props = NativeStackScreenProps<ContactsStackParamList, 'ContactsList'>;

export function ContactsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [openingUid, setOpeningUid] = useState<string | null>(null);
  const { contacts, contactsLoading, contactsError, openChatWith } = useChat();
  const data = contacts.filter(item =>
    item.displayName.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );

  const openChat = async (contact: Contact) => {
    setOpeningUid(contact.uid);
    try {
      const chatId = await openChatWith(contact);
      navigation.navigate('ChatDetail', {
        chatId,
        peerId: contact.uid,
        peerName: contact.displayName,
      });
    } catch (error) {
      Alert.alert('Không thể mở cuộc trò chuyện', getAuthErrorMessage(error));
    } finally {
      setOpeningUid(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.headerTitle}>Danh bạ</Text>
      <SearchBar value={search} onChangeText={setSearch} />
      {contactsError ? <Text style={styles.message}>{contactsError}</Text> : null}
      {contactsLoading ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <ContactItem
              item={item}
              disabled={openingUid !== null}
              onPress={() => void openChat(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.message}>
              {search ? 'Không tìm thấy người dùng.' : 'Danh bạ chưa có người dùng khác.'}
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
