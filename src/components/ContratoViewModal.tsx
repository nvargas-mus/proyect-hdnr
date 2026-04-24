import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getContratoById } from '../services/adminService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContratoViewModalProps {
  contratoId: number;
  show: boolean;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-right text-sm text-foreground">{value ?? '—'}</dd>
  </div>
);

const ContratoViewModal = ({ contratoId, show, onClose }: ContratoViewModalProps) => {
  const [contrato, setContrato] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContrato = async () => {
      if (!show || !contratoId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getContratoById(contratoId);
        setContrato(data);
      } catch {
        setError('No se pudieron cargar los datos del contrato.');
      } finally {
        setLoading(false);
      }
    };
    fetchContrato();
  }, [contratoId, show]);

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
    <Dialog open={show} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle del contrato #{contratoId}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : contrato ? (
          <dl>
            <Row label="ID" value={`#${contrato.contrato_id}`} />
            <Row
              label="Tipo"
              value={
                contrato.es_spot ? (
                  <Badge variant="warning">Spot</Badge>
                ) : (
                  <Badge variant="secondary">Regular</Badge>
                )
              }
            />
            <Row
              label="Transportista"
              value={
                contrato.nombre_transportista
                  ? `${contrato.nombre_transportista}${
                      contrato.rut_transportista ? ` · ${contrato.rut_transportista}` : ''
                    }`
                  : '—'
              }
            />
            <Row
              label="Documento"
              value={
                contrato.documento_respaldo
                  ? String(contrato.documento_respaldo).split('/').pop()
                  : '—'
              }
            />
            <Row label="Fin vigencia" value={formatDate(contrato.fecha_fin)} />
            <Row label="Tipo de reajuste" value={contrato.tipo_reajuste || '—'} />
            <Row label="Frecuencia" value={contrato.frecuencia_reajuste || '—'} />
            <Row
              label="Próximo reajuste"
              value={formatDate(contrato.fecha_proximo_reajuste)}
            />
          </dl>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay datos disponibles.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContratoViewModal;
