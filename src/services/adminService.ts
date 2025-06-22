import axios from 'axios';

const API_URL = 'http://15.229.249.223:3000';

const getToken = () => localStorage.getItem('authToken') || '';

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

// Interfaces para la asignación de tarifas
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

export const getClienteById = async (id: number | string): Promise<Cliente> => {
  const token = getToken();
  const response = await axios.get<Cliente>(`${API_URL}/clientes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const asignarClientesAUsuario = async (
  usuarioId: number | string,
  clienteIds: number[]
): Promise<{ success: boolean }> => {
  const token = getToken();
  const payload = {
    usuario_id: usuarioId,
    cliente_ids: clienteIds,
  };
  const response = await axios.post<{ success: boolean }>(`${API_URL}/usuarios/${usuarioId}/asignar-clientes`, payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const getContratos = async (limit: number = 10, offset: number = 0): Promise<ContratosResponse> => {
  const token = getToken();
  const response = await axios.get<ContratosResponse>(`${API_URL}/contratos`, {
    params: { limit, offset },
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const getContratoById = async (id: number): Promise<Contrato> => {
  const token = getToken();
  const response = await axios.get<Contrato>(`${API_URL}/contratos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const createContrato = async (contratoData: FormData): Promise<Contrato> => {
  const token = getToken();
  const response = await axios.post<Contrato>(`${API_URL}/contratos`, contratoData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateContrato = async (id: number, contratoData: FormData): Promise<Contrato> => {
  const token = getToken();
  const response = await axios.put<Contrato>(`${API_URL}/contratos/${id}`, contratoData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    }
  });
  return response.data;
};

export const deleteContrato = async (id: number): Promise<{ success: boolean }> => {
  const token = getToken();
  const response = await axios.delete<{ success: boolean }>(`${API_URL}/contratos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const downloadContrato = async (id: number): Promise<Blob> => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/contratos/${id}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    responseType: 'blob'
  });
  return response.data;
};

export const getTransportistas = async (): Promise<Transportista[]> => {
  const token = getToken();
  const response = await axios.get<Transportista[]>(`${API_URL}/transportistas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const getTarifasByContrato = async (contratoId: number, limit: number = 10, offset: number = 0): Promise<TarifasResponse> => {
  const token = getToken();
  const response = await axios.get<TarifasResponse>(`${API_URL}/tarifario_contrato/contrato/${contratoId}`, {
    params: { limit, offset },
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const getTiposTransporte = async (): Promise<TipoTransporte[]> => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/tiposTransporte`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  const tiposTransporte = response.data.map((tipo: any): TipoTransporte => ({
    tipo_transporte_id: tipo.id || tipo.tipo_transporte_id,
    nombre_tipo_transporte: tipo.nombre || tipo.nombre_tipo_transporte
  }));
  return tiposTransporte;
};

export const getTarifaById = async (tarifaId: number): Promise<TarifaContrato> => {
  const token = getToken();
  const response = await axios.get<TarifaContrato>(`${API_URL}/tarifario_contrato/${tarifaId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
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
  const token = getToken();
  const response = await axios.post<TarifaContrato>(`${API_URL}/tarifario_contrato`, tarifaData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const updateTarifa = async (tarifaId: number, tarifaData: Partial<TarifaContrato>): Promise<TarifaContrato> => {
  const token = getToken();
  const response = await axios.put<TarifaContrato>(`${API_URL}/tarifario_contrato/${tarifaId}`, tarifaData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const deleteTarifa = async (tarifaId: number): Promise<{ success: boolean }> => {
  const token = getToken();
  const response = await axios.delete<{ success: boolean }>(`${API_URL}/tarifario_contrato/${tarifaId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const getAsignacionesByTarifa = async (tarifaId: number, limit: number = 10, offset: number = 0): Promise<AsignacionesResponse> => {
  const token = getToken();
  const response = await axios.get<AsignacionesResponse>(`${API_URL}/tarifario_contrato/${tarifaId}/asignaciones`, {
    params: { limit, offset },
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const getAsignacionesManualesByTarifario = async (
  tarifarioId: number,
  limit: number = 10,
  offset: number = 0
): Promise<AsignacionesResponse> => {
  const token = getToken();
  const response = await axios.get<AsignacionesResponse>(`${API_URL}/asignaciones_manuales_tarifas/tarifario/${tarifarioId}`, {
    params: { limit, offset },
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

export const deleteAsignacionManual = async (asignacionId: number): Promise<{ success: boolean }> => {
  const token = getToken();
  const response = await axios.delete<{ success: boolean }>(`${API_URL}/asignaciones_manuales_tarifas/${asignacionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};

// --Funciones para la asignación de tarifas
export const createAsignacionTarifa = async (data: AsignacionTarifaData): Promise<any> => {
  const token = getToken();
  const response = await axios.post(`${API_URL}/asignaciones_manuales_tarifas`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const getClientesAsociados = async (q: string = ''): Promise<ClienteAsociado[]> => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/usuarios/clientes/asociados`, {
    params: { limit: 10, offset: 0, q },
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
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
  const token = getToken();
  const response = await axios.get(`${API_URL}/direcciones_cliente/cliente/${codigo_cliente_kunnr}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  return response.data;
};


export const getMaterialesCliente = async (codigo_cliente_kunnr: number): Promise<MaterialServicio[]> => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/materiales_cotizados/servicios/cliente/${codigo_cliente_kunnr}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  return response.data;
};

