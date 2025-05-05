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
  const response = await api.get<DashboardData>('/solicitudes/dashboard/coordinador', {
    params,
  });
  return response.data;
};
