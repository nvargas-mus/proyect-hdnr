import { useEffect, useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import {
  createTransportista,
  updateTransportista,
  getTransportistaById,
  Transportista,
} from '../services/adminService';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  show: boolean;
  transportistaId?: number | null; // null = crear, number = editar
  onClose: () => void;
  onSaved: (transportista: Transportista) => void;
}

const emptyForm = {
  nombre_transportista: '',
  rut_transportista: '',
  direccion_transportista: '',
};

export function TransportistaModal({ show, transportistaId, onClose, onSaved }: Props) {
  const isEdit = !!transportistaId;
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;
    setError(null);
    if (isEdit && transportistaId) {
      setLoading(true);
      getTransportistaById(transportistaId)
        .then((t) => {
          setFormData({
            nombre_transportista: t.nombre_transportista ?? '',
            rut_transportista: t.rut_transportista ?? '',
            direccion_transportista: t.direccion_transportista ?? '',
          });
        })
        .catch(() => setError('No se pudo cargar el transportista.'))
        .finally(() => setLoading(false));
    } else {
      setFormData(emptyForm);
    }
  }, [show, transportistaId, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        nombre_transportista: formData.nombre_transportista.trim(),
        rut_transportista: formData.rut_transportista.trim(),
      };
      if (formData.direccion_transportista.trim()) {
        payload.direccion_transportista = formData.direccion_transportista.trim();
      }

      let result: Transportista;
      if (isEdit && transportistaId) {
        result = await updateTransportista(transportistaId, payload);
      } else {
        result = await createTransportista(payload);
      }
      onSaved(result);
    } catch (err: any) {
      const backendErr = err?.response?.data?.error;
      const msg =
        (typeof backendErr === 'string' ? backendErr : backendErr?.message) ||
        err?.message ||
        'Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Editar transportista #${transportistaId}` : 'Nuevo transportista'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza los datos del transportista.'
              : 'Registra un nuevo transportista en la flota.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <Label htmlFor="nombre">Nombre / Razón social</Label>
            <Input
              id="nombre"
              required
              placeholder="Ej: Transportes Andes SpA"
              value={formData.nombre_transportista}
              onChange={(e) =>
                setFormData((p) => ({ ...p, nombre_transportista: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="rut">RUT</Label>
            <Input
              id="rut"
              required
              placeholder="Ej: 76.123.456-7"
              value={formData.rut_transportista}
              onChange={(e) =>
                setFormData((p) => ({ ...p, rut_transportista: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              placeholder="Opcional"
              value={formData.direccion_transportista}
              onChange={(e) =>
                setFormData((p) => ({ ...p, direccion_transportista: e.target.value }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear transportista'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
