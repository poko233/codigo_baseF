// app/_layout.tsx
import { injectGlobalScrollbar } from "@/components/globalScrollbar";
import { Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MobileDrawer } from "../components/MobileDrawer";
import { Toaster } from "../components/Toaster";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { MobileDrawerProvider } from "../contexts/MobileDrawerContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../global.css";
import { useTheme } from "../theme/useTheme";

function AppContent() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();

  // El drawer solo se monta si hay usuario, no estamos en la raíz y NO es estudiante
  const isStudent = user?.roles?.includes("Estudiante");
  const showDrawer = !!user && pathname !== "/" && !isStudent;

  React.useEffect(() => {
    injectGlobalScrollbar({
      background: theme.colors.background,
      thumb: theme.colors.border,
      thumbHover: theme.colors.borderHover,
    });
  }, [theme]);

  return (
    <>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <MobileDrawerProvider>
        <Slot />
        {showDrawer && <MobileDrawer />}
      </MobileDrawerProvider>
      <Toaster />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
