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
    <div className="max-w-md mx-auto mt-14 mb-16 px-4">
      <div className="card p-8">
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18M9 21v-6h6v6" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresá a tu cuenta de MiHotel</p>
        </div>
        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
          <button type="submit" disabled={cargando} className="btn-primary w-full !py-2.5">
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <div className="border-t border-gray-100 mt-6 pt-4 space-y-2 text-sm text-center text-gray-600">
          <p>
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="text-blue-600 font-medium hover:underline">
              Registrate
            </Link>
          </p>
          <p>
            ¿Tenés un alojamiento?{" "}
            <Link href="/registro-dueno" className="text-blue-600 font-medium hover:underline">
              Publicalo acá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
