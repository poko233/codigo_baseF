import { useAuth } from "../../../../contexts/AuthContext";

export function usePerfilData() {
  const { user } = useAuth();
  return {
    nombreCompleto:
      user?.nombres && user?.apellido
        ? `${user.nombres} ${user.apellido}`
        : user?.nombres || user?.nombreUsuario || "Usuario",
    nombreUsuario: user?.nombreUsuario || "",
    correo: user?.correo || "No registrado",
    telefono: user?.telefono || "No registrado",
    direccion: user?.direccion || "No registrada",
    roles: user?.roles || [],
    foto: user?.foto || null,
    codigoQr: user?.codigoQr || null,
  };
}
