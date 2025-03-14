import axios from 'axios';

const API_URL = 'http://15.229.249.223:3000';

export interface Residuo {
  nombre_material: string;
  cantidad_declarada: number;
  nombre_unidad: string;
}

export interface Solicitud {
  solicitud_id: number;
  centro_vwerk: string | null;
  codigo_cliente_kunnr: number;
  nombre_name1: string;
  sucursal_name2: string;
  fecha_servicio_solicitada: string;
  hora_servicio_solicitada: string;
  requiere_transporte: boolean;
  nombre_estado: string;
  fecha_solicitud: string;
  comuna: string | null;
  direccion_completa: string;
  residuos: Residuo[] | null;
}

export interface SolicitudesResponse {
  metadatos: {
    total_resultados: number;
    total_paginas: number;
    pagina_actual: number;
    tamano_pagina: number;
    enlaces: {
      primera: string;
      anterior: string | null;
      siguiente: string | null;
      ultima: string;
    };
  };
  datos: Solicitud[];
}

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const getSolicitudesCoordinador = async (
  clienteId: number, 
  usuarioId: number, 
  pagina: number = 1, 
  tamanoPagina: number = 20
): Promise<SolicitudesResponse> => {
  const token = getAuthToken();
  
  if (!token) {
    console.error('No se encontró token de autenticación');
    throw new Error('No se encontró token de autenticación. Por favor inicie sesión.');
  }
  
  try {
    const response = await axios.get<SolicitudesResponse>(
      `${API_URL}/solicitudes/dashboard/coordinador`, 
      {
        params: {
          cliente: clienteId,
          usuario: usuarioId,
          pagina,
          tamano_pagina: tamanoPagina
        },
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener solicitudes:', error);
    
    if (error.response) {
      if (error.response.status === 401) {
        console.error('Error de autenticación. Token inválido o expirado.');
      }
      console.error('Datos de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    
    throw error;
  }
};

export const getSolicitudById = async (solicitudId: number): Promise<Solicitud> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No se encontró token de autenticación. Por favor inicie sesión.');
  }
  
  try {
    const response = await axios.get<Solicitud>(
      `${API_URL}/solicitudes/${solicitudId}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la solicitud #${solicitudId}:`, error);
    throw error;
  }
};