import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminStyle.css';

interface TarifaFormData {
  contrato_id: number;
  descripcion_tarifa: string;
  tipo_transporte_id: number;
  tarifa_inicial: number;
  tarifa_actual: number;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string;
}

interface TipoTransporte {
  id: number;
  nombre: string;
}

const API_URL = 'http://15.229.249.223:3000';
const getToken = () => localStorage.getItem('authToken') || '';

const TarifaForm = () => {
  const { contratoId, tarifaId } = useParams<{ contratoId?: string; tarifaId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!tarifaId;
  
  const [formData, setFormData] = useState<TarifaFormData>({
    contrato_id: contratoId ? parseInt(contratoId) : 0,
    descripcion_tarifa: '',
    tipo_transporte_id: 0,
    tarifa_inicial: 0,
    tarifa_actual: 0,
    fecha_inicio_vigencia: '',
    fecha_fin_vigencia: '',
  });
  
  const [tiposTransporte, setTiposTransporte] = useState<TipoTransporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getToken();
        
        const tiposResponse = await axios.get(`${API_URL}/tiposTransporte`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        setTiposTransporte(tiposResponse.data);
        
        if (isEditing && tarifaId) {
          const tarifaResponse = await axios.get(`${API_URL}/tarifario_contrato/${tarifaId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          const tarifaData = tarifaResponse.data;
          
          setFormData({
            contrato_id: tarifaData.contrato_id,
            descripcion_tarifa: tarifaData.descripcion_tarifa,
            tipo_transporte_id: tarifaData.tipo_transporte_id,
            tarifa_inicial: tarifaData.tarifa_inicial,
            tarifa_actual: tarifaData.tarifa_actual,
            fecha_inicio_vigencia: tarifaData.fecha_inicio_vigencia ? tarifaData.fecha_inicio_vigencia.split('T')[0] : '',
            fecha_fin_vigencia: tarifaData.fecha_fin_vigencia ? tarifaData.fecha_fin_vigencia.split('T')[0] : '',
          });
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isEditing, tarifaId, contratoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value)
      });
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
      const token = getToken();
      
      if (isEditing && tarifaId) {
        await axios.put(`${API_URL}/tarifario_contrato/${tarifaId}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        alert('Tarifa actualizada con éxito');
      } else {
        await axios.post(`${API_URL}/tarifario_contrato`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        alert('Tarifa creada con éxito');
      }

      navigate(`/tarifas-contrato/${formData.contrato_id}`);
      
    } catch (err) {
      console.error('Error al guardar la tarifa:', err);
      setError('Error al guardar la tarifa. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !tiposTransporte.length) {
    return <div className="text-center p-5">Cargando...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>{isEditing ? 'Editar Tarifa' : 'Crear Nueva Tarifa'}</h2>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Descripción de Tarifa */}
          <div className="form-group">
            <label htmlFor="descripcion_tarifa">Descripción de la Tarifa *</label>
            <textarea
              id="descripcion_tarifa"
              name="descripcion_tarifa"
              className="form-control"
              value={formData.descripcion_tarifa}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>
          
          {/* Tipo de Transporte */}
          <div className="form-group">
            <label htmlFor="tipo_transporte_id">Tipo de Transporte *</label>
            <select
              id="tipo_transporte_id"
              name="tipo_transporte_id"
              className="form-control"
              value={formData.tipo_transporte_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un tipo de transporte</option>
              {tiposTransporte.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tarifa Inicial */}
          <div className="form-group">
            <label htmlFor="tarifa_inicial">Tarifa Inicial (CLP) *</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">$</span>
              </div>
              <input
                type="number"
                id="tarifa_inicial"
                name="tarifa_inicial"
                className="form-control"
                value={formData.tarifa_inicial}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          
          {/* Tarifa Actual */}
          <div className="form-group">
            <label htmlFor="tarifa_actual">Tarifa Actual (CLP) *</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">$</span>
              </div>
              <input
                type="number"
                id="tarifa_actual"
                name="tarifa_actual"
                className="form-control"
                value={formData.tarifa_actual}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          
          {/* Fecha Inicio Vigencia */}
          <div className="form-group">
            <label htmlFor="fecha_inicio_vigencia">Fecha de Inicio de Vigencia *</label>
            <input
              type="date"
              id="fecha_inicio_vigencia"
              name="fecha_inicio_vigencia"
              className="form-control"
              value={formData.fecha_inicio_vigencia}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Fecha Fin Vigencia */}
          <div className="form-group">
            <label htmlFor="fecha_fin_vigencia">Fecha de Fin de Vigencia</label>
            <input
              type="date"
              id="fecha_fin_vigencia"
              name="fecha_fin_vigencia"
              className="form-control"
              value={formData.fecha_fin_vigencia}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group mt-4">
            <button 
              type="submit" 
              className="btn form-button-primary mr-2"
              disabled={loading}
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar Tarifa' : 'Crear Tarifa'}
            </button>
            <button
              type="button"
              className="btn form-button-outline"
              onClick={() => navigate(`/tarifas-contrato/${formData.contrato_id}`)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TarifaForm;