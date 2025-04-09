import { useState, useEffect, FormEvent } from 'react';
import { 
  getContratoById, 
  updateContrato
} from '../services/adminService';

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

const modalStyles = {
  overlay: {
    position: 'fixed' as const,
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
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#243c6c',
    borderRadius: '8px 8px 0 0',
  },
  headerTitle: {
    margin: 0,
    color: 'white',
    fontWeight: 600,
    fontSize: '18px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    color: 'white',
    cursor: 'pointer',
  },
  body: {
    padding: '20px 40px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#243c6c',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    fontSize: '15px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  helpText: {
    color: '#6c757d',
    fontSize: '13px',
    marginTop: '5px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
  },
  checkbox: {
    marginRight: '10px',
    width: '20px',
    height: '20px',
  },
  documentoActual: {
    marginTop: '10px',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #e9ecef',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef',
  },
  buttonCancel: {
    minWidth: '120px',
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#243c6c',
    border: '1px solid #243c6c',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonSave: {
    minWidth: '120px',
    padding: '8px 16px',
    backgroundColor: '#243c6c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

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
    <div style={modalStyles.overlay}>
      <div style={modalStyles.container}>
      <div style={modalStyles.header}>
  <h4 id="contratoModalTitle" style={{
    margin: 0,
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '18px'
  }}>Editar Contrato - ID {contratoId}</h4>
  <button type="button" style={modalStyles.closeButton} onClick={onClose}>
    <i className="fa fa-times"></i>
  </button>
</div>
        <div style={modalStyles.body}>
          {error && (
            <div style={{padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px'}}>
              {error}
            </div>
          )}
          
          {loading ? (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <p>Cargando datos del contrato...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Transportista ID */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label}>ID Transportista</label>
                <input
                  type="text"
                  style={{...modalStyles.input, ...modalStyles.disabledInput}}
                  value={formData.transportista_id || ''}
                  disabled
                />
                <p style={modalStyles.helpText}>
                  Este campo no es editable. ID actual: {formData.transportista_id}
                </p>
              </div>
              
              {/* Es Spot */}
              <div style={modalStyles.formGroup}>
                <div style={modalStyles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="es_spot"
                    name="es_spot"
                    checked={formData.es_spot}
                    onChange={handleChange}
                    style={modalStyles.checkbox}
                  />
                  <label htmlFor="es_spot" style={{fontWeight: 500}}>
                    ¿Es un contrato Spot?
                  </label>
                </div>
              </div>
              
              {/* Documento Respaldo */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="documento_respaldo">Documento de Respaldo</label>
                <input
                  type="file"
                  style={modalStyles.input}
                  id="documento_respaldo"
                  name="documento_respaldo"
                  onChange={handleChange}
                />
                {originalFileName && (
                  <div style={modalStyles.documentoActual}>
                    <span style={{fontWeight: 600, marginRight: '8px'}}>Documento actual:</span> 
                    <span>{originalFileName}</span>
                  </div>
                )}
              </div>
              
              {/* Fecha Fin */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="fecha_fin">Fecha de Fin</label>
                <input
                  type="date"
                  style={modalStyles.input}
                  id="fecha_fin"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                />
              </div>
              
              {/* Tipo Reajuste */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="tipo_reajuste">Tipo de Reajuste</label>
                <select
                  style={modalStyles.input}
                  id="tipo_reajuste"
                  name="tipo_reajuste"
                  value={formData.tipo_reajuste}
                  onChange={handleChange}
                >
                  <option key="empty-tipo" value="">Seleccione tipo de reajuste</option>
                  {tiposReajuste.map((tipo, index) => (
                    <option key={`tipo-${index}`} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Frecuencia Reajuste */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="frecuencia_reajuste">Frecuencia de Reajuste</label>
                <select
                  style={modalStyles.input}
                  id="frecuencia_reajuste"
                  name="frecuencia_reajuste"
                  value={formData.frecuencia_reajuste}
                  onChange={handleChange}
                >
                  <option key="empty-frecuencia" value="">Seleccione frecuencia</option>
                  {frecuenciasReajuste.map((freq, index) => (
                    <option key={`freq-${index}`} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Fecha Próximo Reajuste */}
              <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="fecha_proximo_reajuste">Fecha del Próximo Reajuste</label>
                <input
                  type="date"
                  style={modalStyles.input}
                  id="fecha_proximo_reajuste"
                  name="fecha_proximo_reajuste"
                  value={formData.fecha_proximo_reajuste}
                  onChange={handleChange}
                />
              </div>
              
              <div style={modalStyles.actions}>
                <button 
                  type="button" 
                  style={modalStyles.buttonCancel}
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={modalStyles.buttonSave}
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