import { Check, Palette, Star } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { themes } from "../../../../theme/themes";
import type { ThemeName } from "../../../../theme/types";
import { useTheme } from "../../../../theme/useTheme";

export const ThemeSelectorCard = () => {
  const { theme, setTheme } = useTheme();
  const themeNames = Object.keys(themes) as ThemeName[];
  const styles = getStyles(theme);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 180, delay: 200 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Palette size={20} color={theme.colors.primary} />
        <View>
          <Text style={styles.title}>Apariencia</Text>
          <Text style={styles.subtitle}>
            Personaliza la interfaz de tu portal académico.
          </Text>
        </View>
      </View>

      <View style={styles.themesRow}>
        {themeNames.map((name) => {
          const isActive = theme.name === name;
          const previewColors = themes[name].colors;

          return (
            <Pressable
              key={name}
              onPress={() => setTheme(name)}
              style={({ pressed }) => [
                styles.themeBtn,
                {
                  borderColor: isActive
                    ? theme.colors.primary
                    : theme.colors.border + "60",
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              {/* Preview */}
              <View
                style={[
                  styles.preview,
                  { backgroundColor: previewColors.background },
                ]}
              >
                <View style={styles.previewHeader}>
                  <View
                    style={[
                      styles.previewDot,
                      { backgroundColor: previewColors.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewLine,
                      { backgroundColor: previewColors.backgroundSecondary },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.previewCard,
                    {
                      backgroundColor: previewColors.card,
                      borderColor: previewColors.border + "40",
                    },
                  ]}
                />
              </View>

              {/* Label */}
              <View style={styles.labelRow}>
                {name === "premium" && (
                  <Star size={12} color="#D4AF37" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    styles.label,
                    {
                      fontWeight: isActive ? "700" : "500",
                      color: isActive
                        ? theme.colors.primary
                        : theme.colors.text,
                    },
                  ]}
                >
                  {name === "light"
                    ? "Claro"
                    : name === "dark"
                      ? "Oscuro"
                      : "Premium"}
                </Text>
              </View>

              {/* Check */}
              {isActive && (
                <View
                  style={[
                    styles.check,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Check size={12} color="#FFF" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </MotiView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border + "40",
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    themesRow: {
      flexDirection: "row",
      gap: 16,
      width: "100%",
    },
    themeBtn: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 2,
      overflow: "hidden",
      position: "relative",
      minWidth: 0,
    },
    preview: {
      height: 90,
      padding: 10,
      justifyContent: "space-between",
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    previewDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    previewLine: {
      height: 4,
      width: "50%",
      borderRadius: 2,
    },
    previewCard: {
      height: 34,
      borderRadius: 6,
      borderWidth: 1,
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 8,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    label: {
      fontSize: 13,
      textAlign: "center",
    },
    check: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
  });
