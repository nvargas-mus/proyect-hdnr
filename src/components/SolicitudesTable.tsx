import React from 'react';
import { Table, Button, Badge, Pagination } from 'react-bootstrap';
import { FaEye, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import { Solicitud } from '../services/coordinadorServices';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import '../styles/CoordinadorPage.css';

interface SolicitudesTableProps {
  solicitudes: Solicitud[];
  loading: boolean;
  error: string | null;
  paginaActual: number;
  totalPaginas: number;
  onPageChange: (page: number) => void;
  onVerDetalle: (id: number) => void;
  onEditar: (id: number) => void;
  onVerFecha: (id: number) => void;
}

const SolicitudesTable: React.FC<SolicitudesTableProps> = ({
  solicitudes,
  loading,
  error,
  paginaActual,
  totalPaginas,
  onPageChange,
  onVerDetalle,
  onEditar,
  onVerFecha
}) => {
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getEstadoBadge = (estado: string) => {
    if (!estado) {
      return <Badge bg="secondary">Desconocido</Badge>;
    }
    
    switch (estado.toLowerCase()) {
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

  if (loading) {
    return <div className="text-center my-5">Cargando solicitudes...</div>;
  }

  if (error) {
    return <div className="alert alert-danger my-3">{error}</div>;
  }

  const containerClassName = isAdminContext ? 'content-container' : '';

  return (
    <div className={containerClassName}>
      <h4 className="mb-4">Solicitudes de Servicio</h4>
      <div className="table-responsive">
        <Table className="custom-table" striped bordered hover>
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
            {solicitudes.length > 0 ? (
              solicitudes.map((solicitud) => (
                <tr key={`${solicitud.solicitud_id}-${solicitud.fecha_solicitud}`}>
                  <td>{solicitud.solicitud_id}</td>
                  <td>{solicitud.codigo_cliente_kunnr}</td>
                  <td>{solicitud.nombre_name1}</td>
                  <td>{solicitud.sucursal_name2}</td>
                  <td>{formatDate(solicitud.fecha_servicio_solicitada)}</td>
                  <td>{solicitud.hora_servicio_solicitada.substring(0, 5)}</td>
                  <td>{getEstadoBadge(solicitud.nombre_estado)}</td>
                  <td>{solicitud.comuna || 'N/A'}</td>
                  <td>
                    {solicitud.requiere_transporte ? 
                      <Badge bg="success">Sí</Badge> : 
                      <Badge bg="secondary">No</Badge>}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        className="form-button-primary"
                        size="sm"
                        onClick={() => onVerFecha(solicitud.solicitud_id)}
                        title="Ver fecha"
                      >
                        <FaCalendarAlt />
                      </Button>
                      <Button 
                        className="form-button-primary"
                        size="sm"
                        onClick={() => onEditar(solicitud.solicitud_id)}
                        title="Editar"
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        className="form-button-primary"
                        size="sm"
                        onClick={() => onVerDetalle(solicitud.solicitud_id)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center">
                  No se encontraron solicitudes
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Pagination className="justify-content-center mt-4">
        <Pagination.First 
          onClick={() => onPageChange(1)} 
          disabled={paginaActual === 1} 
        />
        <Pagination.Prev 
          onClick={() => onPageChange(paginaActual - 1)}
          disabled={paginaActual === 1}
        />
        
        {[...Array(totalPaginas)].map((_, i) => (
          <Pagination.Item
            key={i + 1}
            active={i + 1 === paginaActual}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        
        <Pagination.Next 
          onClick={() => onPageChange(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        />
        <Pagination.Last 
          onClick={() => onPageChange(totalPaginas)}
          disabled={paginaActual === totalPaginas}
        />
      </Pagination>
    </div>
  );
};

export default SolicitudesTable;