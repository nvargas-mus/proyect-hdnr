import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const SolicitudCompletionForm: React.FC<SolicitudCompletionFormProps> = ({
  solicitudId,
  requiereTransporte
}) => {
  const navigate = useNavigate();

  const [residuos, setResiduos] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [tiposTransporte, setTiposTransporte] = useState<any[]>([]);
  const [capacidades, setCapacidades] = useState<any[]>([]);

  const [residuosSeleccionados, setResiduosSeleccionados] = useState<
    {
      codigo_material_matnr_residuo: string;
      cantidad_declarada: string;
      unidad_medida_id_residuo: string;
    }[]
  >([
    {
      codigo_material_matnr_residuo: '',
      cantidad_declarada: '',
      unidad_medida_id_residuo: ''
    }
  ]);

  const [formData, setFormData] = useState({
    codigo_material_matnr_servicio: '',
    cantidad_servicio: '',
    unidad_venta_kmein: '',
    tipo_transporte_id: '',
    capacidad_id: '',
    unidad_medida_id_transport: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      } catch (error) {
        console.error('Error al cargar datos:', error);
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
    const foundServicio = servicios.find(
      (s) => String(s.material_matnr) === selectedCode
    );
    const unidadVenta = foundServicio ? foundServicio.unidad_venta_kmein : '';
    setFormData({
      ...formData,
      codigo_material_matnr_servicio: selectedCode,
      unidad_venta_kmein: unidadVenta
    });
  };

  const handleCapacidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCapacidadId = e.target.value;
    const foundCapacidad = capacidades.find(
      (c) => String(c.capacidad_id) === selectedCapacidadId
    );
    const unidadMedida = foundCapacidad ? foundCapacidad.unidad_medida_id : '';
    setFormData({
      ...formData,
      capacidad_id: selectedCapacidadId,
      unidad_medida_id_transport: unidadMedida
    });
  };

  const handleResiduosChange = (
    index: number,
    field: 'codigo_material_matnr_residuo' | 'cantidad_declarada' | 'unidad_medida_id_residuo',
    value: string
  ) => {
    setResiduosSeleccionados((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddResiduosRow = () => {
    setResiduosSeleccionados((prev) => [
      ...prev,
      {
        codigo_material_matnr_residuo: '',
        cantidad_declarada: '',
        unidad_medida_id_residuo: ''
      }
    ]);
  };

  const handleRemoveResiduosRow = (index: number) => {
    setResiduosSeleccionados((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const atLeastOne = residuosSeleccionados.some(
        (row) => row.codigo_material_matnr_residuo
      );
      if (!atLeastOne) {
        alert('Debes seleccionar al menos un residuo.');
        return;
      }

      for (const row of residuosSeleccionados) {
        if (!row.codigo_material_matnr_residuo) continue;
        const dataToSend = {
          solicitud_id: solicitudId,
          codigo_material_matnr: Number(row.codigo_material_matnr_residuo),
          cantidad_declarada: Number(row.cantidad_declarada),
          unidad_medida_id: Number(row.unidad_medida_id_residuo)
        };
        await crearSolicitudMateriales(dataToSend);
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error al completar la solicitud:', err);
      alert('Error al completar la solicitud. Verifique los datos e intente nuevamente.');
    }
  };

  const handleSuccessOK = () => {
    setShowSuccessModal(false);
    navigate('/home');
  };

  return (
    <div className="container mt-5">
      {/* Card principal */}
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <h3 className="card-title text-center">
              Completar Solicitud (ID: {solicitudId})
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Bloques de Residuos */}
              <h4>Información de Residuos</h4>

              {residuosSeleccionados.map((row, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #f9f9f9',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9f9',
                    padding: '10px',
                    marginBottom: '10px'
                  }}
                >
                  {/* Select para el residuo */}
                  <div className="mb-3">
                    <label className="form-label">
                      Código Material Residuo:
                    </label>
                    <select
                      className="form-select"
                      value={row.codigo_material_matnr_residuo}
                      onChange={(e) =>
                        handleResiduosChange(
                          index,
                          'codigo_material_matnr_residuo',
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value="">Seleccione un residuo</option>
                      {residuos.map((r, i) => (
                        <option key={i} value={r.material_matnr}>
                          {r.material_matnr} - {r.nombre_material_maktg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cantidad declarada */}
                  <div className="mb-3">
                    <label className="form-label">
                      Cantidad Declarada:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={row.cantidad_declarada}
                      onChange={(e) =>
                        handleResiduosChange(index, 'cantidad_declarada', e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Unidad de medida de residuo */}
                  <div className="mb-3">
                    <label className="form-label">
                      Unidad Medida Residuo:
                    </label>
                    <select
                      className="form-select"
                      value={row.unidad_medida_id_residuo}
                      onChange={(e) =>
                        handleResiduosChange(index, 'unidad_medida_id_residuo', e.target.value)
                      }
                      required
                    >
                      <option value="">Seleccione</option>
                      {unidades.map((uni, i) => (
                        <option key={i} value={uni.unidad_medida_id}>
                          {uni.nombre_unidad}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botón para eliminar esta fila */}
                  {residuosSeleccionados.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveResiduosRow(index)}
                    >
                      Eliminar residuo
                    </button>
                  )}
                </div>
              ))}

              {/* Botón "Agregar otro residuo" */}
              <button
                type="button"
                className="btn btn-secondary mb-4"
                onClick={handleAddResiduosRow}
              >
                + Agregar otro residuo
              </button>

              {/* Sección de Servicio o Transporte */}
              {requiereTransporte ? (
                <>
                  <h4>Información de Servicio</h4>
                  <div className="mb-3">
                    <label
                      htmlFor="codigo_material_matnr_servicio"
                      className="form-label"
                    >
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
                      {servicios.map((item, idx) => (
                        <option key={idx} value={item.material_matnr}>
                          {item.material_matnr} - {item.nombre_material_maktg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="cantidad_servicio"
                      className="form-label"
                    >
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
                    <label
                      htmlFor="unidad_venta_kmein"
                      className="form-label"
                    >
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
                      {tiposTransporte.map((tipo) => (
                        <option
                          key={tipo.tipo_transporte_id}
                          value={tipo.tipo_transporte_id}
                        >
                          {tipo.nombre_tipo_transporte}
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
                      {capacidades.map((cap) => (
                        <option
                          key={cap.capacidad_id}
                          value={cap.capacidad_id}
                        >
                          {cap.valor_capacidad} (UM: {cap.unidad_medida_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="unidad_medida_id_transport"
                      className="form-label"
                    >
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

              {/* Botón para enviar */}
              <button type="submit" className="btn btn-primary w-100">
                Completar Solicitud
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Botón para volver */}
      <div className="d-flex justify-content-start mt-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>

      {/* Modal de Éxito */}
      {showSuccessModal && (
  <>
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">

        <div className="modal-content border-0">

          <div className="modal-header border-bottom-0">
            <h5 className="modal-title">Solicitud Creada con Éxito</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleSuccessOK}
            ></button>
          </div>

          <div className="modal-body border-top-0">
            <p>La solicitud ha sido completada exitosamente.</p>
          </div>

          <div className="modal-footer border-top-0">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSuccessOK}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="modal-backdrop fade show"></div>
  </>
)}
    </div>
  );
};
export default SolicitudCompletionForm;




