"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { usuarioActual } from "@/lib/auth";
import { Alojamiento, Habitacion } from "@/lib/types";

export default function DetalleAlojamiento({ id }: { id: number }) {
  const router = useRouter();
  const [alojamiento, setAlojamiento] = useState<Alojamiento | null>(null);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [fotoActual, setFotoActual] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      get<Alojamiento>(`/alojamientos/${id}`),
      get<Habitacion[]>(`/alojamientos/${id}/habitaciones`),
    ])
      .then(([a, h]) => {
        setAlojamiento(a);
        setHabitaciones(h);
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [id]);

  function reservar(habitacionId: number) {
    if (!usuarioActual()) {
      router.push("/login");
      return;
    }
    const q = new URLSearchParams();
    if (checkIn) q.set("checkIn", checkIn);
    if (checkOut) q.set("checkOut", checkOut);
    router.push(`/reservar/${habitacionId}?${q}`);
  }

  if (cargando) return <p className="p-8 text-gray-500">Cargando...</p>;
  if (error || !alojamiento)
    return <p className="p-8 text-red-600">{error || "No encontrado"}</p>;

  const mapsUrl =
    alojamiento.latitud && alojamiento.longitud
      ? `https://www.google.com/maps?q=${alojamiento.latitud},${alojamiento.longitud}`
      : `https://www.google.com/maps?q=${encodeURIComponent(
          `${alojamiento.direccion}, ${alojamiento.ciudad}, ${alojamiento.pais}`
        )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Galería */}
      <div className="rounded-lg overflow-hidden bg-gray-200 h-80 mb-2">
        {alojamiento.fotos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alojamiento.fotos[fotoActual]?.url}
            alt={alojamiento.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Sin fotos
          </div>
        )}
      </div>
      {alojamiento.fotos.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {alojamiento.fotos.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFotoActual(i)}
              className={`shrink-0 w-20 h-14 rounded overflow-hidden border-2 ${
                i === fotoActual ? "border-blue-600" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">{alojamiento.nombre}</h1>
          <p className="text-gray-500 mt-1">
            {alojamiento.direccion}, {alojamiento.ciudad}
            {alojamiento.provincia ? `, ${alojamiento.provincia}` : ""},{" "}
            {alojamiento.pais}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 text-sm hover:underline"
          >
            Ver ubicación en el mapa →
          </a>

          {alojamiento.descripcion && (
            <p className="mt-6 text-gray-700 whitespace-pre-line">
              {alojamiento.descripcion}
            </p>
          )}

          {alojamiento.servicios.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Servicios</h2>
              <div className="flex flex-wrap gap-2">
                {alojamiento.servicios.map((s) => (
                  <span
                    key={s.id}
                    className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full"
                  >
                    {s.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Habitaciones */}
        <div>
          <div className="bg-white rounded-lg shadow p-4 sticky top-20">
            <h2 className="font-semibold mb-3">Elegí tus fechas</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-xs text-gray-500">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <h2 className="font-semibold mb-3">Habitaciones</h2>
            <div className="space-y-3">
              {habitaciones.map((h) => (
                <div key={h.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{h.nombre}</p>
                      <p className="text-xs text-gray-500">
                        Hasta {h.capacidad} personas · {h.cantidad} unidades
                      </p>
                    </div>
                    <p className="font-bold text-blue-700">
                      ${h.precioPorNoche.toLocaleString()}
                      <span className="text-xs font-normal text-gray-500">
                        /noche
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => reservar(h.id)}
                    className="mt-2 w-full bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700"
                  >
                    Reservar
                  </button>
                </div>
              ))}
              {habitaciones.length === 0 && (
                <p className="text-sm text-gray-500">
                  Este alojamiento aún no cargó habitaciones.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
