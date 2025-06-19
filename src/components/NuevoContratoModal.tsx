// NuevoContratoModal.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { createContrato, getTransportistas } from '../services/adminService';

interface NuevoContratoModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface TransportistaAPI {
  transportista_id: number;
  nombre_transportista: string;
  rut_transportista: string;
  direccion_transportista: string;
  fecha_creacion: string;
  ultima_actualizacion: string;
}

const NuevoContratoModal: React.FC<NuevoContratoModalProps> = ({ show, onClose, onSave }) => {
  const [transportistas, setTransportistas] = useState<TransportistaAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    transportista_id: '',
    es_spot: 'false',
    fecha_fin: '',
    tipo_reajuste: 'Sin reajuste',
    frecuencia_reajuste: 'Sin reajuste',
    fecha_proximo_reajuste: '',
    documento: null as File | null
  });

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(null);
      fetchTransportistas();
    }
  }, [show]);

  const fetchTransportistas = async () => {
    setLoading(true);
    try {
      const data = await getTransportistas();
      setTransportistas(data as unknown as TransportistaAPI[]);
    } catch (err) {
      console.error('Error al cargar transportistas:', err);
      setError('No se pudieron cargar los transportistas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, documento: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('transportista_id', formData.transportista_id);
      formDataToSend.append('es_spot', formData.es_spot);
      formDataToSend.append('fecha_fin', formData.fecha_fin);
      formDataToSend.append('tipo_reajuste', formData.tipo_reajuste);
      formDataToSend.append('frecuencia_reajuste', formData.frecuencia_reajuste);
      formDataToSend.append('fecha_proximo_reajuste', formData.fecha_proximo_reajuste);

      if (formData.documento) {
        formDataToSend.append('documento', formData.documento);
      }

      await createContrato(formDataToSend);
      setSuccess('Contrato creado exitosamente');

      setFormData({
        transportista_id: '',
        es_spot: 'false',
        fecha_fin: '',
        tipo_reajuste: 'Sin reajuste',
        frecuencia_reajuste: 'Sin reajuste',
        fecha_proximo_reajuste: '',
        documento: null
      });

      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      console.error('Error al crear contrato:', err);
      setError('Error al crear el contrato. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nuevo Contrato</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Transportista</Form.Label>
            <Form.Select
              name="transportista_id"
              value={formData.transportista_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un transportista</option>
              {transportistas.map(t => (
                <option key={t.transportista_id} value={t.transportista_id}>
                  {`${t.transportista_id} - ${t.nombre_transportista}`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>¿Es Spot?</Form.Label>
            <Form.Select
              name="es_spot"
              value={formData.es_spot}
              onChange={handleInputChange}
              required
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha Fin</Form.Label>
            <Form.Control
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Reajuste</Form.Label>
            <Form.Select
              name="tipo_reajuste"
              value={formData.tipo_reajuste}
              onChange={handleInputChange}
              required
            >
              <option value="Sin reajuste">Sin reajuste</option>
              <option value="Por polinomio">Por polinomio</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Frecuencia de Reajuste</Form.Label>
            <Form.Select
              name="frecuencia_reajuste"
              value={formData.frecuencia_reajuste}
              onChange={handleInputChange}
              required
            >
              <option value="Sin reajuste">Sin reajuste</option>
              <option value="Mensual">Mensual</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha Próximo Reajuste</Form.Label>
            <Form.Control
              type="date"
              name="fecha_proximo_reajuste"
              value={formData.fecha_proximo_reajuste}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Documento Respaldo</Form.Label>
            <Form.Control
              type="file"
              name="documento"
              onChange={handleFileChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onClose} className="me-2" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Contrato'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NuevoContratoModal;

