// screens/admin/perfil/components/InformacionPersonal.tsx
import {
  BadgeCheck,
  Cake,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  VenusAndMars,
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useTheme } from "../../../../theme/useTheme";
import { usePerfilData } from "../hooks/usePerfilData";

export const InformacionPersonal = () => {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const {
    correo,
    telefono,
    celular,
    direccion,
    ciExpedido,
    genero,
    fechaNacimiento,
  } = usePerfilData();
  const styles = getStyles(theme);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 180, delay: 100 }}
      style={styles.card}
    >
      <Text style={styles.title}>Información Personal</Text>

      {/* Contenedor principal en dos columnas (desktop) o una columna (móvil) */}
      <View style={[styles.columns, isDesktop && styles.columnsDesktop]}>
        {/* Columna izquierda */}
        <View style={styles.column}>
          {/* Correo Electrónico */}
          <Field
            label="Correo Electrónico"
            icon={Mail}
            value={correo}
            theme={theme}
          />
          {/* Teléfono Fijo */}
          <Field
            label="Teléfono Fijo"
            icon={Phone}
            value={telefono}
            theme={theme}
          />
          {/* Carnet de Identidad */}
          <Field
            label="Carnet de Identidad"
            icon={BadgeCheck}
            value={ciExpedido}
            theme={theme}
          />
          {/* Género */}
          <Field
            label="Género"
            icon={VenusAndMars}
            value={genero}
            theme={theme}
          />
        </View>

        {/* Columna derecha */}
        <View style={styles.column}>
          {/* Dirección (con altura mayor) */}
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

          {/* Celular */}
          <Field
            label="Celular"
            icon={Smartphone}
            value={celular}
            theme={theme}
          />
          {/* Fecha de Nacimiento */}
          <Field
            label="Fecha de Nacimiento"
            icon={Cake}
            value={fechaNacimiento}
            theme={theme}
          />
        </View>
      </View>
    </MotiView>
  );
};

/* ─── Subcomponente Field ─────────────────── */
const Field: React.FC<{
  label: string;
  icon: React.ComponentType<any>;
  value: string;
  theme: any;
}> = ({ label, icon: Icon, value, theme }) => (
  <View style={fieldStyles.field}>
    <Text style={fieldStyles.label}>{label}</Text>
    <View
      style={[
        fieldStyles.fieldBox,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border + "30",
        },
      ]}
    >
      <Icon size={16} color={theme.colors.textSecondary} />
      <Text style={[fieldStyles.fieldText, { color: theme.colors.text }]}>
        {value || "—"}
      </Text>
    </View>
  </View>
);

const fieldStyles = StyleSheet.create({
  field: {
    marginBottom: 16,
    flex: 1,
    minWidth: 200,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280", // se mantiene el estilo del mockup
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  fieldBoxLarge: {
    minHeight: 60,
    alignItems: "flex-start",
  },
  fieldText: {
    fontSize: 14,
    flex: 1,
  },
});

/* ─── Estilos principales ─────────────────── */
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
    columns: {
      flexDirection: "column",
      gap: 8,
    },
    columnsDesktop: {
      flexDirection: "row",
      gap: 24,
    },
    column: {
      flex: 1,
    },
    field: {
      marginBottom: 16,
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
