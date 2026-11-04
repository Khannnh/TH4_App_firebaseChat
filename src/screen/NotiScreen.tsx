import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const NotificationScreen = () => {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Chưa có thông báo.</Text>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerTitle: { fontSize: 26, fontWeight: '800', marginHorizontal: 16, marginTop: 12, marginBottom: 8, color: '#0F172A' },
  emptyState: { flex: 1, justifyContent: 'center' },
  emptyText: { color: '#64748B', textAlign: 'center', padding: 24 },
});