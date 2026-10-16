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

const TIPO_LABEL: Record<string, string> = {
  HOTEL: "Hotel",
  HOSTEL: "Hostel",
  CABANA: "Cabaña",
  DEPARTAMENTO: "Departamento",
  POSADA: "Posada",
  OTRO: "Otro",
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
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis alojamientos</h1>
          <p className="text-gray-500 mt-1">
            Gestioná tus propiedades, habitaciones y reservas.
          </p>
        </div>
        <Link href="/panel/nuevo" className="btn-primary">
          + Nuevo alojamiento
        </Link>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>
      )}
      {mios.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-14 h-14 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18M9 21v-6h6v6" />
          </svg>
          <p className="font-medium text-gray-700">Todavía no publicaste ningún alojamiento</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Creá el primero y empezá a recibir reservas.
          </p>
          <Link href="/panel/nuevo" className="btn-primary">
            Crear mi primer alojamiento
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mios.map((a) => (
            <Link
              key={a.id}
              href={`/panel/alojamiento/${a.id}`}
              className="card-hover p-5 flex items-center gap-4"
            >
              <div className="w-20 h-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden shrink-0">
                {a.fotoPortada ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.fotoPortada} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate">{a.nombre}</h2>
                <p className="text-sm text-gray-500">
                  {TIPO_LABEL[a.tipo] ?? a.tipo} · {a.ciudad}
                  {a.provincia ? `, ${a.provincia}` : ""}
                </p>
              </div>
              <span className={`badge ${ESTADO_STYLE[a.estado]}`}>{a.estado}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
