// src/components/AssignRiderModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Person, CheckCircle, XCircle } from 'react-bootstrap-icons';
import axios from 'axios';

const AssignRiderModal = ({ show, onHide, order, onAssign }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRider, setSelectedRider] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      fetchAvailableRiders();
    }
  }, [show]);

  const fetchAvailableRiders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/riders/available');
      setRiders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch available riders');
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedRider) {
      onAssign(selectedRider);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Assign Rider to Order #{order?.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading available riders...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : riders.length === 0 ? (
          <div className="alert alert-warning">
            No riders available at the moment. Please try again later.
          </div>
        ) : (
          <div>
            <p className="mb-3">
              Select a rider to assign to this order. The rider will be notified immediately.
            </p>
            
            <ListGroup>
              {riders.map(rider => (
                <ListGroup.Item 
                  key={rider.id}
                  action
                  active={selectedRider?.id === rider.id}
                  onClick={() => setSelectedRider(rider)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                      <Person size={20} />
                    </div>
                    <div>
                      <h6 className="mb-0">{rider.name}</h6>
                      <small className="text-muted">{rider.phone}</small>
                    </div>
                  </div>
                  
                  <div>
                    <Badge bg="info" className="me-2">
                      {rider.rating} ★
                    </Badge>
                    <Badge bg="secondary">
                      {rider.totalDeliveries} deliveries
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <XCircle className="me-1" /> Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAssign}
          disabled={!selectedRider}
        >
          <CheckCircle className="me-1" /> Assign Rider
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignRiderModal;