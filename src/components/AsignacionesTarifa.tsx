import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTarifaById,
  getAsignacionesManualesByTarifario,
  deleteAsignacionManual,
  AsignacionManualTarifa,
  TarifaContrato,
  PaginationInfo
} from '../services/adminService';
import '../styles/AdminStyle.css';

const AsignacionesTarifa = () => {
  const { tarifaId } = useParams<{ tarifaId: string }>();
  const navigate = useNavigate();
  
  const [tarifa, setTarifa] = useState<TarifaContrato | null>(null);
  const [asignaciones, setAsignaciones] = useState<AsignacionManualTarifa[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTarifaDetalle = async () => {
    if (!tarifaId) return;
    
    try {
      const tarifaData = await getTarifaById(parseInt(tarifaId));
      setTarifa(tarifaData);
    } catch (err) {
      console.error('Error fetching tarifa details:', err);
      setError('Error al obtener detalles de la tarifa. Por favor, intenta nuevamente.');
    }
  };
  
  const fetchAsignaciones = async (limit: number, offset: number) => {
    if (!tarifaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAsignacionesManualesByTarifario(
        parseInt(tarifaId),
        limit,
        offset
      );
      
      setAsignaciones(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching asignaciones:', err);
      setError('Error al obtener las asignaciones de tarifa. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (tarifaId) {
      fetchTarifaDetalle();
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
  
  const handleDelete = async (asignacionId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta asignación?')) {
      try {
        await deleteAsignacionManual(asignacionId);
        fetchAsignaciones(pagination.limit, pagination.offset);
      } catch (err) {
        console.error('Error eliminando asignación:', err);
        alert('Error al eliminar la asignación. Por favor, intente nuevamente.');
      }
    }
  };
  
  const volverATarifas = () => {
    if (tarifa) {
      navigate(`/admin/tarifas-contrato/${tarifa.contrato_id}`);
    } else {
      navigate('/admin/contratos');
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { 
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="asignaciones-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Asignaciones de Tarifa</h2>
        <div>
          <button 
            className="btn form-button-outline" 
            onClick={volverATarifas}
          >
            <i className="fa fa-arrow-left mr-1"></i> Volver a Tarifarios
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* detalles de la tarifa */}
      {tarifa && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Tarifa Seleccionada</h5>
          </div>
          <div className="card-body">
            <p className="mb-2">Resumen de la tarifa: {tarifa.descripcion_tarifa}</p>
            
            <div className="table-responsive">
              <table className="custom-table table-bordered">
                <thead>
                  <tr>
                    <th>ID Tarifa</th>
                    <th>Contrato ID</th>
                    <th>Tipo Transporte</th>
                    <th>Tarifa Inicial</th>
                    <th>Tarifa Actual</th>
                    <th>Inicio Vigencia</th>
                    <th>Fin Vigencia</th>
                    <th>Transportista</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{tarifa.tarifario_contrato_id}</td>
                    <td>{tarifa.contrato_id}</td>
                    <td>{tarifa.nombre_tipo_transporte}</td>
                    <td className="text-right">${formatCurrency(tarifa.tarifa_inicial)}</td>
                    <td className="text-right">${formatCurrency(tarifa.tarifa_actual)}</td>
                    <td>{formatDate(tarifa.fecha_inicio_vigencia_actual)}</td>
                    <td>{formatDate(tarifa.fecha_fin_vigencia_actual)}</td>
                    <td>{tarifa.nombre_transportista || 'N/A'}</td>
                    <td>
                      <div className="d-flex justify-content-center">
                        <button
                          title="Compartir enlace de tarifa"
                          className="btn-action btn-share"
                          onClick={() => navigate(`/admin/asignar-tarifa/${tarifa?.tarifario_contrato_id}`)}
                        >
                          <i className="fa fa-link"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Aplicación de Tarifa */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Aplicación de la Tarifa</h5>
        </div>
        <div className="card-body">
          <p className="mb-3">Detalles de clientes, materiales y direcciones asociadas a la tarifa</p>
          
          {loading ? (
            <div className="text-center py-4">
              <p>Cargando asignaciones...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="custom-table table-bordered">
                  <thead>
                    <tr>
                      <th>ID Asignación</th>
                      <th>Código Cliente</th>
                      <th>Nombre Cliente</th>
                      <th>Sucursal</th>
                      <th>Dirección</th>
                      <th>Código Material</th>
                      <th>Nombre Material</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.length > 0 ? (
                      asignaciones.map((asignacion) => (
                        <tr key={asignacion.asignacion_id}>
                          <td>{asignacion.asignacion_id}</td>
                          <td>{asignacion.codigo_cliente_kunnr}</td>
                          <td>{asignacion.nombre_name1}</td>
                          <td>{asignacion.sucursal_name2}</td>
                          <td>{asignacion.direccion}</td>
                          <td>{asignacion.codigo_material_matnr}</td>
                          <td>{asignacion.nombre_material_maktg}</td>
                          <td>
                            <div className="d-flex justify-content-center">
                              <button
                                title="Eliminar asignación"
                                className="btn-action btn-delete"
                                onClick={() => handleDelete(asignacion.asignacion_id)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center">
                          No hay asignaciones disponibles para esta tarifa
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
                    <i className="fa fa-chevron-left mr-1"></i> Anterior
                  </button>
                  <div className="pagination-info">
                    Mostrando {asignaciones.length} de {pagination.total} asignaciones
                  </div>
                  <button
                    className="btn form-button-outline"
                    disabled={pagination.nextOffset === null}
                    onClick={handleNextPage}
                  >
                    Siguiente <i className="fa fa-chevron-right ml-1"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AsignacionesTarifa;