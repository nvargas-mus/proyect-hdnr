import { useEffect, useState } from 'react';
import { Eye, Loader2, Pencil, Plus, Trash2, Truck } from 'lucide-react';
import {
  deleteTransportista,
  getTransportistas,
  Transportista,
} from '../services/adminService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { TransportistaModal } from './TransportistaModal';
import { TransportistaDetalleModal } from './TransportistaDetalleModal';

const TransportistasTable = () => {
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transportista | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransportistas();
      setTransportistas(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar transportistas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const formatDateTime = (s: string) => {
    if (!s) return '—';
    try {
      return new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(s));
    } catch {
      return s;
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setShowEditModal(true);
  };

  const handleOpenEdit = (id: number) => {
    setEditId(id);
    setShowEditModal(true);
  };

  const handleOpenDetalle = (id: number) => {
    setDetalleId(id);
    setShowDetalleModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTransportista(deleteTarget.transportista_id);
      setDeleteTarget(null);
      await cargar();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ??
        err?.message ??
        'Error al eliminar.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transportistas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Flota registrada, con sus conductores y vehículos.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nuevo transportista
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
          ) : transportistas.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Truck className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No hay transportistas registrados</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea el primer transportista para comenzar
                </p>
              </div>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Crear transportista
              </Button>
            </div>
          ) : (
            <>
            {/* Cards en mobile */}
            <div className="divide-y divide-border md:hidden">
              {transportistas.map((t) => (
                <div
                  key={`m-${t.transportista_id}`}
                  className="space-y-3 p-4"
                  onClick={() => handleOpenDetalle(t.transportista_id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                          #{t.transportista_id}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-medium">
                        {t.nombre_transportista}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.rut_transportista}
                      </p>
                      {t.direccion_transportista && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {t.direccion_transportista}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDetalle(t.transportista_id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Detalle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(t.transportista_id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(t)}
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
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="w-40 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transportistas.map((t) => (
                  <TableRow
                    key={t.transportista_id}
                    className="cursor-pointer"
                    onClick={() => handleOpenDetalle(t.transportista_id)}
                  >
                    <TableCell>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-mono font-semibold">
                        #{t.transportista_id}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.nombre_transportista}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.rut_transportista}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {t.direccion_transportista || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(t.fecha_creacion)}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver detalle"
                          onClick={() => handleOpenDetalle(t.transportista_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => handleOpenEdit(t.transportista_id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(t)}
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

      {/* Modal crear/editar */}
      <TransportistaModal
        show={showEditModal}
        transportistaId={editId}
        onClose={() => {
          setShowEditModal(false);
          setEditId(null);
        }}
        onSaved={() => {
          setShowEditModal(false);
          setEditId(null);
          cargar();
        }}
      />

      {/* Modal de detalle con conductores y vehículos */}
      <TransportistaDetalleModal
        show={showDetalleModal}
        transportistaId={detalleId}
        onClose={() => {
          setShowDetalleModal(false);
          setDetalleId(null);
          // Refrescar por si se agregaron/editaron conductores o vehículos
          cargar();
        }}
      />

      {/* Dialog confirmar eliminar */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar transportista</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar{' '}
              <span className="font-medium text-foreground">
                {deleteTarget?.nombre_transportista}
              </span>
              ? Esta acción marca al transportista como inactivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransportistasTable;
