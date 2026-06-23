import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../../../../components/ThemedText";
import { useTheme } from "../../../../theme/useTheme";
import { Rol } from "../types/rol.types";
import RolCard from "./RolCard";

type Props = {
  roles: Rol[];
  loading: boolean;
  deletingId: number | null;
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
  onPermisos: (rol: Rol) => void;
  isMobile: boolean;
};

export default function RolTable({
  roles,
  loading,
  deletingId,
  onEdit,
  onDelete,
  onPermisos,
  isMobile,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={c.primary} />
        <ThemedText style={[styles.loadingText, { color: c.text }]}>
          Cargando roles...
        </ThemedText>
      </View>
    );
  }

  if (roles.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="shield-outline" size={42} color={c.textMuted} />
        <ThemedText style={[styles.emptyText, { color: c.textSecondary }]}>
          No hay roles registrados
        </ThemedText>
      </View>
    );
  }

  if (isMobile) {
    return (
      <View style={styles.mobileList}>
        {roles.map((item, index) => (
          <RolCard
            key={item.id}
            rol={item}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onPermisos={onPermisos}
            deleting={deletingId === item.id}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.tableWrapper}>
      <View
        style={[
          styles.tableHeader,
          { backgroundColor: c.backgroundSecondary, borderBottomColor: c.border },
        ]}
      >
        <View style={styles.colNumber}>
          <ThemedText style={[styles.headerText, { color: c.primary }]}>#</ThemedText>
        </View>
        <View style={styles.colRol}>
          <ThemedText style={[styles.headerText, { color: c.primary }]}>ROL</ThemedText>
        </View>
        <View style={styles.colEstado}>
          <ThemedText style={[styles.headerText, { color: c.primary }]}>ESTADO</ThemedText>
        </View>
        <View style={styles.colDescription}>
          <ThemedText style={[styles.headerText, { color: c.primary }]}>DESCRIPCIÓN</ThemedText>
        </View>
        <View style={styles.colActions}>
          <ThemedText style={[styles.headerText, { color: c.primary }]}>ACCIONES</ThemedText>
        </View>
      </View>

      {roles.map((item, index) => {
        const numero = String(index + 1).padStart(2, "0");
        const isActivo = item.estado === "Activo";

        return (
          <View
            key={item.id}
            style={[
              styles.tableRow,
              { backgroundColor: c.card, borderBottomColor: c.border },
            ]}
          >
            <View style={styles.colNumber}>
              <ThemedText style={[styles.numberText, { color: c.text }]}>
                {numero}
              </ThemedText>
            </View>

            <View style={styles.colRol}>
              <ThemedText style={[styles.rolText, { color: c.text }]}>
                {item.rol}
              </ThemedText>
            </View>

            <View style={styles.colEstado}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActivo
                      ? `${c.success}22`
                      : `${c.textMuted}22`,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.badgeText,
                    { color: isActivo ? c.success : c.textMuted },
                  ]}
                >
                  {item.estado ?? "Activo"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.colDescription}>
              <ThemedText
                style={[styles.descriptionText, { color: c.textSecondary }]}
                numberOfLines={1}
              >
                {item.descripcion || "Sin descripción"}
              </ThemedText>
            </View>

            <View style={styles.colActions}>
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => onPermisos(item)}
                  style={[styles.iconButton, { borderColor: c.info ?? c.primary }]}
                  accessibilityLabel={`Permisos de ${item.rol}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="key-outline" size={17} color={c.info ?? c.primary} />
                </Pressable>

                <Pressable
                  onPress={() => onEdit(item)}
                  style={[styles.iconButton, { borderColor: c.border }]}
                  accessibilityLabel={`Editar ${item.rol}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="pencil-outline" size={17} color={c.primary} />
                </Pressable>

                <Pressable
                  onPress={() => onDelete(item)}
                  disabled={deletingId === item.id}
                  style={[
                    styles.iconButton,
                    { borderColor: c.destructive },
                    deletingId === item.id && styles.disabled,
                  ]}
                  accessibilityLabel={`Eliminar ${item.rol}`}
                  accessibilityRole="button"
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color={c.destructive} />
                  ) : (
                    <Ionicons name="trash-outline" size={17} color={c.destructive} />
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    paddingVertical: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.75,
  },
  emptyBox: {
    paddingVertical: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontWeight: "800",
    opacity: 0.75,
  },
  mobileList: {
    padding: 16,
  },
  tableWrapper: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    minHeight: 48,
    paddingHorizontal: 20,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    minHeight: 72,
    paddingHorizontal: 20,
  },
  colNumber: {
    width: 56,
    justifyContent: "center",
  },
  colRol: {
    width: 180,
    justifyContent: "center",
  },
  colEstado: {
    width: 100,
    justifyContent: "center",
  },
  colDescription: {
    flex: 1,
    minWidth: 200,
    justifyContent: "center",
    paddingRight: 16,
  },
  colActions: {
    width: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "900",
  },
  rolText: {
    fontSize: 14,
    fontWeight: "800",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  descriptionText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
