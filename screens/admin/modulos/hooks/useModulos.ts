import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { moduloService } from "../services/modulo.service";
import {
    CreateModuloPayload,
    Modulo,
    UpdateModuloPayload,
} from "../types/modulo.types";

export function useModulos() {
  const [modulos, setModulos]     = useState<Modulo[]>([]);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Cargar ────────────────────────────────────────────────────────────────
  const fetchModulos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await moduloService.getAll();
      setModulos(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Crear ─────────────────────────────────────────────────────────────────
  const createModulo = async (payload: CreateModuloPayload): Promise<boolean> => {
    try {
      const nuevo = await moduloService.create(payload);
      setModulos((prev) => [...prev, nuevo]);
      Toast.show({ type: "success", text1: "Módulo creado correctamente" });
      return true;
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al crear", text2: err.message });
      return false;
    }
  };

  // ── Editar ────────────────────────────────────────────────────────────────
  const updateModulo = async (
    id: number,
    payload: UpdateModuloPayload
  ): Promise<boolean> => {
    try {
      const updated = await moduloService.update(id, payload);
      setModulos((prev) => prev.map((m) => (m.id === id ? updated : m)));
      Toast.show({ type: "success", text1: "Módulo actualizado" });
      return true;
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al editar", text2: err.message });
      return false;
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const deleteModulo = async (id: number): Promise<boolean> => {
    try {
      await moduloService.delete(id);
      setModulos((prev) => prev.filter((m) => m.id !== id));
      Toast.show({ type: "success", text1: "Módulo eliminado" });
      return true;
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al eliminar", text2: err.message });
      return false;
    }
  };

  useEffect(() => {
    fetchModulos();
  }, []);

  return {
    modulos,
    loading,
    refreshing,
    fetchModulos,
    onRefresh: () => {
      setRefreshing(true);
      fetchModulos(true);
    },
    createModulo,
    updateModulo,
    deleteModulo,
  };
}