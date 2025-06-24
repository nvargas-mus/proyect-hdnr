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

export interface DetalleSinTransporte {
  [key: string]: unknown;
}

export interface Residuo {
  nombre_material: string;
  cantidad_declarada: number;
  nombre_unidad: string;
}

export interface Solicitud {
  solicitud_id: number;
  usuario_id: number;
  email: string;

  centro_vwerk: string | null;
  descripcion_centro: string | null;

  codigo_cliente_kunnr: number;
  nombre_cliente: string;
  nombre_name1: string;
  sucursal_name2: string;

  fecha_solicitud: string;
  fecha_servicio_solicitada: string;
  hora_servicio_solicitada: string;
  fecha_servicio_programada: string | null;
  hora_servicio_programada: string | null;
  fecha_programacion: string | null;

  descripcion: string;
  numero_nota_venta: number | null;

  id_linea_descarga: number | null;
  nombre_linea: string | null;

  requiere_transporte: boolean;
  estado_id: number;
  nombre_estado: string;

  direccion_id: number;
  direccion: string | null;
  direccion_completa: string;
  comuna: string | null;

  contacto_cliente_id: number;
  nombre: string;
  telefono: string;
  email_contacto: string;

  declaracion_id: number;
  declaracion_nombre: string;
  declaracion_numero: string | null;
  clase_peligrosidad: string | null;

  generador_id: number | null;
  nombre_generador: string | null;
  generador_igual_cliente: boolean;

  detalles_con_transporte?: DetalleConTransporte[] | null;
  detalles_sin_transporte?: DetalleSinTransporte[] | null;

  residuos: {
    codigo_material_matnr: number;
    cantidad_declarada: number;
    unidad_medida_id: number;
    nombre_unidad: string;
    nombre_material_maktg: string;
  }[] | null;
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

/* catálogos */
export interface Transportista {
  transportista_id: number;
  nombre_transportista: string;
}

export interface AsignacionTarifa {
  asignacion_id: number;
  transportista_id: number;
  nombre_transportista: string;
  nombre_tipo_transporte: string;
  tarifa_actual: number;
  fecha_fin_vigencia: string;
  descripcion_tarifa: string;
}

interface FilterOptions {
  cliente?: number;
  usuario?: number;
  estado?: string;
  centro?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  requiereTransporte?: string;
}

export interface LineaDescarga {
  id_linea_descarga: number;
  nombre_linea: string;
}

export interface DetalleSinTransporte {
  nombre_tipo_transporte: string | null;
  valor_capacidad: number | null;
  nombre_unidad: string | null;
}


export const getAuthToken = () => localStorage.getItem('authToken');

export const getSolicitudesCoordinador = async (
  pagina: number = 1,
  tamanoPagina: number = 20,
  filters: FilterOptions = {}
): Promise<SolicitudesResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error('No se encontró token de autenticación.');

  const params: Record<string, string | number | undefined> = { pagina, tamano_pagina: tamanoPagina };
  if (filters.cliente)  params.cliente  = filters.cliente;
  if (filters.usuario)  params.usuario  = filters.usuario;
  if (filters.estado)   params.estado   = filters.estado;
  if (filters.centro)   params.centro   = filters.centro;
  if (filters.fechaDesde) params["fecha_desde"] = filters.fechaDesde;
  if (filters.fechaHasta) params["fecha_hasta"] = filters.fechaHasta;
  if (filters.requiereTransporte) params["requiere_transporte"] = filters.requiereTransporte;

  const { data } = await axios.get<SolicitudesResponse>(
    `${API_URL}/solicitudes/dashboard/coordinador`,
    {
      params,
      headers: { accept: 'application/json', Authorization: `Bearer ${token}` }
    }
  );
  return data;
};

export const getSolicitudById = async (solicitudId: number): Promise<Solicitud> => {
  const token = getAuthToken();
  if (!token) throw new Error('No token');

  const { data } = await axios.get<Solicitud>(
    `${API_URL}/solicitudes/${solicitudId}`,
    { headers: { accept: 'application/json', Authorization: `Bearer ${token}` } }
  );
  return data;
};

/* catálogo transportistas */
export const getTransportistas = async (): Promise<Transportista[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('No token');

  const { data } = await axios.get<Transportista[]>(
    `${API_URL}/transportistas`,
    { headers: { accept: '*/*', Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const getAsignacionesTarifa = async (
  codigoCliente: number,
  direccionId: number,
  codigoMaterial: number
): Promise<AsignacionTarifa[]> => {
  const token = getAuthToken();
  if (!token) throw new Error('No token');

  const { data, status } = await axios.get<AsignacionTarifa[]>(
    `${API_URL}/asignaciones_manuales_tarifas/buscar/${codigoCliente}/${direccionId}/${codigoMaterial}`,
    {
      headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
      validateStatus: (status) => status >= 200 && status < 500,
    }
  );

  if (status === 404) {
    throw new Error('No se encontraron asignaciones.');
  }

  return data;
};


/* agendar */
export const agendarSolicitud = async (
  solicitudId: number,
  datosAgendamiento: AgendamientoData
): Promise<Solicitud> => {
  const token = getAuthToken();
  if (!token) throw new Error('No token');

  const payload: Record<string, unknown> = { ...datosAgendamiento };
  if (payload.transportista_id === null) payload.transportista_id = undefined;
  if (payload.asignacion_id   === null) payload.asignacion_id   = undefined;
  if (payload.conductor_id    === null) payload.conductor_id    = undefined;
  if (payload.vehiculo_id     === null) payload.vehiculo_id     = undefined;

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
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as Record<string, unknown>).response === 'object'
    ) {
      console.error('🟥 Backend error body:', (error as any).response?.data);
    }
    throw error;
  }
};

export const getLineasDescarga = async (): Promise<LineaDescarga[]> => {
  const token = getAuthToken();
  if (!token) throw new Error("No token");

  const { data } = await axios.get<LineaDescarga[]>(
    `${API_URL}/lineaDescarga`,
    {
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`
      }
    }
  );

  return data;
};

