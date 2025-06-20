import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getClientesAsociados, 
  getDireccionesCliente, 
  createAsignacionTarifa,
  ClienteAsociado,
  DireccionCliente,
  AsignacionTarifaData,
  getMaterialesCliente
} from '../services/adminService';
import '../styles/AdminStyle.css';

export interface Material {
  material_matnr: number;
  nombre_material_maktg: string;
}


const AsignacionTarifaPage = () => {
  const { tarifaId } = useParams<{ tarifaId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<AsignacionTarifaData>({
    codigo_cliente_kunnr: 0,
    direccion_id: 0,
    codigo_material_matnr: 0,
    tarifario_contrato_id: parseInt(tarifaId || '0')
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AsignacionTarifaData, string>>>({});

  const [clientes, setClientes] = useState<ClienteAsociado[]>([]);
  const [direcciones, setDirecciones] = useState<DireccionCliente[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteDisplay, setClienteDisplay] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientesData = await getClientesAsociados(clienteSearch);
        setClientes(clientesData);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        setErrorMessage('Error al cargar la lista de clientes. Por favor, intenta nuevamente.');
      }
    };

    fetchClientes();
  }, [clienteSearch]);

  useEffect(() => {
    const fetchDirecciones = async () => {
      if (formData.codigo_cliente_kunnr) {
        try {
          const direccionesData = await getDireccionesCliente(formData.codigo_cliente_kunnr);
          setDirecciones(direccionesData);
        } catch (error) {
          console.error('Error al cargar direcciones:', error);
          setErrorMessage('Error al cargar las direcciones del cliente. Por favor, intenta nuevamente.');
          setDirecciones([]);
        }
      } else {
        setDirecciones([]);
      }
    };

    fetchDirecciones();
  }, [formData.codigo_cliente_kunnr]);

  useEffect(() => {
  const fetchMateriales = async () => {
    if (formData.codigo_cliente_kunnr) {
      try {
        const materialesData = await getMaterialesCliente(formData.codigo_cliente_kunnr);
        setMateriales(materialesData);
      } catch (error) {
        console.error('Error al cargar materiales:', error);
        setMateriales([]);
      }
    } else {
      setMateriales([]);
    }
  };

  fetchMateriales();
}, [formData.codigo_cliente_kunnr]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let parsedValue: string | number = value;
    if (['codigo_cliente_kunnr', 'direccion_id', 'codigo_material_matnr'].includes(name)) {
      parsedValue = value === '' ? 0 : Number(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    if (formErrors[name as keyof AsignacionTarifaData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AsignacionTarifaData, string>> = {};
    
    if (!formData.codigo_cliente_kunnr) {
      errors.codigo_cliente_kunnr = 'Debe seleccionar un cliente';
    }
    
    if (!formData.direccion_id) {
      errors.direccion_id = 'Debe seleccionar una dirección';
    }
    
    if (!formData.codigo_material_matnr) {
      errors.codigo_material_matnr = 'Debe seleccionar un material';
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
    setErrorMessage(null);
    
    try {
      await createAsignacionTarifa(formData);
      setSuccessMessage('¡Asignación creada exitosamente!');

      setTimeout(() => {
        navigate(-1);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error al crear asignación:', err);
      setErrorMessage('Error al crear la asignación: ' + (err.response?.data?.message || err.message || 'Por favor, intenta nuevamente.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Asignar Tarifa a Cliente</h3>
          <button 
            className="btn form-button-outline" 
            onClick={handleCancel}
          >
            <i className="fa fa-arrow-left mr-1"></i> Volver
          </button>
        </div>
        
        <div className="card-body">
          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="alert alert-danger">
              {errorMessage}
            </div>
          )}
          
          <div className="row mb-4">
            <div className="col-12">
              <div className="detail-item">
                <span className="detail-label">ID Tarifa:</span>
                <span className="detail-value">{tarifaId}</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Campo de autocompletado para Cliente */}
            <div className="mb-3">
              <label htmlFor="codigo_cliente_kunnr" className="form-label">
                Cliente <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${formErrors.codigo_cliente_kunnr ? 'error' : ''}`}
                list="clientesList"
                id="codigo_cliente_kunnr"
                placeholder="Escribe para buscar..."
                value={clienteDisplay}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setClienteSearch(inputValue);
                  setClienteDisplay(inputValue);
                  const parts = inputValue.split(' - ');
                  const code = parts[0] ? Number(parts[0]) : 0;
                  setFormData(prev => ({
                    ...prev,
                    codigo_cliente_kunnr: code,
                    direccion_id: 0,
                    codigo_material_matnr: 0
                  }));
                }}
                required
              />
              <datalist id="clientesList">
                {clientes.map((cliente) => (
                  <option
                    key={cliente.codigo_cliente_kunnr}
                    value={`${cliente.codigo_cliente_kunnr} - ${cliente.nombre_name1} - ${cliente.sucursal_name2}`}
                  />
                ))}
              </datalist>
              {formErrors.codigo_cliente_kunnr && (
                <div className="invalid-feedback" style={{display: 'block'}}>
                  {formErrors.codigo_cliente_kunnr}
                </div>
              )}
            </div>
            
            {/* Selección de Dirección */}
            <div className="mb-3">
              <label htmlFor="direccion_id" className="form-label">
                Dirección <span className="text-danger">*</span>
              </label>
              <select
                id="direccion_id"
                name="direccion_id"
                className={`form-control ${formErrors.direccion_id ? 'error' : ''}`}
                value={formData.direccion_id || ''}
                onChange={handleInputChange}
                disabled={!formData.codigo_cliente_kunnr}
                required
              >
                <option value="">Seleccione una dirección</option>
                {direcciones.map(dir => (
                  <option key={dir.direccion_id} value={dir.direccion_id}>
                    {dir.calle}, {dir.numero}, {dir.comuna}
                  </option>
                ))}
              </select>
              {formErrors.direccion_id && (
                <div className="invalid-feedback" style={{display: 'block'}}>
                  {formErrors.direccion_id}
                </div>
              )}
            </div>
            
            {/* Selección de Material */}
            <div className="mb-3">
              <label htmlFor="codigo_material_matnr" className="form-label">
                Material <span className="text-danger">*</span>
              </label>
              <select
                id="codigo_material_matnr"
                name="codigo_material_matnr"
                className={`form-control ${formErrors.codigo_material_matnr ? 'error' : ''}`}
                value={
                  formData.codigo_material_matnr === 0
                    ? ''
                    : formData.codigo_material_matnr.toString()
                }
                onChange={handleInputChange}
                disabled={!formData.codigo_cliente_kunnr}
                required
              >
                <option value="">Seleccione un material</option>
                {materiales.map((material) => (
                  <option
                    key={material.material_matnr}
                    value={material.material_matnr.toString()}
                  >
                    {material.material_matnr} - {material.nombre_material_maktg}
                  </option>
                ))}
              </select>
              {formErrors.codigo_material_matnr && (
                <div className="invalid-feedback" style={{ display: 'block' }}>
                  {formErrors.codigo_material_matnr}
                </div>
              )}
            </div>


            
            {/* Campo oculto para el ID de la tarifa */}
            <input
              type="hidden"
              name="tarifario_contrato_id"
              value={formData.tarifario_contrato_id}
            />
            
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn form-button-outline mr-2"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn form-button-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : 'Asignar Tarifa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AsignacionTarifaPage;