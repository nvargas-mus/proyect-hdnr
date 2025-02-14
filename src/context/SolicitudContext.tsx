import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface SolicitudData {
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

interface SolicitudContextType {
  solicitudData: SolicitudData;
  setSolicitudData: React.Dispatch<React.SetStateAction<SolicitudData>>;
  clearSolicitudData: () => void;
}

const initialData: SolicitudData = {
  usuario_id: Number(localStorage.getItem('usuario_id')) || 0,
  codigo_cliente_kunnr: 0,
  clienteDisplay: '',
  fecha_servicio_solicitada: '',
  hora_servicio_solicitada: '',
  descripcion: '',
  requiere_transporte: false,
  direccion_id: null,
  contacto_cliente_id: 0,
  declaracion_id: 0,
  generador_igual_cliente: true,
  generador_id: 0,
};

export const SolicitudContext = createContext<SolicitudContextType>({
  solicitudData: initialData,
  setSolicitudData: () => {},
  clearSolicitudData: () => {},
});

interface SolicitudProviderProps {
  children: ReactNode;
}

export const SolicitudProvider: React.FC<SolicitudProviderProps> = ({ children }) => {
  const [solicitudData, setSolicitudData] = useState<SolicitudData>(initialData);

  useEffect(() => {
    localStorage.setItem('solicitudData', JSON.stringify(solicitudData));
  }, [solicitudData]);

  useEffect(() => {
    const stored = localStorage.getItem('solicitudData');
    if (stored) {
      setSolicitudData(JSON.parse(stored));
    }
  }, []);

  const clearSolicitudData = () => {
    localStorage.removeItem('solicitudData');
    setSolicitudData(initialData);
  };

  return (
    <SolicitudContext.Provider value={{ solicitudData, setSolicitudData, clearSolicitudData }}>
      {children}
    </SolicitudContext.Provider>
  );
};

