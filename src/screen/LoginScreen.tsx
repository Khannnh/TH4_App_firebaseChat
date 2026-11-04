import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthErrorMessage } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { signIn, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    if (isRegistering) {
      if (!name.trim()) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (password !== passwordConfirmation) {
        Alert.alert('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu chính xác.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegistering) {
        await register(name.trim(), normalizedEmail, password);
      } else {
        await signIn(normalizedEmail, password);
      }
    } catch (error) {
      Alert.alert('Không thể tiếp tục', getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Text style={styles.title}>MiniChat</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Tạo tài khoản để bắt đầu trò chuyện' : 'Đăng nhập để tiếp tục'}
        </Text>

        <View style={styles.form}>
          {isRegistering && (
            <TextInput
              placeholder="Họ và tên"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
              textContentType="name"
            />
          )}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            textContentType={isRegistering ? 'newPassword' : 'password'}
          />
          {isRegistering && (
            <TextInput
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#64748B"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
              style={styles.input}
              textContentType="newPassword"
            />
          )}

          <TouchableOpacity
            style={[styles.btn, submitting && styles.disabledBtn]}
            onPress={submit}
            disabled={submitting}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>
              {submitting ? 'Đang xử lý...' : isRegistering ? 'Đăng ký' : 'Đăng nhập'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsRegistering(current => !current)}
            disabled={submitting}
          >
            <Text style={styles.switchText}>
              {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 36, fontWeight: '800', color: '#1D4ED8', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 32 },
  form: { width: '100%' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    fontSize: 15,
    color: '#0F172A',
  },
  btn: {
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: { opacity: 0.65 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  switchButton: { padding: 16, alignItems: 'center' },
  switchText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
});
