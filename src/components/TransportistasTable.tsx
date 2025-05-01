import React, { useState, useEffect } from 'react';
import '../styles/AdminStyle.css';

interface Transportista {
  transportista_id: number;
  nombre_transportista: string;
  rut_transportista: string;
  direccion_transportista: string;
  fecha_creacion: string;
  ultima_actualizacion: string;
}

const TransportistasTable: React.FC = () => {
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransportistas = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch('http://15.229.249.223:3000/transportistas', {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error al obtener transportistas: ${response.status}`);
        }

        const data = await response.json();
        setTransportistas(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al obtener transportistas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransportistas();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="content-container">
      <h2>Gestión de Transportistas</h2>
      
      <div className="row mb-3">
        <div className="col-md-6">
          <p>Listado de transportistas registrados en el sistema.</p>
        </div>
        <div className="col-md-6 text-right">
          <button className="btn form-button-primary">
            <i className="fa fa-plus"></i> Nuevo Transportista
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando transportistas...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="fa fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      ) : transportistas.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <i className="fa fa-info-circle mr-2"></i>
          No se encontraron transportistas en el sistema.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Dirección</th>
                <th>Fecha Creación</th>
                <th>Última Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transportistas.map((transportista) => (
                <tr key={transportista.transportista_id}>
                  <td>{transportista.transportista_id}</td>
                  <td>{transportista.nombre_transportista}</td>
                  <td>{transportista.rut_transportista}</td>
                  <td>{transportista.direccion_transportista}</td>
                  <td>{formatDate(transportista.fecha_creacion)}</td>
                  <td>{formatDate(transportista.ultima_actualizacion)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-view" title="Ver detalles">
                        <i className="fa fa-eye"></i>
                      </button>
                      <button className="btn-action btn-edit" title="Editar">
                        <i className="fa fa-edit"></i>
                      </button>
                      <button className="btn-action btn-delete" title="Eliminar">
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransportistasTable;