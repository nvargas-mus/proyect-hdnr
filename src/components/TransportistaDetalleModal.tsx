import { useEffect, useState, FormEvent } from 'react';
import {
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Truck,
  User,
} from 'lucide-react';
import {
  getTransportistaById,
  getConductoresPorTransportista,
  getVehiculosPorTransportista,
  createConductor,
  updateConductor,
  deleteConductor,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
  getTiposTransporte,
  TransportistaDetalle,
  Conductor,
  Vehiculo,
  TipoTransporte,
} from '../services/adminService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface Props {
  show: boolean;
  transportistaId: number | null;
  onClose: () => void;
}

type ConductorForm = { conductor_id?: number; nombre: string; rut: string };
type VehiculoForm = {
  vehiculo_id?: number;
  patente: string;
  tipo_transporte_id: number;
};

export function TransportistaDetalleModal({ show, transportistaId, onClose }: Props) {
  const [detalle, setDetalle] = useState<TransportistaDetalle | null>(null);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tipos, setTipos] = useState<TipoTransporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [conductorForm, setConductorForm] = useState<ConductorForm | null>(null);
  const [vehiculoForm, setVehiculoForm] = useState<VehiculoForm | null>(null);
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    if (!transportistaId) return;
    setLoading(true);
    setError(null);
    try {
      const [det, conds, vehs, tt] = await Promise.all([
        getTransportistaById(transportistaId),
        getConductoresPorTransportista(transportistaId),
        getVehiculosPorTransportista(transportistaId),
        getTiposTransporte(),
      ]);
      setDetalle(det);
      setConductores(conds);
      setVehiculos(vehs);
      setTipos(tt);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Error al cargar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && transportistaId) cargar();
    else {
      setDetalle(null);
      setConductores([]);
      setVehiculos([]);
      setConductorForm(null);
      setVehiculoForm(null);
    }
  }, [show, transportistaId]);

  // ── Conductor handlers ─────────────────────────────────────────────
  const saveConductor = async (e: FormEvent) => {
    e.preventDefault();
    if (!conductorForm || !transportistaId) return;
    setSaving(true);
    try {
      if (conductorForm.conductor_id) {
        await updateConductor(conductorForm.conductor_id, {
          nombre: conductorForm.nombre,
          rut: conductorForm.rut,
        });
      } else {
        await createConductor({
          nombre: conductorForm.nombre,
          rut: conductorForm.rut,
          transportista_id: transportistaId,
        });
      }
      setConductorForm(null);
      await cargar();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Error al guardar.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConductor = async (id: number) => {
    if (!confirm('¿Eliminar este conductor?')) return;
    try {
      await deleteConductor(id);
      await cargar();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? 'Error al eliminar.');
    }
  };

  // ── Vehículo handlers ──────────────────────────────────────────────
  const saveVehiculo = async (e: FormEvent) => {
    e.preventDefault();
    if (!vehiculoForm || !transportistaId) return;
    setSaving(true);
    try {
      if (vehiculoForm.vehiculo_id) {
        await updateVehiculo(vehiculoForm.vehiculo_id, {
          patente: vehiculoForm.patente,
          tipo_transporte_id: vehiculoForm.tipo_transporte_id,
        });
      } else {
        await createVehiculo({
          patente: vehiculoForm.patente,
          tipo_transporte_id: vehiculoForm.tipo_transporte_id,
          transportista_id: transportistaId,
        });
      }
      setVehiculoForm(null);
      await cargar();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Error al guardar.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehiculo = async (id: number) => {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try {
      await deleteVehiculo(id);
      await cargar();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? 'Error al eliminar.');
    }
  };

  return (
    <Dialog open={show} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </div>
            {detalle?.nombre_transportista ?? 'Detalle del transportista'}
          </DialogTitle>
          <DialogDescription>
            Administra conductores y vehículos asociados.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : detalle ? (
          <div className="space-y-6">
            {/* Info básica */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <Field label="ID" value={`#${detalle.transportista_id}`} />
                <Field label="RUT" value={detalle.rut_transportista} />
                <Field label="Dirección" value={detalle.direccion_transportista || '—'} />
              </div>
              <div className="mt-3 flex gap-4">
                <Badge variant="secondary" className="gap-1.5">
                  <User className="h-3 w-3" />
                  {conductores.length} conductor
                  {conductores.length !== 1 ? 'es' : ''}
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <Truck className="h-3 w-3" />
                  {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Conductores */}
            <section className="rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  Conductores
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConductorForm({ nombre: '', rut: '' })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </Button>
              </div>
              {conductores.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Sin conductores registrados
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>RUT</TableHead>
                      <TableHead className="w-28 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conductores.map((c) => (
                      <TableRow key={c.conductor_id}>
                        <TableCell className="font-mono text-xs">
                          #{c.conductor_id}
                        </TableCell>
                        <TableCell>{c.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{c.rut}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            onClick={() =>
                              setConductorForm({
                                conductor_id: c.conductor_id,
                                nombre: c.nombre,
                                rut: c.rut,
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Eliminar"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteConductor(c.conductor_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </section>

            {/* Vehículos */}
            <section className="rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Truck className="h-4 w-4 text-primary" />
                  Vehículos
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setVehiculoForm({
                      patente: '',
                      tipo_transporte_id: tipos[0]?.tipo_transporte_id ?? 0,
                    })
                  }
                  disabled={tipos.length === 0}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar
                </Button>
              </div>
              {vehiculos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Sin vehículos registrados
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Patente</TableHead>
                      <TableHead>Tipo de transporte</TableHead>
                      <TableHead className="w-28 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiculos.map((v) => {
                      const tipoNombre =
                        v.nombre_tipo_transporte ||
                        tipos.find((t) => t.tipo_transporte_id === v.tipo_transporte_id)
                          ?.nombre_tipo_transporte ||
                        '—';
                      return (
                        <TableRow key={v.vehiculo_id}>
                          <TableCell className="font-mono text-xs">
                            #{v.vehiculo_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {v.patente}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {tipoNombre}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar"
                              onClick={() =>
                                setVehiculoForm({
                                  vehiculo_id: v.vehiculo_id,
                                  patente: v.patente,
                                  tipo_transporte_id: v.tipo_transporte_id,
                                })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteVehiculo(v.vehiculo_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </section>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>

        {/* Sub-modal de conductor */}
        <Dialog
          open={!!conductorForm}
          onOpenChange={(o) => !o && setConductorForm(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {conductorForm?.conductor_id ? 'Editar conductor' : 'Nuevo conductor'}
              </DialogTitle>
            </DialogHeader>
            {conductorForm && (
              <form onSubmit={saveConductor} className="space-y-4">
                <div className="space-y-2.5">
                  <Label>Nombre</Label>
                  <Input
                    required
                    value={conductorForm.nombre}
                    onChange={(e) =>
                      setConductorForm({ ...conductorForm, nombre: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2.5">
                  <Label>RUT</Label>
                  <Input
                    required
                    placeholder="12.345.678-9"
                    value={conductorForm.rut}
                    onChange={(e) =>
                      setConductorForm({ ...conductorForm, rut: e.target.value })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConductorForm(null)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Sub-modal de vehículo */}
        <Dialog
          open={!!vehiculoForm}
          onOpenChange={(o) => !o && setVehiculoForm(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {vehiculoForm?.vehiculo_id ? 'Editar vehículo' : 'Nuevo vehículo'}
              </DialogTitle>
            </DialogHeader>
            {vehiculoForm && (
              <form onSubmit={saveVehiculo} className="space-y-4">
                <div className="space-y-2.5">
                  <Label>Patente</Label>
                  <Input
                    required
                    placeholder="ABCD12"
                    value={vehiculoForm.patente}
                    onChange={(e) =>
                      setVehiculoForm({ ...vehiculoForm, patente: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2.5">
                  <Label>Tipo de transporte</Label>
                  <Select
                    value={String(vehiculoForm.tipo_transporte_id || '')}
                    onValueChange={(v) =>
                      setVehiculoForm({
                        ...vehiculoForm,
                        tipo_transporte_id: Number(v),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar…" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((t) => (
                        <SelectItem
                          key={t.tipo_transporte_id}
                          value={String(t.tipo_transporte_id)}
                        >
                          {t.nombre_tipo_transporte}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVehiculoForm(null)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
