import api from './api';

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

// Helpers

interface BackendPaginated<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  next_offset: number | null;
  prev_offset: number | null;
}

const toPaginationInfo = <T>(payload: BackendPaginated<T>): PaginationInfo => ({
  limit: payload.limit,
  offset: payload.offset,
  total: payload.total,
  nextOffset: payload.next_offset,
  prevOffset: payload.prev_offset,
});

// Funciones

export const getClienteById = async (id: number | string): Promise<Cliente> => {
  const response = await api.get(`/clientes/clientes/${id}`);
  const d = response.data;
  return {
    id: d.codigo_cliente_kunnr,
    nombre: [d.nombre_name1, d.sucursal_name2].filter(Boolean).join(' - '),
  };
};

export const asignarClientesAUsuario = async (
  _usuarioId: number | string,
  clienteIds: number[],
  email?: string
): Promise<{ success: boolean }> => {
  const storedEmail = email || localStorage.getItem('user_email') || '';
  await api.post('/clientes/asignaciones', {
    email: storedEmail,
    cliente_ids: clienteIds,
  });
  return { success: true };
};

export const getContratos = async (
  limit: number = 10,
  offset: number = 0
): Promise<ContratosResponse> => {
  const response = await api.get<BackendPaginated<Contrato>>(`/contratos`, {
    params: { limit, offset },
  });
  return {
    data: response.data.data,
    pagination: toPaginationInfo(response.data),
  };
};

export const getContratoById = async (id: number): Promise<Contrato> => {
  const response = await api.get<Contrato>(`/contratos/${id}`);
  return response.data;
};

export const createContrato = async (contratoData: FormData): Promise<Contrato> => {
  const response = await api.post<Contrato>(`/contratos`, contratoData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateContrato = async (id: number, contratoData: FormData): Promise<Contrato> => {
  const response = await api.put<Contrato>(`/contratos/${id}`, contratoData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteContrato = async (id: number): Promise<{ success: boolean }> => {
  await api.delete(`/contratos/${id}`);
  return { success: true };
};

export const downloadContrato = async (id: number): Promise<Blob> => {
  const response = await api.get(`/contratos/${id}/documento`, {
    responseType: 'blob',
  });
  return response.data;
};

export const getTransportistas = async (): Promise<Transportista[]> => {
  const response = await api.get<BackendPaginated<Transportista>>(`/flota/transportistas`, {
    params: { limit: 200, offset: 0 },
  });
  return response.data.data;
};

export interface TransportistaDetalle extends Transportista {
  total_vehiculos?: number;
  total_conductores?: number;
}

export const getTransportistaById = async (id: number): Promise<TransportistaDetalle> => {
  const response = await api.get<TransportistaDetalle>(`/flota/transportistas/${id}`);
  return response.data;
};

export const createTransportista = async (data: {
  nombre_transportista: string;
  rut_transportista: string;
  direccion_transportista?: string;
}): Promise<Transportista> => {
  const response = await api.post<Transportista>(`/flota/transportistas`, data);
  return response.data;
};

export const updateTransportista = async (
  id: number,
  data: {
    nombre_transportista?: string;
    rut_transportista?: string;
    direccion_transportista?: string;
  }
): Promise<Transportista> => {
  const response = await api.patch<Transportista>(`/flota/transportistas/${id}`, data);
  return response.data;
};

export const deleteTransportista = async (id: number): Promise<{ success: boolean }> => {
  await api.delete(`/flota/transportistas/${id}`);
  return { success: true };
};

// ── Conductores ─────────────────────────────────────────────────────────────

export interface Conductor {
  conductor_id: number;
  nombre: string;
  rut: string;
  transportista_id: number;
}

export const getConductoresPorTransportista = async (
  transportistaId: number
): Promise<Conductor[]> => {
  const response = await api.get<BackendPaginated<Conductor>>(
    `/flota/transportistas/${transportistaId}/conductores`,
    { params: { limit: 200, offset: 0 } }
  );
  return response.data.data;
};

export const createConductor = async (data: {
  nombre: string;
  rut: string;
  transportista_id: number;
}): Promise<Conductor> => {
  const response = await api.post<Conductor>(`/flota/conductores`, data);
  return response.data;
};

export const updateConductor = async (
  id: number,
  data: { nombre?: string; rut?: string }
): Promise<Conductor> => {
  const response = await api.patch<Conductor>(`/flota/conductores/${id}`, data);
  return response.data;
};

export const deleteConductor = async (id: number): Promise<{ success: boolean }> => {
  await api.delete(`/flota/conductores/${id}`);
  return { success: true };
};

// ── Vehículos ───────────────────────────────────────────────────────────────

export interface Vehiculo {
  vehiculo_id: number;
  patente: string;
  tipo_transporte_id: number;
  transportista_id: number;
  nombre_tipo_transporte?: string;
}

export const getVehiculosPorTransportista = async (
  transportistaId: number
): Promise<Vehiculo[]> => {
  const response = await api.get<BackendPaginated<Vehiculo>>(
    `/flota/transportistas/${transportistaId}/vehiculos`,
    { params: { limit: 200, offset: 0 } }
  );
  return response.data.data;
};

export const createVehiculo = async (data: {
  patente: string;
  tipo_transporte_id: number;
  transportista_id: number;
}): Promise<Vehiculo> => {
  const response = await api.post<Vehiculo>(`/flota/vehiculos`, data);
  return response.data;
};

export const updateVehiculo = async (
  id: number,
  data: { patente?: string; tipo_transporte_id?: number }
): Promise<Vehiculo> => {
  const response = await api.patch<Vehiculo>(`/flota/vehiculos/${id}`, data);
  return response.data;
};

export const deleteVehiculo = async (id: number): Promise<{ success: boolean }> => {
  await api.delete(`/flota/vehiculos/${id}`);
  return { success: true };
};

export const getTarifasByContrato = async (
  contratoId: number,
  limit: number = 10,
  offset: number = 0
): Promise<TarifasResponse> => {
  const response = await api.get<BackendPaginated<TarifaContrato>>(
    `/contratos/${contratoId}/tarifario`,
    { params: { limit, offset } }
  );
  return {
    data: response.data.data,
    pagination: toPaginationInfo(response.data),
  };
};

export const getTiposTransporte = async (): Promise<TipoTransporte[]> => {
  const response = await api.get(`/flota/tipos-transporte`);
  const raw = response.data?.data ?? response.data ?? [];
  const tiposTransporte = (raw as any[]).map((tipo): TipoTransporte => ({
    tipo_transporte_id: tipo.tipo_transporte_id ?? tipo.id,
    nombre_tipo_transporte: tipo.nombre_tipo_transporte ?? tipo.nombre,
  }));
  return tiposTransporte;
};

export const getTarifaById = async (tarifaId: number): Promise<TarifaContrato> => {
  const response = await api.get<TarifaContrato>(`/contratos/tarifario/${tarifaId}`);
  return response.data;
};

export const createTarifa = async (tarifaData: {
  contrato_id: number;
  descripcion_tarifa: string;
  tipo_transporte_id: number;
  tarifa_inicial: number;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia?: string | null;
  unidad_costo_id?: number;
  codigo_moneda?: string;
}): Promise<TarifaContrato> => {
  // Si el form no pasa unidad_costo_id, tomamos la primera unidad disponible.
  let unidad_costo_id = tarifaData.unidad_costo_id;
  if (!unidad_costo_id) {
    try {
      const res = await api.get('/operaciones/unidades-referenciales');
      const list: any[] = res.data?.data ?? [];
      unidad_costo_id = list[0]?.unidad_medida_id;
    } catch {
      // noop — si falla, el backend devolverá 400 y lo mostramos
    }
  }

  const { fecha_fin_vigencia: _ignored, ...rest } = tarifaData;
  const body = {
    ...rest,
    unidad_costo_id,
    codigo_moneda: tarifaData.codigo_moneda ?? 'CLP',
  };

  const response = await api.post<TarifaContrato>(`/contratos/tarifario`, body);
  return response.data;
};

export const updateTarifa = async (
  tarifaId: number,
  tarifaData: Partial<TarifaContrato>
): Promise<TarifaContrato> => {
  const response = await api.put<TarifaContrato>(`/contratos/tarifario/${tarifaId}`, tarifaData);
  return response.data;
};

export const deleteTarifa = async (tarifaId: number): Promise<{ success: boolean }> => {
  await api.delete(`/contratos/tarifario/${tarifaId}`);
  return { success: true };
};

export const getAsignacionesByTarifa = async (
  tarifaId: number,
  limit: number = 10,
  offset: number = 0
): Promise<AsignacionesResponse> => {
  return getAsignacionesManualesByTarifario(tarifaId, limit, offset);
};

export const getAsignacionesManualesByTarifario = async (
  tarifarioId: number,
  limit: number = 10,
  offset: number = 0
): Promise<AsignacionesResponse> => {
  const response = await api.get<BackendPaginated<AsignacionManualTarifa>>(
    `/contratos/asignaciones`,
    { params: { tarifario_contrato_id: tarifarioId, limit, offset } }
  );
  return {
    data: response.data.data,
    pagination: toPaginationInfo(response.data),
  };
};

export const deleteAsignacionManual = async (
  asignacionId: number
): Promise<{ success: boolean }> => {
  await api.delete(`/contratos/asignaciones/${asignacionId}`);
  return { success: true };
};

export const createAsignacionTarifa = async (data: AsignacionTarifaData): Promise<any> => {
  const response = await api.post(`/contratos/asignaciones`, data);
  return response.data;
};

export const getClientesAsociados = async (q: string = ''): Promise<ClienteAsociado[]> => {
  const trimmed = q.trim();

  // Sin término: listar clientes asignados al usuario
  // Con término: usar endpoint de búsqueda
  const response = trimmed.length < 1
    ? await api.get(`/clientes/clientes`, { params: { limit: 50, offset: 0 } })
    : await api.get(`/clientes/clientes/buscar`, { params: { q: trimmed, limit: 20 } });

  const data = response.data;
  let clientesList: any[] = [];

  if (Array.isArray(data)) {
    clientesList = data;
  } else if (data && typeof data === 'object') {
    clientesList = data.data || data.clientes || [];
  }

  return clientesList.map((c: any) => ({
    codigo_cliente_kunnr: c.codigo_cliente_kunnr,
    nombre_name1: c.nombre_name1,
    sucursal_name2: c.sucursal_name2,
  }));
};

export const getDireccionesCliente = async (
  codigo_cliente_kunnr: number
): Promise<DireccionCliente[]> => {
  const response = await api.get(`/clientes/clientes/${codigo_cliente_kunnr}/direcciones`);
  return response.data?.data ?? [];
};

export const getMaterialesCliente = async (
  _codigo_cliente_kunnr: number
): Promise<MaterialServicio[]> => {
  // El backend v2 ya no expone materiales por cliente directamente;
  // los materiales se derivan a través de la solicitud. Devolver lista vacía
  // para no romper la UI; el flujo de asignación manual se maneja en otro paso.
  return [];
};
