import { modulosEventBus } from "@/screens/admin/events/modulosEventBus";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { adminService } from "../services/admin.service";
import { CreateModuloRolPayload, ModuloRolAssignment } from "../types/admin.types";

export function useModuloRoles() {
  const [assignments, setAssignments] = useState<ModuloRolAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getModuloRoles();
      setAssignments(data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudieron cargar las asignaciones",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const assign = async (payload: CreateModuloRolPayload): Promise<boolean> => {
    try {
      setSaving(true);
      await adminService.createModuloRol(payload);
      Toast.show({
        type: "success",
        text1: "Asignación creada",
        text2: "Módulo asignado al rol correctamente",
      });
      await fetchAssignments();
      modulosEventBus.emit();
      return true;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo asignar el módulo",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id_modulo: number, id_rol: number): Promise<boolean> => {
    try {
      setSaving(true);
      await adminService.deleteModuloRol(id_modulo, id_rol);
      Toast.show({
        type: "success",
        text1: "Eliminado",
        text2: "Asignación eliminada correctamente",
      });
      await fetchAssignments();
      modulosEventBus.emit();
      return true;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo eliminar la asignación",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, loading, saving, fetchAssignments, assign, remove };
}
