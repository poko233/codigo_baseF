import { useCallback, useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { httpClient } from "../../../../http/httpClient";
import { Rol, RolPayload } from "../types/rol.types";

type ApiResponse = {
  success: boolean;
  roles?: Rol[];
  rol?: Rol;
  message?: string;
};

export function useRoles() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);

      const response = await httpClient.getAuth<ApiResponse>(
        "/api/roles",
        "Error al cargar roles",
      );

      setRoles(response.roles ?? []);
    } catch (error) {
      console.error("Error cargando roles:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los roles",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createRol = async (payload: RolPayload) => {
    try {
      setSaving(true);

      await httpClient.postAuth<ApiResponse>(
        "/api/roles",
        payload,
        "Error al crear rol",
      );

      Toast.show({
        type: "success",
        text1: "Rol creado",
        text2: "El rol se registró correctamente",
      });

      await fetchRoles();
      return true;
    } catch (error: any) {
      console.error("Error creando rol:", error);

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

      await httpClient.putAuth<ApiResponse>(
        `/api/roles/${id}`,
        payload,
        "Error al actualizar rol",
      );

      Toast.show({
        type: "success",
        text1: "Rol actualizado",
        text2: "Los cambios se guardaron correctamente",
      });

      await fetchRoles();
      return true;
    } catch (error: any) {
      console.error("Error actualizando rol:", error);

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

      await httpClient.deleteAuth<ApiResponse>(
        `/api/roles/${id}`,
        "Error al eliminar rol",
      );

      Toast.show({
        type: "success",
        text1: "Rol eliminado",
        text2: "El rol fue eliminado correctamente",
      });

      await fetchRoles();
    } catch (error: any) {
      console.error("Error eliminando rol:", error);

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

    return roles.filter((item) => {
      return (
        item.rol?.toLowerCase().includes(q) ||
        item.descripcion?.toLowerCase().includes(q)
      );
    });
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
