import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@theme";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { adminService } from "../../services/admin.service";
import { AdminFormulario } from "../../types/admin.types";
import {
  AVAILABLE_ICONS,
  CreateModuloPayload,
  Estado,
  getIconsByCategory,
  ICON_CATEGORIES,
  IconCategory,
  Modulo,
} from "../types/modulo.types";

interface ModuloModalProps {
  visible: boolean;
  modulo?: Modulo | null;
  modulos: Modulo[];
  onClose: () => void;
  onSubmit: (payload: CreateModuloPayload) => Promise<boolean>;
}

export function ModuloModal({
  visible,
  modulo,
  onClose,
  onSubmit,
}: ModuloModalProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const isEdit = !!modulo;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [iconoKey, setIconoKey] = useState<string>("home");
  const [estado, setEstado] = useState<Estado>("Activo");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Multi-select de formularios
  const [allFormularios, setAllFormularios] = useState<AdminFormulario[]>([]);
  const [selectedForms, setSelectedForms] = useState<Set<number>>(new Set());
  const [loadingForms, setLoadingForms] = useState(false);
  const [showFormSelector, setShowFormSelector] = useState(false);

  const [iconCat, setIconCat] = useState<IconCategory | "Todos">("Académico");
  const flatListRef = React.useRef<FlatList>(null);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const CATS = ["Todos", ...ICON_CATEGORIES];

  useEffect(() => {
    if (!visible) return;
    setTitulo(modulo?.modulo ?? "");
    setDescripcion(modulo?.descripcion ?? "");
    setIconoKey(modulo?.icono ?? "home");
    setEstado(modulo?.estado ?? "Activo");
    setErrors({});

    // Pre-seleccionar formularios del módulo
    const preSelected = new Set(
      (modulo?.formularios ?? []).map((f) => f.id),
    );
    setSelectedForms(preSelected);

    // Cargar todos los formularios disponibles
    setLoadingForms(true);
    adminService
      .getFormularios()
      .then((data) => setAllFormularios(data))
      .catch(() => {})
      .finally(() => setLoadingForms(false));
  }, [visible, modulo]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!titulo.trim()) e.titulo = "El título es obligatorio";
    if (titulo.trim().length > 40) e.titulo = "Máximo 40 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const scrollCats = (dir: "left" | "right") => {
    flatListRef.current?.scrollToOffset({
      offset: dir === "right" ? 999 : 0,
      animated: true,
    });
  };

  const toggleForm = (id: number) => {
    setSelectedForms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await onSubmit({
      modulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      icono: iconoKey,
      estado,
      formularios: Array.from(selectedForms),
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
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
                {isEdit ? "Editar Módulo" : "Crear Nuevo Módulo"}
              </Text>
              <Text style={[styles.headerSub, { color: c.textSecondary }]}>
                {isEdit ? "Modifica los datos del módulo" : "Define la estructura e iconografía"}
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
            {/* Título */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                TÍTULO DEL MÓDULO <Text style={{ color: c.destructive }}>*</Text>
              </Text>
              <TextInput
                value={titulo}
                onChangeText={(t) => {
                  setTitulo(t);
                  if (errors.titulo) setErrors((e) => ({ ...e, titulo: "" }));
                }}
                placeholder="Ej: Control Académico"
                placeholderTextColor={c.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: c.input,
                    color: c.text,
                    borderColor: errors.titulo ? c.destructive : c.inputBorder,
                  },
                ]}
                maxLength={40}
              />
              {errors.titulo ? (
                <Text style={[styles.errorText, { color: c.destructive }]}>
                  {errors.titulo}
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
                    {estado === "Activo" ? "Módulo visible en sidebar" : "Módulo oculto"}
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

            {/* Ícono */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                ÍCONO DEL MÓDULO
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                {showLeftArrow && (
                  <TouchableOpacity
                    onPress={() => scrollCats("left")}
                    style={[styles.arrowBtn, { borderColor: c.border, backgroundColor: c.input }]}
                  >
                    <Ionicons name="chevron-back" size={14} color={c.textSecondary} />
                  </TouchableOpacity>
                )}
                <FlatList
                  ref={flatListRef}
                  data={CATS}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
                  onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const max =
                      e.nativeEvent.contentSize.width -
                      e.nativeEvent.layoutMeasurement.width;
                    setShowLeftArrow(x > 10);
                    setShowRightArrow(x < max - 10);
                  }}
                  scrollEventThrottle={16}
                  renderItem={({ item: cat }) => {
                    const active = iconCat === cat;
                    return (
                      <TouchableOpacity
                        onPress={() => setIconCat(cat as any)}
                        style={[
                          styles.catChip,
                          {
                            backgroundColor: active ? `${c.primary}18` : c.input,
                            borderColor: active ? c.primary : c.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "500",
                            color: active ? c.primary : c.textSecondary,
                          }}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
                {showRightArrow && (
                  <TouchableOpacity
                    onPress={() => scrollCats("right")}
                    style={[styles.arrowBtn, { borderColor: c.border, backgroundColor: c.input }]}
                  >
                    <Ionicons name="chevron-forward" size={14} color={c.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={[
                  styles.iconGrid,
                  { borderColor: c.inputBorder, backgroundColor: c.input },
                ]}
              >
                {(iconCat === "Todos"
                  ? AVAILABLE_ICONS
                  : getIconsByCategory(iconCat as IconCategory)
                ).map((ic) => {
                  const selected = iconoKey === ic.key;
                  return (
                    <TouchableOpacity
                      key={ic.key}
                      onPress={() => setIconoKey(ic.key)}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor: selected ? `${c.primary}18` : "transparent",
                          borderColor: selected ? c.primary : "transparent",
                        },
                      ]}
                    >
                      <Ionicons
                        name={ic.ionicon as any}
                        size={22}
                        color={selected ? c.primary : c.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>DESCRIPCIÓN</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Detalle la función principal de este módulo..."
                placeholderTextColor={c.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.textarea,
                  { backgroundColor: c.input, color: c.text, borderColor: c.inputBorder },
                ]}
              />
            </View>

            {/* Formularios vinculados */}
            <View style={styles.field}>
              <View style={styles.formSelectorHeader}>
                <Text style={[styles.label, { color: c.textSecondary }]}>
                  FORMULARIOS VINCULADOS
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFormSelector((v) => !v)}
                  style={[styles.toggleFormBtn, { borderColor: c.border }]}
                >
                  <Text style={[styles.toggleFormBtnText, { color: c.primary }]}>
                    {showFormSelector ? "Ocultar" : `Seleccionar (${selectedForms.size})`}
                  </Text>
                </TouchableOpacity>
              </View>

              {showFormSelector && (
                <View
                  style={[
                    styles.formSelectorBox,
                    { borderColor: c.border, backgroundColor: c.backgroundSecondary },
                  ]}
                >
                  {loadingForms ? (
                    <ActivityIndicator size="small" color={c.primary} style={{ padding: 16 }} />
                  ) : (
                    allFormularios.map((f) => {
                      const checked = selectedForms.has(f.id);
                      return (
                        <TouchableOpacity
                          key={f.id}
                          onPress={() => toggleForm(f.id)}
                          style={[
                            styles.formItem,
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
                              <Ionicons name="checkmark" size={11} color={c.primaryForeground} />
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.formItemName, { color: c.text }]}>
                              {f.formulario}
                            </Text>
                            {f.ruta ? (
                              <Text style={[styles.formItemRoute, { color: c.textMuted }]}>
                                {f.ruta}
                              </Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}

              {!showFormSelector && selectedForms.size > 0 && (
                <View style={styles.selectedChips}>
                  {allFormularios
                    .filter((f) => selectedForms.has(f.id))
                    .map((f) => (
                      <View
                        key={f.id}
                        style={[styles.chip, { backgroundColor: `${c.primary}18`, borderColor: c.primary }]}
                      >
                        <Text style={[styles.chipText, { color: c.primary }]}>
                          {f.formulario}
                        </Text>
                        <TouchableOpacity onPress={() => toggleForm(f.id)} hitSlop={8}>
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
              <Text style={[styles.btnCancelText, { color: c.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.btnSubmit, { backgroundColor: c.primary }, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={isEdit ? "checkmark-circle-outline" : "add-circle-outline"}
                    size={18}
                    color={c.primaryForeground}
                  />
                  <Text style={[styles.btnSubmitText, { color: c.primaryForeground }]}>
                    {isEdit ? "Guardar cambios" : "Crear Módulo"}
                  </Text>
                </>
              )}
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
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
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
  errorText: { fontSize: 12, marginTop: 2 },
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
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    gap: 4,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  arrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  formSelectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleFormBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  toggleFormBtnText: { fontSize: 12, fontWeight: "600" },
  formSelectorBox: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    maxHeight: 200,
  },
  formItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  formItemName: { fontSize: 13, fontWeight: "600" },
  formItemRoute: { fontSize: 11, marginTop: 1 },
  selectedChips: {
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
    borderTopWidth: 0.5,
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  btnCancelText: { fontSize: 14, fontWeight: "500" },
  btnSubmit: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnSubmitText: { fontSize: 14, fontWeight: "600" },
});
