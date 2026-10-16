"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get, patch } from "@/lib/api";
import { usuarioActual } from "@/lib/auth";
import { Notificacion } from "@/lib/types";

export default function NotificacionesPage() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuarioActual()) {
      router.push("/login");
      return;
    }
    get<Notificacion[]>("/notificaciones")
      .then(setNotificaciones)
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function leerTodas() {
    await patch("/notificaciones/leer-todas").catch(() => {});
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  }

  if (cargando) return <p className="p-8 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-gray-500 mt-1">Avisos sobre tu cuenta y reservas.</p>
        </div>
        {notificaciones.some((n) => !n.leida) && (
          <button onClick={leerTodas} className="btn-secondary btn-sm !text-xs">
            Marcar todas leídas
          </button>
        )}
      </div>
      {notificaciones.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-600 font-medium">No tenés notificaciones todavía</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {notificaciones.map((n) => (
            <div key={n.id} className={`p-4 ${n.leida ? "opacity-60" : ""}`}>
              <p className="font-medium text-sm flex items-center gap-2">
                {!n.leida && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                )}
                {n.titulo}
                <span className="text-xs text-gray-400 font-normal ml-auto">
                  {new Date(n.createdAt).toLocaleDateString("es-AR")}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">{n.mensaje}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
