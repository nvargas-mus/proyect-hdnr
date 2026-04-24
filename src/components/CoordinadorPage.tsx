import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Save,
  Truck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  agendarSolicitud,
  getAsignacionesTarifa,
  getConductoresPorTransportista,
  getLineasDescarga,
  getSolicitudById,
  getSolicitudesCoordinador,
  getTransportistas,
  getVehiculosPorTransportista,
  AgendamientoData,
  AsignacionTarifa,
  LineaDescarga,
  Solicitud,
  Transportista,
} from '../services/coordinadorServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FiltrosSolicitudes from './FiltrosSolicitudes';

type Conductor = { conductor_id: number; nombre: string };
type Vehiculo = {
  vehiculo_id: number;
  patente: string;
  nombre_tipo_transporte: string;
};

const estadoBadge = (estado: string) => {
  const e = (estado || '').toLowerCase();
  if (e.includes('cancel')) return <Badge variant="destructive">{estado}</Badge>;
  if (e.includes('complet') || e.includes('retiro'))
    return <Badge variant="success">{estado}</Badge>;
  if (e.includes('agend')) return <Badge variant="default">{estado}</Badge>;
  if (e.includes('planta')) return <Badge variant="default">{estado}</Badge>;
  if (
    e.includes('pendient') ||
    e.includes('incomplet') ||
    e.includes('borrador') ||
    e.includes('cupo')
  )
    return <Badge variant="warning">{estado}</Badge>;
  return <Badge variant="secondary">{estado || 'Sin estado'}</Badge>;
};

const formatFecha = (s: string) => {
  if (!s) return '—';
  try {
    return new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      dateStyle: 'medium',
    }).format(new Date(s));
  } catch {
    return s;
  }
};

const CoordinadorPage = () => {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showAgendamientoModal, setShowAgendamientoModal] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingAgendamiento, setLoadingAgendamiento] = useState(false);

  const [mensajeErrorAsignaciones, setMensajeErrorAsignaciones] = useState<string | null>(
    null
  );
  const [hayAsignacionesDisponibles, setHayAsignacionesDisponibles] = useState(true);

  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [solicitudDetalle, setSolicitudDetalle] = useState<Solicitud | null>(null);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionTarifa[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [agendamientoError, setAgendamientoError] = useState<string | null>(null);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [lineasDescarga, setLineasDescarga] = useState<LineaDescarga[]>([]);

  const [formAgendamiento, setFormAgendamiento] = useState<AgendamientoData>({
    fecha_servicio_programada: '',
    hora_servicio_programada: '',
    id_linea_descarga: 0,
    numero_nota_venta: '',
    descripcion: '',
    clase_peligrosidad: '',
    declaracion_numero: '',
    transportista_id: undefined,
    asignacion_id: undefined,
    conductor_id: null,
    vehiculo_id: null,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { datos, metadatos } = await getSolicitudesCoordinador(
          paginaActual,
          20,
          activeFilters
        );
        setSolicitudes(datos);
        setTotalPaginas(metadatos.total_paginas);
        setTotalSolicitudes(metadatos.total_resultados);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Sesión expirada.');
          setTimeout(() => navigate('/'), 2000);
        } else setError(err.message || 'Error al cargar solicitudes');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [paginaActual, activeFilters, navigate]);

  // Scroll automático al top del modal cuando aparece un error de agendamiento
  useEffect(() => {
    if (agendamientoError || mensajeErrorAsignaciones || successMessage) {
      // Pequeño timeout para dar tiempo a que el render del alert termine
      setTimeout(() => {
        const content = document.querySelector(
          '[role="dialog"][data-state="open"] > div'
        );
        content?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }, [agendamientoError, mensajeErrorAsignaciones, successMessage]);

  useEffect(() => {
    if (!formAgendamiento.transportista_id) {
      setConductores([]);
      setVehiculos([]);
      return;
    }
    getConductoresPorTransportista(formAgendamiento.transportista_id)
      .then((c: Conductor[]) => setConductores(c))
      .catch(() => setConductores([]));
    getVehiculosPorTransportista(formAgendamiento.transportista_id)
      .then((v: Vehiculo[]) => setVehiculos(v))
      .catch(() => setVehiculos([]));
  }, [formAgendamiento.transportista_id]);

  const handleVerDetalle = async (id: number) => {
    setSelectedSolicitudId(id);
    setShowDetalleModal(true);
    setLoadingDetalle(true);
    try {
      const s = await getSolicitudById(id);
      setSolicitudDetalle(s);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleAbrirAgendamiento = async (id: number) => {
    setSelectedSolicitudId(id);
    setAgendamientoError(null);
    setSuccessMessage(null);
    setLoadingDetalle(true);
    try {
      const sol = await getSolicitudById(id);
      setSolicitudDetalle(sol);
      setTransportistas(await getTransportistas());
      try {
        setLineasDescarga(await getLineasDescarga());
      } catch {
        setLineasDescarga([]);
      }

      if (sol.requiere_transporte && sol.detalles_con_transporte?.length) {
        const mat = sol.detalles_con_transporte[0].codigo_material_matnr;
        try {
          const aSigns = await getAsignacionesTarifa(
            sol.codigo_cliente_kunnr,
            sol.direccion_id,
            mat
          );
          setAsignaciones(aSigns);
          setMensajeErrorAsignaciones(null);
          setHayAsignacionesDisponibles(aSigns.length > 0);
        } catch (e: any) {
          setAsignaciones([]);
          setMensajeErrorAsignaciones(e.message || 'No se encontraron asignaciones.');
          setHayAsignacionesDisponibles(false);
        }
      } else {
        setAsignaciones([]);
        setHayAsignacionesDisponibles(false);
      }

      const fechaSolicitada = sol.fecha_servicio_solicitada
        ? new Date(sol.fecha_servicio_solicitada).toISOString().split('T')[0]
        : '';

      setFormAgendamiento({
        fecha_servicio_programada: fechaSolicitada,
        hora_servicio_programada: sol.hora_servicio_solicitada || '',
        id_linea_descarga: 0,
        numero_nota_venta: '',
        descripcion: `Agendamiento para solicitud #${id}`,
        clase_peligrosidad: '',
        declaracion_numero: '',
        transportista_id: sol.detalles_con_transporte?.[0]?.transportista_id ?? undefined,
        asignacion_id: undefined,
        conductor_id: null,
        vehiculo_id: null,
      });

      setShowAgendamientoModal(true);
    } catch {
      setAgendamientoError('Error al cargar datos de agendamiento');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleSubmitAgendamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSolicitudId) return;

    try {
      setLoadingAgendamiento(true);
      setAgendamientoError(null);

      const hora =
        formAgendamiento.hora_servicio_programada.length === 5
          ? `${formAgendamiento.hora_servicio_programada}:00`
          : formAgendamiento.hora_servicio_programada;

      const datos: AgendamientoData = {
        ...formAgendamiento,
        hora_servicio_programada: hora,
      };

      if (
        solicitudDetalle?.requiere_transporte &&
        (!datos.transportista_id || !datos.asignacion_id)
      ) {
        setAgendamientoError(
          'Selecciona transportista y asignación antes de agendar.'
        );
        return;
      }

      await agendarSolicitud(selectedSolicitudId, datos);
      setSuccessMessage(`Solicitud #${selectedSolicitudId} agendada correctamente`);

      setTimeout(() => {
        getSolicitudesCoordinador(paginaActual, 20, activeFilters)
          .then((r) => setSolicitudes(r.datos))
          .catch(console.error);
        setShowAgendamientoModal(false);
        setSelectedSolicitudId(null);
        setAgendamientoError(null);
        setSuccessMessage(null);
        setSolicitudDetalle(null);
      }, 1500);
    } catch (err: any) {
      const errData = err.response?.data?.error;
      const msg =
        typeof errData === 'string'
          ? errData
          : errData?.message || err.message || 'Error al agendar';
      setAgendamientoError(msg);
    } finally {
      setLoadingAgendamiento(false);
    }
  };

  // Conteos basados en estado_id (más confiable que comparar strings)
  // 1=Borrador, 2=ListaParaAgendar, 3=Agendada, 4=RecepcionadaEnPlanta,
  // 5=RetiroCompletado, 6=Cancelada, 7=PendienteAprobacionCupo
  const porAgendar = solicitudes.filter((s) => s.estado_id === 2).length;
  const agendadas = solicitudes.filter((s) => s.estado_id === 3 || s.estado_id === 4).length;
  const completadas = solicitudes.filter((s) => s.estado_id === 5).length;

  const STATS = [
    {
      label: 'Total',
      value: totalSolicitudes,
      hint: 'En todas las páginas',
      icon: FileText,
      bar: 'bg-primary',
      accent: 'bg-primary/10 text-primary',
    },
    {
      label: 'Por agendar',
      value: porAgendar,
      hint: 'Listas para programar',
      icon: CalendarClock,
      bar: 'bg-warning',
      accent: 'bg-warning/10 text-warning',
    },
    {
      label: 'En proceso',
      value: agendadas,
      hint: 'Agendadas y en planta',
      icon: CalendarCheck2,
      bar: 'bg-primary',
      accent: 'bg-primary/10 text-primary',
    },
    {
      label: 'Completadas',
      value: completadas,
      hint: 'Retiros exitosos',
      icon: CheckCircle2,
      bar: 'bg-success',
      accent: 'bg-success/10 text-success',
    },
  ];

  // Saludo y contexto temporal
  const hoy = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago',
  }).format(new Date());

  const colorFromText = (text: string) => {
    // Hash simple para asignar un color consistente al avatar del cliente
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    const palette = [
      'bg-primary/15 text-primary',
      'bg-success/15 text-success',
      'bg-warning/15 text-warning',
      'bg-destructive/15 text-destructive',
      'bg-blue-500/15 text-blue-500',
      'bg-purple-500/15 text-purple-500',
      'bg-teal-500/15 text-teal-500',
    ];
    return palette[Math.abs(h) % palette.length];
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
      {/* Hero con saludo contextual */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {hoy}
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Panel de coordinación
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Programa agendamientos, monitorea la operación y mantén el flujo de retiros
          al día.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="relative overflow-hidden transition-all hover:shadow-md"
            >
              {/* Barra de acento superior */}
              <span className={`absolute inset-x-0 top-0 h-1 ${s.bar}`} />
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <FiltrosSolicitudes
        onApplyFilters={(f) => {
          setActiveFilters(f);
          setPaginaActual(1);
        }}
      />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Solicitudes</h2>
              <p className="text-xs text-muted-foreground">
                {totalSolicitudes} resultado{totalSolicitudes !== 1 ? 's' : ''}
                {Object.keys(activeFilters).length > 0 && ' · filtros aplicados'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            Página {paginaActual} / {totalPaginas}
          </Badge>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando solicitudes…</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold">No hay solicitudes</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Ajusta los filtros o espera a que los clientes creen nuevas solicitudes
                  para comenzar a coordinar.
                </p>
              </div>
            </div>
          ) : (
            <>
            {/* ── Cards para mobile (< md) ─────────────────────────────────── */}
            <div className="divide-y divide-border md:hidden">
              {solicitudes.map((s) => {
                const inicial = (s.nombre_cliente || s.nombre_name1 || '?')
                  .trim()
                  .charAt(0)
                  .toUpperCase();
                const avatarColor = colorFromText(
                  s.nombre_cliente || String(s.codigo_cliente_kunnr)
                );
                const hora = s.hora_servicio_solicitada?.substring(0, 5);
                return (
                  <div
                    key={`m-${s.solicitud_id}-${s.fecha_solicitud}`}
                    className="space-y-3 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}
                      >
                        {inicial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                            #{s.solicitud_id}
                          </span>
                          {estadoBadge(s.nombre_estado)}
                        </div>
                        <p className="mt-1 truncate font-medium">
                          {s.nombre_cliente ||
                            s.nombre_name1 ||
                            'Cliente sin nombre'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Código {s.codigo_cliente_kunnr}
                          {s.centro_vwerk && ` · Centro ${s.centro_vwerk}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <CalendarCheck2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{formatFecha(s.fecha_servicio_solicitada)}</span>
                      {hora && (
                        <span className="text-muted-foreground">· {hora} hs</span>
                      )}
                      {s.requiere_transporte && (
                        <Badge variant="secondary" className="ml-auto gap-1">
                          <Truck className="h-3 w-3" />
                          Transporte
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAbrirAgendamiento(s.solicitud_id)}
                      >
                        <CalendarCheck2 className="h-3.5 w-3.5" />
                        Agendar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerDetalle(s.solicitud_id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detalle
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Tabla para desktop (≥ md) ────────────────────────────────── */}
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Transporte</TableHead>
                  <TableHead className="w-32">Centro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudes.map((s) => {
                  const inicial = (s.nombre_cliente || s.nombre_name1 || '?')
                    .trim()
                    .charAt(0)
                    .toUpperCase();
                  const avatarColor = colorFromText(
                    s.nombre_cliente || String(s.codigo_cliente_kunnr)
                  );
                  const hora = s.hora_servicio_solicitada?.substring(0, 5);
                  return (
                    <TableRow
                      key={`${s.solicitud_id}-${s.fecha_solicitud}`}
                      className="group"
                    >
                      <TableCell>
                        <span className="rounded-md bg-muted px-2 py-1 text-xs font-mono font-semibold">
                          #{s.solicitud_id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}
                          >
                            {inicial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium leading-tight">
                              {s.nombre_cliente || s.nombre_name1 || 'Cliente sin nombre'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              Código {s.codigo_cliente_kunnr}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CalendarCheck2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatFecha(s.fecha_servicio_solicitada)}
                          </span>
                          {hora && (
                            <span className="text-xs text-muted-foreground">
                              a las {hora} hs
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{estadoBadge(s.nombre_estado)}</TableCell>
                      <TableCell className="text-center">
                        {s.requiere_transporte ? (
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success"
                            title="Requiere transporte"
                          >
                            <Truck className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                            title="Sin transporte"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.centro_vwerk ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {s.centro_vwerk}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-primary hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleAbrirAgendamiento(s.solicitud_id)}
                          >
                            <CalendarCheck2 className="h-3.5 w-3.5" />
                            Agendar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ver detalle"
                            onClick={() => handleVerDetalle(s.solicitud_id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Más" disabled>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {solicitudes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página <span className="font-medium text-foreground">{paginaActual}</span> de{' '}
            {totalPaginas}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      <Dialog
        open={showDetalleModal}
        onOpenChange={(o) => {
          if (!o) {
            setShowDetalleModal(false);
            setSolicitudDetalle(null);
            setSelectedSolicitudId(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle de solicitud #{selectedSolicitudId}</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud seleccionada
            </DialogDescription>
          </DialogHeader>

          {loadingDetalle ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : solicitudDetalle ? (
            <div className="space-y-6">
              <Section title="Información general">
                <Row label="Cliente" value={solicitudDetalle.nombre_cliente} />
                <Row label="Código" value={solicitudDetalle.codigo_cliente_kunnr} />
                <Row label="Sucursal" value={solicitudDetalle.sucursal_name2} />
                <Row
                  label="Estado"
                  value={estadoBadge(solicitudDetalle.nombre_estado)}
                />
              </Section>

              <Section title="Servicio">
                <Row
                  label="Fecha solicitada"
                  value={formatFecha(solicitudDetalle.fecha_servicio_solicitada)}
                />
                <Row
                  label="Hora solicitada"
                  value={solicitudDetalle.hora_servicio_solicitada?.substring(0, 5)}
                />
                <Row
                  label="Fecha programada"
                  value={
                    solicitudDetalle.fecha_servicio_programada
                      ? formatFecha(solicitudDetalle.fecha_servicio_programada)
                      : 'No asignada'
                  }
                />
                <Row
                  label="Línea descarga"
                  value={solicitudDetalle.nombre_linea || 'No informada'}
                />
                <Row
                  label="Nota de venta"
                  value={solicitudDetalle.numero_nota_venta ?? 'No informada'}
                />
                <Row
                  label="Descripción"
                  value={solicitudDetalle.descripcion || '—'}
                />
              </Section>

              <Section title="Dirección y contacto">
                <Row
                  label="Dirección"
                  value={solicitudDetalle.direccion_completa || '—'}
                />
                <Row label="Comuna" value={solicitudDetalle.comuna || '—'} />
                <Row label="Contacto" value={solicitudDetalle.nombre || '—'} />
                <Row label="Teléfono" value={solicitudDetalle.telefono || '—'} />
                <Row label="Email" value={solicitudDetalle.email_contacto || '—'} />
              </Section>

              <Section title="Declaración y generador">
                <Row
                  label="Declaración"
                  value={solicitudDetalle.declaracion_nombre || '—'}
                />
                <Row
                  label="N° declaración"
                  value={solicitudDetalle.declaracion_numero || '—'}
                />
                <Row
                  label="Clase peligrosidad"
                  value={solicitudDetalle.clase_peligrosidad || '—'}
                />
                <Row
                  label="Generador igual a cliente"
                  value={solicitudDetalle.generador_igual_cliente ? 'Sí' : 'No'}
                />
                {!solicitudDetalle.generador_igual_cliente && (
                  <Row
                    label="Generador"
                    value={solicitudDetalle.nombre_generador || '—'}
                  />
                )}
              </Section>

              {!!solicitudDetalle.detalles_con_transporte?.length && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Transporte</h4>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Transportista</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Patente</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitudDetalle.detalles_con_transporte.map((d, i) => (
                          <TableRow key={i}>
                            <TableCell>{d.nombre_material_maktg}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {d.nombre_transportista || '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {d.nombre_tipo_transporte || '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {d.patente || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {!!solicitudDetalle.residuos?.length && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Residuos</h4>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Unidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitudDetalle.residuos.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.nombre_material_maktg}</TableCell>
                            <TableCell>{r.codigo_material_matnr}</TableCell>
                            <TableCell>{r.cantidad_declarada}</TableCell>
                            <TableCell>{r.nombre_unidad}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No se encontró la solicitud</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetalleModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal agendamiento */}
      <Dialog
        open={showAgendamientoModal}
        onOpenChange={(o) => {
          if (!o) {
            setShowAgendamientoModal(false);
            setSelectedSolicitudId(null);
            setAgendamientoError(null);
            setSuccessMessage(null);
            setSolicitudDetalle(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarCheck2 className="h-4 w-4" />
              </div>
              Agendar solicitud #{selectedSolicitudId}
            </DialogTitle>
            <DialogDescription>
              Programa la fecha, el destino en planta y el transporte del servicio.
            </DialogDescription>
          </DialogHeader>

          {loadingDetalle ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando datos…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAgendamiento} className="space-y-5">
              {/* Resumen de la solicitud */}
              {solicitudDetalle && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colorFromText(solicitudDetalle.nombre_cliente || String(solicitudDetalle.codigo_cliente_kunnr))}`}
                    >
                      {(solicitudDetalle.nombre_cliente || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold leading-tight">
                        {solicitudDetalle.nombre_cliente || 'Cliente sin nombre'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código {solicitudDetalle.codigo_cliente_kunnr}
                        {solicitudDetalle.centro_vwerk && ` · Centro ${solicitudDetalle.centro_vwerk}`}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {estadoBadge(solicitudDetalle.nombre_estado)}
                        {solicitudDetalle.requiere_transporte ? (
                          <Badge variant="secondary" className="gap-1">
                            <Truck className="h-3 w-3" />
                            Con transporte
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sin transporte</Badge>
                        )}
                        {solicitudDetalle.fecha_servicio_solicitada && (
                          <span className="text-xs text-muted-foreground">
                            Solicitado para{' '}
                            {formatFecha(solicitudDetalle.fecha_servicio_solicitada)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {successMessage && (
                <Alert variant="success">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              {agendamientoError && (
                <Alert variant="destructive">
                  <AlertDescription>{agendamientoError}</AlertDescription>
                </Alert>
              )}
              {mensajeErrorAsignaciones && (
                <Alert variant="warning">
                  <AlertDescription>{mensajeErrorAsignaciones}</AlertDescription>
                </Alert>
              )}

              {/* Sección 1: Programación */}
              <section className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">Programación del servicio</h4>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label>
                      Fecha programada <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      value={formAgendamiento.fecha_servicio_programada}
                      onChange={(e) =>
                        setFormAgendamiento((p) => ({
                          ...p,
                          fecha_servicio_programada: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label>
                      Hora programada <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="time"
                      required
                      value={formAgendamiento.hora_servicio_programada}
                      onChange={(e) =>
                        setFormAgendamiento((p) => ({
                          ...p,
                          hora_servicio_programada: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label>
                      Línea de descarga <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={
                        formAgendamiento.id_linea_descarga
                          ? String(formAgendamiento.id_linea_descarga)
                          : ''
                      }
                      onValueChange={(v) =>
                        setFormAgendamiento((p) => ({
                          ...p,
                          id_linea_descarga: Number(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            lineasDescarga.length === 0
                              ? 'Sin líneas disponibles'
                              : 'Seleccionar…'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {lineasDescarga.map((l) => (
                          <SelectItem
                            key={l.id_linea_descarga}
                            value={String(l.id_linea_descarga)}
                          >
                            {l.nombre_linea}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label>
                      N° nota de venta <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      required
                      placeholder="Ej: 800000123"
                      value={formAgendamiento.numero_nota_venta}
                      onChange={(e) =>
                        setFormAgendamiento((p) => ({
                          ...p,
                          numero_nota_venta: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label>Descripción (opcional)</Label>
                  <Textarea
                    rows={2}
                    placeholder="Notas internas para el agendamiento…"
                    value={formAgendamiento.descripcion}
                    onChange={(e) =>
                      setFormAgendamiento((p) => ({ ...p, descripcion: e.target.value }))
                    }
                  />
                </div>
              </section>

              {/* Sección 2: Peligrosidad (opcional) */}
              <section className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <h4 className="text-sm font-semibold">
                    Información de peligrosidad
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      opcional
                    </span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label>Clase</Label>
                    <Input
                      placeholder="Ej: 3.2"
                      value={formAgendamiento.clase_peligrosidad}
                      onChange={(e) =>
                        setFormAgendamiento((p) => ({
                          ...p,
                          clase_peligrosidad: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label>N° declaración</Label>
                    <Input
                      placeholder="Ej: D-2024-001"
                      value={formAgendamiento.declaracion_numero}
                      onChange={(e) =>
                        setFormAgendamiento((p) => ({
                          ...p,
                          declaracion_numero: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Sección 3: Transporte (solo si requiere) */}
              {solicitudDetalle?.requiere_transporte && (
                <section className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold">Asignación de transporte</h4>
                    </div>
                    {!hayAsignacionesDisponibles && (
                      <Badge variant="warning">Sin asignaciones</Badge>
                    )}
                  </div>

                  {!hayAsignacionesDisponibles && (
                    <Alert variant="warning">
                      <AlertDescription>
                        No hay asignaciones manuales de tarifa para este cliente,
                        dirección y material. Crea una asignación antes de agendar.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label>
                        Asignación de tarifa{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={
                          formAgendamiento.asignacion_id
                            ? String(formAgendamiento.asignacion_id)
                            : ''
                        }
                        onValueChange={(v) =>
                          setFormAgendamiento((p) => ({
                            ...p,
                            asignacion_id: Number(v),
                          }))
                        }
                        disabled={!hayAsignacionesDisponibles}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !hayAsignacionesDisponibles
                                ? 'Sin asignaciones'
                                : 'Seleccionar…'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {asignaciones.map((a) => (
                            <SelectItem
                              key={a.asignacion_id}
                              value={String(a.asignacion_id)}
                            >
                              {a.nombre_transportista} – {a.descripcion_tarifa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label>
                        Transportista <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={
                          formAgendamiento.transportista_id
                            ? String(formAgendamiento.transportista_id)
                            : ''
                        }
                        onValueChange={(v) =>
                          setFormAgendamiento((p) => ({
                            ...p,
                            transportista_id: Number(v),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              transportistas.length === 0
                                ? 'Sin transportistas'
                                : 'Seleccionar…'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {transportistas.map((t) => (
                            <SelectItem
                              key={t.transportista_id}
                              value={String(t.transportista_id)}
                            >
                              {t.nombre_transportista}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label>
                        Vehículo{' '}
                        <span className="text-xs font-normal text-muted-foreground">
                          (opcional)
                        </span>
                      </Label>
                      <Select
                        value={
                          formAgendamiento.vehiculo_id
                            ? String(formAgendamiento.vehiculo_id)
                            : ''
                        }
                        onValueChange={(v) =>
                          setFormAgendamiento((p) => ({
                            ...p,
                            vehiculo_id: v ? Number(v) : null,
                          }))
                        }
                        disabled={!formAgendamiento.transportista_id}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formAgendamiento.transportista_id
                                ? 'Elige transportista primero'
                                : vehiculos.length === 0
                                  ? 'Sin vehículos'
                                  : 'Seleccionar…'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {vehiculos.map((v) => (
                            <SelectItem
                              key={v.vehiculo_id}
                              value={String(v.vehiculo_id)}
                            >
                              {v.patente} – {v.nombre_tipo_transporte}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label>
                        Conductor{' '}
                        <span className="text-xs font-normal text-muted-foreground">
                          (opcional)
                        </span>
                      </Label>
                      <Select
                        value={
                          formAgendamiento.conductor_id
                            ? String(formAgendamiento.conductor_id)
                            : ''
                        }
                        onValueChange={(v) =>
                          setFormAgendamiento((p) => ({
                            ...p,
                            conductor_id: v ? Number(v) : null,
                          }))
                        }
                        disabled={!formAgendamiento.transportista_id}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !formAgendamiento.transportista_id
                                ? 'Elige transportista primero'
                                : conductores.length === 0
                                  ? 'Sin conductores'
                                  : 'Seleccionar…'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {conductores.map((c) => (
                            <SelectItem
                              key={c.conductor_id}
                              value={String(c.conductor_id)}
                            >
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAgendamientoModal(false)}
                  disabled={loadingAgendamiento}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loadingAgendamiento}>
                  {loadingAgendamiento ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Agendando…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar agendamiento
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <dl className="grid grid-cols-1 gap-0 rounded-md border border-border bg-muted/30 sm:grid-cols-2">
        {children}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 last:border-0 sm:last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium">{value ?? '—'}</dd>
    </div>
  );
}

export default CoordinadorPage;
