// src/navigation/AppNavigator.web.js
// Web-specific version - NO map import

import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Auth screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PostRequestScreen from '../screens/PostRequestScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import ProviderHomeScreen from '../screens/ProviderHomeScreen';
import OfferedJobsScreen from '../screens/OfferedJobsScreen';
import AcceptedJobsScreen from '../screens/AcceptedJobsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Web MapScreen - simple placeholder, NO react-native-maps import
function MapScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
      <Text style={{ fontSize: 64, marginBottom: 16 }}>🗺️</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }}>Map View</Text>
      <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
        Maps are only available on mobile devices.
      </Text>
      <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
        Please open this app on your Android phone
      </Text>
    </View>
  );
}

function SeekerTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: true,
      headerRight: () => <ThreeDotsButton />,
      tabBarActiveTintColor: '#1a56db',
      tabBarInactiveTintColor: '#9ca3af',
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map', tabBarIcon: () => <Text>🗺️</Text> }} />
      <Tab.Screen name="PostRequest" component={PostRequestScreen} options={{ title: 'Post Job', tabBarIcon: () => <Text>➕</Text> }} />
      <Tab.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'My Jobs', tabBarIcon: () => <Text>📋</Text> }} />
    </Tab.Navigator>
  );
}

function ProviderTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: true,
      headerRight: () => <ThreeDotsButton />,
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: '#9ca3af',
    }}>
      <Tab.Screen name="ProviderHome" component={ProviderHomeScreen} options={{ title: 'Home', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tab.Screen name="OfferedJobs" component={OfferedJobsScreen} options={{ title: 'Offered', tabBarIcon: () => <Text>📋</Text> }} />
      <Tab.Screen name="AcceptedJobs" component={AcceptedJobsScreen} options={{ title: 'Accepted', tabBarIcon: () => <Text>✅</Text> }} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: true,
      headerRight: () => <ThreeDotsButton />,
      tabBarActiveTintColor: '#ef4444',
      tabBarInactiveTintColor: '#9ca3af',
    }}>
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard', tabBarIcon: () => <Text>👮</Text> }} />
    </Tab.Navigator>
  );
}

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
          </>
        ) : user.role === 'provider' ? (
          <>
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          </>
        ) : user.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="SeekerTabs" component={SeekerTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}