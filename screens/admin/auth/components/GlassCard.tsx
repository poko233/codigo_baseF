// screens/auth/components/GlassCard.tsx
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../../theme/useTheme";

interface GlassCardProps {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children }) => {
  const { theme } = useTheme();
  const tint = theme.dark ? "dark" : "light";

  return (
    <View style={styles.container}>
      <BlurView
        intensity={60} // Aumentamos la intensidad para que el efecto sea visible
        tint={tint}
        style={[
          styles.blur,
          {
            // Bajamos la opacidad dramáticamente (de 0.7 a 0.15 o 0.1)
            backgroundColor: theme.dark
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.15)",
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
    // Importante: asegúrate de que el container padre no tenga un backgroundColor sólido
    // que pise el efecto del BlurView.
  },
  blur: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    borderWidth: 1,
    // El borde semitransparente ayuda a dar el efecto de "brillo" en el borde del cristal
    borderColor: "rgba(255,255,255,0.2)",
  },
});
