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
  isMobile: boolean;
};

export default function RolTable({
  roles,
  loading,
  deletingId,
  onEdit,
  onDelete,
  isMobile,
}: Props) {
  const { theme } = useTheme();
  const colors: any = theme.colors;

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.text }]}>
          Cargando roles...
        </ThemedText>
      </View>
    );
  }

  if (roles.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="shield-outline" size={42} color={colors.text} />
        <ThemedText style={[styles.emptyText, { color: colors.text }]}>
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
          {
            backgroundColor: colors.secondary,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.colNumber}>
          <ThemedText style={[styles.headerText, { color: colors.primary }]}>
            #
          </ThemedText>
        </View>

        <View style={styles.colRol}>
          <ThemedText style={[styles.headerText, { color: colors.primary }]}>
            ROL
          </ThemedText>
        </View>

        <View style={styles.colDescription}>
          <ThemedText style={[styles.headerText, { color: colors.primary }]}>
            DESCRIPCIÓN
          </ThemedText>
        </View>

        <View style={styles.colActions}>
          <ThemedText style={[styles.headerText, { color: colors.primary }]}>
            ACCIONES
          </ThemedText>
        </View>
      </View>

      {roles.map((item, index) => {
        const numero = String(index + 1).padStart(2, "0");

        return (
          <View
            key={item.id}
            style={[
              styles.tableRow,
              {
                backgroundColor: colors.background || colors.secondary,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.colNumber}>
              <ThemedText style={[styles.numberText, { color: colors.text }]}>
                {numero}
              </ThemedText>
            </View>

            <View style={styles.colRol}>
              <ThemedText style={[styles.rolText, { color: colors.text }]}>
                {item.rol}
              </ThemedText>
            </View>

            <View style={styles.colDescription}>
              <ThemedText
                style={[styles.descriptionText, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.descripcion || "Sin descripción"}
              </ThemedText>
            </View>

            <View style={styles.colActions}>
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => onEdit(item)}
                  style={[styles.iconButton, { borderColor: colors.border }]}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color={colors.primary}
                  />
                </Pressable>

                <Pressable
                  onPress={() => onDelete(item)}
                  disabled={deletingId === item.id}
                  style={[
                    styles.iconButton,
                    { borderColor: colors.border },
                    deletingId === item.id && styles.disabled,
                  ]}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.primary}
                    />
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
    minHeight: 54,
    paddingHorizontal: 28,
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    minHeight: 78,
    paddingHorizontal: 28,
  },

  colNumber: {
    width: 90,
    justifyContent: "center",
  },

  colRol: {
    width: 260,
    justifyContent: "center",
  },

  colDescription: {
    flex: 1,
    minWidth: 300,
    justifyContent: "center",
    paddingRight: 24,
  },

  colActions: {
    width: 170,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  numberText: {
    fontSize: 15,
    fontWeight: "900",
  },

  rolText: {
    fontSize: 15,
    fontWeight: "900",
  },

  descriptionText: {
    fontSize: 15,
    opacity: 0.78,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.5,
  },
});
