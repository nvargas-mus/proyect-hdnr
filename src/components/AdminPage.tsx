import "../styles/AdminStyle.css";

const AdminPage = (): JSX.Element => {
  
  return (
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
  );
};

export default AdminPage;







