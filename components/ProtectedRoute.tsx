// components/ProtectedRoute.tsx
import { Redirect, usePathname } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/store/authStore";
import { useTheme } from "../theme/useTheme";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, allowedRoutes } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const route = pathname.split("?")[0] || "/";
  if (
    allowedRoutes.size > 0 &&
    !allowedRoutes.has(route) &&
    route !== "/" &&
    route !== "/403"
  ) {
    return <Redirect href="/403" />;
  }

  return <>{children}</>;
}
