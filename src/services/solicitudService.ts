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

export const getDirecciones = async () => {
  const response = await api.get('/direcciones_cliente');
  return response.data;
};

export const getContactos = async () => {
  const response = await api.get('/contactos_clientes');
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

export const getMaterialesResiduos = async (solicitudId: number) => {
  const response = await api.get(`/materiales_cotizados/residuos/${solicitudId}`);
  return response.data;
};

export const getMaterialesServicios = async (solicitudId: number) => {
  const response = await api.get(`/materiales_cotizados/servicios/${solicitudId}`);
  return response.data;
};

export const getUnidadesReferenciales = async () => {
  const response = await api.get('/unidadesReferenciales');
  return response.data;
};

export const getTiposTransporte = async () => {
  const response = await api.get('/tipos_transporte');
  return response.data;
};

export const getCapacidadesTransporte = async () => {
  const response = await api.get('/capacidades_transporte');
  return response.data;
};

export const completarSolicitud = async (data: any) => {
  const response = await api.post('/solicitudes/completar', data);
  return response.data;
};

export const postDireccion = async (direccionData: {
  codigo_cliente_kunnr: number;
  calle: string;
  numero: string;
  complemento: string;
  comuna: string;
  region: string;
  contacto_terreno_id: number;
}) => {
  const response = await api.post('/direcciones_cliente', direccionData);
  return response.data;
};

export const postContacto = async (contactoData: {
  codigo_cliente_kunnr: number;
  nombre: string;
  telefono: string;
  email: string;
  referencia_id: number;
}) => {
  const response = await api.post('/contactos_clientes', contactoData);
  return response.data;
};

export const crearSolicitudMateriales = async (data: {
  solicitud_id: number;
  codigo_material_matnr: number;
  cantidad_declarada: number;
  unidad_medida_id: number;
}) => {
  const response = await api.post('/solicitud_materiales', data);
  return response.data;
};
