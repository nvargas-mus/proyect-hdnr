
export interface Cliente {
    codigo: number;
    nombre: string;
    sucursal: string;
  }
  
  export interface Direccion {
    id: number;
    calle: string;
    numero: string;
    comuna: string;
  }
  
  export interface Contacto {
    id: number;
    nombre: string;
    telefono: string;
    email: string;
  }
  
  export interface Declaracion {
    id: number;
    descripcion: string;
  }
  
  export interface Generador {
    id: number;
    nombre: string;
  }
  
  export interface Material {
    matnr: number;
    descripcion: string;
    unidad: string;
  }
  
  export interface Unidad {
    id: number;
    descripcion: string;
  }
  
  export interface TipoTransporte {
    id: number;
    descripcion: string;
  }
  
  export interface Capacidad {
    id: number;
    unidad_medida_id: number;
    descripcion: string;
  }
  
  export interface SolicitudFormData {
    usuario_id: number;
    codigo_cliente_kunnr: number;
    clienteDisplay: string;
    fecha_servicio_solicitada: string;
    hora_servicio_solicitada: string;
    descripcion: string;
    requiere_transporte: boolean;
    direccion_id: number | null;
    contacto_cliente_id: number;
    declaracion_id: number;
    generador_igual_cliente: boolean;
    generador_id: number;
  }
  