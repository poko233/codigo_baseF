import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@theme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PermisoGate } from "../../../components/PermisoGate";
import { ModuloCard } from "./components/ModuloCard";
import { ModuloModal } from "./components/Modulomodal";
import { useModulos } from "./hooks/useModulos";
import { Modulo } from "./types/modulo.types";

export function ModulosScreen() {
  const { theme } = useTheme();
  const c = theme.colors;

  const {
    modulos,
    loading,
    refreshing,
    onRefresh,
    createModulo,
    updateModulo,
    deleteModulo,
  } = useModulos();

  // ── Estado del modal ───────────────────────────────────────────────────────
  const [modalVisible, setModalVisible]         = useState(false);
  const [moduloEditing, setModuloEditing]       = useState<Modulo | null>(null);

  // ── Búsqueda local ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const filtered = modulos.filter((m) =>
    m.modulo.toLowerCase().includes(search.toLowerCase())
  );

  // ── Abrir modal crear ──────────────────────────────────────────────────────
  const openCreate = () => {
    setModuloEditing(null);
    setModalVisible(true);
  };

  // ── Abrir modal editar ─────────────────────────────────────────────────────
  const openEdit = (m: Modulo) => {
    setModuloEditing(m);
    setModalVisible(true);
  };

  // ── Submit unificado (crear o editar) ──────────────────────────────────────
  const handleSubmit = async (payload: any): Promise<boolean> => {
    if (moduloEditing) {
      return await updateModulo(moduloEditing.id, payload);
    }
    return await createModulo(payload);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>

      {/* ── Header ── */}
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <View>
          <Text style={[styles.pageTitle, { color: c.text }]}>Módulos</Text>
          <Text style={[styles.pageSub, { color: c.textSecondary }]}>
            {modulos.length} módulo{modulos.length !== 1 ? "s" : ""} registrados
          </Text>
        </View>
        <PermisoGate modulo="Configuracion" formulario="Modulos" accion="Crear">
          <TouchableOpacity
            onPress={openCreate}
            style={[styles.btnNuevo, { backgroundColor: c.primary }]}
          >
            <Ionicons name="add" size={18} color={c.primaryForeground} />
            <Text style={[styles.btnNuevoText, { color: c.primaryForeground }]}>
              Nuevo
            </Text>
          </TouchableOpacity>
        </PermisoGate>
      </View>

      {/* ── Buscador ── */}
      <View style={[styles.searchWrap, { backgroundColor: c.backgroundSecondary }]}>
        <View style={[styles.searchBar, { backgroundColor: c.input, borderColor: c.border }]}>
          <Ionicons name="search-outline" size={16} color={c.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar módulo..."
            placeholderTextColor={c.muted}
            style={[styles.searchInput, { color: c.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={c.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Lista ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ModuloCard
              modulo={item}
              onEdit={openEdit}
              onDelete={deleteModulo}
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="cube-outline" size={48} color={c.muted} />
              <Text style={[styles.emptyText, { color: c.muted }]}>
                {search ? "Sin resultados" : "No hay módulos aún"}
              </Text>
            </View>
          }
        />
      )}

      {/* ── Modal crear / editar ── */}
      <ModuloModal
        visible={modalVisible}
        modulo={moduloEditing}
        modulos={modulos}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  pageTitle: { fontSize: 20, fontWeight: "700" },
  pageSub:   { fontSize: 12, marginTop: 2 },
  btnNuevo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  btnNuevoText: { color: "#fff", fontWeight: "600", fontSize: 14 },
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
  list:  { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { fontSize: 14, marginTop: 12 },
});