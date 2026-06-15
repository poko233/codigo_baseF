import { modulosEventBus } from "@/screens/admin/events/modulosEventBus";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { adminService } from "../services/admin.service";
import { CreateModuloRolPayload, ModuloRolAssignment } from "../types/admin.types";

export function useModuloRoles() {
  const [assignments, setAssignments] = useState<ModuloRolAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  /* ── GET ─────────────────────────────────────────── */
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

  /* ── POST ────────────────────────────────────────── */
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
      modulosEventBus.emit(); // 🔔 avisa al Sidebar
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

  /* ── DELETE ──────────────────────────────────────── */
  const remove = async (id: number): Promise<boolean> => {
    try {
      setSaving(true);
      await adminService.deleteModuloRol(id);
      Toast.show({
        type: "success",
        text1: "Eliminado",
        text2: "Asignación eliminada correctamente",
      });
      await fetchAssignments();
      modulosEventBus.emit(); // 🔔 avisa al Sidebar
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