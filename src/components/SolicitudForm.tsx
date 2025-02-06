import React, { useState, useEffect } from 'react';
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

const SolicitudForm = () => {
  const [step, setStep] = useState(1);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    usuario_id: Number(localStorage.getItem('usuario_id')),
    codigo_cliente_kunnr: 0,
    fecha_servicio_solicitada: '',
    hora_servicio_solicitada: '',
    descripcion: '',
    requiere_transporte: false,
    direccion_id: 0,
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const clientesData = await getClientesAsociados();
        const mappedClientes = clientesData.map((cliente: any) => ({
          codigo: cliente.codigo_cliente_kunnr,
          nombre: cliente.nombre_name1,
          sucursal: cliente.sucursal_name2,
        }));
        setClientes(mappedClientes);

        const declaracionesData = await getDeclaraciones();
        const mappedDeclaraciones = declaracionesData.map((decl: any) => ({
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
    if (formData.codigo_cliente_kunnr) {
      const fetchDetails = async () => {
        try {
          const direccionesData = await getDirecciones(formData.codigo_cliente_kunnr);
          setDirecciones(direccionesData);
          const contactosData = await getContactos(formData.codigo_cliente_kunnr);
          setContactos(contactosData);
          setNewDireccion({ ...newDireccion, codigo_cliente_kunnr: formData.codigo_cliente_kunnr });
          setNewContacto({ ...newContacto, codigo_cliente_kunnr: formData.codigo_cliente_kunnr });
        } catch (err) {
          console.error('Error al cargar direcciones o contactos:', err);
        }
      };
      fetchDetails();
    }
  }, [formData.codigo_cliente_kunnr]);

  useEffect(() => {
    if (formData.generador_igual_cliente === false) {
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
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await crearSolicitud(formData);
      setMessage('Solicitud creada exitosamente. Por favor, complete la información adicional.');
      setError('');
      setSolicitudId(data.solicitud_id);
      setStep(2);
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
    setNewDireccion({
      ...newDireccion,
      [name]: value,
    });
  };

  const handleContactoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewContacto({
      ...newContacto,
      [name]: value,
    });
  };

  const handleSubmitDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await postDireccion(newDireccion);
      const direccionesActualizadas = await getDirecciones(formData.codigo_cliente_kunnr);
      setDirecciones(direccionesActualizadas);
      setFormData({
        ...formData,
        direccion_id: data.id,
      });
      setShowAddDireccionModal(false);
    } catch (error) {
      console.error('Error al agregar dirección:', error);
      alert('Error al agregar dirección.');
    }
  };

  const handleSubmitContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await postContacto(newContacto);
      const contactosActualizados = await getContactos(formData.codigo_cliente_kunnr);
      setContactos(contactosActualizados);
      setFormData({
        ...formData,
        contacto_cliente_id: data.id,
      });
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
                  <select
                    className="form-select"
                    id="codigo_cliente_kunnr"
                    name="codigo_cliente_kunnr"
                    value={formData.codigo_cliente_kunnr}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>Seleccione cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.codigo} value={cliente.codigo}>
                        {cliente.codigo} - {cliente.nombre} - {cliente.sucursal}
                      </option>
                    ))}
                  </select>
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
                  <input
                    type="time"
                    className="form-control"
                    id="hora_servicio_solicitada"
                    name="hora_servicio_solicitada"
                    value={formData.hora_servicio_solicitada}
                    onChange={handleChange}
                    required
                  />
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
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    required
                  ></textarea>
                </div>

                {/* Requiere transporte */}
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

                {/* Campo Dirección (solo si requiere_transporte es true) */}
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
                        value={formData.direccion_id}
                        onChange={handleChange}
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
                        className="btn btn-outline-secondary"
                        onClick={() => setShowAddDireccionModal(true)}
                      >
                        Agregar Dirección
                      </button>
                    </div>
                  </div>
                )}

                {/* Campo Contacto */}
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
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAddContactoModal(true)}
                    >
                      Agregar Contacto
                    </button>
                  </div>
                </div>

                {/* Campo Declaración */}
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

                {/* Campo Generador */}
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
                    <label htmlFor="generadorSi" className="me-2">
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
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          alert('Funcionalidad para agregar generador pendiente de implementar.')
                        }
                      >
                        Agregar Generador
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100">
                  Crear Solicitud
                </button>

                {error && <p className="text-danger mt-3">{error}</p>}
                {message && <p className="text-success mt-3">{message}</p>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Segundo formulario: Componente para Completar Solicitud */}
      {step === 2 && solicitudId && (
        <SolicitudCompletionForm 
          solicitudId={solicitudId} 
          requiereTransporte={formData.requiere_transporte} 
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
                          className="btn btn-outline-secondary"
                          onClick={() => setShowAddContactoModal(true)}
                        >
                          Agregar Contacto
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
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
                    <button type="submit" className="btn btn-primary">
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

