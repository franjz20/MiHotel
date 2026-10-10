export type Rol = "CLIENTE" | "DUENO" | "ADMIN";

export interface AuthResponse {
  token: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface UsuarioSesion {
  email: string;
  nombre: string;
  rol: Rol;
}

export type TipoAlojamiento =
  | "HOTEL"
  | "HOSTEL"
  | "CABANA"
  | "DEPARTAMENTO"
  | "POSADA"
  | "OTRO";

export type EstadoAlojamiento =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "SUSPENDIDO";

export type EstadoReserva =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "RECHAZADA"
  | "CANCELADA"
  | "COMPLETADA";

export interface Foto {
  id: number;
  url: string;
  esPortada?: boolean;
}

export interface AlojamientoResumen {
  id: number;
  nombre: string;
  tipo: TipoAlojamiento;
  ciudad: string;
  provincia: string | null;
  estado: EstadoAlojamiento;
  fotoPortada: string | null;
}

export interface Alojamiento {
  id: number;
  nombre: string;
  tipo: TipoAlojamiento;
  descripcion: string | null;
  direccion: string;
  ciudad: string;
  provincia: string | null;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  telefono: string | null;
  emailContacto: string | null;
  estado: EstadoAlojamiento;
  motivoRechazo: string | null;
  servicios: Servicio[];
  fotos: Foto[];
  createdAt: string;
}

export interface Servicio {
  id: number;
  nombre: string;
}

export interface Temporada {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  precioPorNoche: number;
}

export interface Habitacion {
  id: number;
  nombre: string;
  descripcion: string | null;
  capacidad: number;
  cantidad: number;
  precioPorNoche: number;
  activa: boolean;
  fotos: { id: number; url: string }[];
  temporadas: Temporada[];
  bloqueos: Bloqueo[];
}

export interface Bloqueo {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  motivo: string | null;
}

export interface PrecioResponse {
  total: number;
  noches: { fecha: string; precio: number; temporada: string | null }[];
}

export interface Disponibilidad {
  disponible: boolean;
  unidadesLibres: number;
  cantidadTotal: number;
  bloqueada: boolean;
}

export interface Reserva {
  id: number;
  habitacionId: number;
  habitacionNombre: string;
  alojamientoId: number;
  alojamientoNombre: string;
  alojamientoCiudad: string;
  clienteEmail: string;
  checkIn: string;
  checkOut: string;
  cantidadUnidades: number;
  huespedNombre: string;
  huespedTelefono: string;
  huespedEmail: string;
  precioTotal: number;
  estado: EstadoReserva;
  motivoRechazo: string | null;
  createdAt: string;
}

export interface Estadisticas {
  totalReservas: number;
  reservasProximas: number;
  reservasPendientes: number;
  reservasConfirmadas: number;
  habitacionesActivas: number;
  ingresosConfirmados: number;
  reservasPorEstado: Record<string, number>;
}

// ---- Fase 9: admin ----

export interface UsuarioAdmin {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  emailConfirmado: boolean;
  createdAt: string;
}

export interface EstadisticasAdmin {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosPorRol: Record<string, number>;
  totalAlojamientos: number;
  alojamientosPorEstado: Record<string, number>;
  totalReservas: number;
  reservasPorEstado: Record<string, number>;
  reservasUltimos30Dias: number;
  ingresosConfirmados: number;
}

export interface ReportesAdmin {
  reservasPorMes: { mes: string; total: number }[];
  topAlojamientos: {
    id: number;
    nombre: string;
    ciudad: string;
    totalReservas: number;
    ingresos: number;
  }[];
  tasaCancelacion: number;
  tasaRechazo: number;
}

export interface AuditoriaItem {
  id: number;
  actorEmail: string | null;
  accion: string;
  entidad: string | null;
  entidadId: number | null;
  detalle: string | null;
  createdAt: string;
}

// ---- Fase 10: notificaciones ----

export interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}
