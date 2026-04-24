import { useEffect, useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { createContrato, getTransportistas } from '../services/adminService';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NuevoContratoModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface TransportistaAPI {
  transportista_id: number;
  nombre_transportista: string;
  rut_transportista: string;
}

const NuevoContratoModal = ({ show, onClose, onSave }: NuevoContratoModalProps) => {
  const [transportistas, setTransportistas] = useState<TransportistaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    transportista_id: '',
    es_spot: 'false',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    tipo_reajuste: 'Sin reajuste',
    frecuencia_reajuste: 'Sin reajuste',
    fecha_proximo_reajuste: '',
    documento: null as File | null,
  });

  useEffect(() => {
    if (!show) return;
    setError(null);
    setSuccess(null);

    (async () => {
      setLoading(true);
      try {
        const data = await getTransportistas();
        setTransportistas(data as TransportistaAPI[]);
      } catch {
        setError('No se pudieron cargar los transportistas.');
      } finally {
        setLoading(false);
      }
    })();
  }, [show]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append('transportista_id', formData.transportista_id);
      fd.append('es_spot', formData.es_spot);
      fd.append('fecha_inicio', formData.fecha_inicio);
      fd.append('fecha_fin', formData.fecha_fin);
      if (formData.tipo_reajuste) fd.append('tipo_reajuste', formData.tipo_reajuste);
      if (formData.frecuencia_reajuste)
        fd.append('frecuencia_reajuste', formData.frecuencia_reajuste);
      if (formData.fecha_proximo_reajuste)
        fd.append('fecha_proximo_reajuste', formData.fecha_proximo_reajuste);
      if (formData.documento) fd.append('documento', formData.documento);
      await createContrato(fd);
      setSuccess('Contrato creado exitosamente');
      setFormData({
        transportista_id: '',
        es_spot: 'false',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        tipo_reajuste: 'Sin reajuste',
        frecuencia_reajuste: 'Sin reajuste',
        fecha_proximo_reajuste: '',
        documento: null,
      });
      setTimeout(() => onSave(), 1200);
    } catch (err: any) {
      const backendErr = err?.response?.data?.error;
      const msg =
        (typeof backendErr === 'string' ? backendErr : backendErr?.message) ||
        err?.message ||
        'No se pudo crear el contrato.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear nuevo contrato</DialogTitle>
          <DialogDescription>
            Completa los datos para registrar un contrato con el transportista.
          </DialogDescription>
        </DialogHeader>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <Label>Transportista</Label>
            <Select
              value={formData.transportista_id}
              onValueChange={(v) => setFormData((p) => ({ ...p, transportista_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar transportista…" />
              </SelectTrigger>
              <SelectContent>
                {transportistas.map((t) => (
                  <SelectItem key={t.transportista_id} value={String(t.transportista_id)}>
                    {t.nombre_transportista} · {t.rut_transportista}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label>¿Es Spot?</Label>
            <Select
              value={formData.es_spot}
              onValueChange={(v) => setFormData((p) => ({ ...p, es_spot: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Sí</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label htmlFor="fecha_inicio">Fecha inicio *</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fecha_inicio: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="fecha_fin">Fecha fin *</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData((p) => ({ ...p, fecha_fin: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="fecha_proximo_reajuste">
              Próximo reajuste{' '}
              <span className="text-xs font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>
            <Input
              id="fecha_proximo_reajuste"
              type="date"
              value={formData.fecha_proximo_reajuste}
              onChange={(e) =>
                setFormData((p) => ({ ...p, fecha_proximo_reajuste: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label>Tipo de reajuste</Label>
              <Select
                value={formData.tipo_reajuste}
                onValueChange={(v) => setFormData((p) => ({ ...p, tipo_reajuste: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sin reajuste">Sin reajuste</SelectItem>
                  <SelectItem value="Por polinomio">Por polinomio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label>Frecuencia</Label>
              <Select
                value={formData.frecuencia_reajuste}
                onValueChange={(v) => setFormData((p) => ({ ...p, frecuencia_reajuste: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sin reajuste">Sin reajuste</SelectItem>
                  <SelectItem value="Mensual">Mensual</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Semestral">Semestral</SelectItem>
                  <SelectItem value="Anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="documento">Documento de respaldo</Label>
            <Input
              id="documento"
              type="file"
              onChange={(e) =>
                setFormData((p) => ({ ...p, documento: e.target.files?.[0] ?? null }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.transportista_id}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear contrato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NuevoContratoModal;
