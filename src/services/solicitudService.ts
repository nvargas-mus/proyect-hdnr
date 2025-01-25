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
  return response.data;
};

export const getClientesAsociados = async () => {
  const response = await api.get('/usuarios/clientes/asociados');
  return response.data;
};

export const getDirecciones = async (codigo_cliente_kunnr: number) => {
  const response = await api.get(`/direcciones_cliente/${codigo_cliente_kunnr}`);
  return response.data;
};

export const getContactos = async (codigo_cliente_kunnr: number) => {
  const response = await api.get(`/contactos_clientes/${codigo_cliente_kunnr}`);
  return response.data;
};

export const getDeclaraciones = async () => {
  const response = await api.get('/declaraciones');
  return response.data;
};

export const getGeneradores = async () => {
  const response = await api.get('/generadores');
  return response.data;
};