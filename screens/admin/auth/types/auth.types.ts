// screens/admin/auth/types/auth.types.ts

export interface LoginRequest {
  usuario: string;
  password: string;
  empresa: string;
}

export interface LoginResponse {
  token: string;
  empresa: {
    id: number;
    nombre: string;
  };
  message: string;
}

export interface EmpresaDisponible {
  id: number;
  empresa: string;
}

export interface RolUsuario {
  id: number;
  rol: string;
  id_empresa: number;
  estado: string;
}

export interface SucursalUsuario {
  id: number;
  sucursal: string;
  id_empresa: number;
  estado: string;
}

/**
 * Usuario unificado: exactamente lo que devuelve /api/me en "data".
 */
export interface Usuario {
  id: number;
  usuario: string;
  nombres: string;
  primer_apellido: string;
  segundo_apellido: string;
  ci: string;
  expedido: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  direccion: string;
  genero: string;
  fecha_nac: string;
  foto: string | null;
  codigo_qr: string | null;
  empresas: EmpresaDisponible[];
  roles: RolUsuario[];
  sucursales: SucursalUsuario[];
}

export interface RegisterRequest {
  usuario: string;
  password: string;
  ci: string;
  nombres: string;
  apellidos: string;
  genero: "MASCULINO" | "FEMENINO";
  fecha_nac: string;
  email: string; // opcional, se envía vacío si no se ingresa
  telefono: string;
  celular: string;
  roles: string[];
}

export type RegisterResponse = LoginResponse;
/**
 * Errores de validación del formulario de login.
 */
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

// Los tipos de registro se mantienen para no romper otras pantallas,
// pero quedan fuera del alcance de esta fase.
