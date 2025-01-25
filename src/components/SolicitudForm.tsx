import React, { useState, useEffect } from 'react';
import {
  crearSolicitud,
  getClientesAsociados,
  getDirecciones,
  getContactos,
  getDeclaraciones,
} from '../services/solicitudService';

interface Cliente {
  codigo: number;
  nombre: string;
  sucursal: string;
}

interface Direccion {
  id: number;
  calle: string;
  numero: string;
  comuna: string;
}

interface Contacto {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
}

interface Declaracion {
  id: number;
  descripcion: string;
}

const SolicitudForm = () => {
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
    generador_id: 0,
    generador_igual_cliente: true,
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [declaraciones, setDeclaraciones] = useState<Declaracion[]>([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const clientesData = await getClientesAsociados();
        setClientes(clientesData);

        const declaracionesData = await getDeclaraciones();
        setDeclaraciones(declaracionesData);
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
        } catch (err) {
          console.error('Error al cargar direcciones o contactos:', err);
        }
      };
      fetchDetails();
    }
  }, [formData.codigo_cliente_kunnr]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await crearSolicitud(formData);
      setMessage('Solicitud creada exitosamente.');
      setError('');
      console.log('Datos de la solicitud creada:', data);
    } catch (err) {
      console.error('Error al crear la solicitud:', err);
      setError('Error al crear la solicitud. Verifica los datos e intenta nuevamente.');
      setMessage('');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <h3 className="card-title text-center">Crear Solicitud de Servicio</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="codigo_cliente_kunnr" className="form-label">Cliente</label>
                <select
                  className="form-select"
                  id="codigo_cliente_kunnr"
                  name="codigo_cliente_kunnr"
                  value={formData.codigo_cliente_kunnr}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.codigo} value={cliente.codigo}>
                      {cliente.nombre} - {cliente.sucursal}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="fecha_servicio_solicitada" className="form-label">Fecha de Servicio</label>
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

              <div className="mb-3">
                <label htmlFor="contacto_cliente_id" className="form-label">Contacto</label>
                <select
                  className="form-select"
                  id="contacto_cliente_id"
                  name="contacto_cliente_id"
                  value={formData.contacto_cliente_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un contacto</option>
                  {contactos.map((contacto) => (
                    <option key={contacto.id} value={contacto.id}>
                      {contacto.nombre} - {contacto.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="hora_servicio_solicitada" className="form-label">Hora de Servicio</label>
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

              <div className="mb-3">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
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

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="requiere_transporte"
                  name="requiere_transporte"
                  checked={formData.requiere_transporte}
                  onChange={handleChange}
                />
                <label htmlFor="requiere_transporte" className="form-check-label">¿Requiere Transporte?</label>
              </div>

              {formData.requiere_transporte && (
                <div className="mb-3">
                  <label htmlFor="direccion_id" className="form-label">Dirección</label>
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
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="declaracion_id" className="form-label">Declaración</label>
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

              <button type="submit" className="btn btn-primary w-100">Crear Solicitud</button>

              {error && <p className="text-danger mt-3">{error}</p>}
              {message && <p className="text-success mt-3">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudForm;

