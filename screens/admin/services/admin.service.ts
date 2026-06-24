import { httpClient } from "@http";
import { CK, TTL, configCache } from "../../../cache/configCache";
import { useModulesStore } from "../../../store/modulesStore";
import {
  AdminFormulario,
  CreateFormularioModuloPayload,
  CreateFormularioPayload,
  CreateModuloRolPayload,
  FormularioModuloAssignment,
  ModuloRolAssignment,
} from "../types/admin.types";

interface ApiList<T>  { success: boolean; data: T[] }
interface ApiItem<T>  { success: boolean; message?: string; data: T }

function empId() {
  return 0;
}

async function invalidateFormulariosAndRefresh() {
  const emp = empId();
  configCache.invalidate(CK.formularios(emp), CK.modulos(emp), CK.sidebar(emp));
  await useModulesStore.getState().fetchModulos();
}

export const adminService = {
  getFormularios: async (): Promise<AdminFormulario[]> => {
    const key = CK.formularios(empId());
    const cached = configCache.get<AdminFormulario[]>(key);
    if (cached) return cached;
    const res = await httpClient.getAuth<ApiList<AdminFormulario>>(
      "/api/formularios",
      "No se pudieron cargar los formularios",
    );
    configCache.set(key, res.data, TTL.lista);
    return res.data;
  },

  createFormulario: async (payload: CreateFormularioPayload): Promise<AdminFormulario> => {
    const res = await httpClient.postAuth<ApiItem<AdminFormulario>>(
      "/api/formularios",
      payload,
      "No se pudo crear el formulario",
    );
    await invalidateFormulariosAndRefresh();
    return res.data;
  },

  updateFormulario: async (id: number, payload: CreateFormularioPayload): Promise<AdminFormulario> => {
    const res = await httpClient.putAuth<ApiItem<AdminFormulario>>(
      `/api/formularios/${id}`,
      payload,
      "No se pudo actualizar el formulario",
    );
    await invalidateFormulariosAndRefresh();
    return res.data;
  },

  deleteFormulario: async (id: number): Promise<void> => {
    await httpClient.deleteAuth<unknown>(
      `/api/formularios/${id}`,
      "No se pudo eliminar el formulario",
    );
    await invalidateFormulariosAndRefresh();
  },

  getFormularioModulos: async (): Promise<FormularioModuloAssignment[]> => {
    const res = await httpClient.getAuth<ApiList<FormularioModuloAssignment>>(
      "/api/formulario-modulo",
      "No se pudieron cargar las asignaciones formulario-módulo",
    );
    return res.data;
  },

  createFormularioModulo: async (
    payload: CreateFormularioModuloPayload,
  ): Promise<FormularioModuloAssignment> => {
    const res = await httpClient.postAuth<ApiItem<FormularioModuloAssignment>>(
      "/api/formulario-modulo",
      payload,
      "No se pudo asignar el formulario al módulo",
    );
    configCache.invalidate(CK.modulos(empId()), CK.sidebar(empId()));
    await useModulesStore.getState().fetchModulos();
    return res.data;
  },

  deleteFormularioModulo: async (id: number): Promise<void> => {
    await httpClient.deleteAuth<unknown>(
      `/api/formulario-modulo/${id}`,
      "No se pudo eliminar la asignación",
    );
    configCache.invalidate(CK.modulos(empId()), CK.sidebar(empId()));
    await useModulesStore.getState().fetchModulos();
  },

  getModuloRoles: async (): Promise<ModuloRolAssignment[]> => {
    const res = await httpClient.getAuth<ApiList<ModuloRolAssignment>>(
      "/api/modulo-rol",
      "No se pudieron cargar las asignaciones módulo-rol",
    );
    return res.data;
  },

  createModuloRol: async (
    payload: CreateModuloRolPayload,
  ): Promise<ModuloRolAssignment> => {
    const res = await httpClient.postAuth<ApiItem<ModuloRolAssignment>>(
      "/api/modulo-rol",
      payload,
      "No se pudo asignar el módulo al rol",
    );
    return res.data;
  },

  deleteModuloRol: async (id: number): Promise<void> => {
    await httpClient.deleteAuth<unknown>(
      `/api/modulo-rol/${id}`,
      "No se pudo eliminar la asignación módulo-rol",
    );
  },
};
