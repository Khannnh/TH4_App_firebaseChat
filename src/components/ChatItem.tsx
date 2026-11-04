import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

export const ChatItem = ({ item, onPress }: any) => {
  const isUnread = item.unreadCount > 0;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, isUnread && { fontWeight: '700' }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.msg, isUnread ? { color: '#0F172A', fontWeight: '600' } : { color: '#64748B' }]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.time}>{item.time}</Text>
        {isUnread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E2E8F0' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFF' },
  content: { flex: 1, marginHorizontal: 12 },
  name: { fontSize: 16, color: '#0F172A', marginBottom: 4 },
  msg: { fontSize: 14 },
  time: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  badge: { backgroundColor: '#2563EB', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});