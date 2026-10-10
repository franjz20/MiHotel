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
      <h1 className="text-2xl font-bold mb-6">Alojamientos</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Ciudad"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="border rounded-md px-3 py-2 flex-1 min-w-40"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="nombre-asc">Nombre A → Z</option>
          <option value="nombre-desc">Nombre Z → A</option>
        </select>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {cargando ? (
        <p className="text-gray-500">Cargando...</p>
      ) : lista.length === 0 ? (
        <p className="text-gray-500">No se encontraron alojamientos.</p>
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
