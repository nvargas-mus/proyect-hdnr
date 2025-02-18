import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  crearSolicitud,
  getClientesAsociados,
  getDirecciones,
  getContactos,
  getDeclaraciones,
  getGeneradores,
  postDireccion,
  postContacto,
} from '../services/solicitudService';
import {
  Cliente,
  Direccion,
  Contacto,
  Declaracion,
  Generador,
} from '../interfaces/solicitud';
import SolicitudCompletionForm from './SolicitudCompletionForm';
import '../styles/Form.css';

const LOCAL_STORAGE_KEY = 'solicitudFormData';

const SolicitudForm = () => {
  const [step, setStep] = useState(1);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    usuario_id: number;
    codigo_cliente_kunnr: number;
    clienteDisplay: string;
    fecha_servicio_solicitada: string;
    hora_servicio_solicitada: string;
    descripcion: string;
    requiere_transporte: boolean;
    direccion_id: number | null;
    contacto_cliente_id: number;
    declaracion_id: number;
    generador_igual_cliente: boolean;
    generador_id: number;
  }>({
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
    generador_id: 0,
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [declaraciones, setDeclaraciones] = useState<Declaracion[]>([]);
  const [generadores, setGeneradores] = useState<Generador[]>([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showAddDireccionModal, setShowAddDireccionModal] = useState(false);
  const [showAddContactoModal, setShowAddContactoModal] = useState(false);

  const [newDireccion, setNewDireccion] = useState({
    codigo_cliente_kunnr: formData.codigo_cliente_kunnr,
    calle: '',
    numero: '',
    complemento: '',
    comuna: '',
    region: '',
    contacto_terreno_id: 0,
  });

  const [newContacto, setNewContacto] = useState({
    codigo_cliente_kunnr: formData.codigo_cliente_kunnr,
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
        const hStr = hour.toString().padStart(2, '0');
        const mStr = min.toString().padStart(2, '0');
        times.push(`${hStr}:${mStr}`);
      }
    }
    return times;
  };

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const clientesData = await getClientesAsociados();
        let clientesList: any[] = [];
        if (Array.isArray(clientesData)) {
          clientesList = clientesData;
        } else if (clientesData && typeof clientesData === 'object') {
          clientesList = clientesData.clientes || clientesData.data || [];
        }
        const mappedClientes = clientesList.map((cliente: any) => ({
          codigo: cliente.codigo_cliente_kunnr,
          nombre: cliente.nombre_name1,
          sucursal: cliente.sucursal_name2,
        }));
        setClientes(mappedClientes);

        const declaracionesData = await getDeclaraciones();
        let declaracionesList: any[] = [];
        if (Array.isArray(declaracionesData)) {
          declaracionesList = declaracionesData;
        } else if (declaracionesData && typeof declaracionesData === 'object') {
          declaracionesList = declaracionesData.declaraciones || declaracionesData.data || [];
        }
        const mappedDeclaraciones = declaracionesList.map((decl: any) => ({
          id: decl.declaracion_id,
          descripcion: decl.declaracion_nombre,
        }));
        setDeclaraciones(mappedDeclaraciones);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.codigo_cliente_kunnr && formData.codigo_cliente_kunnr !== 0) {
      const fetchDetails = async () => {
        try {
          let direccionesResponse: any;
          try {
            direccionesResponse = await getDirecciones(formData.codigo_cliente_kunnr);
          } catch (err: any) {
            if (err.response && err.response.status === 404) {
              direccionesResponse = [];
            } else {
              throw err;
            }
          }
          let direccionesList: any[] = [];
          if (Array.isArray(direccionesResponse)) {
            direccionesList = direccionesResponse;
          } else if (direccionesResponse && typeof direccionesResponse === 'object') {
            direccionesList = direccionesResponse.direcciones || direccionesResponse.data || [];
          }
          const mappedDirecciones = direccionesList.map((direccion: any) => ({
            id: direccion.direccion_id,
            calle: direccion.calle,
            numero: direccion.numero,
            complemento: direccion.complemento,
            comuna: direccion.comuna,
            region: direccion.region,
            contacto_terreno_id: direccion.contacto_terreno_id,
          }));
          setDirecciones(mappedDirecciones);

          let contactosResponse: any;
          try {
            contactosResponse = await getContactos(formData.codigo_cliente_kunnr);
          } catch (err: any) {
            if (err.response && err.response.status === 404) {
              contactosResponse = [];
            } else {
              throw err;
            }
          }
          let contactosList: any[] = [];
          if (Array.isArray(contactosResponse)) {
            contactosList = contactosResponse;
          } else if (contactosResponse && typeof contactosResponse === 'object') {
            contactosList = contactosResponse.contactos || contactosResponse.data || [];
          }
          const mappedContactos = contactosList.map((contacto: any) => ({
            id: contacto.contacto_id,
            nombre: contacto.nombre,
            telefono: contacto.telefono,
            email: contacto.email,
            referencia_id: contacto.referencia_id,
          }));
          setContactos(mappedContactos);

          setNewDireccion((prev) => ({
            ...prev,
            codigo_cliente_kunnr: formData.codigo_cliente_kunnr,
          }));
          setNewContacto((prev) => ({
            ...prev,
            codigo_cliente_kunnr: formData.codigo_cliente_kunnr,
          }));
        } catch (err) {
          console.error('Error al cargar direcciones o contactos:', err);
        }
      };
      fetchDetails();
    }
  }, [formData.codigo_cliente_kunnr]);

  useEffect(() => {
    if (!formData.generador_igual_cliente) {
      const fetchGeneradores = async () => {
        try {
          const generadoresData = await getGeneradores();
          setGeneradores(generadoresData);
        } catch (err) {
          console.error('Error al cargar generadores:', err);
        }
      };
      fetchGeneradores();
    }
  }, [formData.generador_igual_cliente]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'radio' && name === 'generador_igual_cliente') {
      newValue = value === 'true';
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fechaServicio = new Date(formData.fecha_servicio_solicitada);
    const hoy = new Date();
    if (fechaServicio < hoy) {
      alert("Advertencia: La fecha de servicio seleccionada está en el pasado.");
    }

    const [hourStr, minuteStr] = formData.hora_servicio_solicitada.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (hour < 8 || hour > 18 || ![0, 15, 30, 45].includes(minute)) {
      alert("Advertencia: La hora de servicio debe estar entre 08:00 y 18:00 y los minutos deben ser 00, 15, 30 o 45.");
    }

    try {
      const payload = { ...formData };
      if (!payload.requiere_transporte) {
        payload.direccion_id = null;
      }
      const data = await crearSolicitud(payload);
      setMessage('Solicitud creada exitosamente. Por favor, complete la información adicional.');
      setError('');
      setSolicitudId(data.solicitud_id);
      setStep(2);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.error('Error al crear la solicitud:', err);
      setError('Error al crear la solicitud. Verifica los datos e intenta nuevamente.');
      setMessage('');
    }
  };

  const handleDireccionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewDireccion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await postDireccion(newDireccion);
      const direccionesActualizadas = await getDirecciones(formData.codigo_cliente_kunnr);
      let direccionesList: any[] = [];
      if (Array.isArray(direccionesActualizadas)) {
        direccionesList = direccionesActualizadas;
      } else if (direccionesActualizadas && typeof direccionesActualizadas === 'object') {
        direccionesList = direccionesActualizadas.direcciones || direccionesActualizadas.data || [];
      }
      const mappedDirecciones = direccionesList.map((direccion: any) => ({
        id: direccion.direccion_id,
        calle: direccion.calle,
        numero: direccion.numero,
        complemento: direccion.complemento,
        comuna: direccion.comuna,
        region: direccion.region,
        contacto_terreno_id: direccion.contacto_terreno_id,
      }));
      setDirecciones(mappedDirecciones);
      setFormData((prev) => ({
        ...prev,
        direccion_id: data.id,
      }));
      setShowAddDireccionModal(false);
    } catch (error) {
      console.error('Error al agregar dirección:', error);
      alert('Error al agregar dirección.');
    }
  };

  const handleContactoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewContacto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await postContacto(newContacto);
      const contactosActualizados = await getContactos(formData.codigo_cliente_kunnr);
      let contactosList: any[] = [];
      if (Array.isArray(contactosActualizados)) {
        contactosList = contactosActualizados;
      } else if (contactosActualizados && typeof contactosActualizados === 'object') {
        contactosList = contactosActualizados.contactos || contactosActualizados.data || [];
      }
      const mappedContactos = contactosList.map((contacto: any) => ({
        id: contacto.contacto_id,
        nombre: contacto.nombre,
        telefono: contacto.telefono,
        email: contacto.email,
        referencia_id: contacto.referencia_id,
      }));
      setContactos(mappedContactos);
      setFormData((prev) => ({
        ...prev,
        contacto_cliente_id: data.id,
      }));
      setShowAddContactoModal(false);
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      alert('Error al agregar contacto.');
    }
  };

  return (
    <div className="container mt-5">
      {step === 1 && (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card p-4">
              <h3 className="card-title text-center">Crear Solicitud de Servicio</h3>
              <form onSubmit={handleSubmit}>
                {/* Selección de cliente */}
                <div className="mb-3">
                  <label htmlFor="codigo_cliente_kunnr" className="form-label">
                    Cliente
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    list="clientesList"
                    id="codigo_cliente_kunnr"
                    name="codigo_cliente_kunnr"
                    placeholder="Escribe para buscar..."
                    value={formData.clienteDisplay}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const parts = inputValue.split(' - ');
                      const code = parts[0] ? Number(parts[0]) : 0;
                      setFormData((prev) => ({
                        ...prev,
                        clienteDisplay: inputValue,
                        codigo_cliente_kunnr: code,
                      }));
                    }}
                    required
                  />
                  <datalist id="clientesList">
                    {clientes.map((cliente) => (
                      <option
                        key={cliente.codigo}
                        value={`${cliente.codigo} - ${cliente.nombre} - ${cliente.sucursal}`}
                      />
                    ))}
                  </datalist>
                </div>

                {/* Fecha de servicio */}
                <div className="mb-3">
                  <label htmlFor="fecha_servicio_solicitada" className="form-label">
                    Fecha de Servicio
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha_servicio_solicitada"
                    name="fecha_servicio_solicitada"
                    value={formData.fecha_servicio_solicitada}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Hora de servicio */}
                <div className="mb-3">
                  <label htmlFor="hora_servicio_solicitada" className="form-label">
                    Hora de Servicio
                  </label>
                  <select
                    className="form-select"
                    id="hora_servicio_solicitada"
                    name="hora_servicio_solicitada"
                    value={formData.hora_servicio_solicitada}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una hora</option>
                    {generateTimeOptions().map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div className="mb-3">
                  <label htmlFor="descripcion" className="form-label">
                    Descripción
                  </label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    name="descripcion"
                    rows={3}
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* ¿Requiere transporte? */}
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="requiere_transporte"
                    name="requiere_transporte"
                    checked={formData.requiere_transporte}
                    onChange={handleChange}
                  />
                  <label htmlFor="requiere_transporte" className="form-check-label">
                    ¿Requiere Transporte?
                  </label>
                </div>

                {/* Dirección (solo si requiere transporte) */}
                {formData.requiere_transporte && (
                  <div className="mb-3">
                    <label htmlFor="direccion_id" className="form-label">
                      Dirección
                    </label>
                    <div className="input-group">
                      <select
                        className="form-select"
                        id="direccion_id"
                        name="direccion_id"
                        value={formData.direccion_id?.toString() ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            direccion_id: val ? Number(val) : null,
                          }));
                        }}
                        required
                      >
                        <option value="">Seleccione una dirección</option>
                        {direcciones.map((direccion) => (
                          <option key={direccion.id} value={direccion.id}>
                            {direccion.calle}, {direccion.numero}, {direccion.comuna}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn form-button-outline"
                        onClick={() => setShowAddDireccionModal(true)}
                      >
                        Agregar Dirección
                      </button>
                    </div>
                  </div>
                )}

                {/* Contacto */}
                <div className="mb-3">
                  <label htmlFor="contacto_cliente_id" className="form-label">
                    Contacto
                  </label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      id="contacto_cliente_id"
                      name="contacto_cliente_id"
                      value={formData.contacto_cliente_id}
                      onChange={handleChange}
                    >
                      <option value="">Seleccione un contacto</option>
                      {contactos.map((contacto) => (
                        <option key={contacto.id} value={contacto.id}>
                          {contacto.nombre} - {contacto.email}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn form-button-outline"
                      onClick={() => setShowAddContactoModal(true)}
                    >
                      Agregar Contacto
                    </button>
                  </div>
                </div>

                {/* Declaración */}
                <div className="mb-3">
                  <label htmlFor="declaracion_id" className="form-label">
                    Declaración
                  </label>
                  <select
                    className="form-select"
                    id="declaracion_id"
                    name="declaracion_id"
                    value={formData.declaracion_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una declaración</option>
                    {declaraciones.map((declaracion) => (
                      <option key={declaracion.id} value={declaracion.id}>
                        {declaracion.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generador */}
                <div className="mb-3">
                  <label className="form-label">
                    ¿El cliente es el generador del residuo?
                  </label>
                  <div>
                    <input
                      type="radio"
                      id="generadorSi"
                      name="generador_igual_cliente"
                      value="true"
                      checked={formData.generador_igual_cliente === true}
                      onChange={handleChange}
                    />
                    <label htmlFor="generadorSi" className="me-3">
                      Sí
                    </label>
                    <input
                      type="radio"
                      id="generadorNo"
                      name="generador_igual_cliente"
                      value="false"
                      checked={formData.generador_igual_cliente === false}
                      onChange={handleChange}
                    />
                    <label htmlFor="generadorNo">No</label>
                  </div>
                </div>
                {!formData.generador_igual_cliente && (
                  <div className="mb-3">
                    <label htmlFor="generador_id" className="form-label">
                      Generador
                    </label>
                    <div className="input-group">
                      <select
                        className="form-select"
                        id="generador_id"
                        name="generador_id"
                        value={formData.generador_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione un generador</option>
                        {generadores.map((generador) => (
                          <option key={generador.id} value={generador.id}>
                            {generador.nombre}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn form-button-outline"
                        onClick={() =>
                          alert('Funcionalidad para agregar generador pendiente de implementar.')
                        }
                      >
                        Agregar Generador
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 form-button-primary"
                >
                  Crear Solicitud
                </button>

                {error && <p className="text-danger mt-3">{error}</p>}
                {message && <p className="text-success mt-3">{message}</p>}
              </form>
            </div>
          </div>

          <div className="col-12 d-flex justify-content-start mt-3">
            <button
              type="button"
              className="btn btn-secondary btn-volver"
              onClick={() => navigate('/home')}
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {step === 2 && solicitudId && (
        <SolicitudCompletionForm
          solicitudId={solicitudId}
          requiereTransporte={formData.requiere_transporte}
          onBack={() => setStep(1)}
        />
      )}

      {/* Modal para Agregar Dirección */}
      {showAddDireccionModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSubmitDireccion}>
                  <div className="modal-header">
                    <h5 className="modal-title">Agregar Dirección</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddDireccionModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Campos de la nueva dirección */}
                    <div className="mb-3">
                      <label htmlFor="calle" className="form-label">
                        Calle
                      </label>
                      <input
                        type="text"
                        id="calle"
                        name="calle"
                        value={newDireccion.calle}
                        onChange={handleDireccionChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="numero" className="form-label">
                        Número
                      </label>
                      <input
                        type="text"
                        id="numero"
                        name="numero"
                        value={newDireccion.numero}
                        onChange={handleDireccionChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="complemento" className="form-label">
                        Complemento
                      </label>
                      <input
                        type="text"
                        id="complemento"
                        name="complemento"
                        value={newDireccion.complemento}
                        onChange={handleDireccionChange}
                        className="form-control"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="comuna" className="form-label">
                        Comuna
                      </label>
                      <input
                        type="text"
                        id="comuna"
                        name="comuna"
                        value={newDireccion.comuna}
                        onChange={handleDireccionChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="region" className="form-label">
                        Región
                      </label>
                      <input
                        type="text"
                        id="region"
                        name="region"
                        value={newDireccion.region}
                        onChange={handleDireccionChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="contacto_terreno_id" className="form-label">
                        Contacto Terreno
                      </label>
                      <div className="input-group">
                        <select
                          id="contacto_terreno_id"
                          name="contacto_terreno_id"
                          value={newDireccion.contacto_terreno_id}
                          onChange={handleDireccionChange}
                          className="form-select"
                          required
                        >
                          <option value="">Seleccione un contacto</option>
                          {contactos.map((contacto) => (
                            <option key={contacto.id} value={contacto.id}>
                              {contacto.nombre} - {contacto.email}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn form-button-outline"
                          onClick={() => setShowAddContactoModal(true)}
                        >
                          Agregar Contacto
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary modal-save-button">
                      Guardar Dirección
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal para Agregar Contacto */}
      {showAddContactoModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSubmitContacto}>
                  <div className="modal-header">
                    <h5 className="modal-title">Agregar Contacto</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddContactoModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={newContacto.nombre}
                        onChange={handleContactoChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="telefono" className="form-label">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        id="telefono"
                        name="telefono"
                        value={newContacto.telefono}
                        onChange={handleContactoChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newContacto.email}
                        onChange={handleContactoChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="referencia_id" className="form-label">
                        Referencia
                      </label>
                      <select
                        id="referencia_id"
                        name="referencia_id"
                        value={newContacto.referencia_id}
                        onChange={handleContactoChange}
                        className="form-select"
                        required
                      >
                        <option value="">Seleccione una referencia</option>
                        <option value={1}>Referencia 1</option>
                        <option value={2}>Referencia 2</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary modal-save-button">
                      Guardar Contacto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SolicitudForm;






