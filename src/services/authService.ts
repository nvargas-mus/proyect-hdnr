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

  const { token, usuario_id, rol } = response.data;

  if (token) {
    localStorage.setItem('authToken', token);
  }
  if (usuario_id) {
    localStorage.setItem('usuario_id', usuario_id.toString());
  }
  if (rol) {
    localStorage.setItem('userRole', rol);
  }
  return response.data;
};

