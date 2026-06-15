// screens/auth/types/auth.types.ts

export interface LoginRequest {
  usuario: string; // puede ser username, CI o email
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UsuarioAutenticado;
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

export interface UsuarioAutenticado {
  id: number;
  usuario: string;
  ci: string;
  nombres: string;
  apellidos: string;
  genero: string;
  estado: string;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  foto: string | null;
  // ... otros campos opcionales
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;
