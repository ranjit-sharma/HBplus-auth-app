import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HBPlusLogo from '../components/HBPlusLogo';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { loginWithGoogle, authError } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const submitGoogle = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <HBPlusLogo size={72} />
          <Text style={styles.title}>Sign in to HB+</Text>

          {authError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={submitGoogle}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.buttonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <View style={styles.googleButtonContent}>
                <GoogleIcon />
                <Text style={styles.googleButtonText}>Login with Google</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.footer}>
            Restricted exclusively to @hbplus.fit domain members
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  title: {
    marginTop: 16,
    marginBottom: 24,
    color: '#0F172A',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  errorBanner: {
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center' },
  googleButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonContent: { flexDirection: 'row', alignItems: 'center' },
  googleButtonText: { marginLeft: 10, color: '#0F172A', fontSize: 16, fontWeight: '700' },
  buttonPressed: { opacity: 0.72 },
  footer: {
    marginTop: 24,
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
});
