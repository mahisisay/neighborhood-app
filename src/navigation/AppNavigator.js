// =============================================
//  src/navigation/AppNavigator.js — Final Version
//  All screens with Settings (3 dot menu) for all roles
// =============================================

import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator }     from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Auth screens
import WelcomeScreen        from '../screens/WelcomeScreen';
import LoginScreen          from '../screens/LoginScreen';
import RegisterScreen       from '../screens/RegisterScreen';

// Seeker screens
import HomeScreen           from '../screens/HomeScreen';
import MapScreen            from '../screens/MapScreen';
import PostRequestScreen    from '../screens/PostRequestScreen';
import MyRequestsScreen     from '../screens/MyRequestsScreen';

// Provider screens
import ProviderHomeScreen   from '../screens/ProviderHomeScreen';
import OfferedJobsScreen    from '../screens/OfferedJobsScreen';
import AcceptedJobsScreen   from '../screens/AcceptedJobsScreen';

// Admin screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

// Settings screen — shared by all roles
import SettingsScreen       from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// 3 dot menu button — shown in header of every tab navigator
function ThreeDotsButton({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <Text style={{ fontSize: 22, color: '#374151' }}>⋮</Text>
    </TouchableOpacity>
  );
}

// ── Seeker tabs ───────────────────────────────
function SeekerTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThreeDotsButton navigation={navigation} />,
        headerStyle: { backgroundColor: '#fff', elevation: 1, shadowOpacity: 0.1 },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
        tabBarActiveTintColor:   '#1a56db',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, height: 60 },
      }}
    >
      <Tab.Screen name="Home"        component={HomeScreen}
        options={{ title: 'Home', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>, tabBarLabel: 'Home' }} />
      <Tab.Screen name="Map"         component={MapScreen}
        options={{ title: 'Nearby Providers', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text>, tabBarLabel: 'Map' }} />
      <Tab.Screen name="PostRequest" component={PostRequestScreen}
        options={{ title: 'Post a Job', tabBarIcon: () => <Text style={{ fontSize: 20 }}>➕</Text>, tabBarLabel: 'Post Job' }} />
      <Tab.Screen name="MyRequests"  component={MyRequestsScreen}
        options={{ title: 'My Requests', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>, tabBarLabel: 'My Jobs' }} />
    </Tab.Navigator>
  );
}

// ── Provider tabs ─────────────────────────────
function ProviderTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThreeDotsButton navigation={navigation} />,
        headerStyle: { backgroundColor: '#fff', elevation: 1, shadowOpacity: 0.1 },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
        tabBarActiveTintColor:   '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, height: 60 },
      }}
    >
      <Tab.Screen name="ProviderHome" component={ProviderHomeScreen}
        options={{ title: 'Provider Dashboard', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>, tabBarLabel: 'Home' }} />
      <Tab.Screen name="OfferedJobs"  component={OfferedJobsScreen}
        options={{ title: 'Offered Jobs', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>, tabBarLabel: 'Offered' }} />
      <Tab.Screen name="AcceptedJobs" component={AcceptedJobsScreen}
        options={{ title: 'Accepted Jobs', tabBarIcon: () => <Text style={{ fontSize: 20 }}>✅</Text>, tabBarLabel: 'Accepted' }} />
    </Tab.Navigator>
  );
}

// ── Admin tabs ────────────────────────────────
function AdminTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <ThreeDotsButton navigation={navigation} />,
        headerStyle: { backgroundColor: '#fff', elevation: 1, shadowOpacity: 0.1 },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
        tabBarActiveTintColor:   '#ef4444',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, height: 60 },
      }}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen}
        options={{ title: 'Admin Panel', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👮</Text>, tabBarLabel: 'Dashboard' }} />
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
          // Not logged in
          <>
            <Stack.Screen name="Welcome"  component={WelcomeScreen} />
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home"     component={HomeScreen} />
          </>
        ) : user.role === 'provider' ? (
          // Provider screens
          <>
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
            <Stack.Screen name="Settings"     component={SettingsScreen}
              options={{ headerShown: false }} />
          </>
        ) : user.role === 'admin' ? (
          // Admin screens
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="Settings"  component={SettingsScreen}
              options={{ headerShown: false }} />
          </>
        ) : (
          // Seeker screens
          <>
            <Stack.Screen name="SeekerTabs" component={SeekerTabs} />
            <Stack.Screen name="Settings"   component={SettingsScreen}
              options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}