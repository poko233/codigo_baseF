import { Mail, MapPin, Phone } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useTheme } from "../../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

export const InformacionPersonal = () => {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const { correo, telefono, direccion } = usePerfilData();
  const styles = getStyles(theme);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 180, delay: 100 }}
      style={styles.card}
    >
      <Text style={styles.title}>Información Personal</Text>

      <View style={[styles.fields, isDesktop && styles.fieldsDesktop]}>
        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.fieldBox}>
            <Mail size={16} color={theme.colors.textSecondary} />
            <Text style={styles.fieldText}>{correo}</Text>
          </View>
        </View>

        {/* Teléfono */}
        <View style={styles.field}>
          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.fieldBox}>
            <Phone size={16} color={theme.colors.textSecondary} />
            <Text style={styles.fieldText}>{telefono}</Text>
          </View>
        </View>

        {/* Dirección */}
        <View style={styles.field}>
          <Text style={styles.label}>Dirección</Text>
          <View style={[styles.fieldBox, styles.fieldBoxLarge]}>
            <MapPin
              size={16}
              color={theme.colors.textSecondary}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.fieldText}>{direccion}</Text>
          </View>
        </View>
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
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
    },
    fields: {
      gap: 12,
    },
    fieldsDesktop: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    field: {
      flex: 1,
      minWidth: 200,
    },
    label: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    fieldBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border + "30",
    },
    fieldBoxLarge: {
      minHeight: 60,
      alignItems: "flex-start",
    },
    fieldText: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
  });
