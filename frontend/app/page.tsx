"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { AlojamientoResumen } from "@/lib/types";
import AlojamientoCard from "@/components/AlojamientoCard";

export default function Home() {
  const router = useRouter();
  const [ciudad, setCiudad] = useState("");
  const [destacados, setDestacados] = useState<AlojamientoResumen[]>([]);

  useEffect(() => {
    get<AlojamientoResumen[]>("/alojamientos")
      .then((lista) => setDestacados(lista.slice(0, 6)))
      .catch(() => {});
  }, []);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = ciudad.trim();
    router.push(q ? `/alojamientos?ciudad=${encodeURIComponent(q)}` : "/alojamientos");
  }

  return (
    <div>
      <section className="bg-blue-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Encontrá tu próximo alojamiento
          </h1>
          <p className="text-blue-100 mb-8">
            Hoteles, hostels, cabañas y más. Reservá online y pagá al llegar.
          </p>
          <form
            onSubmit={buscar}
            className="flex gap-2 max-w-xl mx-auto bg-white rounded-lg p-2 shadow-lg"
          >
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="¿A qué ciudad viajás?"
              className="flex-1 px-4 py-2 text-gray-800 rounded-md outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-800 px-6 py-2 rounded-md font-medium"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Alojamientos destacados</h2>
          <Link href="/alojamientos" className="text-blue-600 hover:underline text-sm">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destacados.map((a) => (
            <AlojamientoCard key={a.id} alojamiento={a} />
          ))}
        </div>
        {destacados.length === 0 && (
          <p className="text-gray-500">Todavía no hay alojamientos publicados.</p>
        )}
      </section>

      <section className="bg-gray-900 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">
            ¿Tenés un hotel, hostel o cabaña?
          </h2>
          <p className="text-gray-300 mb-6">
            Sumate a MiHotel: cargá tus habitaciones, manejá precios y
            disponibilidad, y recibí reservas de huéspedes de todo el país.
          </p>
          <Link
            href="/registro-dueno"
            className="inline-block bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100"
          >
            Publicar mi alojamiento
          </Link>
        </div>
      </section>
    </div>
  );
}
