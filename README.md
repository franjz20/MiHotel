# MiHotel

Marketplace de reservas de alojamientos. Los huéspedes buscan y reservan
habitaciones de hoteles, hostels y cabañas; los dueños/gerentes publican y
administran sus propiedades; y un administrador modera toda la plataforma.

Foco inicial: **Jujuy y Salta, Argentina**.

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

## Estructura

```
MiHotel/
├── backend/                 # API REST Spring Boot
│   ├── Dockerfile           # build multi-stage para Railway
│   ├── .env.example         # referencia de variables de entorno
│   └── src/main/java/com/mihotel/
│       ├── auth/            # registro, login, confirmación, JWT
│       ├── usuario/
│       ├── alojamiento/     # alojamientos, fotos, servicios
│       ├── habitacion/      # habitaciones, temporadas, bloqueos
│       ├── reserva/         # reservas + disponibilidad
│       ├── admin/           # gestión, reportes, estadísticas
│       ├── notificacion/    # notificaciones in-app
│       ├── auditoria/       # registro de acciones
│       └── common/mail/     # envío de emails (real / modo dev)
│   └── src/main/resources/db/migration/  # migraciones Flyway
├── frontend/                # Next.js 16
│   ├── app/                 # páginas (App Router)
│   ├── components/          # Navbar, cards, formularios, paneles
│   └── lib/                 # api.ts (fetch + JWT), auth.ts, types.ts
└── .github/workflows/
    ├── ci.yml               # compila backend + frontend en cada push/PR
    └── backup.yml           # pg_dump diario → artifact 30 días
```

## Desarrollo local

**Requisitos:** JDK 21, Node.js 20+, base PostgreSQL (Supabase o local).

**1. Backend**

Crear `backend/application-local.properties` (gitignored) copiando
`backend/.env.example` con tus valores reales, luego:

```bash
cd backend
# Windows (PowerShell)
$env:SPRING_PROFILES_ACTIVE="local"; ./mvnw spring-boot:run
# Linux/Mac
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

API en `http://localhost:8080/api` — health: `GET /actuator/health`.
Flyway migra el esquema automáticamente al arrancar.

**2. Frontend**

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

El frontend proxifica `/api/*` al backend (`BACKEND_URL` en
`next.config.ts`, default `http://localhost:8080`).

## Variables de entorno (producción)

Ver `backend/.env.example` para la lista completa. Esenciales:

| Variable | Descripción |
|---|---|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | PostgreSQL (Supabase pooler) |
| `JWT_SECRET` | Clave larga y aleatoria para firmar tokens |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Storage de fotos (service_role, solo backend) |
| `MAIL_*` | SMTP para emails reales (sin esto, modo dev/log) |
| `FRONTEND_URL` | URL pública del frontend (links en emails) |
| `BACKEND_URL` (Vercel) | URL pública del backend (proxy `/api`) |

## Deploy

- **Backend** → Railway: Root Directory `backend`, detecta el `Dockerfile`
  automáticamente. Configurar las variables del `.env.example`.
- **Frontend** → Vercel: Root Directory `frontend`, env var `BACKEND_URL`
  apuntando al dominio de Railway.
- **CI/CD** → cada push a `main` compila ambos proyectos; Vercel y Railway
  redeployan automáticamente.
- **Backups** → workflow diario de `pg_dump` (requiere secrets `DB_HOST`,
  `DB_USERNAME`, `DB_PASSWORD` en GitHub Actions).
