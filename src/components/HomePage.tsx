import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSolicitudesPorUsuario } from '../services/solicitudService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);

  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const usuario_id = Number(localStorage.getItem('usuario_id'));

  const itemRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(400);

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

  useEffect(() => {
    if (itemRef.current) {
      const itemHeight = itemRef.current.clientHeight;
      const newHeight = itemHeight * 10; 
      setContainerHeight(newHeight);
    }
  }, [solicitudes]);

  const totalSolicitudes = solicitudes.length;
  const totalPages = Math.ceil(totalSolicitudes / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSolicitudes = solicitudes.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
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

  const handleVerEstado = (solicitud: any) => {
    setSelectedSolicitud(solicitud);
    setShowEstadoModal(true);
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
        <div className="card p-4 mb-4">
          <h3 className="card-title text-center">Mis Solicitudes</h3>

          {totalSolicitudes === 0 ? (
            <p className="text-center">No hay solicitudes registradas.</p>
          ) : (
            <>
              <div 
                className="list-group" 
                style={{ minHeight: '400px', maxHeight: `${containerHeight}px`, overflowY: 'auto' }} 
              >
                {paginatedSolicitudes.map((solicitud, index) => (
                  <div
                    key={solicitud.solicitud_id}
                    ref={index === 0 ? itemRef : null} 
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>ID:</strong> {solicitud.solicitud_id} <br />
                      <strong>Descripción:</strong> {solicitud.descripcion}
                    </div>

                    <div className="d-flex">
                      <button
                        className="btn btn-outline-primary me-2"
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
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-center align-items-center mt-3">
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
            </>
          )}

          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-primary" onClick={handleCrearSolicitud}>
              Crear Solicitud
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetallesModal && selectedSolicitud && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
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
                    <strong>Descripción:</strong> {selectedSolicitud.descripcion}
                  </p>
                  <p>
                    <strong>Fecha de Servicio Solicitada:</strong>{" "}
                    {new Date(
                      selectedSolicitud.fecha_servicio_solicitada
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Hora de Servicio Solicitada:</strong>{" "}
                    {selectedSolicitud.hora_servicio_solicitada}
                  </p>
                  <p>
                    <strong>Requiere Transporte:</strong>{" "}
                    {selectedSolicitud.requiere_transporte ? "Sí" : "No"}
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
          {/* Fondo del modal */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Modal de Estado */}
      {showEstadoModal && selectedSolicitud && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
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
                    {selectedSolicitud.estado_id
                      ? `ID de estado: ${selectedSolicitud.estado_id}`
                      : "Sin estado definido"}
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
          {/* Fondo del modal */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default HomePage;





