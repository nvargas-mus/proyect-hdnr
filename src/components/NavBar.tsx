import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/logo.png';

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
    <nav className="navbar navbar-light bg-light">
      <div className="container">
        <a className="navbar-brand" href="#">
          <img src={Logo} alt="Hidronor" style={{ height: '50px' }} />
        </a>
        {isLoggedIn && !isAdminPage && (
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;






