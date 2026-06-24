# CLAUDE.md — Frontend (React Native + Expo)

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React Native + Expo (Expo Router) |
| Lenguaje | TypeScript estricto |
| Estado global | Zustand (`store/authStore.ts`, `store/modulesStore.ts`, `store/themeStore.ts`, `store/confirmStore.ts`) |
| HTTP | Cliente custom en `http/httpClient.ts` — métodos: `getAuth`, `postAuth`, `putAuth`, `deleteAuth`, `postFormData`, `_rawFetch` |
| Toast | `react-native-toast-message` — ya integrado en `httpClient` para errores de red |
| Storage seguro | `storage/secureStorage.ts` — wraps expo-secure-store (nativo) / localStorage cifrado (web) |
| Temas | `theme/themes.ts` con `lightTheme`, `darkTheme`, `premiumTheme`. Hook: `theme/useTheme.ts` |
| Caché | Caché manual en memoria: `cache/configCache.ts` con TTL por tipo |
| Animaciones | `moti`, `react-native-reanimated` |
| Iconos | `@expo/vector-icons` (Ionicons), `lucide-react-native` |

## Estructura de carpetas

```
app/                    ← Expo Router: rutas y layouts
  _layout.tsx           ← Root layout: ThemeProvider, AuthInitializer, ConfirmModal, Toaster
  (auth)/[empresa]/     ← Login (empresa en URL, no en formulario)
  (app)/                ← Pantallas autenticadas (roles, modulos, formularios, permisos…)
  (tabs)/               ← Perfil

components/             ← Componentes globales reutilizables
  ConfirmModal.tsx      ← Modal de confirmación global (leer del confirmStore)
  PermisoGate.tsx       ← Envuelve botones según permisos del sidebar
  Sidebar/              ← Sidebar con SidebarCompanySelector (solo sucursal)
  ui/                   ← Avatar, Badge, Button, Card, Checkbox, EmptyState, Input, SearchBar, Skeleton, TabBar

hooks/                  ← Hooks globales
  useConfirm.ts         ← Retorna la función show del confirmStore
  usePermiso.ts         ← Comprueba un permiso concreto en el modulesStore
  useResponsive.ts

screens/admin/          ← Módulos por feature (estructura: components/hooks/services/types)
  auth/                 ← Login, Register, ForgotPassword, VerifyCode, ResetPassword
  assignments/          ← ModuloRolAdminScreen, FormularioModuloAdminScreen
  forms/                ← FormulariosAdminScreen
  modulos/              ← ModulosScreen
  perfil/               ← PerfilScreen
  permissions/          ← PermisosScreen (matriz rol × formulario × acción)
  recursosHumanos/      ← RecursosHumanosScreen
  rol/                  ← RolScreen, RolPermisosScreen

store/
  authStore.ts          ← user, sucursalId, roles, login(token), logout, initialize
  modulesStore.ts       ← modulos del sidebar, fetchModulos, tienePermiso
  confirmStore.ts       ← estado global del ConfirmModal
  themeStore.ts

storage/
  secureStorage.ts      ← getToken/saveToken/clearSession + (deprecated) getEmpresaId/saveEmpresaId

theme/
  themes.ts             ← lightTheme, darkTheme, premiumTheme
  types.ts              ← AppTheme
  useTheme.ts
```

## Convenciones OBLIGATORIAS

### Confirmaciones y notificaciones
- **Nunca usar `Alert.alert`**. Confirmaciones → `useConfirm()` (devuelve `Promise<boolean>`). Notificaciones → `Toast.show(...)` de `react-native-toast-message`.
- `ConfirmModal` está montado UNA SOLA VEZ en `app/_layout.tsx`. No volver a montarlo.

### Multi-empresa / Multi-sucursal
- **Multi-empresa DESACTIVADO**. No leer, guardar ni enviar `empresaId` en ningún lugar.
- `getEmpresaId` / `saveEmpresaId` en `secureStorage.ts` están marcados como `@deprecated`.
- El header HTTP `X-Empresa-Id` NO se envía. Solo se envía `X-Sucursal-Id`.
- El estado del store solo tiene `sucursalId` (no `empresaId`).

### Permisos en UI
- Todo botón de acción (Ver, Crear, Editar, Eliminar) **DEBE** ir dentro de `<PermisoGate>`.
- Si el usuario no tiene el permiso, el botón NO se renderiza (no basta deshabilitarlo).
- El sidebar del backend devuelve la matriz módulo → formulario → acciones permitidas, cacheada en `modulesStore`.
- Strings de módulo/formulario deben coincidir exactamente (case-insensitive) con los que devuelve `/api/sidebar`.

```tsx
// Patrón correcto — strings EXACTOS del backend: "Ver" | "Crear" | "Editar" | "Eliminar"
<PermisoGate modulo="Configuracion" formulario="Roles" accion="Crear">
  <Button onPress={openCreate} title="Nuevo Rol" />
</PermisoGate>

// Para verificar en lógica
const puede = usePermiso("Configuracion", "Roles", "Eliminar");
```

### HTTP
- Siempre vía `httpClient` (nunca `fetch` directo).
- Métodos autenticados: `getAuth`, `postAuth`, `putAuth`, `deleteAuth`.
- El token se lee automáticamente de `secureStorage`. El header `X-Sucursal-Id` se agrega automáticamente.

### Invalidación de caché de sidebar
- Toda mutación que afecte permisos (sync permisos, asignar módulos/formularios) debe llamar `useModulesStore.getState().fetchModulos()` al éxito.
- Solo refrescar el sidebar si el rol modificado es el del usuario autenticado (comparar con `useAuthStore.getState().roles`).

### Temas
- Estilos siempre desde `theme.colors`. Nunca hardcodear hex.
- `useTheme()` dentro de `ThemeProvider` (ya en el root layout).

### Estructura de archivos por feature
```
screens/admin/{modulo}/
  components/   ← componentes de esta feature
  hooks/        ← hooks con lógica local
  services/     ← llamadas HTTP via httpClient
  types/        ← interfaces TypeScript
```

## Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/login` | Login — body: `{ usuario, password, empresa }` |
| POST | `/api/logout` | Logout |
| GET | `/api/me` | Perfil completo del usuario |

### Sidebar / Permisos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/sidebar` | Estructura: `{ data: [{ id, modulo, formularios: [{ id, formulario, ruta, acciones }] }] }` |
| GET | `/api/roles/{rol}/permisos` | Permisos de un rol |
| PUT | `/api/roles/{rol}/permisos` | Sync permisos — body: `{ permisos: [{id_modulo, id_formulario, acciones}] }` |
| GET | `/api/roles/permisos` | Todos los roles con permisos |

### CRUD base
| Método | Ruta |
|--------|------|
| GET/POST | `/api/roles` |
| PUT/DELETE | `/api/roles/{id}` |
| GET/POST | `/api/modulos` |
| PUT/DELETE | `/api/modulos/{id}` |
| GET/POST | `/api/formularios` |
| PUT/DELETE | `/api/formularios/{id}` |

### Asignaciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/modulo-rol` | Asignar módulo a rol |
| DELETE | `/api/modulo-rol/{id}` | Desasignar |
| GET/POST | `/api/formulario-modulo` | Asignar formulario a módulo |
| DELETE | `/api/formulario-modulo/{id}` | Desasignar |

## Stores — resumen

### authStore
```ts
{ user, loading, sucursalId, roles, allowedRoutes }
login(token)          // guarda token y carga /me
logout()
changeSucursal(id)
hasRole(role)
hasAnyRole(roles[])
```

### modulesStore
```ts
{ modulos, loading, error, allowedRoutes }
fetchModulos()        // GET /api/sidebar
clearModulos()
tienePermiso(modulo, formulario, accion)  // Ver, Crear, Editar, Eliminar
```

### confirmStore
```ts
show(options: ConfirmOptions): Promise<boolean>
// Usar via useConfirm() hook
```

## Patrón de eliminación (reemplaza Alert.alert)

```tsx
const confirm = useConfirm();

const handleDelete = async (id: number) => {
  const ok = await confirm({
    title: '¿Eliminar?',
    message: 'Esta acción no se puede deshacer.',
    variant: 'danger',
    confirmText: 'Eliminar',
  });
  if (!ok) return;
  try {
    await deleteItem(id);
    Toast.show({ type: 'success', text1: 'Eliminado correctamente' });
    refetch();
  } catch (e: any) {
    Toast.show({ type: 'error', text1: e.message });
  }
};
```

## Notas de mantenimiento

- `contexts/AuthContext.tsx` — legacy, no usarlo en código nuevo. El store es `store/authStore.ts`.
- El login URL contiene `[empresa]` como slug de ruta — sigue enviándose al backend para routing de DB, pero el frontend no guarda ni muestra la empresa.
- Los strings de `modulo`/`formulario` en `PermisoGate` y `usePermiso` deben coincidir con los que devuelve el backend en `/api/sidebar`. Verificar en caso de duda.
