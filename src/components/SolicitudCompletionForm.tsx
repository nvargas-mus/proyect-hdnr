import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react';
import {
  getCapacidadesTransporte,
  getMaterialesResiduos,
  getMaterialesServicios,
  getTiposTransporte,
  getUnidadesReferenciales,
  ingresarSolicitud,
} from '../services/solicitudService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  solicitudId: number;
  requiereTransporte: boolean;
  onBack: () => void;
  onCompleted: () => void;
}

const SolicitudCompletionForm: React.FC<Props> = ({
  solicitudId,
  requiereTransporte,
  onBack,
  onCompleted,
}) => {
  const navigate = useNavigate();

  const [residuos, setResiduos] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [tiposTransporte, setTiposTransporte] = useState<any[]>([]);
  const [capacidades, setCapacidades] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [residuosSel, setResiduosSel] = useState<
    { codigo: string; cantidad: string; unidad_medida_id: string }[]
  >([{ codigo: '', cantidad: '', unidad_medida_id: '' }]);

  const [formData, setFormData] = useState({
    codigo_material_matnr_servicio: '',
    cantidad_servicio: '1',
    unidad_venta_kmein: '',
    tipo_transporte_id: '',
    capacidad_id: '',
    unidad_medida_id_transport: '',
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [res, uni, serv, tipos, caps] = await Promise.all([
          getMaterialesResiduos(solicitudId),
          getUnidadesReferenciales(),
          getMaterialesServicios(solicitudId),
          getTiposTransporte(),
          getCapacidadesTransporte(),
        ]);
        setResiduos(res);
        setUnidades(uni);
        setServicios(serv);
        setTiposTransporte(tipos);
        setCapacidades(caps);
      } catch {
        setErrorMessage('Error al cargar los catálogos iniciales.');
      }
    })();
  }, [solicitudId]);

  const handleResiduoChange = (idx: number, field: string, value: string) => {
    setResiduosSel((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };
  const addResiduoRow = () =>
    setResiduosSel((p) => [...p, { codigo: '', cantidad: '', unidad_medida_id: '' }]);
  const removeResiduoRow = (idx: number) =>
    setResiduosSel((p) => p.filter((_, i) => i !== idx));

  const unidadNombre =
    capacidades.find(
      (c) => String(c.unidad_medida_id) === formData.unidad_medida_id_transport
    )?.nombre_unidad || formData.unidad_medida_id_transport;

  const handleServicioChange = (value: string) => {
    const found = servicios.find((s) => String(s.material_matnr) === value);
    setFormData((p) => ({
      ...p,
      codigo_material_matnr_servicio: value,
      unidad_venta_kmein: found?.unidad_venta_kmein || '',
    }));
  };

  const handleCapacidadChange = (value: string) => {
    const found = capacidades.find((c) => String(c.capacidad_id) === value);
    setFormData((p) => ({
      ...p,
      capacidad_id: value,
      unidad_medida_id_transport: found ? String(found.unidad_medida_id) : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const materiales: {
        codigo_material_matnr: number;
        cantidad_declarada: number;
        unidad_medida_id: number;
      }[] = [];

      for (const row of residuosSel) {
        if (!row.codigo.trim()) continue;
        const codigo = Number(row.codigo);
        const cantidad = Number(row.cantidad);
        const unidad = Number(row.unidad_medida_id);
        if (isNaN(codigo) || isNaN(cantidad) || isNaN(unidad)) {
          setErrorMessage('Verifica que todos los campos de residuos sean válidos.');
          setLoading(false);
          return;
        }
        materiales.push({
          codigo_material_matnr: codigo,
          cantidad_declarada: cantidad,
          unidad_medida_id: unidad,
        });
      }

      if (materiales.length === 0) {
        setErrorMessage('Debes agregar al menos un residuo.');
        setLoading(false);
        return;
      }

      if (requiereTransporte) {
        // Con transporte: agregar el servicio de transporte al mismo array de materiales
        const codServicio = Number(formData.codigo_material_matnr_servicio);
        if (!codServicio || isNaN(codServicio)) {
          setErrorMessage('Selecciona el servicio de transporte.');
          setLoading(false);
          return;
        }
        // Usar la primera unidad disponible como unidad por defecto para el servicio
        const unidadServicio = Number(residuosSel[0]?.unidad_medida_id) || unidades[0]?.unidad_medida_id;
        materiales.push({
          codigo_material_matnr: codServicio,
          cantidad_declarada: 1,
          unidad_medida_id: unidadServicio,
        });

        await ingresarSolicitud(solicitudId, {
          requiere_transporte: true,
          materiales,
        });
      } else {
        const tipo = Number(formData.tipo_transporte_id);
        const capacidad = Number(formData.capacidad_id);
        const unidad = Number(formData.unidad_medida_id_transport);
        if (isNaN(tipo) || isNaN(capacidad) || isNaN(unidad)) {
          setErrorMessage('Faltan datos de transporte.');
          setLoading(false);
          return;
        }

        await ingresarSolicitud(solicitudId, {
          requiere_transporte: false,
          materiales,
          tipo_transporte_id: tipo,
          capacidad_id: capacidad,
          unidad_medida_id_det: unidad,
        });
      }

      onCompleted();
      setTimeout(() => setShowSuccessModal(true), 800);
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message;
      setErrorMessage(`Error al completar: ${backendMsg || 'Intenta nuevamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOK = () => {
    setShowSuccessModal(false);
    const rol = localStorage.getItem('user_role');
    if (rol === 'admin') {
      sessionStorage.setItem('scrollToTop', 'true');
      window.location.reload();
    } else {
      navigate('/home');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Residuos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Información de residuos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {residuosSel.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-border bg-muted/30 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-2.5 md:col-span-2">
                      <Label>Material</Label>
                      <Select
                        value={row.codigo}
                        onValueChange={(v) => handleResiduoChange(idx, 'codigo', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar residuo…" />
                        </SelectTrigger>
                        <SelectContent>
                          {residuos.map((r) => (
                            <SelectItem
                              key={r.material_matnr}
                              value={String(r.material_matnr)}
                            >
                              {r.material_matnr} · {r.nombre_material_maktg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label>Unidad</Label>
                      <Select
                        value={row.unidad_medida_id}
                        onValueChange={(v) =>
                          handleResiduoChange(idx, 'unidad_medida_id', v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unidad…" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map((u) => (
                            <SelectItem
                              key={u.unidad_medida_id}
                              value={String(u.unidad_medida_id)}
                            >
                              {u.nombre_unidad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="flex-1 space-y-2.5">
                      <Label>Cantidad declarada</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={row.cantidad}
                        onChange={(e) =>
                          handleResiduoChange(idx, 'cantidad', e.target.value)
                        }
                        required
                      />
                    </div>
                    {residuosSel.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeResiduoRow(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addResiduoRow}>
                <Plus className="h-4 w-4" />
                Agregar otro residuo
              </Button>
            </CardContent>
          </Card>

          {/* Servicio o transporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                {requiereTransporte
                  ? 'Información del servicio'
                  : 'Información de transporte'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiereTransporte ? (
                <>
                  <div className="space-y-2.5">
                    <Label>Código material servicio</Label>
                    <Select
                      value={formData.codigo_material_matnr_servicio}
                      onValueChange={handleServicioChange}
                      disabled={servicios.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            servicios.length === 0
                              ? 'Sin servicios cotizados para este cliente'
                              : 'Seleccionar…'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {servicios.map((s) => (
                          <SelectItem
                            key={s.material_matnr}
                            value={String(s.material_matnr)}
                          >
                            {s.material_matnr} · {s.nombre_material_maktg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {servicios.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Este cliente no tiene servicios cotizados en SAP. Contacta a un
                        administrador para cargar la cotización A900.
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label>Cantidad</Label>
                      <Input value="1" disabled />
                    </div>
                    <div className="space-y-2.5">
                      <Label>Unidad venta</Label>
                      <Input value={formData.unidad_venta_kmein} readOnly />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <Label>Tipo de transporte</Label>
                    <Select
                      value={formData.tipo_transporte_id}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, tipo_transporte_id: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposTransporte.map((t) => (
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
                  <div className="space-y-2.5">
                    <Label>Capacidad</Label>
                    <Select value={formData.capacidad_id} onValueChange={handleCapacidadChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar…" />
                      </SelectTrigger>
                      <SelectContent>
                        {capacidades.map((c) => (
                          <SelectItem key={c.capacidad_id} value={String(c.capacidad_id)}>
                            {parseFloat(c.valor_capacidad)} {c.nombre_unidad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label>Unidad medida transporte</Label>
                    <Input value={unidadNombre} readOnly />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Completar solicitud
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal éxito */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <DialogTitle>Solicitud creada exitosamente</DialogTitle>
            <DialogDescription>
              La solicitud #{solicitudId} ha sido registrada. Puedes seguir su estado desde
              el panel principal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessOK}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SolicitudCompletionForm;
