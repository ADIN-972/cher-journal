import { Tabs } from 'expo-router';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E11D48', // Rose Cher Journal
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="chapters"
        options={{
          title: 'Chapters',
          // TODO: Add icon component
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          // TODO: Add icon component
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          // TODO: Add icon component
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          // TODO: Add icon component
        }}
      />
    </Tabs>
  );
}
