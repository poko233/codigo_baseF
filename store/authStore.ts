// store/authStore.ts
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import Toast from "react-native-toast-message";
import { httpClient } from "../http/httpClient";
import { fetchMe } from "../screens/admin/auth/services/auth.service";
import type { Usuario } from "../screens/admin/auth/types/auth.types";
import {
  clearSession,
  getToken,
  saveToken,
} from "../storage/secureStorage";
import { useModulesStore } from "./modulesStore";
import { getTabsForRoles } from "../utils/roleBasedTabs";

interface AuthState {
  user: Usuario | null;
  loading: boolean;
  sucursalId: number | null;
  roles: string[];
  allowedRoutes: Set<string>;

  initialize: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  changeSucursal: (sucursalId: number | null) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;

  _loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  sucursalId: null,
  roles: [],
  allowedRoutes: new Set(),

  initialize: async () => {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        await get()._loadProfile();
      }
    } catch {
      // _loadProfile ya limpia
    } finally {
      set({ loading: false });
    }
  },

  login: async (token) => {
    await saveToken(token);
    await get()._loadProfile();

    const userName = get().user?.nombres ?? "usuario";
    Toast.show({
      type: "success",
      text1: "Inicio de sesión exitoso",
      text2: `Bienvenido de vuelta, ${userName}.`,
    });
  },

  logout: async () => {
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch {}
    await clearSession();
    const { clearModulos } = useModulesStore.getState();
    clearModulos();
    set({
      user: null,
      sucursalId: null,
      roles: [],
      allowedRoutes: new Set(),
      loading: false,
    });
  },

  changeSucursal: async (newSucursalId) => {
    set({ sucursalId: newSucursalId });
  },

  hasRole: (role) => get().roles.includes(role),
  hasAnyRole: (rolesToCheck) =>
    rolesToCheck.some((r) => get().roles.includes(r)),

  _loadProfile: async () => {
    try {
      const userData = await fetchMe();

      // Tomar la primera sucursal activa directamente del usuario
      const primeraSucursal =
        userData.sucursales?.find((s) => s.estado === "Activo")?.id ??
        userData.sucursales?.[0]?.id ??
        null;

      set({
        user: userData,
        sucursalId: get().sucursalId ?? primeraSucursal,
        roles: userData.roles.map((r) => r.rol),
      });

      const { fetchModulos } = useModulesStore.getState();
      await fetchModulos();
      const moduleRoutes = useModulesStore.getState().allowedRoutes;
      const tabRoutes = new Set<string>();
      const tabsForRoles = getTabsForRoles(userData.roles.map((r) => r.rol));
      for (const tab of tabsForRoles) {
        tabRoutes.add(`/${tab.name}`);
      }
      set({ allowedRoutes: new Set([...moduleRoutes, ...tabRoutes]) });
    } catch {
      await clearSession();
      const { clearModulos } = useModulesStore.getState();
      clearModulos();
      set({
        user: null,
        sucursalId: null,
        roles: [],
        allowedRoutes: new Set(),
      });
    }
  },
}));

export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      loading: state.loading,
      isAdmin: state.roles.some((r) => r.toLowerCase() === "administrador"),
      sucursalId: state.sucursalId,
      roles: state.roles,
      allowedRoutes: state.allowedRoutes,
      login: state.login,
      logout: state.logout,
      changeSucursal: state.changeSucursal,
      hasRole: state.hasRole,
      hasAnyRole: state.hasAnyRole,
    })),
  );
};
