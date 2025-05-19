import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import "../styles/AdminStyle.css";

const AdminLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [openSubmenu, setOpenSubmenu] = useState('');
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMenuCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;

    if (path === '/admin') {
      setActiveTab('dashboard');
      setOpenSubmenu('');
    } 
    else if (path.includes('/admin/contratos')) setActiveTab('contratos');
    else if (path.includes('/admin/crear-solicitud')) setActiveTab('crearSolicitud');
    else if (path.includes('/admin/solicitudes')) setActiveTab('ultimasSolicitudes');
    else if (path.includes('/admin/transportistas')) setActiveTab('transportistas');
    else if (path.includes('/admin/clientes')) setActiveTab('gestionClientes');
    else if (path.includes('/admin/usuarios')) {
      setActiveTab('gestionUsuarios');
      setOpenSubmenu('administracion');
    }
    else if (path.includes('/admin/roles')) {
      setActiveTab('gestionRoles');
      setOpenSubmenu('administracion');
    }
    else if (path.includes('/admin/permisos')) {
      setActiveTab('gestionPermisos');
      setOpenSubmenu('administracion');
    }
    else if (path.includes('/admin/asignaciones')) {
      setActiveTab('asignaciones');
      setOpenSubmenu('administracion');
    }
    else if (path.includes('/admin/centros')) {
      setActiveTab('centros');
      setOpenSubmenu('maestros');
    }
    else if (path.includes('/admin/declaraciones')) {
      setActiveTab('declaraciones');
      setOpenSubmenu('maestros');
    }
    else if (path.includes('/admin/unidades-referenciales')) {
      setActiveTab('unidadesReferenciales');
      setOpenSubmenu('maestros');
    }
    else if (path.includes('/admin/lineas-descarga')) {
      setActiveTab('lineasDescarga');
      setOpenSubmenu('maestros');
    }
    else if (path.includes('/admin/tipos-transporte')) {
      setActiveTab('tiposTransporte');
      setOpenSubmenu('maestros');
    }
    else if (path.includes('/admin/referencias')) {
      setActiveTab('referencias');
      setOpenSubmenu('maestros');
    }
    else if (path.includes('/admin/capacidades-transporte')) {
      setActiveTab('capacidadesTransporte');
      setOpenSubmenu('maestros');
    }
    else if (path.includes('/admin/generadores')) {
      setActiveTab('generadores');
      setOpenSubmenu('maestros');
    }
    
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, [location.pathname]);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? '' : menu);
  };

  const handleNavigation = (route: string, tab: string, submenu: string = '') => {
    navigate(route);
    setActiveTab(tab);
    if (submenu) {
      setOpenSubmenu(submenu);
    }

    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('user_email');
    
    const event = new Event('localStorageUpdated');
    window.dispatchEvent(event);
    
    navigate('/');
  };

  return (
    <div className="container-fluid px-0">
      <button 
        className="menu-toggle-btn d-md-none" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1050,
          background: '#243c6c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '1.2rem'
        }}
      >
        <i className={`fa ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <div className="row g-0">
        {/* Menú lateral con clases responsivas */}
        <nav 
          className={`sidebar-wrapper ${mobileMenuOpen ? 'mobile-open' : ''} ${menuCollapsed ? 'collapsed' : ''}`} 
          style={{ 
            position: 'fixed', 
            top: 0, 
            bottom: 0, 
            left: 0, 
            zIndex: 1030,
            padding: '60px 0 0',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            overflowY: 'auto',
            width: '16.666%', 
            transition: 'all 0.3s ease',
            backgroundColor: '#ffffff'
          }}
        >
          <div className="sidebar-header d-flex justify-content-between align-items-center px-3 py-2" 
            style={{ paddingTop: '50px' }}>
            <h2 className="sidebar-title">Gestión Logística</h2>

            <button 
              className="collapse-toggle d-none d-md-block"
              onClick={() => setMenuCollapsed(!menuCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <i className={`fa ${menuCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
          </div>
          <div className="sidebar-menu" style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
            <ul className="nav-list">
              {/* Dashboard */}
              <li>
                <button
                  className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin', 'dashboard')}
                >
                  <i className="fa fa-chart-bar"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Dashboard</span>
                </button>
              </li>
              
              {/* Crear Solicitud */}
              <li>
                <button
                  className={`menu-item ${activeTab === 'crearSolicitud' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/crear-solicitud', 'crearSolicitud')}
                >
                  <i className="fa fa-plus-circle"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Crear Nueva Solicitud</span>
                </button>
              </li>
              
              <li>
                <button
                  className={`menu-item ${activeTab === 'ultimasSolicitudes' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/solicitudes', 'ultimasSolicitudes')}
                >
                  <i className="fa fa-file-alt"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Solicitudes</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'contratos' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/contratos', 'contratos')}
                >
                  <i className="fa fa-file-contract"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Contratos</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'gestionClientes' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/clientes', 'gestionClientes')}
                >
                  <i className="fa fa-users"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Clientes</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'transportistas' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/transportistas', 'transportistas')}
                >
                  <i className="fa fa-truck"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Transportistas</span>
                </button>
              </li>
              
              {/* Menú desplegable de Maestros */}
              <li className="submenu-container">
                <button
                  className={`menu-item ${openSubmenu === 'maestros' ? 'expanded' : ''} ${
                    activeTab === 'centros' ||
                    activeTab === 'declaraciones' ||
                    activeTab === 'unidadesReferenciales' ||
                    activeTab === 'lineasDescarga' ||
                    activeTab === 'tiposTransporte' ||
                    activeTab === 'referencias' ||
                    activeTab === 'capacidadesTransporte' ||
                    activeTab === 'generadores' ? 
                    'active' : ''
                  }`}
                  onClick={() => toggleSubmenu('maestros')}
                >
                  <i className="fa fa-cog"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Maestros</span>
                  <i className={`fa fa-chevron-right chevron-icon ${menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}`}></i>
                </button>
                
                {/* Submenú de Maestros */}
                <ul className={`submenu ${openSubmenu === 'maestros' ? 'open' : ''}`}>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'centros' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/centros', 'centros', 'maestros')}
                    >
                      <i className="fa fa-building"></i>
                      <span>Centros</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'declaraciones' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/declaraciones', 'declaraciones', 'maestros')}
                    >
                      <i className="fa fa-file-signature"></i>
                      <span>Declaraciones</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'unidadesReferenciales' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/unidades-referenciales', 'unidadesReferenciales', 'maestros')}
                    >
                      <i className="fa fa-ruler"></i>
                      <span>Unidades Referenciales</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'lineasDescarga' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/lineas-descarga', 'lineasDescarga', 'maestros')}
                    >
                      <i className="fa fa-download"></i>
                      <span>Líneas de Descarga</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'tiposTransporte' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/tipos-transporte', 'tiposTransporte', 'maestros')}
                    >
                      <i className="fa fa-shipping-fast"></i>
                      <span>Tipos de Transporte</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'referencias' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/referencias', 'referencias', 'maestros')}
                    >
                      <i className="fa fa-bookmark"></i>
                      <span>Referencias</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'capacidadesTransporte' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/capacidades-transporte', 'capacidadesTransporte', 'maestros')}
                    >
                      <i className="fa fa-weight"></i>
                      <span>Capacidades de Transporte</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'generadores' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/generadores', 'generadores', 'maestros')}
                    >
                      <i className="fa fa-industry"></i>
                      <span>Generadores</span>
                    </button>
                  </li>
                </ul>
              </li>
              
              {/* Menú desplegable de Administración */}
              <li className="submenu-container">
                <button
                  className={`menu-item admin-item ${openSubmenu === 'administracion' ? 'expanded' : ''} ${
                    activeTab === 'gestionUsuarios' ||
                    activeTab === 'gestionRoles' ||
                    activeTab === 'gestionPermisos' ||
                    activeTab === 'asignaciones' ? 
                    'active' : ''
                  }`}
                  onClick={() => toggleSubmenu('administracion')}
                >
                  <i className="fa fa-wrench"></i>
                  <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Administración</span>
                  <i className={`fa fa-chevron-right chevron-icon ${menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}`}></i>
                </button>
                
                {/* Submenú de Administración */}
                <ul className={`submenu ${openSubmenu === 'administracion' ? 'open' : ''}`}>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'gestionUsuarios' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/usuarios', 'gestionUsuarios', 'administracion')}
                    >
                      <i className="fa fa-user-cog"></i>
                      <span>Gestión Usuarios</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'gestionRoles' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/roles', 'gestionRoles', 'administracion')}
                    >
                      <i className="fa fa-user-tag"></i>
                      <span>Gestión de Roles</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'gestionPermisos' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/permisos', 'gestionPermisos', 'administracion')}
                    >
                      <i className="fa fa-lock"></i>
                      <span>Gestión de Permisos</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'asignaciones' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/admin/asignaciones', 'asignaciones', 'administracion')}
                    >
                      <i className="fa fa-tasks"></i>
                      <span>Asignaciones</span>
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                <i className="fa fa-sign-out-alt"></i> 
                <span className={menuCollapsed ? 'd-none d-md-inline collapse-text' : ''}>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Overlay para cerrar menú móvil */}
        {mobileMenuOpen && (
          <div 
            className="menu-overlay d-md-none" 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1025
            }}
          ></div>
        )}

        <div className={`d-none d-md-block ${menuCollapsed ? 'col-md-1' : 'col-md-2'}`}></div>
          <main 
            role="main" 
            className={`px-4 py-4 main-content ${menuCollapsed ? 'collapsed-menu' : ''}`}
            style={{
              marginLeft: menuCollapsed ? '60px' : '16.666%',
              width: menuCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 16.666%)',
              marginTop: '60px',
              transition: 'all 0.3s ease'
            }}
          >
            <Outlet />
          </main>

      </div>
    </div>
  );
};

export default AdminLayout;