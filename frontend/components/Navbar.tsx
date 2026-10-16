"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cerrarSesion, usuarioActual } from "@/lib/auth";
import { UsuarioSesion } from "@/lib/types";
import NotificacionesBell from "./NotificacionesBell";

const LINK_BASE = "px-3 py-1.5 rounded-lg text-sm font-medium transition";
const LINK_IDLE = "text-gray-600 hover:text-blue-700 hover:bg-blue-50";
const LINK_ACTIVO = "text-blue-700 bg-blue-50";

export default function Navbar() {
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    setUsuario(usuarioActual());
  }, [pathname]);

  function linkClass(href: string) {
    return `${LINK_BASE} ${pathname === href || pathname.startsWith(href + "/") ? LINK_ACTIVO : LINK_IDLE}`;
  }

  return (
    <header className="bg-white/85 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-blue-700">
          <span className="bg-blue-600 text-white rounded-lg p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18M9 21v-6h6v6" />
            </svg>
          </span>
          <span className="text-xl font-bold tracking-tight">MiHotel</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link href="/alojamientos" className={linkClass("/alojamientos")}>
            Explorar
          </Link>

          {usuario?.rol === "CLIENTE" && (
            <Link href="/mis-reservas" className={linkClass("/mis-reservas")}>
              Mis reservas
            </Link>
          )}
          {usuario?.rol === "DUENO" && (
            <Link href="/panel" className={linkClass("/panel")}>
              Mi panel
            </Link>
          )}
          {usuario?.rol === "ADMIN" && (
            <Link href="/admin" className={linkClass("/admin")}>
              Administración
            </Link>
          )}

          {usuario ? (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
              <NotificacionesBell />
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {usuario.nombre}
                </span>
              </div>
              <button
                onClick={cerrarSesion}
                className="text-sm text-gray-500 hover:text-red-600 transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 ml-2">
              <Link
                href="/registro-dueno"
                className={`${LINK_BASE} ${LINK_IDLE} hidden md:inline`}
              >
                Publicá tu alojamiento
              </Link>
              <Link href="/login" className={`${LINK_BASE} ${LINK_IDLE}`}>
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="btn-primary text-sm !py-1.5"
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
