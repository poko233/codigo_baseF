// modulosEventBus.ts
// Bus de eventos simple para notificar al Sidebar cuando cambian los módulos

type Listener = () => void;

const listeners = new Set<Listener>();

export const modulosEventBus = {
  /** Llama esto después de assign() o remove() exitoso */
  emit: () => {
    listeners.forEach((fn) => fn());
  },
  /** El Sidebar se suscribe aquí */
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => { listeners.delete(fn); }; // retorna unsubscribe
  },
};