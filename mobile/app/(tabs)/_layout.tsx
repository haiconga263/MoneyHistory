import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          position: Platform.OS === 'web' ? 'relative' : 'absolute',
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          backgroundColor: '#111413F2',
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" color={typeof color === 'string' ? color : colors.textMuted} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Lịch sử',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" color={typeof color === 'string' ? color : colors.textMuted} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
