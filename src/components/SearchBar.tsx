import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = 'Tìm kiếm...' }: Props) => (
  <View style={styles.container}>
    <Icon name="search-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#64748B"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  input: { flex: 1, fontSize: 15, color: '#0F172A', paddingVertical: 0 },
});