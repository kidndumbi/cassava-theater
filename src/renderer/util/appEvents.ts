type Listener<T = any> = (data: T) => void;

type ListenersMap = {
  [event: string]: Listener[];
};

const listeners: ListenersMap = {};

export function on<T = any>(event: string, callback: Listener<T>): void {
  listeners[event] = listeners[event] || [];
  listeners[event].push(callback as Listener);
}

export function off<T = any>(event: string, callback: Listener<T>): void {
  listeners[event] = (listeners[event] || []).filter(cb => cb !== callback);
}

export function emit<T = any>(event: string, data: T): void {
  (listeners[event] || []).forEach(cb => cb(data));
}