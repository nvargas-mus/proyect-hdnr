import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Table,
  Pagination,
  Form,
  Spinner,
  Alert
} from 'react-bootstrap';
import {
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaTruck,
  FaTimesCircle,
  FaSave
} from 'react-icons/fa';
import {
  getSolicitudesCoordinador,
  getSolicitudById,
  agendarSolicitud,
  getTransportistas,
  getAsignacionesTarifa,
  Solicitud,
  AgendamientoData,
  Transportista,
  AsignacionTarifa,
  getLineasDescarga,
  LineaDescarga,
  getConductoresPorTransportista,
  getVehiculosPorTransportista
} from '../services/coordinadorServices';
import { useNavigate } from 'react-router-dom';
import FiltrosSolicitudes from '../components/FiltrosSolicitudes';
import '../styles/CoordinadorPage.css';

const CoordinadorPage: React.FC = () => {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showAgendamientoModal, setShowAgendamientoModal] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingAgendamiento, setLoadingAgendamiento] = useState(false);

  const [mensajeErrorAsignaciones, setMensajeErrorAsignaciones] = useState<string | null>(null);
  const [hayAsignacionesDisponibles, setHayAsignacionesDisponibles] = useState(true);


  const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(
    null
  );
  const [solicitudDetalle, setSolicitudDetalle] = useState<Solicitud | null>(
    null
  );
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionTarifa[]>([]);


  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [agendamientoError, setAgendamientoError] = useState<string | null>(
    null
  );

  const [conductores, setConductores] = useState<{ conductor_id: number; nombre: string }[]>([]);
  const [vehiculos, setVehiculos] = useState<{ vehiculo_id: number; patente: string; nombre_tipo_transporte: string }[]>([]);

  const [lineasDescarga, setLineasDescarga] = useState<LineaDescarga[]>([]);

  const [formAgendamiento, setFormAgendamiento] = useState<AgendamientoData>({
    fecha_servicio_programada: '',
    hora_servicio_programada: '',
    id_linea_descarga: 0,
    numero_nota_venta: '',
    descripcion: '',
    clase_peligrosidad: '',
    declaracion_numero: '',
    transportista_id: undefined,
    asignacion_id: undefined,
    conductor_id: null,
    vehiculo_id: null
  });
  

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { datos, metadatos } = await getSolicitudesCoordinador(
          paginaActual,
          20,
          activeFilters
        );
        setSolicitudes(datos);
        setTotalPaginas(metadatos.total_paginas);
        setTotalSolicitudes(metadatos.total_resultados);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Sesión expirada.');
          setTimeout(() => navigate('/'), 2000);
        } else setError(err.message || 'Error al cargar solicitudes');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [paginaActual, activeFilters]);

  useEffect(() => {
    if (!formAgendamiento.transportista_id) return;

    getConductoresPorTransportista(formAgendamiento.transportista_id)
      .then(setConductores)
      .catch(() => setConductores([]));

    getVehiculosPorTransportista(formAgendamiento.transportista_id)
      .then(setVehiculos)
      .catch(() => setVehiculos([]));
  }, [formAgendamiento.transportista_id]);

  const handleVerDetalle = (id: number) => {
    setSelectedSolicitudId(id);
    setShowDetalleModal(true);
    setLoadingDetalle(true);
    getSolicitudById(id)
      .then(setSolicitudDetalle)
      .finally(() => setLoadingDetalle(false));
  };

  const handleVerFecha = async (id: number) => {
  setSelectedSolicitudId(id);
  setAgendamientoError(null);
  setSuccessMessage(null);

  try {
    setLoadingDetalle(true);
    const sol = await getSolicitudById(id);
    setSolicitudDetalle(sol);

    setTransportistas(await getTransportistas());

    try {
      const lineas = await getLineasDescarga();
      setLineasDescarga(lineas);
    } catch (error) {
      console.error("Error al cargar líneas de descarga:", error);
      setLineasDescarga([]);
    }

    if (sol.requiere_transporte && sol.detalles_con_transporte?.length) {
      const mat = sol.detalles_con_transporte[0].codigo_material_matnr;
      try {
        const asignacionesObtenidas = await getAsignacionesTarifa(
          sol.codigo_cliente_kunnr,
          sol.direccion_id,
          mat
        );
        setAsignaciones(asignacionesObtenidas);
        setMensajeErrorAsignaciones(null);
        setHayAsignacionesDisponibles(asignacionesObtenidas.length > 0);
      } catch (error: any) {
        setAsignaciones([]);
        setMensajeErrorAsignaciones(error.message || 'No se encontraron asignaciones.');
        setHayAsignacionesDisponibles(false);
      }
    } else {
      setAsignaciones([]);
      setHayAsignacionesDisponibles(false);
    }

    const fechaSolicitada = new Date(sol.fecha_servicio_solicitada)
      .toISOString()
      .split('T')[0];

    setFormAgendamiento({
      fecha_servicio_programada: fechaSolicitada,
      hora_servicio_programada: sol.hora_servicio_solicitada,
      id_linea_descarga: 0,
      numero_nota_venta: '',
      descripcion: `Agendamiento para solicitud #${id}`,
      clase_peligrosidad: '',
      declaracion_numero: '',
      transportista_id:
        sol.detalles_con_transporte?.[0]?.transportista_id ?? undefined,
      asignacion_id: undefined,
      conductor_id: null,
      vehiculo_id: null
    });

    setShowAgendamientoModal(true);
  } catch {
    setAgendamientoError('Error al cargar datos de agendamiento');
  } finally {
    setLoadingDetalle(false);
  }
};

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const toNum = (v: string) => (v === '' ? undefined : parseInt(v, 10));

    switch (name) {
      case 'id_linea_descarga':
      case 'transportista_id':
      case 'asignacion_id':
      case 'conductor_id':
      case 'vehiculo_id':
        setFormAgendamiento((a) => ({ ...a, [name]: toNum(value) }));
        break;
      default:
        setFormAgendamiento((a) => ({ ...a, [name]: value }));
    }
  };

  const handleSubmitAgendamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSolicitudId) return;

    try {
      setLoadingAgendamiento(true);
      setAgendamientoError(null);

      const hora =
        formAgendamiento.hora_servicio_programada.length === 5
          ? `${formAgendamiento.hora_servicio_programada}:00`
          : formAgendamiento.hora_servicio_programada;

      const datos: AgendamientoData = {
        ...formAgendamiento,
        hora_servicio_programada: hora
      };

      if (
        solicitudDetalle?.requiere_transporte &&
        (!datos.transportista_id || !datos.asignacion_id)
      ) {
        setAgendamientoError(
          'Selecciona transportista y asignación antes de agendar.'
        );
        return;
      }

      await agendarSolicitud(selectedSolicitudId, datos);
      setSuccessMessage(
        `Solicitud #${selectedSolicitudId} agendada correctamente`
      );

      setTimeout(() => {
        getSolicitudesCoordinador(paginaActual, 20, activeFilters)
          .then((r) => setSolicitudes(r.datos))
          .catch(console.error);
        handleCloseAgendamientoModal();
      }, 2000);
    } catch (err: any) {
      setAgendamientoError(err.response?.data?.error || 'Error al agendar');
    } finally {
      setLoadingAgendamiento(false);
    }
  };

  const handlePageChange = (p: number) => setPaginaActual(p);

  const handleApplyFilters = (f: any) => {
    setActiveFilters(f);
    setPaginaActual(1);
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });


  const getEstadoBadge = (estado: string) => {
    const key = estado?.toLowerCase().replace(/\s+/g, '-');
    const clases = `badge badge-estado badge-${key}`;

    return <span className={clases}>{estado}</span>;
  };


  const pendientes = solicitudes.filter(
    (s) => s.nombre_estado === 'Pendiente'
  ).length;
  const completadas = solicitudes.filter(
    (s) => s.nombre_estado === 'Completado'
  ).length;

  const conTransporte = solicitudes.filter((s) => s.requiere_transporte).length;

  if (error && !solicitudes.length) {
    return (
      <Container className="main-content">
        <div className="alert alert-danger my-5">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="main-content coordinador-page-container py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">Panel de Coordinador</h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card">
            <Card.Body>
              <Card.Title className="card-title">Total Solicitudes</Card.Title>
              <p className="stat-value">{totalSolicitudes}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card">
            <Card.Body>
              <Card.Title className="card-title">Pendientes</Card.Title>
              <p className="stat-value">{pendientes}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card">
            <Card.Body>
              <Card.Title className="card-title">Completadas</Card.Title>
              <p className="stat-value">{completadas}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-4">
          <Card className="stat-card">
            <Card.Body>
              <Card.Title className="card-title">Con Transporte</Card.Title>
              <p className="stat-value">{conTransporte}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>


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
              <div className="text-center py-5">Cargando solicitudes…</div>
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
                    {solicitudes.map((s) => (
                      <tr key={`${s.solicitud_id}-${s.fecha_solicitud}`}>
                        <td>{s.solicitud_id}</td>
                        <td>{s.codigo_cliente_kunnr}</td>
                        <td>{s.nombre_name1}</td>
                        <td>{s.sucursal_name2}</td>
                        <td>{formatDate(s.fecha_servicio_solicitada)}</td>
                        <td>{s.hora_servicio_solicitada.substring(0, 5)}</td>
                        <td>{getEstadoBadge(s.nombre_estado)}</td>
                        <td>{s.comuna || 'N/A'}</td>
                        <td className="text-center">
                          {s.requiere_transporte ? (
                            <FaTruck
                              size={20}
                              color="#28a745"
                              title="Requiere transporte"
                            />
                          ) : (
                            <FaTimesCircle
                              size={20}
                              color="#dc3545"
                              title="No requiere transporte"
                            />
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              className="form-button-primary"
                              size="sm"
                              onClick={() => handleVerFecha(s.solicitud_id)}
                              title="Agendar"
                            >
                              <FaCalendarAlt />
                            </Button>
                            <Button
                              className="form-button-primary"
                              size="sm"
                              onClick={() => console.log('Editar', s.solicitud_id)}
                              title="Editar"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              className="form-button-primary"
                              size="sm"
                              onClick={() => handleVerDetalle(s.solicitud_id)}
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

                {/* paginación */}
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
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                      (n) => (
                        <Pagination.Item
                          key={n}
                          active={n === paginaActual}
                          onClick={() => handlePageChange(n)}
                        >
                          {n}
                        </Pagination.Item>
                      )
                    )}
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

      <Modal
        show={showDetalleModal}
        onHide={handleCloseDetalleModal}
        size="xl"
        centered
        dialogClassName="modal-detalle-coordinador"
      >

        <Modal.Header closeButton>
          <Modal.Title>Detalle de Solicitud Nro: {selectedSolicitudId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {loadingDetalle ? (
                <div className="text-center py-4">Cargando detalles…</div>
              ) : !solicitudDetalle ? (
                <div className="alert alert-warning">
                  No se encontró la solicitud
                </div>
              ) : (
                <>
                  <Row className="mb-4">
                    <Col md={6}>
                      <h5>Información General</h5>
                      <div className="modal-table-container  mb-4">
                        <Table striped borderless size="sm" className="custom-table">
                          <tbody>
                            <tr>
                              <td><strong>Cliente:</strong></td>
                              <td>{solicitudDetalle.nombre_cliente}</td>
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
                            <tr>
                              <td><strong>ID Usuario:</strong></td>
                              <td>{solicitudDetalle.usuario_id}</td>
                            </tr>
                            <tr>
                              <td><strong>Email Usuario:</strong></td>
                              <td>{solicitudDetalle.email}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>

                      <h5 className="mt-3">Centro de Operación</h5>
                        <div className="modal-table-container mb-4">
                          <Table striped borderless size="sm" className="custom-table">
                          <tbody>
                            <tr>
                              <td><strong>Código Centro:</strong></td>
                              <td>{solicitudDetalle.centro_vwerk || 'No informado'}</td>
                            </tr>
                            <tr>
                              <td><strong>Descripción Centro:</strong></td>
                              <td>{solicitudDetalle.descripcion_centro || 'No especificado'}</td>
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
                              <td><strong>Fecha Servicio Programada:</strong></td>
                              <td>
                                {solicitudDetalle.fecha_servicio_programada
                                  ? formatDate(solicitudDetalle.fecha_servicio_programada)
                                  : 'No asignada'}
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Fecha de Solicitud:</strong></td>
                              <td>{formatDate(solicitudDetalle.fecha_solicitud)}</td>
                            </tr>
                            <tr>
                              <td><strong>Requiere Transporte:</strong></td>
                              <td>
                                {solicitudDetalle.requiere_transporte ? (
                                  <span className="d-flex align-items-center">
                                    <FaTruck size={16} color="#28a745" className="me-2" /> Sí
                                  </span>
                                ) : (
                                  <span className="d-flex align-items-center">
                                    <FaTimesCircle size={16} color="#dc3545" className="me-2" /> No
                                  </span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Fecha Programación:</strong></td>
                              <td>
                                {solicitudDetalle.fecha_programacion
                                  ? formatDate(solicitudDetalle.fecha_programacion)
                                  : 'No asignada'}
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Hora Programación:</strong></td>
                              <td>
                                {solicitudDetalle.hora_servicio_programada
                                  ? solicitudDetalle.hora_servicio_programada.substring(0, 5)
                                  : 'No asignada'}
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Nota de Venta:</strong></td>
                              <td>{solicitudDetalle.numero_nota_venta ?? 'No informada'}</td>
                            </tr>
                            <tr>
                              <td><strong>Descripción:</strong></td>
                              <td>{solicitudDetalle.descripcion || 'No informada'}</td>
                            </tr>
                            <tr>
                              <td><strong>Línea de Descarga:</strong></td>
                              <td>{solicitudDetalle.nombre_linea || 'No informada'}</td>
                            </tr>
                            <tr>
                              <td><strong>Dirección:</strong></td>
                              <td>{solicitudDetalle.direccion}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                    </Col>


  

                  </Row>

                  
                  {/* ─── Dirección, Contacto y Declaración ─── */}
                  <Row className="mb-4">
                    <Col md={4}>
                      <h5>Dirección</h5>
                      <Table striped borderless size="sm" className="custom-table">
                        <tbody>
                          <tr>
                            <td><strong>Dirección:</strong></td>
                            <td>{solicitudDetalle.direccion_completa || 'No especificada'}</td>
                          </tr>
                          <tr>
                            <td><strong>Comuna:</strong></td>
                            <td>{solicitudDetalle.comuna || 'No especificada'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>

                    <Col md={4}>
                      <h5>Contacto del Cliente</h5>
                      <Table striped borderless size="sm" className="custom-table">
                        <tbody>
                          <tr>
                            <td><strong>Nombre:</strong></td>
                            <td>{solicitudDetalle.nombre || 'No especificado'}</td>
                          </tr>
                          <tr>
                            <td><strong>Teléfono:</strong></td>
                            <td>{solicitudDetalle.telefono || 'No especificado'}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{solicitudDetalle.email_contacto || 'No especificado'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>

                    <Col md={4}>
                      <h5>Declaración y Generador</h5>
                      <Table striped borderless size="sm" className="custom-table">
                        <tbody>
                          <tr>
                            <td><strong>Declaración:</strong></td>
                            <td>{solicitudDetalle.declaracion_nombre || 'No especificada'}</td>
                          </tr>
                          <tr>
                            <td><strong>Número Declaración:</strong></td>
                            <td>{solicitudDetalle.declaracion_numero || 'No informado'}</td>
                          </tr>
                          <tr>
                            <td><strong>Clase de Peligrosidad:</strong></td>
                            <td>{solicitudDetalle.clase_peligrosidad || 'No indicada'}</td>
                          </tr>
                          <tr>
                            <td><strong>Generador igual al Cliente:</strong></td>
                            <td>{solicitudDetalle.generador_igual_cliente ? 'Sí' : 'No'}</td>
                          </tr>
                          {!solicitudDetalle.generador_igual_cliente && (
                            <tr>
                              <td><strong>Nombre del Generador:</strong></td>
                              <td>{solicitudDetalle.nombre_generador || 'No informado'}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>


                  {/* ─── Transporte (si hay) ─── */}
                  {solicitudDetalle.detalles_con_transporte &&
                    solicitudDetalle.detalles_con_transporte.length > 0 && (
                      <Row className="mb-4">
                        <Col>
                          <h5>Información de Transporte</h5>
                          <div className="modal-table-container">
                            <Table striped hover size="sm" className="custom-table">
                              <thead>
                                <tr>
                                  <th>Material</th>
                                  <th>Código</th>
                                  <th>Unidad Venta</th>
                                  <th>Cantidad</th>
                                  <th>Transportista</th>
                                  <th>Tipo Transporte</th>
                                  <th>Capacidad</th>
                                  <th>Unidad Capacidad</th>
                                  <th>Nombre</th>
                                  <th>RUT</th>
                                  <th>Patente</th>
                                </tr>
                              </thead>

                              <tbody>
                                {solicitudDetalle.detalles_con_transporte.map((d, i) => (
                                  <tr key={i}>
                                    <td>{d.nombre_material_maktg}</td>
                                    <td>{d.codigo_material_matnr}</td>
                                    <td>{d.unidad_venta_kmein}</td>
                                    <td>{d.cantidad ?? 'N/A'}</td>
                                    <td>{d.nombre_transportista || 'No asignado'}</td>
                                    <td>{d.nombre_tipo_transporte || 'N/A'}</td>
                                    <td>{d.valor_capacidad ?? 'N/A'}</td>
                                    <td>{d.nombre_unidad || 'N/A'}</td>
                                    <td>{d.nombre || 'N/A'}</td>
                                    <td>{d.rut || 'N/A'}</td>
                                    <td>{d.patente || 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>

                            </Table>
                          </div>
                        </Col>
                      </Row>
                    )}

                    {/* ─── Detalles sin Transporte ─── */}
                      {solicitudDetalle.detalles_sin_transporte &&
                        solicitudDetalle.detalles_sin_transporte.length > 0 && (
                          <Row className="mb-4">
                            <Col>
                              <h5>Detalles sin Transporte</h5>
                              <div className="modal-table-container">
                                <Table striped hover size="sm" className="custom-table">
                                  <thead>
                                    <tr>
                                      <th>Tipo Transporte</th>
                                      <th>Capacidad</th>
                                      <th>Unidad</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {solicitudDetalle.detalles_sin_transporte.map((d, i) => (
                                      <tr key={i}>
                                        <td>{d.nombre_tipo_transporte || 'No informado'}</td>
                                        <td>{d.valor_capacidad ?? 'N/A'}</td>
                                        <td>{d.nombre_unidad || 'N/A'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </div>
                            </Col>
                          </Row>
                      )}

                  {/* ─── Residuos ─── */}
                  <Row>
                    <Col>
                      <h5>Residuos</h5>
                      {solicitudDetalle.residuos &&
                      solicitudDetalle.residuos.length > 0 ? (
                        <div className="modal-table-container">
                          <Table striped hover size="sm" className="custom-table">
                            <thead>
                              <tr>
                                <th>Material</th>
                                <th>Código</th>
                                <th>Cantidad</th>
                                <th>Unidad</th>
                              </tr>
                            </thead>

                            <tbody>
                              {solicitudDetalle.residuos.map((r, i) => (
                                <tr key={i}>
                                  <td>{r.nombre_material_maktg}</td>
                                  <td>{r.codigo_material_matnr}</td>
                                  <td>{r.cantidad_declarada}</td>
                                  <td>{r.nombre_unidad}</td>
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
            </Modal.Footer>
          </Modal>

      {/* ---------- Modal Agendamiento ---------- */}
      <Modal
        show={showAgendamientoModal}
        onHide={handleCloseAgendamientoModal}
        size="lg"
        centered
        backdrop="static"
      >
        
        
      <Form onSubmit={handleSubmitAgendamiento}>
        <Modal.Header closeButton>
          <Modal.Title>Agendar Solicitud #{selectedSolicitudId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetalle ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              {agendamientoError && <Alert variant="danger">{agendamientoError}</Alert>}
              {mensajeErrorAsignaciones && <Alert variant="warning">{mensajeErrorAsignaciones}</Alert>}

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
                      disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
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
                      disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
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
                      value={formAgendamiento.id_linea_descarga}
                      onChange={handleFormChange}
                      disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
                    >
                      <option value="">Seleccionar línea…</option>
                      {lineasDescarga.map((linea) => (
                        <option key={linea.id_linea_descarga} value={linea.id_linea_descarga}>
                          {linea.nombre_linea}
                        </option>
                      ))}
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
                      value={formAgendamiento.numero_nota_venta}
                      onChange={handleFormChange}
                      disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="descripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descripcion"
                  rows={2}
                  value={formAgendamiento.descripcion}
                  onChange={handleFormChange}
                  disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
                />
              </Form.Group>

              <h5 className="mt-4 mb-3">Información de peligrosidad (opcional)</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="clase_peligrosidad">
                    <Form.Label>Clase</Form.Label>
                    <Form.Control
                      name="clase_peligrosidad"
                      value={formAgendamiento.clase_peligrosidad}
                      onChange={handleFormChange}
                      disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="declaracion_numero">
                    <Form.Label>N° declaración</Form.Label>
                    <Form.Control
                      name="declaracion_numero"
                      value={formAgendamiento.declaracion_numero}
                      onChange={handleFormChange}
                      disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {solicitudDetalle?.requiere_transporte && (
                <>
                  <h5 className="mt-4 mb-3">Transporte</h5>
                  <Row className="mb-3">
                    {/* Asignación */}
                    <Col md={6}>
                      <Form.Group controlId="asignacion_id">
                        <Form.Label>Asignación*</Form.Label>
                        <Form.Select
                          name="asignacion_id"
                          value={formAgendamiento.asignacion_id ?? ''}
                          onChange={handleFormChange}
                          required
                          disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
                        >
                          <option value="">Seleccionar…</option>
                          {asignaciones.map((a) => (
                            <option key={a.asignacion_id} value={a.asignacion_id}>
                              {a.nombre_transportista} – {a.descripcion_tarifa}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Transportista */}
                    <Col md={6}>
                      <Form.Group controlId="transportista_id">
                        <Form.Label>Transportista*</Form.Label>
                        <Form.Select
                          name="transportista_id"
                          value={formAgendamiento.transportista_id ?? ''}
                          onChange={handleFormChange}
                          required
                          disabled={solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles}
                        >
                          <option value="">Seleccionar…</option>
                          {transportistas.map((t) => (
                            <option key={t.transportista_id} value={t.transportista_id}>
                              {t.transportista_id} – {t.nombre_transportista}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Vehículo */}
                    <Col md={6} className="mt-3">
                      <Form.Group controlId="vehiculo_id">
                        <Form.Label>Vehículo</Form.Label>
                        <Form.Select
                          name="vehiculo_id"
                          value={formAgendamiento.vehiculo_id ?? ''}
                          onChange={handleFormChange}
                        >
                          <option value="">Seleccionar…</option>
                          {vehiculos.map((v) => (
                            <option key={v.vehiculo_id} value={v.vehiculo_id}>
                              {v.patente} – {v.nombre_tipo_transporte}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Conductor */}
                    <Col md={6} className="mt-3">
                      <Form.Group controlId="conductor_id">
                        <Form.Label>Conductor</Form.Label>
                        <Form.Select
                          name="conductor_id"
                          value={formAgendamiento.conductor_id ?? ''}
                          onChange={handleFormChange}
                        >
                          <option value="">Seleccionar…</option>
                          {conductores.map((c) => (
                            <option key={c.conductor_id} value={c.conductor_id}>
                              {c.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </>

              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAgendamientoModal}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="modal-save-button"
            disabled={loadingAgendamiento || (solicitudDetalle?.requiere_transporte && !hayAsignacionesDisponibles)}
          >
            {loadingAgendamiento ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Agendando…
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
