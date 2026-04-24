import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Link2,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  deleteAsignacionManual,
  getAsignacionesManualesByTarifario,
  getTarifaById,
  AsignacionManualTarifa,
  PaginationInfo,
  TarifaContrato,
} from '../services/adminService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AsignacionesTarifa = () => {
  const { tarifaId } = useParams<{ tarifaId: string }>();
  const navigate = useNavigate();

  const [tarifa, setTarifa] = useState<TarifaContrato | null>(null);
  const [asignaciones, setAsignaciones] = useState<AsignacionManualTarifa[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTarifa = async () => {
    if (!tarifaId) return;
    try {
      const t = await getTarifaById(parseInt(tarifaId));
      setTarifa(t);
    } catch {
      setError('No se pudieron obtener los detalles de la tarifa.');
    }
  };

  const fetchAsignaciones = async (limit: number, offset: number) => {
    if (!tarifaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAsignacionesManualesByTarifario(
        parseInt(tarifaId),
        limit,
        offset
      );
      setAsignaciones(res.data);
      setPagination(res.pagination);
    } catch {
      setError('No se pudieron obtener las asignaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tarifaId) {
      fetchTarifa();
      fetchAsignaciones(pagination.limit, pagination.offset);
    }
  }, [tarifaId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta asignación?')) return;
    try {
      await deleteAsignacionManual(id);
      fetchAsignaciones(pagination.limit, pagination.offset);
    } catch {
      setError('No se pudo eliminar la asignación.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (tarifa) navigate(`/admin/tarifas-contrato/${tarifa.contrato_id}`);
            else navigate('/admin/contratos');
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Asignaciones de tarifa
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Clientes, direcciones y materiales asociados a esta tarifa
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tarifa && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Tarifa #{tarifa.tarifario_contrato_id}</CardTitle>
            <Button
              size="sm"
              onClick={() => navigate(`/admin/asignar-tarifa/${tarifa.tarifario_contrato_id}`)}
            >
              <Link2 className="h-4 w-4" />
              Asignar a cliente
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{tarifa.descripcion_tarifa}</p>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
              <InfoField
                label="Tipo transporte"
                value={tarifa.nombre_tipo_transporte}
              />
              <InfoField
                label="Transportista"
                value={tarifa.nombre_transportista || '—'}
              />
              <InfoField
                label="Tarifa actual"
                value={new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  maximumFractionDigits: 0,
                }).format(tarifa.tarifa_actual)}
              />
              <InfoField
                label="Contrato"
                value={`#${tarifa.contrato_id}`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Aplicación de la tarifa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : asignaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No hay asignaciones</p>
              <p className="text-sm text-muted-foreground">
                Asigna esta tarifa a clientes, direcciones y materiales
              </p>
              {tarifa && (
                <Button
                  onClick={() =>
                    navigate(`/admin/asignar-tarifa/${tarifa.tarifario_contrato_id}`)
                  }
                >
                  <Link2 className="h-4 w-4" />
                  Crear asignación
                </Button>
              )}
            </div>
          ) : (
            <>
            {/* Cards en mobile */}
            <div className="divide-y divide-border md:hidden">
              {asignaciones.map((a) => (
                <div key={`m-${a.asignacion_id}`} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                          #{a.asignacion_id}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-medium">
                        {a.nombre_name1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Código {a.codigo_cliente_kunnr}
                        {a.sucursal_name2 && ` · ${a.sucursal_name2}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(a.asignacion_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {a.direccion}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">Material:</span>{' '}
                    {a.codigo_material_matnr} — {a.nombre_material_maktg}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabla en desktop */}
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Código cliente</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Código material</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignaciones.map((a) => (
                  <TableRow key={a.asignacion_id}>
                    <TableCell className="font-medium">#{a.asignacion_id}</TableCell>
                    <TableCell>{a.codigo_cliente_kunnr}</TableCell>
                    <TableCell>{a.nombre_name1}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.sucursal_name2}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {a.direccion}
                    </TableCell>
                    <TableCell>{a.codigo_material_matnr}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {a.nombre_material_maktg}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(a.asignacion_id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

      {asignaciones.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {asignaciones.length} de {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.prevOffset !== null &&
                fetchAsignaciones(pagination.limit, pagination.prevOffset)
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
                fetchAsignaciones(pagination.limit, pagination.nextOffset)
              }
              disabled={pagination.nextOffset === null}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
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

export default AsignacionesTarifa;
