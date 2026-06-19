// components/Sidebar/SidebarCompanySelector.tsx
import { Building2, ChevronDown, Store } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
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
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "@/store/authStore";
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

  // Sucursales de la empresa activa
  const sucursalesActiva = useMemo(() => {
    if (!empresaId || !user) return [];
    const empresa = user.empresas.find((e) => e.id === empresaId);
    return empresa?.sucursales ?? [];
  }, [empresaId, user?.empresas]); // user.empresas es más estable que user

  const showEmpresaSelector = empresas.length > 1;
  const showSucursalSelector = sucursalesActiva.length > 1;

  const empresasDisponibles = empresas.filter((emp) => emp.id !== empresaId);
  const sucursalesDisponibles = sucursalesActiva.filter(
    (s) => s.id !== sucursalId,
  );

  const toggleEmpresa = useCallback(() => {
    if (!showEmpresaSelector) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEmpresaExpanded((v) => !v);
    if (sucursalExpanded) setSucursalExpanded(false);
  }, [sucursalExpanded, showEmpresaSelector]);

  const toggleSucursal = useCallback(() => {
    if (!showSucursalSelector) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSucursalExpanded((v) => !v);
    if (empresaExpanded) setEmpresaExpanded(false);
  }, [empresaExpanded, showSucursalSelector]);

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

  const empresaAnimStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(empresaExpanded ? 300 : 0, { duration: 200 }),
    opacity: withTiming(empresaExpanded ? 1 : 0, { duration: 150 }),
  }));

  const sucursalAnimStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(sucursalExpanded ? 300 : 0, { duration: 200 }),
    opacity: withTiming(sucursalExpanded ? 1 : 0, { duration: 150 }),
  }));

  const sucursalLabel =
    sucursalesActiva.find((s) => s.id === sucursalId)?.sucursal ?? "—";

  return (
    <View
      style={[
        styles.container,
        { zIndex: empresaExpanded || sucursalExpanded ? 999 : 1 },
      ]}
    >
      {/* Selector de Empresa */}
      <View style={[styles.cardWrapper, { zIndex: 2, marginBottom: 10 }]}>
        <Pressable
          onPress={toggleEmpresa}
          disabled={!showEmpresaSelector}
          //@ts-ignore
          style={({ pressed, hovered }) => [
            styles.cardBtn,
            {
              backgroundColor:
                pressed || hovered ? c.cardHover || "rgba(0,0,0,0.02)" : c.card,
              borderColor: c.border,
            },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: c.primary + "15" }]}>
            <Building2 size={20} color={c.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.textCol}>
            <Text style={[styles.labelText, { color: c.textSecondary }]}>
              EMPRESA ACTUAL
            </Text>
            <Text
              style={[styles.valueText, { color: c.text }]}
              numberOfLines={1}
            >
              {empresaNombre || "TECNOLOGICOSF"}
            </Text>
          </View>
          {showEmpresaSelector && (
            <ChevronDown
              size={18}
              color={c.textSecondary}
              style={{
                transform: [{ rotate: empresaExpanded ? "180deg" : "0deg" }],
              }}
            />
          )}
        </Pressable>

        {showEmpresaSelector && (
          <Animated.View
            style={[
              styles.dropdownList,
              empresaAnimStyle,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <View style={styles.dropdownInner}>
              {empresasDisponibles.map((emp) => (
                <Pressable
                  key={emp.id}
                  onPress={() => handleSelectEmpresa(emp.id, emp.empresa)}
                  //@ts-ignore
                  style={({ pressed, hovered }) => [
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        pressed || hovered
                          ? c.cardHover || "rgba(0,0,0,0.04)"
                          : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[styles.dropdownItemText, { color: c.text }]}
                    numberOfLines={1}
                  >
                    {emp.empresa}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}
      </View>

      {/* Selector de Sucursal */}
      <View style={[styles.cardWrapper, { zIndex: 1 }]}>
        <Pressable
          onPress={toggleSucursal}
          disabled={!showSucursalSelector}
          //@ts-ignore
          style={({ pressed, hovered }) => [
            styles.cardBtn,
            {
              backgroundColor:
                pressed || hovered ? c.cardHover || "rgba(0,0,0,0.02)" : c.card,
              borderColor: c.border,
            },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: c.primary + "15" }]}>
            <Store size={20} color={c.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.textCol}>
            <Text style={[styles.labelText, { color: c.textSecondary }]}>
              SUCURSAL
            </Text>
            <Text
              style={[styles.valueText, { color: c.text }]}
              numberOfLines={1}
            >
              {sucursalLabel}
            </Text>
          </View>
          {showSucursalSelector && (
            <ChevronDown
              size={18}
              color={c.textSecondary}
              style={{
                transform: [{ rotate: sucursalExpanded ? "180deg" : "0deg" }],
              }}
            />
          )}
        </Pressable>

        {showSucursalSelector && (
          <Animated.View
            style={[
              styles.dropdownList,
              sucursalAnimStyle,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <View style={styles.dropdownInner}>
              {sucursalesDisponibles.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => handleSelectSucursal(s.id)}
                  //@ts-ignore
                  style={({ pressed, hovered }) => [
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        pressed || hovered
                          ? c.cardHover || "rgba(0,0,0,0.04)"
                          : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[styles.dropdownItemText, { color: c.text }]}
                    numberOfLines={1}
                  >
                    {s.sucursal}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  cardWrapper: {
    position: "relative",
  },
  cardBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    ...(Platform.OS === "web" ? { transition: "all 0.2s ease" } : {}),
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueText: {
    fontSize: 15,
    fontWeight: "800",
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownInner: {
    padding: 6,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    ...(Platform.OS === "web"
      ? { transition: "background-color 0.2s ease" }
      : {}),
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
