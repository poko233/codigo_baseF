import Toast from "react-native-toast-message";
import { getToken } from "../storage/secureStorage";
import { useAuthStore } from "../store/authStore";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function parseErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text);
    if (json.message) return json.message;
    if (json.error) return json.error;
    if (json.errors)
      return "Algunos datos ya se encuentran registrados o son inválidos.";
    return fallback;
  } catch {
    return text || fallback;
  }
}

async function request<T>(
  path: string,
  options: RequestInit,
  authenticated: boolean,
  fallback: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (authenticated) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const { empresaId, sucursalId } = useAuthStore.getState();
    if (empresaId) headers["X-Empresa-Id"] = String(empresaId);
    if (sucursalId) headers["X-Sucursal-Id"] = String(sucursalId);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
  } catch (networkError: any) {
    if (networkError?.name === "AbortError") throw networkError;

    Toast.show({
      type: "error",
      text1: "Sin conexión",
      text2: "No se pudo conectar al servidor. Revisa tu conexión.",
      visibilityTime: 4000,
    });
    throw {
      status: 0,
      message: "No se pudo conectar al servidor. Revisa tu conexión.",
    };
  }

  if (!res.ok) {
    const message = await parseErrorMessage(res, fallback);
    throw { status: res.status, message };
  }

  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export const httpClient = {
  post: <T>(path: string, body: unknown, fallback = "Error en la petición") =>
    request<T>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      false,
      fallback,
    ),

  getAuth: <T>(
    path: string,
    fallback = "Error al cargar datos",
    signal?: AbortSignal,
  ) => request<T>(path, { method: "GET", signal }, true, fallback),

  postAuth: <T>(
    path: string,
    body: unknown,
    fallback = "Error al guardar datos",
  ) =>
    request<T>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      true,
      fallback,
    ),

  putAuth: <T>(
    path: string,
    body: unknown,
    fallback = "Error al guardar datos",
  ) =>
    request<T>(
      path,
      { method: "PUT", body: JSON.stringify(body) },
      true,
      fallback,
    ),

  deleteAuth: <T>(path: string, fallback = "Error al eliminar datos") =>
    request<T>(path, { method: "DELETE" }, true, fallback),

  async postFormData<T>(url: string, formData: FormData): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const { empresaId, sucursalId } = useAuthStore.getState();
    if (empresaId) headers["X-Empresa-Id"] = String(empresaId);
    if (sucursalId) headers["X-Sucursal-Id"] = String(sucursalId);

    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || "Error al subir archivo",
        errors: data?.errors,
      };
    }
    return data;
  },

  async _rawFetch(path: string, accept: string): Promise<Response> {
    const token = await getToken();
    const headers: Record<string, string> = { Accept: accept };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const { empresaId, sucursalId } = useAuthStore.getState();
    if (empresaId) headers["X-Empresa-Id"] = String(empresaId);
    if (sucursalId) headers["X-Sucursal-Id"] = String(sucursalId);

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let msg = "Error al descargar";
      try {
        msg = JSON.parse(text).message ?? msg;
      } catch {}
      throw new Error(msg);
    }
    return res;
  },
};
