import { useCallback, useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { rolService } from "../services/rol.service";
import { Rol, RolPayload } from "../types/rol.types";

export function useRoles() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rolService.getAll();
      setRoles(data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudieron cargar los roles",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createRol = async (payload: RolPayload) => {
    try {
      setSaving(true);
      await rolService.create(payload);
      Toast.show({
        type: "success",
        text1: "Rol creado",
        text2: "El rol se registró correctamente",
      });
      await fetchRoles();
      return true;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo crear el rol",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateRol = async (id: number, payload: RolPayload) => {
    try {
      setSaving(true);
      await rolService.update(id, payload);
      Toast.show({
        type: "success",
        text1: "Rol actualizado",
        text2: "Los cambios se guardaron correctamente",
      });
      await fetchRoles();
      return true;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo actualizar el rol",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteRol = async (id: number) => {
    try {
      setDeletingId(id);
      await rolService.delete(id);
      Toast.show({
        type: "success",
        text1: "Rol eliminado",
        text2: "El rol fue eliminado correctamente",
      });
      await fetchRoles();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "No se pudo eliminar el rol",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (item) =>
        item.rol?.toLowerCase().includes(q) ||
        item.descripcion?.toLowerCase().includes(q),
    );
  }, [roles, search]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    filteredRoles,
    loading,
    saving,
    deletingId,
    search,
    setSearch,
    fetchRoles,
    createRol,
    updateRol,
    deleteRol,
  };
}
