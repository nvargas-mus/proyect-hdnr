import { useState, useEffect, FormEvent } from 'react';
import { 
  getContratoById, 
  updateContrato
} from '../services/adminService';
import '../styles/ModalStyles.css';

interface ContratoModalProps {
  contratoId: number;
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface ContratoFormData {
  transportista_id: number | null;
  es_spot: boolean;
  documento_respaldo: File | null;
  fecha_fin: string;
  tipo_reajuste: string;
  frecuencia_reajuste: string;
  fecha_proximo_reajuste: string;
}

const ContratoModal = ({ contratoId, show, onClose, onSave }: ContratoModalProps) => {
  const [originalContrato, setOriginalContrato] = useState<any>(null);
  
  const [formData, setFormData] = useState<ContratoFormData>({
    transportista_id: null,
    es_spot: false,
    documento_respaldo: null,
    fecha_fin: '',
    tipo_reajuste: '',
    frecuencia_reajuste: '',
    fecha_proximo_reajuste: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);

  const tiposReajuste = [
    { value: 'sin reajuste', label: 'Sin reajuste' },
    { value: 'por polinomio', label: 'Por polinomio' }
  ];
  
  const frecuenciasReajuste = [
    { value: 'Sin reajuste', label: 'Sin reajuste' },
    { value: 'Mensual', label: 'Mensual' },
    { value: 'Trimestral', label: 'Trimestral' },
    { value: 'Semestral', label: 'Semestral' },
    { value: 'Anual', label: 'Anual' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar datos del contrato
        const contratoData = await getContratoById(contratoId);
        setOriginalContrato(contratoData);
        
        setFormData({
          transportista_id: contratoData.transportista_id,
          es_spot: contratoData.es_spot,
          documento_respaldo: null,
          fecha_fin: contratoData.fecha_fin ? contratoData.fecha_fin.split('T')[0] : '',
          tipo_reajuste: contratoData.tipo_reajuste || '',
          frecuencia_reajuste: contratoData.frecuencia_reajuste || '',
          fecha_proximo_reajuste: contratoData.fecha_proximo_reajuste ? contratoData.fecha_proximo_reajuste.split('T')[0] : '',
        });
        
        if (contratoData.documento_respaldo) {
          setOriginalFileName(contratoData.documento_respaldo.split('/').pop() || 'documento');
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos del contrato. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (show && contratoId) {
      fetchData();
    }
  }, [contratoId, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setFormData({
          ...formData,
          [name]: fileInput.files[0]
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      let hasChanges = false;

      if (formData.es_spot !== originalContrato.es_spot) {
        formDataToSend.append('es_spot', formData.es_spot.toString());
        hasChanges = true;
      }
      
      if (formData.documento_respaldo) {
        formDataToSend.append('documento', formData.documento_respaldo);
        hasChanges = true;
      }
      
      const originalFechaFin = originalContrato.fecha_fin ? originalContrato.fecha_fin.split('T')[0] : '';
      if (formData.fecha_fin && formData.fecha_fin !== originalFechaFin) {
        formDataToSend.append('fecha_fin', formData.fecha_fin);
        hasChanges = true;
      }
      
      if (formData.tipo_reajuste && formData.tipo_reajuste !== originalContrato.tipo_reajuste) {
        formDataToSend.append('tipo_reajuste', formData.tipo_reajuste);
        hasChanges = true;
      }
      
      if (formData.frecuencia_reajuste && formData.frecuencia_reajuste !== originalContrato.frecuencia_reajuste) {
        formDataToSend.append('frecuencia_reajuste', formData.frecuencia_reajuste);
        hasChanges = true;
      }
      
      const originalFechaProximo = originalContrato.fecha_proximo_reajuste ? originalContrato.fecha_proximo_reajuste.split('T')[0] : '';
      if (formData.fecha_proximo_reajuste && formData.fecha_proximo_reajuste !== originalFechaProximo) {
        formDataToSend.append('fecha_proximo_reajuste', formData.fecha_proximo_reajuste);
        hasChanges = true;
      }
      
      if (!hasChanges) {
        alert('No se han detectado cambios para guardar.');
        setLoading(false);
        return;
      }
      
      console.log('Datos a enviar:', Object.fromEntries(formDataToSend));
      
      await updateContrato(contratoId, formDataToSend);
      
      onSave();
      
    } catch (err) {
      console.error('Error al actualizar el contrato:', err);
      setError('Error al actualizar el contrato. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h4>Editar Contrato #{contratoId}</h4>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <i className="fa fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {loading ? (
            <div className="text-center">
              <p>Cargando datos del contrato...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contrato-form">
              {/* Transportista ID */}
              <div className="form-group">
                <label className="form-label">ID Transportista</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.transportista_id || ''}
                  disabled
                />
                <small className="text-muted">
                  Este campo no es editable. ID actual: {formData.transportista_id}
                </small>
              </div>
              
              {/* Es Spot */}
              <div className="form-group">
                <div className="custom-checkbox">
                  <input
                    type="checkbox"
                    id="es_spot"
                    name="es_spot"
                    checked={formData.es_spot}
                    onChange={handleChange}
                  />
                  <label htmlFor="es_spot">
                    ¿Es un contrato Spot?
                  </label>
                </div>
              </div>
              
              {/* Documento Respaldo */}
              <div className="form-group">
                <label htmlFor="documento_respaldo" className="form-label">Documento de Respaldo</label>
                <input
                  type="file"
                  className="form-control custom-file-input"
                  id="documento_respaldo"
                  name="documento_respaldo"
                  onChange={handleChange}
                />
                {originalFileName && (
                  <div className="documento-actual">
                    <span>Documento actual:</span> 
                    <span className="documento-nombre">{originalFileName}</span>
                  </div>
                )}
              </div>
              
              {/* Fecha Fin */}
              <div className="form-group">
                <label htmlFor="fecha_fin" className="form-label">Fecha de Fin</label>
                <input
                  type="date"
                  className="form-control custom-date"
                  id="fecha_fin"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                />
              </div>
              
              {/* Tipo Reajuste */}
              <div className="form-group">
                <label htmlFor="tipo_reajuste" className="form-label">Tipo de Reajuste</label>
                <select
                  className="form-control custom-select"
                  id="tipo_reajuste"
                  name="tipo_reajuste"
                  value={formData.tipo_reajuste}
                  onChange={handleChange}
                >
                  <option value="">Seleccione tipo de reajuste</option>
                  {tiposReajuste.map((tipo, index) => (
                    <option key={`tipo-${index}`} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Frecuencia Reajuste */}
              <div className="form-group">
                <label htmlFor="frecuencia_reajuste" className="form-label">Frecuencia de Reajuste</label>
                <select
                  className="form-control custom-select"
                  id="frecuencia_reajuste"
                  name="frecuencia_reajuste"
                  value={formData.frecuencia_reajuste}
                  onChange={handleChange}
                >
                  <option value="">Seleccione frecuencia</option>
                  {frecuenciasReajuste.map((freq, index) => (
                    <option key={`freq-${index}`} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Fecha Próximo Reajuste */}
              <div className="form-group">
                <label htmlFor="fecha_proximo_reajuste" className="form-label">Fecha del Próximo Reajuste</label>
                <input
                  type="date"
                  className="form-control custom-date"
                  id="fecha_proximo_reajuste"
                  name="fecha_proximo_reajuste"
                  value={formData.fecha_proximo_reajuste}
                  onChange={handleChange}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-modal btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-modal btn-save"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContratoModal;