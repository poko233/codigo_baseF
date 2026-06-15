export type GeneroRRHH = "MASCULINO" | "FEMENINO";

export type EstadoUsuarioRRHH = "ACTIVO" | "INACTIVO";

export type RolRRHH = {
  idRol?: number;
  id?: number;
  rol: string;
};

export type NumeroReferenciaRRHH = {
  idNumeroReferencia?: number;
  parentesco?: string | null;
  numeroReferencia?: string | null;
  nombreContactoReferencia?: string | null;
  idUsuario?: number;
};

export type DocumentoUsuarioRRHH = {
  idDocumentoEstudiante: number;
  nombreDocumento: string;
  ubicacionArchivo?: string | null;
  archivoUrl?: string | null;
  estadoDocumento?: string | null;
  idUsuario: number;
};

export type UsuarioRRHH = {
  id: number;
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  genero?: GeneroRRHH | string | null;
  fecha_nac?: string | null;
  email?: string | null;
  telefono?: string | null;
  celular?: string | null;
  direccion?: string | null;
  matricula?: string | null;
  expedido?: string | null;
  codigo_qr?: string | null;
  qrUrl?: string | null;
  foto?: string | null;
  fotoUrl?: string | null;
  estado?: EstadoUsuarioRRHH | string | null;

  roles?: RolRRHH[];

  numeroReferencias?: NumeroReferenciaRRHH | NumeroReferenciaRRHH[] | null;
  numero_referencias?: NumeroReferenciaRRHH | NumeroReferenciaRRHH[] | null;

  documentos?: DocumentoUsuarioRRHH[];

  esEstudiante?: boolean;
};

export type UsuarioFormRRHH = {
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: GeneroRRHH;
  fecha_nac: string;
  email: string;
  telefono: string;
  celular: string;
  direccion: string;
  expedido: string;
  estado: EstadoUsuarioRRHH;

  referenciaNombre: string;
  referenciaParentesco: string;
  referenciaNumero: string;
};

export type UsuarioRRHHForm = UsuarioFormRRHH;

export type FotoUsuarioArchivo = {
  uri: string;
  name: string;
  type: string;
};

export type UsuariosRRHHResponse = {
  usuarios: UsuarioRRHH[];
};

export type UsuarioRRHHResponse = {
  message?: string;
  usuario: UsuarioRRHH;
};