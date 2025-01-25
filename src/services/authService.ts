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

  const { token } = response.data;
  if (token) {
    localStorage.setItem('authToken', token); 
  }

  return response.data;
};

