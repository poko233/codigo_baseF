import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { PermisoGate } from "../../../../components/PermisoGate";
import { ThemedText } from "../../../../components/ThemedText";
import { useTheme } from "../../../../theme/useTheme";

type Props = {
  onCreate: () => void;
  isMobile: boolean;
};

export default function RolHeader({ onCreate, isMobile }: Props) {
  const { theme } = useTheme();
  const colors: any = theme.colors;

  return (
    <View style={styles.container}>
      <View style={styles.breadcrumb}>
        <Ionicons name="home-outline" size={14} color={colors.primary} />

        <ThemedText style={[styles.breadcrumbText, { color: colors.text }]}>
          Inicio
        </ThemedText>

        <Ionicons name="chevron-forward" size={12} color={colors.border} />

        <ThemedText style={[styles.breadcrumbText, { color: colors.text }]}>
          Perfil Empresa
        </ThemedText>

        <Ionicons name="chevron-forward" size={12} color={colors.border} />

        <ThemedText
          style={[styles.breadcrumbActive, { color: colors.primary }]}
        >
          Roles y Módulos
        </ThemedText>
      </View>

      <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
        <View style={styles.titleBox}>
          <ThemedText
            style={[
              styles.title,
              isMobile && styles.titleMobile,
              { color: colors.text },
            ]}
          >
            Gestión de Roles y Permisos
          </ThemedText>

          <ThemedText style={[styles.subtitle, { color: colors.text }]}>
            Niveles de acceso para el personal institucional.
          </ThemedText>
        </View>

        <PermisoGate modulo="Roles" formulario="Roles" accion="Crear">
          <Pressable
            onPress={onCreate}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={colors.primaryForeground}
            />
            <ThemedText
              style={[styles.buttonText, { color: colors.primaryForeground }]}
            >
              Nuevo Rol
            </ThemedText>
          </Pressable>
        </PermisoGate>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  breadcrumbText: {
    fontSize: 12,
    opacity: 0.75,
  },
  breadcrumbActive: {
    fontSize: 12,
    fontWeight: "800",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headerRowMobile: {
    flexDirection: "column",
  },
  titleBox: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  titleMobile: {
    fontSize: 23,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.75,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontWeight: "900",
  },
});
