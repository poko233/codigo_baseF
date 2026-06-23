import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../theme/useTheme";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  onPress,
  size = 32,
  color,
  accessibilityLabel,
}: CheckboxProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const activeColor = color ?? c.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: checked ? activeColor : c.backgroundSecondary,
          borderColor: checked ? activeColor : c.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {checked ? (
        <Ionicons name="checkmark" size={size * 0.55} color="#fff" />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
