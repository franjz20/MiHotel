"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { Servicio, TipoAlojamiento } from "@/lib/types";

export interface AlojamientoFormData {
  nombre: string;
  tipo: TipoAlojamiento;
  descripcion: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  pais: string;
  telefono: string;
  emailContacto: string;
  latitud: string;
  longitud: string;
  servicioIds: number[];
}

export const FORM_INICIAL: AlojamientoFormData = {
  nombre: "",
  tipo: "HOTEL",
  descripcion: "",
  direccion: "",
  ciudad: "",
  provincia: "",
  pais: "Argentina",
  telefono: "",
  emailContacto: "",
  latitud: "",
  longitud: "",
  servicioIds: [],
};

export function toRequest(f: AlojamientoFormData) {
  return {
    nombre: f.nombre,
    tipo: f.tipo,
    descripcion: f.descripcion || null,
    direccion: f.direccion,
    ciudad: f.ciudad,
    provincia: f.provincia || null,
    pais: f.pais || null,
    telefono: f.telefono || null,
    emailContacto: f.emailContacto || null,
    latitud: f.latitud ? Number(f.latitud) : null,
    longitud: f.longitud ? Number(f.longitud) : null,
    servicioIds: f.servicioIds,
  };
}

export default function FormAlojamiento({
  inicial,
  onSubmit,
  textoBoton,
}: {
  inicial?: AlojamientoFormData;
  onSubmit: (data: AlojamientoFormData) => Promise<void>;
  textoBoton: string;
}) {
  const [form, setForm] = useState<AlojamientoFormData>(inicial ?? FORM_INICIAL);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    get<Servicio[]>("/servicios").then(setServicios).catch(() => {});
  }, []);

  function set(campo: keyof AlojamientoFormData, valor: string | number[]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function toggleServicio(id: number) {
    set(
      "servicioIds",
      form.servicioIds.includes(id)
        ? form.servicioIds.filter((s) => s !== id)
        : [...form.servicioIds, id]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setCargando(false);
    }
  }

  const input = "w-full border rounded-md px-3 py-2";

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <p className="bg-red-50 text-red-600 text-sm rounded p-3">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required placeholder="Nombre *" value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)} className={input} />
        <select value={form.tipo}
          onChange={(e) => set("tipo", e.target.value as TipoAlojamiento)}
          className={input}>
          <option value="HOTEL">Hotel</option>
          <option value="HOSTEL">Hostel</option>
          <option value="CABANA">Cabaña</option>
          <option value="DEPARTAMENTO">Departamento</option>
          <option value="POSADA">Posada</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      <textarea placeholder="Descripción" rows={3} value={form.descripcion}
        onChange={(e) => set("descripcion", e.target.value)} className={input} />

      <input required placeholder="Dirección *" value={form.direccion}
        onChange={(e) => set("direccion", e.target.value)} className={input} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input required placeholder="Ciudad *" value={form.ciudad}
          onChange={(e) => set("ciudad", e.target.value)} className={input} />
        <input placeholder="Provincia" value={form.provincia}
          onChange={(e) => set("provincia", e.target.value)} className={input} />
        <input placeholder="País" value={form.pais}
          onChange={(e) => set("pais", e.target.value)} className={input} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input placeholder="Latitud (ej: -37.3217)" value={form.latitud}
          onChange={(e) => set("latitud", e.target.value)} className={input} />
        <input placeholder="Longitud (ej: -59.1332)" value={form.longitud}
          onChange={(e) => set("longitud", e.target.value)} className={input} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input placeholder="Teléfono" value={form.telefono}
          onChange={(e) => set("telefono", e.target.value)} className={input} />
        <input type="email" placeholder="Email de contacto" value={form.emailContacto}
          onChange={(e) => set("emailContacto", e.target.value)} className={input} />
      </div>

      {servicios.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Servicios</p>
          <div className="flex flex-wrap gap-2">
            {servicios.map((s) => (
              <label
                key={s.id}
                className={`text-sm px-3 py-1.5 rounded-full border cursor-pointer ${
                  form.servicioIds.includes(s.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.servicioIds.includes(s.id)}
                  onChange={() => toggleServicio(s.id)}
                />
                {s.nombre}
              </label>
            ))}
          </div>
        </div>
      )}

      <button type="submit" disabled={cargando}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
        {cargando ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}
