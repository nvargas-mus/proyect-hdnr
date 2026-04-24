import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  createAsignacionTarifa,
  getClientesAsociados,
  getDireccionesCliente,
  getMaterialesCliente,
  AsignacionTarifaData,
  ClienteAsociado,
  DireccionCliente,
} from '../services/adminService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface Material {
  material_matnr: number;
  nombre_material_maktg: string;
}

const AsignacionTarifaPage = () => {
  const { tarifaId } = useParams<{ tarifaId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AsignacionTarifaData>({
    codigo_cliente_kunnr: 0,
    direccion_id: 0,
    codigo_material_matnr: 0,
    tarifario_contrato_id: parseInt(tarifaId || '0'),
  });

  const [clientes, setClientes] = useState<ClienteAsociado[]>([]);
  const [direcciones, setDirecciones] = useState<DireccionCliente[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);

  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteDisplay, setClienteDisplay] = useState('');
  const [showClientesDropdown, setShowClientesDropdown] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getClientesAsociados(clienteSearch);
        setClientes(data);
      } catch {
        setClientes([]);
      }
    })();
  }, [clienteSearch]);

  useEffect(() => {
    (async () => {
      if (!formData.codigo_cliente_kunnr) {
        setDirecciones([]);
        setMateriales([]);
        return;
      }
      try {
        const [d, m] = await Promise.all([
          getDireccionesCliente(formData.codigo_cliente_kunnr),
          getMaterialesCliente(formData.codigo_cliente_kunnr),
        ]);
        setDirecciones(d);
        setMateriales(m);
      } catch {
        setDirecciones([]);
        setMateriales([]);
      }
    })();
  }, [formData.codigo_cliente_kunnr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.codigo_cliente_kunnr ||
      !formData.direccion_id ||
      !formData.codigo_material_matnr
    ) {
      setError('Completa cliente, dirección y material antes de continuar.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createAsignacionTarifa(formData);
      setSuccess('Asignación creada exitosamente');
      setTimeout(() => navigate(-1), 1200);
    } catch (err: any) {
      setError(
        'Error al crear asignación: ' +
          (err?.response?.data?.message || err?.message || 'Intenta nuevamente.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Asignar tarifa #{tarifaId}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona cliente, dirección y material para aplicar esta tarifa
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos de la asignación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative space-y-2.5">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                placeholder="Escribe para buscar…"
                autoComplete="off"
                value={clienteDisplay}
                onFocus={() => setShowClientesDropdown(true)}
                onBlur={() => setTimeout(() => setShowClientesDropdown(false), 200)}
                onChange={(e) => {
                  const value = e.target.value;
                  setClienteSearch(value);
                  setClienteDisplay(value);
                  setShowClientesDropdown(true);
                  setFormData((p) => ({
                    ...p,
                    codigo_cliente_kunnr: 0,
                    direccion_id: 0,
                    codigo_material_matnr: 0,
                  }));
                }}
                required
              />
              {showClientesDropdown && clientes.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
                  {clientes.map((c) => (
                    <li key={c.codigo_cliente_kunnr}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const display = `${c.codigo_cliente_kunnr} · ${c.nombre_name1}${
                            c.sucursal_name2 ? ' · ' + c.sucursal_name2 : ''
                          }`;
                          setClienteDisplay(display);
                          setClienteSearch(display);
                          setFormData((p) => ({
                            ...p,
                            codigo_cliente_kunnr: c.codigo_cliente_kunnr,
                            direccion_id: 0,
                            codigo_material_matnr: 0,
                          }));
                          setShowClientesDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                      >
                        <span className="font-semibold">{c.codigo_cliente_kunnr}</span>
                        <span className="ml-2">{c.nombre_name1}</span>
                        {c.sucursal_name2 && (
                          <span className="ml-2 text-muted-foreground">
                            · {c.sucursal_name2}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2.5">
              <Label>Dirección</Label>
              <Select
                value={formData.direccion_id ? String(formData.direccion_id) : ''}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, direccion_id: Number(v) }))
                }
                disabled={!formData.codigo_cliente_kunnr}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar dirección…" />
                </SelectTrigger>
                <SelectContent>
                  {direcciones.map((d) => (
                    <SelectItem key={d.direccion_id} value={String(d.direccion_id)}>
                      {d.calle}, {d.numero}, {d.comuna}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label>Material</Label>
              <Select
                value={
                  formData.codigo_material_matnr
                    ? String(formData.codigo_material_matnr)
                    : ''
                }
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, codigo_material_matnr: Number(v) }))
                }
                disabled={!formData.codigo_cliente_kunnr || materiales.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      materiales.length === 0 && formData.codigo_cliente_kunnr
                        ? 'Sin materiales disponibles'
                        : 'Seleccionar material…'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {materiales.map((m) => (
                    <SelectItem
                      key={m.material_matnr}
                      value={String(m.material_matnr)}
                    >
                      {m.material_matnr} · {m.nombre_material_maktg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Asignar tarifa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AsignacionTarifaPage;
