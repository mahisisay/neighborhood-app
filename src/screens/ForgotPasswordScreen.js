// =============================================
//  src/screens/ForgotPasswordScreen.js
//  Forgot Password - Reset via phone
//  WITH FULL AMHARIC SUPPORT
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
  const { theme, t } = useSettings();
  const [step, setStep] = useState(1);
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
      Alert.alert(t('error'), phoneError);
      return;
    }
    
    setLoading(true);
    try {
      const formattedPhone = formatPhoneForDisplay(phone);
      const data = await authAPI.forgotPassword({ phone: formattedPhone });
      Alert.alert(t('reset_code'), data.message);
      setStep(2);
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleVerifyCode() {
    if (!resetToken || resetToken.length !== 6) {
      Alert.alert(t('error'), t('enter_code'));
      return;
    }
    setStep(3);
  }
  
  async function handleResetPassword() {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = t('password_required');
    if (newPassword.length < 6) newErrors.newPassword = t('password_length');
    if (newPassword !== confirmPassword) newErrors.confirmPassword = t('password_mismatch');
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      Alert.alert(t('error'), Object.values(newErrors)[0]);
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
        t('success'),
        t('reset_success'),
        [{ text: t('ok'), onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: BRAND.primary }]}>← {t('back')}</Text>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : BRAND.primary }]}>{t('forgot_password')}</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            {step === 1 && t('enter_phone')}
            {step === 2 && t('enter_code')}
            {step === 3 && t('enter_new_password')}
          </Text>
          
          {step === 1 && (
            <>
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('phone_number')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder={t('phone_placeholder')}
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
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('send_code')}</Text>}
              </TouchableOpacity>
            </>
          )}
          
          {step === 2 && (
            <>
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('reset_code')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder={t('enter_code_placeholder')}
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
                <Text style={styles.btnText}>{t('verify_code')}</Text>
              </TouchableOpacity>
            </>
          )}
          
          {step === 3 && (
            <>
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('new_password')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder={t('password_placeholder')}
                placeholderTextColor={isDark ? '#888' : BRAND.textLight}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Text style={[styles.label, { color: isDark ? '#DDD' : BRAND.text }]}>{t('confirm_password')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB' }]}
                placeholder={t('confirm_password_placeholder')}
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
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('reset_password')}</Text>}
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.linkText, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('remember_password')} <Text style={[styles.link, { color: BRAND.primary }]}>{t('login')}</Text>
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