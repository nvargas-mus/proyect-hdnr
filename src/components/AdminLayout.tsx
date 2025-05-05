import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import "../styles/AdminStyle.css";

const AdminLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('');
  const [openSubmenu, setOpenSubmenu] = useState('');

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
      <div className="row g-0">
        {/* Menú lateral */}
        <nav className="col-md-2 d-none d-md-block sidebar-wrapper" style={{ 
          position: 'fixed', 
          top: 0, 
          bottom: 0, 
          left: 0, 
          zIndex: 100, 
          padding: '48px 0 0',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}>
          <div className="sidebar-title">
            <h2>Gestión Logística</h2>
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
                  <span>Dashboard</span>
                </button>
              </li>
              
              {/* Crear Solicitud (antes Filtrar Solicitudes) */}
              <li>
                <button
                  className={`menu-item ${activeTab === 'crearSolicitud' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/crear-solicitud', 'crearSolicitud')}
                >
                  <i className="fa fa-plus-circle"></i>
                  <span>Crear Nueva Solicitud</span>
                </button>
              </li>
              
              <li>
                <button
                  className={`menu-item ${activeTab === 'ultimasSolicitudes' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/solicitudes', 'ultimasSolicitudes')}
                >
                  <i className="fa fa-file-alt"></i>
                  <span>Solicitudes</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'contratos' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/contratos', 'contratos')}
                >
                  <i className="fa fa-file-contract"></i>
                  <span>Contratos</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'gestionClientes' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/clientes', 'gestionClientes')}
                >
                  <i className="fa fa-users"></i>
                  <span>Clientes</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'transportistas' ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin/transportistas', 'transportistas')}
                >
                  <i className="fa fa-truck"></i>
                  <span>Transportistas</span>
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
                  <span>Maestros</span>
                  <i className="fa fa-chevron-right chevron-icon"></i>
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
                  <span>Administración</span>
                  <i className="fa fa-chevron-right chevron-icon"></i>
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
                <i className="fa fa-sign-out-alt"></i> Cerrar Sesión
              </button>
            </div>
          </div>
        </nav>

        {/* Spacer column */}
        <div className="col-md-2"></div>

        {/* Contenido principal */}
        <main role="main" className="col-md-10 px-4 py-4 main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;