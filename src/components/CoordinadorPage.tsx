import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Table, Badge, Pagination, Form, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaEdit, FaCalendarAlt, FaTruck, FaTimesCircle, FaSave } from 'react-icons/fa';
import { 
  getSolicitudesCoordinador, 
  getSolicitudById, 
  agendarSolicitud, 
  Solicitud, 
  AgendamientoData
} from '../services/coordinadorServices';
import { useNavigate } from 'react-router-dom';
import FiltrosSolicitudes from '../components/FiltrosSolicitudes';
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

  const [showAgendamientoModal, setShowAgendamientoModal] = useState<boolean>(false);
  const [loadingAgendamiento, setLoadingAgendamiento] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [agendamientoError, setAgendamientoError] = useState<string | null>(null);
  
  const [formAgendamiento, setFormAgendamiento] = useState<AgendamientoData>({
    fecha_servicio_programada: '',
    hora_servicio_programada: '',
    id_linea_descarga: 1,
    numero_nota_venta: '',
    descripcion: '',
    clase_peligrosidad: '',
    declaracion_numero: '',
    transportista_id: undefined,
    asignacion_id: undefined,
    conductor_id: null,
    vehiculo_id: null
  });

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

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
        const response = await getSolicitudesCoordinador(
          paginaActual,
          20,
          activeFilters
        );
        
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
  }, [paginaActual, navigate, activeFilters]);

  const handlePageChange = (pageNumber: number) => {
    setPaginaActual(pageNumber);
  };

  const handleVerDetalle = (id: number) => {
    setSelectedSolicitudId(id);
    setShowDetalleModal(true);

    setLoadingDetalle(true);

    getSolicitudById(id)
      .then(solicitud => {
        setSolicitudDetalle(solicitud);
        setLoadingDetalle(false);
      })
      .catch(error => {
        console.error('Error al obtener detalles:', error);
        setLoadingDetalle(false);
      });
  };

  const handleEditar = (id: number) => {
    console.log('Editar solicitud:', id);
  };

  const handleVerFecha = async (id: number) => {
    setSelectedSolicitudId(id);
    setAgendamientoError(null);
    setSuccessMessage(null);
    
    try {
      setLoadingDetalle(true);
      
      // detalles solicitud
      const solicitudCompleta = await getSolicitudById(id);
      setSolicitudDetalle(solicitudCompleta);
      
      const fechaSolicitada = new Date(solicitudCompleta.fecha_servicio_solicitada);
      const fechaFormateada = fechaSolicitada.toISOString().split('T')[0];
      
      let transportistaId: number | undefined = undefined;
      if (solicitudCompleta.detalles_con_transporte && 
          solicitudCompleta.detalles_con_transporte.length > 0 && 
          solicitudCompleta.detalles_con_transporte[0].transportista_id) {
        transportistaId = solicitudCompleta.detalles_con_transporte[0].transportista_id;
      }

      setFormAgendamiento({
        ...formAgendamiento,
        fecha_servicio_programada: fechaFormateada,
        hora_servicio_programada: solicitudCompleta.hora_servicio_solicitada,
        descripcion: `Agendamiento para solicitud #${id}`,
        transportista_id: transportistaId
      });
      
      setLoadingDetalle(false);
      setShowAgendamientoModal(true);
    } catch (error) {
      console.error('Error al obtener detalles de la solicitud:', error);
      setAgendamientoError('Error al cargar los detalles de la solicitud');
      setLoadingDetalle(false);
    }
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setSelectedSolicitudId(null);
    setSolicitudDetalle(null);
  };

  const handleCloseAgendamientoModal = () => {
    setShowAgendamientoModal(false);
    setSelectedSolicitudId(null);
    setAgendamientoError(null);
    setSuccessMessage(null);
    setSolicitudDetalle(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'id_linea_descarga' || name === 'transportista_id' || name === 'asignacion_id') {
      setFormAgendamiento({
        ...formAgendamiento,
        [name]: value === '' ? undefined : parseInt(value, 10)
      });
    } 
    else if (name === 'conductor_id' || name === 'vehiculo_id') {
      setFormAgendamiento({
        ...formAgendamiento,
        [name]: value === '' ? null : parseInt(value, 10)
      });
    }
    else {
      setFormAgendamiento({
        ...formAgendamiento,
        [name]: value
      });
    }
  };

  const handleSubmitAgendamiento = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedSolicitudId) {
      setAgendamientoError('No se ha seleccionado ninguna solicitud');
      return;
    }
  
    try {
      setLoadingAgendamiento(true);
      setAgendamientoError(null);
  
      const hora =
        formAgendamiento.hora_servicio_programada.length === 5
          ? `${formAgendamiento.hora_servicio_programada}:00`
          : formAgendamiento.hora_servicio_programada;
  
      const datosAgendamiento: AgendamientoData = {
        ...formAgendamiento,
        hora_servicio_programada: hora
      };
  
      if (datosAgendamiento.transportista_id === null)
        datosAgendamiento.transportista_id = undefined;
      if (datosAgendamiento.asignacion_id === null)
        datosAgendamiento.asignacion_id = undefined;
  
      /* Validación: si requiere transporte, ambos IDs son obligatorios */
      if (
        solicitudDetalle?.requiere_transporte &&
        (!datosAgendamiento.transportista_id ||
          !datosAgendamiento.asignacion_id)
      ) {
        setAgendamientoError(
          'Esta solicitud requiere transporte: selecciona transportista y asignación antes de agendar.'
        );
        setLoadingAgendamiento(false);
        return;
      }
  
      /* Llamada al servicio */
      await agendarSolicitud(selectedSolicitudId, datosAgendamiento);
  
      setSuccessMessage(`Solicitud #${selectedSolicitudId} agendada correctamente`);
  
      setTimeout(() => {
        getSolicitudesCoordinador(paginaActual, 20, activeFilters)
          .then(r => setSolicitudes(r.datos))
          .catch(err => console.error('Error al actualizar solicitudes:', err));
  
        handleCloseAgendamientoModal();
      }, 2000);
    } catch (error: any) {
      console.error('Error al agendar la solicitud:', error);
      setAgendamientoError(
        error.response?.data?.message || 'Error al agendar la solicitud'
      );
    } finally {
      setLoadingAgendamiento(false);
    }
  };
  
  

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
    setPaginaActual(1);
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
      
      {/* Componente de Filtros */}
      <Row>
        <Col>
          <FiltrosSolicitudes onApplyFilters={handleApplyFilters} />
        </Col>
      </Row>
      
      <Row>
        <Col>
          <div className="table-panel">
            <div className="table-header">
              <h4>Solicitudes de Servicio</h4>
              <span className="text-muted">Total: {totalSolicitudes}</span>
            </div>
            
            {loading ? (
              <div className="text-center py-5">Cargando solicitudes...</div>
            ) : error ? (
              <div className="alert alert-danger m-3">{error}</div>
            ) : (
              <>
                <Table className="custom-table" responsive>
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
                              title="Agendar"
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

                <div className="pagination-wrapper">
                  <Pagination className="justify-content-center mb-0">
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
                </div>
              </>
            )}
          </div>
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
                  <div className="modal-table-container">
                    <Table striped borderless size="sm" className="custom-table">
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
                  </div>
                </Col>
                <Col md={6}>
                  <h5>Información de Servicio</h5>
                  <div className="modal-table-container">
                    <Table striped borderless size="sm" className="custom-table">
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
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <h5>Dirección</h5>
                  <p>{solicitudDetalle.direccion_completa || 'No especificada'}</p>
                  <p><strong>Comuna:</strong> {solicitudDetalle.comuna || 'No especificada'}</p>
                </Col>
              </Row>

              {/* Información de transporte si existe */}
              {solicitudDetalle.detalles_con_transporte && solicitudDetalle.detalles_con_transporte.length > 0 && (
                <Row className="mb-4">
                  <Col>
                    <h5>Información de Transporte</h5>
                    <div className="modal-table-container">
                      <Table striped hover size="sm" className="custom-table">
                        <thead>
                          <tr>
                            <th>Material</th>
                            <th>Código</th>
                            <th>Unidad</th>
                            <th>Cantidad</th>
                            <th>Transportista</th>
                          </tr>
                        </thead>
                        <tbody>
                          {solicitudDetalle.detalles_con_transporte.map((detalle, index) => (
                            <tr key={index}>
                              <td>{detalle.nombre_material_maktg}</td>
                              <td>{detalle.codigo_material_matnr}</td>
                              <td>{detalle.unidad_venta_kmein}</td>
                              <td>{detalle.cantidad}</td>
                              <td>{detalle.nombre_transportista || 'No asignado'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>
              )}

              <Row>
                <Col>
                  <h5>Residuos</h5>
                  {solicitudDetalle.residuos && solicitudDetalle.residuos.length > 0 ? (
                    <div className="modal-table-container">
                      <Table striped hover size="sm" className="custom-table">
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
                    </div>
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

      {/* Modal de Agendamiento */}
      <Modal 
        show={showAgendamientoModal} 
        onHide={handleCloseAgendamientoModal}
        size="lg"
        centered
        backdrop="static"
      >
        <Form onSubmit={handleSubmitAgendamiento}>
          <Modal.Header closeButton>
            <Modal.Title>
              Agendar Solicitud #{selectedSolicitudId}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingDetalle ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-2">Cargando detalles de la solicitud...</p>
              </div>
            ) : (
              <>
                {/* Mensajes de éxito o error */}
                {successMessage && (
                  <Alert variant="success" className="mb-4">
                    {successMessage}
                  </Alert>
                )}
                
                {agendamientoError && (
                  <Alert variant="danger" className="mb-4">
                    {agendamientoError}
                  </Alert>
                )}
                
                {/* Mostrar información sobre detalle de transporte si existe */}
                {solicitudDetalle && solicitudDetalle.detalles_con_transporte && solicitudDetalle.detalles_con_transporte.length > 0 && (
                  <Alert variant="info" className="mb-4">
                    <h6 className="alert-heading">Información de transporte existente:</h6>
                    <p className="mb-1"><strong>Material:</strong> {solicitudDetalle.detalles_con_transporte[0].nombre_material_maktg}</p>
                    <p className="mb-1"><strong>Código:</strong> {solicitudDetalle.detalles_con_transporte[0].codigo_material_matnr}</p>
                    <p className="mb-1"><strong>Unidad:</strong> {solicitudDetalle.detalles_con_transporte[0].unidad_venta_kmein}</p>
                    <p className="mb-0"><strong>Cantidad:</strong> {solicitudDetalle.detalles_con_transporte[0].cantidad}</p>
                  </Alert>
                )}
                
                {/* Si no tiene detalles de transporte y debería tenerlos */}
                {solicitudDetalle && 
                 solicitudDetalle.requiere_transporte && 
                 (!solicitudDetalle.detalles_con_transporte || solicitudDetalle.detalles_con_transporte.length === 0) && (
                  <Alert variant="warning" className="mb-4">
                    <h6 className="alert-heading">¡Advertencia!</h6>
                    <p className="mb-0">
                      Esta solicitud requiere transporte pero no tiene detalles de transporte registrados. 
                      Por favor, complete la información de la solicitud antes de agendar.
                    </p>
                  </Alert>
                )}
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="fecha_servicio_programada">
                      <Form.Label>Fecha programada*</Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha_servicio_programada"
                        required
                        value={formAgendamiento.fecha_servicio_programada}
                        onChange={handleFormChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="hora_servicio_programada">
                      <Form.Label>Hora programada*</Form.Label>
                      <Form.Control
                        type="time"
                        name="hora_servicio_programada"
                        required
                        value={formAgendamiento.hora_servicio_programada}
                        onChange={handleFormChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="id_linea_descarga">
                      <Form.Label>Línea de descarga*</Form.Label>
                      <Form.Select
                        name="id_linea_descarga"
                        required
                        value={formAgendamiento.id_linea_descarga.toString()}
                        onChange={handleFormChange}
                      >
                        <option value="1">Línea 1</option>
                        <option value="2">Línea 2</option>
                        <option value="3">Línea 3</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="numero_nota_venta">
                      <Form.Label>Número de nota de venta*</Form.Label>
                      <Form.Control
                        type="text"
                        name="numero_nota_venta"
                        required
                        placeholder="Ej: 1234567890"
                        value={formAgendamiento.numero_nota_venta}
                        onChange={handleFormChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="descripcion">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="descripcion"
                    rows={3}
                    placeholder="Descripción del agendamiento"
                    value={formAgendamiento.descripcion}
                    onChange={handleFormChange}
                  />
                </Form.Group>
                
                <h5 className="mt-4 mb-3">Información de peligrosidad (opcional)</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="clase_peligrosidad">
                      <Form.Label>Clase de peligrosidad</Form.Label>
                      <Form.Control
                        type="text"
                        name="clase_peligrosidad"
                        placeholder="Ej: Inflamable"
                        value={formAgendamiento.clase_peligrosidad || ''}
                        onChange={handleFormChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="declaracion_numero">
                      <Form.Label>Número de declaración</Form.Label>
                      <Form.Control
                        type="text"
                        name="declaracion_numero"
                        placeholder="Número de declaración"
                        value={formAgendamiento.declaracion_numero || ''}
                        onChange={handleFormChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <h5 className="mt-4 mb-3">Información de transporte</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="transportista_id">
                      <Form.Label>Transportista</Form.Label>
                      <Form.Select
                        name="transportista_id"
                        value={formAgendamiento.transportista_id === undefined || formAgendamiento.transportista_id === null ? '' : formAgendamiento.transportista_id.toString()}
                        onChange={handleFormChange}
                      >
                        <option value="">Seleccionar transportista</option>
                        <option value="1">Transportista prueba</option>
                        <option value="2">Transportista 2</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="asignacion_id">
                      <Form.Label>Asignación</Form.Label>
                      <Form.Select
                        name="asignacion_id"
                        value={formAgendamiento.asignacion_id === undefined || formAgendamiento.asignacion_id === null ? '' : formAgendamiento.asignacion_id.toString()}
                        onChange={handleFormChange}
                      >
                        <option value="">Seleccionar asignación</option>
                        <option value="1">Asignación 1</option>
                        <option value="2">Asignación 2</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="conductor_id">
                      <Form.Label>Conductor</Form.Label>
                      <Form.Select
                        name="conductor_id"
                        value={formAgendamiento.conductor_id === null ? '' : String(formAgendamiento.conductor_id || '')}
                        onChange={handleFormChange}
                      >
                        <option value="">Seleccionar conductor</option>
                        <option value="1">Conductor 1</option>
                        <option value="2">Conductor 2</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="vehiculo_id">
                      <Form.Label>Vehículo</Form.Label>
                      <Form.Select
                        name="vehiculo_id"
                        value={formAgendamiento.vehiculo_id === null ? '' : String(formAgendamiento.vehiculo_id || '')}
                        onChange={handleFormChange}
                      >
                        <option value="">Seleccionar vehículo</option>
                        <option value="1">Vehículo 1</option>
                        <option value="2">Vehículo 2</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAgendamientoModal} disabled={!!loadingAgendamiento}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="modal-save-button"
              disabled={!!loadingAgendamiento || 
                !!(solicitudDetalle && 
                  solicitudDetalle.requiere_transporte && 
                  (!solicitudDetalle.detalles_con_transporte || 
                  solicitudDetalle.detalles_con_transporte.length === 0))}
            >
              {loadingAgendamiento ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Agendando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" /> Guardar Agendamiento
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CoordinadorPage;
