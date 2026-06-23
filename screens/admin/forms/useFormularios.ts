import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { modulosEventBus } from "../events/modulosEventBus";
import { adminService } from "../services/admin.service";
import { AdminFormulario, CreateFormularioPayload } from "../types/admin.types";

export function useFormularios() {
  const [formularios, setFormularios] = useState<AdminFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFormularios = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getFormularios();
      setFormularios(data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudieron cargar los formularios",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createFormulario = async (payload: CreateFormularioPayload) => {
    try {
      setSaving(true);
      const created = await adminService.createFormulario(payload);
      setFormularios((prev) => [created, ...prev]);
      modulosEventBus.emit();
      return created;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo crear el formulario",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const deleteFormulario = async (id: number): Promise<boolean> => {
    try {
      await adminService.deleteFormulario(id);
      setFormularios((prev) => prev.filter((f) => f.id !== id));
      Toast.show({ type: "success", text1: "Formulario eliminado" });
      modulosEventBus.emit();
      return true;
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error?.message });
      return false;
    }
  };

  const updateFormulario = async (
    id: number,
    payload: CreateFormularioPayload,
  ): Promise<boolean> => {
    try {
      setSaving(true);
      const updated = await adminService.updateFormulario(id, payload);
      setFormularios((prev) => prev.map((f) => (f.id === id ? updated : f)));
      modulosEventBus.emit();
      return true;
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Error", text2: error?.message });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchFormularios();
  }, [fetchFormularios]);

  return {
    formularios,
    loading,
    saving,
    fetchFormularios,
    createFormulario,
    deleteFormulario,
    updateFormulario,
  };
}
