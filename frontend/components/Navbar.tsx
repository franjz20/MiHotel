"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cerrarSesion, usuarioActual } from "@/lib/auth";
import { UsuarioSesion } from "@/lib/types";
import NotificacionesBell from "./NotificacionesBell";

export default function Navbar() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    setUsuario(usuarioActual());
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">
          MiHotel
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/alojamientos" className="hover:text-blue-700">
            Explorar
          </Link>

          {usuario?.rol === "CLIENTE" && (
            <Link href="/mis-reservas" className="hover:text-blue-700">
              Mis reservas
            </Link>
          )}
          {usuario?.rol === "DUENO" && (
            <Link href="/panel" className="hover:text-blue-700">
              Mi panel
            </Link>
          )}
          {usuario?.rol === "ADMIN" && (
            <Link href="/admin" className="hover:text-blue-700">
              Administración
            </Link>
          )}

          {usuario ? (
            <div className="flex items-center gap-3">
              <NotificacionesBell />
              <span className="text-gray-600">Hola, {usuario.nombre}</span>
              <button
                onClick={cerrarSesion}
                className="text-red-600 hover:underline"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/registro-dueno"
                className="hover:text-blue-700 hidden sm:inline"
              >
                Publicá tu alojamiento
              </Link>
              <Link href="/login" className="hover:text-blue-700">
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
