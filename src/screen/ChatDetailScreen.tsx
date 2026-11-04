import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/ionicons';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getAuthErrorMessage } from '../services/auth';
import {
  markChatRead,
  sendLocationMessage,
  sendTextMessage,
  subscribeToMessages,
} from '../services/chat';
import { getCurrentCoordinates } from '../services/location';
import type {
  ChatMessage,
  ContactsStackParamList,
  HomeStackParamList,
} from '../types';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'ChatDetail'>
  | NativeStackScreenProps<ContactsStackParamList, 'ChatDetail'>;

export function ChatDetailScreen({ route, navigation }: Props) {
  const { chatId, peerId, peerName } = route.params;
  const { user } = useAuth();
  const { contacts } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [text, setText] = useState('');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const peer = contacts.find(contact => contact.uid === peerId);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        return undefined;
      }

      let active = true;
      setMessagesLoading(true);
      const unsubscribe = subscribeToMessages(
        chatId,
        nextMessages => {
          if (!active) {
            return;
          }
          setMessages(nextMessages);
          setMessagesLoading(false);
          setLoadingError(null);
          void markChatRead(user.uid, chatId).catch(error => {
            if (active) {
              setMessagesLoading(false);
              setLoadingError(getAuthErrorMessage(error));
            }
          });
        },
        error => {
          if (active) {
            setLoadingError(getAuthErrorMessage(error));
          }
        },
      );
      return () => {
        active = false;
        unsubscribe();
      };
    }, [chatId, user]),
  );

  const send = async () => {
    if (!user || !text.trim() || sending) {
      return;
    }
    const message = text.trim();
    setSending(true);
    try {
      await sendTextMessage(chatId, user.uid, peerId, message);
      setText('');
    } catch (error) {
      Alert.alert('Không thể gửi tin nhắn', getAuthErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const sendLocation = async () => {
    if (!user || sending) {
      return;
    }
    setSending(true);
    try {
      const coordinates = await getCurrentCoordinates();
      await sendLocationMessage(
        chatId,
        user.uid,
        peerId,
        coordinates.latitude,
        coordinates.longitude,
      );
    } catch (error) {
      Alert.alert('Không thể gửi vị trí', getAuthErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const openMap = async (message: ChatMessage) => {
    if (typeof message.latitude !== 'number' || typeof message.longitude !== 'number') {
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${message.latitude},${message.longitude}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Không thể mở bản đồ', 'Thiết bị chưa thể mở Google Maps hoặc trình duyệt.');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === user?.uid;
    const time = new Date(item.createdAt).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <View style={[styles.messageColumn, isMine ? styles.myColumn : styles.otherColumn]}>
        {item.type === 'location' ? (
          <Pressable
            style={[styles.msgBox, isMine ? styles.myMsg : styles.otherMsg]}
            onPress={() => void openMap(item)}
            accessibilityRole="button"
            accessibilityLabel="Mở vị trí trên Google Maps"
          >
            <Text style={[styles.locationLabel, isMine && styles.myText]}>
              <Icon name="location" size={16} color={isMine ? '#FFF' : '#2563EB'} />
              {'  Vị trí đã chia sẻ'}
            </Text>
            <Text style={[styles.messageText, isMine && styles.myText]}>
              {item.latitude?.toFixed(6)}, {item.longitude?.toFixed(6)}
            </Text>
            <Text style={[styles.mapHint, isMine && styles.myText]}>Nhấn để mở bản đồ</Text>
          </Pressable>
        ) : (
          <View style={[styles.msgBox, isMine ? styles.myMsg : styles.otherMsg]}>
            <Text style={[styles.messageText, isMine && styles.myText]}>{item.text}</Text>
          </View>
        )}
        <Text style={styles.timeText}>{time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerName}>{peer?.displayName ?? peerName}</Text>
          <Text style={styles.presenceText}>
            {peer?.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>

      {loadingError ? <Text style={styles.errorText}>{loadingError}</Text> : null}
      {messagesLoading ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có tin nhắn. Hãy gửi lời chào!</Text>
          }
        />
      )}

      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => void sendLocation()}
          disabled={sending}
          accessibilityRole="button"
          accessibilityLabel="Gửi vị trí hiện tại"
        >
          <Icon name="location-outline" size={22} color="#2563EB" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={text}
          onChangeText={setText}
          editable={!sending}
          onSubmitEditing={() => void send()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.disabledButton]}
          onPress={() => void send()}
          disabled={!text.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Gửi tin nhắn"
        >
          <Icon name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { marginRight: 12 },
  headerName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  presenceText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  messageList: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  loader: { flex: 1 },
  messageColumn: { maxWidth: '82%', marginVertical: 5 },
  myColumn: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherColumn: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  msgBox: { padding: 10, borderRadius: 12, maxWidth: '100%' },
  myMsg: { backgroundColor: '#2563EB' },
  otherMsg: { backgroundColor: '#E2E8F0' },
  messageText: { color: '#0F172A', fontSize: 15 },
  myText: { color: '#FFF' },
  locationLabel: { color: '#2563EB', fontWeight: '700', marginBottom: 4 },
  mapHint: { color: '#64748B', fontSize: 11, marginTop: 4 },
  timeText: { color: '#94A3B8', fontSize: 10, marginTop: 3 },
  emptyText: { color: '#64748B', textAlign: 'center', padding: 20 },
  errorText: { color: '#B91C1C', paddingHorizontal: 16, paddingTop: 8 },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  locationButton: { padding: 8, marginRight: 4 },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 42,
    marginRight: 8,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.55 },
});
