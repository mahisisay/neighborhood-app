// =============================================
//  src/screens/AboutScreen.js
//  WITH FULL AMHARIC SUPPORT
// =============================================

import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Linking
} from 'react-native';
import { useSettings } from '../context/SettingsContext';

const BRAND = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  dark: '#1F2937',
};

export default function AboutScreen({ navigation }) {
  const { theme, t } = useSettings();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white, borderBottomColor: isDark ? '#333' : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: BRAND.primary }]}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : BRAND.text }]}>{t('about')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.logoSection}>
          <Text style={styles.logoIcon}>🏘️</Text>
          <Text style={[styles.appName, { color: BRAND.primary }]}>Neighborhood</Text>
          <Text style={[styles.appNameFull, { color: isDark ? '#FFF' : BRAND.text }]}>{t('app_name')}</Text>
          <Text style={[styles.version, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('version')} 1.0.0</Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>📖 {t('app_description')}</Text>
          <Text style={[styles.cardText, { color: isDark ? '#CCC' : BRAND.text }]}>
            {t('about_text')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>👨‍💻 {t('developer_info')}</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('developer')}:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>Mahlat Sisay</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('university')}:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>University of Gondar</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('department')}:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>Information Systems</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('location')}:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>Gondar, Ethiopia</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>{t('year')}:</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>2026</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>📞 {t('contact_us')}</Text>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@nsf.com')}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={[styles.contactText, { color: BRAND.primary }]}>support@neighborhoodfinder.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+251912345678')}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={[styles.contactText, { color: BRAND.primary }]}>+251-912-345-678</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>✨ {t('key_features')}</Text>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>{t('feature_gps')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>✅</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>{t('feature_verified')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>{t('feature_rating')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>{t('feature_payment')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🔄</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>{t('feature_roles')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🌙</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>{t('feature_theme')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>{t('feature_language')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.okBtn, { backgroundColor: BRAND.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.okBtnText}>{t('ok')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  backBtnText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  inner: { padding: 20, gap: 16 },
  logoSection: { alignItems: 'center', marginBottom: 8 },
  logoIcon: { fontSize: 64, marginBottom: 8 },
  appName: { fontSize: 20, fontWeight: 'bold' },
  appNameFull: { fontSize: 16, marginTop: 4 },
  version: { fontSize: 12, marginTop: 4 },
  card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  cardText: { fontSize: 14, lineHeight: 22 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { width: 100, fontSize: 13 },
  infoValue: { flex: 1, fontSize: 13, fontWeight: '500' },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  contactIcon: { fontSize: 20, width: 32 },
  contactText: { fontSize: 14, fontWeight: '500' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureIcon: { fontSize: 18, width: 32 },
  featureText: { flex: 1, fontSize: 13 },
  okBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  okBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});