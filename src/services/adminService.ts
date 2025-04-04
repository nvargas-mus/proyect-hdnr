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
  id: number;
  nombre: string;
  rut?: string;
  direccion?: string;
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
    const response = await axios.put(`${API_URL}/contratos/${id}`, contratoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error actualizando contrato con ID ${id}:`, error);
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