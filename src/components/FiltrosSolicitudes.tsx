import React, { useState } from 'react';
import { Button, Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { FaFilter, FaSearch, FaCalendarAlt } from 'react-icons/fa';

interface FiltersState {
  cliente: string;
  estado: string[];
  centro: string;
  usuario: string;
  fechaDesde: string;
  fechaHasta: string;
  requiereTransporte: string;
}

interface FiltrosSolicitudesProps {
  onApplyFilters: (filters: Record<string, any>) => void;
}

const FiltrosSolicitudes: React.FC<FiltrosSolicitudesProps> = ({ onApplyFilters }) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FiltersState>({
    cliente: "",          
    estado: [],
    centro: "",
    usuario: "",          
    fechaDesde: "",
    fechaHasta: "",
    requiereTransporte: ""
  });
  
  const estadoOptions = [
  { value: "Incompleta", label: "Incompleta" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "Agendado", label: "Agendado" },
  { value: "Completado", label: "Completado" },
  { value: "Cancelado", label: "Cancelado" }
];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFilters({
        ...filters,
        estado: [...filters.estado, value]
      });
    } else {
      setFilters({
        ...filters,
        estado: filters.estado.filter(estado => estado !== value)
      });
    }
  };
  
  const handleTransporteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      requiereTransporte: e.target.value
    });
  };
  
  const handleApplyFilters = () => {
    const formattedFilters: Record<string, any> = {
      ...filters,
      estado: filters.estado.length > 0 ? filters.estado.join(',') : undefined
    };
    
    Object.keys(formattedFilters).forEach(key => {
      if (formattedFilters[key] === "" || formattedFilters[key] === undefined) {
        delete formattedFilters[key];
      }
    });
    
    onApplyFilters(formattedFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      cliente: "",
      estado: [],
      centro: "",
      usuario: "",
      fechaDesde: "",
      fechaHasta: "",
      requiereTransporte: ""
    });
    onApplyFilters({});
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center bg-light">
        <div className="d-flex align-items-center">
          <FaFilter className="me-2" />
          <h5 className="mb-0">Filtros</h5>
        </div>
        <Button 
          variant="link" 
          onClick={() => setShowFilters(!showFilters)}
          className="text-dark"
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </Card.Header>
      
      {showFilters && (
        <Card.Body>
          <Row className="g-3">
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Código Cliente</Form.Label>
                <Form.Control
                  type="text"
                  name="cliente"
                  value={filters.cliente}
                  onChange={handleFilterChange}
                  placeholder="Ej: 600141"
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Centro</Form.Label>
                <Form.Control
                  type="text"
                  name="centro"
                  value={filters.centro}
                  onChange={handleFilterChange}
                  placeholder="Ingrese centro"
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>ID Usuario</Form.Label>
                <Form.Control
                  type="text"
                  name="usuario"
                  value={filters.usuario}
                  onChange={handleFilterChange}
                  placeholder="Ej: 14"
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label>Transporte</Form.Label>
                <Form.Select
                  name="requiereTransporte"
                  value={filters.requiereTransporte}
                  onChange={handleTransporteChange}
                >
                  <option value="">Todos</option>
                  <option value="true">Con transporte</option>
                  <option value="false">Sin transporte</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <div className="d-flex flex-wrap gap-3">
                  {estadoOptions.map(option => (
                    <Form.Check
                      key={option.value}
                      type="checkbox"
                      id={`estado-${option.value}`}
                      label={option.label}
                      value={option.value}
                      checked={filters.estado.includes(option.value)}
                      onChange={handleEstadoChange}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Label>Rango de Fechas</Form.Label>
              <Row>
                <Col>
                  <InputGroup className="mb-2">
                    <InputGroup.Text>
                      <FaCalendarAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      name="fechaDesde"
                      value={filters.fechaDesde}
                      onChange={handleFilterChange}
                      placeholder="Desde"
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaCalendarAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      name="fechaHasta"
                      value={filters.fechaHasta}
                      onChange={handleFilterChange}
                      placeholder="Hasta"
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="outline-secondary" onClick={handleResetFilters}>
              Limpiar filtros
            </Button>
            <Button className="form-button-primary" onClick={handleApplyFilters}>
              <FaSearch className="me-2" />
              Aplicar filtros
            </Button>
          </div>
        </Card.Body>
      )}
    </Card>
  );
};

export default FiltrosSolicitudes;