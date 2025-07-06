import api from '../api/api';

export interface Cliente {
  id: number;
  nombre: string;
}

export interface Contrato {
  contrato_id: number; 
  transportista_id: number | null;
  es_spot: boolean;
  documento_respaldo: string | null;
  fecha_fin: string | null;
  tipo_reajuste: string | null;
  frecuencia_reajuste: string | null;
  fecha_proximo_reajuste: string | null;
  nombre_transportista: string | null;
  rut_transportista: string | null;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  nextOffset: number | null;
  prevOffset: number | null;
}

export interface ContratosResponse {
  data: Contrato[];
  pagination: PaginationInfo;
}

export interface Transportista {
  transportista_id: number;
  nombre_transportista: string;
  rut_transportista: string;
  direccion_transportista: string;
  fecha_creacion: string;
  ultima_actualizacion: string;
}

export interface TarifaContrato {
  tarifario_contrato_id: number;
  contrato_id: number;
  descripcion_tarifa: string;
  tipo_transporte_id: number;
  tarifa_inicial: number;
  es_spot: boolean;
  nombre_tipo_transporte: string;
  nombre_transportista: string | null;
  tarifa_actual: number;
  fecha_inicio_vigencia_actual: string;
  fecha_fin_vigencia_actual: string;
}

export interface TipoTransporte {
  tipo_transporte_id: number;
  nombre_tipo_transporte: string;
}

export interface TarifasResponse {
  data: TarifaContrato[];
  pagination: PaginationInfo;
}

export interface AsignacionManualTarifa {
  asignacion_id: number;
  codigo_cliente_kunnr: number;
  nombre_name1: string;
  sucursal_name2: string;
  direccion_id: number;
  direccion: string;
  codigo_material_matnr: number;
  nombre_material_maktg: string;
  tarifario_contrato_id: number;
}

export interface AsignacionesResponse {
  data: AsignacionManualTarifa[];
  pagination: PaginationInfo;
}

export interface ClienteAsociado {
  codigo_cliente_kunnr: number;
  nombre_name1: string;
  sucursal_name2: string;
}

export interface DireccionCliente {
  direccion_id: number;
  calle: string;
  numero: string;
  complemento: string;
  comuna: string;
  region: string;
  contacto_terreno_id: number;
}

export interface MaterialServicio {
  material_matnr: number; 
  nombre_material_maktg: string;
  unidad_venta_kmein: string; 
}

export interface AsignacionTarifaData {
  codigo_cliente_kunnr: number;
  direccion_id: number;
  codigo_material_matnr: number;
  tarifario_contrato_id: number;
}

// Funciones comienzan aquí

export const getClienteById = async (id: number | string): Promise<Cliente> => {
  const response = await api.get<Cliente>(`/clientes/${id}`);
  return response.data;
};

export const asignarClientesAUsuario = async (
  usuarioId: number | string,
  clienteIds: number[]
): Promise<{ success: boolean }> => {
  const payload = {
    usuario_id: usuarioId,
    cliente_ids: clienteIds,
  };
  const response = await api.post<{ success: boolean }>(`/usuarios/${usuarioId}/asignar-clientes`, payload);
  return response.data;
};

export const getContratos = async (limit: number = 10, offset: number = 0): Promise<ContratosResponse> => {
  const response = await api.get<ContratosResponse>(`/contratos`, {
    params: { limit, offset }
  });
  return response.data;
};

export const getContratoById = async (id: number): Promise<Contrato> => {
  const response = await api.get<Contrato>(`/contratos/${id}`);
  return response.data;
};

export const createContrato = async (contratoData: FormData): Promise<Contrato> => {
  const response = await api.post<Contrato>(`/contratos`, contratoData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateContrato = async (id: number, contratoData: FormData): Promise<Contrato> => {
  const response = await api.put<Contrato>(`/contratos/${id}`, contratoData);
  return response.data;
};

export const deleteContrato = async (id: number): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(`/contratos/${id}`);
  return response.data;
};

export const downloadContrato = async (id: number): Promise<Blob> => {
  const response = await api.get(`/contratos/${id}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

export const getTransportistas = async (): Promise<Transportista[]> => {
  const response = await api.get<Transportista[]>(`/transportistas`);
  return response.data;
};

export const getTarifasByContrato = async (contratoId: number, limit: number = 10, offset: number = 0): Promise<TarifasResponse> => {
  const response = await api.get<TarifasResponse>(`/tarifario_contrato/contrato/${contratoId}`, {
    params: { limit, offset }
  });
  return response.data;
};

export const getTiposTransporte = async (): Promise<TipoTransporte[]> => {
  const response = await api.get(`/tiposTransporte`);
  const tiposTransporte = response.data.map((tipo: any): TipoTransporte => ({
    tipo_transporte_id: tipo.id || tipo.tipo_transporte_id,
    nombre_tipo_transporte: tipo.nombre || tipo.nombre_tipo_transporte
  }));
  return tiposTransporte;
};

export const getTarifaById = async (tarifaId: number): Promise<TarifaContrato> => {
  const response = await api.get<TarifaContrato>(`/tarifario_contrato/${tarifaId}`);
  return response.data;
};

export const createTarifa = async (tarifaData: {
  contrato_id: number;
  descripcion_tarifa: string;
  tipo_transporte_id: number;
  tarifa_inicial: number;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia: string | null;
}): Promise<TarifaContrato> => {
  const response = await api.post<TarifaContrato>(`/tarifario_contrato`, tarifaData, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const updateTarifa = async (tarifaId: number, tarifaData: Partial<TarifaContrato>): Promise<TarifaContrato> => {
  const response = await api.put<TarifaContrato>(`/tarifario_contrato/${tarifaId}`, tarifaData, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const deleteTarifa = async (tarifaId: number): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(`/tarifario_contrato/${tarifaId}`);
  return response.data;
};

export const getAsignacionesByTarifa = async (tarifaId: number, limit: number = 10, offset: number = 0): Promise<AsignacionesResponse> => {
  const response = await api.get<AsignacionesResponse>(`/tarifario_contrato/${tarifaId}/asignaciones`, {
    params: { limit, offset }
  });
  return response.data;
};

export const getAsignacionesManualesByTarifario = async (
  tarifarioId: number,
  limit: number = 10,
  offset: number = 0
): Promise<AsignacionesResponse> => {
  const response = await api.get<AsignacionesResponse>(`/asignaciones_manuales_tarifas/tarifario/${tarifarioId}`, {
    params: { limit, offset }
  });
  return response.data;
};

export const deleteAsignacionManual = async (asignacionId: number): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(`/asignaciones_manuales_tarifas/${asignacionId}`);
  return response.data;
};

export const createAsignacionTarifa = async (data: AsignacionTarifaData): Promise<any> => {
  const response = await api.post(`/asignaciones_manuales_tarifas`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
};

export const getClientesAsociados = async (q: string = ''): Promise<ClienteAsociado[]> => {
  const response = await api.get(`/usuarios/clientes/asociados`, {
    params: { limit: 10, offset: 0, q }
  });

  let clientesList: any[] = [];
  const data = response.data;

  if (Array.isArray(data)) {
    clientesList = data;
  } else if (data && typeof data === 'object') {
    clientesList = data.clientes || data.data || [];
  }

  return clientesList;
};

export const getDireccionesCliente = async (codigo_cliente_kunnr: number): Promise<DireccionCliente[]> => {
  const response = await api.get(`/direcciones_cliente/cliente/${codigo_cliente_kunnr}`);
  return response.data;
};

export const getMaterialesCliente = async (codigo_cliente_kunnr: number): Promise<MaterialServicio[]> => {
  const response = await api.get(`/materiales_cotizados/servicios/cliente/${codigo_cliente_kunnr}`);
  return response.data;
};
