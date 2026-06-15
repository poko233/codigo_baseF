import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
  actualizarFotoRRHH,
  actualizarUsuarioRRHH,
  getUsuarioDetalleRRHH,
  getUsuariosRRHH,
} from "../services/recursosHumanos.service";
import { UsuarioFormRRHH, UsuarioRRHH } from "../types/recursosHumanos.types";

type ArchivoFoto = {
  uri: string;
  name: string;
  type: string;
};

export function useRecursosHumanos() {
  const [usuarios, setUsuarios] = useState<UsuarioRRHH[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getUsuariosRRHH();

      setUsuarios(data.usuarios || []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al cargar usuarios",
        text2: error?.message || "Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDetalleUsuario = useCallback(async (id: number) => {
    try {
      setCargandoDetalle(true);

      const data = await getUsuarioDetalleRRHH(id);

      return data.usuario || null;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error al cargar detalle",
        text2: error?.message || "Intenta nuevamente.",
      });

      return null;
    } finally {
      setCargandoDetalle(false);
    }
  }, []);

  const guardarUsuario = useCallback(
    async (id: number, form: UsuarioFormRRHH) => {
      try {
        setGuardando(true);

        const data = await actualizarUsuarioRRHH(id, form);
        const actualizado = data.usuario;

        setUsuarios((prev) =>
          prev.map((u) => (u.id === actualizado.id ? actualizado : u)),
        );

        return actualizado;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error al guardar usuario",
          text2: error?.message || "Revisa los datos ingresados.",
        });

        return null;
      } finally {
        setGuardando(false);
      }
    },
    [],
  );

  const actualizarFotoUsuario = useCallback(
    async (id: number, archivo: ArchivoFoto) => {
      try {
        const data = await actualizarFotoRRHH(id, archivo);
        const actualizado = data.usuario;

        setUsuarios((prev) =>
          prev.map((u) => (u.id === actualizado.id ? actualizado : u)),
        );

        return actualizado;
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error al actualizar foto",
          text2: error?.message || "Intenta nuevamente.",
        });

        return null;
      }
    },
    [],
  );

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    loading,
    guardando,
    cargandoDetalle,
    cargarUsuarios,
    cargarDetalleUsuario,
    guardarUsuario,
    actualizarFotoUsuario,
  };
}