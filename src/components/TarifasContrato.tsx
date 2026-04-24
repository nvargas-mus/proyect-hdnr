import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2,
  List,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  createTarifa,
  deleteTarifa,
  getContratoById,
  getTarifasByContrato,
  getTiposTransporte,
  Contrato,
  PaginationInfo,
  TarifaContrato,
  TipoTransporte,
} from '../services/adminService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TarifaFormData {
  contrato_id: number;
  descripcion_tarifa: string;
  tipo_transporte_id: number;
  tarifa_inicial: number;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string | null;
}

const TarifasContrato = () => {
  const { contratoId } = useParams<{ contratoId: string }>();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [tarifas, setTarifas] = useState<TarifaContrato[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [tiposTransporte, setTiposTransporte] = useState<TipoTransporte[]>([]);
  const [formData, setFormData] = useState<TarifaFormData>({
    contrato_id: parseInt(contratoId || '0'),
    descripcion_tarifa: '',
    tipo_transporte_id: 0,
    tarifa_inicial: 0,
    fecha_inicio_vigencia: '',
    fecha_fin_vigencia: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchContratoDetails = async () => {
    if (!contratoId) return;
    try {
      const data = await getContratoById(parseInt(contratoId));
      setContrato(data);
    } catch {
      setError('Error al obtener los detalles del contrato.');
    }
  };

  const fetchTarifas = async (limit: number, offset: number) => {
    if (!contratoId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getTarifasByContrato(parseInt(contratoId), limit, offset);
      setTarifas(res.data);
      setPagination(res.pagination);
    } catch {
      setError('No se pudieron obtener las tarifas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposTransporte = async () => {
    try {
      const tipos = await getTiposTransporte();
      setTiposTransporte(tipos);
      if (tipos.length > 0) {
        setFormData((p) => ({ ...p, tipo_transporte_id: tipos[0].tipo_transporte_id }));
      }
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    if (contratoId) {
      fetchContratoDetails();
      fetchTarifas(pagination.limit, pagination.offset);
      fetchTiposTransporte();
    }
  }, [contratoId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarifa?')) return;
    try {
      await deleteTarifa(id);
      fetchTarifas(pagination.limit, pagination.offset);
    } catch {
      setError('Error al eliminar la tarifa.');
    }
  };

  const openModal = () => {
    setFormData({
      contrato_id: parseInt(contratoId || '0'),
      descripcion_tarifa: '',
      tipo_transporte_id:
        tiposTransporte.length > 0 ? tiposTransporte[0].tipo_transporte_id : 0,
      tarifa_inicial: 0,
      fecha_inicio_vigencia: new Date().toISOString().split('T')[0],
      fecha_fin_vigencia: null,
    });
    setSuccessMessage(null);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcion_tarifa.trim() || formData.tarifa_inicial <= 0) {
      setError('Descripción y tarifa son obligatorias.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createTarifa(formData);
      setSuccessMessage('Tarifa creada exitosamente');
      setTimeout(() => {
        fetchTarifas(pagination.limit, pagination.offset);
        setShowModal(false);
      }, 1000);
    } catch (err: any) {
      const backendErr = err?.response?.data?.error;
      const msg =
        (typeof backendErr === 'string' ? backendErr : backendErr?.message) ||
        err?.message ||
        'Intenta de nuevo.';
      setError('Error al crear la tarifa: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(v);

  const formatDate = (s: string | null) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/contratos')}
            >
              <ArrowLeft className="h-4 w-4" />
              Contratos
            </Button>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Tarifas del contrato #{contratoId}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona las tarifas vigentes y su aplicación a clientes
          </p>
        </div>
        <Button onClick={openModal}>
          <Plus className="h-4 w-4" />
          Nueva tarifa
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {contrato && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle del contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <InfoField label="ID" value={`#${contrato.contrato_id}`} />
              <InfoField
                label="Tipo"
                value={
                  contrato.es_spot ? (
                    <Badge variant="warning">Spot</Badge>
                  ) : (
                    <Badge variant="secondary">Regular</Badge>
                  )
                }
              />
              <InfoField
                label="Transportista"
                value={contrato.nombre_transportista || '—'}
              />
              <InfoField label="Fin vigencia" value={formatDate(contrato.fecha_fin)} />
              <InfoField label="Tipo reajuste" value={contrato.tipo_reajuste || '—'} />
              <InfoField
                label="Frecuencia"
                value={contrato.frecuencia_reajuste || '—'}
              />
              <InfoField
                label="Próx. reajuste"
                value={formatDate(contrato.fecha_proximo_reajuste)}
              />
              <InfoField
                label="Estado"
                value={
                  !contrato.fecha_fin || new Date(contrato.fecha_fin) > new Date() ? (
                    <Badge variant="success">Vigente</Badge>
                  ) : (
                    <Badge variant="destructive">Vencido</Badge>
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tarifas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No hay tarifas</p>
              <p className="text-sm text-muted-foreground">
                Agrega la primera tarifa para este contrato
              </p>
              <Button onClick={openModal}>
                <Plus className="h-4 w-4" />
                Agregar tarifa
              </Button>
            </div>
          ) : (
            <>
            {/* Cards en mobile */}
            <div className="divide-y divide-border md:hidden">
              {tarifas.map((t) => (
                <div
                  key={`m-${t.tarifario_contrato_id}`}
                  className="space-y-3 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                        #{t.tarifario_contrato_id}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 font-medium">
                      {t.descripcion_tarifa}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.nombre_tipo_transporte}
                      {t.nombre_transportista && ` · ${t.nombre_transportista}`}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between rounded-md bg-muted/40 px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      Tarifa actual
                    </span>
                    <span className="font-mono text-sm font-semibold">
                      {formatCurrency(t.tarifa_actual)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/admin/asignaciones-tarifa/${t.tarifario_contrato_id}`
                        )
                      }
                    >
                      <List className="h-3.5 w-3.5" />
                      Asignaciones
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/admin/asignar-tarifa/${t.tarifario_contrato_id}`
                        )
                      }
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Asignar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(t.tarifario_contrato_id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla en desktop */}
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo transporte</TableHead>
                  <TableHead>Transportista</TableHead>
                  <TableHead className="text-right">Inicial</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead>Inicio vigencia</TableHead>
                  <TableHead>Fin vigencia</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarifas.map((t) => (
                  <TableRow key={t.tarifario_contrato_id}>
                    <TableCell className="font-medium">
                      #{t.tarifario_contrato_id}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="line-clamp-2">{t.descripcion_tarifa}</span>
                    </TableCell>
                    <TableCell>{t.nombre_tipo_transporte}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.nombre_transportista || '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(t.tarifa_inicial)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatCurrency(t.tarifa_actual)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(t.fecha_inicio_vigencia_actual)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(t.fecha_fin_vigencia_actual)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Editar" disabled>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver asignaciones"
                          onClick={() =>
                            navigate(
                              `/admin/asignaciones-tarifa/${t.tarifario_contrato_id}`
                            )
                          }
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Asignar a cliente"
                          onClick={() =>
                            navigate(
                              `/admin/asignar-tarifa/${t.tarifario_contrato_id}`
                            )
                          }
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(t.tarifario_contrato_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {tarifas.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {tarifas.length} de {pagination.total} tarifas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.prevOffset !== null &&
                fetchTarifas(pagination.limit, pagination.prevOffset)
              }
              disabled={pagination.prevOffset === null}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.nextOffset !== null &&
                fetchTarifas(pagination.limit, pagination.nextOffset)
              }
              disabled={pagination.nextOffset === null}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal nueva tarifa */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva tarifa</DialogTitle>
            <DialogDescription>Crea una nueva tarifa para este contrato.</DialogDescription>
          </DialogHeader>
          {successMessage && (
            <Alert variant="success">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2.5">
              <Label htmlFor="descripcion_tarifa">Descripción</Label>
              <Textarea
                id="descripcion_tarifa"
                rows={2}
                placeholder="Ej: Rampla Santiago Centro → Planta Pudahuel"
                value={formData.descripcion_tarifa}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion_tarifa: e.target.value })
                }
              />
            </div>

            <div className="space-y-2.5">
              <Label>Tipo de transporte</Label>
              <Select
                value={String(formData.tipo_transporte_id)}
                onValueChange={(v) =>
                  setFormData({ ...formData, tipo_transporte_id: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {tiposTransporte.map((t) => (
                    <SelectItem key={t.tipo_transporte_id} value={String(t.tipo_transporte_id)}>
                      {t.nombre_tipo_transporte}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="tarifa_inicial">Tarifa inicial (CLP)</Label>
              <Input
                id="tarifa_inicial"
                type="number"
                min={0}
                step={1}
                placeholder="15000"
                value={formData.tarifa_inicial || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tarifa_inicial: e.target.value === '' ? 0 : Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="fecha_inicio_vigencia">Inicio vigencia</Label>
                <Input
                  id="fecha_inicio_vigencia"
                  type="date"
                  value={formData.fecha_inicio_vigencia}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_inicio_vigencia: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="fecha_fin_vigencia">Fin vigencia (opcional)</Label>
                <Input
                  id="fecha_fin_vigencia"
                  type="date"
                  value={formData.fecha_fin_vigencia ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fecha_fin_vigencia: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar tarifa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function InfoField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export default TarifasContrato;
