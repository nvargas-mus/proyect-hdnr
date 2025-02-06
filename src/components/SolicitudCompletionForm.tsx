import React, { useState, useEffect } from 'react';
import { 
  getMaterialesResiduos, 
  getMaterialesServicios, 
  getUnidadesReferenciales, 
  getTiposTransporte, 
  getCapacidadesTransporte, 
  completarSolicitud 
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
        console.error('Error al cargar los datos para completar la solicitud:', err);
      }
    };

    fetchData();
  }, [solicitudId, requiereTransporte]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleServicioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedServicio = servicios.find(s => String(s.matnr) === selectedCode);
    const unidadVenta = selectedServicio ? selectedServicio.unidad_venta_kmein : '';
    setFormData({...formData, codigo_material_matnr_servicio: selectedCode, unidad_venta_kmein: unidadVenta});
  };

  const handleCapacidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCapacidadId = e.target.value;
    const selectedCapacidad = capacidades.find(c => String(c.id) === selectedCapacidadId);
    const unidadMedida = selectedCapacidad ? selectedCapacidad.unidad_medida_id : '';
    setFormData({...formData, capacidad_id: selectedCapacidadId, unidad_medida_id_transport: unidadMedida});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        solicitud_id: solicitudId,
        codigo_material_matnr_residuo: formData.codigo_material_matnr_residuo,
        cantidad_declarada: formData.cantidad_declarada,
        unidad_medida_id_residuo: formData.unidad_medida_id_residuo,
        ...(requiereTransporte
          ? {
              codigo_material_matnr_servicio: formData.codigo_material_matnr_servicio,
              cantidad_servicio: formData.cantidad_servicio,
              unidad_venta_kmein: formData.unidad_venta_kmein,
            }
          : {
              tipo_transporte_id: formData.tipo_transporte_id,
              capacidad_id: formData.capacidad_id,
              unidad_medida_id_transport: formData.unidad_medida_id_transport,
            })
      };

      await completarSolicitud(dataToSend);
      alert('Solicitud completada exitosamente.');
    } catch (err) {
      console.error('Error al completar la solicitud:', err);
      alert('Error al completar la solicitud. Verifica los datos e intenta nuevamente.');
    }
  };

  return (
    <div>
      <h2>Completar Solicitud</h2>
      <form onSubmit={handleSubmit}>
        {/* Campo oculto para solicitud_id */}
        <input type="hidden" name="solicitud_id" value={solicitudId} />

        <h3>Información de Residuo</h3>
        <div>
          <label>Código Material Residuo:</label>
          <select
            name="codigo_material_matnr_residuo"
            value={formData.codigo_material_matnr_residuo}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {residuos.map((item) => (
              <option key={item.matnr} value={item.matnr}>
                {item.matnr} - {item.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Cantidad Declarada:</label>
          <input
            type="number"
            step="0.01"
            name="cantidad_declarada"
            value={formData.cantidad_declarada}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Unidad Medida Residuo:</label>
          <select
            name="unidad_medida_id_residuo"
            value={formData.unidad_medida_id_residuo}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {unidades.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.descripcion}
              </option>
            ))}
          </select>
        </div>

        {requiereTransporte ? (
          <>
            <h3>Información de Servicio</h3>
            <div>
              <label>Código Material Servicio:</label>
              <select
                name="codigo_material_matnr_servicio"
                value={formData.codigo_material_matnr_servicio}
                onChange={handleServicioChange}
                required
              >
                <option value="">Seleccione</option>
                {servicios.map((item) => (
                  <option key={item.matnr} value={item.matnr}>
                    {item.matnr} - {item.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Cantidad Servicio:</label>
              <input
                type="number"
                step="0.01"
                name="cantidad_servicio"
                value={formData.cantidad_servicio}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Unidad de Venta (automático):</label>
              <input
                type="text"
                name="unidad_venta_kmein"
                value={formData.unidad_venta_kmein}
                readOnly
              />
            </div>
          </>
        ) : (
          <>
            <h3>Información de Transporte</h3>
            <div>
              <label>Tipo de Transporte:</label>
              <select
                name="tipo_transporte_id"
                value={formData.tipo_transporte_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione</option>
                {tiposTransporte.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Capacidad:</label>
              <select
                name="capacidad_id"
                value={formData.capacidad_id}
                onChange={handleCapacidadChange}
                required
              >
                <option value="">Seleccione</option>
                {capacidades.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Unidad Medida Transporte (automático):</label>
              <input
                type="text"
                name="unidad_medida_id_transport"
                value={formData.unidad_medida_id_transport}
                readOnly
              />
            </div>
          </>
        )}
        <button type="submit">Completar Solicitud</button>
      </form>
    </div>
  );
};

export default SolicitudCompletionForm;
