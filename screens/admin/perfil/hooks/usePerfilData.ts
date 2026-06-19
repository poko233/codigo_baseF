// screens/admin/perfil/hooks/usePerfilData.ts
import { useAuth } from "../../../../contexts/AuthContext";

export function usePerfilData() {
  const { user } = useAuth();

  const apellido = user
    ? `${user.primer_apellido || ""} ${user.segundo_apellido || ""}`.trim()
    : "";

  const nombreCompleto =
    user?.nombres && apellido
      ? `${user.nombres} ${apellido}`
      : user?.nombres || user?.usuario || "Usuario";

  // Formatear CI + expedido
  const ciExpedido = user?.ci
    ? `${user.ci}${user.expedido ? ` ${user.expedido}` : ""}`
    : "";

  // Formatear fecha de nacimiento
  const formatearFecha = (fecha: string): string => {
    if (!fecha) return "";
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const [anio, mes, dia] = fecha.split("-");
    const diaNum = parseInt(dia, 10);
    const mesNum = parseInt(mes, 10);
    if (isNaN(diaNum) || isNaN(mesNum) || !anio) return fecha;
    return `${diaNum} de ${meses[mesNum - 1]} de ${anio}`;
  };

  const fechaNacimiento = user?.fecha_nac ? formatearFecha(user.fecha_nac) : "";

  return {
    nombreCompleto,
    correo: user?.email || "No registrado",
    telefono: user?.telefono || "No registrado",
    celular: user?.celular || "No registrado",
    direccion: user?.direccion || "No registrada",
    ciExpedido,
    genero: user?.genero || "",
    fechaNacimiento,
    roles: user?.roles.map((r) => r.rol) || [],
    foto: user?.foto || null,
    codigoQr: user?.codigo_qr || null,
  };
}
