import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  Search,
  Truck,
} from 'lucide-react';
import {
  crearSolicitud,
  getClientesAsociados,
  getContactos,
  getDeclaraciones,
  getDirecciones,
  getGeneradores,
  getReferencias,
  postContacto,
  postDireccion,
  Referencia,
} from '../services/solicitudService';
import {
  Cliente,
  Contacto,
  Declaracion,
  Direccion,
  Generador,
} from '../interfaces/solicitud';
import SolicitudCompletionForm from './SolicitudCompletionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const LOCAL_STORAGE_KEY = 'solicitudFormData';

const SolicitudForm = () => {
  const [step, setStep] = useState(1);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');
  const [completed, setCompleted] = useState(false);

  const [formData, setFormData] = useState({
    usuario_id: Number(localStorage.getItem('usuario_id')),
    codigo_cliente_kunnr: 0,
    clienteDisplay: '',
    fecha_servicio_solicitada: '',
    hora_servicio_solicitada: '',
    descripcion: '',
    requiere_transporte: false,
    direccion_id: null as number | null,
    contacto_cliente_id: 0,
    declaracion_id: 0,
    generador_igual_cliente: true,
    generador_id: null as number | null,
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [declaraciones, setDeclaraciones] = useState<Declaracion[]>([]);
  const [generadores, setGeneradores] = useState<Generador[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showClientesDropdown, setShowClientesDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showAddDireccionModal, setShowAddDireccionModal] = useState(false);
  const [showAddContactoModal, setShowAddContactoModal] = useState(false);

  const [newDireccion, setNewDireccion] = useState({
    codigo_cliente_kunnr: 0,
    calle: '',
    numero: '',
    complemento: '',
    comuna: '',
    region: '',
    contacto_terreno_id: 0,
  });

  const [newContacto, setNewContacto] = useState({
    codigo_cliente_kunnr: 0,
    nombre: '',
    telefono: '',
    email: '',
    referencia_id: 0,
  });

  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 15) {
        if (hour === 18 && min > 0) break;
        times.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      }
    }
    return times;
  };

  // Rehidratar desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setFormData(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Buscar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientesAsociados(searchQuery);
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && typeof data === 'object') list = data.clientes || data.data || [];
        setClientes(
          list.map((c: any) => ({
            codigo: c.codigo_cliente_kunnr,
            nombre: c.nombre_name1,
            sucursal: c.sucursal_name2,
          }))
        );
      } catch {
        setClientes([]);
      }
    };
    fetchClientes();
  }, [searchQuery]);

  // Catálogos
  useEffect(() => {
    (async () => {
      try {
        const decl = await getDeclaraciones();
        let list: any[] = [];
        if (Array.isArray(decl)) list = decl;
        else if (decl && typeof decl === 'object') list = decl.declaraciones || decl.data || [];
        setDeclaraciones(
          list.map((d: any) => ({ id: d.declaracion_id, descripcion: d.declaracion_nombre }))
        );
      } catch {
        // silencioso
      }
    })();
    (async () => {
      try {
        const data = await getReferencias();
        setReferencias(data);
      } catch {
        // silencioso
      }
    })();
  }, []);

  // Detalles cliente
  useEffect(() => {
    if (!formData.codigo_cliente_kunnr) return;
    const fetchDetails = async () => {
      try {
        const codigo = Number(formData.codigo_cliente_kunnr);
        const dir = await getDirecciones(codigo);
        setDirecciones(
          (dir as any[]).map((d: any) => ({
            id: d.direccion_id,
            calle: d.calle,
            numero: d.numero,
            comuna: d.comuna,
          }))
        );
        const cont = await getContactos(codigo);
        setContactos(
          cont.map((c: any) => ({
            id: c.contacto_id,
            nombre: c.nombre,
            telefono: c.telefono,
            email: c.email,
          }))
        );
        setNewDireccion((p) => ({ ...p, codigo_cliente_kunnr: codigo }));
        setNewContacto((p) => ({ ...p, codigo_cliente_kunnr: codigo }));
      } catch {
        // silencioso
      }
    };
    fetchDetails();
  }, [formData.codigo_cliente_kunnr]);

  useEffect(() => {
    if (!formData.generador_igual_cliente) {
      (async () => {
        try {
          const gens = await getGeneradores();
          setGeneradores(gens);
        } catch {
          setGeneradores([]);
        }
      })();
    }
  }, [formData.generador_igual_cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const [y, m, d] = formData.fecha_servicio_solicitada.split('-').map(Number);
    const fechaServicio = new Date(y, m - 1, d);
    fechaServicio.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaServicio < hoy) {
      setError('La fecha de servicio no puede estar en el pasado.');
      return;
    }

    const [h, min] = formData.hora_servicio_solicitada.split(':');
    const hora = parseInt(h, 10);
    const minuto = parseInt(min, 10);
    if (
      hora < 8 ||
      hora > 18 ||
      ![0, 15, 30, 45].includes(minuto) ||
      !formData.hora_servicio_solicitada
    ) {
      setError(
        'Hora inválida. Debe ser entre 08:00 y 18:00 con minutos exactos (00, 15, 30, 45).'
      );
      return;
    }

    if (formData.requiere_transporte && !formData.direccion_id) {
      setError('Debes seleccionar una dirección cuando requiere transporte.');
      return;
    }

    try {
      const { clienteDisplay: _ignored, ...payload } = formData;
      let hora_servicio = payload.hora_servicio_solicitada;
      if (hora_servicio.length === 5) hora_servicio += ':00';

      const data = await crearSolicitud({
        ...payload,
        hora_servicio_solicitada: hora_servicio,
        generador_id: payload.generador_igual_cliente ? 0 : payload.generador_id,
      });

      setError('');
      setSolicitudId(data.solicitud_id);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      setError('Error al crear la solicitud. Verifica los datos e intenta nuevamente.');
      setMessage('');
    }
  };

  const handleSubmitDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo_cliente_kunnr) {
      setError('Selecciona un cliente antes de agregar una dirección.');
      return;
    }
    try {
      const data = await postDireccion({
        ...newDireccion,
        codigo_cliente_kunnr: formData.codigo_cliente_kunnr,
      });
      const updated = await getDirecciones(formData.codigo_cliente_kunnr);
      setDirecciones(
        (updated as any[]).map((d: any) => ({
          id: d.direccion_id,
          calle: d.calle,
          numero: d.numero,
          comuna: d.comuna,
        }))
      );
      setFormData((p) => ({ ...p, direccion_id: data.direccion_id }));
      setShowAddDireccionModal(false);
    } catch {
      setError('Error al agregar la dirección.');
    }
  };

  const handleSubmitContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo_cliente_kunnr) {
      setError('Selecciona un cliente antes de agregar un contacto.');
      return;
    }
    try {
      const data = await postContacto({
        ...newContacto,
        codigo_cliente_kunnr: formData.codigo_cliente_kunnr,
      });
      const updated = await getContactos(formData.codigo_cliente_kunnr);
      setContactos(
        updated.map((c: any) => ({
          id: c.contacto_id,
          nombre: c.nombre,
          telefono: c.telefono,
          email: c.email,
        }))
      );
      setFormData((p) => ({ ...p, contacto_cliente_id: data.contacto_id }));
      setShowAddContactoModal(false);
    } catch {
      setError('Error al agregar el contacto.');
    }
  };

  const progressPercent = step === 1 ? 33 : completed ? 100 : 66;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-end">
          <span className="text-sm font-medium text-muted-foreground">
            {progressPercent}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StepDot active={step >= 1} done={step > 1} label="1" />
          <div
            className={cn(
              'h-0.5 flex-1 transition-colors',
              step > 1 ? 'bg-primary' : 'bg-border'
            )}
          />
          <StepDot active={step >= 2 && !completed} done={completed} label="2" />
          <div
            className={cn(
              'h-0.5 flex-1 transition-colors',
              completed ? 'bg-primary' : 'bg-border'
            )}
          />
          <StepDot
            active={completed}
            done={completed}
            label={<CheckCircle2 className="h-3.5 w-3.5" />}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs font-medium text-muted-foreground">
          <span className={step >= 1 ? 'text-foreground' : ''}>Datos generales</span>
          <span className={step >= 2 ? 'text-foreground' : ''}>
            Materiales y detalle
          </span>
          <span className={completed ? 'text-foreground' : ''}>Listo</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {step === 1 ? 'Nueva solicitud de servicio' : `Completar solicitud #${solicitudId}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1
            ? 'Completa los datos principales para crear la solicitud'
            : 'Registra los materiales y detalles del transporte'}
        </p>
      </div>

      {step === 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Datos generales</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {message && (
                <Alert variant="success">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* Cliente */}
              <div className="relative space-y-2.5">
                <Label htmlFor="codigo_cliente_kunnr">Cliente</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="codigo_cliente_kunnr"
                    name="codigo_cliente_kunnr"
                    placeholder="Escribe para buscar…"
                    autoComplete="off"
                    className="pl-10"
                    value={formData.clienteDisplay}
                    onFocus={() => setShowClientesDropdown(true)}
                    onBlur={() => setTimeout(() => setShowClientesDropdown(false), 200)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearchQuery(v);
                      setShowClientesDropdown(true);
                      setFormData((p) => ({
                        ...p,
                        clienteDisplay: v,
                        codigo_cliente_kunnr: 0,
                      }));
                    }}
                    required
                  />
                </div>
                {showClientesDropdown && clientes.length > 0 && (
                  <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
                    {clientes.map((c) => (
                      <li key={c.codigo}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const display = `${c.codigo} · ${c.nombre}${
                              c.sucursal ? ' · ' + c.sucursal : ''
                            }`;
                            setFormData((p) => ({
                              ...p,
                              clienteDisplay: display,
                              codigo_cliente_kunnr: c.codigo,
                            }));
                            setSearchQuery(display);
                            setShowClientesDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span className="font-semibold text-foreground">{c.codigo}</span>
                          <span className="ml-2">{c.nombre}</span>
                          {c.sucursal && (
                            <span className="ml-2 text-muted-foreground">· {c.sucursal}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Fecha y hora */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="fecha_servicio_solicitada">Fecha de servicio</Label>
                  <Input
                    id="fecha_servicio_solicitada"
                    type="date"
                    value={formData.fecha_servicio_solicitada}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        fecha_servicio_solicitada: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label>Hora de servicio</Label>
                  <Select
                    value={formData.hora_servicio_solicitada}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, hora_servicio_solicitada: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora…" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2.5">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  rows={3}
                  placeholder="Detalles del servicio solicitado"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, descripcion: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Requiere transporte */}
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/30 p-4">
                <Checkbox
                  checked={formData.requiere_transporte}
                  onCheckedChange={(v) =>
                    setFormData((p) => ({ ...p, requiere_transporte: v === true }))
                  }
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="font-medium">¿Requiere transporte?</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Activa si necesitas que Hidronor gestione el transporte del servicio
                  </p>
                </div>
              </label>

              {/* Dirección */}
              {formData.requiere_transporte && (
                <div className="space-y-2.5">
                  <Label>Dirección</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.direccion_id ? String(formData.direccion_id) : ''}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, direccion_id: Number(v) }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar dirección…" />
                      </SelectTrigger>
                      <SelectContent>
                        {direcciones.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.calle}, {d.numero}, {d.comuna}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDireccionModal(true)}
                      disabled={!formData.codigo_cliente_kunnr}
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </div>
              )}

              {/* Contacto */}
              <div className="space-y-2.5">
                <Label>Contacto</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.contacto_cliente_id ? String(formData.contacto_cliente_id) : ''}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, contacto_cliente_id: Number(v) }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar contacto…" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactos.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre} {c.email ? `· ${c.email}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddContactoModal(true)}
                    disabled={!formData.codigo_cliente_kunnr}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Declaración */}
              <div className="space-y-2.5">
                <Label>Declaración</Label>
                <Select
                  value={formData.declaracion_id ? String(formData.declaracion_id) : ''}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, declaracion_id: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar declaración…" />
                  </SelectTrigger>
                  <SelectContent>
                    {declaraciones.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generador */}
              <div className="space-y-2.5">
                <Label>¿El cliente es el generador del residuo?</Label>
                <div className="flex gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 hover:bg-accent">
                    <input
                      type="radio"
                      name="generador_igual_cliente"
                      checked={formData.generador_igual_cliente === true}
                      onChange={() =>
                        setFormData((p) => ({ ...p, generador_igual_cliente: true }))
                      }
                    />
                    <span className="text-sm">Sí</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 hover:bg-accent">
                    <input
                      type="radio"
                      name="generador_igual_cliente"
                      checked={formData.generador_igual_cliente === false}
                      onChange={() =>
                        setFormData((p) => ({ ...p, generador_igual_cliente: false }))
                      }
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
              {!formData.generador_igual_cliente && (
                <div className="space-y-2.5">
                  <Label>Generador</Label>
                  <Select
                    value={formData.generador_id ? String(formData.generador_id) : ''}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, generador_id: Number(v) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar generador…" />
                    </SelectTrigger>
                    <SelectContent>
                      {generadores.map((g: any) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(isAdminContext ? '/admin' : '/home')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button type="submit">
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && solicitudId && (
        <div className="mt-6">
          <SolicitudCompletionForm
            solicitudId={solicitudId}
            requiereTransporte={formData.requiere_transporte}
            onBack={() => {
              setFormData({
                usuario_id: Number(localStorage.getItem('usuario_id')),
                codigo_cliente_kunnr: 0,
                clienteDisplay: '',
                fecha_servicio_solicitada: '',
                hora_servicio_solicitada: '',
                descripcion: '',
                requiere_transporte: false,
                direccion_id: null,
                contacto_cliente_id: 0,
                declaracion_id: 0,
                generador_igual_cliente: true,
                generador_id: null,
              });
              setStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCompleted={() => setCompleted(true)}
          />
        </div>
      )}

      {/* Modal agregar dirección */}
      <Dialog open={showAddDireccionModal} onOpenChange={setShowAddDireccionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar dirección</DialogTitle>
            <DialogDescription>
              Registra una nueva dirección para este cliente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitDireccion} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label>Calle</Label>
                <Input
                  value={newDireccion.calle}
                  onChange={(e) => setNewDireccion((p) => ({ ...p, calle: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2.5">
                <Label>Número</Label>
                <Input
                  value={newDireccion.numero}
                  onChange={(e) =>
                    setNewDireccion((p) => ({ ...p, numero: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label>Complemento</Label>
              <Input
                value={newDireccion.complemento}
                onChange={(e) =>
                  setNewDireccion((p) => ({ ...p, complemento: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label>Comuna</Label>
                <Input
                  value={newDireccion.comuna}
                  onChange={(e) =>
                    setNewDireccion((p) => ({ ...p, comuna: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2.5">
                <Label>Región</Label>
                <Input
                  value={newDireccion.region}
                  onChange={(e) =>
                    setNewDireccion((p) => ({ ...p, region: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label>Contacto en terreno</Label>
              <Select
                value={String(newDireccion.contacto_terreno_id || '')}
                onValueChange={(v) =>
                  setNewDireccion((p) => ({ ...p, contacto_terreno_id: Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar contacto…" />
                </SelectTrigger>
                <SelectContent>
                  {contactos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDireccionModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar dirección</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal agregar contacto */}
      <Dialog open={showAddContactoModal} onOpenChange={setShowAddContactoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar contacto</DialogTitle>
            <DialogDescription>
              Registra un nuevo contacto para este cliente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitContacto} className="space-y-4">
            <div className="space-y-2.5">
              <Label>Nombre</Label>
              <Input
                value={newContacto.nombre}
                onChange={(e) =>
                  setNewContacto((p) => ({ ...p, nombre: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label>Teléfono</Label>
                <Input
                  value={newContacto.telefono}
                  onChange={(e) =>
                    setNewContacto((p) => ({ ...p, telefono: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newContacto.email}
                  onChange={(e) =>
                    setNewContacto((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label>Referencia</Label>
              <Select
                value={String(newContacto.referencia_id || '')}
                onValueChange={(v) =>
                  setNewContacto((p) => ({ ...p, referencia_id: Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar referencia…" />
                </SelectTrigger>
                <SelectContent>
                  {referencias.map((r) => (
                    <SelectItem key={r.referencia_id} value={String(r.referencia_id)}>
                      {r.nombre_referencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddContactoModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar contacto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all',
        done
          ? 'bg-primary text-primary-foreground'
          : active
            ? 'bg-primary/20 text-primary ring-2 ring-primary'
            : 'bg-muted text-muted-foreground'
      )}
    >
      {label}
    </div>
  );
}

export default SolicitudForm;
