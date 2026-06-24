import { httpClient } from "@http";
import { CK, TTL, configCache } from "../../../../cache/configCache";
import { useModulesStore } from "../../../../store/modulesStore";
import {
  CreateModuloPayload,
  Modulo,
  UpdateModuloPayload,
} from "../types/modulo.types";

function empId() {
  return 0;
}

async function invalidateAndRefresh() {
  const emp = empId();
  configCache.invalidate(CK.modulos(emp), CK.sidebar(emp));
  await useModulesStore.getState().fetchModulos();
}

export const moduloService = {
  getAll: async (): Promise<Modulo[]> => {
    const key = CK.modulos(empId());
    const cached = configCache.get<Modulo[]>(key);
    if (cached) return cached;
    const res = await httpClient.getAuth<{ data: Modulo[] }>("/api/modulos", "Error al cargar módulos");
    configCache.set(key, res.data, TTL.lista);
    return res.data;
  },

  create: async (data: CreateModuloPayload): Promise<Modulo> => {
    const res = await httpClient.postAuth<{ data: Modulo }>("/api/modulos", data, "Error al crear módulo");
    await invalidateAndRefresh();
    return res.data;
  },

  update: async (id: number, data: UpdateModuloPayload): Promise<Modulo> => {
    const res = await httpClient.putAuth<{ data: Modulo }>(`/api/modulos/${id}`, data, "Error al actualizar módulo");
    await invalidateAndRefresh();
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.deleteAuth<{ message: string }>(`/api/modulos/${id}`, "Error al eliminar módulo");
    await invalidateAndRefresh();
  },
};
