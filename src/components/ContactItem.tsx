import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

export const ContactItem = ({ item, onPress }: any) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.isOnline ? 'đang trực tuyến' : 'ngoại tuyến'}`}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={[styles.statusDot, item.isOnline ? styles.onlineDot : styles.offlineDot]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.status}>
          <View style={[styles.statusIndicator, item.isOnline ? styles.onlineIndicator : styles.offlineIndicator]} />
          <Text style={[styles.statusText, item.isOnline ? styles.onlineText : styles.offlineText]}>
            {item.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, marginHorizontal: 16, marginVertical: 4, borderRadius: 14 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E2E8F0' },
  statusDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF' },
  onlineDot: { backgroundColor: '#10B981' },
  offlineDot: { backgroundColor: '#94A3B8' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, color: '#0F172A', fontWeight: '600' },
  status: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusIndicator: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  onlineIndicator: { backgroundColor: '#059669' },
  offlineIndicator: { backgroundColor: '#64748B' },
  statusText: { fontSize: 12, fontWeight: '500' },
  onlineText: { color: '#047857' },
  offlineText: { color: '#64748B' },
});