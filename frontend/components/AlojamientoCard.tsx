import Link from "next/link";
import { AlojamientoResumen } from "@/lib/types";

const TIPO_LABEL: Record<string, string> = {
  HOTEL: "Hotel",
  HOSTEL: "Hostel",
  CABANA: "Cabaña",
  DEPARTAMENTO: "Departamento",
  POSADA: "Posada",
  OTRO: "Otro",
};

export default function AlojamientoCard({
  alojamiento,
}: {
  alojamiento: AlojamientoResumen;
}) {
  return (
    <Link
      href={`/alojamientos/${alojamiento.id}`}
      className="card-hover overflow-hidden block group hover:-translate-y-1"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {alojamiento.fotoPortada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alojamiento.fotoPortada}
            alt={alojamiento.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18" />
            </svg>
            <span className="text-sm">Sin fotos</span>
          </div>
        )}
        <span className="absolute top-3 right-3 badge bg-white/90 text-blue-700 shadow-sm">
          {TIPO_LABEL[alojamiento.tipo] ?? alojamiento.tipo}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate group-hover:text-blue-700 transition">
          {alojamiento.nombre}
        </h3>
        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {alojamiento.ciudad}
          {alojamiento.provincia ? `, ${alojamiento.provincia}` : ""}
        </p>
      </div>
    </Link>
  );
}
