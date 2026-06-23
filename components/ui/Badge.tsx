import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/useTheme";

type Variant = "success" | "warning" | "muted" | "info" | "destructive";

interface BadgeProps {
  label: string;
  variant?: Variant;
}

export function Badge({ label, variant = "muted" }: BadgeProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const colorMap: Record<Variant, { bg: string; text: string }> = {
    success:     { bg: `${c.success}22`,     text: c.success },
    warning:     { bg: `${c.warning}22`,     text: c.warning },
    muted:       { bg: `${c.textMuted}22`,   text: c.textMuted },
    info:        { bg: `${c.info}22`,        text: c.info },
    destructive: { bg: `${c.destructive}22`, text: c.destructive },
  };

  const { bg, text } = colorMap[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
