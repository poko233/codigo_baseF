import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

const storage = {
  getItem: (key: string) => {
    if (isWeb) {
      return Promise.resolve(localStorage.getItem(key));
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (isWeb) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export async function saveUserProfile(profile: {
  nombre: string;
  foto?: string | null;
  nombreUsuario: string;
}): Promise<void> {
  await storage.setItem("userProfile", JSON.stringify(profile));
}

export async function getUserProfile(): Promise<{
  nombre: string;
  foto?: string | null;
  nombreUsuario: string;
} | null> {
  const raw = await storage.getItem("userProfile");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
