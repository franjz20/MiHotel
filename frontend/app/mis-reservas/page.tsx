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
      <h1 className="text-2xl font-bold mb-6">Mis reservas</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {reservas.length === 0 ? (
        <p className="text-gray-500">
          Todavía no hiciste reservas.{" "}
          <Link href="/alojamientos" className="text-blue-600 hover:underline">
            Explorar alojamientos
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {reservas.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
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
                  <p className="text-sm mt-1">
                    {r.checkIn} → {r.checkOut} · {r.cantidadUnidades} unidad
                    {r.cantidadUnidades > 1 ? "es" : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    Huésped: {r.huespedNombre}
                  </p>
                  {r.motivoRechazo && (
                    <p className="text-sm text-red-600 mt-1">
                      Motivo: {r.motivoRechazo}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded ${ESTADO_STYLE[r.estado]}`}
                  >
                    {r.estado}
                  </span>
                  <p className="font-bold mt-2">
                    ${r.precioTotal.toLocaleString()}
                  </p>
                  {(r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && (
                    <button
                      onClick={() => cancelar(r.id)}
                      className="text-red-600 text-sm hover:underline mt-2"
                    >
                      Cancelar
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
