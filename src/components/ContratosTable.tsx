import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  getContratos,
  deleteContrato,
  downloadContrato,
  Contrato,
  PaginationInfo,
  ContratosResponse,
} from '../services/adminService';
import ContratoModal from './ContratoModal';
import ContratoViewModal from './ContratoViewModal';
import NuevoContratoModal from './NuevoContratoModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const ContratosTable = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewContratoId, setViewContratoId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteContratoId, setDeleteContratoId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchContratos = async (limit: number, offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const response: ContratosResponse = await getContratos(limit, offset);
      setContratos(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching contratos:', err);
      setError('No se pudieron obtener los contratos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContratos(pagination.limit, pagination.offset);
  }, []);

  const handlePrevPage = () => {
    if (pagination.prevOffset !== null)
      fetchContratos(pagination.limit, pagination.prevOffset);
  };
  const handleNextPage = () => {
    if (pagination.nextOffset !== null)
      fetchContratos(pagination.limit, pagination.nextOffset);
  };

  const handleConfirmDelete = async () => {
    if (deleteContratoId === null) return;
    try {
      await deleteContrato(deleteContratoId);
      setShowDeleteModal(false);
      setDeleteContratoId(null);
      fetchContratos(pagination.limit, pagination.offset);
    } catch (err) {
      console.error('Error eliminando contrato:', err);
      setError('No se pudo eliminar el contrato.');
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const blob = await downloadContrato(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      console.error('Error descargando contrato:', err);
      alert(
        err?.response?.status === 404
          ? 'El documento solicitado no existe o no está disponible.'
          : 'Error al descargar el documento.'
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    try {
      return new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'medium',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra los contratos con transportistas y sus tarifarios
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Nuevo contrato
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contratos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No hay contratos</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea tu primer contrato para empezar
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                Crear contrato
              </Button>
            </div>
          ) : (
            <>
            {/* Cards en mobile */}
            <div className="divide-y divide-border md:hidden">
              {contratos.map((c) => (
                <div key={`m-${c.contrato_id}`} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                          #{c.contrato_id}
                        </span>
                        {c.es_spot ? (
                          <Badge variant="warning">Spot</Badge>
                        ) : (
                          <Badge variant="secondary">Regular</Badge>
                        )}
                      </div>
                      <p className="mt-1 truncate font-medium">
                        {c.nombre_transportista || 'Sin transportista'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {formatDate(c.fecha_fin)}
                        {c.tipo_reajuste && ` · ${c.tipo_reajuste}`}
                      </p>
                    </div>
                  </div>
                  {c.documento_respaldo && (
                    <button
                      onClick={() => handleDownload(c.contrato_id)}
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Descargar documento
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewContratoId(c.contrato_id);
                        setShowViewModal(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detalle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/admin/tarifas-contrato/${c.contrato_id}`)
                      }
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Tarifas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContratoId(c.contrato_id);
                        setShowEditModal(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleteContratoId(c.contrato_id);
                        setShowDeleteModal(true);
                      }}
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Transportista</TableHead>
                  <TableHead>Fin vigencia</TableHead>
                  <TableHead>Reajuste</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Próx. reajuste</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratos.map((c) => (
                  <TableRow key={c.contrato_id}>
                    <TableCell className="font-medium">#{c.contrato_id}</TableCell>
                    <TableCell>
                      {c.es_spot ? (
                        <Badge variant="warning">Spot</Badge>
                      ) : (
                        <Badge variant="secondary">Regular</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.documento_respaldo ? (
                        <button
                          onClick={() => handleDownload(c.contrato_id)}
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Descargar
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{c.nombre_transportista || '—'}</TableCell>
                    <TableCell>{formatDate(c.fecha_fin)}</TableCell>
                    <TableCell>{c.tipo_reajuste || '—'}</TableCell>
                    <TableCell>{c.frecuencia_reajuste || '—'}</TableCell>
                    <TableCell>{formatDate(c.fecha_proximo_reajuste)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalle"
                          onClick={() => {
                            setViewContratoId(c.contrato_id);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Tarifas"
                          onClick={() => navigate(`/admin/tarifas-contrato/${c.contrato_id}`)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => {
                            setSelectedContratoId(c.contrato_id);
                            setShowEditModal(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeleteContratoId(c.contrato_id);
                            setShowDeleteModal(true);
                          }}
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

      {contratos.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {contratos.length} de {pagination.total} contratos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={pagination.prevOffset === null}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.nextOffset === null}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modales */}
      {showEditModal && selectedContratoId && (
        <ContratoModal
          contratoId={selectedContratoId}
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedContratoId(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedContratoId(null);
            fetchContratos(pagination.limit, pagination.offset);
          }}
        />
      )}

      {showViewModal && viewContratoId && (
        <ContratoViewModal
          contratoId={viewContratoId}
          show={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewContratoId(null);
          }}
        />
      )}

      <NuevoContratoModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={() => {
          setShowCreateModal(false);
          fetchContratos(pagination.limit, pagination.offset);
        }}
      />

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar contrato</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el contrato{' '}
              <span className="font-medium text-foreground">#{deleteContratoId}</span>? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContratosTable;
