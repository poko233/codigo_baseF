// components/Sidebar/SidebarCompanySelector.tsx
import { Building2, ChevronDown, Store } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../theme/useTheme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SidebarCompanySelector: React.FC = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const {
    user,
    empresaId,
    empresaNombre,
    sucursalId,
    changeEmpresa,
    changeSucursal,
  } = useAuth();

  const [empresaExpanded, setEmpresaExpanded] = useState(false);
  const [sucursalExpanded, setSucursalExpanded] = useState(false);

  const empresas = user?.empresas ?? [];
  // ⚠️ Las sucursales pueden estar desactualizadas después de cambiar de empresa
  const sucursales = user?.sucursales ?? [];

  const toggleEmpresa = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEmpresaExpanded((v) => !v);
    if (sucursalExpanded) setSucursalExpanded(false);
  }, [sucursalExpanded]);

  const toggleSucursal = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSucursalExpanded((v) => !v);
    if (empresaExpanded) setEmpresaExpanded(false);
  }, [empresaExpanded]);

  const handleSelectEmpresa = useCallback(
    (id: number, nombre: string) => {
      setEmpresaExpanded(false);
      changeEmpresa(id, nombre);
    },
    [changeEmpresa],
  );

  const handleSelectSucursal = useCallback(
    (id: number) => {
      setSucursalExpanded(false);
      changeSucursal(id);
    },
    [changeSucursal],
  );

  // Animaciones de altura/opacidad para los desplegables
  const empresaAnimStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(empresaExpanded ? 300 : 0, { duration: 200 }),
    opacity: withTiming(empresaExpanded ? 1 : 0, { duration: 150 }),
  }));

  const sucursalAnimStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(sucursalExpanded ? 300 : 0, { duration: 200 }),
    opacity: withTiming(sucursalExpanded ? 1 : 0, { duration: 150 }),
  }));

  // Texto que se muestra cuando no hay sucursal seleccionada
  const sucursalLabel = sucursalId
    ? (sucursales.find((s) => s.id === sucursalId)?.sucursal ?? "—")
    : "Seleccionar sucursal";

  return (
    <View style={styles.container}>
      {/* ─── Selector de Empresa (principal) ─── */}
      <Pressable
        onPress={toggleEmpresa}
        style={({ pressed }) => [
          styles.companyBtn,
          {
            backgroundColor: pressed ? c.primary + "12" : "transparent",
            borderBottomColor: c.border,
          },
        ]}
        accessibilityLabel="Cambiar empresa"
      >
        <View style={[styles.companyIcon, { backgroundColor: c.primary }]}>
          <Building2 size={16} color={c.primaryForeground} />
        </View>
        <Text style={[styles.companyName, { color: c.text }]} numberOfLines={1}>
          {empresaNombre || "TECNOLOGICOSF"}
        </Text>
        <ChevronDown
          size={14}
          color={c.textSecondary}
          style={{
            transform: [{ rotate: empresaExpanded ? "180deg" : "0deg" }],
          }}
        />
      </Pressable>

      {/* Lista de empresas */}
      <Animated.View style={[styles.dropdownList, empresaAnimStyle]}>
        {empresas.map((emp) => (
          <Pressable
            key={emp.id}
            onPress={() => handleSelectEmpresa(emp.id, emp.empresa)}
            style={({ pressed }) => [
              styles.dropdownItem,
              {
                backgroundColor:
                  emp.id === empresaId
                    ? c.primary + "18"
                    : pressed
                      ? c.cardHover
                      : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.dropdownItemText,
                {
                  color: emp.id === empresaId ? c.primary : c.text,
                  fontWeight: emp.id === empresaId ? "700" : "500",
                },
              ]}
              numberOfLines={1}
            >
              {emp.empresa}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* ─── Selector de Sucursal (secundario) ─── */}
      <Pressable
        onPress={toggleSucursal}
        style={({ pressed }) => [
          styles.branchBtn,
          {
            backgroundColor: pressed ? c.cardHover : "transparent",
            borderColor: c.border,
          },
        ]}
        accessibilityLabel="Cambiar sucursal"
      >
        <Store size={14} color={c.textSecondary} />
        <Text
          style={[styles.branchText, { color: c.textSecondary }]}
          numberOfLines={1}
        >
          {sucursalLabel}
        </Text>
        <ChevronDown
          size={12}
          color={c.textSecondary}
          style={{
            transform: [{ rotate: sucursalExpanded ? "180deg" : "0deg" }],
          }}
        />
      </Pressable>

      {/* Lista de sucursales (sin opción "Sin sucursal") */}
      <Animated.View style={[styles.dropdownList, sucursalAnimStyle]}>
        {sucursales.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => handleSelectSucursal(s.id)}
            style={({ pressed }) => [
              styles.dropdownItem,
              {
                backgroundColor:
                  s.id === sucursalId
                    ? c.primary + "18"
                    : pressed
                      ? c.cardHover
                      : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.dropdownItemText,
                {
                  color: s.id === sucursalId ? c.primary : c.text,
                  fontWeight: s.id === sucursalId ? "700" : "500",
                },
              ]}
              numberOfLines={1}
            >
              {s.sucursal}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "transparent", // se hereda del padre
  },
  companyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  companyIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dropdownList: {
    overflow: "hidden",
    paddingLeft: 12,
    paddingRight: 4,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  dropdownItemText: {
    fontSize: 13,
  },
  branchBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  branchText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
});
