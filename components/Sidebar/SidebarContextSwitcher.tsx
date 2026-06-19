// components/Sidebar/SidebarContextSwitcher.tsx
import { Building2, ChevronDown, Store } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../theme/useTheme";

export const SidebarContextSwitcher: React.FC = () => {
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

  const empresaHeight = useSharedValue(0);
  const sucursalHeight = useSharedValue(0);

  const empresas = user?.empresas ?? [];
  const sucursales = user?.sucursales ?? [];

  const toggleEmpresa = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEmpresaExpanded((v) => !v);
    setSucursalExpanded(false);
  }, []);

  const toggleSucursal = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSucursalExpanded((v) => !v);
    setEmpresaExpanded(false);
  }, []);

  const handleSelectEmpresa = useCallback(
    (id: number, nombre: string) => {
      setEmpresaExpanded(false);
      changeEmpresa(id, nombre);
    },
    [changeEmpresa],
  );

  const handleSelectSucursal = useCallback(
    (id: number | null) => {
      setSucursalExpanded(false);
      changeSucursal(id);
    },
    [changeSucursal],
  );

  const empresaAnimStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(empresaExpanded ? 200 : 0, { duration: 200 }),
    opacity: withTiming(empresaExpanded ? 1 : 0, { duration: 150 }),
  }));

  const sucursalAnimStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(sucursalExpanded ? 200 : 0, { duration: 200 }),
    opacity: withTiming(sucursalExpanded ? 1 : 0, { duration: 150 }),
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
        Contexto de Operación
      </Text>

      {/* ─── Selector de Empresa ─── */}
      <Pressable
        onPress={toggleEmpresa}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: pressed ? c.border + "30" : c.cardHover,
            borderColor: c.border,
          },
        ]}
      >
        <Building2 size={16} color={c.primary} />
        <View style={styles.selectorTextContainer}>
          <Text style={[styles.selectorLabel, { color: c.textSecondary }]}>
            Empresa
          </Text>
          <Text
            style={[styles.selectorValue, { color: c.text }]}
            numberOfLines={1}
          >
            {empresaNombre || "Sin empresa"}
          </Text>
        </View>
        <ChevronDown size={14} color={c.textSecondary} />
      </Pressable>

      {/* Lista de empresas */}
      <Animated.View style={[styles.list, empresaAnimStyle]}>
        {empresas.map((emp) => (
          <Pressable
            key={emp.id}
            onPress={() => handleSelectEmpresa(emp.id, emp.empresa)}
            style={({ pressed }) => [
              styles.listItem,
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
                styles.listItemText,
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

      {/* ─── Selector de Sucursal ─── */}
      <Pressable
        onPress={toggleSucursal}
        style={({ pressed }) => [
          styles.selector,
          {
            backgroundColor: pressed ? c.border + "30" : c.cardHover,
            borderColor: c.border,
            marginTop: 8,
          },
        ]}
      >
        <Store size={16} color={c.primary} />
        <View style={styles.selectorTextContainer}>
          <Text style={[styles.selectorLabel, { color: c.textSecondary }]}>
            Sucursal
          </Text>
          <Text
            style={[styles.selectorValue, { color: c.text }]}
            numberOfLines={1}
          >
            {sucursalId
              ? sucursales.find((s) => s.id === sucursalId)?.sucursal || "—"
              : "Sin sucursal"}
          </Text>
        </View>
        <ChevronDown size={14} color={c.textSecondary} />
      </Pressable>

      <Animated.View style={[styles.list, sucursalAnimStyle]}>
        {/* Opción "Sin sucursal" */}
        <Pressable
          onPress={() => handleSelectSucursal(null)}
          style={({ pressed }) => [
            styles.listItem,
            {
              backgroundColor:
                sucursalId === null
                  ? c.primary + "18"
                  : pressed
                    ? c.cardHover
                    : "transparent",
            },
          ]}
        >
          <Text
            style={[
              styles.listItemText,
              {
                color: sucursalId === null ? c.primary : c.text,
                fontWeight: sucursalId === null ? "700" : "500",
              },
            ]}
          >
            Sin sucursal
          </Text>
        </Pressable>

        {sucursales.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => handleSelectSucursal(s.id)}
            style={({ pressed }) => [
              styles.listItem,
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
                styles.listItemText,
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
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectorTextContainer: {
    flex: 1,
    overflow: "hidden",
  },
  selectorLabel: {
    fontSize: 10,
    lineHeight: 12,
  },
  selectorValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    overflow: "hidden",
    marginTop: 4,
    paddingLeft: 8,
  },
  listItem: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  listItemText: {
    fontSize: 13,
  },
});
