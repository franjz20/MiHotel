"use client";

import Link from "next/link";
import { useState } from "react";
import { post } from "@/lib/api";
import { destinoPorRol, guardarSesion } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const auth = await post<AuthResponse>("/auth/login", { email, password });
      guardarSesion(auth);
      // Navegacion completa: recarga el Navbar con la sesion nueva
      window.location.href = destinoPorRol(auth.rol);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded p-3 mb-4">{error}</p>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-blue-600 hover:underline">
            Registrate
          </Link>
        </p>
        <p className="text-sm text-center mt-2 text-gray-600">
          ¿Tenés un alojamiento?{" "}
          <Link href="/registro-dueno" className="text-blue-600 hover:underline">
            Publicalo acá
          </Link>
        </p>
      </div>
    </div>
  );
}
