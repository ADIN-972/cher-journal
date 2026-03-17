import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

function TabIcon({ name, color }: { name: string; color: string }) {
  return <Text style={[styles.icon, { color }]}>{name}</Text>;
}

const icons: Record<string, string> = {
  index: 'home',
  chapters: 'menu_book',
  library: 'collections_bookmark',
  account: 'person',
  settings: 'tune',
};

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E11D48',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabIcon name={icons.index} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chapters"
        options={{
          title: 'Chapitres',
          tabBarIcon: ({ color }) => <TabIcon name={icons.chapters} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Bibliotheque',
          tabBarIcon: ({ color }) => <TabIcon name={icons.library} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color }) => <TabIcon name={icons.account} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Reglages',
          tabBarIcon: ({ color }) => <TabIcon name={icons.settings} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E5E5',
    borderTopWidth: 1,
    paddingTop: 4,
    height: 56,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  icon: {
    fontFamily: 'MaterialSymbolsOutlined',
    fontSize: 24,
  },
});
