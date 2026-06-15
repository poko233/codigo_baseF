// storage/secureCrypto.ts
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";
const TOKEN_KEY = "token";
const SECRET_KEY = process.env.EXPO_PUBLIC_MASTER_KEY;

// Convierte ArrayBuffer o Uint8Array a base64
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

// Convierte string a ArrayBuffer directamente (evita Uint8Array para compatibilidad)
function str2ab(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

async function getKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    str2ab(SECRET_KEY as any), // ahora es ArrayBuffer, ok
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

export async function saveToken(token: string): Promise<void> {
  if (!isWeb) {
    const { default: SecureStore } = await import("expo-secure-store");
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }

  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = str2ab(token); // ArrayBuffer
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded, // ArrayBuffer
    );
    const storage = {
      iv: bufferSourceToBase64(iv),
      data: bufferSourceToBase64(encrypted),
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(storage));
  } catch (e) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (!isWeb) {
    try {
      const { default: SecureStore } = await import("expo-secure-store");
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;

  try {
    const { iv, data } = JSON.parse(stored);
    const key = await getKey();
    const ivBuffer = base64ToArrayBuffer(iv);
    const dataBuffer = base64ToArrayBuffer(data);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer },
      key,
      dataBuffer,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return stored;
  }
}

export async function clearSession(): Promise<void> {
  if (!isWeb) {
    const { default: SecureStore } = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
}
