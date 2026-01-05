import React, {ReactNode, useState, useCallback} from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface TVFocusableProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  focusedStyle?: StyleProp<ViewStyle>;
  children: ReactNode | ((focused: boolean) => ReactNode);
  disabled?: boolean;
  hasTVPreferredFocus?: boolean;
}

export default function TVFocusable({
  onPress,
  style,
  focusedStyle,
  children,
  disabled,
  hasTVPreferredFocus,
}: TVFocusableProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <Pressable
      style={[
        styles.base,
        style,
        isFocused && styles.focused,
        isFocused && focusedStyle,
      ]}
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      hasTVPreferredFocus={hasTVPreferredFocus}>
      {typeof children === 'function' ? children(isFocused) : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
});
