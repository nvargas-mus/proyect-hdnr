import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminStyle.css';

interface AsignacionTarifa {
  asignacion_id: number;
  tarifario_contrato_id: number;
  cliente_id: number;
  nombre_cliente: string;
  material_id: number;
  nombre_material: string;
  direccion_id: number;
  nombre_direccion: string;
  fecha_asignacion: string;
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

const AsignacionesTarifa = () => {
  const { tarifaId } = useParams<{ tarifaId: string }>();
  const navigate = useNavigate();
  
  const [asignaciones, setAsignaciones] = useState<AsignacionTarifa[]>([]);
  const [tarifaInfo, setTarifaInfo] = useState<any>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAsignaciones = async (limit: number, offset: number) => {
    if (!tarifaId) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      
      const tarifaResponse = await axios.get(`${API_URL}/tarifario_contrato/${tarifaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      setTarifaInfo(tarifaResponse.data);
      
      const asignacionesResponse = await axios.get(`${API_URL}/asignaciones_manuales_tarifas/tarifario/${tarifaId}`, {
        params: { limit, offset },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      setAsignaciones(asignacionesResponse.data.data);
      setPagination(asignacionesResponse.data.pagination);
      
    } catch (err) {
      console.error('Error fetching asignaciones:', err);
      setError('Error al obtener las asignaciones de la tarifa. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tarifaId) {
      fetchAsignaciones(pagination.limit, pagination.offset);
    }
  }, [tarifaId]);

  const handlePrevPage = () => {
    if (pagination.prevOffset !== null) {
      fetchAsignaciones(pagination.limit, pagination.prevOffset);
    }
  };

  const handleNextPage = () => {
    if (pagination.nextOffset !== null) {
      fetchAsignaciones(pagination.limit, pagination.nextOffset);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Asignaciones Manuales de Tarifa</h2>
        <button 
          className="btn form-button-outline" 
          onClick={() => tarifaInfo ? navigate(`/tarifas-contrato/${tarifaInfo.contrato_id}`) : navigate('/admin')}
        >
          Volver a Tarifas
        </button>
      </div>
      
      {tarifaInfo && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Información de la Tarifa</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>ID de Tarifa:</strong> {tarifaInfo.tarifario_contrato_id}</p>
                <p><strong>Contrato ID:</strong> {tarifaInfo.contrato_id}</p>
                <p><strong>Descripción:</strong> {tarifaInfo.descripcion_tarifa}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Tarifa Actual:</strong> ${tarifaInfo.tarifa_actual?.toLocaleString() || 'N/A'}</p>
                <p><strong>Inicio Vigencia:</strong> {formatDate(tarifaInfo.fecha_inicio_vigencia)}</p>
                <p><strong>Fin Vigencia:</strong> {formatDate(tarifaInfo.fecha_fin_vigencia)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center">
          <p>Cargando asignaciones...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID Asignación</th>
                  <th>Cliente</th>
                  <th>Material</th>
                  <th>Dirección</th>
                  <th>Fecha Asignación</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.length > 0 ? (
                  asignaciones.map((asignacion) => (
                    <tr key={asignacion.asignacion_id}>
                      <td>{asignacion.asignacion_id}</td>
                      <td>{asignacion.nombre_cliente || `Cliente ID: ${asignacion.cliente_id}`}</td>
                      <td>{asignacion.nombre_material || `Material ID: ${asignacion.material_id}`}</td>
                      <td>{asignacion.nombre_direccion || `Dirección ID: ${asignacion.direccion_id}`}</td>
                      <td>{formatDate(asignacion.fecha_asignacion)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No hay asignaciones manuales para esta tarifa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {asignaciones.length > 0 && (
            <div className="d-flex justify-content-between pagination-buttons mt-3">
              <button
                className="btn form-button-outline"
                disabled={pagination.prevOffset === null}
                onClick={handlePrevPage}
              >
                Anterior
              </button>
              <div className="pagination-info">
                Mostrando {asignaciones.length} de {pagination.total} asignaciones
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

export default AsignacionesTarifa;