import React, { useState } from 'react';
import { loginUser, getUserRoles } from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, contrasena });
      
      const usuarioId = response.usuario_id || response.userId;
      const token = response.token;

      if (!usuarioId) {
        throw new Error('No se recibió el ID del usuario en la respuesta');
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('usuario_id', usuarioId.toString());
      localStorage.setItem('user_email', email);

      window.dispatchEvent(new Event('localStorageUpdated'));

      const roles = await getUserRoles(usuarioId);

      if (roles && roles.length > 0) {
        const userRole = roles[0];
        setMessage('Login exitoso.');
        if (userRole.rol_id === 1) {
          navigate('/admin');
        } else if (userRole.rol_id === 2) {
          navigate('/home');
        } else {
          navigate('/home');
        }
      } else {
        setError('No se encontraron roles para el usuario.');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : 'Error desconocido al iniciar sesión. Intenta nuevamente.';
      setError(errorMessage);
      setMessage('');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h3 className="card-title text-center">Login</h3>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contrasena" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="contrasena"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              {message && <p className="text-success">{message}</p>}
              <button type="submit" className="btn btn-primary w-100 login-button">
                Iniciar Sesión
              </button>
            </form>
            <div className="text-center mt-3">
              <p>
                ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;





