import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';

const accountDetails: { label: string; value: string; icon: IoniconsIconName }[] = [
  { label: 'Tên tài khoản', value: 'khannnh', icon: 'person-outline' },
  { label: 'Email', value: 'it.student@ptit.edu.vn', icon: 'mail-outline' },
  { label: 'Số điện thoại', value: '090 123 4567', icon: 'call-outline' },
  { label: 'Ngày tham gia', value: 'Tháng 9, 2024', icon: 'calendar-outline' },
];

export const SettingsScreen = ({ navigation }: any) => {
  const handleLogout = () => {
    Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi MiniChat?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] }),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <Text style={styles.subtitle}>Quản lý thông tin cá nhân của bạn</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="person" size={42} color="#2563EB" />
          </View>
          <Text style={styles.name}>Nguyễn Hồng Khánh</Text>
          <Text style={styles.email}>it.student@ptit.edu.vn</Text>
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Đang hoạt động</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          {accountDetails.map((detail, index) => (
            <View
              key={detail.label}
              style={[styles.detailRow, index === accountDetails.length - 1 && styles.lastDetailRow]}
            >
              <View style={styles.detailInfo}>
                <Icon name={detail.icon} size={20} color="#64748B" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>{detail.label}</Text>
              </View>
              <Text style={styles.detailValue} numberOfLines={1}>{detail.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
        >
          <Icon name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontWeight: '800', marginHorizontal: 16, marginTop: 12, color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginHorizontal: 16, marginTop: 4, marginBottom: 16 },
  profileCard: { backgroundColor: '#FFF', padding: 20, marginHorizontal: 16, borderRadius: 16, alignItems: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 19, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  email: { fontSize: 14, color: '#64748B' },
  status: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontSize: 13, color: '#059669', fontWeight: '600' },
  detailsCard: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 16, margin: 16, marginBottom: 0, borderRadius: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  detailRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  lastDetailRow: { borderBottomWidth: 0 },
  detailInfo: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  detailIcon: { marginRight: 10 },
  detailLabel: { fontSize: 14, color: '#64748B' },
  detailValue: { fontSize: 14, color: '#0F172A', fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  logoutBtn: { backgroundColor: '#FEE2E2', marginHorizontal: 16, marginTop: 20, padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
