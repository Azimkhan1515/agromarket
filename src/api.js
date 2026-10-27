// В Vite локально используется настоящий json-server из лабораторной.
export const labMode = ['localhost', '127.0.0.1'].includes(location.hostname);
export const API_URL = import.meta.env.VITE_API_URL || (location.hostname === 'terminal.local' ? '/api' : 'http://localhost:3001');
export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options, headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.status === 204 ? null : response.json();
}
export async function getProducts(signal) {
  if (labMode) return request('/products', { signal });
  const response = await fetch('/db.json', { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { products } = await response.json();
  return products;
}
export const money = value => new Intl.NumberFormat('ru-KZ').format(value);
export function readStore(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; }
  catch { return fallback; }
}
