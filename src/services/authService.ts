import api from './api';

export const registerUser = async (userData: {
  nombre_usuario: string;
  email: string;
  contrasena: string;
}) => {
  const response = await api.post('/usuarios/register', userData);
  return response.data;
};

export const loginUser = async (credentials: {
  email: string;
  contrasena: string;
}) => {
  const response = await api.post('/usuarios/login', credentials);

  const { token, usuario_id, userId, rol } = response.data;
  if (token) {
    localStorage.setItem('authToken', token);
  }
  const id = usuario_id || userId;
  if (id) {
    localStorage.setItem('usuario_id', id.toString());
  }
  if (rol) {
    localStorage.setItem('userRole', rol);
  }
  return response.data;
};



export const getUserRoles = async (usuario_id: number) => {
  try {
    const response = await api.get(`/usuarios_roles/usuario/${usuario_id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener roles del usuario:", error);
    throw error;
  }
};


