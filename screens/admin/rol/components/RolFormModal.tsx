import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../../components/ThemedText";
import { useTheme } from "../../../../theme/useTheme";
import { Rol, RolPayload } from "../types/rol.types";

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
  const colors: any = theme.colors;

  const [nombreRol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const isEditing = !!rol;

  useEffect(() => {
    if (visible) {
      setNombreRol(rol?.rol ?? "");
      setDescripcion(rol?.descripcion ?? "");
    }
  }, [visible, rol]);

  const handleSave = async () => {
    if (!nombreRol.trim()) {
      Toast.show({
        type: "error",
        text1: "Campo requerido",
        text2: "El nombre del rol es obligatorio",
      });
      return;
    }

    const ok = await onSave({
      rol: nombreRol.trim(),
      descripcion: descripcion.trim() || null,
    });

    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: colors.background || colors.secondary,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <ThemedText style={[styles.title, { color: colors.text }]}>
                {isEditing ? "Editar Rol" : "Nuevo Rol"}
              </ThemedText>

              <ThemedText style={[styles.subtitle, { color: colors.text }]}>
                Completa los datos del rol.
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              disabled={saving}
              style={[
                styles.closeButton,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Nombre del rol
            </ThemedText>

            <TextInput
              value={nombreRol}
              onChangeText={setNombreRol}
              placeholder="Ej: Administrador"
              placeholderTextColor={`${colors.text}99`}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.secondary,
                },
              ]}
            />

            <ThemedText style={[styles.label, { color: colors.text }]}>
              Descripción
            </ThemedText>

            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ej: Acceso completo al sistema"
              placeholderTextColor={`${colors.text}99`}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.secondary,
                },
              ]}
            />
          </View>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={onClose}
              disabled={saving}
              style={[
                styles.cancelButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background || colors.secondary,
                },
                saving && styles.disabled,
              ]}
            >
              <ThemedText style={[styles.cancelText, { color: colors.text }]}>
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
                saving && styles.disabled,
              ]}
            >
              {saving && (
                <ActivityIndicator
                  size="small"
                  color={colors.primaryForeground}
                />
              )}

              <ThemedText
                style={[styles.saveText, { color: colors.primaryForeground }]}
              >
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
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
    outlineStyle: "none" as any,
  },
  textArea: {
    minHeight: 110,
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
