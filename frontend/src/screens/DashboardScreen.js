import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HBPlusLogo from '../components/HBPlusLogo';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

function DashboardContent() {
  const { user, userRole, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const isAdmin = userRole === 'Admin';

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
  };

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <HBPlusLogo size={72} />
          <Text style={styles.title}>Dashboard</Text>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{user?.displayName || 'HB+ Member'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>

          <View style={[styles.badge, isAdmin ? styles.adminBadge : styles.userBadge]}>
            <Text style={[styles.badgeText, isAdmin ? styles.adminText : styles.userText]}>
              {isAdmin ? 'Admin' : 'User'}
            </Text>
          </View>

          {isAdmin ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Administrator Panel</Text>
              <Text style={styles.panelText}>
                You have administrative access to HB+ resources.
              </Text>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Member Workspace</Text>
              <Text style={styles.panelText}>
                Welcome to your HB+ member dashboard.
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={loggingOut}
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              (pressed || loggingOut) && styles.buttonPressed,
            ]}
          >
            {loggingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.logoutText}>Logout</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
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
  profileRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  profileText: { flex: 1, marginLeft: 14 },
  name: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  email: { color: '#64748B', fontSize: 14, marginTop: 3 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userBadge: { backgroundColor: '#EFF6FF' },
  adminBadge: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  userText: { color: '#1D4ED8' },
  adminText: { color: '#166534' },
  panel: {
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  panelTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  panelText: { color: '#64748B', fontSize: 14, lineHeight: 20, marginTop: 6 },
  logoutButton: {
    width: '100%',
    height: 48,
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  buttonPressed: { opacity: 0.72 },
});
