import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ThemeName } from "../theme/types";

interface ThemeState {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeName: "light", // valor inicial por defecto
      setThemeName: (name) => set({ themeName: name }),
      toggleTheme: () => {
        const current = get().themeName;
        set({ themeName: current === "light" ? "dark" : "light" });
      },
    }),
    {
      name: "app-theme", // clave en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Si queremos evitar parpadeos durante la hidratación, opcional.
    },
  ),
);
