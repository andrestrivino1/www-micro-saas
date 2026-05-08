# www-micro-saas — Grooming SaaS Frontend

Frontend Next.js 16 (App Router) del MVP de SaaS Peluquería Canina. Consume la
API REST de [`api-micro-saas`](../api-micro-saas) según el contrato
[`openapi.yaml`](../api-micro-saas/specs/001-grooming-saas-mvp/contracts/openapi.yaml).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript 5
- Tailwind CSS v4
- TanStack Query 5 (data fetching)
- lucide-react (iconos)

## Documentos de referencia

Todos viven en el repo del backend:

- [Constitución](../api-micro-saas/.specify/memory/constitution.md)
- [Spec funcional](../api-micro-saas/specs/001-grooming-saas-mvp/spec.md)
- [Plan](../api-micro-saas/specs/001-grooming-saas-mvp/plan.md)
- [Contrato OpenAPI](../api-micro-saas/specs/001-grooming-saas-mvp/contracts/openapi.yaml)

## Levantar en local

Asume que el backend `api-micro-saas` ya corre en `http://localhost:3001`.

```bash
# 1. Variables de entorno
cp .env.example .env.local
# Ajusta NEXT_PUBLIC_API_BASE_URL si tu backend no está en :3001.

# 2. Instalar deps
npm install

# 3. Dev server
npm run dev
# o, en producción:
npm run build && npm run start
```

Abrir [http://localhost:3000](http://localhost:3000) y pulsar **"Probar demo"**.

## Mapa de páginas

| Ruta | Pantalla | User Story |
|------|----------|------------|
| `/` | Landing con botón "Probar demo" | US1 entrada |
| `/dashboard` | Agenda del día con cards de cita | **US1** |
| `/clients` | Lista de clientes con su mascota | **US4** |
| `/clients/[id]` | Detalle de cliente + historial de citas | **US4** |
| `/clients/new` | Formulario crear cliente + mascota (transaccional) | **US4** |
| `/appointments/new` | Formulario crear cita | **US3** |

El **diálogo de recordatorio simulado** (US2) es un componente que se abre
desde cualquier card de cita en `/dashboard`.

## Configuración

| Variable | Default | Función |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001` | URL base del backend |

## Arquitectura del frontend

```
src/
├── app/                    # App Router de Next.js
│   ├── page.tsx            # Landing
│   ├── layout.tsx          # Layout global con Providers
│   ├── providers.tsx       # QueryClientProvider
│   ├── globals.css         # Tailwind v4
│   ├── dashboard/          # US1
│   ├── clients/            # US4
│   └── appointments/new/   # US3
├── components/
│   ├── AppShell.tsx        # AuthGate + Header + container
│   ├── AuthGate.tsx        # Redirige a / si no hay sesión válida
│   ├── Header.tsx          # Nav + cerrar sesión
│   ├── AppointmentCard.tsx
│   ├── ReminderPreviewDialog.tsx  # US2 — vista previa + envío + reenvío
│   └── StatusPill.tsx
└── lib/
    ├── api-client.ts       # fetch wrapper con JWT en headers
    ├── auth.ts             # Sesión JWT en localStorage
    ├── format.ts           # Intl helpers (es-CO, America/Bogota)
    └── types.ts            # Tipos derivados de openapi.yaml
```

## Notas

- **Sin tests** en el MVP, alineado con la decisión constitucional del backend.
  La validación E2E es manual: navegar el flujo completo (landing → demo →
  agenda → recordatorio → nueva cita → clientes).
- **Sin SSR de datos protegidos**: la sesión JWT vive en `localStorage`, así
  que las páginas autenticadas hidratan client-side y `AuthGate` redirige
  cuando no hay sesión.
- **Backend simula WhatsApp**: el `ReminderPreviewDialog` muestra una vista
  previa que coincide *exactamente* con el texto que el backend persiste en la
  tabla `notifications`.
