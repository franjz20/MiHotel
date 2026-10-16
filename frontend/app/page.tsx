"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { AlojamientoResumen } from "@/lib/types";
import AlojamientoCard from "@/components/AlojamientoCard";

const PASOS = [
  {
    titulo: "Buscá",
    texto: "Explorá hoteles, hostels y cabañas en Jujuy y Salta.",
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
  },
  {
    titulo: "Elegí",
    texto: "Compará habitaciones, precios, fotos y servicios.",
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-6 9 6v13M3 21h18M9 21v-6h6v6" />
    ),
  },
  {
    titulo: "Reservá",
    texto: "Confirmá tu reserva online y pagá al llegar.",
    icono: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

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
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-blue-300" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Encontrá tu próximo alojamiento
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Hoteles, hostels y cabañas en Jujuy y Salta. Reservá online y pagá al llegar.
          </p>
          <form
            onSubmit={buscar}
            className="flex gap-2 max-w-xl mx-auto bg-white rounded-xl p-2 shadow-2xl"
          >
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="¿A qué ciudad viajás? Ej: San Salvador de Jujuy"
              className="flex-1 px-4 py-2.5 text-gray-800 rounded-lg outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg font-semibold transition"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PASOS.map((p, i) => (
            <div key={p.titulo} className="card p-6 text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  {p.icono}
                </svg>
              </span>
              <p className="text-xs font-semibold text-blue-600 mb-1">PASO {i + 1}</p>
              <h3 className="font-bold text-lg">{p.titulo}</h3>
              <p className="text-sm text-gray-500 mt-1">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Alojamientos destacados</h2>
          <Link href="/alojamientos" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destacados.map((a) => (
            <AlojamientoCard key={a.id} alojamiento={a} />
          ))}
        </div>
        {destacados.length === 0 && (
          <div className="card p-10 text-center text-gray-500">
            Todavía no hay alojamientos publicados.
          </div>
        )}
      </section>

      {/* CTA dueños */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            ¿Tenés un hotel, hostel o cabaña?
          </h2>
          <p className="text-slate-300 mb-8">
            Sumate a MiHotel: cargá tus habitaciones, manejá precios y
            disponibilidad, y recibí reservas de huéspedes de toda la región.
          </p>
          <Link
            href="/registro-dueno"
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition"
          >
            Publicar mi alojamiento
          </Link>
        </div>
      </section>
    </div>
  );
}
