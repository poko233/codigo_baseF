// components/ThemedText.tsx
import React from "react";
import { Text, TextProps } from "react-native";

export function ThemedText({ children, style, ...props }: TextProps) {
  return (
    <Text {...props} style={style}>
      {children}
    </Text>
  );
}