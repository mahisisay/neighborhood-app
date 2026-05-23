// =============================================
//  src/screens/ForgotPasswordScreen.js
//  Forgot Password - Reset via phone
// =============================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform,
  ActivityIndicator
} from 'react-native';
import { authAPI } from '../api/client';
import { useSettings } from '../context/SettingsContext';
import { formatPhoneForDisplay, getPhoneError } from '../utils/validation';

const BRAND = {
  primary: '#2E7D32',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
};

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useSettings();
  const [step, setStep] = useState(1); // 1: phone, 2: reset code, 3: new password
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isDark = theme === 'dark';

  async function handleRequestReset() {
    const phoneError = getPhoneError(phone);
    if (phoneError) {
      Alert.alert('Error', phoneError);
      return;
    }
    
    setLoading(true);
    try {
      const formattedPhone = formatPhoneForDisplay(phone);
      const data = await authAPI.forgotPassword({ phone: formattedPhone });
      Alert.alert('Code Sent', data.message);
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleVerifyCode() {
    if (!resetToken || resetToken.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit reset code');
      return;
    }
    setStep(3);
  }
  
  async function handleResetPassword() {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = 'New password is required';
    if (newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Error', Object.values(newErrors)[0]);
      return;
    }
    
    setLoading(true);
    try {
      const formattedPhone = formatPhoneForDisplay(phone);
      await authAPI.resetPassword({
        phone: formattedPhone,
        token: resetToken,
        newPassword: newPassword
      });
      Alert.alert(
        'Success',
        'Password reset successful. Please login with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: BRAND.primary }]}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.primary }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            {step === 1 && "Enter your phone number to receive a reset code"}
            {step === 2 && "Enter the 6-digit code sent to your phone"}
            {step === 3 && "Create your new password"}
          </Text>
          
          {step === 1 && (
            <>
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder="+251912345678"
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: BRAND.primary }]}
                onPress={handleRequestReset}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Code</Text>}
              </TouchableOpacity>
            </>
          )}
          
          {step === 2 && (
            <>
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Reset Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                keyboardType="number-pad"
                maxLength={6}
                value={resetToken}
                onChangeText={setResetToken}
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: BRAND.primary }]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <Text style={styles.btnText}>Verify Code</Text>
              </TouchableOpacity>
            </>
          )}
          
          {step === 3 && (
            <>
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>New Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder="At least 6 characters"
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>Confirm Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder="Re-enter new password"
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: BRAND.primary }]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              Remember your password? <Text style={[styles.link, { color: BRAND.primary }]}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 20 },
  backBtn: { fontSize: 16, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderColor: '#E5E7EB', marginBottom: 16 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  linkText: { textAlign: 'center', marginTop: 16 },
  link: { fontWeight: '600' },
});