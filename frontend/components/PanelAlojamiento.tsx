"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { del, get, patch, post, put } from "@/lib/api";
import { usuarioActual } from "@/lib/auth";
import {
  Alojamiento, EstadoReserva, Estadisticas, Habitacion, Reserva,
} from "@/lib/types";
import FormAlojamiento, {
  AlojamientoFormData, toRequest,
} from "@/components/FormAlojamiento";

const ESTADO_RES: Record<EstadoReserva, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADA: "bg-green-100 text-green-800",
  RECHAZADA: "bg-red-100 text-red-800",
  CANCELADA: "bg-gray-200 text-gray-600",
  COMPLETADA: "bg-blue-100 text-blue-800",
};

const TABS = ["reservas", "habitaciones", "info", "fotos", "estadisticas"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  reservas: "Reservas",
  habitaciones: "Habitaciones",
  info: "Información",
  fotos: "Fotos",
  estadisticas: "Estadísticas",
};

export default function PanelAlojamiento({ id }: { id: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("reservas");
  const [alojamiento, setAlojamiento] = useState<Alojamiento | null>(null);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  function cargar() {
    Promise.all([
      get<Alojamiento>(`/alojamientos/${id}`),
      get<Habitacion[]>(`/alojamientos/${id}/habitaciones`),
      get<Reserva[]>(`/alojamientos/${id}/reservas`),
      get<Estadisticas>(`/alojamientos/${id}/estadisticas`),
    ])
      .then(([a, h, r, s]) => {
        setAlojamiento(a);
        setHabitaciones(h);
        setReservas(r);
        setStats(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    const u = usuarioActual();
    if (!u || u.rol !== "DUENO") {
      router.push("/login");
      return;
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function accion(path: string, metodo: "patch" | "delete" = "patch", body?: unknown) {
    try {
      if (metodo === "patch") await patch(path, body);
      else await del(path);
      cargar();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  }

  if (cargando) return <p className="p-8 text-gray-500">Cargando...</p>;
  if (error || !alojamiento)
    return <p className="p-8 text-red-600">{error || "No encontrado"}</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/panel" className="text-sm text-gray-500 hover:text-blue-700 inline-flex items-center gap-1 mb-3">
        ← Mis alojamientos
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-3xl font-bold tracking-tight">{alojamiento.nombre}</h1>
        <span className="badge bg-gray-100 text-gray-700">
          {alojamiento.estado}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {alojamiento.ciudad}
        {alojamiento.provincia ? `, ${alojamiento.provincia}` : ""} · {alojamiento.direccion}
      </p>
      {alojamiento.motivoRechazo && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
          Motivo del rechazo: {alojamiento.motivoRechazo}
        </p>
      )}

      <div className="tabs mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "tab-activo" : "tab"}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === "reservas" && <TabReservas reservas={reservas} accion={accion} />}
      {tab === "habitaciones" && (
        <TabHabitaciones alojamientoId={id} habitaciones={habitaciones} accion={accion} recargar={cargar} />
      )}
      {tab === "info" && <TabInfo alojamiento={alojamiento} recargar={cargar} />}
      {tab === "fotos" && <TabFotos alojamiento={alojamiento} accion={accion} recargar={cargar} />}
      {tab === "estadisticas" && stats && <TabStats stats={stats} />}
    </div>
  );
}

/* ==================== TAB RESERVAS ==================== */
function TabReservas({
  reservas,
  accion,
}: {
  reservas: Reserva[];
  accion: (path: string, m?: "patch" | "delete", body?: unknown) => Promise<void>;
}) {
  if (reservas.length === 0)
    return (
      <div className="card p-8 text-center text-gray-500">
        No hay reservas todavía. Cuando un huésped reserve, aparece acá.
      </div>
    );
  return (
    <div className="space-y-3">
      {reservas.map((r) => (
        <div key={r.id} className="card p-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-medium">
                {r.habitacionNombre} · {r.cantidadUnidades} u.
              </p>
              <p className="text-sm text-gray-600">
                {r.checkIn} → {r.checkOut}
              </p>
              <p className="text-sm text-gray-500">
                {r.huespedNombre} · {r.huespedTelefono} · {r.huespedEmail}
              </p>
            </div>
            <div className="text-right">
              <span className={`badge ${ESTADO_RES[r.estado]}`}>
                {r.estado}
              </span>
              <p className="font-bold mt-1">${r.precioTotal.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {r.estado === "PENDIENTE" && (
              <>
                <button
                  onClick={() => accion(`/reservas/${r.id}/confirmar`)}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    const motivo = prompt("Motivo del rechazo:");
                    if (motivo !== null)
                      accion(`/reservas/${r.id}/rechazar`, "patch", { motivo });
                  }}
                  className="btn-danger btn-sm"
                >
                  Rechazar
                </button>
              </>
            )}
            {r.estado === "CONFIRMADA" && (
              <button
                onClick={() => accion(`/reservas/${r.id}/completar`)}
                className="btn-primary btn-sm"
              >
                Marcar completada
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==================== TAB HABITACIONES ==================== */
function TabHabitaciones({
  alojamientoId,
  habitaciones,
  accion,
  recargar,
}: {
  alojamientoId: number;
  habitaciones: Habitacion[];
  accion: (path: string, m?: "patch" | "delete", body?: unknown) => Promise<void>;
  recargar: () => void;
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", capacidad: 1, cantidad: 1, precioPorNoche: "",
  });
  const [error, setError] = useState("");

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await post(`/alojamientos/${alojamientoId}/habitaciones`, {
        ...form,
        capacidad: Number(form.capacidad),
        cantidad: Number(form.cantidad),
        precioPorNoche: Number(form.precioPorNoche),
      });
      setForm({ nombre: "", descripcion: "", capacidad: 1, cantidad: 1, precioPorNoche: "" });
      setMostrarForm(false);
      recargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  const input = "input";

  return (
    <div className="space-y-4">
      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        className="btn-primary"
      >
        {mostrarForm ? "Cancelar" : "+ Nueva habitación"}
      </button>

      {mostrarForm && (
        <form onSubmit={crear} className="card p-5 grid grid-cols-2 gap-3">
          {error && <p className="col-span-2 text-red-600 text-sm">{error}</p>}
          <input required placeholder="Nombre *" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={input} />
          <input required type="number" min={0.01} step="0.01" placeholder="Precio/noche *"
            value={form.precioPorNoche}
            onChange={(e) => setForm({ ...form, precioPorNoche: e.target.value })} className={input} />
          <input placeholder="Descripción" value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={input} />
          <div className="flex gap-2">
            <input required type="number" min={1} placeholder="Capacidad"
              value={form.capacidad}
              onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })} className={input} />
            <input required type="number" min={1} placeholder="Unidades"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} className={input} />
          </div>
          <button className="col-span-2 btn-primary !py-2 text-sm">
            Crear habitación
          </button>
        </form>
      )}

      {habitaciones.map((h) => (
        <HabitacionPanel key={h.id} h={h} accion={accion} recargar={recargar} />
      ))}
      {habitaciones.length === 0 && !mostrarForm && (
        <div className="card p-8 text-center text-gray-500">
          Sin habitaciones cargadas — agregá la primera con el botón de arriba.
        </div>
      )}
    </div>
  );
}

function HabitacionPanel({
  h,
  accion,
  recargar,
}: {
  h: Habitacion;
  accion: (path: string, m?: "patch" | "delete", body?: unknown) => Promise<void>;
  recargar: () => void;
}) {
  const [temp, setTemp] = useState({ nombre: "", fechaInicio: "", fechaFin: "", precioPorNoche: "" });
  const [bloq, setBloq] = useState({ fechaInicio: "", fechaFin: "", motivo: "" });

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const fd = new FormData();
    fd.append("archivo", archivo);
    try {
      await post(`/habitaciones/${h.id}/fotos`, fd);
      recargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir foto");
    }
    e.target.value = "";
  }

  const input = "input-sm !w-auto";

  return (
    <div className="card p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">
            {h.nombre} {!h.activa && <span className="text-xs text-gray-400">(inactiva)</span>}
          </p>
          <p className="text-sm text-gray-500">
            {h.capacidad} pers · {h.cantidad} unidades · ${h.precioPorNoche.toLocaleString()}/noche
          </p>
        </div>
        <button
          onClick={() => confirm("¿Eliminar habitación?") && accion(`/habitaciones/${h.id}`, "delete")}
          className="text-xs text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </div>

      {/* Temporadas */}
      <div className="mt-3 border-t pt-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">Temporadas</p>
        {h.temporadas.map((t) => (
          <div key={t.id} className="flex items-center justify-between text-xs py-0.5">
            <span>
              {t.nombre}: {t.fechaInicio} → {t.fechaFin} · ${t.precioPorNoche.toLocaleString()}
            </span>
            <button onClick={() => accion(`/habitaciones/${h.id}/temporadas/${t.id}`, "delete")}
              className="text-red-500">✕</button>
          </div>
        ))}
        <div className="flex flex-wrap gap-1 mt-1">
          <input placeholder="Nombre" value={temp.nombre}
            onChange={(e) => setTemp({ ...temp, nombre: e.target.value })} className={input} />
          <input type="date" value={temp.fechaInicio}
            onChange={(e) => setTemp({ ...temp, fechaInicio: e.target.value })} className={input} />
          <input type="date" value={temp.fechaFin}
            onChange={(e) => setTemp({ ...temp, fechaFin: e.target.value })} className={input} />
          <input type="number" placeholder="Precio" value={temp.precioPorNoche}
            onChange={(e) => setTemp({ ...temp, precioPorNoche: e.target.value })} className={input} />
          <button
            onClick={() =>
              post(`/habitaciones/${h.id}/temporadas`, {
                nombre: temp.nombre,
                fechaInicio: temp.fechaInicio,
                fechaFin: temp.fechaFin,
                precioPorNoche: Number(temp.precioPorNoche),
              }).then(recargar).catch((e) => alert(e.message))
            }
            className="btn btn-sm bg-gray-700 text-white hover:bg-gray-800"
          >
            + Temporada
          </button>
        </div>
      </div>

      {/* Bloqueos */}
      <div className="mt-3 border-t pt-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">Bloqueos de fechas</p>
        {h.bloqueos.map((b) => (
          <div key={b.id} className="flex items-center justify-between text-xs py-0.5">
            <span>
              {b.fechaInicio} → {b.fechaFin} {b.motivo ? `· ${b.motivo}` : ""}
            </span>
            <button onClick={() => accion(`/habitaciones/${h.id}/bloqueos/${b.id}`, "delete")}
              className="text-red-500">✕</button>
          </div>
        ))}
        <div className="flex flex-wrap gap-1 mt-1">
          <input type="date" value={bloq.fechaInicio}
            onChange={(e) => setBloq({ ...bloq, fechaInicio: e.target.value })} className={input} />
          <input type="date" value={bloq.fechaFin}
            onChange={(e) => setBloq({ ...bloq, fechaFin: e.target.value })} className={input} />
          <input placeholder="Motivo" value={bloq.motivo}
            onChange={(e) => setBloq({ ...bloq, motivo: e.target.value })} className={input} />
          <button
            onClick={() =>
              post(`/habitaciones/${h.id}/bloqueos`, bloq)
                .then(recargar).catch((e) => alert(e.message))
            }
            className="btn btn-sm bg-gray-700 text-white hover:bg-gray-800"
          >
            + Bloqueo
          </button>
        </div>
      </div>

      {/* Fotos */}
      <div className="mt-3 border-t pt-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">Fotos</p>
        <div className="flex flex-wrap gap-2 items-center">
          {h.fotos.map((f) => (
            <div key={f.id} className="relative w-20 h-14 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="w-full h-full object-cover rounded" />
              <button
                onClick={() => accion(`/habitaciones/${h.id}/fotos/${f.id}`, "delete")}
                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-xs hidden group-hover:block"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="w-20 h-14 border-2 border-dashed rounded flex items-center justify-center text-gray-400 cursor-pointer text-xs hover:border-blue-400">
            + Foto
            <input type="file" accept="image/*" className="hidden" onChange={subirFoto} />
          </label>
        </div>
      </div>
    </div>
  );
}

/* ==================== TAB INFO ==================== */
function TabInfo({
  alojamiento,
  recargar,
}: {
  alojamiento: Alojamiento;
  recargar: () => void;
}) {
  const [guardado, setGuardado] = useState(false);

  const inicial: AlojamientoFormData = {
    nombre: alojamiento.nombre,
    tipo: alojamiento.tipo,
    descripcion: alojamiento.descripcion ?? "",
    direccion: alojamiento.direccion,
    ciudad: alojamiento.ciudad,
    provincia: alojamiento.provincia ?? "",
    pais: alojamiento.pais,
    telefono: alojamiento.telefono ?? "",
    emailContacto: alojamiento.emailContacto ?? "",
    latitud: alojamiento.latitud?.toString() ?? "",
    longitud: alojamiento.longitud?.toString() ?? "",
    servicioIds: alojamiento.servicios.map((s) => s.id),
  };

  async function guardar(data: AlojamientoFormData) {
    await put(`/alojamientos/${alojamiento.id}`, toRequest(data));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
    recargar();
  }

  return (
    <div className="card p-6">
      <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg p-3 mb-4">
        Al editar, el alojamiento vuelve a estado PENDIENTE y un administrador
        debe aprobarlo de nuevo.
      </p>
      {guardado && (
        <p className="text-sm bg-green-50 text-green-700 rounded-lg p-3 mb-4">
          Cambios guardados.
        </p>
      )}
      <FormAlojamiento inicial={inicial} onSubmit={guardar} textoBoton="Guardar cambios" />
    </div>
  );
}

/* ==================== TAB FOTOS ==================== */
function TabFotos({
  alojamiento,
  accion,
  recargar,
}: {
  alojamiento: Alojamiento;
  accion: (path: string, m?: "patch" | "delete", body?: unknown) => Promise<void>;
  recargar: () => void;
}) {
  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const fd = new FormData();
    fd.append("archivo", archivo);
    try {
      await post(`/alojamientos/${alojamiento.id}/fotos`, fd);
      recargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir foto");
    }
    e.target.value = "";
  }

  return (
    <div>
      <label className="btn-primary cursor-pointer">
        + Subir foto
        <input type="file" accept="image/*" className="hidden" onChange={subir} />
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {alojamiento.fotos.map((f) => (
          <div key={f.id} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt="" className="w-full h-32 object-cover rounded-lg" />
            {f.esPortada && (
              <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 rounded">
                Portada
              </span>
            )}
            <button
              onClick={() => accion(`/alojamientos/${alojamiento.id}/fotos/${f.id}`, "delete")}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {alojamiento.fotos.length === 0 && (
        <p className="text-gray-500 mt-4">Sin fotos todavía.</p>
      )}
    </div>
  );
}

/* ==================== TAB ESTADÍSTICAS ==================== */
function TabStats({ stats }: { stats: Estadisticas }) {
  const cards = [
    { label: "Reservas totales", valor: stats.totalReservas },
    { label: "Próximas", valor: stats.reservasProximas },
    { label: "Pendientes de confirmar", valor: stats.reservasPendientes },
    { label: "Confirmadas", valor: stats.reservasConfirmadas },
    { label: "Habitaciones activas", valor: stats.habitacionesActivas },
    { label: "Ingresos confirmados", valor: `$${stats.ingresosConfirmados.toLocaleString()}` },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5 text-center">
          <p className="text-2xl font-bold text-blue-700">{c.valor}</p>
          <p className="text-xs text-gray-500 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
