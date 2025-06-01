import React from 'react';
import { Offcanvas, ListGroup, Badge, Button } from 'react-bootstrap';

export default function RidersSidebar({ show, onHide, riders }) {
  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Available Riders</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ListGroup>
          {riders.map(rider => (
            <ListGroup.Item key={rider.id} className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0">{rider.name}</h6>
                <div className="d-flex align-items-center mt-1">
                  <small className="me-2">{rider.vehicle} ({rider.plate})</small>
                  <Badge bg={rider.status === 'available' ? 'success' : 'secondary'}>
                    {rider.status}
                  </Badge>
                </div>
                <div className="mt-1">
                  <small className="text-muted">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {rider.rating} ({rider.reviews} reviews)
                  </small>
                </div>
              </div>
              <div>
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  disabled={rider.status !== 'available'}
                >
                  Assign
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        
        <div className="mt-4">
          <h5>Rider Statistics</h5>
          <div className="d-flex justify-content-between mb-2">
            <span>Available Riders:</span>
            <strong>{riders.filter(r => r.status === 'available').length}</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Average Response Time:</span>
            <strong>15 mins</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span>Delivery Success Rate:</span>
            <strong>98.2%</strong>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}