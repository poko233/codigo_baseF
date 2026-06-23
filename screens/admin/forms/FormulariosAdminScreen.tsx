import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../theme/useTheme";
import { AdminFormulario, CreateFormularioPayload } from "../types/admin.types";
import { FormularioFormModal } from "./FormularioFormModal";
import { useFormularios } from "./useFormularios";

export function FormulariosAdminScreen() {
  const { theme } = useTheme();
  const c = theme.colors;

  const {
    formularios,
    loading,
    saving,
    createFormulario,
    deleteFormulario,
    updateFormulario,
  } = useFormularios();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminFormulario | null>(null);

  const filtered = formularios.filter(
    (f) =>
      f.formulario.toLowerCase().includes(search.toLowerCase()) ||
      (f.ruta ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const openEdit = (item: AdminFormulario) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleSave = async (payload: CreateFormularioPayload): Promise<boolean> => {
    try {
      if (editingItem) {
        return await updateFormulario(editingItem.id, payload);
      }
      await createFormulario(payload);
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = (item: AdminFormulario) => {
    const doDelete = () => deleteFormulario(item.id);
    if (Platform.OS === "web") {
      if (globalThis.confirm?.(`¿Eliminar "${item.formulario}"?`)) doDelete();
      return;
    }
    Alert.alert(
      "Eliminar formulario",
      `¿Seguro que quieres eliminar "${item.formulario}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: doDelete },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: c.card, borderBottomColor: c.border },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: c.text }]}>Formularios</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {formularios.length} formulario{formularios.length === 1 ? "" : "s"} registrados
          </Text>
        </View>
        <TouchableOpacity
          onPress={openCreate}
          style={[styles.addButton, { backgroundColor: c.primary }]}
          accessibilityLabel="Nuevo formulario"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={18} color={c.primaryForeground} />
          <Text style={[styles.addButtonText, { color: c.primaryForeground }]}>
            Nuevo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View
        style={[
          styles.searchWrap,
          { backgroundColor: c.backgroundSecondary },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: c.input, borderColor: c.inputBorder },
          ]}
        >
          <Ionicons name="search-outline" size={16} color={c.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar formulario o ruta..."
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="document-text-outline"
                size={42}
                color={c.textMuted}
              />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                {search ? "Sin resultados" : "No hay formularios aún"}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isActivo = item.estado === "Activo";
            return (
              <View
                style={[
                  styles.row,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <View style={styles.rowMain}>
                  <View style={styles.rowTop}>
                    <Text
                      style={[styles.rowName, { color: c.text }]}
                      numberOfLines={1}
                    >
                      {item.formulario}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isActivo
                            ? `${c.success}22`
                            : `${c.textMuted}22`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isActivo ? c.success : c.textMuted },
                        ]}
                      >
                        {item.estado ?? "Activo"}
                      </Text>
                    </View>
                  </View>
                  {item.ruta ? (
                    <Text
                      style={[styles.rowRoute, { color: c.textMuted }]}
                      numberOfLines={1}
                    >
                      {item.ruta}
                    </Text>
                  ) : null}
                  {item.descripcion ? (
                    <Text
                      style={[styles.rowDesc, { color: c.textSecondary }]}
                      numberOfLines={2}
                    >
                      {item.descripcion}
                    </Text>
                  ) : null}
                  {(item.modulos?.length ?? 0) > 0 && (
                    <View style={styles.modulesRow}>
                      {item.modulos!.slice(0, 3).map((m) => (
                        <View
                          key={m.id}
                          style={[
                            styles.moduleChip,
                            { backgroundColor: `${c.primary}18`, borderColor: c.primary },
                          ]}
                        >
                          <Text style={[styles.moduleChipText, { color: c.primary }]}>
                            {m.modulo}
                          </Text>
                        </View>
                      ))}
                      {item.modulos!.length > 3 && (
                        <Text style={[styles.moduleChipText, { color: c.textMuted }]}>
                          +{item.modulos!.length - 3}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.rowActions}>
                  <TouchableOpacity
                    onPress={() => openEdit(item)}
                    style={[styles.actionBtn, { borderColor: c.border }]}
                    accessibilityLabel={`Editar ${item.formulario}`}
                    accessibilityRole="button"
                  >
                    <Ionicons name="pencil-outline" size={15} color={c.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={[styles.actionBtn, { borderColor: c.destructive }]}
                    accessibilityLabel={`Eliminar ${item.formulario}`}
                    accessibilityRole="button"
                  >
                    <Ionicons name="trash-outline" size={15} color={c.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <FormularioFormModal
        visible={modalVisible}
        formulario={editingItem}
        saving={saving}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { marginTop: 4, fontSize: 13 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addButtonText: { fontWeight: "700" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: { fontSize: 14, marginTop: 12 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  rowMain: { flex: 1, gap: 4 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowName: { flex: 1, fontSize: 14, fontWeight: "700" },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  rowRoute: { fontSize: 12, fontFamily: "monospace" },
  rowDesc: { fontSize: 13, lineHeight: 18 },
  modulesRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  moduleChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  moduleChipText: { fontSize: 10, fontWeight: "600" },
  rowActions: { flexDirection: "row", gap: 6, flexShrink: 0 },
  actionBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
