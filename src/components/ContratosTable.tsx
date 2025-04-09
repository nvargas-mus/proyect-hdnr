import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getContratos, 
  deleteContrato, 
  downloadContrato,
  Contrato, 
  PaginationInfo, 
  ContratosResponse 
} from '../services/adminService';
import ContratoModal from './ContratoModal';
import '../styles/ContratoStyle.css';

const ContratosTable = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    limit: 10,
    offset: 0,
    total: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<number | null>(null);

  const fetchContratos = async (limit: number, offset: number) => {
    setLoading(true);
    setError(null);

    try {
      const response: ContratosResponse = await getContratos(limit, offset);
      setContratos(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching contratos:', err);
      setError('Error al obtener los contratos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContratos(pagination.limit, pagination.offset);
  }, []);

  const handlePrevPage = () => {
    if (pagination.prevOffset !== null) {
      fetchContratos(pagination.limit, pagination.prevOffset);
    }
  };

  const handleNextPage = () => {
    if (pagination.nextOffset !== null) {
      fetchContratos(pagination.limit, pagination.nextOffset);
    }
  };

  const handleEdit = (id: number) => {
    setSelectedContratoId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContratoId(null);
  };

  const handleSaveContrato = () => {
    setShowModal(false);
    setSelectedContratoId(null);
    fetchContratos(pagination.limit, pagination.offset);
  };

  const handleViewTarifas = (id: number) => {
    navigate(`/tarifas-contrato/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/ver-contrato/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este contrato?')) {
      try {
        await deleteContrato(id);
        // Recargar la tabla después de eliminar
        fetchContratos(pagination.limit, pagination.offset);
      } catch (err) {
        console.error('Error eliminando contrato:', err);
        alert('Error al eliminar el contrato');
      }
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const blob = await downloadContrato(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      console.error('Error descargando contrato:', err);
      
      if (err.response && err.response.status === 404) {
        alert('El documento solicitado no existe o no está disponible.');
      } else {
        alert('Error al descargar el documento. Por favor, intente nuevamente.');
      }
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Contratos</h2>
        
        <button 
          className="btn form-button-primary" 
          onClick={() => navigate('/crear-contrato')}
        >
          <i className="fa fa-plus mr-2"></i> Crear Nuevo Contrato
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center">
          <p>Cargando contratos...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>¿Es Spot?</th>
                  <th>Documento</th>
                  <th>Transportista</th>
                  <th>Fecha Fin</th>
                  <th>Tipo Reajuste</th>
                  <th>Frecuencia Reajuste</th>
                  <th>Próximo Reajuste</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contratos.length > 0 ? (
                  contratos.map((contrato) => (
                    <tr key={contrato.contrato_id}>
                      <td>{contrato.contrato_id}</td>
                      <td>{contrato.es_spot ? 'Sí' : 'No'}</td>
                      <td>
                        <div className="documento-container">
                          <span className="documento-nombre">
                            {contrato.documento_respaldo ? 
                              contrato.documento_respaldo.split('/').pop() || `contrato${contrato.contrato_id}.pdf` : 
                              'N/A'
                            }
                          </span>
                          {/* Siempre mostrar el icono de descarga */}
                          <button 
                            className="btn-icon btn-download"
                            onClick={() => handleDownload(contrato.contrato_id)}
                            title="Descargar documento"
                          >
                            <i className="fa fa-download"></i>
                          </button>
                        </div>
                      </td>
                      <td>{contrato.nombre_transportista || 'N/A'}</td>
                      <td>{formatDate(contrato.fecha_fin)}</td>
                      <td>{contrato.tipo_reajuste || 'N/A'}</td>
                      <td>{contrato.frecuencia_reajuste || 'N/A'}</td>
                      <td>{formatDate(contrato.fecha_proximo_reajuste)}</td>
                      <td>
                        <div className="d-flex justify-content-around action-buttons">
                          {/* Botón Editar */}
                          <button
                            title="Editar contrato"
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(contrato.contrato_id)}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                          
                          {/* Botón Ver Tarifas */}
                          <button
                            title="Ver tarifas"
                            className="btn-action btn-list"
                            onClick={() => handleViewTarifas(contrato.contrato_id)}
                          >
                            <i className="fa fa-list"></i>
                          </button>
                          
                          {/* Botón Visualizar */}
                          <button
                            title="Visualizar contrato"
                            className="btn-action btn-view"
                            onClick={() => handleView(contrato.contrato_id)}
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                          
                          {/* Botón Eliminar */}
                          <button
                            title="Eliminar contrato"
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(contrato.contrato_id)}
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
                      No hay contratos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="d-flex justify-content-between pagination-buttons mt-3">
            <button
              className="btn form-button-outline"
              disabled={pagination.prevOffset === null}
              onClick={handlePrevPage}
            >
              <i className="fa fa-chevron-left mr-1"></i> Anterior
            </button>
            <div className="pagination-info">
              Mostrando {contratos.length} de {pagination.total} contratos
            </div>
            <button
              className="btn form-button-outline"
              disabled={pagination.nextOffset === null}
              onClick={handleNextPage}
            >
              Siguiente <i className="fa fa-chevron-right ml-1"></i>
            </button>
          </div>
        </>
      )}

      {/* Modal para editar contrato */}
      {showModal && selectedContratoId && (
        <ContratoModal 
          contratoId={selectedContratoId}
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveContrato}
        />
      )}
    </div>
  );
};

export default ContratosTable;