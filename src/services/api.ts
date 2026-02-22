const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Clase de error tipada ──────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly error?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Respuesta estándar del backend ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

// ── Manejo centralizado de la respuesta ───────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Si el token expiró o no es válido → limpia la sesión
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        document.cookie =
          'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/signin';
      }
    }

    const body = json as { message?: string; error?: string };
    throw new ApiError(
      res.status,
      body.message ?? 'Error inesperado',
      body.error,
    );
  }

  // El backend envuelve todo en { success, statusCode, data, timestamp }
  const body = json as ApiResponse<T>;
  return body.data !== undefined ? body.data : (json as T);
}

// ── Cliente HTTP ───────────────────────────────────────────────────────────
export const api = {
  async post<T = unknown>(endpoint: string, body: unknown, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async get<T = unknown>(endpoint: string, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse<T>(res);
  },

  async patch<T = unknown>(endpoint: string, body: unknown, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async delete<T = unknown>(endpoint: string, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse<T>(res);
  },
};
