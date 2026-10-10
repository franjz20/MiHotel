"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { get, patch } from "@/lib/api";
import { Notificacion } from "@/lib/types";

export default function NotificacionesBell() {
  const [cantidad, setCantidad] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  function cargarContador() {
    get<{ cantidad: number }>("/notificaciones/no-leidas")
      .then((r) => setCantidad(r.cantidad))
      .catch(() => {});
  }

  useEffect(() => {
    cargarContador();
    const intervalo = setInterval(cargarContador, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  function abrir() {
    if (!abierto) {
      get<Notificacion[]>("/notificaciones")
        .then((n) => setNotificaciones(n.slice(0, 10)))
        .catch(() => {});
    }
    setAbierto(!abierto);
  }

  async function leer(n: Notificacion) {
    if (!n.leida) {
      await patch(`/notificaciones/${n.id}/leer`).catch(() => {});
      cargarContador();
      setNotificaciones((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x))
      );
    }
  }

  async function leerTodas() {
    await patch("/notificaciones/leer-todas").catch(() => {});
    cargarContador();
    setNotificaciones((prev) => prev.map((x) => ({ ...x, leida: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={abrir}
        className="relative p-1 hover:text-blue-700"
        aria-label="Notificaciones"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {cantidad > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {cantidad > 9 ? "9+" : cantidad}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <span className="font-semibold text-sm">Notificaciones</span>
            {cantidad > 0 && (
              <button
                onClick={leerTodas}
                className="text-xs text-blue-600 hover:underline"
              >
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="text-sm text-gray-500 p-4">
                No tenés notificaciones.
              </p>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  onClick={() => leer(n)}
                  className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 ${
                    n.leida ? "opacity-60" : ""
                  }`}
                >
                  <p className="text-sm font-medium flex items-center gap-2">
                    {!n.leida && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                    )}
                    {n.titulo}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.mensaje}</p>
                </button>
              ))
            )}
          </div>
          <Link
            href="/notificaciones"
            onClick={() => setAbierto(false)}
            className="block text-center text-xs text-blue-600 py-2 border-t hover:underline"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}
