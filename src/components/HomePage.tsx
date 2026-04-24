import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Inbox,
  Loader2,
  Plus,
  Truck,
} from 'lucide-react';
import { getSolicitudesPorUsuario } from '../services/solicitudService';
import { getSolicitudById } from '../services/coordinadorServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const usuario_id = Number(localStorage.getItem('usuario_id'));

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        const data = await getSolicitudesPorUsuario(usuario_id, 'detalles');
        setSolicitudes(data);
      } catch (error) {
        console.error('Error al obtener las solicitudes del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (usuario_id) fetchSolicitudes();
  }, [usuario_id]);

  const totalSolicitudes = solicitudes.length;
  const totalPages = Math.max(1, Math.ceil(totalSolicitudes / itemsPerPage));
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedSolicitudes = solicitudes.slice(startIndex, startIndex + itemsPerPage);

  const handleVerDetalles = (solicitud: any) => {
    setSelectedSolicitud(solicitud);
    setShowDetallesModal(true);
  };

  const handleVerEstado = async (solicitud: any) => {
    try {
      setLoading(true);
      const data = await getSolicitudById(solicitud.solicitud_id);
      setSelectedSolicitud(data);
      setShowEstadoModal(true);
    } catch (error) {
      console.error('Error al obtener el estado:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '—';
    try {
      return new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'medium',
      }).format(new Date(fecha));
    } catch {
      return fecha;
    }
  };

  const getEstadoBadge = (estado?: string) => {
    if (!estado) return <Badge variant="outline">Sin estado</Badge>;
    const e = estado.toLowerCase();
    if (e.includes('cancel')) return <Badge variant="destructive">{estado}</Badge>;
    if (e.includes('complet') || e.includes('retiro')) return <Badge variant="success">{estado}</Badge>;
    if (e.includes('agend')) return <Badge variant="default">{estado}</Badge>;
    if (e.includes('pendient') || e.includes('incomplet') || e.includes('borrador'))
      return <Badge variant="warning">{estado}</Badge>;
    return <Badge variant="secondary">{estado}</Badge>;
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis solicitudes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de solicitudes creadas y su estado actual
          </p>
        </div>
        <Button size="lg" onClick={() => navigate('/crear-solicitud')}>
          <Plus className="h-4 w-4" />
          Crear solicitud
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : totalSolicitudes === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Aún no tienes solicitudes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea tu primera solicitud para verla aquí
              </p>
            </div>
            <Button onClick={() => navigate('/crear-solicitud')}>
              <Plus className="h-4 w-4" />
              Crear solicitud
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedSolicitudes.map((s) => (
              <Card
                key={s.solicitud_id}
                className="group flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Solicitud</div>
                        <div className="font-semibold leading-tight">#{s.solicitud_id}</div>
                      </div>
                    </div>
                    {s.requiere_transporte ? (
                      <Badge variant="default" className="gap-1">
                        <Truck className="h-3 w-3" />
                        Transporte
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-0">
                  <div className="space-y-2">
                    <p className="line-clamp-2 text-sm text-foreground">
                      {s.descripcion || 'Sin descripción'}
                    </p>
                    {s.fecha_servicio_solicitada && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatFecha(s.fecha_servicio_solicitada)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleVerDetalles(s)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detalles
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleVerEstado(s)}
                    >
                      Estado
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                Página <span className="font-medium text-foreground">{page}</span> de{' '}
                {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal detalles */}
      <Dialog open={showDetallesModal} onOpenChange={setShowDetallesModal}>
        <DialogContent>
          {selectedSolicitud && (
            <>
              <DialogHeader>
                <DialogTitle>Solicitud #{selectedSolicitud.solicitud_id}</DialogTitle>
                <DialogDescription>Detalles de tu solicitud</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Descripción
                  </div>
                  <p className="mt-1 text-sm">{selectedSolicitud.descripcion || '—'}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Fecha servicio
                    </div>
                    <p className="mt-1 text-sm">
                      {formatFecha(selectedSolicitud.fecha_servicio_solicitada)}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Hora
                    </div>
                    <p className="mt-1 text-sm">
                      {selectedSolicitud.hora_servicio_solicitada || '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Transporte
                  </div>
                  <div className="mt-1">
                    {selectedSolicitud.requiere_transporte ? (
                      <Badge variant="default">Requiere transporte</Badge>
                    ) : (
                      <Badge variant="secondary">Sin transporte</Badge>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetallesModal(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal estado */}
      <Dialog open={showEstadoModal} onOpenChange={setShowEstadoModal}>
        <DialogContent>
          {selectedSolicitud && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Estado de solicitud #{selectedSolicitud.solicitud_id}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">Estado actual:</div>
                {getEstadoBadge(selectedSolicitud.nombre_estado)}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEstadoModal(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
