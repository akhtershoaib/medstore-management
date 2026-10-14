const BASE = '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (res.status === 403) throw new Error('You do not have permission to do this.');
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = data && data.error;
    if (typeof e === 'string') throw new Error(e);
    if (e && typeof e === 'object') throw new Error(Object.values(e).join(', '));
    throw new Error(`Request failed (${res.status})`);
  }
  return data;
}

export const money = (n) => '₹' + Number(n || 0).toFixed(2);
