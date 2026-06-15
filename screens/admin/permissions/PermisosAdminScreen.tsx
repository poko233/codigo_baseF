import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../theme/useTheme";
import { useRoles } from "../../rol/hooks/useRoles";
import { adminService } from "../services/admin.service";
import {
    PermissionAction,
    PermissionMatrixItem,
} from "../types/admin.types";

const actions: PermissionAction[] = ["view", "create", "update", "delete"];

export function PermisosAdminScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const { roles, loading: rolesLoading } = useRoles();

  const [roleId, setRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<PermissionMatrixItem[]>([]);

  useEffect(() => {
    if (!roles.length || roleId) return;
    setRoleId(roles[0].id);
  }, [roles, roleId]);

  useEffect(() => {
    if (!roleId) return;
    (async () => {
      setLoading(true);
      try {
        const matrix = await adminService.getPermissionMatrix(roleId);
        setRows(matrix.rows);
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message || "No se pudo cargar la matriz de permisos",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [roleId]);

  const groupedRows = useMemo(() => {
    return rows.reduce<Record<string, PermissionMatrixItem[]>>((acc, row) => {
      acc[row.moduleName] = [...(acc[row.moduleName] || []), row];
      return acc;
    }, {});
  }, [rows]);

  const toggle = (formId: number, action: PermissionAction) => {
    setRows((prev) =>
      prev.map((row) =>
        row.formId === formId
          ? { ...row, actions: { ...row.actions, [action]: !row.actions[action] } }
          : row,
      ),
    );
  };

  const save = async () => {
    if (!roleId) return;
    try {
      setSaving(true);
      await adminService.savePermissionMatrix(roleId, rows);
      Toast.show({
        type: "success",
        text1: "Permisos actualizados",
        text2: "La matriz de permisos se guardó correctamente",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudieron guardar los permisos",
      });
    } finally {
      setSaving(false);
    }
  };

  if (rolesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}> 
      <ScrollView horizontal contentContainerStyle={styles.scrollX}>
        <View style={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleRow}>
            {roles.map((r) => {
              const active = r.id === roleId;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.roleChip,
                    { backgroundColor: active ? c.primary : c.secondary, borderColor: c.border },
                  ]}
                  onPress={() => setRoleId(r.id)}
                >
                  <Text style={{ color: active ? c.primaryForeground : c.text, fontWeight: "700" }}>
                    {r.rol}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={c.primary} />
            </View>
          ) : (
            Object.entries(groupedRows).map(([moduleName, moduleRows]) => (
              <View key={moduleName} style={[styles.moduleCard, { borderColor: c.border, backgroundColor: c.card }]}> 
                <Text style={[styles.moduleTitle, { color: c.text }]}>{moduleName}</Text>

                {moduleRows.map((row) => (
                  <View key={row.formId} style={[styles.row, { borderTopColor: c.border }]}> 
                    <Text style={[styles.formName, { color: c.text }]}>{row.formName}</Text>
                    <View style={styles.actions}>
                      {actions.map((action) => {
                        const active = row.actions[action];
                        return (
                          <TouchableOpacity
                            key={`${row.formId}-${action}`}
                            onPress={() => toggle(row.formId, action)}
                            style={[
                              styles.action,
                              {
                                backgroundColor: active ? c.success : c.secondary,
                                borderColor: c.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name={active ? "checkmark" : "close"}
                              size={14}
                              color={active ? c.primaryForeground : c.textSecondary}
                            />
                            <Text style={{ color: active ? c.primaryForeground : c.textSecondary, fontSize: 12 }}>
                              {action}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}

          <TouchableOpacity
            disabled={saving || !roleId}
            onPress={save}
            style={[
              styles.saveButton,
              {
                backgroundColor: saving ? c.muted : c.primary,
              },
            ]}
          >
            <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollX: { flexGrow: 1 },
  content: {
    flex: 1,
    minWidth: 900,
    padding: 16,
    gap: 12,
  },
  roleRow: {
    gap: 8,
  },
  roleChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moduleCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  formName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  action: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  saveButton: {
    alignSelf: "flex-end",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120,
  },
});
