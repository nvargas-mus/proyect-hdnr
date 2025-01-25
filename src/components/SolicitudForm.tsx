import React, { useState } from 'react';
import { crearSolicitud } from '../services/solicitudService';

const SolicitudForm = () => {
  const [formData, setFormData] = useState({
    usuario_id: 0,
    codigo_cliente_kunnr: 0,
    fecha_servicio_solicitada: '',
    hora_servicio_solicitada: '',
    descripcion: '',
    requiere_transporte: false,
    direccion_id: 0,
    contacto_cliente_id: 0,
    declaracion_id: 0,
    generador_id: 0,
    generador_igual_cliente: false,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                <label htmlFor="usuario_id" className="form-label">ID Usuario</label>
                <input
                  type="number"
                  className="form-control"
                  id="usuario_id"
                  name="usuario_id"
                  value={formData.usuario_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="codigo_cliente_kunnr" className="form-label">Código Cliente</label>
                <input
                  type="number"
                  className="form-control"
                  id="codigo_cliente_kunnr"
                  name="codigo_cliente_kunnr"
                  value={formData.codigo_cliente_kunnr}
                  onChange={handleChange}
                  required
                />
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
              <div className="mb-3">
                <label htmlFor="direccion_id" className="form-label">ID Dirección</label>
                <input
                  type="number"
                  className="form-control"
                  id="direccion_id"
                  name="direccion_id"
                  value={formData.direccion_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contacto_cliente_id" className="form-label">ID Contacto Cliente</label>
                <input
                  type="number"
                  className="form-control"
                  id="contacto_cliente_id"
                  name="contacto_cliente_id"
                  value={formData.contacto_cliente_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="declaracion_id" className="form-label">ID Declaración</label>
                <input
                  type="number"
                  className="form-control"
                  id="declaracion_id"
                  name="declaracion_id"
                  value={formData.declaracion_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="generador_id" className="form-label">ID Generador</label>
                <input
                  type="number"
                  className="form-control"
                  id="generador_id"
                  name="generador_id"
                  value={formData.generador_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="generador_igual_cliente"
                  name="generador_igual_cliente"
                  checked={formData.generador_igual_cliente}
                  onChange={handleChange}
                />
                <label htmlFor="generador_igual_cliente" className="form-check-label">¿Generador igual al cliente?</label>
              </div>
              {error && <p className="text-danger">{error}</p>}
              {message && <p className="text-success">{message}</p>}
              <button type="submit" className="btn btn-primary w-100">Crear Solicitud</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudForm;