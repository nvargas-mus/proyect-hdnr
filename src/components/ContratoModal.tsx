import { useState, useEffect, FormEvent } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { getContratoById, updateContrato } from '../services/adminService';

interface ContratoModalProps {
  contratoId: number;
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface ContratoFormData {
  transportista_id: number | null;
  es_spot: boolean;
  documento_respaldo: File | null;
  fecha_fin: string;
  tipo_reajuste: string;
  frecuencia_reajuste: string;
  fecha_proximo_reajuste: string;
}

const ContratoModal = ({ contratoId, show, onClose, onSave }: ContratoModalProps) => {
  const [originalContrato, setOriginalContrato] = useState<any>(null);
  const [formData, setFormData] = useState<ContratoFormData>({
    transportista_id: null,
    es_spot: false,
    documento_respaldo: null,
    fecha_fin: '',
    tipo_reajuste: '',
    frecuencia_reajuste: '',
    fecha_proximo_reajuste: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const contratoData = await getContratoById(contratoId);
        setOriginalContrato(contratoData);

        setFormData({
          transportista_id: contratoData.transportista_id,
          es_spot: contratoData.es_spot,
          documento_respaldo: null,
          fecha_fin: contratoData.fecha_fin ? contratoData.fecha_fin.split('T')[0] : '',
          tipo_reajuste: contratoData.tipo_reajuste || '',
          frecuencia_reajuste: contratoData.frecuencia_reajuste || '',
          fecha_proximo_reajuste: contratoData.fecha_proximo_reajuste ? contratoData.fecha_proximo_reajuste.split('T')[0] : '',
        });
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos del contrato.');
      } finally {
        setLoading(false);
      }
    };

    if (show && contratoId) {
      fetchData();
    }
  }, [contratoId, show]);

  const handleChange = (e: any) => {
  const { name, value, type, checked, files } = e.target;
  if (type === 'checkbox') {
    setFormData({ ...formData, [name]: checked });
  } else if (type === 'file') {
    setFormData({ ...formData, [name]: files[0] });
  } else {
    setFormData({ ...formData, [name]: value });
  }
};


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      if (formData.es_spot !== originalContrato.es_spot) {
        formDataToSend.append('es_spot', formData.es_spot.toString());
      }

      if (formData.documento_respaldo) {
        formDataToSend.append('documento', formData.documento_respaldo);
      }

      if (formData.fecha_fin) {
        formDataToSend.append('fecha_fin', formData.fecha_fin);
      }

      if (formData.tipo_reajuste) {
        formDataToSend.append('tipo_reajuste', formData.tipo_reajuste);
      }

      if (formData.frecuencia_reajuste) {
        formDataToSend.append('frecuencia_reajuste', formData.frecuencia_reajuste);
      }

      if (formData.fecha_proximo_reajuste) {
        formDataToSend.append('fecha_proximo_reajuste', formData.fecha_proximo_reajuste);
      }

      await updateContrato(contratoId, formDataToSend);
      onSave();
    } catch (err) {
      console.error('Error al actualizar el contrato:', err);
      setError('Error al actualizar el contrato.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Contrato - ID {contratoId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>ID Transportista</Form.Label>
              <Form.Control type="text" value={formData.transportista_id || ''} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="es_spot"
                name="es_spot"
                label="¿Es un contrato Spot?"
                checked={formData.es_spot}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Documento de Respaldo</Form.Label>
              <Form.Control type="file" name="documento_respaldo" onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha Fin</Form.Label>
              <Form.Control type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo Reajuste</Form.Label>
              <Form.Select name="tipo_reajuste" value={formData.tipo_reajuste} onChange={handleChange}>
                <option value="">Seleccione tipo de reajuste</option>
                <option value="sin reajuste">Sin reajuste</option>
                <option value="por polinomio">Por polinomio</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Frecuencia Reajuste</Form.Label>
              <Form.Select name="frecuencia_reajuste" value={formData.frecuencia_reajuste} onChange={handleChange}>
                <option value="">Seleccione frecuencia</option>
                <option value="Sin reajuste">Sin reajuste</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha del Próximo Reajuste</Form.Label>
              <Form.Control type="date" name="fecha_proximo_reajuste" value={formData.fecha_proximo_reajuste} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onClose} className="me-2">Cancelar</Button>
              <Button type="submit" variant="primary" disabled={loading}>Guardar Cambios</Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ContratoModal;
