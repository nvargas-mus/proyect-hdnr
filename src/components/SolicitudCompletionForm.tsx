import React, { useState, useEffect } from 'react';
import { 
  getMaterialesResiduos, 
  getMaterialesServicios, 
  getUnidadesReferenciales, 
  getTiposTransporte, 
  getCapacidadesTransporte, 
  crearSolicitudMateriales 
} from '../services/solicitudService';

interface SolicitudCompletionFormProps {
  solicitudId: number;
  requiereTransporte: boolean;
}

const SolicitudCompletionForm: React.FC<SolicitudCompletionFormProps> = ({ solicitudId, requiereTransporte }) => {
  const [residuos, setResiduos] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [tiposTransporte, setTiposTransporte] = useState<any[]>([]);
  const [capacidades, setCapacidades] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    codigo_material_matnr_residuo: '',
    cantidad_declarada: '',
    unidad_medida_id_residuo: '',
    codigo_material_matnr_servicio: '',
    cantidad_servicio: '',
    unidad_venta_kmein: '',
    tipo_transporte_id: '',
    capacidad_id: '',
    unidad_medida_id_transport: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const residuosData = await getMaterialesResiduos(solicitudId);
        setResiduos(residuosData);
        const unidadesData = await getUnidadesReferenciales();
        setUnidades(unidadesData);
    
        if (requiereTransporte) {
          const serviciosData = await getMaterialesServicios(solicitudId);
          setServicios(serviciosData);
        } else {
          const tiposData = await getTiposTransporte();
          setTiposTransporte(tiposData);
          const capacidadesData = await getCapacidadesTransporte();
          setCapacidades(capacidadesData);
        }
      } catch (err) {
        console.error("Error al cargar los datos:", err);
      }
    };
    
    fetchData();
  }, [solicitudId, requiereTransporte]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServicioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedServicio = servicios.find(s => String(s.material_matnr) === selectedCode);
    const unidadVenta = selectedServicio ? selectedServicio.unidad_venta_kmein : '';
    setFormData({ ...formData, codigo_material_matnr_servicio: selectedCode, unidad_venta_kmein: unidadVenta });
  };

  const handleCapacidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCapacidadId = e.target.value;
    const selectedCapacidad = capacidades.find(c => String(c.id) === selectedCapacidadId);
    const unidadMedida = selectedCapacidad ? selectedCapacidad.unidad_medida_id : '';
    setFormData({ ...formData, capacidad_id: selectedCapacidadId, unidad_medida_id_transport: unidadMedida });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        solicitud_id: solicitudId,
        codigo_material_matnr: Number(formData.codigo_material_matnr_residuo),
        cantidad_declarada: Number(formData.cantidad_declarada),
        unidad_medida_id: Number(formData.unidad_medida_id_residuo)
      };

      await crearSolicitudMateriales(dataToSend);
      alert('Solicitud completada exitosamente.');
    } catch (err) {
      console.error('Error al completar la solicitud:', err);
      alert('Error al completar la solicitud. Verifica los datos e intenta nuevamente.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <h3 className="card-title text-center">
              Completar Solicitud (ID: {solicitudId})
            </h3>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="solicitud_id" value={solicitudId} />

              <h4>Información de Residuo</h4>
              <div className="mb-3">
                <label htmlFor="codigo_material_matnr_residuo" className="form-label">
                  Código Material Residuo:
                </label>
                <select
                  name="codigo_material_matnr_residuo"
                  className="form-select"
                  value={formData.codigo_material_matnr_residuo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione</option>
                  {residuos.map((item, index) => (
                    <option key={`${item.material_matnr}-${index}`} value={item.material_matnr}>
                      {item.material_matnr} - {item.nombre_material_maktg}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="cantidad_declarada" className="form-label">
                  Cantidad Declarada:
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cantidad_declarada"
                  className="form-control"
                  value={formData.cantidad_declarada}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="unidad_medida_id_residuo" className="form-label">
                  Unidad Medida Residuo:
                </label>
                <select
                  name="unidad_medida_id_residuo"
                  className="form-select"
                  value={formData.unidad_medida_id_residuo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione</option>
                  {unidades.map((uni, index) => (
                    <option key={`${uni.unidad_medida_id}-${index}`} value={uni.unidad_medida_id}>
                      {uni.nombre_unidad}
                    </option>
                  ))}
                </select>
              </div>

              {requiereTransporte ? (
                <>
                  <h4>Información de Servicio</h4>
                  <div className="mb-3">
                    <label htmlFor="codigo_material_matnr_servicio" className="form-label">
                      Código Material Servicio:
                    </label>
                    <select
                      name="codigo_material_matnr_servicio"
                      className="form-select"
                      value={formData.codigo_material_matnr_servicio}
                      onChange={handleServicioChange}
                      required
                    >
                      <option value="">Seleccione</option>
                      {servicios.map((item, index) => (
                        <option key={`${item.material_matnr}-${index}`} value={item.material_matnr}>
                          {item.material_matnr} - {item.nombre_material_maktg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cantidad_servicio" className="form-label">
                      Cantidad Servicio:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cantidad_servicio"
                      className="form-control"
                      value={formData.cantidad_servicio}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="unidad_venta_kmein" className="form-label">
                      Unidad de Venta (automático):
                    </label>
                    <input
                      type="text"
                      name="unidad_venta_kmein"
                      className="form-control"
                      value={formData.unidad_venta_kmein}
                      readOnly
                    />
                  </div>
                </>
              ) : (
                <>
                  <h4>Información de Transporte</h4>
                  <div className="mb-3">
                    <label htmlFor="tipo_transporte_id" className="form-label">
                      Tipo de Transporte:
                    </label>
                    <select
                      name="tipo_transporte_id"
                      className="form-select"
                      value={formData.tipo_transporte_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione</option>
                      {tiposTransporte.map((item, index) => (
                        <option key={`${item.id}-${index}`} value={item.id}>
                          {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="capacidad_id" className="form-label">
                      Capacidad:
                    </label>
                    <select
                      name="capacidad_id"
                      className="form-select"
                      value={formData.capacidad_id}
                      onChange={handleCapacidadChange}
                      required
                    >
                      <option value="">Seleccione</option>
                      {capacidades.map((item, index) => (
                        <option key={`${item.id}-${index}`} value={item.id}>
                          {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="unidad_medida_id_transport" className="form-label">
                      Unidad Medida Transporte (automático):
                    </label>
                    <input
                      type="text"
                      name="unidad_medida_id_transport"
                      className="form-control"
                      value={formData.unidad_medida_id_transport}
                      readOnly
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary w-100">
                Completar Solicitud
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudCompletionForm;





