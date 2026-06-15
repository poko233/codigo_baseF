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
  deleting?: boolean;
};

export default function RolCard({
  rol,
  index,
  onEdit,
  onDelete,
  deleting = false,
}: Props) {
  const { theme } = useTheme();
  const colors: any = theme.colors;
  const numero = String(index + 1).padStart(2, "0");

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background || colors.secondary,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <ThemedText style={[styles.number, { color: colors.text }]}>
            #{numero}
          </ThemedText>

          <ThemedText style={[styles.title, { color: colors.text }]}>
            {rol.rol}
          </ThemedText>

          <ThemedText
            style={[styles.description, { color: colors.text }]}
            numberOfLines={2}
          >
            {rol.descripcion || "Sin descripción"}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => onEdit(rol)}
            style={[styles.iconButton, { borderColor: colors.border }]}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          </Pressable>

          <Pressable
            onPress={() => onDelete(rol)}
            disabled={deleting}
            style={[
              styles.iconButton,
              { borderColor: colors.border },
              deleting && styles.disabled,
            ]}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={colors.primary} />
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
  number: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    opacity: 0.6,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.75,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
