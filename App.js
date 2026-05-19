// App.js
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext'; // ADD THIS
import AppNavigator from './src/navigation/AppNavigator';
import * as Updates from 'expo-updates';
import { ActivityIndicator, View, Text, Alert } from 'react-native';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            'Update Available',
            'A new version is available. Download now?',
            [
              { text: 'Later', style: 'cancel' },
              { 
                text: 'Update', 
                onPress: async () => {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                }
              }
            ]
          );
        }
      }
    } catch (err) {
      console.log('Update check failed:', err);
      setUpdateError('Could not check for updates');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 20, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>   {/* ✅ WRAPPED HERE */}
          <AppNavigator />
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}