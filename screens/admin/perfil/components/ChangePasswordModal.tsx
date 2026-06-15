import { AuthInput } from "@/screens/admin/auth/components/AuthInput";
import { useTheme } from "@/theme/useTheme";
import { BlurView } from "expo-blur";
import { X } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useChangePassword } from "../hooks/useChangePassword";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const {
    form,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    submitting,
    serverError,
    canSubmit,
  } = useChangePassword(onClose);

  // Controla la visibilidad del contenido para la animación de salida
  const [contentVisible, setContentVisible] = useState(true);

  // Cuando el modal se abre desde fuera, reseteamos el estado
  useEffect(() => {
    if (visible) {
      setContentVisible(true);
    }
  }, [visible]);

  // Al cerrar, ejecutamos la animación de salida y luego llamamos a onClose
  const handleClose = useCallback(() => {
    setContentVisible(false);
    // Esperamos a que termine la animación antes de cerrar el Modal
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Fondo blur */}
        <BlurView
          intensity={30}
          tint={theme.dark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <AnimatePresence>
          {contentVisible && (
            <MotiView
              key="modal-content"
              from={{ opacity: 0, scale: 0.98, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.98, translateY: 10 }}
              transition={{ type: "timing", duration: 250 }}
              style={[
                styles.modal,
                {
                  backgroundColor: c.modal,
                  borderColor: c.border,
                  shadowColor: "#000",
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: c.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: c.text }]}>
                      Cambiar Contraseña
                    </Text>
                    <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                      Asegura tu cuenta con una contraseña segura.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeBtn}
                  >
                    <X size={20} color={c.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Formulario */}
                <View style={styles.form}>
                  <AuthInput
                    label="Contraseña actual"
                    value={form.currentPassword}
                    onChangeText={handleChange("currentPassword")}
                    onBlur={handleBlur("currentPassword")}
                    error={errors.currentPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="••••••••"
                  />

                  <AuthInput
                    label="Nueva contraseña"
                    value={form.newPassword}
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    error={errors.newPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="Mínimo 6 caracteres"
                  />

                  <AuthInput
                    label="Repetir nueva contraseña"
                    value={form.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    error={errors.confirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="••••••••"
                  />

                  {serverError && (
                    <Text
                      style={[styles.serverError, { color: c.destructive }]}
                    >
                      {serverError}
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    style={[
                      styles.submitBtn,
                      {
                        backgroundColor: canSubmit ? c.primary : c.disabled,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    {submitting ? (
                      <ActivityIndicator
                        size="small"
                        color={c.primaryForeground}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.submitText,
                          {
                            color: canSubmit
                              ? c.primaryForeground
                              : c.disabledForeground,
                          },
                        ]}
                      >
                        Guardar Cambios
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </MotiView>
          )}
        </AnimatePresence>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "transparent",
  },
  modal: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    overflow: "hidden",
  },
  scrollContent: {},
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  serverError: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
