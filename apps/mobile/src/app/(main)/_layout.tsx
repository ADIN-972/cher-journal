import Icon from '@/components/Icon';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme/ThemeContext';

function TabIcon({ name, color }: { name: string; color: string }) {
  return <Icon name={name} color={color} size={24} />;
}

const icons: Record<string, string> = {
  index: 'home',
  chapters: 'menu_book',
  account: 'person',
  settings: 'tune',
};

export default function MainLayout() {
  const tc = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tc.gold,
        tabBarInactiveTintColor: tc.textTertiary,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: tc.tabBarBg,
            borderTopColor: tc.tabBarBorder,
            borderColor: tc.tabBarBorder,
          },
        ],
        tabBarLabelStyle: { ...styles.tabLabel },
        sceneStyle: {
          backgroundColor: tc.background,
        },
        headerShown: false,
        tabBarItemStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarItemStyle: { display: 'flex' },
          tabBarIcon: ({ color }) => <TabIcon name={icons.index} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chapters/index"
        options={{
          title: 'Chapitres',
          tabBarItemStyle: { display: 'flex' },
          tabBarIcon: ({ color }) => <TabIcon name={icons.chapters} color={color} />,
        }}
      />
      <Tabs.Screen name="chapters/[id]" options={{ title: 'Detail' }} />
      <Tabs.Screen
        name="account/index"
        options={{
          title: 'Compte',
          tabBarItemStyle: { display: 'flex' },
          tabBarIcon: ({ color }) => <TabIcon name={icons.account} color={color} />,
        }}
      />
      <Tabs.Screen name="account/my-books" options={{ title: 'Mes Livres' }} />
      <Tabs.Screen name="account/my-requests" options={{ title: 'Mes Demandes' }} />
      <Tabs.Screen name="account/create-story" options={{ title: 'Nouvelle Demande' }} />
      <Tabs.Screen name="account/my-reviews" options={{ title: 'Mes Avis' }} />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Reglages',
          tabBarItemStyle: { display: 'flex' },
          tabBarIcon: ({ color }) => <TabIcon name={icons.settings} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    // paddingHorizontal: 20,
    // paddingTop: 4,
    // paddingBottom: 4,
    // height: 70,
    // borderRadius: 100,
    // bottom: 40,
    // marginHorizontal: 20,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
});
