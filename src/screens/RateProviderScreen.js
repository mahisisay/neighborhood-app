// =============================================
//  src/screens/RateProviderScreen.js
//  WITH FULL AMHARIC SUPPORT
// =============================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, TextInput, Alert,
  ActivityIndicator
} from 'react-native';
import { reviewAPI } from '../api/client';
import { useSettings } from '../context/SettingsContext';

const BRAND = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  secondary: '#F9A825',
  text: '#374151',
  textLight: '#6B7280',
  white: '#FFFFFF',
  error: '#DC2626',
};

export default function RateProviderScreen({ navigation, route }) {
  const { requestId, providerName, providerId } = route.params || {};
  const { theme, t } = useSettings();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(t('error'), t('rating_required'));
      return;
    }

    setLoading(true);
    try {
      await reviewAPI.submit({
        request_id: requestId,
        provider_id: providerId,
        rating: rating,
        comment: comment.trim()
      });

      Alert.alert(
        t('thank_you'),
        t('rating_submitted'),
        [{ text: t('ok'), onPress: () => navigation.navigate('MyRequests') }]
      );
    } catch (err) {
      Alert.alert(t('error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Text style={[
            styles.star,
            { color: i <= rating ? BRAND.secondary : '#D1D5DB' }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      <View style={[styles.header, { backgroundColor: isDark ? '#1E1E1E' : BRAND.white }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: BRAND.primary }]}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : BRAND.text }]}>
          {t('rate_provider')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerIcon}>👤</Text>
          <Text style={[styles.providerName, { color: isDark ? '#FFF' : BRAND.text }]}>
            {providerName || t('service_provider')}
          </Text>
        </View>

        <Text style={[styles.question, { color: isDark ? '#FFF' : BRAND.text }]}>
          {t('how_was_experience')}
        </Text>

        <View style={styles.starsContainer}>
          {renderStars()}
        </View>

        <Text style={[styles.ratingLabel, { color: isDark ? '#AAA' : BRAND.textLight }]}>
          {rating === 0 ? t('tap_to_rate') : `${t('you_rated')} ${rating} ${t('out_of_5')}`}
        </Text>

        <Text style={[styles.commentLabel, { color: isDark ? '#FFF' : BRAND.text }]}>
          {t('your_review')} ({t('optional')})
        </Text>
        <TextInput
          style={[
            styles.commentInput,
            { 
              backgroundColor: isDark ? '#2C2C2C' : '#F9FAFB',
              borderColor: isDark ? '#444' : '#E5E7EB',
              color: isDark ? '#FFF' : BRAND.text
            }
          ]}
          placeholder={t('review_placeholder')}
          placeholderTextColor={isDark ? '#888' : BRAND.textLight}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: BRAND.primary }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>{t('submit_rating')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('MyRequests')}
        >
          <Text style={[styles.skipBtnText, { color: BRAND.textLight }]}>{t('skip')}</Text>
        </TouchableOpacity>
      </View>
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
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  providerIcon: { fontSize: 40 },
  providerName: { fontSize: 20, fontWeight: 'bold' },
  question: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  starButton: { paddingHorizontal: 8 },
  star: { fontSize: 48, marginHorizontal: 4 },
  ratingLabel: { textAlign: 'center', marginBottom: 24, fontSize: 14 },
  commentLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipBtnText: { fontSize: 14 },
});