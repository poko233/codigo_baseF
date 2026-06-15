import { Platform } from "react-native";
import { httpClient } from "../../../../http/httpClient";
import {
  FotoUsuarioArchivo,
  UsuarioFormRRHH,
  UsuarioRRHH,
} from "../types/recursosHumanos.types";

export async function getUsuariosRRHH(): Promise<{
  usuarios: UsuarioRRHH[];
}> {
  return httpClient.getAuth("/api/recursos-humanos/usuarios");
}

export async function getUsuarioDetalleRRHH(
  id: number,
): Promise<{ usuario: UsuarioRRHH }> {
  return httpClient.getAuth(`/api/recursos-humanos/usuarios/${id}`);
}

export async function actualizarUsuarioRRHH(
  id: number,
  form: UsuarioFormRRHH,
): Promise<{ message: string; usuario: UsuarioRRHH }> {
  return httpClient.putAuth(`/api/recursos-humanos/usuarios/${id}`, form);
}

export async function actualizarFotoRRHH(
  id: number,
  archivo: FotoUsuarioArchivo,
): Promise<{ message: string; usuario: UsuarioRRHH }> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(archivo.uri);
    const blob = await response.blob();

    const file = new File([blob], archivo.name || `foto-${Date.now()}.jpg`, {
      type: archivo.type || blob.type || "image/jpeg",
    });

    formData.append("foto", file);
  } else {
    formData.append("foto", {
      uri: archivo.uri,
      name: archivo.name || `foto-${Date.now()}.jpg`,
      type: archivo.type || "image/jpeg",
    } as any);
  }

  return httpClient.postFormData(
    `/api/recursos-humanos/usuarios/${id}/foto`,
    formData,
  );
}
