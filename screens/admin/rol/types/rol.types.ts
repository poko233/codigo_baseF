export type Rol = {
  id: number;
  rol: string;
  descripcion?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RolPayload = {
  rol: string;
  descripcion?: string | null;
};