import api from './api';

export const crearSolicitud = async (solicitudData: {
  usuario_id: number;
  codigo_cliente_kunnr: number;
  fecha_servicio_solicitada: string;
  hora_servicio_solicitada: string;
  descripcion: string;
  requiere_transporte: boolean;
  direccion_id: number | null; 
  contacto_cliente_id: number;
  declaracion_id: number;
  generador_id: number | null;
  generador_igual_cliente: boolean;
}) => {
  const serviceDate = new Date(solicitudData.fecha_servicio_solicitada);
  const today = new Date();
  if (serviceDate < today) {
    console.warn("Advertencia: La fecha de servicio seleccionada está en el pasado.");
  }
  
  const [hourStr, minuteStr] = solicitudData.hora_servicio_solicitada.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (hour < 8 || hour > 18 || ![0, 15, 30, 45].includes(minute)) {
    console.warn("Advertencia: La hora de servicio seleccionada no está dentro del rango permitido (08:00-18:00, minutos: 00,15,30,45).");
  }

  const response = await api.post('/solicitudes', solicitudData);
  return response.data;
};

export const getClientesAsociados = async (q: string = '') => {
  const response = await api.get('/usuarios/clientes/asociados', {
    params: { limit: 10, offset: 0, q }
  });
  return response.data;
};

export const getDirecciones = async (codigo_cliente_kunnr: number) => {
  const response = await api.get('/direcciones_cliente');
  return response.data.filter((direccion: any) => direccion.codigo_cliente_kunnr === codigo_cliente_kunnr);
};

export const getContactos = async (codigo_cliente: number) => {
  const response = await api.get('/contactos_clientes');
  return response.data.filter((contacto: any) => contacto.codigo_cliente_kunnr === codigo_cliente);
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
  const response = await api.get('/tiposTransporte');
  return response.data;
};

export const getCapacidadesTransporte = async () => {
  const response = await api.get('/capacidadesTransporte');
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

export const getSolicitudesPorUsuario = async (usuario_id: number, include?: string) => {
  const response = await api.get(`/solicitudes/por-usuario/${usuario_id}`, {
    params: { include }
  });
  return response.data;
};




