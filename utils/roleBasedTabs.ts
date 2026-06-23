// utils/roleBasedTabs.ts
export interface TabDefinition {
  name: string; // nombre de archivo en app/(tabs)
  title: string; // etiqueta visible
  icon: string; // nombre de MaterialCommunityIcons
}
const roleTabMap: Record<string, TabDefinition[]> = {
  administrador: [
    { name: "perfil", title: "Perfil", icon: "person-outline" },
    { name: "marcado", title: "Marcado", icon: "create-outline" },
  ],
};

/**
 * Retorna todas las pestañas que corresponden a cualquiera de los roles del usuario.
 * Las pestañas duplicadas (por nombre) se eliminan automáticamente.
 */
export function getTabsForRoles(roles: string[]): TabDefinition[] {
  if (!roles || roles.length === 0) return [];

  const tabsMap = new Map<string, TabDefinition>();

  for (const role of roles) {
    const tabsForRole = roleTabMap[role.toLowerCase()];
    if (tabsForRole) {
      for (const tab of tabsForRole) {
        if (!tabsMap.has(tab.name)) {
          tabsMap.set(tab.name, tab);
        }
      }
    }
  }

  return Array.from(tabsMap.values());
}
