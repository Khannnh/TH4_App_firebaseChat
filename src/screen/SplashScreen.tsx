import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';

export const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const init = async () => {
      // Dùng setTimeout bọc bằng Promise thuần chuẩn không bị lỗi TS
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1500);
      });
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      navigation.replace('Login');
    });
  }, [navigation]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.logoText}>AppChat</Text>
      <Text style={styles.subText}>Đang tải ứng dụng...</Text>
    </SafeAreaView>
  );
};

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