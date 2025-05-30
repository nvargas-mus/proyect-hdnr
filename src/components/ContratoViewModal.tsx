// ContratoViewModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Button, Table, Spinner, Alert } from 'react-bootstrap';
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
    <Modal show={show} onHide={onClose} centered size="lg">
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
          <Table bordered hover>
            <tbody>
              <tr>
                <th>ID del Contrato</th>
                <td>{contrato.contrato_id}</td>
              </tr>
              <tr>
                <th>¿Es Spot?</th>
                <td>{contrato.es_spot ? 'Sí' : 'No'}</td>
              </tr>
              <tr>
                <th>Transportista</th>
                <td>
                  {contrato.nombre_transportista || 'N/A'}
                  {contrato.rut_transportista ? ` (RUT: ${contrato.rut_transportista})` : ''}
                </td>
              </tr>
              <tr>
                <th>Documento</th>
                <td>{contrato.documento_respaldo ? contrato.documento_respaldo.split('/').pop() : 'No disponible'}</td>
              </tr>
              <tr>
                <th>Fecha Fin</th>
                <td>{formatDate(contrato.fecha_fin)}</td>
              </tr>
              <tr>
                <th>Tipo Reajuste</th>
                <td>{contrato.tipo_reajuste || 'N/A'}</td>
              </tr>
              <tr>
                <th>Frecuencia Reajuste</th>
                <td>{contrato.frecuencia_reajuste || 'N/A'}</td>
              </tr>
              <tr>
                <th>Próximo Reajuste</th>
                <td>{formatDate(contrato.fecha_proximo_reajuste)}</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContratoViewModal;
