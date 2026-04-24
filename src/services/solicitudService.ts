import api from './api';

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export interface Contacto {
  codigo_cliente_kunnr: number;
  nombre: string;
  telefono: string;
  email: string;
  referencia_id: number;
  [key: string]: unknown;
}

export interface CompletarSolicitudData {
  solicitud_id: number;
  otros_campos?: unknown;
}

export interface Referencia {
  referencia_id: number;
  nombre_referencia: string;
  categoria_referencia: string;
}

export interface Capacidad {
  capacidad_id: number;
  valor_capacidad: string;
  unidad_medida_id: number;
  nombre_unidad: string;
}

/**
 * Crea una solicitud en el flujo de un paso.
 * En el backend v2 corresponde a POST /operaciones/solicitudes/borrador
 * (la completación con detalles y materiales se hace en SolicitudCompletionForm
 * via POST /operaciones/solicitudes/:id/ingresar — aquí seguimos el flujo legacy
 * del frontend: borrador primero, detalles después).
 */
export const crearSolicitud = async (solicitudData: {
  usuario_id: number;
  codigo_cliente_kunnr: number;
  fecha_servicio_solicitada: string;
  hora_servicio_solicitada: string;
  descripcion: string;
  requiere_transporte: boolean;
  direccion_id: number | null;
  contacto_cliente_id: number;
  declaracion_id: number;
  generador_id: number | null;
  generador_igual_cliente: boolean;
}) => {
  const { usuario_id: _usuario_id, direccion_id, ...rest } = solicitudData;

  // El backend v2 exige estos como enteros positivos siempre (no acepta 0 ni null):
  //   direccion_id, contacto_cliente_id, declaracion_id, generador_id.
  // Cuando generador_igual_cliente=true, el backend espera el mismo kunnr
  // como generador_id (el cliente es su propio generador).
  // Si direccion_id viene null (caso sin transporte), tomamos la primera dirección
  // del cliente para cumplir con el schema.
  let direccionResuelta = direccion_id;
  if (!direccionResuelta) {
    const direcciones = await getDirecciones(rest.codigo_cliente_kunnr);
    direccionResuelta = direcciones?.[0]?.direccion_id ?? null;
  }

  if (!direccionResuelta) {
    throw new Error(
      'Este cliente no tiene direcciones registradas. Agrega una dirección antes de crear la solicitud.'
    );
  }

  const body = {
    ...rest,
    direccion_id: direccionResuelta,
    hora_servicio_solicitada:
      rest.hora_servicio_solicitada?.length === 8
        ? rest.hora_servicio_solicitada.substring(0, 5)
        : rest.hora_servicio_solicitada,
    generador_id: rest.generador_igual_cliente
      ? rest.codigo_cliente_kunnr
      : rest.generador_id,
  };

  const response = await api.post('/operaciones/solicitudes/borrador', body);
  return response.data;
};

export const getClientesAsociados = async (q: string = '') => {
  const trimmed = q.trim();
  // Sin término: usar el listado general de clientes asignados al usuario
  if (trimmed.length < 1) {
    const response = await api.get('/clientes/clientes', {
      params: { limit: 50, offset: 0 },
    });
    return response.data;
  }
  // Con término: usar endpoint de búsqueda (autocomplete)
  const response = await api.get('/clientes/clientes/buscar', {
    params: { q: trimmed, limit: 20 },
  });
  return response.data;
};

export const getDirecciones = async (codigo_cliente_kunnr: number) => {
  const response = await api.get(`/clientes/clientes/${codigo_cliente_kunnr}/direcciones`);
  return response.data?.data ?? [];
};

export const getContactos = async (codigo_cliente: number): Promise<Contacto[]> => {
  const response = await api.get(`/clientes/clientes/${codigo_cliente}/contactos`);
  const list = (response.data?.data ?? []) as Contacto[];
  return list;
};

export const getDeclaraciones = async () => {
  const response = await api.get('/operaciones/declaraciones');
  return response.data?.data ?? [];
};

export const getGeneradores = async (rut: string = '') => {
  if (!rut) {
    // El endpoint v2 requiere filtro por RUT. Sin RUT no hay lista general.
    return [];
  }
  const response = await api.get('/clientes/generadores', { params: { rut } });
  const list = (response.data?.data ?? []) as any[];
  return list.map((g) => ({
    id: g.codigo_cliente_kunnr,
    nombre: [g.nombre_name1, g.sucursal_name2].filter(Boolean).join(' - '),
    rut: g.rut_stcd1,
  }));
};

const mapMaterialCotizado = (m: any) => ({
  material_matnr: m.codigo_material_matnr ?? m.material_matnr,
  nombre_material_maktg: m.nombre_material_maktg ?? m.descripcion ?? '',
  unidad_venta_kmein: m.unidad_venta_kmein ?? m.unidad_medida ?? '',
});

export const getMaterialesResiduos = async (solicitudId: number) => {
  const response = await api.get(`/operaciones/solicitudes/${solicitudId}/materiales-cotizados`);
  const payload = response.data?.data ?? response.data ?? {};
  const residuos = (payload.residuos ?? []) as any[];
  return residuos.map(mapMaterialCotizado);
};

export const getMaterialesServicios = async (solicitudId: number) => {
  const response = await api.get(`/operaciones/solicitudes/${solicitudId}/materiales-cotizados`);
  const payload = response.data?.data ?? response.data ?? {};
  // El backend separa servicios_transporte de residuos, pero en dev muchos clientes
  // no tienen servicios dedicados. Si el array de transporte viene vacío, usar
  // el resto como fallback para que la UI permita avanzar.
  const serviciosTransporte = (payload.servicios_transporte ?? []) as any[];
  if (serviciosTransporte.length > 0) {
    return serviciosTransporte.map(mapMaterialCotizado);
  }
  const otros = [
    ...((payload.servicios_no_transporte ?? []) as any[]),
    ...((payload.residuos ?? []) as any[]),
  ];
  return otros.map(mapMaterialCotizado);
};

export const getUnidadesReferenciales = async () => {
  const response = await api.get('/operaciones/unidades-referenciales');
  return response.data?.data ?? [];
};

export const getTiposTransporte = async () => {
  const response = await api.get('/flota/tipos-transporte');
  return response.data?.data ?? [];
};

export const getCapacidadesTransporte = async (): Promise<Capacidad[]> => {
  const response = await api.get('/flota/capacidades-transporte');
  return response.data?.data ?? [];
};

export const completarSolicitud = async (data: CompletarSolicitudData) => {
  const response = await api.post(`/operaciones/solicitudes/${data.solicitud_id}/completar`);
  return response.data;
};

export const postDireccion = async (direccionData: {
  codigo_cliente_kunnr: number;
  calle: string;
  numero: string;
  complemento: string;
  comuna: string;
  region: string;
  contacto_terreno_id: number;
}) => {
  // Backend v2 exige latitud/longitud obligatorias. El frontend legacy no las
  // recolecta, usamos placeholders neutros en Chile continental para desbloquear
  // la operación sin cambiar la UI.
  const payload = {
    ...direccionData,
    latitud: -33.4489,
    longitud: -70.6693,
  };
  const response = await api.post('/clientes/direcciones', payload);
  return response.data;
};

export const postContacto = async (contactoData: Contacto) => {
  const response = await api.post('/clientes/contactos', contactoData);
  return response.data;
};

interface MaterialInput {
  codigo_material_matnr: number;
  cantidad_declarada: number;
  unidad_medida_id: number;
}

/**
 * Completa una solicitud en estado Borrador enviándola al estado ListaParaAgendar.
 * El backend v2 exige el payload completo (no hay endpoint para "solo materiales"):
 * leemos los datos de la solicitud y los mandamos junto con los materiales y el
 * detalle de transporte (con o sin).
 */
export const ingresarSolicitud = async (
  solicitudId: number,
  opts:
    | {
        requiere_transporte: true;
        materiales: MaterialInput[];
      }
    | {
        requiere_transporte: false;
        materiales: MaterialInput[];
        tipo_transporte_id: number;
        capacidad_id: number;
        unidad_medida_id_det: number;
      }
) => {
  // Leer la solicitud actual para obtener los campos comunes que ya están en el borrador
  const solRes = await api.get(`/operaciones/solicitudes/${solicitudId}`);
  const sol = solRes.data ?? {};

  // Las fechas llegan como ISO "YYYY-MM-DDTHH:MM:SS.sssZ"; el schema exige "YYYY-MM-DD"
  const fechaRaw: string | undefined = sol.fecha_servicio_solicitada;
  const fecha = fechaRaw ? String(fechaRaw).substring(0, 10) : '';
  const horaRaw: string | undefined =
    sol.hora_servicio_solicitada ??
    (fechaRaw && fechaRaw.length >= 16 ? fechaRaw.substring(11, 16) : undefined);
  const hora =
    typeof horaRaw === 'string' && horaRaw.length >= 5
      ? horaRaw.substring(0, 5)
      : undefined;

  const common = {
    codigo_cliente_kunnr: sol.codigo_cliente_kunnr,
    fecha_servicio_solicitada: fecha,
    ...(hora ? { hora_servicio_solicitada: hora } : {}),
    direccion_id: sol.direccion_id,
    contacto_cliente_id: sol.contacto_cliente_id ?? undefined,
    declaracion_id: sol.declaracion_id ?? undefined,
    generador_id: sol.generador_id ?? sol.codigo_cliente_kunnr,
    generador_igual_cliente: sol.generador_igual_cliente ?? true,
    ...(sol.descripcion ? { descripcion: sol.descripcion } : {}),
  };

  const body = opts.requiere_transporte
    ? { ...common, requiere_transporte: true, materiales: opts.materiales }
    : {
        ...common,
        requiere_transporte: false,
        tipo_transporte_id: opts.tipo_transporte_id,
        capacidad_id: opts.capacidad_id,
        unidad_medida_id_det: opts.unidad_medida_id_det,
        materiales: opts.materiales,
      };

  const response = await api.post(
    `/operaciones/solicitudes/${solicitudId}/ingresar`,
    body
  );
  return response.data;
};

/** @deprecated usar `ingresarSolicitud`. Se mantiene por compatibilidad. */
export const crearSolicitudMateriales = async (data: {
  solicitud_id: number;
  materiales: MaterialInput[];
}) => {
  return ingresarSolicitud(data.solicitud_id, {
    requiere_transporte: true,
    materiales: data.materiales,
  });
};

export const getSolicitudesPorUsuario = async (usuario_id: number, _include?: string) => {
  const response = await api.get('/operaciones/solicitudes', {
    params: { usuario_id, limit: 100, offset: 0 },
  });
  return response.data?.data ?? [];
};

export const crearDetalleConTransporte = async (data: {
  solicitud_id: number;
  codigo_material_matnr: number;
}) => {
  if (!data.solicitud_id || !data.codigo_material_matnr) {
    throw new Error('Datos incompletos para crear detalle con transporte');
  }

  try {
    const response = await api.post(
      `/operaciones/solicitudes/${data.solicitud_id}/detalle-transporte`,
      { codigo_material_matnr: data.codigo_material_matnr }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error al crear detalle con transporte:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as Record<string, unknown>).response === 'object'
    ) {
      const err = error as { response: { status: number; data?: { error?: { message?: string }; message?: string } } };
      const msg = err.response.data?.error?.message || err.response.data?.message || 'Error en la solicitud';
      throw new Error(`Error ${err.response.status}: ${msg}`);
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'request' in error
    ) {
      throw new Error('No se recibió respuesta del servidor');
    } else {
      throw error;
    }
  }
};

export const crearDetalleSinTransporte = async (payload: {
  solicitud_id: number;
  tipo_transporte_id: number;
  capacidad_id: number;
  unidad_medida_id: number;
}) => {
  const { solicitud_id, ...body } = payload;
  const response = await api.post(
    `/operaciones/solicitudes/${solicitud_id}/detalle-sin-transporte`,
    body
  );
  return response.data;
};

export const getReferencias = async () => {
  const response = await api.get('/clientes/referencias');
  return response.data?.data ?? [];
};
