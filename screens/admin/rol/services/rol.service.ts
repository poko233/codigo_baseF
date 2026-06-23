import { httpClient } from "@http";
import { CK, TTL, configCache } from "../../../../cache/configCache";
import { useAuthStore } from "../../../../store/authStore";
import { useModulesStore } from "../../../../store/modulesStore";
import {
  PermisoSync,
  Rol,
  RolConPermisos,
  RolPayload,
} from "../types/rol.types";

function empId() {
  return useAuthStore.getState().empresaId ?? 0;
}

export const rolService = {
  getAll: async (): Promise<Rol[]> => {
    const key = CK.roles(empId());
    const cached = configCache.get<Rol[]>(key);
    if (cached) return cached;
    const res = await httpClient.getAuth<any>("/api/roles", "Error al cargar roles");
    const data: Rol[] = res.data ?? res.roles ?? [];
    configCache.set(key, data, TTL.lista);
    return data;
  },

  create: async (payload: RolPayload): Promise<Rol | null> => {
    const res = await httpClient.postAuth<any>("/api/roles", payload, "Error al crear rol");
    configCache.invalidate(CK.roles(empId()));
    return res.data ?? res.rol ?? null;
  },

  update: async (id: number, payload: RolPayload): Promise<Rol | null> => {
    const res = await httpClient.putAuth<any>(`/api/roles/${id}`, payload, "Error al actualizar rol");
    configCache.invalidate(CK.roles(empId()));
    return res.data ?? res.rol ?? null;
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.deleteAuth(`/api/roles/${id}`, "Error al eliminar rol");
    configCache.invalidate(CK.roles(empId()));
  },

  getPermisos: async (id: number): Promise<RolConPermisos> => {
    const key = CK.rolPermisos(id);
    const cached = configCache.get<RolConPermisos>(key);
    if (cached) return cached;
    const res = await httpClient.getAuth<{ data: RolConPermisos }>(
      `/api/roles/${id}/permisos`,
      "Error al cargar permisos del rol",
    );
    configCache.set(key, res.data, TTL.permisos);
    return res.data;
  },

  syncPermisos: async (id: number, permisos: PermisoSync[]): Promise<void> => {
    await httpClient.putAuth(`/api/roles/${id}/permisos`, { permisos }, "Error al guardar permisos");
    const emp = empId();
    configCache.invalidate(
      CK.rolPermisos(id),
      CK.sidebar(emp),
      CK.todosRolesPermisos(emp), // ← AGREGA ESTO
    );
    await useModulesStore.getState().fetchModulos();
  },
  
  getAllConPermisos: async (): Promise<RolConPermisos[]> => {
    const emp = empId();
    const key = CK.todosRolesPermisos(emp);
    const cached = configCache.get<RolConPermisos[]>(key);
    if (cached) return cached;

    const res = await httpClient.getAuth<{ data: RolConPermisos[] }>(
      "/api/roles/permisos",
      "Error al cargar permisos de roles",
    );
    const data = res.data ?? [];
    configCache.set(key, data, TTL.permisos);
    return data;
  },
  
};
