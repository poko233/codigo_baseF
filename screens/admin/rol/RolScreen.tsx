import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import RolFormModal from "./components/RolFormModal";
import RolHeader from "./components/RolHeader";
import RolSearchBar from "./components/RolSearchBar";
import RolTable from "./components/RolTable";
import RolThemeToggle from "./components/RolThemeToggle";
import { useRoles } from "./hooks/useRoles";
import { Rol, RolPayload } from "./types/rol.types";
export default function RolScreen() {
  const { theme } = useTheme();
  const colors: any = theme.colors;

  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const {
    filteredRoles,
    loading,
    saving,
    deletingId,
    search,
    setSearch,
    createRol,
    updateRol,
    deleteRol,
  } = useRoles();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);

  const openCreate = () => {
    setSelectedRol(null);
    setModalVisible(true);
  };

  const openEdit = (rol: Rol) => {
    setSelectedRol(rol);
    setModalVisible(true);
  };

  const handleSave = async (payload: RolPayload) => {
    if (selectedRol) {
      return await updateRol(selectedRol.id, payload);
    }

    return await createRol(payload);
  };

  const handleDelete = (rol: Rol) => {
    const eliminar = () => deleteRol(rol.id);

    if (Platform.OS === "web") {
      const ok = globalThis.confirm?.(`¿Eliminar el rol "${rol.rol}"?`);
      if (ok) eliminar();
      return;
    }

    Alert.alert(
      "Eliminar rol",
      `¿Seguro que quieres eliminar el rol "${rol.rol}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: eliminar },
      ],
    );
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background || colors.secondary },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isMobile && styles.contentMobile,
        ]}
      >
        <RolHeader onCreate={openCreate} isMobile={isMobile} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.background || colors.secondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[styles.cardHeader, { borderBottomColor: colors.border }]}
          >
            <View>
              <ThemedText style={[styles.cardTitle, { color: colors.primary }]}>
                Listado Roles
              </ThemedText>

              <View
                style={[
                  styles.cardUnderline,
                  { backgroundColor: colors.primary },
                ]}
              />
            </View>

            <View style={styles.headerRight}>
              <RolThemeToggle />

              <View style={styles.counter}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.primary}
                />

                <ThemedText
                  style={[styles.counterText, { color: colors.text }]}
                >
                  {filteredRoles.length} roles
                </ThemedText>
              </View>
            </View>
          </View>

          <RolSearchBar value={search} onChangeText={setSearch} />

          <RolTable
            roles={filteredRoles}
            loading={loading}
            deletingId={deletingId}
            onEdit={openEdit}
            onDelete={handleDelete}
            isMobile={isMobile}
          />

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.footerText, { color: colors.text }]}>
              Mostrando {filteredRoles.length} roles
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      <RolFormModal
        visible={modalVisible}
        rol={selectedRol}
        saving={saving}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingBottom: 60,
  },
  contentMobile: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    fontWeight: "900",
    fontSize: 15,
  },
  cardUnderline: {
    width: 140,
    height: 3,
    borderRadius: 999,
    marginTop: 14,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterText: {
    fontSize: 14,
    fontWeight: "800",
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
