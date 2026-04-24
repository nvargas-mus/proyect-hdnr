import { useEffect, useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { getContratoById, updateContrato } from '../services/adminService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContratoModalProps {
  contratoId: number;
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface ContratoFormData {
  transportista_id: number | null;
  es_spot: boolean;
  documento_respaldo: File | null;
  fecha_fin: string;
  tipo_reajuste: string;
  frecuencia_reajuste: string;
  fecha_proximo_reajuste: string;
}

const ContratoModal = ({ contratoId, show, onClose, onSave }: ContratoModalProps) => {
  const [originalContrato, setOriginalContrato] = useState<any>(null);
  const [formData, setFormData] = useState<ContratoFormData>({
    transportista_id: null,
    es_spot: false,
    documento_respaldo: null,
    fecha_fin: '',
    tipo_reajuste: '',
    frecuencia_reajuste: '',
    fecha_proximo_reajuste: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!show || !contratoId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getContratoById(contratoId);
        setOriginalContrato(data);
        setFormData({
          transportista_id: data.transportista_id,
          es_spot: data.es_spot,
          documento_respaldo: null,
          fecha_fin: data.fecha_fin ? String(data.fecha_fin).split('T')[0] : '',
          tipo_reajuste: data.tipo_reajuste || '',
          frecuencia_reajuste: data.frecuencia_reajuste || '',
          fecha_proximo_reajuste: data.fecha_proximo_reajuste
            ? String(data.fecha_proximo_reajuste).split('T')[0]
            : '',
        });
      } catch {
        setError('No se pudieron cargar los datos del contrato.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contratoId, show]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (formData.es_spot !== originalContrato?.es_spot) {
        fd.append('es_spot', String(formData.es_spot));
      }
      if (formData.documento_respaldo) fd.append('documento', formData.documento_respaldo);
      if (formData.fecha_fin) fd.append('fecha_fin', formData.fecha_fin);
      if (formData.tipo_reajuste) fd.append('tipo_reajuste', formData.tipo_reajuste);
      if (formData.frecuencia_reajuste)
        fd.append('frecuencia_reajuste', formData.frecuencia_reajuste);
      if (formData.fecha_proximo_reajuste)
        fd.append('fecha_proximo_reajuste', formData.fecha_proximo_reajuste);
      await updateContrato(contratoId, fd);
      onSave();
    } catch (err: any) {
      const backendErr = err?.response?.data?.error;
      const msg =
        (typeof backendErr === 'string' ? backendErr : backendErr?.message) ||
        err?.message ||
        'No se pudo actualizar el contrato.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar contrato #{contratoId}</DialogTitle>
          <DialogDescription>Actualiza los datos del contrato seleccionado.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !originalContrato ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2.5">
              <Label>ID transportista</Label>
              <Input value={formData.transportista_id ?? ''} disabled />
            </div>

            <label className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-3">
              <Checkbox
                checked={formData.es_spot}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, es_spot: v === true })
                }
              />
              <div>
                <p className="text-sm font-medium">Contrato Spot</p>
                <p className="text-xs text-muted-foreground">
                  Marca si es un contrato puntual sin tarifario fijo
                </p>
              </div>
            </label>

            <div className="space-y-2.5">
              <Label htmlFor="documento_respaldo">Documento de respaldo</Label>
              <Input
                id="documento_respaldo"
                type="file"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documento_respaldo: e.target.files?.[0] ?? null,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="fecha_fin">Fecha fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="fecha_proximo_reajuste">Próximo reajuste</Label>
                <Input
                  id="fecha_proximo_reajuste"
                  type="date"
                  value={formData.fecha_proximo_reajuste}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_proximo_reajuste: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label>Tipo de reajuste</Label>
                <Select
                  value={formData.tipo_reajuste}
                  onValueChange={(v) => setFormData({ ...formData, tipo_reajuste: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin reajuste">Sin reajuste</SelectItem>
                    <SelectItem value="por polinomio">Por polinomio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label>Frecuencia</Label>
                <Select
                  value={formData.frecuencia_reajuste}
                  onValueChange={(v) => setFormData({ ...formData, frecuencia_reajuste: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar…" />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContratoModal;
