import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { CK, configCache } from "../../../cache/configCache";
import { useAuthStore } from "../../../store/authStore";
import { useModulesStore } from "../../../store/modulesStore";
import { adminService } from "../services/admin.service";
import { moduloService } from "../modulos/services/modulo.service";
import { Formulario, Modulo } from "../modulos/types/modulo.types";
import { rolService } from "../rol/services/rol.service";
import { RolConPermisos, Rol } from "../rol/types/rol.types";
import { AdminFormulario } from "../types/admin.types";

export type MatrizTodos = Record<number, Record<number, Set<number>>>;

function clonarMatriz(m: MatrizTodos): MatrizTodos {
  const out: MatrizTodos = {};
  for (const ridStr in m) {
    const rid = Number(ridStr);
    out[rid] = {};
    for (const fidStr in m[rid]) {
      const fid = Number(fidStr);
      out[rid][fid] = new Set(m[rid][fid]);
    }
  }
  return out;
}

function matricesIguales(a: MatrizTodos, b: MatrizTodos): boolean {
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
      if (!sb) return false;
      if (sa.size !== sb.size) return false;
      for (const v of sa) if (!sb.has(v)) return false;
    }
  }
  return true;
}

function construirModulosConForms(
  modulosData: Modulo[],
  todosLosFormularios: AdminFormulario[],
): Modulo[] {
  // Mapa moduloId → formularios desde /api/formularios
  const formsPorModulo = new Map<number, Formulario[]>();
  for (const f of todosLosFormularios) {
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
    return forms && forms.length > 0 ? { ...m, formularios: forms } : m;
  });
}

function permisosAMatrizFila(rp: RolConPermisos): Record<number, Set<number>> {
  const fila: Record<number, Set<number>> = {};
  for (const mod of rp.permisos ?? []) {
    for (const form of mod.formularios ?? []) {
      fila[form.id_formulario] = new Set(
        form.acciones
          .map((a) => a.id_accion ?? (a as any).id ?? 0)
          .filter(Boolean),
      );
    }
  }
  return fila;
}

export function usePermisos() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [matriz, setMatriz] = useState<MatrizTodos>({});
  // IDs de roles cuyos permisos aún están cargando
  const [loadingRoles, setLoadingRoles] = useState<Set<number>>(new Set());
  const [loadingBase, setLoadingBase] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const matrizInicialRef = useRef<MatrizTodos>({});
  // Referencia para cancelar cargas si el componente se desmonta
  const canceladoRef = useRef(false);

  const cargar = useCallback(async () => {
    canceladoRef.current = false;
    setLoadingBase(true);
    setMatriz({});
    matrizInicialRef.current = {};

    try {
      // ── FASE 1: 3 llamadas paralelas — pantalla visible en < 1 llamada ──
      const [rolesData, modulosData, todosLosFormularios] = await Promise.all([
        rolService.getAll(),
        moduloService.getAll(),
        adminService.getFormularios(),
      ]);

      if (canceladoRef.current) return;

      const modulosEnriquecidos = construirModulosConForms(modulosData, todosLosFormularios);
      const modulosConForms = modulosEnriquecidos.filter(
        (mo) => (mo.formularios?.length ?? 0) > 0,
      );

      setRoles(rolesData);
      setModulos(modulosConForms.length > 0 ? modulosConForms : modulosEnriquecidos);
      setLoadingRoles(new Set(rolesData.map((r) => r.id)));
      setLoadingBase(false); // ← pantalla se muestra aquí, con skeletons por tarjeta

      // ── FASE 2: permisos de cada rol en paralelo, actualizando la UI a medida que llegan ──
      await Promise.all(
        rolesData.map(async (rol) => {
          try {
            const rp = await rolService.getPermisos(rol.id);
            if (canceladoRef.current) return;

            const fila = permisosAMatrizFila(rp);

            setMatriz((prev) => {
              const next = clonarMatriz(prev);
              next[rol.id] = fila;
              return next;
            });
            matrizInicialRef.current[rol.id] = {};
            for (const fid in fila) {
              matrizInicialRef.current[rol.id][Number(fid)] = new Set(fila[Number(fid)]);
            }
          } catch {
            // Si falla un rol, dejamos su fila vacía (no bloquea el resto)
          } finally {
            if (!canceladoRef.current) {
              setLoadingRoles((prev) => {
                const next = new Set(prev);
                next.delete(rol.id);
                return next;
              });
            }
          }
        }),
      );
    } catch (err: any) {
      if (!canceladoRef.current) {
        setLoadingBase(false);
        Toast.show({ type: "error", text1: "Error al cargar", text2: err?.message });
      }
    }
  }, []);

  useEffect(() => {
    cargar();
    return () => { canceladoRef.current = true; };
  }, [cargar]);

  function toggle(idRol: number, idFormulario: number, idAccion: number) {
    setMatriz((prev) => {
      const next = clonarMatriz(prev);
      if (!next[idRol]) next[idRol] = {};
      const set = new Set(next[idRol][idFormulario] ?? []);

      if (set.has(idAccion)) {
        set.delete(idAccion);
        if (idAccion === 1) set.clear();
      } else {
        set.add(idAccion);
        if (idAccion !== 1) set.add(1);
      }

      next[idRol][idFormulario] = set;
      return next;
    });
  }

  const hayCambios = !matricesIguales(matriz, matrizInicialRef.current);

  async function guardar() {
    setSaving(true);
    try {
      const rolesModificados = roles.filter((r) => {
        const a = matriz[r.id] ?? {};
        const b = matrizInicialRef.current[r.id] ?? {};
        return !matricesIguales({ [r.id]: a }, { [r.id]: b });
      });

      await Promise.all(
        rolesModificados.map(async (rol) => {
          const permisos: { id_modulo: number; id_formulario: number; acciones: number[] }[] = [];
          for (const modulo of modulos) {
            for (const form of modulo.formularios ?? []) {
              const acciones = [...(matriz[rol.id]?.[form.id] ?? [])];
              if (acciones.length > 0) {
                permisos.push({ id_modulo: modulo.id, id_formulario: form.id, acciones });
              }
            }
          }
          await rolService.syncPermisos(rol.id, permisos);
          configCache.invalidate(CK.rolPermisos(rol.id));
        }),
      );

      await useModulesStore.getState().fetchModulos();
      matrizInicialRef.current = clonarMatriz(matriz);
      Toast.show({ type: "success", text1: "Permisos guardados correctamente" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error al guardar", text2: err?.message });
    } finally {
      setSaving(false);
    }
  }

  const rolesFiltrados = search.trim()
    ? roles.filter((r) => r.rol.toLowerCase().includes(search.trim().toLowerCase()))
    : roles;

  return {
    roles,
    rolesFiltrados,
    modulos,
    matriz,
    loadingBase,
    loadingRoles,
    saving,
    hayCambios,
    search,
    setSearch,
    toggle,
    guardar,
    recargar: cargar,
  };
}
