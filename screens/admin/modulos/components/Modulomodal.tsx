import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@theme"; // ajusta la ruta a tu contexto
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  AVAILABLE_ICONS,
  CreateModuloPayload,
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

  const [titulo, setTitulo]           = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [iconoKey, setIconoKey]       = useState<string>("home");
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setTitulo(modulo?.modulo ?? "");
      setDescripcion(modulo?.descripcion ?? "");
      setIconoKey(modulo?.icono ?? "home");
      setErrors({});
    }
  }, [visible, modulo]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!titulo.trim()) e.titulo = "El título es obligatorio";
    if (titulo.trim().length > 40) e.titulo = "Máximo 40 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const [iconCat, setIconCat] = useState<IconCategory | "Todos">("Académico");
  const flatListRef = React.useRef<FlatList>(null);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showLeftArrow, setShowLeftArrow]   = useState(false);

  const CATS = ["Todos", ...ICON_CATEGORIES];

  const scrollCats = (dir: "left" | "right") => {
    flatListRef.current?.scrollToOffset({
      offset: dir === "right" ? 999 : 0,
      animated: true,
    });
  };
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await onSubmit({
      modulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      icono: iconoKey,
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
      {/* Fondo oscuro */}
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

          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: c.text }]}>
                {isEdit ? "Editar Módulo" : "Crear Nuevo Módulo"}
              </Text>
              <Text style={[styles.headerSub, { color: c.textSecondary }]}>
                {isEdit
                  ? "Modifica los datos del módulo"
                  : "Defina la estructura e iconografía"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}  
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                TÍTULO DEL MÓDULO <Text style={{ color: "#F43F5E" }}>*</Text>
              </Text>
              <TextInput
                value={titulo}
                onChangeText={(t) => {
                  setTitulo(t);
                  if (errors.titulo) setErrors((e) => ({ ...e, titulo: "" }));
                }}
                placeholder="Ej: Control Académico"
                placeholderTextColor={c.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: c.input,
                    color: c.text,
                    borderColor: errors.titulo ? "#F43F5E" : c.border,
                  },
                ]}
                maxLength={40}
              />
              {errors.titulo ? (
                <Text style={styles.errorText}>{errors.titulo}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                ÍCONO DEL MÓDULO
              </Text>

              {/* Tabs de categoría */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
  
              {/* Flecha izquierda */}
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
                          backgroundColor: active ? "rgba(45,159,142,0.15)" : c.input,
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

              {/* Flecha derecha */}
              {showRightArrow && (
                <TouchableOpacity
                  onPress={() => scrollCats("right")}
                  style={[styles.arrowBtn, { borderColor: c.border, backgroundColor: c.input }]}
                >
                  <Ionicons name="chevron-forward" size={14} color={c.textSecondary} />
                </TouchableOpacity>
              )}

            </View>

              {/* Grid de íconos */}
              <View
                style={[
                  styles.iconGrid,
                  { borderColor: c.border, backgroundColor: c.input },
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
                          backgroundColor: selected
                            ? "rgba(45,159,142,0.15)"
                            : "transparent",
                          borderColor: selected ? c.primary : "transparent",
                        },
                      ]}
                    >
                      <Ionicons
                        name={ic.ionicon as any}
                        size={22}
                        color={selected ? c.primary : c.muted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                DESCRIPCIÓN
              </Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Detalle la función principal de este módulo..."
                placeholderTextColor={c.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.textarea,
                  { backgroundColor: c.input, color: c.text, borderColor: c.border },
                ]}
              />
            </View>

          </ScrollView>

          {/* ── Footer con botones ── */}
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
                    color={c.textInverse}
                  />
                  <Text style={[styles.btnSubmitText, { color: c.textInverse }]}>
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
    borderRadius: 16,          
    maxHeight: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    padding: 20,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textarea: {
    height: 90,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#F43F5E",
    marginTop: 2,
  },
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
  btnCancelText: {
    fontSize: 14,
    fontWeight: "500",
  },
  btnSubmit: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnSubmitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
});