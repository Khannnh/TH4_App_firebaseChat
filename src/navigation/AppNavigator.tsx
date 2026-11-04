import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon, { type IoniconsIconName } from '@react-native-vector-icons/ionicons';

import { SplashScreen } from '../screen/SplashScreen';
import { LoginScreen } from '../screen/LoginScreen';
import { HomeScreen } from '../screen/HomeScreen';
import { ContactsScreen } from '../screen/ContactsScreen';
import { NotificationScreen } from '../screen/NotiScreen';
import { SettingsScreen } from '../screen/SettingScreen';
import { ChatDetailScreen } from '../screen/ChatDetailScreen';
import { useAuth } from '../context/AuthContext';
import type {
  ContactsStackParamList,
  HomeStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ContactsStack = createNativeStackNavigator<ContactsStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeList" component={HomeScreen} />
      <HomeStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </HomeStack.Navigator>
  );
}

function ContactsStackNavigator() {
  return (
    <ContactsStack.Navigator screenOptions={{ headerShown: false }}>
      <ContactsStack.Screen name="ContactsList" component={ContactsScreen} />
      <ContactsStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ContactsStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: IoniconsIconName = 'home';
          if (route.name === 'HomeTab') iconName = 'chatbubbles';
          else if (route.name === 'ContactsTab') iconName = 'people';
          else if (route.name === 'NotiTab') iconName = 'notifications';
          else if (route.name === 'SettingsTab') iconName = 'settings';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Trò chuyện' }} />
      <Tab.Screen name="ContactsTab" component={ContactsStackNavigator} options={{ title: 'Danh bạ' }} />
      <Tab.Screen name="NotiTab" component={NotificationScreen} options={{ title: 'Thông báo' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </Tab.Navigator>
  );
}

function FirebaseConfigurationScreen({ message }: { message: string }) {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Cần cấu hình Firebase</Text>
      <Text style={styles.errorMessage}>{message}</Text>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  const { user, loading, configurationError } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }
  if (configurationError) {
    return <FirebaseConfigurationScreen message={configurationError} />;
  }

  return (
    <NavigationContainer key={user?.uid ?? 'signed-out'}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  errorTitle: { fontSize: 22, fontWeight: '700', color: '#B91C1C', marginBottom: 12 },
  errorMessage: { fontSize: 15, lineHeight: 23, color: '#334155' },
});
