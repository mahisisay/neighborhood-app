// =============================================
//  src/navigation/AppNavigator.js — COMPLETE
//  Dynamic titles that change with language
// =============================================

import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

// Auth screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Seeker screens
import HomeScreen from '../screens/HomeScreen';
import PostRequestScreen from '../screens/PostRequestScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';

// Provider screens
import ProviderHomeScreen from '../screens/ProviderHomeScreen';
import OfferedJobsScreen from '../screens/OfferedJobsScreen';
import AcceptedJobsScreen from '../screens/AcceptedJobsScreen';

// Admin screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

// Settings and About screens
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 3 dot menu button
function ThreeDotsButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#374151' }}>⋮</Text>
    </TouchableOpacity>
  );
}

// MapScreenComponent
const MapScreenComponent = Platform.select({
  web: () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
      <Text style={{ fontSize: 48 }}>🗺️</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Map View</Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Available on mobile devices only</Text>
      <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Please open on Android phone</Text>
    </View>
  ),
  default: () => {
    const NativeMapScreen = require('../screens/MapScreen.native').default;
    return <NativeMapScreen />;
  }
});

const MapScreen = MapScreenComponent;

// ── Seeker tabs ───────────────────────────────
function SeekerTabs() {
  const { t } = useSettings();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThreeDotsButton />,
        headerStyle: { backgroundColor: '#fff', elevation: 1, shadowOpacity: 0.1 },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
        tabBarActiveTintColor: '#1a56db',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, height: 60 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('home'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
          tabBarLabel: t('home')
        }}
      />
      
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: t('map'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text>,
          tabBarLabel: t('map')
        }}
      />
      
      <Tab.Screen
        name="PostRequest"
        component={PostRequestScreen}
        options={{
          title: t('post_job'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>➕</Text>,
          tabBarLabel: t('post_job')
        }}
      />
      <Tab.Screen
        name="MyRequests"
        component={MyRequestsScreen}
        options={{
          title: t('my_requests'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
          tabBarLabel: t('my_requests')
        }}
      />
    </Tab.Navigator>
  );
}

// ── Provider tabs ─────────────────────────────
function ProviderTabs() {
  const { t } = useSettings();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThreeDotsButton />,
        headerStyle: { backgroundColor: '#fff', elevation: 1, shadowOpacity: 0.1 },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, height: 60 },
      }}
    >
      <Tab.Screen
        name="ProviderHome"
        component={ProviderHomeScreen}
        options={{
          title: t('dashboard'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
          tabBarLabel: t('home')
        }}
      />
      <Tab.Screen
        name="OfferedJobs"
        component={OfferedJobsScreen}
        options={{
          title: t('offered_jobs'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
          tabBarLabel: t('offered')
        }}
      />
      <Tab.Screen
        name="AcceptedJobs"
        component={AcceptedJobsScreen}
        options={{
          title: t('accepted_jobs'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>✅</Text>,
          tabBarLabel: t('accepted')
        }}
      />
    </Tab.Navigator>
  );
}

// ── Admin tabs ────────────────────────────────
function AdminTabs() {
  const { t } = useSettings();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThreeDotsButton />,
        headerStyle: { backgroundColor: '#fff', elevation: 1, shadowOpacity: 0.1 },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, height: 60 },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: t('admin_panel'),
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👮</Text>,
          tabBarLabel: t('dashboard')
        }}
      />
    </Tab.Navigator>
  );
}

// ── Main navigator ────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : user.role === 'provider' ? (
          <>
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
          </>
        ) : user.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="SeekerTabs" component={SeekerTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}