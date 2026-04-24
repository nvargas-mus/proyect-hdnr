import api from './api';

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
  nombre_tipo_transporte: string | null;
  valor_capacidad: number | null;
  nombre_unidad: string | null;
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

  residuos:
    | {
        codigo_material_matnr: number;
        cantidad_declarada: number;
        unidad_medida_id: number;
        nombre_unidad: string;
        nombre_material_maktg: string;
      }[]
    | null;
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
  centro?: number | string;
  fechaDesde?: string;
  fechaHasta?: string;
  requiereTransporte?: string;
}

export interface LineaDescarga {
  id_linea_descarga: number;
  nombre_linea: string;
}

export const getAuthToken = () => localStorage.getItem('authToken');

/**
 * Intenta mapear el "estado" legacy (nombre) a estado_id del backend v2.
 * Si el backend espera uno distinto, simplemente no lo envía para no romper.
 * Mapeo basado en nombres comunes del frontend legacy.
 */
const estadoNameToId = (nombre: string): number | undefined => {
  const map: Record<string, number> = {
    incompleta: 1,
    pendiente: 2,
    agendado: 3,
    agendada: 3,
    'recepcionada en planta': 4,
    'retiro completado': 5,
    completado: 5,
    cancelado: 6,
    cancelada: 6,
    'sobre cupo': 7,
  };
  return map[nombre.trim().toLowerCase()];
};

const extractHoraFromIso = (iso?: string | null): string => {
  if (!iso) return '';
  // "2026-04-27T13:30:00.000Z" → "13:30"
  const match = /T(\d{2}:\d{2})/.exec(String(iso));
  return match ? match[1] : '';
};

const mapBackendSolicitudLista = (row: any): Solicitud => {
  // El backend usa `cliente_nombre` y `estado_nombre` en el listado y en el detalle
  const nombreCliente = row.cliente_nombre ?? row.nombre_name1 ?? row.nombre_cliente ?? '';
  const estadoNombre = row.estado_nombre ?? row.nombre_estado ?? row.estado ?? '';
  const horaSolicitada =
    row.hora_servicio_solicitada || extractHoraFromIso(row.fecha_servicio_solicitada);
  const horaProgramada =
    row.hora_servicio_programada || extractHoraFromIso(row.fecha_servicio_programada);

  return {
    solicitud_id: row.solicitud_id,
    usuario_id: row.usuario_id ?? 0,
    email: row.usuario_email ?? row.email ?? '',

    centro_vwerk: row.centro_vwerk ?? null,
    descripcion_centro: row.descripcion_centro ?? null,

    codigo_cliente_kunnr: row.codigo_cliente_kunnr,
    nombre_cliente: nombreCliente,
    nombre_name1: nombreCliente,
    sucursal_name2: row.sucursal_name2 ?? '',

    fecha_solicitud: row.fecha_solicitud ?? row.fecha_creacion ?? '',
    fecha_servicio_solicitada: row.fecha_servicio_solicitada ?? '',
    hora_servicio_solicitada: horaSolicitada,
    fecha_servicio_programada: row.fecha_servicio_programada ?? null,
    hora_servicio_programada: horaProgramada || null,
    fecha_programacion: row.fecha_programacion ?? null,

    descripcion: row.descripcion ?? '',
    numero_nota_venta: row.numero_nota_venta ?? null,

    id_linea_descarga: row.linea_descarga_id ?? row.id_linea_descarga ?? null,
    nombre_linea: row.linea_descarga_nombre ?? row.nombre_linea ?? null,

    requiere_transporte: !!row.requiere_transporte,
    estado_id: row.estado_id ?? 0,
    nombre_estado: estadoNombre,

    direccion_id: row.direccion_id ?? 0,
    direccion: row.direccion ?? null,
    direccion_completa: row.direccion_completa ?? row.direccion ?? '',
    comuna: row.comuna ?? null,

    contacto_cliente_id: row.contacto_cliente_id ?? 0,
    nombre: row.nombre_contacto ?? row.nombre ?? '',
    telefono: row.telefono ?? '',
    email_contacto: row.email_contacto ?? '',

    declaracion_id: row.declaracion_id ?? 0,
    declaracion_nombre: row.declaracion_nombre ?? '',
    declaracion_numero: row.declaracion_numero ?? null,
    clase_peligrosidad: row.clase_peligrosidad ?? null,

    generador_id: row.generador_id ?? null,
    nombre_generador: row.nombre_generador ?? null,
    generador_igual_cliente: row.generador_igual_cliente ?? true,

    detalles_con_transporte: row.detalles_con_transporte ?? null,
    detalles_sin_transporte: row.detalles_sin_transporte ?? null,

    residuos: row.residuos ?? row.materiales ?? null,
  };
};

export const getSolicitudesCoordinador = async (
  pagina: number = 1,
  tamanoPagina: number = 20,
  filters: FilterOptions = {}
): Promise<SolicitudesResponse> => {
  const limit = tamanoPagina;
  const offset = (pagina - 1) * tamanoPagina;

  const params: Record<string, string | number | undefined> = { limit, offset };
  if (filters.cliente) params.codigo_cliente_kunnr = filters.cliente;
  if (filters.usuario) params.usuario_id = filters.usuario;
  if (filters.centro) params.centro_vwerk = filters.centro;
  if (filters.fechaDesde) params.fecha_desde = filters.fechaDesde;
  if (filters.fechaHasta) params.fecha_hasta = filters.fechaHasta;
  if (filters.requiereTransporte) params.requiere_transporte = filters.requiereTransporte;

  if (filters.estado) {
    // El filtro legacy acepta CSV; el backend v2 filtra por estado_id único.
    // Tomamos el primero y lo mapeamos; si no mapea, lo omitimos.
    const first = filters.estado.split(',')[0];
    const id = estadoNameToId(first);
    if (id !== undefined) params.estado_id = id;
  }

  const { data } = await api.get('/operaciones/solicitudes', { params });

  const items: any[] = data?.data ?? [];
  const total: number = data?.total ?? items.length;
  const totalPaginas = total === 0 ? 1 : Math.ceil(total / tamanoPagina);

  return {
    metadatos: {
      total_resultados: total,
      total_paginas: totalPaginas,
      pagina_actual: pagina,
      tamano_pagina: tamanoPagina,
      enlaces: {
        primera: '',
        anterior: data?.prev_offset != null ? '' : null,
        siguiente: data?.next_offset != null ? '' : null,
        ultima: '',
      },
    },
    datos: items.map(mapBackendSolicitudLista),
  };
};

export const getSolicitudById = async (solicitudId: number): Promise<Solicitud> => {
  const { data } = await api.get(`/operaciones/solicitudes/${solicitudId}`);
  return mapBackendSolicitudLista(data);
};

/* catálogo transportistas */
export const getTransportistas = async (): Promise<Transportista[]> => {
  const { data } = await api.get('/flota/transportistas', {
    params: { limit: 200, offset: 0 },
  });
  const list: any[] = data?.data ?? [];
  return list.map((t) => ({
    transportista_id: t.transportista_id,
    nombre_transportista: t.nombre_transportista,
  }));
};

export const getAsignacionesTarifa = async (
  codigoCliente: number,
  direccionId: number,
  codigoMaterial: number
): Promise<AsignacionTarifa[]> => {
  try {
    const { data, status } = await api.get('/contratos/asignaciones/buscar', {
      params: {
        kunnr: codigoCliente,
        direccion_id: direccionId,
        matnr: codigoMaterial,
      },
      validateStatus: (s) => s >= 200 && s < 500,
    });

    if (status === 404) {
      throw new Error('No se encontraron asignaciones.');
    }

    // La API v2 retorna un objeto único; el frontend espera arreglo.
    const list = Array.isArray(data) ? data : data ? [data] : [];

    return list.map((a: any) => ({
      asignacion_id: a.asignacion_id,
      transportista_id: a.transportista_id,
      nombre_transportista: a.nombre_transportista,
      nombre_tipo_transporte: a.nombre_tipo_transporte,
      tarifa_actual: a.tarifa_actual,
      fecha_fin_vigencia: a.fecha_fin_vigencia_actual ?? a.fecha_fin_vigencia ?? '',
      descripcion_tarifa: a.descripcion_tarifa,
    }));
  } catch (err: any) {
    if (err?.response?.status === 404) {
      throw new Error('No se encontraron asignaciones.');
    }
    throw err;
  }
};

/* agendar */
export const agendarSolicitud = async (
  solicitudId: number,
  datosAgendamiento: AgendamientoData
): Promise<Solicitud> => {
  // El backend v2 recibe fecha+hora separados para fecha_servicio_programada,
  // y el campo de línea de descarga se llama linea_descarga_id.
  const hora =
    datosAgendamiento.hora_servicio_programada?.length === 8
      ? datosAgendamiento.hora_servicio_programada.substring(0, 5)
      : datosAgendamiento.hora_servicio_programada;

  const payload: Record<string, unknown> = {
    fecha_servicio_programada: datosAgendamiento.fecha_servicio_programada,
    hora_servicio_programada: hora,
    linea_descarga_id: datosAgendamiento.id_linea_descarga,
    numero_nota_venta: datosAgendamiento.numero_nota_venta,
    descripcion: datosAgendamiento.descripcion,
  };

  if (datosAgendamiento.clase_peligrosidad) {
    payload.clase_peligrosidad = datosAgendamiento.clase_peligrosidad;
  }
  if (datosAgendamiento.declaracion_numero) {
    payload.declaracion_numero = datosAgendamiento.declaracion_numero;
  }
  if (datosAgendamiento.transportista_id) {
    payload.transportista_id = datosAgendamiento.transportista_id;
  }
  if (datosAgendamiento.asignacion_id) {
    payload.asignacion_id = datosAgendamiento.asignacion_id;
  }
  if (datosAgendamiento.conductor_id) {
    payload.conductor_id = datosAgendamiento.conductor_id;
  }
  if (datosAgendamiento.vehiculo_id) {
    payload.vehiculo_id = datosAgendamiento.vehiculo_id;
  }

  try {
    const { data } = await api.put(
      `/operaciones/solicitudes/${solicitudId}/agendar`,
      payload
    );
    return mapBackendSolicitudLista(data);
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
  const { data } = await api.get('/capacidad/lineas-descarga');
  const list: any[] = data?.data ?? [];
  return list.map((l) => ({
    id_linea_descarga: l.linea_descarga_id ?? l.id_linea_descarga,
    nombre_linea: l.nombre_linea,
  }));
};

export const getConductoresPorTransportista = async (id: number) => {
  const { data } = await api.get(`/flota/transportistas/${id}/conductores`, {
    params: { limit: 200, offset: 0 },
  });
  const list: any[] = data?.data ?? [];
  return list.map((c) => ({
    conductor_id: c.conductor_id,
    nombre: c.nombre,
  }));
};

export const getVehiculosPorTransportista = async (id: number) => {
  const { data } = await api.get(`/flota/transportistas/${id}/vehiculos`, {
    params: { limit: 200, offset: 0 },
  });
  const list: any[] = data?.data ?? [];
  return list.map((v) => ({
    vehiculo_id: v.vehiculo_id,
    patente: v.patente,
    nombre_tipo_transporte: v.nombre_tipo_transporte ?? '',
  }));
};
