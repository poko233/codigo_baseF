// components/AppLayout.tsx
import React from "react";
import { View } from "react-native";
import { useAuth } from "@/store/authStore";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../theme/useTheme";
import { MobileHeader } from "./MobileHeader";
import { Sidebar } from "./Sidebar/Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isDesktop } = useResponsive();
  const { theme } = useTheme();
  const { user } = useAuth(); // añadido

  if (isDesktop) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: theme.colors.background,
        }}
      >
        <Sidebar />
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.backgroundSecondary,
          }}
        >
          {children}
        </View>
      </View>
    );
  }

  // Móvil: solo mostramos el header si NO es estudiante
  const isStudent = user?.roles?.includes("Estudiante");

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {!isStudent && <MobileHeader />}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};
