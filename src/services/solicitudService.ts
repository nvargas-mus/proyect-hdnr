import api from './api';

export const crearSolicitud = async (solicitudData: {
  usuario_id: number;
  codigo_cliente_kunnr: number;
  fecha_servicio_solicitada: string;
  hora_servicio_solicitada: string;
  descripcion: string;
  requiere_transporte: boolean;
  direccion_id: number;
  contacto_cliente_id: number;
  declaracion_id: number;
  generador_id: number;
  generador_igual_cliente: boolean;
}) => {
  const response = await api.post('/solicitudes', solicitudData);
  return response.data; // Devuelve los datos de la solicitud creada
};
