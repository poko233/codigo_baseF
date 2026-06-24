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

// Shapes devueltas por los endpoints anidados del backend
interface FMBackend {
  data: {
    modulo: { id: number; modulo: string };
    formularios: Array<{ id: number; formulario: string; ruta: string | null; descripcion: string | null; estado: string }>;
  };
}

interface MRBackend {
  data: {
    rol: { id: number; rol: string };
    modulos: Array<{ id: number; modulo: string; icono: string | null; descripcion: string | null }>;
  };
}

function empId() {
  return 0;
}

async function invalidateFormulariosAndRefresh() {
  const emp = empId();
  configCache.invalidate(CK.formularios(emp), CK.modulos(emp), CK.sidebar(emp));
  await useModulesStore.getState().fetchModulos();
}

export const adminService = {
  // ── Formularios CRUD ────────────────────────────────────────────────────────

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

  // ── Formulario ↔ Módulo ─────────────────────────────────────────────────────
  // Backend: GET /api/modulos/{id}/formularios  (por módulo)
  //          POST /api/modulos/{id}/formularios  body: { formulario_ids: number[] }  (sync)
  //          DELETE /api/modulos/{id}/formularios/{formulario}

  getFormularioModulos: async (): Promise<FormularioModuloAssignment[]> => {
    // No existe endpoint de lista plana; se agrega por cada módulo.
    const modulosRes = await httpClient.getAuth<{ data: Array<{ id: number; modulo: string }> }>(
      "/api/modulos",
      "No se pudieron cargar los módulos",
    );
    const modulos = modulosRes.data;

    const groups = await Promise.all(
      modulos.map(async (mod) => {
        const res = await httpClient.getAuth<FMBackend>(
          `/api/modulos/${mod.id}/formularios`,
          "No se pudieron cargar las asignaciones",
        );
        return res.data.formularios.map((f): FormularioModuloAssignment => ({
          id_formulario: f.id,
          id_modulo: mod.id,
          formulario: f.formulario,
          modulo: mod.modulo,
        }));
      }),
    );

    return groups.flat();
  },

  createFormularioModulo: async (
    payload: CreateFormularioModuloPayload,
  ): Promise<FormularioModuloAssignment> => {
    // El backend usa sync (reemplaza todo); hacemos read-modify-write para agregar uno.
    const currentRes = await httpClient.getAuth<FMBackend>(
      `/api/modulos/${payload.id_modulo}/formularios`,
      "No se pudieron cargar los formularios actuales",
    );
    const currentIds = currentRes.data.formularios.map((f) => f.id);
    const nextIds = [...new Set([...currentIds, payload.id_formulario])];

    await httpClient.postAuth(
      `/api/modulos/${payload.id_modulo}/formularios`,
      { formulario_ids: nextIds },
      "No se pudo asignar el formulario al módulo",
    );

    configCache.invalidate(CK.modulos(empId()), CK.sidebar(empId()));
    await useModulesStore.getState().fetchModulos();

    return {
      id_formulario: payload.id_formulario,
      id_modulo: payload.id_modulo,
      modulo: currentRes.data.modulo.modulo,
      formulario: currentRes.data.formularios.find((f) => f.id === payload.id_formulario)?.formulario,
    };
  },

  deleteFormularioModulo: async (id_formulario: number, id_modulo: number): Promise<void> => {
    await httpClient.deleteAuth<unknown>(
      `/api/modulos/${id_modulo}/formularios/${id_formulario}`,
      "No se pudo eliminar la asignación",
    );
    configCache.invalidate(CK.modulos(empId()), CK.sidebar(empId()));
    await useModulesStore.getState().fetchModulos();
  },

  // ── Módulo ↔ Rol ────────────────────────────────────────────────────────────
  // Backend: GET /api/roles/{id}/modulos  (por rol)
  //          POST /api/roles/{id}/modulos  body: { modulo_ids: number[] }  (sync)
  //          DELETE /api/roles/{id}/modulos/{modulo}

  getModuloRoles: async (): Promise<ModuloRolAssignment[]> => {
    // No existe endpoint de lista plana; se agrega por cada rol.
    const rolesRes = await httpClient.getAuth<{ data: Array<{ id: number; rol: string }> }>(
      "/api/roles?por_pagina=500",
      "No se pudieron cargar los roles",
    );
    const roles = rolesRes.data;

    const groups = await Promise.all(
      roles.map(async (rol) => {
        const res = await httpClient.getAuth<MRBackend>(
          `/api/roles/${rol.id}/modulos`,
          "No se pudieron cargar las asignaciones",
        );
        return res.data.modulos.map((m): ModuloRolAssignment => ({
          id_modulo: m.id,
          id_rol: rol.id,
          nombre_modulo: m.modulo,
          nombre_rol: rol.rol,
          icono_modulo: m.icono ?? undefined,
          descripcion_modulo: m.descripcion ?? undefined,
        }));
      }),
    );

    return groups.flat();
  },

  createModuloRol: async (
    payload: CreateModuloRolPayload,
  ): Promise<ModuloRolAssignment> => {
    // El backend usa sync; hacemos read-modify-write para agregar uno.
    const currentRes = await httpClient.getAuth<MRBackend>(
      `/api/roles/${payload.id_rol}/modulos`,
      "No se pudieron cargar los módulos actuales",
    );
    const currentIds = currentRes.data.modulos.map((m) => m.id);
    const nextIds = [...new Set([...currentIds, payload.id_modulo])];

    await httpClient.postAuth(
      `/api/roles/${payload.id_rol}/modulos`,
      { modulo_ids: nextIds },
      "No se pudo asignar el módulo al rol",
    );

    return {
      id_modulo: payload.id_modulo,
      id_rol: payload.id_rol,
      nombre_rol: currentRes.data.rol.rol,
    };
  },

  deleteModuloRol: async (id_modulo: number, id_rol: number): Promise<void> => {
    await httpClient.deleteAuth<unknown>(
      `/api/roles/${id_rol}/modulos/${id_modulo}`,
      "No se pudo eliminar la asignación módulo-rol",
    );
  },
};
