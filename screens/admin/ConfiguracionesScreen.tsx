import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/useTheme";
import { ModulosScreen } from "./modulos/Modulosscreen";
import RolScreen from "./rol/RolScreen";
import { FormularioModuloAdminScreen } from "./assignments/FormularioModuloAdminScreen";
import { ModuloRolAdminScreen } from "./assignments/ModuloRolAdminScreen";
import { AdminTabBar, AdminTabKey } from "./components/AdminTabBar";
import { FormulariosAdminScreen } from "./forms/FormulariosAdminScreen";

export function ConfiguracionesScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  const [activeTab, setActiveTab] = useState<AdminTabKey>("formularios");

  const tabs = useMemo(
    () => [
      { key: "roles" as const, label: "Roles" },
      { key: "modulos" as const, label: "Módulos" },
      { key: "formularios" as const, label: "Formularios" },
      { key: "formularioModulo" as const, label: "Formulario → Módulo" },
      { key: "moduloRol" as const, label: "Módulo → Rol" },
    ],
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: c.card, borderBottomColor: c.border },
        ]}
      >
        <Text style={[styles.title, { color: c.text }]}>Configuraciones</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Administración centralizada de roles, módulos, formularios y
          asignaciones
        </Text>
      </View>

      <AdminTabBar
        tabs={tabs}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      <View style={styles.content}>
        {activeTab === "roles" && <RolScreen />}
        {activeTab === "modulos" && <ModulosScreen />}
        {activeTab === "formularios" && <FormulariosAdminScreen />}
        {activeTab === "formularioModulo" && <FormularioModuloAdminScreen />}
        {activeTab === "moduloRol" && <ModuloRolAdminScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
});
