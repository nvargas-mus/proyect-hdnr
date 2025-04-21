import axios from 'axios';

const API_URL = 'http://15.229.249.223:3000';

export interface DetalleConTransporte {
  codigo_material_matnr: number;
  nombre_tipo_transporte: string | null;
  valor_capacidad: string | null;
  nombre_unidad: string | null;
  nombre_material_maktg: string;
  unidad_venta_kmein: string;
  nombre_transportista: string | null;
  nombre: string | null;
  rut: string | null;
  patente: string | null;
  cantidad: number;
  transportista_id?: number | null;
}

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
  detalles_con_transporte?: DetalleConTransporte[] | null;
  detalles_sin_transporte?: any[] | null;
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

export interface AgendamientoData {
  fecha_servicio_programada: string;
  hora_servicio_programada: string;
  id_linea_descarga: number;
  numero_nota_venta: string;
  descripcion: string;
  clase_peligrosidad?: string;
  declaracion_numero?: string;
  transportista_id?: number | null;
  asignacion_id?: number | null;
  conductor_id?: number | null;
  vehiculo_id?: number | null;
}

interface FilterOptions {
  cliente?: number;
  usuario?: number;
  estado?: string;
  centro?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  requiere_transporte?: string;
  [key: string]: any;
}

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const getSolicitudesCoordinador = async (
  pagina: number = 1, 
  tamanoPagina: number = 20,
  filters: FilterOptions = {}
): Promise<SolicitudesResponse> => {
  const token = getAuthToken();
  
  if (!token) {
    console.error('No se encontró token de autenticación');
    throw new Error('No se encontró token de autenticación. Por favor inicie sesión.');
  }
  
  try {
    const params: FilterOptions = {
      pagina,
      tamano_pagina: tamanoPagina
    };
    
    if (filters.cliente) params.cliente = filters.cliente;
    if (filters.usuario) params.usuario = filters.usuario;
    if (filters.estado) params.estado = filters.estado;
    if (filters.centro) params.centro = filters.centro;
    if (filters.fechaDesde) params.fecha_desde = filters.fechaDesde;
    if (filters.fechaHasta) params.fecha_hasta = filters.fechaHasta;
    if (filters.requiereTransporte) params.requiere_transporte = filters.requiereTransporte;
    
    const response = await axios.get<SolicitudesResponse>(
      `${API_URL}/solicitudes/dashboard/coordinador`, 
      {
        params,
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

export const agendarSolicitud = async (
  solicitudId: number,
  datosAgendamiento: AgendamientoData
): Promise<Solicitud> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No se encontró token de autenticación. Por favor inicie sesión.');
  }

  const payload: Record<string, any> = { ...datosAgendamiento };
  if (payload.transportista_id === null) payload.transportista_id = undefined;
  if (payload.asignacion_id   === null) payload.asignacion_id   = undefined;

  /*Para depurar: muestra lo que realmente saldrá en la petición */
  console.log('🟦 Payload agendarSolicitud:', JSON.stringify(payload, null, 2));

  try {
    const { data } = await axios.put<Solicitud>(
      `${API_URL}/solicitudes/${solicitudId}/agendar`,
      payload,
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  } catch (error: any) {
    /* Para depurar: muestra el cuerrpo de error que devuelve el backend */
    console.error('🟥 Backend error body:', error.response?.data);
    console.error(`Error al agendar la solicitud #${solicitudId}:`, error);
    throw error;   // vuelve a lanzar para que lo capture el componente- 
  }
};
