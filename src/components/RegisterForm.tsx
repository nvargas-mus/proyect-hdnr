import React, { useState } from 'react';
import { registerUser } from '../services/authService';
import { Link, useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser({
        nombre_usuario: nombreUsuario,
        email,
        contrasena,
      });
      setMessage('Registro exitoso. Ahora puedes iniciar sesión.');
      setError('');

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Error al registrar. Verifica los datos ingresados.');
      setMessage('');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h3 className="card-title text-center">Registro</h3>
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="nombreUsuario" className="form-label">Nombre de Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  id="nombreUsuario"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
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
                <label htmlFor="contrasena" className="form-label">Contraseña</label>
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
              <button type="submit" className="btn btn-primary w-100">Registrarse</button>
            </form>
            <div className="text-center mt-3">
              <p>¿Ya tienes una cuenta? <Link to="/">Inicia sesión aquí</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

