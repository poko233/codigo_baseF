import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../../theme/useTheme";
import { AVAILABLE_ICONS, Modulo } from "../types/modulo.types";

interface ModuloCardProps {
  modulo: Modulo;
  onEdit: (modulo: Modulo) => void;
  onDelete: (id: number) => void;
}

export function ModuloCard({ modulo, onEdit, onDelete }: ModuloCardProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { theme } = useTheme();
  const c = theme.colors;

  const iconData = AVAILABLE_ICONS.find((i) => i.key === modulo.icono);
  const ionicon = (iconData?.ionicon ?? "apps-outline") as any;

  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
    >
      {/* Icono */}
      <View style={styles.iconWrap}>
        <Ionicons name={ionicon} size={24} color={c.text} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.titulo, { color: c.text }]} numberOfLines={1}>
          {modulo.modulo}
        </Text>
        {modulo.descripcion ? (
          <Text
            style={[styles.desc, { color: c.textSecondary }]}
            numberOfLines={2}
          >
            {modulo.descripcion}
          </Text>
        ) : null}
        {modulo.formularios !== undefined && (
          <Text style={[styles.badge, { color: c.muted }]}>
            {modulo.formularios.length} formulario
            {modulo.formularios.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(modulo)}
          style={[styles.actionBtn, { borderColor: c.border }]}
          hitSlop={8}
        >
          <Ionicons name="pencil-outline" size={16} color={c.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setConfirmVisible(true)}
          style={[styles.actionBtn, { borderColor: c.border }]}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={16} color="#F43F5E" />
        </TouchableOpacity>
        <Modal visible={confirmVisible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setConfirmVisible(false)}
          />
          <View style={styles.modalWrapper} pointerEvents="box-none">
            <View
              style={[
                styles.modalCard,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Ionicons name="trash-outline" size={28} color={c.destructive} />
              <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>
                Eliminar módulo
              </Text>
              <Text style={{ color: c.textSecondary }}>
                ¿Eliminar "{modulo.modulo}"?
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setConfirmVisible(false)}
                  style={[styles.actionBtn, { flex: 1, borderColor: c.border }]}
                >
                  <Text style={{ color: c.text }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setConfirmVisible(false);
                    onDelete(modulo.id);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: c.destructive,
                    borderRadius: 8,
                    alignItems: "center",
                    padding: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(45,159,142,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 14,
    fontWeight: "600",
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderWidth: 0.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
});
