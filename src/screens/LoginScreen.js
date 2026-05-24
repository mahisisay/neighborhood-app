// =============================================
//  src/screens/LoginScreen.js
//  CLEAN VERSION - No admin bypass, only real login
// =============================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const BRAND = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  secondaryLight: '#FFF8E1',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  dark: '#1F2937',
  error: '#DC2626',
};

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t, theme, language, updateLanguage } = useSettings();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const clearExpiredToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            console.log('Cleared expired token on login screen');
          }
        } catch (e) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      }
    };
    clearExpiredToken();
  }, []);

  const toggleLanguage = () => {
    updateLanguage(language === 'en' ? 'am' : 'en');
  };

  async function handleLogin() {
    console.log('🔐 Login clicked with:', { phone, password });
    
    if (!phone || !password) {
      Alert.alert('Missing Fields', 'Please enter phone number and password');
      return;
    }
    
    setLoading(true);
    
    // Format phone number to standard format
    let formattedPhone = phone;
    if (phone && !phone.startsWith('+')) {
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
      if (cleaned.startsWith('251')) {
        formattedPhone = '+' + cleaned;
      } else if (cleaned.length === 9) {
        formattedPhone = '+251' + cleaned;
      } else {
        formattedPhone = '+' + cleaned;
      }
    }
    
    console.log('Login attempt - Formatted phone:', formattedPhone);
    
    try {
      const data = await authAPI.login({ phone: formattedPhone, password });
      
      if (data.message === 'pending') {
        Alert.alert('Account Pending', 'Your account is pending admin verification.');
        setLoading(false);
        return;
      }
      
      await login(data.token, data.user);
      
    } catch (err) {
      console.log('Login error:', err.message);
      Alert.alert('Login Failed', 'Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : BRAND.white }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: BRAND.primary }]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{language === 'en' ? 'አማርኛ' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}>
            Welcome Back 🏘️
          </Text>
          <Text style={[styles.subtitle, { color: theme === 'dark' ? '#AAA' : BRAND.textLight }]}>
            Login to your account
          </Text>
        </View>
        
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme === 'dark' ? '#DDD' : BRAND.text }]}>
            Phone Number
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                backgroundColor: theme === 'dark' ? '#2C2C2C' : BRAND.white,
                borderColor: theme === 'dark' ? '#444' : '#E5E7EB',
                color: theme === 'dark' ? '#FFF' : BRAND.text
              }
            ]}
            placeholder="+251912345678 or 0912345678"
            placeholderTextColor={theme === 'dark' ? '#888' : '#9CA3AF'}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          
          <Text style={[styles.label, { color: theme === 'dark' ? '#DDD' : BRAND.text }]}>
            Password
          </Text>
          <View style={[
            styles.passwordContainer,
            { 
              backgroundColor: theme === 'dark' ? '#2C2C2C' : BRAND.white,
              borderColor: theme === 'dark' ? '#444' : '#E5E7EB',
            }
          ]}>
            <TextInput
              style={[styles.passwordInput, { color: theme === 'dark' ? '#FFF' : BRAND.text }]}
              placeholder="Enter your password"
              placeholderTextColor={theme === 'dark' ? '#888' : '#9CA3AF'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Text style={{ fontSize: 18, color: theme === 'dark' ? '#AAA' : BRAND.textLight }}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: BRAND.primary }]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.forgotText, { color: BRAND.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.linkText, { color: theme === 'dark' ? '#AAA' : BRAND.textLight }]}>
              Don't have an account? <Text style={[styles.link, { color: BRAND.primary }]}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    marginBottom: 20,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 16, fontWeight: '600' },
  langBtn: { backgroundColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#111' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 15 },
  form: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16 },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15 },
  eyeIcon: { padding: 8 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  forgotText: { textAlign: 'center', marginTop: 4, fontSize: 13, fontWeight: '500' },
  linkText: { textAlign: 'center', marginTop: 12 },
  link: { fontWeight: '600' },
});