import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSignature,
  FileText,
  Gauge,
  Factory,
  Key,
  Layers,
  Menu,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// Mapa de rutas derivadas → item padre del sidebar.
// Cuando la URL matchea alguna de estas rutas, marcamos activo el item padre
// aunque la URL no empiece con su path base.
const CHILD_ROUTE_TO_PARENT: Array<[RegExp, string]> = [
  [/^\/admin\/tarifas-contrato(\/|$)/,      '/admin/contratos'],
  [/^\/admin\/asignaciones-tarifa(\/|$)/,   '/admin/contratos'],
  [/^\/admin\/asignar-tarifa(\/|$)/,        '/admin/contratos'],
];

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: BarChart3 },
  { id: 'crearSolicitud', label: 'Crear solicitud', path: '/admin/crear-solicitud', icon: Plus },
  { id: 'solicitudes', label: 'Solicitudes', path: '/admin/solicitudes', icon: FileText },
  { id: 'contratos', label: 'Contratos', path: '/admin/contratos', icon: FileSignature },
  { id: 'clientes', label: 'Clientes', path: '/admin/clientes', icon: Users },
  { id: 'transportistas', label: 'Transportistas', path: '/admin/transportistas', icon: Truck },
  {
    id: 'maestros',
    label: 'Maestros',
    icon: Layers,
    children: [
      { id: 'centros', label: 'Centros', path: '/admin/centros', icon: Building2 },
      { id: 'declaraciones', label: 'Declaraciones', path: '/admin/declaraciones', icon: ClipboardList },
      { id: 'unidades', label: 'Unidades referenciales', path: '/admin/unidades-referenciales', icon: Ruler },
      { id: 'lineas', label: 'Líneas de descarga', path: '/admin/lineas-descarga', icon: ShoppingBag },
      { id: 'tiposTransporte', label: 'Tipos de transporte', path: '/admin/tipos-transporte', icon: Truck },
      { id: 'referencias', label: 'Referencias', path: '/admin/referencias', icon: Tag },
      { id: 'capacidades', label: 'Capacidades de transporte', path: '/admin/capacidades-transporte', icon: Gauge },
      { id: 'generadores', label: 'Generadores', path: '/admin/generadores', icon: Factory },
    ],
  },
  {
    id: 'administracion',
    label: 'Administración',
    icon: Wrench,
    children: [
      { id: 'usuarios', label: 'Usuarios', path: '/admin/usuarios', icon: UserCog },
      { id: 'roles', label: 'Roles', path: '/admin/roles', icon: ShieldCheck },
      { id: 'permisos', label: 'Permisos', path: '/admin/permisos', icon: Key },
      { id: 'asignaciones', label: 'Asignaciones', path: '/admin/asignaciones', icon: ClipboardList },
    ],
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string>('');

  const activePath = location.pathname;

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) setCollapsed(false);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Abrir automáticamente el grupo que contiene la ruta actual
  useEffect(() => {
    for (const item of NAV) {
      if (item.children?.some((c) => c.path && activePath.startsWith(c.path))) {
        setOpenGroup(item.id);
        return;
      }
    }
  }, [activePath]);

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/admin') return activePath === '/admin';

    // Match por ruta derivada (ej: /admin/tarifas-contrato/5 → /admin/contratos)
    const parentMatch = CHILD_ROUTE_TO_PARENT.find(([re]) => re.test(activePath));
    if (parentMatch && parentMatch[1] === path) return true;

    // Para items hijos de sidebar (ej: /admin/centros), chequear que empieza con path.
    // Para items "hoja" como /admin/contratos evitamos matchear /admin/contratos-algo.
    if (activePath === path) return true;
    return activePath.startsWith(path + '/');
  };

  const groupHasActiveChild = (item: NavItem) =>
    item.children?.some((c) => isActive(c.path)) ?? false;

  const go = (path?: string) => {
    if (!path) return;
    navigate(path);
    setMobileOpen(false);
  };

  const sidebarWidth = collapsed ? 'md:w-16' : 'md:w-64';

  const sidebarContent = useMemo(
    () => (
      <nav className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2 border-b border-sidebar-border px-5 py-5">
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Administración
              </p>
              <h2 className="mt-0.5 text-xl font-bold leading-tight tracking-tight text-sidebar-foreground">
                Panel admin
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 shrink-0 md:flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Colapsar menú"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                const isOpen = openGroup === item.id;
                const hasActive = groupHasActiveChild(item);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setOpenGroup(isOpen ? '' : item.id)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        hasActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isOpen && 'rotate-90'
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && isOpen && (
                      <ul className="mt-1 space-y-0.5 pl-4">
                        {item.children.map((c) => {
                          const CIcon = c.icon;
                          const active = isActive(c.path);
                          return (
                            <li key={c.id}>
                              <button
                                onClick={() => go(c.path)}
                                className={cn(
                                  'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                                  active
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                )}
                              >
                                <CIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{c.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              const active = isActive(item.path);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => go(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    ),
    [collapsed, openGroup, activePath]
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          'fixed left-0 top-20 z-30 hidden h-[calc(100vh-5rem)] border-r border-sidebar-border bg-sidebar md:block',
          sidebarWidth
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-20 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-20 z-50 h-[calc(100vh-5rem)] w-64 border-r border-sidebar-border bg-sidebar md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Botón mobile para abrir */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-40 shadow-lg md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 transition-all',
          collapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
