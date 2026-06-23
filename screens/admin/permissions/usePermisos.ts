
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { Alert, Platform } from "react-native";
import { CK, configCache, TTL } from "../../../cache/configCache";
import { useModulesStore } from "../../../store/modulesStore";
import { adminService } from "../services/admin.service";
import { moduloService } from "../modulos/services/modulo.service";
import { rolService } from "../rol/services/rol.service";
import type { Formulario, Modulo } from "../modulos/types/modulo.types";
import type { RolConPermisos } from "../rol/types/rol.types";
import type { AdminFormulario } from "../types/admin.types";
import type { MatrizTodos, PermisoSync } from "./types";

// ─── Helpers puros (sin estado, fáciles de testear) ──────────────────────────

export function clonarMatriz(m: MatrizTodos): MatrizTodos {
  const out: MatrizTodos = {};
  for (const ridStr in m) {
    const rid = Number(ridStr);
    out[rid] = {};
    for (const fidStr in m[rid]) {
      out[rid][Number(fidStr)] = new Set(m[rid][Number(fidStr)]);
    }
  }
  return out;
}

export function matricesIguales(a: MatrizTodos, b: MatrizTodos): boolean {
  const ridsA = Object.keys(a).map(Number);
  const ridsB = Object.keys(b).map(Number);
  if (ridsA.length !== ridsB.length) return false;
  for (const rid of ridsA) {
    const fidsA = Object.keys(a[rid] ?? {}).map(Number);
    const fidsB = Object.keys(b[rid] ?? {}).map(Number);
    if (fidsA.length !== fidsB.length) return false;
    for (const fid of fidsA) {
      const sa = a[rid][fid];
      const sb = b[rid]?.[fid];
      if (!sb || sa.size !== sb.size) return false;
      for (const v of sa) if (!sb.has(v)) return false;
    }
  }
  return true;
}

// Convierte la respuesta de /roles/permisos a la matriz interna
export function rolesPermisosAMatriz(rolesConPermisos: RolConPermisos[]): MatrizTodos {
  const m: MatrizTodos = {};
  for (const rol of rolesConPermisos) {
    m[rol.id] = {};
    for (const modulo of rol.permisos ?? []) {
      for (const form of modulo.formularios ?? []) {
        m[rol.id][form.id_formulario] = new Set(
          form.acciones
            .map((a) => a.id_accion ?? (a as any).id ?? 0)
            .filter(Boolean),
        );
      }
    }
  }
  return m;
}

// Enriquece módulos con sus formularios cuando el endpoint /modulos no los trae
export function enriquecerModulos(
  modulosData: Modulo[],
  todosFormularios: AdminFormulario[],
): Modulo[] {
  const formsPorModulo = new Map<number, Formulario[]>();
  for (const f of todosFormularios) {
    for (const mod of f.modulos ?? []) {
      if (!formsPorModulo.has(mod.id)) formsPorModulo.set(mod.id, []);
      formsPorModulo.get(mod.id)!.push({
        id: f.id,
        formulario: f.formulario,
        descripcion: f.descripcion,
        ruta: f.ruta,
        estado: f.estado,
      });
    }
  }
  return modulosData.map((m): Modulo => {
    if (m.formularios && m.formularios.length > 0) return m;
    const forms = formsPorModulo.get(m.id);
    return forms?.length ? { ...m, formularios: forms } : m;
  });
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function usePermisos() {
  const [roles, setRoles] = useState<RolConPermisos[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [matriz, setMatriz] = useState<MatrizTodos>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const matrizInicialRef = useRef<MatrizTodos>({});
  const canceladoRef = useRef(false);

  const cargar = useCallback(async () => {
    canceladoRef.current = false;
    setLoading(true);
    setMatriz({});
    matrizInicialRef.current = {};

    try {
      // ── UNA sola tanda de 3 llamadas paralelas ──────────────────────────
      // Antes eran 3 + N (una por cada rol). Ahora son siempre 3 en total.
      const [rolesConPermisos, modulosData, todosFormularios] = await Promise.all([
        rolService.getAllConPermisos(),    // GET /roles/permisos  ← el nuevo endpoint
        moduloService.getAll(),            // GET /modulos
        adminService.getFormularios(),     // GET /formularios
      ]);

      if (canceladoRef.current) return;

      // Construir matriz desde la respuesta agrupada
      const nuevaMatriz = rolesPermisosAMatriz(rolesConPermisos);

      // Enriquecer módulos con formularios si hace falta
      const modulosEnriquecidos = enriquecerModulos(modulosData, todosFormularios);
      const modulosConForms = modulosEnriquecidos.filter(
        (m) => (m.formularios?.length ?? 0) > 0,
      );

      setRoles(rolesConPermisos);
      setModulos(modulosConForms.length > 0 ? modulosConForms : modulosEnriquecidos);
      setMatriz(nuevaMatriz);

      // Guardar copia inicial para detectar cambios
      matrizInicialRef.current = clonarMatriz(nuevaMatriz);
    } catch (err: any) {
      if (!canceladoRef.current) {
        Toast.show({ type: "error", text1: "Error al cargar permisos", text2: err?.message });
      }
    } finally {
      if (!canceladoRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    return () => { canceladoRef.current = true; };
  }, [cargar]);

  // ── Toggle de un checkbox ─────────────────────────────────────────────────
  function toggle(idRol: number, idFormulario: number, idAccion: number) {
    setMatriz((prev) => {
      const next = clonarMatriz(prev);
      if (!next[idRol]) next[idRol] = {};
      const set = new Set(next[idRol][idFormulario] ?? []);

      if (set.has(idAccion)) {
        set.delete(idAccion);
        if (idAccion === 1) set.clear(); // desmarcar Ver → limpiar todo el formulario
      } else {
        set.add(idAccion);
        if (idAccion !== 1) set.add(1); // marcar cualquier acción → auto-agrega Ver
      }

      next[idRol][idFormulario] = set;
      return next;
    });
  }

  // ── Guardar solo los roles que cambiaron ──────────────────────────────────
  async function guardar() {
    setSaving(true);
    try {
      const rolesModificados = roles.filter((r) => {
        const a = matriz[r.id] ?? {};
        const b = matrizInicialRef.current[r.id] ?? {};
        return !matricesIguales({ [r.id]: a }, { [r.id]: b });
      });

      if (rolesModificados.length === 0) {
        Toast.show({ type: "info", text1: "Sin cambios que guardar" });
        return;
      }

      // Manda un PUT por cada rol modificado (en paralelo)
      await Promise.all(
        rolesModificados.map(async (rol) => {
          const permisos: PermisoSync[] = [];

          for (const modulo of modulos) {
            for (const form of modulo.formularios ?? []) {
              const acciones = [...(matriz[rol.id]?.[form.id] ?? [])];
              if (acciones.length > 0) {
                permisos.push({
                  id_modulo: modulo.id,
                  id_formulario: form.id,
                  acciones,
                });
              }
            }
          }

          await rolService.syncPermisos(rol.id, permisos);

          // Invalida caché de este rol y del endpoint nuevo
          configCache.invalidate(
            CK.rolPermisos(rol.id),
            CK.todosRolesPermisos(rol.id_empresa ?? 0),
          );
        }),
      );

      // Actualiza sidebar dinámico
      await useModulesStore.getState().fetchModulos();

      // El estado inicial ahora es el estado actual
      matrizInicialRef.current = clonarMatriz(matriz);

      Toast.show({ type: "success", text1: "Permisos guardados correctamente" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al guardar", text2: err?.message });
    } finally {
      setSaving(false);
    }
  }

  // ── Cancelar con confirmación si hay cambios ──────────────────────────────
  function cancelar() {
    if (!hayCambios) return;
    if (Platform.OS === "web") {
      if (globalThis.confirm?.("¿Descartar los cambios?")) cargar();
      return;
    }
    Alert.alert(
      "Descartar cambios",
      "¿Quieres descartar los cambios no guardados?",
      [
        { text: "Seguir editando", style: "cancel" },
        { text: "Descartar", style: "destructive", onPress: cargar },
      ],
    );
  }

  const hayCambios = !matricesIguales(matriz, matrizInicialRef.current);

  const rolesFiltrados = search.trim()
    ? roles.filter((r) => r.rol.toLowerCase().includes(search.toLowerCase()))
    : roles;

  return {
    // datos
    roles,
    rolesFiltrados,
    modulos,
    matriz,
    // estados
    loading,
    saving,
    hayCambios,
    search,
    // acciones
    setSearch,
    toggle,
    guardar,
    cancelar,
    recargar: cargar,
  };
}