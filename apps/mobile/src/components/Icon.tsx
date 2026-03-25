import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}

/**
 * Cross-platform icon component using Material Symbols Outlined.
 * - On web: renders a <span> with Material Symbols Outlined CSS class
 * - On native: renders a <Text> with MaterialSymbols_400Regular font (loaded in _layout.tsx)
 */
const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  if (Platform.OS === 'web') {
    return (
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: size,
          color,
          fontWeight: 'normal',
          fontStyle: 'normal',
          lineHeight: 1,
          verticalAlign: 'middle',
          ...(style as any),
        }}
      >
        {name}
      </span>
    );
  }

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color,
          lineHeight: size,
        },
        style,
      ]}
    >
      {name}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontFamily: 'MaterialSymbols_400Regular',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
});

export default Icon;
