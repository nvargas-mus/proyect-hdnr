import { useState, useEffect, CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTarifasByContrato, 
  getContratoById,
  deleteTarifa,
  createTarifa,
  getTiposTransporte,
  Contrato, 
  TarifaContrato, 
  PaginationInfo,
  TipoTransporte
} from '../services/adminService';
import '../styles/AdminStyle.css';


const modalStyles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    zIndex: 1051,
    padding: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#243c6c',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6c757d',
    padding: 0,
    lineHeight: 1,
  },
  body: {
    padding: '24px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    gap: '12px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
    color: '#243c6c',
  },
  formControl: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
  button: {
    minWidth: '100px',
  },
  alertSuccess: {
    marginBottom: '20px',
  },
  alertDanger: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'flex',
    marginLeft: '-10px',
    marginRight: '-10px',
  },
  formColumn: {
    flex: 1,
    paddingLeft: '10px',
    paddingRight: '10px',
  },
};

// Interfaz datos formulario de creación de tarifa
interface TarifaFormData {
  contrato_id: number;
  descripcion_tarifa: string;
  tipo_transporte_id: number;
  tarifa_inicial: number;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string | null;
}

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
  
  // Estados para el modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [tiposTransporte, setTiposTransporte] = useState<TipoTransporte[]>([]);
  const [formData, setFormData] = useState<TarifaFormData>({
    contrato_id: parseInt(contratoId || '0'),
    descripcion_tarifa: '',
    tipo_transporte_id: 0,
    tarifa_inicial: 0,
    fecha_inicio_vigencia: '',
    fecha_fin_vigencia: null
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TarifaFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const fetchTiposTransporte = async () => {
    try {
      const tipos = await getTiposTransporte();
      setTiposTransporte(tipos);
      
      if (tipos.length > 0) {
        setFormData(prev => ({
          ...prev,
          tipo_transporte_id: tipos[0].tipo_transporte_id
        }));
      }
    } catch (err) {
      console.error('Error fetching tipos de transporte:', err);
    }
  };

  useEffect(() => {
    if (contratoId) {
      fetchContratoDetails();
      fetchTarifas(pagination.limit, pagination.offset);
      fetchTiposTransporte();
    }
  }, [contratoId]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

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
    navigate(`/admin/asignaciones-tarifa/${tarifaId}`);
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
    navigate('/admin/contratos');
  };

  const openModal = () => {
    setFormData({
      contrato_id: parseInt(contratoId || '0'),
      descripcion_tarifa: '',
      tipo_transporte_id: tiposTransporte.length > 0 ? tiposTransporte[0].tipo_transporte_id : 0,
      tarifa_inicial: 0,
      fecha_inicio_vigencia: new Date().toISOString().split('T')[0],
      fecha_fin_vigencia: null
    });
    setFormErrors({});
    setSuccessMessage(null);
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | number | null = value;
    
    if (name === 'tarifa_inicial' && type === 'number') {
      parsedValue = value === '' ? 0 : parseFloat(value);
    }
    
    if (name === 'tipo_transporte_id') {
      parsedValue = parseInt(value);
    }

    if (name === 'fecha_fin_vigencia' && value === '') {
      parsedValue = null;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    if (formErrors[name as keyof TarifaFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof TarifaFormData, string>> = {};
    
    if (!formData.descripcion_tarifa.trim()) {
      errors.descripcion_tarifa = 'La descripción es obligatoria';
    }
    
    if (!formData.tipo_transporte_id) {
      errors.tipo_transporte_id = 'Debe seleccionar un tipo de transporte';
    }
    
    if (!formData.tarifa_inicial || formData.tarifa_inicial <= 0) {
      errors.tarifa_inicial = 'La tarifa debe ser mayor que 0';
    }
    
    if (!formData.fecha_inicio_vigencia) {
      errors.fecha_inicio_vigencia = 'La fecha de inicio es obligatoria';
    }
    
    if (formData.fecha_fin_vigencia && 
        new Date(formData.fecha_fin_vigencia) <= new Date(formData.fecha_inicio_vigencia)) {
      errors.fecha_fin_vigencia = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await createTarifa(formData);
      setSuccessMessage('¡Tarifa creada exitosamente!');
      
      setTimeout(() => {
        fetchTarifas(pagination.limit, pagination.offset);
        closeModal();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error creating tarifa:', err);
      setError('Error al crear la tarifa: ' + (err.message || 'Por favor, intenta nuevamente.'));
    } finally {
      setSubmitting(false);
    }
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
            onClick={openModal}
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
      
      {/* Modal para agregar nueva tarifa con estilos en línea compatibles con TypeScript */}
      {showModal && (
        <div style={modalStyles.overlay} onClick={closeModal}>
          <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
            <div style={modalStyles.header}>
              <h3 style={modalStyles.headerTitle}>Agregar Nueva Tarifa</h3>
              <button style={modalStyles.closeButton} onClick={closeModal}>×</button>
            </div>
            <div style={modalStyles.body}>
              {successMessage && (
                <div className="alert alert-success" style={modalStyles.alertSuccess}>
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger" style={modalStyles.alertDanger}>
                  {error}
                </div>
              )}
              
              <form>
                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.formLabel} htmlFor="descripcion_tarifa">
                    Descripción <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="descripcion_tarifa"
                    name="descripcion_tarifa"
                    style={{
                      ...modalStyles.formControl, 
                      ...(formErrors.descripcion_tarifa ? {border: '1px solid #dc3545'} : {})
                    }}
                    value={formData.descripcion_tarifa}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Ej: Rampla Santiago Centro -> Planta Pudahuel"
                  />
                  {formErrors.descripcion_tarifa && (
                    <div className="invalid-feedback" style={{display: 'block'}}>
                      {formErrors.descripcion_tarifa}
                    </div>
                  )}
                </div>
                
                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.formLabel} htmlFor="tipo_transporte_id">
                    Tipo de Transporte <span className="text-danger">*</span>
                  </label>
                  <select
                    id="tipo_transporte_id"
                    name="tipo_transporte_id"
                    style={{
                      ...modalStyles.formControl, 
                      ...(formErrors.tipo_transporte_id ? {border: '1px solid #dc3545'} : {})
                    }}
                    value={formData.tipo_transporte_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione un tipo de transporte</option>
                    {tiposTransporte.map(tipo => (
                      <option key={tipo.tipo_transporte_id} value={tipo.tipo_transporte_id}>
                        {tipo.nombre_tipo_transporte}
                      </option>
                    ))}
                  </select>
                  {formErrors.tipo_transporte_id && (
                    <div className="invalid-feedback" style={{display: 'block'}}>
                      {formErrors.tipo_transporte_id}
                    </div>
                  )}
                </div>
                
                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.formLabel} htmlFor="tarifa_inicial">
                    Tarifa Inicial (CLP) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    id="tarifa_inicial"
                    name="tarifa_inicial"
                    style={{
                      ...modalStyles.formControl, 
                      ...(formErrors.tarifa_inicial ? {border: '1px solid #dc3545'} : {})
                    }}
                    value={formData.tarifa_inicial || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    placeholder="Ej: 15000"
                  />
                  {formErrors.tarifa_inicial && (
                    <div className="invalid-feedback" style={{display: 'block'}}>
                      {formErrors.tarifa_inicial}
                    </div>
                  )}
                </div>
                
                <div style={modalStyles.formRow}>
                  <div style={{...modalStyles.formGroup, ...modalStyles.formColumn}}>
                    <label style={modalStyles.formLabel} htmlFor="fecha_inicio_vigencia">
                      Fecha Inicio Vigencia <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="fecha_inicio_vigencia"
                      name="fecha_inicio_vigencia"
                      style={{
                        ...modalStyles.formControl, 
                        ...(formErrors.fecha_inicio_vigencia ? {border: '1px solid #dc3545'} : {})
                      }}
                      value={formData.fecha_inicio_vigencia}
                      onChange={handleInputChange}
                    />
                    {formErrors.fecha_inicio_vigencia && (
                      <div className="invalid-feedback" style={{display: 'block'}}>
                        {formErrors.fecha_inicio_vigencia}
                      </div>
                    )}
                  </div>
                  
                  <div style={{...modalStyles.formGroup, ...modalStyles.formColumn}}>
                    <label style={modalStyles.formLabel} htmlFor="fecha_fin_vigencia">
                      Fecha Fin Vigencia <small>(Opcional)</small>
                    </label>
                    <input
                      type="date"
                      id="fecha_fin_vigencia"
                      name="fecha_fin_vigencia"
                      style={{
                        ...modalStyles.formControl, 
                        ...(formErrors.fecha_fin_vigencia ? {border: '1px solid #dc3545'} : {})
                      }}
                      value={formData.fecha_fin_vigencia || ''}
                      onChange={handleInputChange}
                    />
                    {formErrors.fecha_fin_vigencia && (
                      <div className="invalid-feedback" style={{display: 'block'}}>
                        {formErrors.fecha_fin_vigencia}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div style={modalStyles.footer}>
              <button
                type="button"
                className="btn form-button-outline"
                style={modalStyles.button}
                onClick={closeModal}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn form-button-primary"
                style={modalStyles.button}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : 'Guardar Tarifa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifasContrato;