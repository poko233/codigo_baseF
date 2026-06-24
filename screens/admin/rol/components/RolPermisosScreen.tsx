import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useConfirm } from "../../../../hooks/useConfirm";
import { useTheme } from "../../../../theme/useTheme";
import { moduloService } from "../../modulos/services/modulo.service";
import { Modulo } from "../../modulos/types/modulo.types";
import { modulosEventBus } from "../../events/modulosEventBus";
import { rolService } from "../services/rol.service";
import { PermisoSync, Rol } from "../types/rol.types";

// TODO: reemplazar con GET /acciones cuando el endpoint exista en el backend
const ACCIONES = [
  { id: 1, label: "V", fullLabel: "Ver" },
  { id: 2, label: "C", fullLabel: "Crear" },
  { id: 3, label: "E", fullLabel: "Editar" },
  { id: 4, label: "D", fullLabel: "Eliminar" },
] as const;

type Props = {
  rol: Rol;
  onBack: () => void;
};

export function RolPermisosScreen({ rol, onBack }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const confirm = useConfirm();

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // { id_formulario -> Set<id_accion> }
  const [permsMap, setPermsMap] = useState<Record<number, Set<number>>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      moduloService.getAll(),
      rolService.getPermisos(rol.id),
    ])
      .then(([mods, rolPerms]) => {
        if (cancelled) return;
        setModulos(mods.filter((m) => (m.formularios?.length ?? 0) > 0));

        const map: Record<number, Set<number>> = {};
        for (const modulo of rolPerms.permisos ?? []) {
          for (const form of modulo.formularios ?? []) {
            map[form.id_formulario] = new Set(
              // El backend puede usar id_accion o id
              form.acciones.map((a) => a.id_accion ?? a.id ?? 0).filter(Boolean),
            );
          }
        }
        setPermsMap(map);

        // Expandir el primero por defecto
        if (mods.length > 0) {
          setExpanded(new Set([mods[0].id]));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        Toast.show({ type: "error", text1: "Error al cargar", text2: err.message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [rol.id]);

  const toggleExpand = (moduloId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(moduloId) ? next.delete(moduloId) : next.add(moduloId);
      return next;
    });
  };

  const toggle = (id_formulario: number, id_accion: number) => {
    setHasChanges(true);
    setPermsMap((prev) => {
      const current = new Set(prev[id_formulario] ?? []);

      if (current.has(id_accion)) {
        current.delete(id_accion);
        // Desmarcar Ver → limpiar todo el formulario
        if (id_accion === 1) current.clear();
      } else {
        current.add(id_accion);
        // Marcar algo distinto a Ver → auto-marcar Ver
        if (id_accion !== 1 && !current.has(1)) {
          current.add(1);
          Toast.show({
            type: "info",
            text1: "Se activó 'Ver' automáticamente",
            visibilityTime: 2000,
          });
        }
      }

      return { ...prev, [id_formulario]: current };
    });
  };

  const bulkSelectAll = (moduloId: number) => {
    const modulo = modulos.find((m) => m.id === moduloId);
    if (!modulo) return;
    setPermsMap((prev) => {
      const next = { ...prev };
      for (const form of modulo.formularios ?? []) {
        next[form.id] = new Set([1, 2, 3, 4]);
      }
      return next;
    });
    setHasChanges(true);
  };

  const bulkSelectVer = (moduloId: number) => {
    const modulo = modulos.find((m) => m.id === moduloId);
    if (!modulo) return;
    setPermsMap((prev) => {
      const next = { ...prev };
      for (const form of modulo.formularios ?? []) {
        next[form.id] = new Set([1]);
      }
      return next;
    });
    setHasChanges(true);
  };

  const bulkClear = (moduloId: number) => {
    const modulo = modulos.find((m) => m.id === moduloId);
    if (!modulo) return;
    setPermsMap((prev) => {
      const next = { ...prev };
      for (const form of modulo.formularios ?? []) {
        next[form.id] = new Set();
      }
      return next;
    });
    setHasChanges(true);
  };

  const buildPayload = (): PermisoSync[] => {
    const result: PermisoSync[] = [];
    for (const modulo of modulos) {
      for (const form of modulo.formularios ?? []) {
        const actions = permsMap[form.id];
        if (actions && actions.size > 0) {
          result.push({
            id_modulo: modulo.id,
            id_formulario: form.id,
            acciones: Array.from(actions),
          });
        }
      }
    }
    return result;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await rolService.syncPermisos(rol.id, buildPayload());
      Toast.show({ type: "success", text1: "Permisos guardados correctamente" });
      modulosEventBus.emit();
      setHasChanges(false);
      onBack();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = async () => {
    if (!hasChanges) { onBack(); return; }
    const ok = await confirm({
      title: "Cambios sin guardar",
      message: "¿Quieres salir sin guardar los cambios?",
      variant: "warning",
      confirmText: "Salir sin guardar",
      cancelText: "Seguir editando",
    });
    if (ok) onBack();
  };

  const totalForms = modulos.reduce(
    (sum, m) => sum + (m.formularios?.length ?? 0),
    0,
  );
  const selectedForms = modulos.reduce((sum, m) => {
    return (
      sum +
      (m.formularios ?? []).filter((f) => {
        const a = permsMap[f.id];
        return a && a.size > 0;
      }).length
    );
  }, 0);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c.textSecondary }]}>
          Cargando permisos...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backBtn, { borderColor: c.border }]}
          accessibilityLabel="Volver a roles"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={18} color={c.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
            {rol.rol}
          </Text>
          {rol.descripcion ? (
            <Text style={[styles.headerSub, { color: c.textSecondary }]} numberOfLines={1}>
              {rol.descripcion}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            { backgroundColor: saving ? c.textMuted : c.primary },
          ]}
          accessibilityLabel="Guardar permisos"
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator size="small" color={c.primaryForeground} />
          ) : (
            <Ionicons name="checkmark" size={16} color={c.primaryForeground} />
          )}
          <Text style={[styles.saveBtnText, { color: c.primaryForeground }]}>
            {saving ? "Guardando..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Resumen ── */}
      <View
        style={[
          styles.summary,
          { backgroundColor: c.backgroundSecondary, borderBottomColor: c.border },
        ]}
      >
        <Ionicons name="shield-checkmark-outline" size={16} color={c.primary} />
        <Text style={[styles.summaryText, { color: c.textSecondary }]}>
          <Text style={{ color: c.primary, fontWeight: "700" }}>
            {selectedForms}
          </Text>
          {" de "}{totalForms} formularios con algún permiso
        </Text>
        {hasChanges && (
          <View style={[styles.changedBadge, { backgroundColor: `${c.warning}22` }]}>
            <Text style={[styles.changedText, { color: c.warning }]}>Sin guardar</Text>
          </View>
        )}
      </View>

      {/* ── Leyenda ── */}
      <View style={[styles.legend, { borderBottomColor: c.border }]}>
        {ACCIONES.map((a) => (
          <View key={a.id} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: getAccionColor(a.id, c) }]}
            />
            <Text style={[styles.legendText, { color: c.textSecondary }]}>
              {a.fullLabel}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Acordeón de módulos ── */}
      <ScrollView contentContainerStyle={styles.list}>
        {modulos.map((modulo) => {
          const isOpen = expanded.has(modulo.id);
          const forms = modulo.formularios ?? [];
          const selCount = forms.filter((f) => {
            const a = permsMap[f.id];
            return a && a.size > 0;
          }).length;

          return (
            <View
              key={modulo.id}
              style={[styles.moduleCard, { backgroundColor: c.card, borderColor: c.border }]}
            >
              {/* ── Cabecera del módulo ── */}
              <TouchableOpacity
                onPress={() => toggleExpand(modulo.id)}
                style={styles.moduleHeader}
                activeOpacity={0.7}
              >
                <View style={[styles.moduleIcon, { backgroundColor: `${c.primary}18` }]}>
                  <Ionicons
                    name={(modulo.icono ?? "apps") + "-outline" as any}
                    size={18}
                    color={c.primary}
                  />
                </View>

                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleName, { color: c.text }]}>
                    {modulo.modulo}
                  </Text>
                  <Text style={[styles.moduleCount, { color: c.textMuted }]}>
                    {selCount}/{forms.length} formularios
                  </Text>
                </View>

                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={c.textMuted}
                />
              </TouchableOpacity>

              {/* ── Contenido expandible ── */}
              {isOpen && (
                <MotiView
                  from={{ opacity: 0, translateY: -6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 180 }}
                >
                  {/* Chips de selección masiva */}
                  <View
                    style={[styles.bulkRow, { borderTopColor: c.border, backgroundColor: c.backgroundSecondary }]}
                  >
                    <TouchableOpacity
                      onPress={() => bulkSelectVer(modulo.id)}
                      style={[styles.bulkChip, { borderColor: c.border }]}
                    >
                      <Text style={[styles.bulkChipText, { color: c.textSecondary }]}>
                        Solo Ver
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => bulkSelectAll(modulo.id)}
                      style={[styles.bulkChip, { borderColor: c.border }]}
                    >
                      <Text style={[styles.bulkChipText, { color: c.textSecondary }]}>
                        Marcar todo
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => bulkClear(modulo.id)}
                      style={[styles.bulkChip, { borderColor: c.destructive }]}
                    >
                      <Text style={[styles.bulkChipText, { color: c.destructive }]}>
                        Limpiar
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Cabecera de columnas */}
                  <View style={[styles.colHeader, { borderTopColor: c.border }]}>
                    <Text style={[styles.colHeaderForm, { color: c.textMuted }]}>
                      FORMULARIO
                    </Text>
                    <View style={styles.colHeaderActions}>
                      {ACCIONES.map((a) => (
                        <Text
                          key={a.id}
                          style={[styles.colHeaderAction, { color: c.textMuted }]}
                        >
                          {a.fullLabel}
                        </Text>
                      ))}
                    </View>
                  </View>

                  {/* Filas de formularios */}
                  {forms.map((form, idx) => {
                    const formActions = permsMap[form.id] ?? new Set<number>();
                    const isLast = idx === forms.length - 1;

                    return (
                      <View
                        key={form.id}
                        style={[
                          styles.formRow,
                          {
                            borderTopColor: c.border,
                            borderBottomColor: isLast ? "transparent" : c.border,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.formName, { color: c.text }]}
                          numberOfLines={2}
                        >
                          {form.formulario}
                        </Text>

                        <View style={styles.checkboxRow}>
                          {ACCIONES.map((accion) => {
                            const checked = formActions.has(accion.id);
                            const color = getAccionColor(accion.id, c);

                            return (
                              <TouchableOpacity
                                key={accion.id}
                                onPress={() => toggle(form.id, accion.id)}
                                style={[
                                  styles.checkbox,
                                  {
                                    backgroundColor: checked ? color : c.backgroundSecondary,
                                    borderColor: checked ? color : c.border,
                                  },
                                ]}
                                accessibilityLabel={`${accion.fullLabel} para ${form.formulario}`}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked }}
                              >
                                {checked ? (
                                  <Ionicons name="checkmark" size={12} color="#fff" />
                                ) : (
                                  <Text style={[styles.checkboxLabel, { color: c.textMuted }]}>
                                    {accion.label}
                                  </Text>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </MotiView>
              )}
            </View>
          );
        })}

        {modulos.length === 0 && (
          <View style={styles.emptyCenter}>
            <Ionicons name="cube-outline" size={42} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              No hay módulos con formularios configurados
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getAccionColor(id: number, c: any): string {
  switch (id) {
    case 1: return c.info ?? "#3B82F6";
    case 2: return c.success ?? "#10B981";
    case 3: return c.warning ?? "#F59E0B";
    case 4: return c.destructive ?? "#EF4444";
    default: return c.primary;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    flexShrink: 0,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  summaryText: {
    fontSize: 13,
    flex: 1,
  },
  changedBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  changedText: {
    fontSize: 11,
    fontWeight: "700",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
  },
  list: {
    padding: 12,
    gap: 10,
    paddingBottom: 40,
  },
  moduleCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: "800",
  },
  moduleCount: {
    fontSize: 12,
    marginTop: 2,
  },
  bulkRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  bulkChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bulkChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  colHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  colHeaderForm: {
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  colHeaderActions: {
    flexDirection: "row",
    gap: 6,
  },
  colHeaderAction: {
    width: 44,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
    minHeight: 52,
  },
  formName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 6,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyCenter: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
});
