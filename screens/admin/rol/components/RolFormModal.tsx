import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "../../../../components/ThemedText";
import { useTheme } from "../../../../theme/useTheme";
import { Estado, Rol, RolPayload } from "../types/rol.types";

type Props = {
  visible: boolean;
  rol?: Rol | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: RolPayload) => Promise<boolean>;
};

export default function RolFormModal({
  visible,
  rol,
  saving,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const [nombreRol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<Estado>("Activo");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!rol;

  useEffect(() => {
    if (visible) {
      setNombreRol(rol?.rol ?? "");
      setDescripcion(rol?.descripcion ?? "");
      setEstado(rol?.estado ?? "Activo");
      setErrors({});
    }
  }, [visible, rol]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!nombreRol.trim()) next.rol = "El nombre del rol es obligatorio";
    if (nombreRol.trim().length > 40) next.rol = "Máximo 40 caracteres";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const ok = await onSave({
      rol: nombreRol.trim(),
      descripcion: descripcion.trim() || null,
      estado,
    });
    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.card }]}>
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <View>
              <ThemedText style={[styles.title, { color: c.text }]}>
                {isEditing ? "Editar Rol" : "Nuevo Rol"}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: c.textSecondary }]}>
                Completa los datos del rol.
              </ThemedText>
            </View>
            <Pressable
              onPress={onClose}
              disabled={saving}
              style={[styles.closeButton, { backgroundColor: c.backgroundSecondary }]}
            >
              <Ionicons name="close" size={22} color={c.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <ThemedText style={[styles.label, { color: c.textSecondary }]}>
                NOMBRE DEL ROL <ThemedText style={{ color: c.destructive }}>*</ThemedText>
              </ThemedText>
              <TextInput
                value={nombreRol}
                onChangeText={(t) => {
                  setNombreRol(t);
                  if (errors.rol) setErrors((e) => ({ ...e, rol: "" }));
                }}
                placeholder="Ej: Administrador"
                placeholderTextColor={c.textMuted}
                maxLength={40}
                style={[
                  styles.input,
                  {
                    color: c.text,
                    borderColor: errors.rol ? c.destructive : c.inputBorder,
                    backgroundColor: c.input,
                  },
                ]}
              />
              {errors.rol ? (
                <ThemedText style={[styles.errorText, { color: c.destructive }]}>
                  {errors.rol}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.field}>
              <ThemedText style={[styles.label, { color: c.textSecondary }]}>
                DESCRIPCIÓN
              </ThemedText>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Ej: Acceso completo al sistema"
                placeholderTextColor={c.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    color: c.text,
                    borderColor: c.inputBorder,
                    backgroundColor: c.input,
                  },
                ]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={[styles.label, { color: c.textSecondary }]}>
                ESTADO
              </ThemedText>
              <View
                style={[
                  styles.switchRow,
                  { backgroundColor: c.backgroundSecondary, borderColor: c.border },
                ]}
              >
                <View style={styles.switchInfo}>
                  <ThemedText style={[styles.switchLabel, { color: c.text }]}>
                    {estado === "Activo" ? "Activo" : "Inactivo"}
                  </ThemedText>
                  <ThemedText style={[styles.switchSub, { color: c.textMuted }]}>
                    {estado === "Activo"
                      ? "El rol está habilitado"
                      : "El rol está deshabilitado"}
                  </ThemedText>
                </View>
                <Switch
                  value={estado === "Activo"}
                  onValueChange={(v) => setEstado(v ? "Activo" : "Inactivo")}
                  trackColor={{ false: c.border, true: c.success }}
                  thumbColor={c.primaryForeground}
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <Pressable
              onPress={onClose}
              disabled={saving}
              style={[
                styles.cancelButton,
                { borderColor: c.border },
                saving && styles.disabled,
              ]}
            >
              <ThemedText style={[styles.cancelText, { color: c.textSecondary }]}>
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                styles.saveButton,
                { backgroundColor: c.primary },
                saving && styles.disabled,
              ]}
            >
              {saving && (
                <ActivityIndicator size="small" color={c.primaryForeground} />
              )}
              <ThemedText style={[styles.saveText, { color: c.primaryForeground }]}>
                {isEditing ? "Guardar cambios" : "Crear rol"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  switchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: "800",
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveText: {
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.55,
  },
});
