const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export async function apiGet<T>(path: string): Promise<T> {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not configured');
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`MEGHNETRA API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}
