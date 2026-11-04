import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/ionicons'; 
import { useChat } from '../context/ChatContext';
export const ChatDetailScreen = ({ route, navigation }: any) => {
  const { name } = route.params || { name: 'Chat' };
  const { messagesByChat, sendMessage } = useChat();
  const messages = messagesByChat[name] ?? [];
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    sendMessage(name, text);
    setText('');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerName}>{name}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.msgBox, item.sender === 'me' ? styles.myMsg : styles.otherMsg]}>
            <Text style={{ color: item.sender === 'me' ? '#FFF' : '#0F172A' }}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.inputBar}>
        <TextInput style={styles.input} placeholder="Nhập tin nhắn..." value={text} onChangeText={setText} />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Icon name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  msgBox: { padding: 10, borderRadius: 12, marginVertical: 4, maxWidth: '75%' },
  myMsg: { backgroundColor: '#2563EB', alignSelf: 'flex-end' },
  otherMsg: { backgroundColor: '#E2E8F0', alignSelf: 'flex-start' },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 16, height: 40, marginRight: 8 },
  sendBtn: { backgroundColor: '#2563EB', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});