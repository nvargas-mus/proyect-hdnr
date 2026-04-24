import { useState } from 'react';
import { Calendar, Filter, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FiltersState {
  cliente: string;
  estado: string[];
  centro: string;
  usuario: string;
  fechaDesde: string;
  fechaHasta: string;
  requiereTransporte: string;
}

interface FiltrosSolicitudesProps {
  onApplyFilters: (filters: Record<string, any>) => void;
}

const ESTADO_OPTIONS = [
  { value: 'Incompleta', label: 'Incompleta' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Agendado', label: 'Agendado' },
  { value: 'Completado', label: 'Completado' },
  { value: 'Cancelado', label: 'Cancelado' },
];

const FiltrosSolicitudes: React.FC<FiltrosSolicitudesProps> = ({ onApplyFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    cliente: '',
    estado: [],
    centro: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: '',
    requiereTransporte: '',
  });

  const handleApply = () => {
    const formatted: Record<string, any> = {
      ...filters,
      estado: filters.estado.length > 0 ? filters.estado.join(',') : undefined,
    };
    Object.keys(formatted).forEach((k) => {
      if (formatted[k] === '' || formatted[k] === undefined) delete formatted[k];
    });
    onApplyFilters(formatted);
  };

  const handleReset = () => {
    setFilters({
      cliente: '',
      estado: [],
      centro: '',
      usuario: '',
      fechaDesde: '',
      fechaHasta: '',
      requiereTransporte: '',
    });
    onApplyFilters({});
  };

  const activeCount =
    (filters.cliente ? 1 : 0) +
    (filters.estado.length > 0 ? 1 : 0) +
    (filters.centro ? 1 : 0) +
    (filters.usuario ? 1 : 0) +
    (filters.fechaDesde ? 1 : 0) +
    (filters.fechaHasta ? 1 : 0) +
    (filters.requiereTransporte ? 1 : 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Filtros</span>
          {activeCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters((s) => !s)}
        >
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </Button>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2.5">
              <Label htmlFor="cliente">Código cliente</Label>
              <Input
                id="cliente"
                placeholder="Ej: 100001"
                value={filters.cliente}
                onChange={(e) => setFilters((p) => ({ ...p, cliente: e.target.value }))}
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="centro">Centro</Label>
              <Input
                id="centro"
                placeholder="Ej: 1000"
                value={filters.centro}
                onChange={(e) => setFilters((p) => ({ ...p, centro: e.target.value }))}
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="usuario">ID usuario</Label>
              <Input
                id="usuario"
                placeholder="Ej: 14"
                value={filters.usuario}
                onChange={(e) => setFilters((p) => ({ ...p, usuario: e.target.value }))}
              />
            </div>
            <div className="space-y-2.5">
              <Label>Transporte</Label>
              <Select
                value={filters.requiereTransporte}
                onValueChange={(v) =>
                  setFilters((p) => ({ ...p, requiereTransporte: v === '__all' ? '' : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Todos</SelectItem>
                  <SelectItem value="true">Con transporte</SelectItem>
                  <SelectItem value="false">Sin transporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2.5">
              <Label>Estado</Label>
              <div className="flex flex-wrap gap-3 rounded-md border border-border bg-muted/30 p-3">
                {ESTADO_OPTIONS.map((o) => (
                  <label key={o.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.estado.includes(o.value)}
                      onCheckedChange={(v) => {
                        setFilters((p) => ({
                          ...p,
                          estado:
                            v === true
                              ? [...p.estado, o.value]
                              : p.estado.filter((e) => e !== o.value),
                        }));
                      }}
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              <Label>Rango de fechas</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={filters.fechaDesde}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, fechaDesde: e.target.value }))
                    }
                  />
                </div>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={filters.fechaHasta}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, fechaHasta: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
            <Button onClick={handleApply}>
              <Search className="h-4 w-4" />
              Aplicar filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FiltrosSolicitudes;
