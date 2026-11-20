import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import {
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import {
  DOMAIN_ERROR,
  isAllowedDomain,
} from '../utils/domainValidator';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

function friendlyAuthError(error) {
  const code = error?.code || '';
  if (code === 'auth/popup-closed-by-user') return 'Google sign-in was cancelled.';
  if (code === 'auth/network-request-failed') return 'Network error. Please try again.';
  if (code === 'auth/unauthorized-domain') {
    const currentHost =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.hostname
        : '';
    const projectId =
      auth?.app?.options?.projectId ||
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
      '';
    if (currentHost && projectId) {
      return `Domain "${currentHost}" is not authorized. Add "${currentHost}" in Firebase Console for project "${projectId}" (Authentication > Settings > Authorized domains).`;
    }
    return 'This domain is not authorized. Please add it to Authorized Domains in Firebase Console.';
  }
  return error?.message || 'Authentication failed. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const handlingTransition = useRef(false);

  const loadProfile = async (firebaseUser) => {
    if (!firebaseUser?.email) return null;
    if (!isAllowedDomain(firebaseUser.email)) {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      setAuthError(DOMAIN_ERROR);
      return null;
    }

    const profileRef = doc(db, 'users', firebaseUser.uid);
    const snapshot = await getDoc(profileRef);
    const profile = snapshot.exists()
      ? snapshot.data()
      : await ensureProfile(firebaseUser);
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: profile.displayName || firebaseUser.displayName || '',
    });
    setUserRole(profile.role || 'User');
    setAuthError('');
    return profile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (handlingTransition.current) return;
      if (!firebaseUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }
      try {
        await loadProfile(firebaseUser);
      } catch (error) {
        setAuthError(friendlyAuthError(error));
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const rejectDomain = async () => {
    if (auth.currentUser) await signOut(auth);
    setUser(null);
    setUserRole(null);
    setAuthError(DOMAIN_ERROR);
  };

  const ensureProfile = async (firebaseUser) => {
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const snapshot = await getDoc(profileRef);
    if (snapshot.exists()) return snapshot.data();

    const profile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || '',
      role: 'User',
      createdAt: serverTimestamp(),
    };
    await setDoc(profileRef, profile, { merge: true });
    return profile;
  };

  const completeGoogleCredential = async (credential) => {
    if (!credential?.user) throw new Error('Google authentication failed.');
    if (!isAllowedDomain(credential.user.email)) {
      await rejectDomain();
      throw new Error(DOMAIN_ERROR);
    }
    const profile = await ensureProfile(credential.user);
    setUser({
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: profile.displayName || credential.user.displayName || '',
    });
    setUserRole(profile.role || 'User');
    setAuthError('');
  };

  const loginWithGoogle = async () => googleSignIn();

  const googleSignIn = async () => {
    setAuthError('');
    handlingTransition.current = true;
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const allowedDomain = (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || '@hbplus.fit').replace(/^@/, '');
        provider.setCustomParameters({ prompt: 'select_account', hd: allowedDomain });
        const credential = await signInWithPopup(auth, provider);
        await completeGoogleCredential(credential);
      } else {
        const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
        const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
        const clientId =
          Platform.OS === 'ios'
            ? (iosClientId || webClientId)
            : (androidClientId || webClientId);
        if (!clientId) {
          throw new Error('Google Sign-In is not configured for this platform.');
        }

        const redirectUri = AuthSession.makeRedirectUri({
          scheme: process.env.EXPO_PUBLIC_OAUTH_SCHEME || 'hb-plus-auth',
          path: 'oauthredirect',
        });
        const request = new AuthSession.AuthRequest({
          clientId,
          scopes: ['openid', 'profile', 'email'],
          redirectUri,
          responseType: AuthSession.ResponseType.IdToken,
        });
        const discovery = {
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        };
        await request.makeAuthUrlAsync(discovery);
        const result = await request.promptAsync(discovery, { useProxy: true });
        if (result.type !== 'success' || !result.params?.id_token) {
          if (result.type === 'cancel' || result.type === 'dismiss') {
            throw new Error('Google sign-in was cancelled.');
          }
          throw new Error('Google authentication failed.');
        }
        const googleCredential = GoogleAuthProvider.credential(
          result.params.id_token,
          result.params.access_token
        );
        const credential = await signInWithCredential(auth, googleCredential);
        await completeGoogleCredential(credential);
      }
    } catch (error) {
      if (error.message !== DOMAIN_ERROR) {
        setAuthError(friendlyAuthError(error));
      }
      throw error;
    } finally {
      handlingTransition.current = false;
    }
  };

  const logout = async () => {
    setAuthError('');
    await signOut(auth);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        authError,
        setAuthError,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
