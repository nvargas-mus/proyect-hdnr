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
import ContratoViewModal from './ContratoViewModal';
import NuevoContratoModal from './NuevoContratoModal';
import '../styles/ContratoStyle.css';

interface DeleteConfirmModalProps {
  show: boolean;
  contratoId: number;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  show, 
  contratoId, 
  onClose, 
  onConfirm 
}) => {
  if (!show) return null;

  return (
    <div className="delete-confirm-modal-overlay">
      <div className="delete-confirm-modal">
        <div className="delete-confirm-header">
          <h5>Confirmar eliminación</h5>
        </div>
        <div className="delete-confirm-body">
          <div className="delete-icon">
            <i className="fa fa-exclamation-triangle"></i>
          </div>
          <p className="delete-message">
            ¿Está seguro que desea eliminar el contrato con ID <strong>{contratoId}</strong>?
          </p>
          <p className="delete-warning">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="delete-confirm-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="btn-delete" 
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

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
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<number | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewContratoId, setViewContratoId] = useState<number | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteContratoId, setDeleteContratoId] = useState<number | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedContratoId(null);
  };

  const handleSaveContrato = () => {
    setShowEditModal(false);
    setSelectedContratoId(null);
    fetchContratos(pagination.limit, pagination.offset);
  };
  
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleSaveNewContrato = () => {
    setShowCreateModal(false);
    fetchContratos(pagination.limit, pagination.offset);
  };

  const handleViewTarifas = (id: number) => {
    navigate(`/tarifas-contrato/${id}`);
  };

  const handleView = (id: number) => {
    setViewContratoId(id);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewContratoId(null);
  };

  const handleShowDeleteConfirm = (id: number) => {
    setDeleteContratoId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteContratoId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteContratoId === null) return;
    
    try {
      await deleteContrato(deleteContratoId);
      
      setShowDeleteModal(false);
      setDeleteContratoId(null);
      
      fetchContratos(pagination.limit, pagination.offset);
    } catch (err) {
      console.error('Error eliminando contrato:', err);
      setError('Error al eliminar el contrato. Por favor, intente nuevamente.');
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
          onClick={handleOpenCreateModal}
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
                          {contrato.documento_respaldo && (
                            <button 
                              className="btn-icon btn-download"
                              onClick={() => handleDownload(contrato.contrato_id)}
                              title="Descargar documento"
                            >
                              <i className="fa fa-download"></i>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{contrato.nombre_transportista || 'N/A'}</td>
                      <td>{formatDate(contrato.fecha_fin)}</td>
                      <td>{contrato.tipo_reajuste || 'N/A'}</td>
                      <td>{contrato.frecuencia_reajuste || 'N/A'}</td>
                      <td>{formatDate(contrato.fecha_proximo_reajuste)}</td>
                      <td>
                        <div className="d-flex justify-content-around action-buttons">
                          <button
                            title="Editar contrato"
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(contrato.contrato_id)}
                          >
                            <i className="fa fa-edit"></i>
                          </button>
                          
                          <button
                            title="Ver tarifas"
                            className="btn-action btn-list"
                            onClick={() => handleViewTarifas(contrato.contrato_id)}
                          >
                            <i className="fa fa-list"></i>
                          </button>
                          
                          <button
                            title="Visualizar contrato"
                            className="btn-action btn-view"
                            onClick={() => handleView(contrato.contrato_id)}
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                          
                          <button
                            title="Eliminar contrato"
                            className="btn-action btn-delete"
                            onClick={() => handleShowDeleteConfirm(contrato.contrato_id)}
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

      {showEditModal && selectedContratoId && (
        <ContratoModal 
          contratoId={selectedContratoId}
          show={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveContrato}
        />
      )}

      {showViewModal && viewContratoId && (
        <ContratoViewModal
          contratoId={viewContratoId}
          show={showViewModal}
          onClose={handleCloseViewModal}
        />
      )}

      {showDeleteModal && deleteContratoId !== null && (
        <DeleteConfirmModal
          contratoId={deleteContratoId}
          show={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
      
      <NuevoContratoModal
        show={showCreateModal}
        onClose={handleCloseCreateModal}
        onSave={handleSaveNewContrato}
      />
    </div>
  );
};

export default ContratosTable;