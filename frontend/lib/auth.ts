import { AuthResponse, Rol, UsuarioSesion } from "./types";

export function guardarSesion(auth: AuthResponse) {
  localStorage.setItem("token", auth.token);
  localStorage.setItem(
    "usuario",
    JSON.stringify({ email: auth.email, nombre: auth.nombre, rol: auth.rol })
  );
}

export function usuarioActual(): UsuarioSesion | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("usuario");
  if (!raw || !localStorage.getItem("token")) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "/";
}

export function destinoPorRol(rol: Rol): string {
  if (rol === "ADMIN") return "/admin";
  if (rol === "DUENO") return "/panel";
  return "/";
}
