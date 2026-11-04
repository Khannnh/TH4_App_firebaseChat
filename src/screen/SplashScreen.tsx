import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';

export function SplashScreen() {
  useEffect(() => {
    BootSplash.hide({ fade: true }).catch(error => {
      console.error('Không thể ẩn màn hình khởi động:', error);
    });
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.logoText}>AppChat</Text>
      <Text style={styles.subText}>Đang tải ứng dụng...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#93C5FD',
  },
});
