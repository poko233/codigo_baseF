// components/Sidebar/SidebarHeader.tsx
import {
  BookOpen,
  Briefcase,
  Crown,
  GraduationCap,
  Shield,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../theme/useTheme";

const roleIconMap: Record<string, React.ComponentType<any>> = {
  Administrador: Shield,
  Rector: GraduationCap,
  "Director Academico": BookOpen,
  "Director Administrativo": Briefcase,
  Personal: User,
  Fundador: Crown,
};

const roleColorMap: Record<string, string> = {
  Administrador: "#7C3AED",
  Rector: "#059669",
  "Director Academico": "#2563EB",
  "Director Administrativo": "#D97706",
  Personal: "#6B7280",
  Fundador: "#DC2626",
};

const BADGE_SIZE = 30;
const BADGE_GAP = 6;
const BADGES_PER_ROW = 4;
const BADGES_CONTAINER_WIDTH =
  BADGE_SIZE * BADGES_PER_ROW + BADGE_GAP * (BADGES_PER_ROW - 1);

export const SidebarHeader = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  if (!user) return null;

  const { nombres, apellido, foto, roles } = user;

  const initials = () => {
    const n = nombres?.charAt(0) || "";
    const a = apellido?.charAt(0) || "";
    return (n + a).toUpperCase() || "U";
  };

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: 4,
      }}
    >
      <View style={{ alignItems: "center" }}>
        {/* Avatar */}
        <View style={{ width: 64, height: 64 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              borderWidth: 2,
              borderColor: theme.colors.primary,
              overflow: "hidden",
              backgroundColor: theme.colors.backgroundSecondary,
            }}
          >
            {foto ? (
              <Image
                source={{ uri: foto }}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: theme.colors.text,
                  }}
                >
                  {initials()}
                </Text>
              </View>
            )}
          </View>
          {/* Punto verde */}
          <View
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#10B981",
              borderWidth: 2,
              borderColor: theme.colors.card ?? theme.colors.background,
            }}
          />
        </View>

        {/* Nombre */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: theme.colors.text,
            marginTop: 6,
            marginBottom: 6,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {nombres} {apellido}
        </Text>

        {/* Roles con tooltip individual */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: BADGE_GAP,
            width: BADGES_CONTAINER_WIDTH,
            justifyContent: "center",
          }}
        >
          {roles.map((role) => {
            const Icon = roleIconMap[role];
            const color = roleColorMap[role] || theme.colors.primary;
            const isHovered = hoveredRole === role;

            const hoverHandlers =
              Platform.OS === "web"
                ? {
                    onMouseEnter: () => setHoveredRole(role),
                    onMouseLeave: () => setHoveredRole(null),
                  }
                : {};

            return (
              <Pressable
                key={role}
                {...(hoverHandlers as any)}
                onPress={() => setHoveredRole(isHovered ? null : role)}
                style={{ position: "relative" }}
              >
                {/* Tooltip individual */}
                {isHovered && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(100)}
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      alignSelf: "center",
                      marginBottom: 8,
                      backgroundColor: color,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      zIndex: 999,
                      elevation: 6,
                      shadowColor: color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 10,
                        fontWeight: "600",
                      }}
                      numberOfLines={1}
                    >
                      {role}
                    </Text>
                  </Animated.View>
                )}

                {/* Círculo del rol */}
                <View
                  style={{
                    width: BADGE_SIZE,
                    height: BADGE_SIZE,
                    borderRadius: BADGE_SIZE / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: color + "20",
                    borderWidth: 1.5,
                    borderColor: color,
                  }}
                >
                  {Icon ? (
                    <Icon size={14} color={color} />
                  ) : (
                    <Text style={{ color, fontSize: 11, fontWeight: "800" }}>
                      {role.charAt(0)}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};
