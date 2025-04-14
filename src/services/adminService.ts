import axios from 'axios';

const API_URL = 'http://15.229.249.223:3000';

const getToken = () => localStorage.getItem('authToken') || '';

export const getClienteById = async (id: number | string): Promise<any> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/clientes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo datos para cliente/usuario con ID ${id}:`, error);
    throw error;
  }
};

export const asignarClientesAUsuario = async (
  usuarioId: number | string,
  clienteIds: number[]
): Promise<any> => {
  try {
    const token = getToken();
    const payload = {
      usuario_id: usuarioId,
      cliente_ids: clienteIds,
    };
    const response = await axios.post(`${API_URL}/usuarios/${usuarioId}/asignar-clientes`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error asignando clientes al usuario con ID ${usuarioId}:`, error);
    throw error;
  }
};

// Funciones gestión de contratos

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

export const getContratos = async (limit: number = 10, offset: number = 0): Promise<ContratosResponse> => {
  try {
    const token = getToken();
    const response = await axios.get<ContratosResponse>(`${API_URL}/contratos`, {
      params: {
        limit,
        offset
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo contratos:', error);
    throw error;
  }
};

export const getContratoById = async (id: number): Promise<Contrato> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/contratos/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo contrato con ID ${id}:`, error);
    throw error;
  }
};

export const createContrato = async (contratoData: FormData): Promise<any> => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_URL}/contratos`, contratoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creando contrato:', error);
    throw error;
  }
};


export const updateContrato = async (id: number, contratoData: FormData): Promise<any> => {
  try {
    const token = getToken();
    
    console.log(`Actualizando contrato ${id} con datos:`, 
      Array.from(contratoData.entries()).reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {} as any)
    );
    
    const response = await axios.put(`${API_URL}/contratos/${id}`, contratoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Error actualizando contrato con ID ${id}:`, error);
    
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    
    throw error;
  }
};

export const deleteContrato = async (id: number): Promise<any> => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/contratos/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error eliminando contrato con ID ${id}:`, error);
    throw error;
  }
};

export const downloadContrato = async (id: number): Promise<Blob> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/contratos/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error descargando contrato con ID ${id}:`, error);
    throw error;
  }
};

export const getTransportistas = async (): Promise<Transportista[]> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/transportistas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo transportistas:', error);
    throw error;
  }
};

// Funciones gestión de tarifas

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
  id: number;
  nombre: string;
}

export interface TarifasResponse {
  data: TarifaContrato[];
  pagination: PaginationInfo;
}

export const getTarifasByContrato = async (contratoId: number, limit: number = 10, offset: number = 0): Promise<TarifasResponse> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/tarifario_contrato/contrato/${contratoId}`, {
      params: { limit, offset },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo tarifas del contrato ${contratoId}:`, error);
    throw error;
  }
};

export const getTiposTransporte = async (): Promise<TipoTransporte[]> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/tiposTransporte`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tipos de transporte:', error);
    throw error;
  }
};

export const getTarifaById = async (tarifaId: number): Promise<TarifaContrato> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/tarifario_contrato/${tarifaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo tarifa con ID ${tarifaId}:`, error);
    throw error;
  }
};

export const createTarifa = async (tarifaData: any): Promise<any> => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_URL}/tarifario_contrato`, tarifaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creando tarifa:', error);
    throw error;
  }
};

export const updateTarifa = async (tarifaId: number, tarifaData: any): Promise<any> => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_URL}/tarifario_contrato/${tarifaId}`, tarifaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error actualizando tarifa con ID ${tarifaId}:`, error);
    throw error;
  }
};

export const deleteTarifa = async (tarifaId: number): Promise<any> => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/tarifario_contrato/${tarifaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error eliminando tarifa con ID ${tarifaId}:`, error);
    throw error;
  }
};

export const getAsignacionesByTarifa = async (tarifaId: number, limit: number = 10, offset: number = 0): Promise<any> => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/tarifario_contrato/${tarifaId}/asignaciones`, {
      params: { limit, offset },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo asignaciones para la tarifa ${tarifaId}:`, error);
    throw error;
  }
};