import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClienteById, asignarClientesAUsuario } from '../services/adminService';
import SolicitudForm from './SolicitudForm'; 
import ContratosTable from './ContratosTable';
import TransportistasTable from './TransportistasTable';
import "../styles/AdminStyle.css";

const AdminPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [openSubmenu, setOpenSubmenu] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState<any>(null);
  const [clienteInput, setClienteInput] = useState('');
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.body.classList.add('admin-page');

    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  const fetchUsuarioInfo = async () => {
    try {
      const data = await getClienteById(usuarioId);
      setUsuarioInfo(data);
    } catch (error) {
      console.error('Error fetching usuario info', error);
      setUsuarioInfo(null);
      alert('Usuario no encontrado');
    }
  };

  const fetchClienteInfo = async (clientId: string) => {
    try {
      const data = await getClienteById(clientId);
      return data;
    } catch (error) {
      console.error('Error fetching client info', error);
      return null;
    }
  };

  const handleAddCliente = async () => {
    if (!clienteInput) return;
    const clientData = await fetchClienteInfo(clienteInput);
    if (clientData) {
      setClientesList((prev) => [...prev, clientData]);
      setClienteInput('');
    } else {
      alert('Cliente no encontrado');
    }
  };

  const handleAsignarClientes = async () => {
    const clienteIds = clientesList.map((cliente) => cliente.codigo_cliente_kunnr);
    try {
      await asignarClientesAUsuario(usuarioId, clienteIds);
      setMessage('Clientes vinculados exitosamente');
    } catch (error) {
      console.error('Error asignando clientes', error);
      setMessage('Error al vincular clientes');
    }
  };

  const fetchSolicitudes = async () => {
    if (!codigoBusqueda) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('No se encontró el token de autenticación. Por favor, inicia sesión.');
      return;
    }
  
    try {
      const response = await fetch(`http://15.229.249.223:3000/solicitudes/por-cliente/${codigoBusqueda}`, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 401) {
        alert('No autorizado: el token es inválido o ha expirado.');
        return;
      }
  
      const data = await response.json();
      setSolicitudes(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching solicitudes', error);
      alert('Error al obtener las solicitudes');
    }
  };

  const toggleSubmenu = (menu: string) => {
    if (openSubmenu === menu) {
      setOpenSubmenu('');
    } else {
      setOpenSubmenu(menu);
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
    <div className="container-fluid">
      <div className="row">
        {/* Menú lateral */}
        <nav className="col-md-2 d-none d-md-block sidebar-wrapper">
          <div className="sidebar-title">
            <h2>Gestión Logística</h2>
          </div>
          <div className="sidebar-menu">
            <ul className="nav-list">
              {/* Dashboard como elemento simple */}
              <li>
                <button
                  className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <i className="fa fa-chart-bar"></i>
                  <span>Dashboard</span>
                </button>
              </li>
              
              <li>
                <button
                  className={`menu-item ${activeTab === 'filtrarSolicitudes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('filtrarSolicitudes')}
                >
                  <i className="fa fa-filter"></i>
                  <span>Filtrar Solicitudes</span>
                </button>
              </li>
              
              <li>
                <button
                  className={`menu-item ${activeTab === 'ultimasSolicitudes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ultimasSolicitudes')}
                >
                  <i className="fa fa-file-alt"></i>
                  <span>Solicitudes</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'contratos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contratos')}
                >
                  <i className="fa fa-file-contract"></i>
                  <span>Contratos</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'gestionClientes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gestionClientes')}
                >
                  <i className="fa fa-users"></i>
                  <span>Clientes</span>
                </button>
              </li>
              <li>
                <button
                  className={`menu-item ${activeTab === 'transportistas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transportistas')}
                >
                  <i className="fa fa-truck"></i>
                  <span>Transportistas</span>
                </button>
              </li>
              
              {/* Menú desplegable de Maestros */}
              <li className="submenu-container">
                <button
                  className={`menu-item ${openSubmenu === 'maestros' ? 'expanded' : ''} ${
                    activeTab === 'maestros' || 
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
                      onClick={() => setActiveTab('centros')}
                    >
                      <i className="fa fa-building"></i>
                      <span>Centros</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'declaraciones' ? 'active' : ''}`}
                      onClick={() => setActiveTab('declaraciones')}
                    >
                      <i className="fa fa-file-signature"></i>
                      <span>Declaraciones</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'unidadesReferenciales' ? 'active' : ''}`}
                      onClick={() => setActiveTab('unidadesReferenciales')}
                    >
                      <i className="fa fa-ruler"></i>
                      <span>Unidades Referenciales</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'lineasDescarga' ? 'active' : ''}`}
                      onClick={() => setActiveTab('lineasDescarga')}
                    >
                      <i className="fa fa-download"></i>
                      <span>Líneas de Descarga</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'tiposTransporte' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tiposTransporte')}
                    >
                      <i className="fa fa-shipping-fast"></i>
                      <span>Tipos de Transporte</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'referencias' ? 'active' : ''}`}
                      onClick={() => setActiveTab('referencias')}
                    >
                      <i className="fa fa-bookmark"></i>
                      <span>Referencias</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'capacidadesTransporte' ? 'active' : ''}`}
                      onClick={() => setActiveTab('capacidadesTransporte')}
                    >
                      <i className="fa fa-weight"></i>
                      <span>Capacidades de Transporte</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'generadores' ? 'active' : ''}`}
                      onClick={() => setActiveTab('generadores')}
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
                    activeTab === 'administracion' || 
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
                      onClick={() => setActiveTab('gestionUsuarios')}
                    >
                      <i className="fa fa-user-cog"></i>
                      <span>Gestión Usuarios</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'gestionRoles' ? 'active' : ''}`}
                      onClick={() => setActiveTab('gestionRoles')}
                    >
                      <i className="fa fa-user-tag"></i>
                      <span>Gestión de Roles</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'gestionPermisos' ? 'active' : ''}`}
                      onClick={() => setActiveTab('gestionPermisos')}
                    >
                      <i className="fa fa-lock"></i>
                      <span>Gestión de Permisos</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`submenu-item ${activeTab === 'asignaciones' ? 'active' : ''}`}
                      onClick={() => setActiveTab('asignaciones')}
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

        {/* Contenido principal */}
        <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4 main-content">
          {activeTab === 'gestionUsuarios' && (
            <div>
              <h2>Gestión Usuarios - Asociar Usuario a Clientes</h2>
              <div className="form-group">
                <label>ID USUARIO</label>
                <input
                  type="text"
                  className="form-control"
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                />
                <button className="btn form-button-primary mt-2" onClick={fetchUsuarioInfo}>
                  Buscar Usuario
                </button>
              </div>
              {usuarioInfo && (
                <div className="card mt-3 p-4">
                  <div className="card-body">
                    <h5 className="card-title">Datos del Usuario</h5>
                    <p>Nombre: {usuarioInfo.nombre_usuario || 'N/A'}</p>
                    <p>Email: {usuarioInfo.email || 'N/A'}</p>
                    <p>Verificado: {usuarioInfo.verificado ? 'Sí' : 'No'}</p>
                    <p>Fecha Creación: {usuarioInfo.fecha_creacion}</p>
                    <p>Última Actualización: {usuarioInfo.ultima_actualizacion}</p>
                  </div>
                </div>
              )}
              <hr />
              <div className="form-group">
                <label>ID CLIENTE</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={clienteInput}
                    onChange={(e) => setClienteInput(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn form-button-outline" type="button" onClick={handleAddCliente}>
                      Agregar otro ID Cliente
                    </button>
                  </div>
                </div>
              </div>
              {clientesList.length > 0 && (
                <div className="mt-3">
                  <h5>Clientes agregados:</h5>
                  <ul className="list-group">
                    {clientesList.map((cliente, index) => (
                      <li key={index} className="list-group-item">
                        Código: {cliente.codigo_cliente_kunnr} - {cliente.nombre_name1} - {cliente.sucursal_name2}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="btn form-button-primary mt-3" onClick={handleAsignarClientes}>
                Vincular clientes a usuario
              </button>
              {message && <div className="alert alert-info mt-3">{message}</div>}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="content-container">
              <h2>Dashboard</h2>
              <p>Panel principal de visualización de datos y métricas del sistema.</p>
              <div className="dashboard-widgets">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Solicitudes Recientes</h5>
                        <p>Aquí se muestra el resumen de las solicitudes recientes.</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Actividad de Usuarios</h5>
                        <p>Aquí se muestra la actividad reciente de los usuarios.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-md-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Estadísticas Generales</h5>
                        <p>Resumen estadístico de la actividad del sistema.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'filtrarSolicitudes' && (
            <div>
              <h2>Filtrar Solicitudes</h2>
              <div className="form-group">
                <label>Código Cliente</label>
                <input
                  type="text"
                  className="form-control"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                />
                <button className="btn form-button-primary mt-2" onClick={fetchSolicitudes}>
                  Filtrar Solicitudes
                </button>
              </div>
              {solicitudes.length > 0 && (
                <>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID Solicitud</th>
                        <th>Fecha Solicitud</th>
                        <th>Descripción</th>
                        <th>Requiere Transporte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((solicitud) => (
                          <tr key={solicitud.solicitud_id}>
                            <td>{solicitud.solicitud_id}</td>
                            <td>{new Date(solicitud.fecha_solicitud).toLocaleString()}</td>
                            <td>{solicitud.descripcion}</td>
                            <td>{solicitud.requiere_transporte ? 'Sí' : 'No'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-between pagination-buttons">
                    <button
                      className="btn form-button-outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <i className="fa fa-chevron-left mr-1"></i> Anterior
                    </button>
                    <div className="pagination-info">
                      Mostrando {solicitudes.slice((currentPage - 1) * 10, currentPage * 10).length} de {solicitudes.length} solicitudes
                    </div>
                    <button
                      className="btn form-button-outline"
                      disabled={currentPage * 10 >= solicitudes.length}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente <i className="fa fa-chevron-right ml-1"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'ultimasSolicitudes' && (
            <div>
              <h2>Solicitudes</h2>
              <p>Gestión de solicitudes...</p>
            </div>
          )}

          {activeTab === 'tablaSolicitudes' && (
            <div>
              <h2>Tabla Solicitudes</h2>
              <p>Contenido de Tabla Solicitudes...</p>
            </div>
          )}

          {activeTab === 'busquedaSolicitudes' && (
            <div>
              <h2>Búsqueda Solicitudes</h2>
              <div className="form-group">
                <label>Código Cliente</label>
                <input
                  type="text"
                  className="form-control"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                />
                <button className="btn form-button-primary mt-2" onClick={fetchSolicitudes}>
                  Buscar Solicitudes
                </button>
              </div>
              {solicitudes.length > 0 && (
                <>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID Solicitud</th>
                        <th>Fecha Solicitud</th>
                        <th>Descripción</th>
                        <th>Requiere Transporte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes
                        .slice((currentPage - 1) * 10, currentPage * 10)
                        .map((solicitud) => (
                          <tr key={solicitud.solicitud_id}>
                            <td>{solicitud.solicitud_id}</td>
                            <td>{new Date(solicitud.fecha_solicitud).toLocaleString()}</td>
                            <td>{solicitud.descripcion}</td>
                            <td>{solicitud.requiere_transporte ? 'Sí' : 'No'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-between pagination-buttons">
                    <button
                      className="btn form-button-outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <i className="fa fa-chevron-left mr-1"></i> Anterior
                    </button>
                    <div className="pagination-info">
                      Mostrando {solicitudes.slice((currentPage - 1) * 10, currentPage * 10).length} de {solicitudes.length} solicitudes
                    </div>
                    <button
                      className="btn form-button-outline"
                      disabled={currentPage * 10 >= solicitudes.length}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente <i className="fa fa-chevron-right ml-1"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'crearSolicitud' && (
            <div>
              <SolicitudForm />
            </div>
          )}

          {/* Tab para Contratos */}
          {activeTab === 'contratos' && (
            <div>
              <ContratosTable />
            </div>
          )}

          {/* Pestaña de Transportistas */}
          {activeTab === 'transportistas' && (
            <div>
              <TransportistasTable />
            </div>
          )}
          
          {activeTab === 'gestionClientes' && (
            <div>
              <h2>Gestión de Clientes</h2>
              <p>Administración de clientes del sistema...</p>
            </div>
          )}

          {/* Opciones de submenú Administración */}
          {activeTab === 'gestionRoles' && (
            <div>
              <h2>Gestión de Roles</h2>
              <p>Administración de roles del sistema...</p>
            </div>
          )}
          
          {activeTab === 'gestionPermisos' && (
            <div>
              <h2>Gestión de Permisos</h2>
              <p>Configuración de permisos para usuarios y roles...</p>
            </div>
          )}
          
          {activeTab === 'asignaciones' && (
            <div>
              <h2>Asignaciones</h2>
              <p>Asignación de roles a usuarios...</p>
            </div>
          )}

          {/* Opciones de submenú Maestros */}
          {activeTab === 'centros' && (
            <div>
              <h2>Centros</h2>
              <p>Gestión de centros operativos...</p>
            </div>
          )}
          
          {activeTab === 'declaraciones' && (
            <div>
              <h2>Declaraciones</h2>
              <p>Administración de declaraciones del sistema...</p>
            </div>
          )}
          
          {activeTab === 'unidadesReferenciales' && (
            <div>
              <h2>Unidades Referenciales</h2>
              <p>Gestión de unidades de medida y referencia...</p>
            </div>
          )}
          
          {activeTab === 'lineasDescarga' && (
            <div>
              <h2>Líneas de Descarga</h2>
              <p>Administración de líneas de descarga...</p>
            </div>
          )}
          
          {activeTab === 'tiposTransporte' && (
            <div>
              <h2>Tipos de Transporte</h2>
              <p>Gestión de tipos de transporte disponibles...</p>
            </div>
          )}
          
          {activeTab === 'referencias' && (
            <div>
              <h2>Referencias</h2>
              <p>Administración de referencias del sistema...</p>
            </div>
          )}
          
          {activeTab === 'capacidadesTransporte' && (
            <div>
              <h2>Capacidades de Transporte</h2>
              <p>Configuración de capacidades para diferentes tipos de transporte...</p>
            </div>
          )}
          
          {activeTab === 'generadores' && (
            <div>
              <h2>Generadores</h2>
              <p>Gestión de generadores del sistema...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;







