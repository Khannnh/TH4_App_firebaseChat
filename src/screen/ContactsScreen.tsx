import React, { useState } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_CONTACTS } from '../data';
import { SearchBar } from '../components/SearchBar';
import { ContactItem } from '../components/ContactItem';

export const ContactsScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const data = MOCK_CONTACTS.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.headerTitle}>Danh bạ</Text>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactItem item={item} onPress={() => navigation.navigate('ChatDetail', { name: item.name })} />}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 26, fontWeight: '800', marginHorizontal: 16, marginTop: 12, color: '#0F172A' },
});