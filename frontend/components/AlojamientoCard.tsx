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
      className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden block"
    >
      <div className="h-44 bg-gray-200 flex items-center justify-center overflow-hidden">
        {alojamiento.fotoPortada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alojamiento.fotoPortada}
            alt={alojamiento.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">Sin fotos</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg truncate">{alojamiento.nombre}</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {TIPO_LABEL[alojamiento.tipo] ?? alojamiento.tipo}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {alojamiento.ciudad}
          {alojamiento.provincia ? `, ${alojamiento.provincia}` : ""}
        </p>
      </div>
    </Link>
  );
}
