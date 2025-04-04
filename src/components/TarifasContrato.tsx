import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminStyle.css';

interface TarifaContrato {
  tarifario_contrato_id: number;
  contrato_id: number;
  descripcion_tarifa: string;
  tipo_transporte_id: number;
  tipo_transporte_nombre?: string;
  tarifa_inicial: number;
  tarifa_actual: number;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string;
}

interface TipoTransporte {
  id: number;
  nombre: string;
}

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  nextOffset: number | null;
  prevOffset: number | null;
}

const API_URL = 'http://15.229.249.223:3000';
const getToken = () => localStorage.getItem('authToken') || '';

const TarifasContrato = () => {
  const { contratoId } = useParams<{ contratoId: string }>();
  const navigate = useNavigate();
  
  const [tarifas, setTarifas] = useState<TarifaContrato[]>([]);
  const [tiposTransporte, setTiposTransporte] = useState<TipoTransporte[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTarifas = async (limit: number, offset: number) => {
    if (!contratoId) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      
      const response = await axios.get(`${API_URL}/tarifario_contrato/contrato/${contratoId}`, {
        params: { limit, offset },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const tiposTransporteResponse = await axios.get(`${API_URL}/tiposTransporte`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      setTiposTransporte(tiposTransporteResponse.data);
      
      const tarifasConNombres = response.data.data.map((tarifa: TarifaContrato) => {
        const tipoTransporte = tiposTransporteResponse.data.find(
          (tipo: TipoTransporte) => tipo.id === tarifa.tipo_transporte_id
        );
        return {
          ...tarifa,
          tipo_transporte_nombre: tipoTransporte ? tipoTransporte.nombre : 'N/A'
        };
      });
      
      setTarifas(tarifasConNombres);
      setPagination(response.data.pagination);
      
    } catch (err) {
      console.error('Error fetching tarifas:', err);
      setError('Error al obtener las tarifas del contrato. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contratoId) {
      fetchTarifas(pagination.limit, pagination.offset);
    }
  }, [contratoId]);

  const handlePrevPage = () => {
    if (pagination.prevOffset !== null) {
      fetchTarifas(pagination.limit, pagination.prevOffset);
    }
  };

  const handleNextPage = () => {
    if (pagination.nextOffset !== null) {
      fetchTarifas(pagination.limit, pagination.nextOffset);
    }
  };

  const handleDelete = async (tarifaId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta tarifa?')) {
      try {
        const token = getToken();
        await axios.delete(`${API_URL}/tarifario_contrato/${tarifaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        fetchTarifas(pagination.limit, pagination.offset);
      } catch (err) {
        console.error('Error eliminando tarifa:', err);
        alert('Error al eliminar la tarifa');
      }
    }
  };

  const verAsignaciones = (tarifaId: number) => {
    navigate(`/asignaciones-tarifa/${tarifaId}`);
  };

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tarifas del Contrato #{contratoId}</h2>
        <div>
          <button 
            className="btn form-button-outline mr-2" 
            onClick={() => navigate('/admin')}
          >
            Volver a Contratos
          </button>
          <button 
            className="btn form-button-primary" 
            onClick={() => navigate(`/crear-tarifa/${contratoId}`)}
          >
            Agregar Nueva Tarifa
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center">
          <p>Cargando tarifas...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Tipo Transporte</th>
                  <th>Tarifa Inicial</th>
                  <th>Tarifa Actual</th>
                  <th>Inicio Vigencia</th>
                  <th>Fin Vigencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tarifas.length > 0 ? (
                  tarifas.map((tarifa) => (
                    <tr key={tarifa.tarifario_contrato_id}>
                      <td>{tarifa.tarifario_contrato_id}</td>
                      <td>{tarifa.descripcion_tarifa}</td>
                      <td>{tarifa.tipo_transporte_nombre}</td>
                      <td className="text-right">${formatCurrency(tarifa.tarifa_inicial)}</td>
                      <td className="text-right">${formatCurrency(tarifa.tarifa_actual)}</td>
                      <td>{formatDate(tarifa.fecha_inicio_vigencia)}</td>
                      <td>{formatDate(tarifa.fecha_fin_vigencia)}</td>
                      <td>
                        <div className="btn-group">
                          {/* Botón Editar */}
                          <button
                            title="Editar tarifa"
                            className="btn btn-sm btn-outline-primary mr-1"
                            onClick={() => navigate(`/editar-tarifa/${tarifa.tarifario_contrato_id}`)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          
                          {/* Botón Ver Asignaciones */}
                          <button
                            title="Ver asignaciones de tarifa"
                            className="btn btn-sm btn-outline-info mr-1"
                            onClick={() => verAsignaciones(tarifa.tarifario_contrato_id)}
                          >
                            <i className="fas fa-list"></i>
                          </button>
                          
                          {/* Botón Eliminar */}
                          <button
                            title="Eliminar tarifa"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(tarifa.tarifario_contrato_id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No hay tarifas disponibles para este contrato
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {tarifas.length > 0 && (
            <div className="d-flex justify-content-between pagination-buttons mt-3">
              <button
                className="btn form-button-outline"
                disabled={pagination.prevOffset === null}
                onClick={handlePrevPage}
              >
                Anterior
              </button>
              <div className="pagination-info">
                Mostrando {tarifas.length} de {pagination.total} tarifas
              </div>
              <button
                className="btn form-button-outline"
                disabled={pagination.nextOffset === null}
                onClick={handleNextPage}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TarifasContrato;