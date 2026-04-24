import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  FileSignature,
  FileText,
  Plus,
  Truck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QUICK_ACTIONS = [
  {
    title: 'Crear solicitud',
    description: 'Nueva solicitud de servicio paso a paso',
    icon: Plus,
    path: '/admin/crear-solicitud',
    color: 'bg-primary text-primary-foreground',
  },
  {
    title: 'Solicitudes',
    description: 'Listado completo con filtros y agendamiento',
    icon: FileText,
    path: '/admin/solicitudes',
    color: 'bg-card text-foreground',
  },
  {
    title: 'Contratos',
    description: 'Administrar contratos y tarifarios',
    icon: FileSignature,
    path: '/admin/contratos',
    color: 'bg-card text-foreground',
  },
  {
    title: 'Transportistas',
    description: 'Flota, conductores y vehículos',
    icon: Truck,
    path: '/admin/transportistas',
    color: 'bg-card text-foreground',
  },
];

const STATS = [
  { label: 'Solicitudes activas', value: '—', hint: 'Pendientes + agendadas', icon: FileText },
  { label: 'Contratos vigentes', value: '—', hint: 'Incluyendo spot', icon: FileSignature },
  { label: 'Transportistas', value: '—', hint: 'En flota registrada', icon: Truck },
  { label: 'Clientes activos', value: '—', hint: 'Con solicitudes este mes', icon: Users },
];

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de control</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general del sistema y accesos rápidos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Accesos rápidos</h2>
          <span className="text-xs text-muted-foreground">Ir directo a lo más usado</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            const isPrimary = a.color.includes('primary');
            return (
              <button
                key={a.title}
                onClick={() => navigate(a.path)}
                className={`group flex h-full flex-col justify-between gap-6 rounded-xl border border-border ${
                  isPrimary ? 'border-primary/30' : ''
                } ${a.color} p-6 text-left shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isPrimary ? 'bg-white/20' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight
                    className={`h-4 w-4 opacity-0 transition-all group-hover:opacity-100 ${
                      isPrimary ? 'text-white' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p
                    className={`mt-1 text-sm ${
                      isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}
                  >
                    {a.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aquí se mostrará un feed con los eventos y movimientos recientes del sistema.
            </p>
            <Button
              variant="link"
              className="mt-2 h-auto px-0"
              onClick={() => navigate('/admin/solicitudes')}
            >
              Ver todas las solicitudes
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado operativo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Resumen estadístico de la actividad del sistema: solicitudes por estado,
              ocupación de plantas y carga de transportistas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
