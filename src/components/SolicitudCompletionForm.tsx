import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMaterialesResiduos,
  getMaterialesServicios,
  getUnidadesReferenciales,
  getTiposTransporte,
  getCapacidadesTransporte,
  crearSolicitudMateriales,
  crearDetalleConTransporte,
  crearDetalleSinTransporte
} from '../services/solicitudService';
import '../styles/Form.css';
import '../styles/SolicitudesStyle.css';
import ReactDOM from 'react-dom';

interface SolicitudCompletionFormProps {
  solicitudId: number;
  requiereTransporte: boolean;
  onBack: () => void;
  onCompleted: () => void; 
}

const SolicitudCompletionForm: React.FC<SolicitudCompletionFormProps> = ({
  solicitudId,
  requiereTransporte,
  onBack,
  onCompleted,
}) => {

  const navigate = useNavigate();

  const [residuos, setResiduos] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [tiposTransporte, setTiposTransporte] = useState<any[]>([]);
  const [capacidades, setCapacidades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 

  const [residuosSeleccionados, setResiduosSeleccionados] = useState<
    {
      codigo_material_matnr_residuo: string;
      cantidad_declarada: string;
      unidad_medida_id_residuo: string;
    }[]
  >([
    { codigo_material_matnr_residuo: '', cantidad_declarada: '', unidad_medida_id_residuo: '' },
  ]);

  const [formData, setFormData] = useState({
    codigo_material_matnr_servicio: '',
    cantidad_servicio: '',
    unidad_venta_kmein: '',
    tipo_transporte_id: '',
    capacidad_id: '',
    unidad_medida_id_transport: '',
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const residuosData = await getMaterialesResiduos(solicitudId);
        setResiduos(residuosData);

        const unidadesData = await getUnidadesReferenciales();
        setUnidades(unidadesData);

        const serviciosData = await getMaterialesServicios(solicitudId);
        setServicios(serviciosData);

        const tiposData = await getTiposTransporte();
        setTiposTransporte(tiposData);

        const capacidadesData = await getCapacidadesTransporte();
        setCapacidades(capacidadesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setErrorMessage('Error al cargar datos iniciales. Por favor, intente nuevamente.');
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
    const foundServicio = servicios.find((s) => String(s.material_matnr) === selectedCode);
    const unidadVenta = foundServicio ? foundServicio.unidad_venta_kmein : '';
    setFormData({ ...formData, codigo_material_matnr_servicio: selectedCode, unidad_venta_kmein: unidadVenta });
  };

  const handleCapacidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCapacidadId = e.target.value;
    const foundCapacidad = capacidades.find((c) => String(c.capacidad_id) === selectedCapacidadId);
    const unidadMedida = foundCapacidad ? foundCapacidad.unidad_medida_id : '';
    setFormData({ ...formData, capacidad_id: selectedCapacidadId, unidad_medida_id_transport: unidadMedida });
  };

  const handleResiduosChange = (
    index: number,
    field: 'codigo_material_matnr_residuo' | 'cantidad_declarada' | 'unidad_medida_id_residuo',
    value: string
  ) => {
    setResiduosSeleccionados((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleAddResiduosRow = () => {
    setResiduosSeleccionados((prev) => [
      ...prev,
      { codigo_material_matnr_residuo: '', cantidad_declarada: '', unidad_medida_id_residuo: '' },
    ]);
  };

  const handleRemoveResiduosRow = (index: number) => {
    setResiduosSeleccionados((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage(null);

  try {
    const materiales: {
      codigo_material_matnr: number;
      cantidad_declarada: number;
      unidad_medida_id: number;
    }[] = [];

    for (const row of residuosSeleccionados) {
      if (!row.codigo_material_matnr_residuo.trim()) continue;

      let codeString = row.codigo_material_matnr_residuo;
      if (codeString.includes(' - ')) {
        codeString = codeString.split(' - ')[0].trim();
      }

      const codigo = Number(codeString);
      const cantidad = Number(row.cantidad_declarada);
      const unidad = Number(row.unidad_medida_id_residuo);

      if (isNaN(codigo) || isNaN(cantidad) || isNaN(unidad)) {
        setErrorMessage('Verifica que todos los campos de residuos sean válidos.');
        setLoading(false);
        return;
      }

      materiales.push({
        codigo_material_matnr: codigo,
        cantidad_declarada: cantidad,
        unidad_medida_id: unidad,
      });
    }

    if (materiales.length === 0) {
      setErrorMessage('Debes seleccionar al menos un residuo.');
      setLoading(false);
      return;
    }

    await crearSolicitudMateriales({
      solicitud_id: solicitudId,
      materiales,
    });

    if (requiereTransporte && formData.codigo_material_matnr_servicio) {
      let codigoServicio = formData.codigo_material_matnr_servicio;
      if (codigoServicio.includes(' - ')) {
        codigoServicio = codigoServicio.split(' - ')[0].trim();
      }

      const cantidadServicio = Number(formData.cantidad_servicio);

      if (
        isNaN(Number(codigoServicio)) ||
        isNaN(cantidadServicio) ||
        !formData.unidad_venta_kmein
      ) {
        setErrorMessage('Verifica que todos los campos de servicio sean válidos.');
        setLoading(false);
        return;
      }

      const detalleTransporte = {
        solicitud_id: solicitudId,
        codigo_material_matnr: Number(codigoServicio),
        unidad_venta_kmein: formData.unidad_venta_kmein,
        cantidad: cantidadServicio,
      };

      await crearDetalleConTransporte(detalleTransporte);
    } else {
      const tipo = Number(formData.tipo_transporte_id);
      const capacidad = Number(formData.capacidad_id);
      const unidad = Number(formData.unidad_medida_id_transport);

      if (isNaN(tipo) || isNaN(capacidad) || isNaN(unidad)) {
        setErrorMessage('Faltan datos para el detalle sin transporte.');
        setLoading(false);
        return;
      }

      await crearDetalleSinTransporte({
        solicitud_id: solicitudId,
        tipo_transporte_id: tipo,
        capacidad_id: capacidad,
        unidad_medida_id: unidad,
      });
    }

    onCompleted();

    setTimeout(() => {
      setShowSuccessModal(true);
    }, 1600);
  } catch (err: any) {
    console.error('Error al completar la solicitud:', err);
    setErrorMessage(
      `Error al completar la solicitud: ${err.message || 'Verifica los datos e intente nuevamente.'}`
    );
  } finally {
    setLoading(false);
  }
};

const unidadNombre = capacidades.find(
    (c) => c.unidad_medida_id === formData.unidad_medida_id_transport
  )?.nombre_unidad || formData.unidad_medida_id_transport;


  const handleSuccessOK = () => {
  setShowSuccessModal(false);
  
  const rol = localStorage.getItem('user_role');
  if (rol === 'admin') {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.reload();

  } else {
    navigate('/home');
  }
};

  return (
    <div className="container mt-0">
      <h3 className="card-title text-center">Completar Solicitud - ID de la solicitud: {solicitudId} </h3>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">

            
            {/* Mensaje de error */}
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="solicitud_id" value={solicitudId} />

              <h4>Información de Residuos</h4>
              {residuosSeleccionados.map((row, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #f9f9f9',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9f9',
                    padding: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label">Código Material Residuo:</label>
                    <input
                      type="text"
                      className="form-control"
                      list={`residuosList-${index}`}
                      value={row.codigo_material_matnr_residuo}
                      onChange={(e) =>
                        handleResiduosChange(index, 'codigo_material_matnr_residuo', e.target.value)
                      }
                      placeholder="Escribe para buscar..."
                      required
                    />
                    <datalist id={`residuosList-${index}`}>
                      {residuos.map((r, i) => (
                        <option key={i} value={`${r.material_matnr} - ${r.nombre_material_maktg}`} />
                      ))}
                    </datalist>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cantidad Declarada:</label>
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
                  <div className="mb-3">
                    <label className="form-label">Unidad Medida Residuo:</label>
                    <select
                      className="form-select"
                      value={row.unidad_medida_id_residuo}
                      onChange={(e) =>
                        handleResiduosChange(index, 'unidad_medida_id_residuo', e.target.value)
                      }
                      required
                    >
                      <option value="">Seleccione</option>
                      {unidades.map((uni, idx) => (
                        <option key={idx} value={uni.unidad_medida_id}>
                          {uni.nombre_unidad}
                        </option>
                      ))}
                    </select>
                  </div>
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

              <button type="button" className="btn btn-secondary mb-4" onClick={handleAddResiduosRow}>
                 Agregar otro residuo
              </button>

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
                      {servicios.map((item, idx) => (
                        <option key={idx} value={item.material_matnr}>
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
                      name="cantidad_servicio_disabled"
                      className="form-control"
                      value={1}
                      disabled
                    />

                    <input
                      type="hidden"
                      name="cantidad_servicio"
                      value={1}
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
                      {tiposTransporte.map((tipo) => (
                        <option key={tipo.tipo_transporte_id} value={tipo.tipo_transporte_id}>
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
                      {capacidades.map((c) => (
                        <option key={c.capacidad_id} value={c.capacidad_id}>
                          {parseFloat(c.valor_capacidad)} {c.nombre_unidad}
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
                      value={unidadNombre}
                      readOnly
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn btn-primary w-100 form-button-primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Completar Solicitud'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Botón Volver */}
      <div className="col-12 d-flex justify-content-start mt-3">
        <button type="button" className="btn btn-secondary btn-volver" onClick={onBack} disabled={loading}>
          Volver
        </button>
      </div>

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <>
          {ReactDOM.createPortal(
            <>
              <div className="modal show d-block" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px', width: '90%' }}>
                  <div className="modal-content border-0">
                    <div className="modal-header border-0">
                      <h5 className="modal-title">Solicitud Creada con Éxito</h5>
                      <button type="button" className="btn-close" onClick={handleSuccessOK}></button>
                    </div>
                    <div className="modal-body border-0">
                      <p>La solicitud ha sido completada exitosamente.</p>
                    </div>
                    <div className="modal-footer border-0">
                      <button type="button" className="btn btn-primary modal-save-button" onClick={handleSuccessOK}>
                        Aceptar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show"></div>
            </>,
            document.body
          )}
        </>
      )}

    </div>
  );
};

export default SolicitudCompletionForm;
