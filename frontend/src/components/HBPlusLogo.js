import React from 'react';
import { Image } from 'react-native';

export default function HBPlusLogo({ size = 72 }) {
  return (
    <Image
      source={require('../../assets/hb-plus-logo.png')}
      accessibilityLabel="HB Plus"
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
