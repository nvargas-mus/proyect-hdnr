import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/logo.png';
import '../styles/NavbarStyle.css';


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);

  const updateLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    updateLoginStatus();
    window.addEventListener('localStorageUpdated', updateLoginStatus);

    const isAdmin = location.pathname.includes('/admin');
    const hasAdminClass = document.body.classList.contains('admin-page');
    
    setIsAdminPage(isAdmin || hasAdminClass);

    return () => {
      window.removeEventListener('localStorageUpdated', updateLoginStatus);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('user_email');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav 
      className="navbar navbar-light bg-light"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1070,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div className="container-fluid">
        <a className="navbar-brand" href="#" style={{ marginLeft: '0' }}>
          <img src={Logo} alt="Hidronor" style={{ height: '50px' }} />
        </a>
        {isLoggedIn && (
        <div className="d-flex align-items-center gap-2">
          <span className="navbar-user-greeting">
            Hola, {localStorage.getItem('user_email')?.split('@')[0]}
          </span>

            {!isAdminPage && (
              <div className="dropdown">
                <button
                  className="dropdown-toggle user-avatar-btn"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="Usuario"
                    className="rounded-circle"
                  />
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <button className="dropdown-item" onClick={() => navigate('/configuracion')}>
                      <i className="bi bi-gear me-2"></i> Configuración Usuario
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;






