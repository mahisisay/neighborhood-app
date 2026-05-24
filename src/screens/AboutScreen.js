// =============================================
//  src/screens/AboutScreen.js
//  COMPLETE FIXED VERSION - No emojis, no text node errors
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
          <Text style={[styles.backBtnText, { color: BRAND.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
          {t('about') || 'About'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.logoSection}>
          <Text style={styles.logoIcon}>NF</Text>
          <Text style={[styles.appName, { color: BRAND.primary }]}>Neighborhood</Text>
          <Text style={[styles.appNameFull, { color: isDark ? '#FFF' : BRAND.text }]}>
            {t('app_name') || 'Neighborhood Finder'}
          </Text>
          <Text style={[styles.version, { color: isDark ? '#AAA' : BRAND.textLight }]}>
            {t('version') || 'Version'} 1.0.0
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
            About the App
          </Text>
          <Text style={[styles.cardText, { color: isDark ? '#CCC' : BRAND.text }]}>
            {t('about_text') || 'Neighborhood Finder connects local service providers with customers in your area. Find trusted professionals for home services, repairs, and more.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
            Developer Information
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('developer') || 'Developer'}:
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>
              Mahlat Sisay
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('university') || 'University'}:
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>
              University of Gondar
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('department') || 'Department'}:
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>
              Information Systems
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('location') || 'Location'}:
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>
              Gondar, Ethiopia
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
              {t('year') || 'Year'}:
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFF' : BRAND.text }]}>
              2026
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
            Contact Us
          </Text>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@neighborhoodfinder.com')}>
            <Text style={styles.contactIcon}>Email</Text>
            <Text style={[styles.contactText, { color: BRAND.primary }]}>
              support@neighborhoodfinder.com
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+251912345678')}>
            <Text style={styles.contactIcon}>Phone</Text>
            <Text style={[styles.contactText, { color: BRAND.primary }]}>
              +251-912-345-678
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
            Key Features
          </Text>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>-</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {t('feature_gps') || 'GPS Location Tracking'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>-</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {t('feature_verified') || 'Verified Service Providers'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>-</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {t('feature_rating') || 'Ratings and Reviews'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>-</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {t('feature_payment') || 'Secure Payment System'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>-</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {t('feature_roles') || 'Multi-role Support'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>-</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {t('feature_theme') || 'Dark/Light Theme'}
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>-</Text>
            <Text style={[styles.featureText, { color: isDark ? '#CCC' : BRAND.text }]}>
              {t('feature_language') || 'Multi-language Support'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.okBtn, { backgroundColor: BRAND.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.okBtnText}>{t('ok') || 'OK'}</Text>
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
  logoIcon: { fontSize: 48, fontWeight: 'bold', marginBottom: 8, color: '#2E7D32' },
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
  contactIcon: { fontSize: 14, fontWeight: '600', width: 50 },
  contactText: { fontSize: 14, fontWeight: '500', flex: 1 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureIcon: { fontSize: 14, fontWeight: 'bold', width: 20 },
  featureText: { flex: 1, fontSize: 13 },
  okBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  okBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});