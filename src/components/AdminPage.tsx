import { useState } from 'react';
import { getClienteById, asignarClientesAUsuario } from '../services/adminService';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('gestionUsuarios'); 
  const [usuarioId, setUsuarioId] = useState('');
  const [usuarioInfo, setUsuarioInfo] = useState<any>(null);
  const [clienteInput, setClienteInput] = useState('');
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [message, setMessage] = useState('');

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

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Menú lateral */}
        <nav className="col-md-2 d-none d-md-block bg-light sidebar">
          <div className="sidebar-sticky">
            <ul className="nav flex-column">
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeTab === 'ultimasSolicitudes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ultimasSolicitudes')}
                >
                  Ultimas Solicitudes
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeTab === 'gestionUsuarios' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gestionUsuarios')}
                >
                  Gestion Usuarios
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeTab === 'tablaSolicitudes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tablaSolicitudes')}
                >
                  Tabla Solicitudes
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Contenido principal */}
        <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
          {activeTab === 'gestionUsuarios' && (
            <div>
              <h2>Gestion Usuarios - Asociar Usuario a Clientes</h2>
              <div className="form-group">
                <label>ID USUARIO</label>
                <input
                  type="text"
                  className="form-control"
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={fetchUsuarioInfo}>
                  Buscar Usuario
                </button>
              </div>
              {usuarioInfo && (
                <div className="card mt-3">
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
                    <button className="btn btn-secondary" type="button" onClick={handleAddCliente}>
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
              <button className="btn btn-success mt-3" onClick={handleAsignarClientes}>
                Vincular clientes a usuario
              </button>
              {message && <div className="alert alert-info mt-3">{message}</div>}
            </div>
          )}
          {activeTab === 'ultimasSolicitudes' && (
            <div>
              <h2>Ultimas Solicitudes</h2>
              <p>Contenido de Ultimas Solicitudes...</p>
            </div>
          )}
          {activeTab === 'tablaSolicitudes' && (
            <div>
              <h2>Tabla Solicitudes</h2>
              <p>Contenido de Tabla Solicitudes...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;

