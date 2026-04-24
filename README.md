<p align="left">
  <img src="./src/assets/logo.png" height="120" alt="logo-empresa"/>
</p>

# Hidronor · Gestión Logística — Frontend

Panel web para la gestión logística de residuos: solicitudes, contratos,
tarifas, transportistas y coordinación de agendamientos.

## Stack

- **React 18** + **TypeScript**
- **Vite 6** como bundler
- **Tailwind CSS v4** con tokens OKLCH y dark mode
- **shadcn/ui** (Radix UI) para primitivos accesibles
- **lucide-react** para iconografía
- **React Router 7** para navegación
- **Axios** para HTTP

## Requisitos

- Node.js ≥ 20
- npm ≥ 10
- **Backend corriendo** en `http://localhost:3000` (el frontend consume `/api/v2`).
  El backend de este proyecto vive en un repositorio aparte.

## Instalación

```bash
git clone https://github.com/nvargas-mus/proyect-hdnr
cd proyect-hdnr
npm install
```

## Configuración

El frontend apunta por defecto a `/api/v2` y el proxy de Vite lo reenvía a
`http://localhost:3000`. Si tu backend corre en otra URL, creá un `.env.local`
en la raíz:

```
VITE_API_URL=http://tu-backend:puerto
```

> **Importante**: sin backend corriendo, el login y todos los listados van a
> fallar. Asegurate de levantar primero el servicio `/api/v2`.

## Uso

### Modo desarrollo (hot reload)

```bash
npm run dev
```

La app queda en `http://localhost:5173`.

### Verificación de tipos

```bash
npx tsc -b
```

### Linter

```bash
npm run lint
```

### Build de producción

```bash
npm run build
```

Genera los archivos estáticos en `dist/`.

## Credenciales de desarrollo

Si el backend está corriendo con los seeds de desarrollo, el login acepta
cualquiera de estos perfiles (todos con password **`Admin.dev.2026`**):

| Email | Rol | Redirige a |
|---|---|---|
| `admin@applogistica.dev` | Administrador | `/admin` |
| `coordinador@applogistica.dev` | Coordinador Logístico | `/coordinador` |
| `cliente@applogistica.dev` | Cliente | `/home` |
| `transportista@applogistica.dev` | Transportista | `/home` |
| `ejecutivo@applogistica.dev` | Ejecutivo | `/home` |
| `aprobador@applogistica.dev` | Aprobador Financiero | `/home` |

El Login tiene un dropdown de perfiles preconfigurado para agilizar las pruebas.

## Estructura del proyecto

```
src/
├── App.tsx                  # Enrutado raíz
├── main.tsx                 # Entry point (ThemeProvider + Router)
├── index.css                # Tokens de diseño + reset Tailwind v4
├── api/                     # Re-export del cliente axios unificado
├── services/                # Capa de acceso a API (adapta shapes del backend)
│   ├── api.ts
│   ├── authService.ts
│   ├── adminService.ts
│   ├── coordinadorServices.ts
│   ├── dashboardService.ts
│   └── solicitudService.ts
├── components/
│   ├── ui/                  # Primitivos shadcn (Button, Input, Dialog, …)
│   ├── ThemeProvider.tsx    # Dark mode (claro/oscuro, default oscuro)
│   ├── ThemeToggle.tsx
│   ├── NavBar.tsx
│   ├── AdminLayout.tsx      # Sidebar admin con submenús
│   ├── LoginForm.tsx / RegisterForm.tsx
│   ├── HomePage.tsx         # Vista cliente: mis solicitudes
│   ├── AdminPage.tsx        # Dashboard admin
│   ├── CoordinadorPage.tsx  # Listado + agendamiento
│   ├── SolicitudForm.tsx    # Wizard de 2 pasos
│   ├── SolicitudCompletionForm.tsx
│   ├── ContratosTable.tsx / ContratoModal / ContratoViewModal / NuevoContratoModal
│   ├── TransportistasTable.tsx / TransportistaModal / TransportistaDetalleModal
│   ├── TarifasContrato.tsx / AsignacionesTarifa.tsx / AsignacionTarifaPage.tsx
│   ├── FiltrosSolicitudes.tsx
│   ├── UserProfileSettings.tsx
│   └── NotFoundPage.tsx
├── context/
│   └── SolicitudContext.tsx
├── interfaces/
│   └── solicitud.ts
└── lib/
    └── utils.ts             # cn() helper
```

## Temas

- **Default**: dark mode
- **Toggle**: ícono sol/luna en el navbar (y en login/register)
- **Paleta**: tokens OKLCH basados en el azul corporativo `#243c6c`
- **Tipografía**: Inter (cargada de `rsms.me`)
- **Persistencia**: `localStorage.ui-theme` (`"light"` o `"dark"`)

## Responsive

- Tablas largas (Solicitudes, Contratos, Transportistas, Tarifas, Asignaciones)
  se convierten en **listas de cards** en viewports `< md` (768px).
- Grids de formularios apilan verticalmente en mobile.
- Sidebar admin colapsable; botón flotante para abrirlo en mobile.

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Login |
| `/register` | Registro |
| `/home` | Vista cliente (mis solicitudes) |
| `/crear-solicitud` | Wizard de creación de solicitud |
| `/coordinador` | Panel coordinador (listado + agendamiento) |
| `/configuracion` | Perfil de usuario |
| `/admin` | Dashboard admin (sidebar + submenús) |
| `/admin/contratos` | Gestión de contratos |
| `/admin/tarifas-contrato/:contratoId` | Tarifas de un contrato |
| `/admin/asignaciones-tarifa/:tarifaId` | Asignaciones de una tarifa |
| `/admin/asignar-tarifa/:tarifaId` | Formulario para asignar tarifa |
| `/admin/transportistas` | Flota (transportistas, conductores, vehículos) |
| `/admin/solicitudes` | Listado admin de solicitudes |

## Notas

- El login dev tiene un **dropdown de perfiles de prueba** con la contraseña
  hardcoded para agilizar el testing. Esto debe removerse antes de producción
  (ver comment `// TODO: eliminar antes de pasar a producción` en
  `src/components/LoginForm.tsx`).
- Los servicios de la carpeta `src/services/` hacen el _mapping_ entre los
  shapes del backend v2 y los tipos internos que espera la UI — los componentes
  no deberían llamar a axios directamente.
