"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get, patch } from "@/lib/api";
import { usuarioActual } from "@/lib/auth";
import { EstadoReserva, Reserva } from "@/lib/types";

const ESTADO_STYLE: Record<EstadoReserva, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADA: "bg-green-100 text-green-800",
  RECHAZADA: "bg-red-100 text-red-800",
  CANCELADA: "bg-gray-200 text-gray-600",
  COMPLETADA: "bg-blue-100 text-blue-800",
};

export default function MisReservasPage() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  function cargar() {
    get<Reserva[]>("/reservas/mias")
      .then(setReservas)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    const u = usuarioActual();
    if (!u) {
      router.push("/login");
      return;
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancelar(id: number) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    try {
      await patch(`/reservas/${id}/cancelar`);
      cargar();
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo cancelar");
    }
  }

  if (cargando) return <p className="p-8 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mis reservas</h1>
        <p className="text-gray-500 mt-1">Tus reservas y su estado actual.</p>
      </div>
      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>
      )}
      {reservas.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium text-gray-700">Todavía no hiciste reservas</p>
          <Link href="/alojamientos" className="btn-primary inline-block mt-4">
            Explorar alojamientos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map((r) => (
            <div key={r.id} className="card-hover p-5">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <Link
                    href={`/alojamientos/${r.alojamientoId}`}
                    className="font-semibold text-lg hover:text-blue-700"
                  >
                    {r.alojamientoNombre}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {r.habitacionNombre} · {r.alojamientoCiudad}
                  </p>
                  <p className="text-sm mt-2 flex items-center gap-1.5 text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {r.checkIn} → {r.checkOut} · {r.cantidadUnidades} unidad
                    {r.cantidadUnidades > 1 ? "es" : ""}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Huésped: {r.huespedNombre}
                  </p>
                  {r.motivoRechazo && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mt-2 inline-block">
                      Motivo: {r.motivoRechazo}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`badge ${ESTADO_STYLE[r.estado]}`}>
                    {r.estado}
                  </span>
                  <p className="font-bold text-lg mt-2">
                    ${r.precioTotal.toLocaleString()}
                  </p>
                  {(r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && (
                    <button
                      onClick={() => cancelar(r.id)}
                      className="text-red-600 text-sm hover:underline mt-2"
                    >
                      Cancelar reserva
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
