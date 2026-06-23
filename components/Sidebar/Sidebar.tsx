// components/Sidebar/Sidebar.tsx
import { getIonicon } from "@/screens/admin/modulos/types/modulo.types";
import { Ionicons } from "@expo/vector-icons";
import { Href, usePathname, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "@/store/authStore";
import { useResponsive } from "../../hooks/useResponsive";
import {
  MiFormulario,
  MiModulo,
  useModulesStore,
} from "../../store/modulesStore";
import { useTheme } from "../../theme/useTheme";
import { getTabsForRoles } from "../../utils/roleBasedTabs";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarCompanySelector } from "./SidebarCompanySelector"; // ← nuevo

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ──────────────────────────────────────────────
   Sub-item (Formulario)
────────────────────────────────────────────── */
const FormularioItem: React.FC<{
  formulario: MiFormulario;
  onNavigate?: () => void;
}> = ({ formulario, onNavigate }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const pathname = usePathname();
  const isActive = formulario.ruta
    ? (pathname === formulario.ruta || pathname.startsWith(formulario.ruta + "/"))
    : false;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconName = getIonicon(
    formulario.icono ?? "",
  ) as keyof typeof Ionicons.glyphMap;

  const handlePress = useCallback(() => {
      if (!formulario.ruta) return;  // ← No hacer nada si no hay ruta
      onNavigate?.();
      router.push(formulario.ruta as Href);
  }, [formulario.ruta, onNavigate]);

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 180 });
        }}
        style={[
          styles.subItem,
          isActive && { backgroundColor: c.primary + "18" },
        ]}
      >
        <View
          style={[
            styles.subLine,
            { backgroundColor: isActive ? c.primary : c.border },
          ]}
        />
        <Ionicons
          name={iconName}
          size={15}
          color={isActive ? c.primary : c.textSecondary}
        />
        <Text
          style={[
            styles.subLabel,
            {
              color: isActive ? c.primary : c.textSecondary,
              fontWeight: isActive ? "700" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {formulario.nombre}
        </Text>
        {isActive && (
          <View
            style={[styles.activeIndicator, { backgroundColor: c.primary }]}
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

/* ──────────────────────────────────────────────
   Módulo item (colapsable si tiene formularios)
────────────────────────────────────────────── */
const ModuloItem: React.FC<{
  modulo: MiModulo;
  onNavigate?: () => void;
}> = ({ modulo, onNavigate }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const router = useRouter();
  const pathname = usePathname();

  const hasChildren = modulo.formularios.length > 0;
  const anyChildActive = modulo.formularios.some(
    (f) => f.ruta && (pathname === f.ruta || pathname.startsWith(f.ruta + "/")),
  );
  const [expanded, setExpanded] = useState(anyChildActive);

  // const href = `/${modulo.nombre.toLowerCase().replace(/\s+/g, "-")}`;
  const href = `/${(modulo.nombre ?? '').toLowerCase().replace(/\s+/g, "-")}`;
  const isActive =
    !hasChildren && (pathname === href || pathname.startsWith(href + "/"));

  const scale = useSharedValue(1);
  const chevron = useSharedValue(expanded ? 1 : 0);

  const iconName = getIonicon(modulo.icono) as keyof typeof Ionicons.glyphMap;

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }));

  const handlePress = useCallback(() => {
    if (hasChildren) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      chevron.value = withTiming(expanded ? 0 : 1, { duration: 200 });
      setExpanded((v) => !v);
    } else {
      onNavigate?.();
      router.push(href as Href);
    }
  }, [hasChildren, expanded, href, onNavigate]);

  const rowActive = isActive || anyChildActive;

  return (
    <View>
      <Animated.View
        style={useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }))}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={() => {
            scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 180 });
          }}
          style={[
            styles.moduleItem,
            rowActive && !hasChildren && { backgroundColor: c.primary },
            rowActive && hasChildren && { backgroundColor: c.primary + "12" },
          ]}
        >
          <View
            style={[
              styles.moduleIconWrap,
              { backgroundColor: rowActive ? c.primary + "20" : c.input },
            ]}
          >
            <Ionicons
              name={iconName}
              size={18}
              color={rowActive ? c.primary : c.textSecondary}
            />
          </View>

          <Text
            style={[
              styles.moduleLabel,
              {
                color: rowActive && !hasChildren ? c.primaryForeground : c.text,
                fontWeight: rowActive ? "700" : "500",
              },
            ]}
            numberOfLines={1}
          >
            {modulo.nombre}
          </Text>

          {hasChildren && (
            <Animated.View style={chevronStyle}>
              <Ionicons
                name="chevron-down"
                size={14}
                color={anyChildActive ? c.primary : c.muted}
              />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>

      {hasChildren && expanded && (
        <View style={styles.subList}>
          {modulo.formularios.map((f) => (
            <FormularioItem key={f.id} formulario={f} onNavigate={onNavigate} />
          ))}
        </View>
      )}
    </View>
  );
};

/* ──────────────────────────────────────────────
   Sidebar principal
────────────────────────────────────────────── */
interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const { modulos, loading, error, fetchModulos } = useModulesStore();
  const { user } = useAuth();
  const { isDesktop } = useResponsive();

  const tabs = getTabsForRoles(user?.roles.map((r) => r.rol) ?? []);
  const homeRoute = tabs.length > 0 ? `/${tabs[0].name}` : "/perfil";

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: c.card,
          borderRightColor: c.border,
          borderRightWidth: 1,
          width: isDesktop ? 240 : "100%",
        },
        !isDesktop && { flex: 1 },
      ]}
    >
      {/* ★ Nueva cabecera con nombre de empresa y selectores ★ */}
      <SidebarCompanySelector />

      {/* Información del usuario y roles */}
      <SidebarHeader />

      {/* Lista de módulos */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.nav}
      >
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={c.primary} />
            <Text style={[styles.loadingText, { color: c.textSecondary }]}>
              Cargando…
            </Text>
          </View>
        )}

        {!loading && error && (
          <Pressable
            onPress={() => fetchModulos()}
            style={[
              styles.errorBox,
              { backgroundColor: "#FFF1F2", borderColor: "#FECDD3" },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#E11D48" />
            <Text style={[styles.errorText, { color: "#E11D48" }]}>
              {error}
            </Text>
            <Ionicons
              name="refresh-outline"
              size={16}
              color="#E11D48"
              style={{ marginLeft: "auto" }}
            />
          </Pressable>
        )}

        {!loading && !error && modulos.length === 0 && (
          <View style={styles.center}>
            <Ionicons name="grid-outline" size={32} color={c.muted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Sin módulos asignados
            </Text>
          </View>
        )}

        {!loading &&
          !error &&
          modulos.map((modulo) => (
            <ModuloItem
              key={modulo.id}
              modulo={modulo}
              onNavigate={onNavigate}
            />
          ))}
      </ScrollView>

      <SidebarFooter />
    </View>
  );
};

/* ───────────────── Estilos ───────────────── */
const styles = StyleSheet.create({
  sidebar: {
    width: 240,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  nav: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 2,
  },
  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  moduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleLabel: {
    flex: 1,
    fontSize: 14,
  },
  subList: {
    marginLeft: 20,
    marginTop: 2,
    marginBottom: 4,
    gap: 1,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  subLine: {
    width: 2,
    height: 14,
    borderRadius: 2,
  },
  subLabel: {
    flex: 1,
    fontSize: 13,
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  center: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: { fontSize: 12 },
  emptyText: { fontSize: 13, textAlign: "center" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 4,
  },
  errorText: { fontSize: 12, flex: 1 },
});
