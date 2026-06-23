type Entry<T> = { data: T; expiresAt: number };

class ConfigCache {
  private store = new Map<string, Entry<any>>();

  get<T>(key: string): T | null {
    const e = this.store.get(key);
    if (!e) return null;
    if (Date.now() > e.expiresAt) { this.store.delete(key); return null; }
    return e.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number) {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  invalidate(...keys: string[]) { keys.forEach((k) => this.store.delete(k)); }
  invalidateAll() { this.store.clear(); }
}

export const configCache = new ConfigCache();

export const CK = {
  roles:       (emp: number) => `roles:${emp}`,
  modulos:     (emp: number) => `modulos:${emp}`,
  formularios: (emp: number) => `formularios:${emp}`,
  sidebar:     (emp: number) => `sidebar:${emp}`,
  rolPermisos: (rol: number) => `rol-permisos:${rol}`,
};

export const TTL = {
  lista:    5 * 60 * 1000,
  permisos: 2 * 60 * 1000,
  sidebar:  5 * 60 * 1000,
};
