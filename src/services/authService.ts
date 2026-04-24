import api from './api';

export const registerUser = async (userData: {
  nombre_usuario: string;
  email: string;
  contrasena: string;
}) => {
  const response = await api.post('/iam/auth/register', userData);
  return response.data;
};

interface LoginResponseUser {
  usuario_id: number;
  nombre_usuario: string;
  email: string;
  permisos: string[];
}

interface LoginBackendResponse {
  message?: string;
  token: string;
  user: LoginResponseUser;
}

interface LoginShape {
  token: string;
  usuario_id: number;
  userId: number;
  rol?: string;
  permisos: string[];
}

const inferRoleFromPermisos = (permisos: string[]): { rolId: number; rolName: string } => {
  const set = new Set(permisos);
  // Heurística basada en los seeds reales del backend:
  //   - Admin: gestiona catálogos y roles/usuarios.
  //   - Coordinador: programa solicitudes y configura capacidad.
  //   - Cliente: tiene `soy_cliente` o solo `crear_solicitud`.
  //
  // Chequeamos coordinador ANTES que admin-por-capacidad porque
  // el Coordinador también tiene `configurar_capacidad`.
  if (set.has('gestionar_catalogos') || set.has('asignar_rol_usuario')) {
    return { rolId: 1, rolName: 'admin' };
  }
  if (set.has('programar_solicitudes') || set.has('aprobar_sobre_cupo')) {
    return { rolId: 4, rolName: 'coordinador' };
  }
  return { rolId: 2, rolName: 'cliente' };
};

export const loginUser = async (credentials: {
  email: string;
  contrasena: string;
}): Promise<LoginShape> => {
  const response = await api.post<LoginBackendResponse>('/iam/auth/login', credentials);

  const { token, user } = response.data;
  const permisos = user?.permisos ?? [];
  const { rolName } = inferRoleFromPermisos(permisos);

  if (token) {
    localStorage.setItem('authToken', token);
  }

  if (user?.usuario_id) {
    localStorage.setItem('usuario_id', user.usuario_id.toString());
  }

  localStorage.setItem('user_role', rolName);
  localStorage.setItem('user_permisos', JSON.stringify(permisos));

  return {
    token,
    usuario_id: user.usuario_id,
    userId: user.usuario_id,
    rol: rolName,
    permisos,
  };
};

export const getUserRoles = async (
  _usuario_id: number
): Promise<{ rol_id: number; nombre_rol: string }[]> => {
  const permisos = JSON.parse(localStorage.getItem('user_permisos') || '[]') as string[];
  const { rolId, rolName } = inferRoleFromPermisos(permisos);
  return [{ rol_id: rolId, nombre_rol: rolName }];
};
