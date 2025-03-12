import React, { useEffect, useState } from 'react';
import { getDashboardCoordinadorData, DashboardData } from '../services/dashboardService';
import '../styles/CoordinadorPage.css';

const CoordinadorPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchDashboardData = async () => {
    try {
      const cliente = 600141;
      const usuario = 14;
      const data = await getDashboardCoordinadorData({
        cliente,
        usuario,
        pagina: 1,
        tamano_pagina: 20,
        orden: 'fecha_solicitud',
        direccion: 'desc',
      });
      setDashboardData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="coordinador-page">
      <h2>Dashboard Coordinador Logístico</h2>
      {dashboardData && (
        <div className="dashboard-container">
          <div className="metadatos">
            <p>
              <strong>Total de resultados:</strong> {dashboardData.metadatos.total_resultados}
            </p>
            <p>
              <strong>Página actual:</strong> {dashboardData.metadatos.pagina_actual} de{' '}
              {dashboardData.metadatos.total_paginas}
            </p>
            <p>
              <strong>Tamaño de página:</strong> {dashboardData.metadatos.tamano_pagina}
            </p>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID Solicitud</th>
                <th>Cliente</th>
                <th>Nombre Cliente</th>
                <th>Sucursal</th>
                <th>Fecha Servicio</th>
                <th>Hora Servicio</th>
                <th>Transporte</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
                <th>Dirección</th>
                <th>Residuos</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.datos.map((solicitud) => (
                <tr key={solicitud.solicitud_id}>
                  <td>{solicitud.solicitud_id}</td>
                  <td>{solicitud.codigo_cliente_kunnr}</td>
                  <td>{solicitud.nombre_name1}</td>
                  <td>{solicitud.sucursal_name2}</td>
                  <td>{new Date(solicitud.fecha_servicio_solicitada).toLocaleDateString()}</td>
                  <td>{solicitud.hora_servicio_solicitada}</td>
                  <td>{solicitud.requiere_transporte ? 'Sí' : 'No'}</td>
                  <td>{solicitud.nombre_estado}</td>
                  <td>{new Date(solicitud.fecha_solicitud).toLocaleString()}</td>
                  <td>{solicitud.direccion_completa}</td>
                  <td>
                    {solicitud.residuos && solicitud.residuos.length > 0 ? (
                      <ul>
                        {solicitud.residuos.map((residuo, index) => (
                          <li key={index}>
                            {residuo.nombre_material} - {residuo.cantidad_declarada} {residuo.nombre_unidad}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No hay residuos'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoordinadorPage;
