"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import { guardarSesion, destinoPorRol } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";

export default function FormRegistro({
  endpoint,
  textoBoton = "Crear cuenta",
}: {
  endpoint: string;
  textoBoton?: string;
}) {
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
        <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nombre</label>
          <input
            required
            placeholder="Juan"
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Apellido</label>
          <input
            required
            placeholder="Pérez"
            value={form.apellido}
            onChange={(e) => set("apellido", e.target.value)}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">Contraseña</label>
        <input
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">Teléfono (opcional)</label>
        <input
          placeholder="388 123-4567"
          value={form.telefono}
          onChange={(e) => set("telefono", e.target.value)}
          className="input"
        />
      </div>
      <button type="submit" disabled={cargando} className="btn-primary w-full !py-2.5">
        {cargando ? "Creando cuenta..." : textoBoton}
      </button>
    </form>
  );
}
