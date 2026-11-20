import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: Platform.OS === 'web' && typeof window !== 'undefined'
    ? [window.location.origin]
    : [],
  config: {
    screens: {
      Login: '',
      Dashboard: 'dashboard',
    },
  },
};

function AppNavigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={Platform.OS === 'web' ? linking : undefined}
      fallback={<ActivityIndicator size="large" color="#0F172A" />}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}
