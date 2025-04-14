import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { createContrato, getTransportistas } from '../services/adminService';
import '../styles/AdminStyle.css';

interface NuevoContratoModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface TransportistaAPI {
  transportista_id: number;
  nombre_transportista: string;
  rut_transportista: string;
  direccion_transportista: string;
  fecha_creacion: string;
  ultima_actualizacion: string;
}

const NuevoContratoModal: React.FC<NuevoContratoModalProps> = ({ 
  show, 
  onClose,
  onSave
}) => {
  const [transportistas, setTransportistas] = useState<TransportistaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    transportista_id: '',
    es_spot: 'false',
    fecha_fin: '',
    tipo_reajuste: 'Sin reajuste',
    frecuencia_reajuste: 'Sin reajuste',
    fecha_proximo_reajuste: '',
    documento: null as File | null
  });

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(null);
      fetchTransportistas();
    }
  }, [show]);

  const fetchTransportistas = async () => {
    setLoading(true);
    try {
      const data = await getTransportistas();
      setTransportistas(data as unknown as TransportistaAPI[]);
    } catch (err) {
      console.error('Error al cargar transportistas:', err);
      setError('No se pudieron cargar los transportistas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        documento: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('transportista_id', formData.transportista_id);
      formDataToSend.append('es_spot', formData.es_spot);
      formDataToSend.append('fecha_fin', formData.fecha_fin);
      formDataToSend.append('tipo_reajuste', formData.tipo_reajuste);
      formDataToSend.append('frecuencia_reajuste', formData.frecuencia_reajuste);
      formDataToSend.append('fecha_proximo_reajuste', formData.fecha_proximo_reajuste);
      
      if (formData.documento) {
        formDataToSend.append('documento', formData.documento);
      }

      await createContrato(formDataToSend);
      setSuccess('Contrato creado exitosamente');

      setFormData({
        transportista_id: '',
        es_spot: 'false',
        fecha_fin: '',
        tipo_reajuste: 'Sin reajuste',
        frecuencia_reajuste: 'Sin reajuste',
        fecha_proximo_reajuste: '',
        documento: null
      });
      
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      console.error('Error al crear contrato:', err);
      setError('Error al crear el contrato. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ width: '600px', maxWidth: '90%' }}>
        <div className="modal-header" style={{ 
          backgroundColor: '#243c6c', 
          color: '#ffffff',
          padding: '15px 30px'
        }}>
          <h3 id="contratoModalTitle" style={{ color: '#ffffff', margin: 0 }}>Crear Nuevo Contrato</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            style={{ color: '#ffffff', fontSize: '24px' }}
          >
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ padding: '20px 30px' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="transportista_id">Transportista:</label>
              <select
                id="transportista_id"
                name="transportista_id"
                className="form-control"
                value={formData.transportista_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione un transportista</option>
                {transportistas.map(t => (
                  <option key={t.transportista_id} value={t.transportista_id}>
                    {`${t.transportista_id} - ${t.nombre_transportista}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="es_spot">¿Es Spot?</label>
              <select
                id="es_spot"
                name="es_spot"
                className="form-control"
                value={formData.es_spot}
                onChange={handleInputChange}
                required
              >
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="fecha_fin">Fecha Fin:</label>
              <input
                type="date"
                id="fecha_fin"
                name="fecha_fin"
                className="form-control"
                value={formData.fecha_fin}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="tipo_reajuste">Tipo de Reajuste:</label>
              <select
                id="tipo_reajuste"
                name="tipo_reajuste"
                className="form-control"
                value={formData.tipo_reajuste}
                onChange={handleInputChange}
                required
              >
                <option value="Sin reajuste">Sin reajuste</option>
                <option value="Por polinomio">Por polinomio</option>
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="frecuencia_reajuste">Frecuencia de Reajuste:</label>
              <select
                id="frecuencia_reajuste"
                name="frecuencia_reajuste"
                className="form-control"
                value={formData.frecuencia_reajuste}
                onChange={handleInputChange}
                required
              >
                <option value="Sin reajuste">Sin reajuste</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="fecha_proximo_reajuste">Fecha Próximo Reajuste:</label>
              <input
                type="date"
                id="fecha_proximo_reajuste"
                name="fecha_proximo_reajuste"
                className="form-control"
                value={formData.fecha_proximo_reajuste}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="documento">Documento Respaldo:</label>
              <input
                type="file"
                id="documento"
                name="documento"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>
          </form>
        </div>
        <div className="modal-footer" style={{ padding: '15px 30px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn form-button-primary modal-save-button" 
            onClick={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: '#243c6c',
              color: '#ffffff',
              fontWeight: '500',
              minWidth: '160px',
              padding: '8px 16px'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevoContratoModal;