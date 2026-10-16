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

  if (cargando)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-xl" />
        <div className="mt-6 h-8 bg-gray-200 rounded w-1/3" />
        <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  if (error || !alojamiento)
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">{error || "Alojamiento no encontrado"}</p>
        <Link href="/alojamientos" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
          ← Volver al listado
        </Link>
      </div>
    );

  const mapsUrl =
    alojamiento.latitud && alojamiento.longitud
      ? `https://www.google.com/maps?q=${alojamiento.latitud},${alojamiento.longitud}`
      : `https://www.google.com/maps?q=${encodeURIComponent(
          `${alojamiento.direccion}, ${alojamiento.ciudad}, ${alojamiento.pais}`
        )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link href="/alojamientos" className="text-sm text-gray-500 hover:text-blue-700 inline-flex items-center gap-1 mb-4">
        ← Volver a alojamientos
      </Link>

      {/* Galería */}
      <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 h-80 sm:h-96 mb-2 relative">
        {alojamiento.fotos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alojamiento.fotos[fotoActual]?.url}
            alt={alojamiento.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-14 h-14 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18" />
            </svg>
            Sin fotos
          </div>
        )}
        {alojamiento.fotos.length > 1 && (
          <span className="absolute bottom-3 right-3 badge bg-black/60 text-white">
            {fotoActual + 1} / {alojamiento.fotos.length}
          </span>
        )}
      </div>
      {alojamiento.fotos.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {alojamiento.fotos.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFotoActual(i)}
              className={`shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === fotoActual ? "border-blue-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight">{alojamiento.nombre}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {alojamiento.direccion}, {alojamiento.ciudad}
            {alojamiento.provincia ? `, ${alojamiento.provincia}` : ""}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 text-sm font-medium hover:text-blue-800 inline-block mt-1"
          >
            Ver ubicación en el mapa →
          </a>

          {alojamiento.descripcion && (
            <div className="mt-8">
              <h2 className="font-bold text-lg mb-2">Acerca de este lugar</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {alojamiento.descripcion}
              </p>
            </div>
          )}

          {alojamiento.servicios.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-lg mb-3">Servicios</h2>
              <div className="flex flex-wrap gap-2">
                {alojamiento.servicios.map((s) => (
                  <span
                    key={s.id}
                    className="badge bg-blue-50 text-blue-700 !text-sm !px-3 !py-1.5 border border-blue-100"
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
          <div className="card p-5 sticky top-20">
            <h2 className="font-bold mb-3">Elegí tus fechas</h2>
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div>
                <label className="label">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <h2 className="font-bold mb-3">Habitaciones</h2>
            <div className="space-y-3">
              {habitaciones.map((h) => (
                <div key={h.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium">{h.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Hasta {h.capacidad} personas · {h.cantidad} unidades
                      </p>
                    </div>
                    <p className="font-bold text-blue-700 whitespace-nowrap">
                      ${h.precioPorNoche.toLocaleString()}
                      <span className="text-xs font-normal text-gray-500">
                        /noche
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => reservar(h.id)}
                    className="mt-2.5 w-full btn-primary !py-2 text-sm"
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
