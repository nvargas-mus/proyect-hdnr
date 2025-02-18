import axios from 'axios';

const API_URL = 'http://15.229.249.223:3000';

export const getClienteById = async (id: number | string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo datos para cliente/usuario con ID ${id}:`, error);
    throw error;
  }
};

export const asignarClientesAUsuario = async (
  usuarioId: number | string,
  clienteIds: number[]
): Promise<any> => {
  try {
    const payload = {
      usuario_id: usuarioId,
      cliente_ids: clienteIds,
    };
    const response = await axios.post(`${API_URL}/usuarios/${usuarioId}/asignar-clientes`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error asignando clientes al usuario con ID ${usuarioId}:`, error);
    throw error;
  }
};
