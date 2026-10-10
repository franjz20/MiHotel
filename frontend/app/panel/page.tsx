"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { usuarioActual } from "@/lib/auth";
import { AlojamientoResumen, EstadoAlojamiento } from "@/lib/types";

const ESTADO_STYLE: Record<EstadoAlojamiento, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  APROBADO: "bg-green-100 text-green-800",
  RECHAZADO: "bg-red-100 text-red-800",
  SUSPENDIDO: "bg-gray-200 text-gray-600",
};

export default function PanelPage() {
  const router = useRouter();
  const [mios, setMios] = useState<AlojamientoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = usuarioActual();
    if (!u || u.rol !== "DUENO") {
      router.push("/login");
      return;
    }
    get<AlojamientoResumen[]>("/alojamientos/mios")
      .then(setMios)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [router]);

  if (cargando) return <p className="p-8 text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis alojamientos</h1>
        <Link
          href="/panel/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          + Nuevo alojamiento
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {mios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p>Todavía no publicaste ningún alojamiento.</p>
          <Link
            href="/panel/nuevo"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mios.map((a) => (
            <Link
              key={a.id}
              href={`/panel/alojamiento/${a.id}`}
              className="bg-white rounded-lg shadow p-5 flex justify-between items-center hover:shadow-md transition block"
            >
              <div>
                <h2 className="font-semibold text-lg">{a.nombre}</h2>
                <p className="text-sm text-gray-500">
                  {a.tipo} · {a.ciudad}
                  {a.provincia ? `, ${a.provincia}` : ""}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded ${ESTADO_STYLE[a.estado]}`}>
                {a.estado}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
