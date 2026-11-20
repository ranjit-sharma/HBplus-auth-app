import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && !user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [loading, user, navigation]);

  if (loading || !user) return null;
  return children;
}
