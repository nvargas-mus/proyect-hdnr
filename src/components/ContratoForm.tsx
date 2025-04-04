import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getContratoById, 
  createContrato, 
  updateContrato, 
  getTransportistas,
  Transportista 
} from '../services/adminService';
import '../styles/AdminStyle.css';

interface ContratoFormData {
  transportista_id: number | null;
  es_spot: boolean;
  documento_respaldo: File | null;
  fecha_fin: string;
  tipo_reajuste: string;
  frecuencia_reajuste: string;
  fecha_proximo_reajuste: string;
}

const ContratoForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<ContratoFormData>({
    transportista_id: null,
    es_spot: false,
    documento_respaldo: null,
    fecha_fin: '',
    tipo_reajuste: '',
    frecuencia_reajuste: '',
    fecha_proximo_reajuste: '',
  });
  
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
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
        // Cargar transportistas
        const transportistasData = await getTransportistas();
        setTransportistas(transportistasData);
        
        if (isEditing && id) {
          const contratoData = await getContratoById(parseInt(id));
          
          setFormData({
            transportista_id: contratoData.transportista_id,
            es_spot: contratoData.es_spot,
            documento_respaldo: null,
            fecha_fin: contratoData.fecha_fin || '',
            tipo_reajuste: contratoData.tipo_reajuste || '',
            frecuencia_reajuste: contratoData.frecuencia_reajuste || '',
            fecha_proximo_reajuste: contratoData.fecha_proximo_reajuste || '',
          });
          if (contratoData.documento_respaldo) {
            setOriginalFileName(contratoData.documento_respaldo.split('/').pop() || 'documento');
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);

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
      
      if (formData.transportista_id) {
        formDataToSend.append('transportista_id', formData.transportista_id.toString());
      }
      formDataToSend.append('es_spot', formData.es_spot.toString());
      
      if (formData.documento_respaldo) {
        formDataToSend.append('documento_respaldo', formData.documento_respaldo);
      }
      
      if (formData.fecha_fin) {
        formDataToSend.append('fecha_fin', formData.fecha_fin);
      }
      
      if (formData.tipo_reajuste) {
        formDataToSend.append('tipo_reajuste', formData.tipo_reajuste);
      }
      
      if (formData.frecuencia_reajuste) {
        formDataToSend.append('frecuencia_reajuste', formData.frecuencia_reajuste);
      }
      
      if (formData.fecha_proximo_reajuste) {
        formDataToSend.append('fecha_proximo_reajuste', formData.fecha_proximo_reajuste);
      }
      
      if (isEditing && id) {
        await updateContrato(parseInt(id), formDataToSend);
        alert('Contrato actualizado con éxito');
      } else {
        await createContrato(formDataToSend);
        alert('Contrato creado con éxito');
      }
      
      navigate('/admin');
    } catch (err) {
      console.error('Error al guardar el contrato:', err);
      setError('Error al guardar el contrato. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.transportista_id) {
    return <div className="text-center p-5">Cargando...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>{isEditing ? 'Editar Contrato' : 'Crear Nuevo Contrato'}</h2>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Transportista */}
          <div className="form-group">
            <label htmlFor="transportista_id">Transportista *</label>
            <select
              id="transportista_id"
              name="transportista_id"
              className="form-control"
              value={formData.transportista_id || ''}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un transportista</option>
              {transportistas.map(t => (
                <option key={t.id} value={t.id}>
                  {`${t.id} - ${t.nombre}`} {t.rut ? `(${t.rut})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Es Spot */}
          <div className="form-group">
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="es_spot"
                name="es_spot"
                checked={formData.es_spot}
                onChange={handleChange}
              />
              <label className="custom-control-label" htmlFor="es_spot">
                ¿Es un contrato Spot?
              </label>
            </div>
          </div>
          
          {/* Documento Respaldo */}
          <div className="form-group">
            <label htmlFor="documento_respaldo">Documento de Respaldo</label>
            <input
              type="file"
              className="form-control-file"
              id="documento_respaldo"
              name="documento_respaldo"
              onChange={handleChange}
            />
            {originalFileName && (
              <small className="form-text text-muted">
                Documento actual: {originalFileName}
              </small>
            )}
          </div>
          
          {/* Fecha Fin */}
          <div className="form-group">
            <label htmlFor="fecha_fin">Fecha de Fin</label>
            <input
              type="date"
              className="form-control"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
            />
          </div>
          
          {/* Tipo Reajuste */}
          <div className="form-group">
            <label htmlFor="tipo_reajuste">Tipo de Reajuste</label>
            <select
              className="form-control"
              id="tipo_reajuste"
              name="tipo_reajuste"
              value={formData.tipo_reajuste}
              onChange={handleChange}
            >
              <option value="">Seleccione tipo de reajuste</option>
              {tiposReajuste.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Frecuencia Reajuste */}
          <div className="form-group">
            <label htmlFor="frecuencia_reajuste">Frecuencia de Reajuste</label>
            <select
              className="form-control"
              id="frecuencia_reajuste"
              name="frecuencia_reajuste"
              value={formData.frecuencia_reajuste}
              onChange={handleChange}
            >
              <option value="">Seleccione frecuencia</option>
              {frecuenciasReajuste.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Fecha Próximo Reajuste */}
          <div className="form-group">
            <label htmlFor="fecha_proximo_reajuste">Fecha del Próximo Reajuste</label>
            <input
              type="date"
              className="form-control"
              id="fecha_proximo_reajuste"
              name="fecha_proximo_reajuste"
              value={formData.fecha_proximo_reajuste}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group mt-4">
            <button 
              type="submit" 
              className="btn form-button-primary mr-2"
              disabled={loading}
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar Contrato' : 'Crear Contrato'}
            </button>
            <button
              type="button"
              className="btn form-button-outline"
              onClick={() => navigate('/admin')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContratoForm;