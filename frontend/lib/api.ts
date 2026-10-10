// Wrapper de fetch: agrega el token JWT y convierte ApiError del backend en Error
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const error = await res.json();
      if (error.message) mensaje = error.message;
    } catch {
      // respuesta sin body JSON
    }
    throw new Error(mensaje);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const get = <T>(path: string) => api<T>(path);

export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });

export const put = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const patch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });

export const del = (path: string) =>
  api<void>(path, { method: "DELETE" });
