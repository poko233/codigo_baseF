import { httpClient } from "@http";
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

export const adminService = {


  getFormularios: async (): Promise<AdminFormulario[]> => {
    const res = await httpClient.getAuth<ApiList<AdminFormulario>>(
      "/api/formularios",
      "No se pudieron cargar los formularios",
    );
    return res.data;
  },

  createFormulario: async (payload: CreateFormularioPayload): Promise<AdminFormulario> => {
    const res = await httpClient.postAuth<ApiItem<AdminFormulario>>(
      "/api/formularios",
      payload,
      "No se pudo crear el formulario",
    );
    return res.data;
  },

  deleteFormulario: async (id: number): Promise<void> => {
    await httpClient.deleteAuth<unknown>(
      `/api/formularios/${id}`,
      "No se pudo eliminar el formulario",
    );
  },

  updateFormulario: async (id: number, payload: CreateFormularioPayload): Promise<AdminFormulario> => {
    const res = await httpClient.putAuth<ApiItem<AdminFormulario>>(
      `/api/formularios/${id}`,
      payload,
      "No se pudo actualizar el formulario",
    );
    return res.data;
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
    return res.data;
  },

  deleteFormularioModulo: async (id: number): Promise<void> => {
    await httpClient.deleteAuth<unknown>(
      `/api/formulario-modulo/${id}`,
      "No se pudo eliminar la asignación",
    );
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