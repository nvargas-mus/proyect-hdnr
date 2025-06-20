import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { getContratoById } from '../services/adminService';

interface ContratoViewModalProps {
  contratoId: number;
  show: boolean;
  onClose: () => void;
}

const ContratoViewModal = ({ contratoId, show, onClose }: ContratoViewModalProps) => {
  const [contrato, setContrato] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContrato = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getContratoById(contratoId);
        setContrato(data);
      } catch (err) {
        console.error('Error cargando datos del contrato:', err);
        setError('Error al cargar los datos del contrato.');
      } finally {
        setLoading(false);
      }
    };

    if (show && contratoId) {
      fetchContrato();
    }
  }, [contratoId, show]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      dialogClassName="custom-modal-style"
    >
      <Modal.Header closeButton>
        <Modal.Title>Detalles del Contrato - ID {contratoId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : contrato ? (
          <dl className="row">
            <dt className="col-sm-4">ID del Contrato</dt>
            <dd className="col-sm-8">{contrato.contrato_id}</dd>

            <dt className="col-sm-4">¿Es Spot?</dt>
            <dd className="col-sm-8">{contrato.es_spot ? 'Sí' : 'No'}</dd>

            <dt className="col-sm-4">Transportista</dt>
            <dd className="col-sm-8">
              {contrato.nombre_transportista || 'N/A'}
              {contrato.rut_transportista ? ` (RUT: ${contrato.rut_transportista})` : ''}
            </dd>

            <dt className="col-sm-4">Documento</dt>
            <dd className="col-sm-8">
              {contrato.documento_respaldo
                ? contrato.documento_respaldo.split('/').pop()
                : 'No disponible'}
            </dd>

            <dt className="col-sm-4">Fecha Fin</dt>
            <dd className="col-sm-8">{formatDate(contrato.fecha_fin)}</dd>

            <dt className="col-sm-4">Tipo Reajuste</dt>
            <dd className="col-sm-8">{contrato.tipo_reajuste || 'N/A'}</dd>

            <dt className="col-sm-4">Frecuencia Reajuste</dt>
            <dd className="col-sm-8">{contrato.frecuencia_reajuste || 'N/A'}</dd>

            <dt className="col-sm-4">Próximo Reajuste</dt>
            <dd className="col-sm-8">{formatDate(contrato.fecha_proximo_reajuste)}</dd>
          </dl>
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button className="form-button-outline" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContratoViewModal;


