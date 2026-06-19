// store/authStore.ts
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import Toast from "react-native-toast-message";
import { httpClient } from "../http/httpClient";
import { fetchMe } from "../screens/admin/auth/services/auth.service";
import type { Usuario } from "../screens/admin/auth/types/auth.types";
import {
  clearSession,
  getEmpresaId,
  getToken,
  saveEmpresaId,
  saveToken,
} from "../storage/secureStorage";
import { useModulesStore } from "./modulesStore";
import { getTabsForRoles } from "../utils/roleBasedTabs";

interface AuthState {
  user: Usuario | null;
  loading: boolean;
  empresaId: number | null;
  empresaNombre: string | null;
  sucursalId: number | null;
  roles: string[];
  allowedRoutes: Set<string>;

  initialize: () => Promise<void>;
  login: (
    token: string,
    empresaId: number,
    empresaNombre: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  changeEmpresa: (empresaId: number, empresaNombre: string) => Promise<void>;
  changeSucursal: (sucursalId: number | null) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;

  _loadProfile: () => Promise<void>;
  _setSucursalFromEmpresa: (empresaId: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  empresaId: null,
  empresaNombre: null,
  sucursalId: null,
  roles: [],
  allowedRoutes: new Set(),

  initialize: async () => {
    try {
      const storedToken = await getToken();
      const storedEmpresaId = await getEmpresaId();
      if (storedToken && storedEmpresaId) {
        set({ empresaId: storedEmpresaId });
        await get()._loadProfile();
      }
    } catch {
      // _loadProfile ya limpia
    } finally {
      set({ loading: false });
    }
  },

  login: async (token, empId, empNombre) => {
    await saveToken(token);
    await saveEmpresaId(empId);
    set({ empresaId: empId, empresaNombre: empNombre, sucursalId: null });
    await get()._loadProfile();

    Toast.show({
      type: "success",
      text1: "Inicio de sesión exitoso",
      text2: `Bienvenido a ${empNombre}.`,
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
      empresaId: null,
      empresaNombre: null,
      sucursalId: null,
      roles: [],
      allowedRoutes: new Set(),
      loading: false,
    });
  },

  changeEmpresa: async (newEmpresaId, newEmpresaNombre) => {
    await saveEmpresaId(newEmpresaId);
    set({ empresaId: newEmpresaId, empresaNombre: newEmpresaNombre });
    get()._setSucursalFromEmpresa(newEmpresaId);

    const { clearModulos, fetchModulos } = useModulesStore.getState();
    clearModulos();
    await fetchModulos();
    const moduleRoutes = useModulesStore.getState().allowedRoutes;
    set({ allowedRoutes: new Set([...moduleRoutes]) });
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
      const currentEmpresaId =
        get().empresaId ?? userData.empresas[0]?.id ?? null;
      const empresaNombre =
        userData.empresas.find((e) => e.id === currentEmpresaId)?.empresa ?? "";

      set({
        user: userData,
        empresaId: currentEmpresaId,
        empresaNombre,
        roles: userData.roles.map((r) => r.rol),
      });

      get()._setSucursalFromEmpresa(currentEmpresaId!);

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
        empresaId: null,
        empresaNombre: null,
        sucursalId: null,
        roles: [],
        allowedRoutes: new Set(),
      });
    }
  },

  _setSucursalFromEmpresa: (empId) => {
    const { user } = get();
    if (!user || !empId) {
      set({ sucursalId: null });
      return;
    }
    const empresa = user.empresas.find((e) => e.id === empId);
    if (empresa && empresa.sucursales.length > 0) {
      set({ sucursalId: empresa.sucursales[0].id });
    } else {
      set({ sucursalId: null });
    }
  },
}));

export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      loading: state.loading,
      isAdmin: state.roles.includes("Administrador"),
      empresaId: state.empresaId,
      empresaNombre: state.empresaNombre,
      sucursalId: state.sucursalId,
      roles: state.roles,
      allowedRoutes: state.allowedRoutes,
      login: state.login,
      logout: state.logout,
      changeEmpresa: state.changeEmpresa,
      changeSucursal: state.changeSucursal,
      hasRole: state.hasRole,
      hasAnyRole: state.hasAnyRole,
    })),
  );
};
