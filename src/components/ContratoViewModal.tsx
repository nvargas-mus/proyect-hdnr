import { useState, useEffect } from 'react';
import { getContratoById } from '../services/adminService';

interface ContratoViewModalProps {
  contratoId: number;
  show: boolean;
  onClose: () => void;
}

const ContratoViewModal = ({ contratoId, show, onClose }: ContratoViewModalProps) => {
  const [contrato, setContrato] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = {
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
    title: {
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
    group: {
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid #e9ecef',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 600,
      color: '#243c6c',
      fontSize: '15px',
    },
    value: {
      color: '#333',
      fontSize: '15px',
      lineHeight: 1.5,
    },
    documentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    documentIcon: {
      color: '#dc3545',
      fontSize: '16px',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '15px 40px 20px',
      borderTop: '1px solid #e9ecef',
    },
    button: {
      minWidth: '120px',
      padding: '8px 16px',
      backgroundColor: '#243c6c',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }
  };

  useEffect(() => {
    const fetchContrato = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getContratoById(contratoId);
        setContrato(data);
      } catch (err) {
        console.error('Error cargando datos del contrato:', err);
        setError('Error al cargar los datos del contrato. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    if (show && contratoId) {
      fetchContrato();
    }
  }, [contratoId, show]);

  if (!show) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h4 id="contratoModalTitle" style={styles.title}>Detalles del Contrato - ID {contratoId}</h4>
          <button type="button" style={styles.closeButton} onClick={onClose}>
            <i className="fa fa-times"></i>
          </button>
        </div>
        
        <div style={styles.body}>
          {error && (
            <div style={{padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px'}}>
              {error}
            </div>
          )}
          
          {loading ? (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <p>Cargando datos del contrato...</p>
            </div>
          ) : contrato ? (
            <div>
              <div style={styles.group}>
                <div style={styles.label}>ID del Contrato</div>
                <div style={styles.value}>{contrato.contrato_id}</div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>¿Es un contrato Spot?</div>
                <div style={styles.value}>{contrato.es_spot ? 'Sí' : 'No'}</div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>Transportista</div>
                <div style={styles.value}>
                  {contrato.nombre_transportista || 'N/A'} 
                  {contrato.rut_transportista ? ` (RUT: ${contrato.rut_transportista})` : ''}
                </div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>ID Transportista</div>
                <div style={styles.value}>{contrato.transportista_id || 'N/A'}</div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>Documento de Respaldo</div>
                <div style={styles.value}>
                  {contrato.documento_respaldo ? (
                    <div style={styles.documentInfo}>
                      <i className="fa fa-file-pdf-o" style={styles.documentIcon}></i>
                      <span>{contrato.documento_respaldo.split('/').pop() || 'documento.pdf'}</span>
                    </div>
                  ) : 'No hay documento disponible'}
                </div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>Fecha de Fin</div>
                <div style={styles.value}>{formatDate(contrato.fecha_fin)}</div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>Tipo de Reajuste</div>
                <div style={styles.value}>{contrato.tipo_reajuste || 'N/A'}</div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>Frecuencia de Reajuste</div>
                <div style={styles.value}>{contrato.frecuencia_reajuste || 'N/A'}</div>
              </div>
              
              <div style={styles.group}>
                <div style={styles.label}>Fecha del Próximo Reajuste</div>
                <div style={styles.value}>{formatDate(contrato.fecha_proximo_reajuste)}</div>
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <p>No se encontraron datos para este contrato.</p>
            </div>
          )}
        </div>
        
        <div style={styles.actions}>
          <button 
            type="button" 
            style={styles.button}
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContratoViewModal;