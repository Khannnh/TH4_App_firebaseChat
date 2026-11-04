import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { ref, serverTimestamp, update } from 'firebase/database';
import { getFirebaseServices } from './firebase';
import { stopPresenceForUser } from './users';

export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không chính xác.',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
    'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
    'auth/wrong-password': 'Mật khẩu không chính xác.',
    'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'auth/operation-not-allowed': 'Phương thức Email/Password chưa được bật trong Firebase Console.',
    'auth/network-request-failed': 'Không thể kết nối. Vui lòng kiểm tra mạng.',
    'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
    'PERMISSION_DENIED': 'Firebase Rules từ chối thao tác. Hãy kiểm tra database.rules.json đã được áp dụng chưa.',
  };

  if (messages[code]) {
    return messages[code];
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

export async function registerWithEmail(
  displayName: string,
  email: string,
  password: string,
): Promise<User> {
  const { auth, database } = getFirebaseServices();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await update(ref(database), {
    [`users/${credential.user.uid}`]: {
      displayName,
      createdAt: serverTimestamp(),
    },
    [`userPrivate/${credential.user.uid}/email`]: credential.user.email ?? email,
  });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  const { auth } = getFirebaseServices();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout(): Promise<void> {
  const { auth } = getFirebaseServices();
  if (auth.currentUser) {
    try {
      await stopPresenceForUser(auth.currentUser.uid);
    } catch (error) {
      console.error('Không thể dọn dẹp presence trước khi đăng xuất:', error);
    }
  }
  await signOut(auth);
}
