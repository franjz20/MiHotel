"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get, post } from "@/lib/api";
import { usuarioActual } from "@/lib/auth";
import { Disponibilidad, Habitacion, PrecioResponse, Reserva } from "@/lib/types";

export default function FormReserva({
  habitacionId,
  checkInInicial,
  checkOutInicial,
}: {
  habitacionId: number;
  checkInInicial: string;
  checkOutInicial: string;
}) {
  const router = useRouter();
  const [habitacion, setHabitacion] = useState<Habitacion | null>(null);
  const [checkIn, setCheckIn] = useState(checkInInicial);
  const [checkOut, setCheckOut] = useState(checkOutInicial);
  const [unidades, setUnidades] = useState(1);
  const [huesped, setHuesped] = useState({ nombre: "", telefono: "", email: "" });
  const [precio, setPrecio] = useState<PrecioResponse | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const u = usuarioActual();
    if (!u) {
      router.push("/login");
      return;
    }
    if (u.rol !== "CLIENTE") {
      setError("Solo las cuentas de cliente pueden hacer reservas.");
      return;
    }
    setHuesped((h) => ({ ...h, email: u.email }));
    get<Habitacion>(`/habitaciones/${habitacionId}`)
      .then(setHabitacion)
      .catch((e) => setError(e.message));
  }, [habitacionId, router]);

  // Consultar precio y disponibilidad cada vez que cambian las fechas
  useEffect(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setPrecio(null);
      setDisponibilidad(null);
      return;
    }
    Promise.all([
      get<PrecioResponse>(
        `/habitaciones/${habitacionId}/precio?checkIn=${checkIn}&checkOut=${checkOut}`
      ),
      get<Disponibilidad>(
        `/habitaciones/${habitacionId}/disponibilidad?checkIn=${checkIn}&checkOut=${checkOut}`
      ),
    ])
      .then(([p, d]) => {
        setPrecio(p);
        setDisponibilidad(d);
      })
      .catch(() => {
        setPrecio(null);
        setDisponibilidad(null);
      });
  }, [checkIn, checkOut, habitacionId]);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await post<Reserva>("/reservas", {
        habitacionId,
        checkIn,
        checkOut,
        cantidadUnidades: unidades,
        huespedNombre: huesped.nombre,
        huespedTelefono: huesped.telefono,
        huespedEmail: huesped.email,
      });
      router.push("/mis-reservas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la reserva");
      setCargando(false);
    }
  }

  const total = precio ? precio.total * unidades : null;

  return (
    <div className="max-w-lg mx-auto mt-10 mb-16 px-4">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-1">Reservar</h1>
        {habitacion && (
          <p className="text-gray-500 mb-6">
            {habitacion.nombre} · hasta {habitacion.capacidad} personas
          </p>
        )}
        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>
        )}

        <form onSubmit={confirmar} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Check-in</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Check-out</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {disponibilidad && (
            <p
              className={`text-sm rounded-lg p-3 ${
                disponibilidad.disponible
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {disponibilidad.disponible
                ? `✓ ${disponibilidad.unidadesLibres} unidades disponibles`
                : "Sin disponibilidad en esas fechas"}
            </p>
          )}
          {precio && (
            <div className="text-sm bg-blue-50 text-blue-800 rounded-lg p-3">
              <p className="flex justify-between">
                <span>
                  {precio.noches.length} noches × {unidades} unidad
                  {unidades > 1 ? "es" : ""}
                </span>
                <strong>${total?.toLocaleString()}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">Se paga en el alojamiento</p>
            </div>
          )}

          <div>
            <label className="label">Unidades</label>
            <input
              type="number"
              min={1}
              max={disponibilidad?.unidadesLibres ?? habitacion?.cantidad ?? 1}
              value={unidades}
              onChange={(e) => setUnidades(Number(e.target.value))}
              className="input"
            />
          </div>

          <h2 className="font-bold pt-2">Datos del huésped</h2>
          <div>
            <label className="label">Nombre completo</label>
            <input
              required
              placeholder="Juan Pérez"
              value={huesped.nombre}
              onChange={(e) => setHuesped({ ...huesped, nombre: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              required
              placeholder="388 123-4567"
              value={huesped.telefono}
              onChange={(e) => setHuesped({ ...huesped, telefono: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={huesped.email}
              onChange={(e) => setHuesped({ ...huesped, email: e.target.value })}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={cargando || !disponibilidad?.disponible}
            className="btn-primary w-full !py-2.5"
          >
            {cargando ? "Reservando..." : "Confirmar reserva"}
          </button>
        </form>
      </div>
    </div>
  );
}
