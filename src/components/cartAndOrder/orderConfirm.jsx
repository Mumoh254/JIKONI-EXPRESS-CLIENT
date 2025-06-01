// OrderConfirmation.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Alert, Form, 
  ListGroup, Badge, Spinner
} from 'react-bootstrap';
import { GeoAlt, Clock as ClockIcon, Person, Scooter } from 'react-bootstrap-icons';

const DELIVERY_BASE_FEE = 50; // Base delivery fee in KSh
const DELIVERY_PER_KM = 15;   // Per kilometer charge

const OrderConfirmation = ({ cart, location, onConfirm, onBack, chefLocation }) => {
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(DELIVERY_BASE_FEE);
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryFee;

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Calculate delivery fee based on distance
  useEffect(() => {
    if (location && chefLocation) {
      const distance = calculateDistance(
        location.lat, 
        location.lng,
        chefLocation.lat,
        chefLocation.lng
      );
      
      // Round to nearest 0.5 km and calculate fee
      const roundedDistance = Math.round(distance * 2) / 2;
      const fee = DELIVERY_BASE_FEE + (roundedDistance * DELIVERY_PER_KM);
      setDeliveryFee(fee);
    }
  }, [location, chefLocation]);

  const handleConfirmOrder = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 1500);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-0 py-4">
              <h2 className="text-center mb-0">Confirm Your Order</h2>
            </Card.Header>
            
            <Card.Body>
              <div className="mb-4">
                <h5 className="mb-3">Delivery Location</h5>
                {location ? (
                  <div className="d-flex align-items-center bg-light p-3 rounded">
                    <GeoAlt size={24} className="text-primary me-3" />
                    <div>
                      <p className="mb-0 fw-bold">{location.address}</p>
                      <small className="text-muted">
                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                      </small>
                    </div>
                  </div>
                ) : (
                  <Alert variant="warning" className="d-flex align-items-center">
                    <ClockIcon size={20} className="me-2" />
                    <span>Fetching your location...</span>
                  </Alert>
                )}
                {locationError && (
                  <Alert variant="danger" className="mt-2">
                    {locationError}
                  </Alert>
                )}
              </div>
              
              <div className="mb-4">
                <h5 className="mb-3">Chef Location</h5>
                {chefLocation ? (
                  <div className="d-flex align-items-center bg-light p-3 rounded">
                    <GeoAlt size={24} className="text-success me-3" />
                    <div>
                      <p className="mb-0 fw-bold">{chefLocation.area}</p>
                      <small className="text-muted">
                        Lat: {chefLocation.lat.toFixed(6)}, Lng: {chefLocation.lng.toFixed(6)}
                      </small>
                    </div>
                  </div>
                ) : (
                  <Alert variant="warning" className="d-flex align-items-center">
                    <ClockIcon size={20} className="me-2" />
                    <span>Fetching chef location...</span>
                  </Alert>
                )}
              </div>
              
              <div className="mb-4">
                <h5 className="mb-3">Order Summary</h5>
                <ListGroup variant="flush">
                  {cart.map(item => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                      <div>
                        {item.title} 
                        {item.isPreOrder && (
                          <Badge bg="info" className="ms-2">
                            Pre-Order
                          </Badge>
                        )}
                        <span className="text-muted d-block">x {item.quantity}</span>
                      </div>
                      <div>
                        KSh {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </ListGroup.Item>
                  ))}
                  
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span>KSh {subtotal.toFixed(2)}</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Delivery Fee</span>
                    <span>KSh {deliveryFee.toFixed(2)}</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span className="text-primary">KSh {total.toFixed(2)}</span>
                  </ListGroup.Item>
                </ListGroup>
              </div>
              
              <div className="mb-4">
                <h5 className="mb-3">Payment Method</h5>
                <Form.Select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-3"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash on Delivery</option>
                </Form.Select>
                
                {paymentMethod === 'mpesa' && (
                  <Form.Group className="mb-3">
                    <Form.Label>M-Pesa Phone Number</Form.Label>
                    <Form.Control 
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </Form.Group>
                )}
              </div>
            </Card.Body>
            
            <Card.Footer className="bg-white border-0 py-3">
              <div className="d-grid gap-3">
                <Button 
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmOrder}
                  disabled={isLoading || !location}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing Order...
                    </>
                  ) : 'Confirm Order'}
                </Button>
                
                <Button 
                  variant="outline-secondary"
                  size="lg"
                  onClick={onBack}
                >
                  Back to Cart
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderConfirmation;