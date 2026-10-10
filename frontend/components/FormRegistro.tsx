"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import { guardarSesion, destinoPorRol } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";

export default function FormRegistro({ endpoint }: { endpoint: string }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const auth = await post<AuthResponse>(endpoint, form);
      guardarSesion(auth);
      // Navegacion completa: recarga el Navbar con la sesion nueva
      window.location.href = destinoPorRol(auth.rol);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded p-3">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          className="border rounded-md px-3 py-2"
        />
        <input
          required
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => set("apellido", e.target.value)}
          className="border rounded-md px-3 py-2"
        />
      </div>
      <input
        type="email"
        required
        placeholder="Email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="Contraseña (mín. 8 caracteres)"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />
      <input
        placeholder="Teléfono (opcional)"
        value={form.telefono}
        onChange={(e) => set("telefono", e.target.value)}
        className="w-full border rounded-md px-3 py-2"
      />
      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {cargando ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
