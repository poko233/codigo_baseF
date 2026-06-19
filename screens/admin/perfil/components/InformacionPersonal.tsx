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

  // Pasamos isDesktop a los estilos para manejar la grilla
  const styles = getStyles(theme, isDesktop);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 180, delay: 100 }}
      style={styles.card}
    >
      <Text style={styles.title}>Información Personal</Text>

      {/* Contenedor tipo Grid con flexWrap */}
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Field
            label="Correo Electrónico"
            icon={Mail}
            value={correo}
            theme={theme}
          />
        </View>
        <View style={styles.gridItem}>
          {/* Dirección ahora usa el componente estándar para asegurar simetría */}
          <Field
            label="Dirección"
            icon={MapPin}
            value={direccion}
            theme={theme}
          />
        </View>
        <View style={styles.gridItem}>
          <Field
            label="Teléfono Fijo"
            icon={Phone}
            value={telefono}
            theme={theme}
          />
        </View>
        <View style={styles.gridItem}>
          <Field
            label="Celular"
            icon={Smartphone}
            value={celular}
            theme={theme}
          />
        </View>
        <View style={styles.gridItem}>
          <Field
            label="Carnet de Identidad"
            icon={BadgeCheck}
            value={ciExpedido}
            theme={theme}
          />
        </View>
        <View style={styles.gridItem}>
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
      <Icon
        size={16}
        color={theme.colors.textSecondary}
        style={{ marginTop: 2 }}
      />
      <Text style={[fieldStyles.fieldText, { color: theme.colors.text }]}>
        {value || "—"}
      </Text>
    </View>
  </View>
);

const fieldStyles = StyleSheet.create({
  field: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "flex-start", // Permite que textos largos fluyan naturalmente hacia abajo
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44, // Unificamos la altura mínima para todos los campos
  },
  fieldText: {
    fontSize: 14,
    flex: 1,
  },
});

/* ─── Estilos principales ─────────────────── */
const getStyles = (theme: any, isDesktop: boolean) =>
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
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    gridItem: {
      // 48% fuerza exactamente dos columnas en desktop, 100% en móvil
      width: isDesktop ? "48%" : "100%",
    },
  });
