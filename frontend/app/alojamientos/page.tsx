"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { get } from "@/lib/api";
import { AlojamientoResumen, TipoAlojamiento } from "@/lib/types";
import AlojamientoCard from "@/components/AlojamientoCard";

const TIPOS: { value: TipoAlojamiento; label: string }[] = [
  { value: "HOTEL", label: "Hotel" },
  { value: "HOSTEL", label: "Hostel" },
  { value: "CABANA", label: "Cabaña" },
  { value: "DEPARTAMENTO", label: "Departamento" },
  { value: "POSADA", label: "Posada" },
  { value: "OTRO", label: "Otro" },
];

function Listado() {
  const params = useSearchParams();
  const [ciudad, setCiudad] = useState(params.get("ciudad") ?? "");
  const [tipo, setTipo] = useState(params.get("tipo") ?? "");
  const [orden, setOrden] = useState("nombre-asc");
  const [lista, setLista] = useState<AlojamientoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    const query = new URLSearchParams();
    if (ciudad.trim()) query.set("ciudad", ciudad.trim());
    if (tipo) query.set("tipo", tipo);
    get<AlojamientoResumen[]>(`/alojamientos?${query}`)
      .then((data) => {
        const ordenada = [...data].sort((a, b) =>
          orden === "nombre-desc"
            ? b.nombre.localeCompare(a.nombre)
            : a.nombre.localeCompare(b.nombre)
        );
        setLista(ordenada);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [ciudad, tipo, orden]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Alojamientos</h1>
        <p className="text-gray-500 mt-1">
          {cargando ? "Buscando..." : `${lista.length} resultado${lista.length !== 1 ? "s" : ""} disponible${lista.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="card p-4 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Ciudad</label>
          <input
            type="text"
            placeholder="Ej: San Salvador de Jujuy"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="input"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Ordenar</label>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="input"
          >
            <option value="nombre-asc">Nombre A → Z</option>
            <option value="nombre-desc">Nombre Z → A</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>
      )}
      {cargando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 font-medium">No se encontraron alojamientos</p>
          <p className="text-sm text-gray-400 mt-1">Probá con otra ciudad o tipo de alojamiento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lista.map((a) => (
            <AlojamientoCard key={a.id} alojamiento={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AlojamientosPage() {
  return (
    <Suspense fallback={<p className="p-8 text-gray-500">Cargando...</p>}>
      <Listado />
    </Suspense>
  );
}
