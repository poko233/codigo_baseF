import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { moduloService } from "../modulos/services/modulo.service";
import { Modulo } from "../modulos/types/modulo.types";
import { AdminFormulario, CreateFormularioPayload, Estado } from "../types/admin.types";

const RUTA_REGEX = /^\/[a-z0-9\-_/]*$/i;

type Props = {
  visible: boolean;
  formulario?: AdminFormulario | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateFormularioPayload) => Promise<boolean>;
};

export function FormularioFormModal({
  visible,
  formulario,
  saving,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const isEdit = !!formulario;

  const [nombre, setNombre] = useState("");
  const [ruta, setRuta] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<Estado>("Activo");
  const [selectedModulos, setSelectedModulos] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const [allModulos, setAllModulos] = useState<Modulo[]>([]);
  const [loadingModulos, setLoadingModulos] = useState(false);
  const [showModuloSelector, setShowModuloSelector] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setNombre(formulario?.formulario ?? "");
    setRuta(formulario?.ruta ?? "");
    setDescripcion(formulario?.descripcion ?? "");
    setEstado(formulario?.estado ?? "Activo");
    setErrors({});
    setWarnings({});

    // Pre-seleccionar módulos del formulario
    const preSelected = new Set(
      (formulario?.modulos ?? []).map((m) => m.id),
    );
    setSelectedModulos(preSelected);

    setLoadingModulos(true);
    moduloService
      .getAll()
      .then((data) => setAllModulos(data))
      .catch(() => {})
      .finally(() => setLoadingModulos(false));
  }, [visible, formulario]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const warns: Record<string, string> = {};

    if (!nombre.trim()) errs.nombre = "El nombre del formulario es obligatorio";
    if (ruta.trim() && !RUTA_REGEX.test(ruta.trim())) {
      warns.ruta = "La ruta debería tener formato /seccion/subseccion";
    }

    setErrors(errs);
    setWarnings(warns);
    return Object.keys(errs).length === 0;
  };

  const toggleModulo = (id: number) => {
    setSelectedModulos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!validate()) return;
    const ok = await onSave({
      formulario: nombre.trim(),
      ruta: ruta.trim() || null,
      descripcion: descripcion.trim() || undefined,
      estado,
      modulos: Array.from(selectedModulos),
    });
    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kvWrapper}
        pointerEvents="box-none"
      >
        <View style={[styles.sheet, { backgroundColor: c.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: c.text }]}>
                {isEdit ? "Editar formulario" : "Nuevo formulario"}
              </Text>
              <Text style={[styles.headerSub, { color: c.textSecondary }]}>
                Define el formulario y sus módulos asociados
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {/* Nombre */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                NOMBRE <Text style={{ color: c.destructive }}>*</Text>
              </Text>
              <TextInput
                value={nombre}
                onChangeText={(t) => {
                  setNombre(t);
                  if (errors.nombre) setErrors((e) => ({ ...e, nombre: "" }));
                }}
                placeholder="Ej: Usuarios"
                placeholderTextColor={c.textMuted}
                style={[
                  styles.input,
                  {
                    borderColor: errors.nombre ? c.destructive : c.inputBorder,
                    color: c.text,
                    backgroundColor: c.input,
                  },
                ]}
              />
              {errors.nombre ? (
                <Text style={[styles.error, { color: c.destructive }]}>
                  {errors.nombre}
                </Text>
              ) : null}
            </View>

            {/* Ruta */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>RUTA</Text>
              <TextInput
                value={ruta}
                onChangeText={(t) => {
                  setRuta(t);
                  if (warnings.ruta) setWarnings((w) => ({ ...w, ruta: "" }));
                }}
                placeholder="/admin/usuarios"
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    borderColor: warnings.ruta ? c.warning : c.inputBorder,
                    color: c.text,
                    backgroundColor: c.input,
                  },
                ]}
              />
              {warnings.ruta ? (
                <Text style={[styles.warning, { color: c.warning }]}>
                  ⚠ {warnings.ruta}
                </Text>
              ) : null}
            </View>

            {/* Estado */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>ESTADO</Text>
              <View
                style={[
                  styles.switchRow,
                  { backgroundColor: c.backgroundSecondary, borderColor: c.border },
                ]}
              >
                <View>
                  <Text style={[styles.switchLabel, { color: c.text }]}>
                    {estado === "Activo" ? "Activo" : "Inactivo"}
                  </Text>
                  <Text style={[styles.switchSub, { color: c.textMuted }]}>
                    {estado === "Activo" ? "Formulario disponible" : "Formulario deshabilitado"}
                  </Text>
                </View>
                <Switch
                  value={estado === "Activo"}
                  onValueChange={(v) => setEstado(v ? "Activo" : "Inactivo")}
                  trackColor={{ false: c.border, true: c.success }}
                  thumbColor={c.primaryForeground}
                />
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>DESCRIPCIÓN</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Gestión de usuarios del sistema"
                placeholderTextColor={c.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.textarea,
                  { borderColor: c.inputBorder, color: c.text, backgroundColor: c.input },
                ]}
              />
            </View>

            {/* Módulos vinculados */}
            <View style={styles.field}>
              <View style={styles.selectorHeader}>
                <Text style={[styles.label, { color: c.textSecondary }]}>
                  MÓDULOS VINCULADOS
                </Text>
                <TouchableOpacity
                  onPress={() => setShowModuloSelector((v) => !v)}
                  style={[styles.toggleBtn, { borderColor: c.border }]}
                >
                  <Text style={[styles.toggleBtnText, { color: c.primary }]}>
                    {showModuloSelector
                      ? "Ocultar"
                      : `Seleccionar (${selectedModulos.size})`}
                  </Text>
                </TouchableOpacity>
              </View>

              {showModuloSelector && (
                <View
                  style={[
                    styles.selectorBox,
                    { borderColor: c.border, backgroundColor: c.backgroundSecondary },
                  ]}
                >
                  {loadingModulos ? (
                    <ActivityIndicator
                      size="small"
                      color={c.primary}
                      style={{ padding: 16 }}
                    />
                  ) : (
                    allModulos.map((m) => {
                      const checked = selectedModulos.has(m.id);
                      return (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => toggleModulo(m.id)}
                          style={[
                            styles.selectorItem,
                            { borderBottomColor: c.border },
                            checked && { backgroundColor: `${c.primary}10` },
                          ]}
                        >
                          <View
                            style={[
                              styles.checkBox,
                              {
                                borderColor: checked ? c.primary : c.border,
                                backgroundColor: checked ? c.primary : "transparent",
                              },
                            ]}
                          >
                            {checked && (
                              <Ionicons
                                name="checkmark"
                                size={11}
                                color={c.primaryForeground}
                              />
                            )}
                          </View>
                          <View style={styles.selectorItemContent}>
                            <Ionicons
                              name={
                                ((m.icono ?? "apps") + "-outline") as any
                              }
                              size={15}
                              color={checked ? c.primary : c.textMuted}
                            />
                            <Text style={[styles.selectorItemName, { color: c.text }]}>
                              {m.modulo}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}

              {!showModuloSelector && selectedModulos.size > 0 && (
                <View style={styles.chips}>
                  {allModulos
                    .filter((m) => selectedModulos.has(m.id))
                    .map((m) => (
                      <View
                        key={m.id}
                        style={[
                          styles.chip,
                          { backgroundColor: `${c.primary}18`, borderColor: c.primary },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: c.primary }]}>
                          {m.modulo}
                        </Text>
                        <TouchableOpacity onPress={() => toggleModulo(m.id)} hitSlop={8}>
                          <Ionicons name="close" size={12} color={c.primary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.btnCancel, { borderColor: c.border }]}
            >
              <Text style={{ color: c.textSecondary, fontWeight: "500" }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[
                styles.btnSave,
                { backgroundColor: saving ? c.textMuted : c.primary },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={c.primaryForeground} />
              ) : (
                <Ionicons
                  name={isEdit ? "checkmark-circle-outline" : "add-circle-outline"}
                  size={17}
                  color={c.primaryForeground}
                />
              )}
              <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>
                {isEdit ? "Guardar cambios" : "Crear formulario"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  kvWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 4 },
  body: { padding: 20, gap: 20 },
  field: { gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textarea: { height: 80, paddingTop: 12 },
  error: { fontSize: 12, marginTop: 2 },
  warning: { fontSize: 12, marginTop: 2 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  switchLabel: { fontSize: 14, fontWeight: "700" },
  switchSub: { fontSize: 12, marginTop: 2 },
  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  toggleBtnText: { fontSize: 12, fontWeight: "600" },
  selectorBox: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    maxHeight: 200,
  },
  selectorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  selectorItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  selectorItemName: { fontSize: 13, fontWeight: "600" },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: { fontSize: 11, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSave: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
