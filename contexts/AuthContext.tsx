// contexts/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { httpClient } from "../http/httpClient";
import { fetchMe } from "../screens/admin/auth/services/auth.service";
import type { Usuario } from "../screens/admin/auth/types/auth.types";
import {
  clearSession,
  getEmpresaId,
  getEmpresaNombre,
  getSucursalId,
  getToken,
  saveEmpresaId,
  saveEmpresaNombre,
  saveSucursalId,
  saveToken,
} from "../storage/secureStorage";
import { useModulesStore } from "../store/modulesStore";
import { getTabsForRoles } from "../utils/roleBasedTabs";

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  empresaId: number | null;
  empresaNombre: string | null;
  sucursalId: number | null;
  roles: string[];
  allowedRoutes: Set<string>;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [empresaNombre, setEmpresaNombre] = useState<string | null>(null);
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [allowedRoutes, setAllowedRoutes] = useState<Set<string>>(new Set());
  const { fetchModulos, clearModulos } = useModulesStore();

  const roles = user ? user.roles.map((r) => r.rol) : [];

  const hasRole = useCallback((role: string) => roles.includes(role), [roles]);
  const hasAnyRole = useCallback(
    (rolesToCheck: string[]) => rolesToCheck.some((r) => roles.includes(r)),
    [roles],
  );

  // Selecciona la primera sucursal de una empresa dada y la persiste.
  const selectDefaultSucursalForEmpresa = useCallback(
    async (empId: number) => {
      if (!user) return;
      const empresa = user.empresas.find((e) => e.id === empId);
      if (empresa && empresa.sucursales.length > 0) {
        const firstId = empresa.sucursales[0].id;
        await saveSucursalId(firstId);
        setSucursalId(firstId);
      } else {
        await saveSucursalId(null);
        setSucursalId(null);
      }
    },
    [user],
  );

  const loadProfile = useCallback(async () => {
    try {
      const userData = await fetchMe();
      setUser(userData);

      // Determinar empresa activa (viene del header o se restauró)
      const currentEmpresaId = empresaId ?? userData.empresas[0]?.id ?? null;
      if (currentEmpresaId && !empresaId) {
        setEmpresaId(currentEmpresaId);
        const nombre =
          userData.empresas.find((e) => e.id === currentEmpresaId)?.empresa ??
          "";
        setEmpresaNombre(nombre);
        await saveEmpresaNombre(nombre);
        await saveEmpresaId(currentEmpresaId);
      }

      // Seleccionar sucursal por defecto de la empresa activa
      const empresaActiva = userData.empresas.find(
        (e) => e.id === (currentEmpresaId ?? empresaId),
      );
      if (empresaActiva && empresaActiva.sucursales.length > 0) {
        const storedSucursal = await getSucursalId();
        const exists =
          storedSucursal &&
          empresaActiva.sucursales.some((s) => s.id === storedSucursal);
        if (!exists) {
          const firstId = empresaActiva.sucursales[0].id;
          await saveSucursalId(firstId);
          setSucursalId(firstId);
        } else {
          setSucursalId(storedSucursal);
        }
      } else {
        await saveSucursalId(null);
        setSucursalId(null);
      }

      await fetchModulos();
      const moduleRoutes = useModulesStore.getState().allowedRoutes;
      const tabRoutes = new Set<string>();
      const tabsForRoles = getTabsForRoles(userData.roles.map((r) => r.rol));
      for (const tab of tabsForRoles) {
        tabRoutes.add(`/${tab.name}`);
      }
      setAllowedRoutes(new Set([...moduleRoutes, ...tabRoutes]));
    } catch {
      await clearSession();
      clearModulos();
      setUser(null);
      setEmpresaId(null);
      setEmpresaNombre(null);
      setSucursalId(null);
      setAllowedRoutes(new Set());
      throw new Error("Sesión inválida");
    }
  }, [fetchModulos, clearModulos, empresaId]);

  // Restauración de sesión al abrir la app
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getToken();
        const storedEmpresaId = await getEmpresaId();
        if (storedToken && storedEmpresaId) {
          setEmpresaId(storedEmpresaId);
          const storedNombre = await getEmpresaNombre();
          setEmpresaNombre(storedNombre);
          const storedSucursal = await getSucursalId();
          setSucursalId(storedSucursal); // se validará en loadProfile
          await loadProfile();
        }
      } catch {
        // loadProfile limpia todo
      } finally {
        setLoading(false);
      }
    })();
  }, [loadProfile]);

  const login = useCallback(
    async (token: string, empId: number, empNombre: string) => {
      await saveToken(token);
      await saveEmpresaId(empId);
      await saveEmpresaNombre(empNombre);
      setEmpresaId(empId);
      setEmpresaNombre(empNombre);
      setSucursalId(null); // se establecerá en loadProfile
      await loadProfile();

      Toast.show({
        type: "success",
        text1: "Inicio de sesión exitoso",
        text2: `Bienvenido a ${empNombre}.`,
      });
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch {}
    await clearSession();
    clearModulos();
    setUser(null);
    setEmpresaId(null);
    setEmpresaNombre(null);
    setSucursalId(null);
    setAllowedRoutes(new Set());
  }, [clearModulos]);

  const changeEmpresa = useCallback(
    async (newEmpresaId: number, newEmpresaNombre: string) => {
      await saveEmpresaId(newEmpresaId);
      await saveEmpresaNombre(newEmpresaNombre);
      setEmpresaId(newEmpresaId);
      setEmpresaNombre(newEmpresaNombre);

      // Seleccionar la primera sucursal de la nueva empresa (local)
      if (user) {
        const empresa = user.empresas.find((e) => e.id === newEmpresaId);
        if (empresa && empresa.sucursales.length > 0) {
          const firstId = empresa.sucursales[0].id;
          await saveSucursalId(firstId);
          setSucursalId(firstId);
        } else {
          await saveSucursalId(null);
          setSucursalId(null);
        }
      }

      clearModulos();
      await fetchModulos();
      const moduleRoutes = useModulesStore.getState().allowedRoutes;
      setAllowedRoutes(new Set([...moduleRoutes]));
    },
    [user, clearModulos, fetchModulos],
  );

  const changeSucursal = useCallback(async (newSucursalId: number | null) => {
    await saveSucursalId(newSucursalId);
    setSucursalId(newSucursalId);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: roles.includes("Administrador"),
        empresaId,
        empresaNombre,
        sucursalId,
        roles,
        allowedRoutes,
        login,
        logout,
        changeEmpresa,
        changeSucursal,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
}
