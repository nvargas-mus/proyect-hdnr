import { useState } from 'react';
import { getClienteById, asignarClientesAUsuario } from '../services/adminService';
import SolicitudForm from './SolicitudForm'; 
import ContratosTable from './ContratosTable';
import "../styles/AdminStyle.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('gestionUsuarios'); 
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState<any>(null);
  const [clienteInput, setClienteInput] = useState('');
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Menú lateral */}
        <nav className="col-md-2 d-none d-md-block">
          <div className="sidebar-menu">
            <ul>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'ultimasSolicitudes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ultimasSolicitudes')}
                >
                  Últimas Solicitudes
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'gestionUsuarios' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gestionUsuarios')}
                >
                  Gestión Usuarios
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'tablaSolicitudes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tablaSolicitudes')}
                >
                  Tabla Solicitudes
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'busquedaSolicitudes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('busquedaSolicitudes')}
                >
                  Búsqueda por Código
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'crearSolicitud' ? 'active' : ''}`}
                  onClick={() => setActiveTab('crearSolicitud')}
                >
                  Crear Solicitud
                </button>
              </li>
              {/* Opción de menú para Contratos */}
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'contratos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contratos')}
                >
                  Contratos
                </button>
              </li>
            </ul>
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

          {activeTab === 'ultimasSolicitudes' && (
            <div>
              <h2>Últimas Solicitudes</h2>
              <p>Contenido de Últimas Solicitudes...</p>
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
        </main>
      </div>
    </div>
  );
};

export default AdminPage;







