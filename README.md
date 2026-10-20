# MiHotel

Marketplace de reservas de alojamientos. Los huéspedes buscan y reservan
habitaciones de hoteles, hostels y cabañas; los dueños/gerentes publican y
administran sus propiedades; y un administrador modera toda la plataforma.

Foco inicial: **Jujuy y Salta, Argentina**.

## 🚀 Demo en vivo

👉 [mi-hotel-eight.vercel.app](https://mi-hotel-eight.vercel.app/)

## Funcionalidades

**Huéspedes (rol CLIENTE)**
- Explorar alojamientos por ciudad, tipo y orden alfabético
- Ver detalle: fotos, descripción, servicios, ubicación, habitaciones y precios
- Reservar con verificación de disponibilidad en tiempo real
- Ver y cancelar sus reservas
- Confirmación de cuenta por email + notificaciones in-app

**Dueños/gerentes (rol DUENO)**
- Registro dedicado en `/registro-dueno` → acceso directo al panel
- Publicar alojamientos: datos, dirección, coordenadas, servicios, fotos
- Gestionar habitaciones: capacidad, unidades, precio por noche, temporadas
  de precio y bloqueos de fechas
- Confirmar, rechazar o completar reservas
- Estadísticas por alojamiento (reservas, ingresos, habitaciones activas)

**Administrador (rol ADMIN)**
- Aprobar, rechazar o suspender alojamientos (quedan PENDIENTE al crearse/editarse)
- Gestión de usuarios: buscar, cambiar rol, activar/desactivar
- Ver y cancelar cualquier reserva
- Reportes: reservas por mes, top alojamientos, tasas de cancelación/rechazo
- Auditoría completa de acciones

**Transversal**
- Sin overbooking: la disponibilidad se valida por fechas, unidades, temporadas
  y bloqueos
- Emails transaccionales (registro, confirmación, reserva creada/confirmada/
  rechazada/cancelada, recuperación de contraseña). Sin SMTP configurado se
  loguean en consola (modo dev)
- Notificaciones in-app con campanita en el navbar

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security (JWT), Spring Data JPA, Flyway |
| Base de datos | PostgreSQL (Supabase) |
| Fotos | Supabase Storage |
| Emails | SMTP (Gmail u otro) vía JavaMail |
| Frontend | Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS 4 |
| Deploy | Railway (backend, Docker) + Vercel (frontend) |
| CI/CD | GitHub Actions (build + pg_dump diario) |

## Deploy

- **Backend** → Railway: Root Directory `backend`, detecta el `Dockerfile`
  automáticamente. Configurar las variables del `.env.example`.
- **Frontend** → Vercel: Root Directory `frontend`, env var `BACKEND_URL`
  apuntando al dominio de Railway.
- **CI/CD** → cada push a `main` compila ambos proyectos; Vercel y Railway
  redeployan automáticamente.
- **Backups** → workflow diario de `pg_dump` (requiere secrets `DB_HOST`,
  `DB_USERNAME`, `DB_PASSWORD` en GitHub Actions).
