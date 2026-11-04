import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_NOTIFICATIONS } from '../data';

export const NotificationScreen = () => {
  const [list, setList] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setList(list.map(item => item.id === id ? { ...item, isRead: true } : item));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, !item.isRead && { backgroundColor: '#EFF6FF' }]} 
            onPress={() => markAsRead(item.id)}
          >
            <Text style={[styles.content, !item.isRead && { fontWeight: '700' }]}>{item.content}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 26, fontWeight: '800', marginHorizontal: 16, marginTop: 12, marginBottom: 8, color: '#0F172A' },
  card: { backgroundColor: '#FFF', padding: 14, marginHorizontal: 16, marginVertical: 4, borderRadius: 14 },
  content: { fontSize: 15, color: '#0F172A', marginBottom: 4 },
  time: { fontSize: 12, color: '#64748B' },
});