import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../../../../components/ThemedText";
import { useTheme } from "../../../../theme/useTheme";
import { Rol } from "../types/rol.types";

type Props = {
  rol: Rol;
  index: number;
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
  onPermisos?: (rol: Rol) => void;
  deleting?: boolean;
};

export default function RolCard({
  rol,
  index,
  onEdit,
  onDelete,
  onPermisos,
  deleting = false,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const numero = String(index + 1).padStart(2, "0");
  const isActivo = rol.estado === "Activo";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <ThemedText style={[styles.number, { color: c.textMuted }]}>
              #{numero}
            </ThemedText>
            <View
              style={[
                styles.badge,
                { backgroundColor: isActivo ? `${c.success}22` : `${c.textMuted}22` },
              ]}
            >
              <ThemedText
                style={[
                  styles.badgeText,
                  { color: isActivo ? c.success : c.textMuted },
                ]}
              >
                {rol.estado ?? "Activo"}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.title, { color: c.text }]}>
            {rol.rol}
          </ThemedText>

          <ThemedText
            style={[styles.description, { color: c.textSecondary }]}
            numberOfLines={2}
          >
            {rol.descripcion || "Sin descripción"}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          {onPermisos && (
            <Pressable
              onPress={() => onPermisos(rol)}
              style={[styles.iconButton, { borderColor: c.info ?? c.primary }]}
              accessibilityLabel={`Permisos de ${rol.rol}`}
              accessibilityRole="button"
            >
              <Ionicons name="key-outline" size={18} color={c.info ?? c.primary} />
            </Pressable>
          )}

          <Pressable
            onPress={() => onEdit(rol)}
            style={[styles.iconButton, { borderColor: c.border }]}
            accessibilityLabel={`Editar ${rol.rol}`}
            accessibilityRole="button"
          >
            <Ionicons name="pencil-outline" size={18} color={c.primary} />
          </Pressable>

          <Pressable
            onPress={() => onDelete(rol)}
            disabled={deleting}
            style={[
              styles.iconButton,
              { borderColor: c.destructive },
              deleting && styles.disabled,
            ]}
            accessibilityLabel={`Eliminar ${rol.rol}`}
            accessibilityRole="button"
          >
            {deleting ? (
              <ActivityIndicator size="small" color={c.destructive} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={c.destructive} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  number: {
    fontSize: 12,
    fontWeight: "800",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
