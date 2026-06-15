import { httpClient } from "@http";
import {
  CreateModuloPayload,
  Modulo,
  UpdateModuloPayload,
} from "../types/modulo.types";


export const moduloService = {
  getAll: async () => {
    const res = await httpClient.getAuth<{ data: Modulo[] }>("/api/modulos", "Error al cargar módulos");
    return res.data; // ← desenvuelve aquí
  },

  create: async (data: CreateModuloPayload) => {
    const res = await httpClient.postAuth<{ data: Modulo }>("/api/modulos", data, "Error al crear módulo");
    return res.data;
  },

  update: async (id: number, data: UpdateModuloPayload) => {
    const res = await httpClient.putAuth<{ data: Modulo }>(`/api/modulos/${id}`, data, "Error al actualizar módulo");
    return res.data;
  },

  delete: (id: number) =>
    httpClient.deleteAuth<{ message: string }>(`/api/modulos/${id}`, "Error al eliminar módulo"),
};