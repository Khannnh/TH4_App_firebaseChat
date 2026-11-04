import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Tài khoản và mật khẩu không được để trống!');
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <Text style={styles.title}>MiniChat</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Tài khoản"
            placeholderTextColor="#64748B"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin}>
            <Text style={styles.btnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 36, fontWeight: '800', color: '#1D4ED8', textAlign: 'center', marginBottom: 40 },
  form: { width: '100%' },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 16, fontSize: 15, color: '#0F172A' },
  btn: { backgroundColor: '#2563EB', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});