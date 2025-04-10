import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTarifasByContrato, 
  getContratoById,
  deleteTarifa,
  Contrato, 
  TarifaContrato, 
  PaginationInfo 
} from '../services/adminService';
import '../styles/AdminStyle.css';

const TarifasContrato = () => {
  const { contratoId } = useParams<{ contratoId: string }>();
  const navigate = useNavigate();
  
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [tarifas, setTarifas] = useState<TarifaContrato[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const fetchContratoDetails = async () => {
    if (!contratoId) return;

    try {
      const contratoData = await getContratoById(parseInt(contratoId));
      setContrato(contratoData);
    } catch (err) {
      console.error('Error fetching contrato details:', err);
      setError('Error al obtener detalles del contrato. Por favor, intenta nuevamente.');
    }
  };

  const fetchTarifas = async (limit: number, offset: number) => {
    if (!contratoId) return;
    
    setLoading(true);
    setError(null);

    try {
      const tarifasResponse = await getTarifasByContrato(
        parseInt(contratoId),
        limit,
        offset
      );
      
      setTarifas(tarifasResponse.data);
      setPagination(tarifasResponse.pagination);
    } catch (err) {
      console.error('Error fetching tarifas:', err);
      setError('Error al obtener las tarifas del contrato. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contratoId) {
      fetchContratoDetails();
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
        await deleteTarifa(tarifaId);
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

  const compartirTarifa = (tarifaId: number) => {
    const shareUrl = `${window.location.origin}/detalles-tarifa/${tarifaId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Compartir Tarifa',
        text: `Detalles de la tarifa #${tarifaId}`,
        url: shareUrl
      }).catch(err => {
        console.error('Error al compartir:', err);
      });
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setShareMessage('¡Enlace copiado al portapapeles!');
          setTimeout(() => setShareMessage(null), 3000);
        })
        .catch(err => {
          console.error('Error al copiar enlace:', err);
          alert('No se pudo copiar el enlace. Intente nuevamente.');
        });
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

  const volverAContratos = () => {
    localStorage.setItem('adminActiveTab', 'contratos');
    navigate('/admin');
  };

  return (
    <div className="tarifas-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tarifas del Contrato - ID {contratoId}</h2>
        <div>
          <button 
            className="btn form-button-outline mr-2" 
            onClick={volverAContratos}
          >
            <i className="fa fa-arrow-left mr-1"></i> Volver a Contratos
          </button>
          <button 
            className="btn form-button-primary" 
            onClick={() => navigate(`/crear-tarifa/${contratoId}`)}
          >
            <i className="fa fa-plus mr-1"></i> Agregar Nueva Tarifa
          </button>
        </div>
      </div>
      
      {shareMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {shareMessage}
          <button type="button" className="close" onClick={() => setShareMessage(null)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
      
      {/* Tarjeta de detalles del contrato */}
      {contrato && (
        <div className="card contrato-details-card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Detalles del Contrato</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 col-lg-3 mb-3 mb-lg-0">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{contrato.contrato_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">{contrato.es_spot ? 'Spot' : 'Regular'}</span>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3 mb-lg-0">
                <div className="detail-item">
                  <span className="detail-label">Transportista:</span>
                  <span className="detail-value">{contrato.nombre_transportista || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha Fin:</span>
                  <span className="detail-value">{formatDate(contrato.fecha_fin)}</span>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3 mb-3 mb-md-0">
                <div className="detail-item">
                  <span className="detail-label">Tipo Reajuste:</span>
                  <span className="detail-value">{contrato.tipo_reajuste || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Frecuencia:</span>
                  <span className="detail-value">{contrato.frecuencia_reajuste || 'N/A'}</span>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="detail-item">
                  <span className="detail-label">Próx. Reajuste:</span>
                  <span className="detail-value">{formatDate(contrato.fecha_proximo_reajuste)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span className={`detail-value status-badge ${
                    !contrato.fecha_fin ? 'status-active' : 
                    new Date(contrato.fecha_fin) < new Date() ? 'status-expired' : 'status-active'
                  }`}>
                    {!contrato.fecha_fin ? 'Activo' : 
                     new Date(contrato.fecha_fin) < new Date() ? 'Vencido' : 'Activo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center py-4">
          <p>Cargando tarifas...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Tipo Transporte</th>
                  <th>Transportista</th>
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
                      <td>{tarifa.nombre_tipo_transporte}</td>
                      <td>{tarifa.nombre_transportista || 'N/A'}</td>
                      <td className="text-right">${formatCurrency(tarifa.tarifa_inicial)}</td>
                      <td className="text-right">${formatCurrency(tarifa.tarifa_actual)}</td>
                      <td>{formatDate(tarifa.fecha_inicio_vigencia_actual)}</td>
                      <td>{formatDate(tarifa.fecha_fin_vigencia_actual)}</td>
                      <td>
                        <div className="d-flex justify-content-around action-buttons">
                          {/* Botón Editar */}
                          <button
                            title="Editar tarifa"
                            className="btn-action btn-edit"
                            onClick={() => navigate(`/editar-tarifa/${tarifa.tarifario_contrato_id}`)}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                          
                          {/* Botón Ver Asignaciones */}
                          <button
                            title="Ver asignaciones de tarifa"
                            className="btn-action btn-list"
                            onClick={() => verAsignaciones(tarifa.tarifario_contrato_id)}
                          >
                            <i className="fa fa-list"></i>
                          </button>
                          
                          {/* Botón Compartir  */}
                          <button
                            title="Compartir enlace de tarifa"
                            className="btn-action btn-share"
                            onClick={() => compartirTarifa(tarifa.tarifario_contrato_id)}
                          >
                            <i className="fa fa-link"></i>
                          </button>
                          
                          {/* Botón Eliminar */}
                          <button
                            title="Eliminar tarifa"
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(tarifa.tarifario_contrato_id)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center">
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
                <i className="fa fa-chevron-left mr-1"></i> Anterior
              </button>
              <div className="pagination-info">
                Mostrando {tarifas.length} de {pagination.total} tarifas
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
  );
};

export default TarifasContrato;