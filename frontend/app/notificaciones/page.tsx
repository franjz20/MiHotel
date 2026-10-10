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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        {notificaciones.some((n) => !n.leida) && (
          <button
            onClick={leerTodas}
            className="text-sm text-blue-600 hover:underline"
          >
            Marcar todas leídas
          </button>
        )}
      </div>
      {notificaciones.length === 0 ? (
        <p className="text-gray-500">No tenés notificaciones todavía.</p>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
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
