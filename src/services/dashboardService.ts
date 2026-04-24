import api from './api';

export interface Residuo {
  nombre_material: string;
  cantidad_declarada: number;
  nombre_unidad: string;
}

export interface Solicitud {
  solicitud_id: number;
  centro_vwerk: unknown;
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

export interface DashboardData {
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

export const getDashboardCoordinadorData = async (params: {
  cliente: number;
  usuario: number;
  pagina?: number;
  tamano_pagina?: number;
  orden?: string;
  direccion?: string;
}): Promise<DashboardData> => {
  const pagina = params.pagina ?? 1;
  const tamanoPagina = params.tamano_pagina ?? 20;
  const limit = tamanoPagina;
  const offset = (pagina - 1) * tamanoPagina;

  const query: Record<string, string | number | undefined> = { limit, offset };
  if (params.cliente) query.codigo_cliente_kunnr = params.cliente;
  if (params.usuario) query.usuario_id = params.usuario;

  const { data } = await api.get('/operaciones/solicitudes', { params: query });

  const items: any[] = data?.data ?? [];
  const total: number = data?.total ?? items.length;
  const totalPaginas = total === 0 ? 1 : Math.ceil(total / tamanoPagina);

  const mapped: Solicitud[] = items.map((row) => ({
    solicitud_id: row.solicitud_id,
    centro_vwerk: row.centro_vwerk ?? null,
    codigo_cliente_kunnr: row.codigo_cliente_kunnr,
    nombre_name1: row.nombre_name1 ?? '',
    sucursal_name2: row.sucursal_name2 ?? '',
    fecha_servicio_solicitada: row.fecha_servicio_solicitada ?? '',
    hora_servicio_solicitada: row.hora_servicio_solicitada ?? '',
    requiere_transporte: !!row.requiere_transporte,
    nombre_estado: row.nombre_estado ?? row.estado ?? '',
    fecha_solicitud: row.fecha_creacion ?? row.fecha_solicitud ?? '',
    comuna: row.comuna ?? null,
    direccion_completa: row.direccion_completa ?? row.direccion ?? '',
    residuos: row.residuos ?? null,
  }));

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
    datos: mapped,
  };
};
