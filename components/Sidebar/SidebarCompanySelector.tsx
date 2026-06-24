// components/Sidebar/SidebarCompanySelector.tsx
import { Store } from "lucide-react-native";
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
  const { user, sucursalId, changeSucursal } = useAuth();

  const [sucursalExpanded, setSucursalExpanded] = useState(false);

  const sucursales = useMemo(
    () => user?.sucursales ?? [],
    [user?.sucursales],
  );

  const showSucursalSelector = sucursales.length > 1;
  const sucursalesDisponibles = sucursales.filter((s) => s.id !== sucursalId);
  const sucursalLabel = sucursales.find((s) => s.id === sucursalId)?.sucursal ?? "—";

  const toggleSucursal = useCallback(() => {
    if (!showSucursalSelector) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSucursalExpanded((v) => !v);
  }, [showSucursalSelector]);

  const handleSelectSucursal = useCallback(
    (id: number) => {
      setSucursalExpanded(false);
      changeSucursal(id);
    },
    [changeSucursal],
  );

  const sucursalAnimStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(sucursalExpanded ? 300 : 0, { duration: 200 }),
    opacity: withTiming(sucursalExpanded ? 1 : 0, { duration: 150 }),
  }));

  return (
    <View style={[styles.container, { zIndex: sucursalExpanded ? 999 : 1 }]}>
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
          <View style={[styles.iconBox, { backgroundColor: (c.primary as string) + "15" }]}>
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
            <Store
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
