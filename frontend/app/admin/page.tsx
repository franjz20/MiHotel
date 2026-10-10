"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { get, patch } from "@/lib/api";
import { usuarioActual } from "@/lib/auth";
import {
  AlojamientoResumen,
  AuditoriaItem,
  EstadoReserva,
  EstadisticasAdmin,
  ReportesAdmin,
  Reserva,
  Rol,
  UsuarioAdmin,
} from "@/lib/types";

type Tab = "resumen" | "alojamientos" | "usuarios" | "reservas" | "auditoria";

const TABS: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "alojamientos", label: "Alojamientos" },
  { id: "usuarios", label: "Usuarios" },
  { id: "reservas", label: "Reservas" },
  { id: "auditoria", label: "Auditoría" },
];

const ESTADOS_RESERVA: EstadoReserva[] = [
  "PENDIENTE",
  "CONFIRMADA",
  "RECHAZADA",
  "CANCELADA",
  "COMPLETADA",
];

const COLOR_ESTADO: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  APROBADO: "bg-green-100 text-green-800",
  CONFIRMADA: "bg-green-100 text-green-800",
  COMPLETADA: "bg-blue-100 text-blue-800",
  RECHAZADO: "bg-red-100 text-red-800",
  RECHAZADA: "bg-red-100 text-red-800",
  CANCELADA: "bg-gray-100 text-gray-800",
  SUSPENDIDO: "bg-orange-100 text-orange-800",
  ACTIVO: "bg-green-100 text-green-800",
  INACTIVO: "bg-red-100 text-red-800",
};

function Badge({ texto }: { texto: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLOR_ESTADO[texto] ?? "bg-gray-100"}`}
    >
      {texto}
    </span>
  );
}

function Card({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("resumen");
  const [error, setError] = useState("");

  const [stats, setStats] = useState<EstadisticasAdmin | null>(null);
  const [reportes, setReportes] = useState<ReportesAdmin | null>(null);
  const [pendientes, setPendientes] = useState<AlojamientoResumen[]>([]);
  const [alojamientos, setAlojamientos] = useState<AlojamientoResumen[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [auditoria, setAuditoria] = useState<AuditoriaItem[]>([]);

  const [filtroRol, setFiltroRol] = useState("");
  const [filtroQ, setFiltroQ] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const cargarTab = useCallback(
    (t: Tab) => {
      setError("");
      const req = (p: string) => get(p).catch((e) => setError(e.message));
      if (t === "resumen") {
        req("/admin/estadisticas").then(
          (r) => r && setStats(r as EstadisticasAdmin)
        );
        req("/admin/reportes").then(
          (r) => r && setReportes(r as ReportesAdmin)
        );
      } else if (t === "alojamientos") {
        req("/admin/alojamientos/pendientes").then(
          (r) => r && setPendientes(r as AlojamientoResumen[])
        );
        req("/admin/alojamientos").then(
          (r) => r && setAlojamientos(r as AlojamientoResumen[])
        );
      } else if (t === "usuarios") {
        req(
          "/admin/usuarios" +
            (filtroRol ? `?rol=${filtroRol}` : "") +
            (filtroQ ? `${filtroRol ? "&" : "?"}q=${filtroQ}` : "")
        ).then((r) => r && setUsuarios(r as UsuarioAdmin[]));
      } else if (t === "reservas") {
        req("/admin/reservas" + (filtroEstado ? `?estado=${filtroEstado}` : ""))
          .then((r) => r && setReservas(r as Reserva[]));
      } else if (t === "auditoria") {
        req("/admin/auditoria").then(
          (r) => r && setAuditoria(r as AuditoriaItem[])
        );
      }
    },
    [filtroRol, filtroQ, filtroEstado]
  );

  useEffect(() => {
    const u = usuarioActual();
    if (!u || u.rol !== "ADMIN") {
      router.push("/login");
      return;
    }
    cargarTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filtroRol, filtroEstado]);

  async function accion(fn: () => Promise<unknown>) {
    try {
      await fn();
      cargarTab(tab);
      setStats(null);
      setReportes(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  }

  const alojamientoAccion = (id: number, acc: string, conMotivo = false) =>
    accion(async () => {
      const motivo = conMotivo ? prompt("Motivo:") : null;
      if (conMotivo && motivo === null) return;
      await patch(
        `/admin/alojamientos/${id}/${acc}`,
        conMotivo ? { motivo } : undefined
      );
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>

      <div className="flex gap-1 mb-6 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              tab === t.id
                ? "bg-white border border-b-0 border-gray-200 text-blue-700 -mb-px"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* ---- RESUMEN ---- */}
      {tab === "resumen" && (
        <div className="space-y-6">
          {!stats ? (
            <p className="text-gray-500">Cargando...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card label="Usuarios" valor={stats.totalUsuarios} />
                <Card label="Usuarios activos" valor={stats.usuariosActivos} />
                <Card label="Alojamientos" valor={stats.totalAlojamientos} />
                <Card label="Reservas totales" valor={stats.totalReservas} />
                <Card
                  label="Reservas últimos 30 días"
                  valor={stats.reservasUltimos30Dias}
                />
                <Card
                  label="Ingresos confirmados"
                  valor={`$${stats.ingresosConfirmados.toLocaleString("es-AR")}`}
                />
                <Card
                  label="Clientes / Dueños / Admins"
                  valor={`${stats.usuariosPorRol.CLIENTE ?? 0} / ${
                    stats.usuariosPorRol.DUENO ?? 0
                  } / ${stats.usuariosPorRol.ADMIN ?? 0}`}
                />
                <Card
                  label="Alojamientos pendientes"
                  valor={stats.alojamientosPorEstado.PENDIENTE ?? 0}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-5">
                  <h2 className="font-semibold mb-3">Reservas por estado</h2>
                  {Object.entries(stats.reservasPorEstado).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between text-sm py-1 border-b last:border-0"
                    >
                      <Badge texto={k} />
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg shadow p-5">
                  <h2 className="font-semibold mb-3">Alojamientos por estado</h2>
                  {Object.entries(stats.alojamientosPorEstado).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between text-sm py-1 border-b last:border-0"
                    >
                      <Badge texto={k} />
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {reportes && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="font-semibold mb-3">Reservas por mes</h2>
                {reportes.reservasPorMes.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin datos.</p>
                ) : (
                  reportes.reservasPorMes.map((m) => (
                    <div
                      key={m.mes}
                      className="flex justify-between text-sm py-1 border-b last:border-0"
                    >
                      <span>{m.mes}</span>
                      <span className="font-medium">{m.total}</span>
                    </div>
                  ))
                )}
                <div className="flex gap-6 mt-4 text-sm">
                  <span>
                    Cancelación: <b>{reportes.tasaCancelacion.toFixed(1)}%</b>
                  </span>
                  <span>
                    Rechazo: <b>{reportes.tasaRechazo.toFixed(1)}%</b>
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="font-semibold mb-3">Top alojamientos</h2>
                {reportes.topAlojamientos.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin datos.</p>
                ) : (
                  reportes.topAlojamientos.map((a) => (
                    <div
                      key={a.id}
                      className="flex justify-between text-sm py-1 border-b last:border-0"
                    >
                      <span>
                        {a.nombre}{" "}
                        <span className="text-gray-400">({a.ciudad})</span>
                      </span>
                      <span className="font-medium">
                        {a.totalReservas} res. · $
                        {a.ingresos.toLocaleString("es-AR")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- ALOJAMIENTOS ---- */}
      {tab === "alojamientos" && (
        <div className="space-y-8">
          <section>
            <h2 className="font-semibold mb-3">
              Pendientes de aprobación ({pendientes.length})
            </h2>
            {pendientes.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay alojamientos pendientes.
              </p>
            ) : (
              <div className="space-y-3">
                {pendientes.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{a.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {a.tipo} · {a.ciudad}, {a.provincia}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alojamientoAccion(a.id, "aprobar")}
                        className="bg-green-600 text-white text-sm px-4 py-1.5 rounded hover:bg-green-700"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() =>
                          alojamientoAccion(a.id, "rechazar", true)
                        }
                        className="bg-red-600 text-white text-sm px-4 py-1.5 rounded hover:bg-red-700"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold mb-3">
              Todos los alojamientos ({alojamientos.length})
            </h2>
            <div className="bg-white rounded-lg shadow divide-y">
              {alojamientos.map((a) => (
                <div
                  key={a.id}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{a.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {a.tipo} · {a.ciudad}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge texto={a.estado} />
                    {a.estado === "APROBADO" && (
                      <button
                        onClick={() =>
                          alojamientoAccion(a.id, "suspender", true)
                        }
                        className="text-orange-600 text-sm hover:underline"
                      >
                        Suspender
                      </button>
                    )}
                    {(a.estado === "SUSPENDIDO" || a.estado === "RECHAZADO") && (
                      <button
                        onClick={() => alojamientoAccion(a.id, "aprobar")}
                        className="text-green-600 text-sm hover:underline"
                      >
                        Aprobar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ---- USUARIOS ---- */}
      {tab === "usuarios" && (
        <div>
          <div className="flex gap-3 mb-4">
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm"
            >
              <option value="">Todos los roles</option>
              <option value="CLIENTE">Clientes</option>
              <option value="DUENO">Dueños</option>
              <option value="ADMIN">Admins</option>
            </select>
            <input
              value={filtroQ}
              onChange={(e) => setFiltroQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && cargarTab("usuarios")}
              placeholder="Buscar por email o nombre..."
              className="border rounded px-3 py-1.5 text-sm flex-1"
            />
            <button
              onClick={() => cargarTab("usuarios")}
              className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded"
            >
              Buscar
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Email verif.</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium">
                        {u.nombre} {u.apellido}
                      </p>
                      <p className="text-gray-500">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.rol}
                        onChange={(e) =>
                          accion(() =>
                            patch(`/admin/usuarios/${u.id}/rol`, {
                              rol: e.target.value as Rol,
                            })
                          )
                        }
                        className="border rounded px-2 py-1 text-xs"
                      >
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="DUENO">DUENO</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {u.emailConfirmado ? (
                        <span className="text-green-600">Sí</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge texto={u.activo ? "ACTIVO" : "INACTIVO"} />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          accion(() =>
                            patch(`/admin/usuarios/${u.id}/activo`, {
                              activo: !u.activo,
                            })
                          )
                        }
                        className={`text-sm hover:underline ${
                          u.activo ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- RESERVAS ---- */}
      {tab === "reservas" && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFiltroEstado("")}
              className={`text-sm px-3 py-1 rounded-full ${
                !filtroEstado ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              Todas
            </button>
            {ESTADOS_RESERVA.map((e) => (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`text-sm px-3 py-1 rounded-full ${
                  filtroEstado === e ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow divide-y">
            {reservas.length === 0 && (
              <p className="p-4 text-sm text-gray-500">Sin reservas.</p>
            )}
            {reservas.map((r) => (
              <div key={r.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    #{r.id} · {r.alojamientoNombre} · {r.habitacionNombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    {r.checkIn} → {r.checkOut} · {r.clienteEmail} · $
                    {r.precioTotal.toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge texto={r.estado} />
                  {(r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && (
                    <button
                      onClick={() =>
                        accion(async () => {
                          const motivo = prompt("Motivo de la cancelación:");
                          if (motivo === null) return;
                          await patch(`/admin/reservas/${r.id}/cancelar`, {
                            motivo,
                          });
                        })
                      }
                      className="text-red-600 text-sm hover:underline"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- AUDITORIA ---- */}
      {tab === "auditoria" && (
        <div className="bg-white rounded-lg shadow divide-y">
          {auditoria.length === 0 && (
            <p className="p-4 text-sm text-gray-500">Sin registros.</p>
          )}
          {auditoria.map((a) => (
            <div key={a.id} className="p-3 text-sm flex gap-3 items-baseline">
              <span className="text-gray-400 text-xs whitespace-nowrap">
                {new Date(a.createdAt).toLocaleString("es-AR")}
              </span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                {a.accion}
              </span>
              <span className="text-gray-600">{a.actorEmail ?? "sistema"}</span>
              {a.entidad && (
                <span className="text-gray-400">
                  {a.entidad} #{a.entidadId}
                </span>
              )}
              {a.detalle && <span className="text-gray-500">· {a.detalle}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
