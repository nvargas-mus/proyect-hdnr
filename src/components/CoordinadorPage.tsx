import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Table, Badge, Pagination } from 'react-bootstrap';
import { FaEye, FaEdit, FaCalendarAlt, FaTruck, FaTimesCircle } from 'react-icons/fa';
import { getSolicitudesCoordinador, Solicitud } from '../services/coordinadorServices';
import { useNavigate } from 'react-router-dom';
import '../styles/CoordinadorPage.css';

const CoordinadorPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [totalSolicitudes, setTotalSolicitudes] = useState<number>(0);
  
  const [showDetalleModal, setShowDetalleModal] = useState<boolean>(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
  const [solicitudDetalle, setSolicitudDetalle] = useState<Solicitud | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState<boolean>(false);

  const clienteId = 600141;
  const usuarioId = 14;

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Usuario no autenticado. Por favor inicie sesión');
          setLoading(false);
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return;
        }
        
        setLoading(true);
        const response = await getSolicitudesCoordinador(clienteId, usuarioId, paginaActual);
        setSolicitudes(response.datos);
        setTotalPaginas(response.metadatos.total_paginas);
        setTotalSolicitudes(response.metadatos.total_resultados);
        setLoading(false);
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          setError('Sesión expirada. Por favor inicie sesión nuevamente.');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError(`Error al cargar solicitudes: ${err.message || 'Error desconocido'}`);
        }
        setLoading(false);
        console.error(err);
      }
    };

    fetchSolicitudes();
  }, [clienteId, usuarioId, paginaActual, navigate]);

  const handlePageChange = (pageNumber: number) => {
    setPaginaActual(pageNumber);
  };

  const handleVerDetalle = (id: number) => {
    setSelectedSolicitudId(id);
    setShowDetalleModal(true);
    
    setLoadingDetalle(true);

    const solicitudEncontrada = solicitudes.find(s => s.solicitud_id === id);
    if (solicitudEncontrada) {
      setSolicitudDetalle(solicitudEncontrada);
    }
    
    setLoadingDetalle(false);
  };

  const handleEditar = (id: number) => {
    console.log('Editar solicitud:', id);
  };

  const handleVerFecha = (id: number) => {
    console.log('Ver fecha de solicitud:', id);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setSelectedSolicitudId(null);
    setSolicitudDetalle(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'incompleta':
        return <Badge bg="warning">Incompleta</Badge>;
      case 'completada':
        return <Badge bg="success">Completada</Badge>;
      case 'rechazada':
        return <Badge bg="danger">Rechazada</Badge>;
      case 'en proceso':
        return <Badge bg="info">En Proceso</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const pendientes = solicitudes.filter(s => s.nombre_estado.toLowerCase() === 'incompleta').length;
  const completadas = solicitudes.filter(s => s.nombre_estado.toLowerCase() === 'completada').length;
  const conTransporte = solicitudes.filter(s => s.requiere_transporte).length;

  if (error && !solicitudes.length) {
    return (
      <Container fluid className="main-content">
        <div className="alert alert-danger my-5">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="main-content">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">Panel de Coordinador</h2>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 p-4">
            <Card.Body>
              <Card.Title>Total de Solicitudes</Card.Title>
              <h2 className="display-4">{totalSolicitudes}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 p-4">
            <Card.Body>
              <Card.Title>Pendientes</Card.Title>
              <h2 className="display-4">{pendientes}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 p-4">
            <Card.Body>
              <Card.Title>Completadas</Card.Title>
              <h2 className="display-4">{completadas}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 p-4">
            <Card.Body>
              <Card.Title>Con Transporte</Card.Title>
              <h2 className="display-4">{conTransporte}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="p-4">
            <Card.Body>
              <h4 className="mb-4">Solicitudes de Servicio</h4>
              
              {loading ? (
                <div className="text-center my-5">Cargando solicitudes...</div>
              ) : error ? (
                <div className="alert alert-danger my-3">{error}</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table className="custom-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Código</th>
                          <th>Cliente</th>
                          <th>Sucursal</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Estado</th>
                          <th>Comuna</th>
                          <th>Transporte</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudes.map((solicitud) => (
                          <tr key={`${solicitud.solicitud_id}-${solicitud.fecha_solicitud}`}>
                            <td>{solicitud.solicitud_id}</td>
                            <td>{solicitud.codigo_cliente_kunnr}</td>
                            <td>{solicitud.nombre_name1}</td>
                            <td>{solicitud.sucursal_name2}</td>
                            <td>{formatDate(solicitud.fecha_servicio_solicitada)}</td>
                            <td>{solicitud.hora_servicio_solicitada.substring(0, 5)}</td>
                            <td>{getEstadoBadge(solicitud.nombre_estado)}</td>
                            <td>{solicitud.comuna || 'N/A'}</td>
                            <td className="text-center">
                              {solicitud.requiere_transporte ? 
                                <FaTruck size={20} color="#28a745" title="Requiere transporte" /> : 
                                <FaTimesCircle size={20} color="#dc3545" title="No requiere transporte" />}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  className="form-button-primary"
                                  size="sm"
                                  onClick={() => handleVerFecha(solicitud.solicitud_id)}
                                  title="Ver fecha"
                                >
                                  <FaCalendarAlt />
                                </Button>
                                <Button 
                                  className="form-button-primary"
                                  size="sm"
                                  onClick={() => handleEditar(solicitud.solicitud_id)}
                                  title="Editar"
                                >
                                  <FaEdit />
                                </Button>
                                <Button 
                                  className="form-button-primary"
                                  size="sm"
                                  onClick={() => handleVerDetalle(solicitud.solicitud_id)}
                                  title="Ver detalles"
                                >
                                  <FaEye />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <Pagination className="justify-content-center mt-4">
                    <Pagination.First 
                      onClick={() => handlePageChange(1)} 
                      disabled={paginaActual === 1} 
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(paginaActual - 1)}
                      disabled={paginaActual === 1}
                    />
                    
                    {[...Array(totalPaginas)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === paginaActual}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPaginas)}
                      disabled={paginaActual === totalPaginas}
                    />
                  </Pagination>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Detalle de Solicitud */}
      <Modal show={showDetalleModal} onHide={handleCloseDetalleModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Detalle de Solicitud #{selectedSolicitudId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetalle ? (
            <div className="text-center py-4">Cargando detalles...</div>
          ) : !solicitudDetalle ? (
            <div className="alert alert-warning">No se encontró la solicitud</div>
          ) : (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Información General</h5>
                  <Table striped borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Cliente:</strong></td>
                        <td>{solicitudDetalle.nombre_name1}</td>
                      </tr>
                      <tr>
                        <td><strong>Sucursal:</strong></td>
                        <td>{solicitudDetalle.sucursal_name2}</td>
                      </tr>
                      <tr>
                        <td><strong>Código Cliente:</strong></td>
                        <td>{solicitudDetalle.codigo_cliente_kunnr}</td>
                      </tr>
                      <tr>
                        <td><strong>Estado:</strong></td>
                        <td>{getEstadoBadge(solicitudDetalle.nombre_estado)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Información de Servicio</h5>
                  <Table striped borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Fecha Solicitada:</strong></td>
                        <td>{formatDate(solicitudDetalle.fecha_servicio_solicitada)}</td>
                      </tr>
                      <tr>
                        <td><strong>Hora Solicitada:</strong></td>
                        <td>{solicitudDetalle.hora_servicio_solicitada.substring(0, 5)}</td>
                      </tr>
                      <tr>
                        <td><strong>Fecha de Solicitud:</strong></td>
                        <td>{formatDate(solicitudDetalle.fecha_solicitud)}</td>
                      </tr>
                      <tr>
                        <td><strong>Requiere Transporte:</strong></td>
                        <td>
                          {solicitudDetalle.requiere_transporte ? 
                            <span className="d-flex align-items-center">
                              <FaTruck size={16} color="#28a745" className="me-2" /> Sí
                            </span> : 
                            <span className="d-flex align-items-center">
                              <FaTimesCircle size={16} color="#dc3545" className="me-2" /> No
                            </span>}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <h5>Dirección</h5>
                  <p>{solicitudDetalle.direccion_completa || 'No especificada'}</p>
                  <p><strong>Comuna:</strong> {solicitudDetalle.comuna || 'No especificada'}</p>
                </Col>
              </Row>

              <Row>
                <Col>
                  <h5>Residuos</h5>
                  {solicitudDetalle.residuos && solicitudDetalle.residuos.length > 0 ? (
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Cantidad</th>
                          <th>Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudDetalle.residuos.map((residuo, index) => (
                          <tr key={index}>
                            <td>{residuo.nombre_material}</td>
                            <td>{residuo.cantidad_declarada}</td>
                            <td>{residuo.nombre_unidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>No hay residuos declarados</p>
                  )}
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetalleModal}>
            Cerrar
          </Button>
          {solicitudDetalle && (
            <Button className="modal-save-button">
              Editar Solicitud
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CoordinadorPage;
