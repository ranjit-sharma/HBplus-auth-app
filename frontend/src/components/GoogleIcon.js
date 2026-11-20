import React from 'react';
import { Image } from 'react-native';

export default function GoogleIcon({ size = 20 }) {
  return (
    <Image
      source={require('../../assets/google-symbol.png')}
      accessibilityLabel="Google"
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
