import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSolicitudesPorUsuario } from '../services/solicitudService';
import { getSolicitudById } from '../services/coordinadorServices';
import '../styles/Home.css'; 

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);

  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 7;
  const usuario_id = Number(localStorage.getItem('usuario_id'));

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        const data = await getSolicitudesPorUsuario(usuario_id, 'detalles');
        setSolicitudes(data);
      } catch (error) {
        console.error('Error al obtener las solicitudes del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (usuario_id) {
      fetchSolicitudes();
    }
  }, [usuario_id]);

  const totalSolicitudes = solicitudes.length;
  const totalPages = Math.ceil(totalSolicitudes / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSolicitudes = solicitudes.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleCrearSolicitud = () => {
    navigate('/crear-solicitud');
  };

  const handleVerDetalles = (solicitud: any) => {
    setSelectedSolicitud(solicitud);
    setShowDetallesModal(true);
  };

  const handleCerrarDetallesModal = () => {
    setShowDetallesModal(false);
    setSelectedSolicitud(null);
  };

  const handleVerEstado = async (solicitud: any) => {
    try {
      setLoading(true);
      const data = await getSolicitudById(solicitud.solicitud_id);
      setSelectedSolicitud(data);
      setShowEstadoModal(true);
    } catch (error) {
      console.error('Error al obtener el estado actualizado:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCerrarEstadoModal = () => {
    setShowEstadoModal(false);
    setSelectedSolicitud(null);
  };

  return (
    <div className="container mt-5">
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="card mb-4">
          <div className="card-header text-center">
            <h3 className="m-0">Mis Solicitudes</h3>
          </div>

          {totalSolicitudes === 0 ? (
            <div className="card-body">
              <p className="text-center">No hay solicitudes registradas.</p>
            </div>
          ) : (
            <>
              <ul className="list-group list-group-flush solicitudes-list">
                {paginatedSolicitudes.map((solicitud) => (
                  <li
                    key={solicitud.solicitud_id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>ID:</strong> <span style={{ color: '#243c6c' }}>{solicitud.solicitud_id}</span>
                      <br />
                      <strong>Descripción:</strong> <span style={{ color: '#243c6c' }}>{solicitud.descripcion}</span>
                    </div>
                    <div>
                      <button
                        className="btn home-ver-detalles me-2"
                        onClick={() => handleVerDetalles(solicitud)}
                      >
                        Ver Detalles
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => handleVerEstado(solicitud)}
                      >
                        Ver Estado
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="card-footer">
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    className="btn btn-secondary me-3"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {page} de {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary ms-3"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="d-flex justify-content-center mt-5">
        <button
          className="btn home-create-solicitud"
          onClick={handleCrearSolicitud}
        >
          Crear Solicitud
        </button>
      </div>

      {/* Modal de Detalles */}
      {showDetallesModal && selectedSolicitud && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Detalles de Solicitud ID: {selectedSolicitud.solicitud_id}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCerrarDetallesModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Descripción:</strong> <span style={{ color: '#243c6c' }}>{selectedSolicitud.descripcion}</span>
                  </p>
                  <p>
                    <strong>Fecha de Servicio Solicitada:</strong>{" "}
                    <span style={{ color: '#243c6c' }}>
                      {new Date(selectedSolicitud.fecha_servicio_solicitada).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    <strong>Hora de Servicio Solicitada:</strong>{" "}
                    <span style={{ color: '#243c6c' }}>{selectedSolicitud.hora_servicio_solicitada}</span>
                  </p>
                  <p>
                    <strong>Requiere Transporte:</strong>{" "}
                    <span style={{ color: '#243c6c' }}>
                      {selectedSolicitud.requiere_transporte ? "Sí" : "No"}
                    </span>
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCerrarDetallesModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Modal de Estado */}
      {showEstadoModal && selectedSolicitud && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Estado de la Solicitud (ID: {selectedSolicitud.solicitud_id})
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCerrarEstadoModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Estado de la Solicitud:</strong>{" "}
                    <span style={{ color: '#243c6c', fontWeight: 600 }}>
                      {selectedSolicitud.nombre_estado || 'Sin estado definido'}
                    </span>
                  </p>

                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCerrarEstadoModal}
                  >
                    Regresar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default HomePage;


