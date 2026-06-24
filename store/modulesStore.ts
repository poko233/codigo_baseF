// store/modulesStore.ts
import { create } from "zustand";
import { httpClient } from "../http/httpClient";
import { modulosEventBus } from "../screens/admin/events/modulosEventBus";

export interface MiFormulario {
  id: number;
  nombre: string;
  ruta: string | null;
  icono: string | null;
  descripcion: string;
  acciones: string[];
}

export interface MiModulo {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  formularios: MiFormulario[];
}

// Forma exacta que devuelve GET /api/sidebar
interface SidebarFormulario {
  id: number;
  nombre: string;
  ruta: string | null;
  icono?: string | null;
  descripcion?: string;
  acciones?: string[];
}

interface SidebarModulo {
  id: number;
  nombre: string;
  icono?: string;
  descripcion?: string;
  formularios: SidebarFormulario[];
}

interface SidebarResponse {
  data: SidebarModulo[];
}

interface ModulesState {
  modulos: MiModulo[];
  loading: boolean;
  error: string | null;
  allowedRoutes: Set<string>;
  fetchModulos: () => Promise<void>;
  clearModulos: () => void;
  tienePermiso: (
    modulo: string,
    formulario: string,
    accion: "Crear" | "Ver" | "Editar" | "Eliminar",
  ) => boolean;
}

function mapSidebarToStore(raw: SidebarModulo[]): MiModulo[] {
  return raw.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion ?? "",
    icono: m.icono ?? "apps",
    formularios: (m.formularios ?? []).map((f) => ({
      id: f.id,
      nombre: f.nombre,
      ruta: f.ruta,
      icono: f.icono ?? null,
      descripcion: f.descripcion ?? "",
      acciones: f.acciones ?? [],
    })),
  }));
}

export const useModulesStore = create<ModulesState>((set, get) => ({
  modulos: [],
  loading: false,
  error: null,
  allowedRoutes: new Set(),

  fetchModulos: async () => {
    if ((get() as any)._fetching) return;
    (get() as any)._fetching = true;
    set({ loading: true, error: null });
    try {
      const data = await httpClient.getAuth<SidebarResponse>(
        "/api/sidebar",
        "Error al cargar el menú lateral",
      );
      const modulos = mapSidebarToStore(data.data ?? []);
      const routes = new Set<string>();
      for (const modulo of modulos) {
        if (modulo.formularios.length > 0) {
          modulo.formularios.forEach((f) => {
            const clean = (f.ruta ?? "").replace(/\\/g, "/").replace(/\/+$/, "") || "/";
            routes.add(clean);
          });
        } else {
          const slug = `/${(modulo.nombre ?? "").toLowerCase().replace(/\s+/g, "-")}`;
          routes.add(slug);
        }
      }
      set({ modulos, allowedRoutes: routes, loading: false });
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al cargar el menú lateral",
        modulos: [],
        allowedRoutes: new Set(),
        loading: false,
      });
    } finally {
      (get() as any)._fetching = false;
    }
  },

  clearModulos: () => {
    set({ modulos: [], allowedRoutes: new Set(), error: null, loading: false });
  },

  tienePermiso: (modulo, formulario, accion) => {
    const all = get().modulos;

    // Primero intenta buscar dentro del módulo exacto
    const mod = all.find(
      (m) => m.nombre.toLowerCase() === modulo.toLowerCase(),
    );
    const form = mod
      ? mod.formularios.find(
          (f) => f.nombre.toLowerCase() === formulario.toLowerCase(),
        )
      // Si el módulo no coincide, busca el formulario en TODOS los módulos
      : all.flatMap((m) => m.formularios).find(
          (f) => f.nombre.toLowerCase() === formulario.toLowerCase(),
        );

    if (!form) return false;
    return form.acciones.some((a) => a.toLowerCase() === accion.toLowerCase());
  },
}));

modulosEventBus.subscribe(() => {
  useModulesStore.getState().fetchModulos();
});
