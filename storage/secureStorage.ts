// storage/secureCrypto.ts
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

// ─── Claves ────────────────────────────────────────
const TOKEN_KEY = "token";
const EMPRESA_ID_KEY = "empresa_id";
const EMPRESA_NOMBRE_KEY = "empresa_nombre";
const SUCURSAL_ID_KEY = "sucursal_id";
const SECRET_KEY = process.env.EXPO_PUBLIC_MASTER_KEY;

// ─── Helpers de cifrado (web) ──────────────────────
function bufferSourceToBase64(source: BufferSource): string {
  let bytes: Uint8Array;
  if (source instanceof ArrayBuffer) {
    bytes = new Uint8Array(source);
  } else {
    bytes = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
  }
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

async function getKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    str2ab(SECRET_KEY as any),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const salt = str2ab("tecnologicosf-salt");
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Cifra un string y lo persiste en localStorage (web) o expo-secure-store (nativo).
 */
async function encryptedSetItem(key: string, value: string): Promise<void> {
  if (!isWeb) {
    const { default: SecureStore } = await import("expo-secure-store");
    await SecureStore.setItemAsync(key, value);
    return;
  }

  try {
    const cryptoKey = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = str2ab(value);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encoded,
    );
    const storage = {
      iv: bufferSourceToBase64(iv),
      data: bufferSourceToBase64(encrypted),
    };
    localStorage.setItem(key, JSON.stringify(storage));
  } catch {
    // Fallback: si el cifrado falla (navegador muy antiguo), guardar en plano
    localStorage.setItem(key, value);
  }
}

/**
 * Obtiene y descifra un string desde localStorage (web) o expo-secure-store (nativo).
 */
async function encryptedGetItem(key: string): Promise<string | null> {
  if (!isWeb) {
    try {
      const { default: SecureStore } = await import("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const { iv, data } = JSON.parse(stored);
    const cryptoKey = await getKey();
    const ivBuffer = base64ToArrayBuffer(iv);
    const dataBuffer = base64ToArrayBuffer(data);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer },
      cryptoKey,
      dataBuffer,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // Si falla el descifrado, devolver el valor en plano (compatibilidad)
    return stored;
  }
}

/**
 * Elimina un valor del almacenamiento.
 */
async function encryptedRemoveItem(key: string): Promise<void> {
  if (!isWeb) {
    const { default: SecureStore } = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(key);
    return;
  }
  localStorage.removeItem(key);
}

// ─── API pública ───────────────────────────────────

export async function saveToken(token: string): Promise<void> {
  await encryptedSetItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return encryptedGetItem(TOKEN_KEY);
}

/** @deprecated Multi-empresa desactivado. No usar en código nuevo. */
export async function saveEmpresaId(id: number): Promise<void> {
  await encryptedSetItem(EMPRESA_ID_KEY, String(id));
}

/** @deprecated Multi-empresa desactivado. No usar en código nuevo. */
export async function getEmpresaId(): Promise<number | null> {
  const raw = await encryptedGetItem(EMPRESA_ID_KEY);
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function saveEmpresaNombre(nombre: string): Promise<void> {
  await encryptedSetItem(EMPRESA_NOMBRE_KEY, nombre);
}

export async function getEmpresaNombre(): Promise<string | null> {
  return encryptedGetItem(EMPRESA_NOMBRE_KEY);
}

export async function saveSucursalId(id: number | null): Promise<void> {
  if (id === null) {
    await encryptedRemoveItem(SUCURSAL_ID_KEY);
    return;
  }
  await encryptedSetItem(SUCURSAL_ID_KEY, String(id));
}

export async function getSucursalId(): Promise<number | null> {
  const raw = await encryptedGetItem(SUCURSAL_ID_KEY);
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function clearSession(): Promise<void> {
  if (!isWeb) {
    const { default: SecureStore } = await import("expo-secure-store");
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(EMPRESA_ID_KEY),
      SecureStore.deleteItemAsync(EMPRESA_NOMBRE_KEY),
      SecureStore.deleteItemAsync(SUCURSAL_ID_KEY),
    ]);
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMPRESA_ID_KEY);
  localStorage.removeItem(EMPRESA_NOMBRE_KEY);
  localStorage.removeItem(SUCURSAL_ID_KEY);
}
