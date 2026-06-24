import React, { ReactNode } from "react";
import { usePermiso } from "../hooks/usePermiso";

interface Props {
  modulo: string;
  formulario: string;
  accion: "Crear" | "Ver" | "Editar" | "Eliminar";
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermisoGate: React.FC<Props> = ({
  modulo,
  formulario,
  accion,
  children,
  fallback = null,
}) => {
  const ok = usePermiso(modulo, formulario, accion);
  return <>{ok ? children : fallback}</>;
};
