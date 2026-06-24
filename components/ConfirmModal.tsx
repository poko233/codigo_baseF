import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useConfirmStore } from "../store/confirmStore";
import { useTheme } from "../theme/useTheme";

export const ConfirmModal: React.FC = () => {
  const { theme } = useTheme();
  const c = theme.colors as any;

  const { visible, options, handleConfirm, handleCancel } = useConfirmStore();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const variantColor = (): string => {
    switch (options?.variant) {
      case "danger":   return c.destructive  ?? "#EF4444";
      case "success":  return c.success      ?? "#10B981";
      case "warning":  return c.warning      ?? "#F59E0B";
      case "info":     return c.info         ?? "#3B82F6";
      default:         return c.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.backdrop, { opacity, backgroundColor: c.overlay ?? "rgba(0,0,0,0.5)" }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />

        <View
          style={[
            styles.card,
            { backgroundColor: c.modal ?? c.card, borderColor: c.border },
          ]}
        >
          <Text style={[styles.title, { color: c.text }]}>
            {options?.title ?? "¿Confirmar?"}
          </Text>

          {options?.message ? (
            <Text style={[styles.message, { color: c.textSecondary }]}>
              {options.message}
            </Text>
          ) : null}

          <View style={styles.btnRow}>
            <Pressable
              onPress={handleCancel}
              style={[styles.btn, { backgroundColor: c.input ?? c.backgroundSecondary, borderColor: c.border }]}
            >
              <Text style={[styles.btnText, { color: c.text }]}>
                {options?.cancelText ?? "Cancelar"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              style={[styles.btn, styles.btnConfirm, { backgroundColor: variantColor(), borderColor: variantColor() }]}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>
                {options?.confirmText ?? "Confirmar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnConfirm: {
    borderWidth: 0,
  },
  btnText: {
    fontWeight: "700",
    fontSize: 14,
  },
});
