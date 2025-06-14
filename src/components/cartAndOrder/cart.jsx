import React, { useState, useEffect, useRef } from "react";
import {
  Offcanvas, Badge, Tabs, Tab, ListGroup, Stack, Button,
  Modal, ProgressBar, Row, Col, Form
} from 'react-bootstrap';
import {
  CartPlus, Plus, Dash, Trash, Person, Scooter, Telephone, CheckCircle, 
  Calendar, Clock
} from 'react-bootstrap-icons';
import styled from 'styled-components';

// Jikoni Express Color Palette
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
};

const CartContainer = styled(Offcanvas)`
  width: 360px !important;
  box-shadow: -4px 0 20px rgba(0,0,0,0.05);
  background: ${colors.lightBackground};
  border-left: 1px solid ${colors.borderColor};
`;

const CartItem = styled(ListGroup.Item)`
  transition: all 0.2s ease;
  background: transparent !important;
  border-bottom: 1px solid ${colors.borderColor} !important;
  padding: 1.25rem;
  
  &:hover {
    transform: translateX(4px);
    background: ${colors.cardBackground} !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-radius: 8px;
  }
`;

const FoodImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const FixedFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: ${colors.cardBackground};
  padding: 1.5rem;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  border-radius: 12px 12px 0 0;
  border-top: 1px solid ${colors.borderColor};
`;

const CallControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

const OrderStatusBadge = styled(Badge)`
  font-size: 0.8rem;
  padding: 0.5em 0.7em;
  background-color: ${props => {
    switch (props.variant) {
      case 'preparing': return '#FFC107';
      case 'dispatched': return '#3498DB';
      case 'delivered': return colors.secondary;
      case 'cancelled': return colors.errorText;
      default: return colors.placeholderText;
    }
  }};
`;

const PreOrderBadge = styled(Badge)`
  background: linear-gradient(45deg, ${colors.primary}, #FF6B6B);
  color: #fff;
  border: none;
  padding: 0.4em 0.8em;
  font-weight: 500;
`;

const PreOrderModal = ({ show, onClose, selectedFood, onSubmit }) => {
  const [preOrderForm, setPreOrderForm] = useState({
    date: '',
    time: '',
    servings: 1,
    instructions: ''
  });

  const handleSubmit = () => {
    onSubmit({
      ...selectedFood,
      ...preOrderForm,
      isPreOrder: true,
      type: 'pre-order',
      totalPrice: selectedFood.price * preOrderForm.servings
    });
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="border-0 pb-0" style={{ backgroundColor: colors.cardBackground }}>
        <Modal.Title className="fw-bold" style={{ color: colors.darkText }}>
          Pre-Order Your Meal
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="py-4" style={{ backgroundColor: colors.cardBackground }}>
        {selectedFood && (
          <div className="d-flex align-items-center mb-4">
            <div className="me-3" style={{ 
              width: '80px', 
              height: '80px', 
              overflow: 'hidden',
              borderRadius: '12px' 
            }}>
              <img 
                src={selectedFood.photoUrls[0]} 
                alt={selectedFood.title}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <div>
              <h5 className="mb-1 fw-bold" style={{ color: colors.darkText }}>{selectedFood.title}</h5>
              <div className="d-flex align-items-center">
                <PreOrderBadge pill>
                  {selectedFood.mealType}
                </PreOrderBadge>
                <span className="fw-bold ms-2" style={{ color: colors.primary }}>
                  KES {selectedFood.price}
                </span>
              </div>
            </div>
          </div>
        )}

        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="preOrderDate">
                <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Delivery Date</Form.Label>
                <div className="input-group border rounded-3 overflow-hidden" style={{ borderColor: colors.borderColor }}>
                  <span className="input-group-text bg-white border-0">
                    <Calendar size={18} style={{ color: colors.placeholderText }} />
                  </span>
                  <Form.Control 
                    type="date" 
                    aria-label="Delivery Date"
                    value={preOrderForm.date}
                    onChange={(e) => setPreOrderForm({...preOrderForm, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="border-0 py-2 px-3"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <small className="d-block mt-1" style={{ color: colors.placeholderText }}>Select delivery date</small>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="preOrderTime">
                <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Delivery Time</Form.Label>
                <div className="input-group border rounded-3 overflow-hidden" style={{ borderColor: colors.borderColor }}>
                  <span className="input-group-text bg-white border-0">
                    <Clock size={18} style={{ color: colors.placeholderText }} />
                  </span>
                  <Form.Control 
                    type="time" 
                    aria-label="Delivery Time"
                    value={preOrderForm.time}
                    onChange={(e) => setPreOrderForm({...preOrderForm, time: e.target.value})}
                    className="border-0 py-2 px-3"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <small className="d-block mt-1" style={{ color: colors.placeholderText }}>Choose convenient time</small>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="servings">
                <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Number of Servings</Form.Label>
                <Form.Select 
                  aria-label="Number of Servings"
                  value={preOrderForm.servings}
                  onChange={(e) => setPreOrderForm({...preOrderForm, servings: parseInt(e.target.value)})}
                  className="py-2 px-3 border rounded-3"
                  style={{ 
                    height: 'calc(2.5rem + 10px)',
                    boxShadow: 'none',
                    borderColor: colors.borderColor
                  }}
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} serving{num > 1 ? 's' : ''}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="totalPrice">
                <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Total Price</Form.Label>
                <div className="d-flex align-items-center justify-content-center h-100 rounded-3 py-2"
                  style={{ backgroundColor: colors.lightBackground }}>
                  <h4 className="mb-0 fw-bold" style={{ color: colors.primary }}>
                    {selectedFood ? `KES ${(selectedFood.price * preOrderForm.servings).toFixed(2)}` : ''}
                  </h4>
                </div>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="specialInstructions">
                <Form.Label className="fw-medium mb-2" style={{ color: colors.darkText }}>Special Instructions</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  placeholder="Any dietary restrictions or special requests..."
                  value={preOrderForm.instructions}
                  onChange={(e) => setPreOrderForm({...preOrderForm, instructions: e.target.value})}
                  className="border rounded-3 p-3"
                  style={{ 
                    boxShadow: 'none',
                    borderColor: colors.borderColor
                  }}
                />
                <small className="d-block mt-1" style={{ color: colors.placeholderText }}>We'll accommodate your requests</small>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0" style={{ backgroundColor: colors.cardBackground }}>
        <Button 
          variant="outline-secondary" 
          className="fw-medium px-4 py-2"
          onClick={onClose}
          style={{
            borderColor: colors.placeholderText,
            color: colors.darkText
          }}
        >
          Cancel
        </Button>
        <Button 
          className="px-4 py-2 fw-bold text-white"
          style={{
            background: colors.primary,
            border: 'none',
            '&:hover': {
              backgroundColor: colors.buttonHover
            }
          }}
          onClick={handleSubmit}
          disabled={!preOrderForm.date || !preOrderForm.time}
        >
          Confirm Pre-Order
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const CartSidebar = ({ 
  show, 
  onClose, 
  cart, 
  updateCart, 
  onCheckout, 
  activeOrders,
  pastOrders,
  onConfirmDelivery,
  userType
}) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [activeTab, setActiveTab] = useState('cart');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callRecipient, setCallRecipient] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [currentOrder, setCurrentOrder] = useState(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);

  // WebRTC setup
  const setupWebRTC = async () => {
    try {
      // Initialize WebRTC
      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      pcRef.current = new RTCPeerConnection(configuration);
      
      // Get user media
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = streamRef.current;
      }
      
      // Add tracks to connection
      streamRef.current.getTracks().forEach(track => {
        pcRef.current.addTrack(track, streamRef.current);
      });
      
      // Set up event handlers
      pcRef.current.ontrack = event => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };
      
      pcRef.current.onicecandidate = event => {
        if (event.candidate) {
          // Send candidate to other peer (would be done via signaling server in real app)
          console.log('ICE candidate:', event.candidate);
        }
      };
      
      pcRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', pcRef.current.connectionState);
        setCallStatus(pcRef.current.connectionState);
      };
      
      setCallStatus('ready');
    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      setCallStatus('error');
    }
  };

  const startCall = async (order, recipient) => {
    setCurrentOrder(order);
    setCallRecipient(recipient);
    setShowCallModal(true);
    
    if (callStatus === 'idle') {
      await setupWebRTC();
    }
    
    try {
      // Create offer (in real app, this would be sent via signaling server)
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      setCallStatus('calling');
      
      // Simulate answer from other side (in real app, this would come via signaling)
      setTimeout(async () => {
        if (pcRef.current) {
          const answer = { type: 'answer', sdp: 'simulated-answer-sdp' };
          await pcRef.current.setRemoteDescription(answer);
          setCallStatus('connected');
        }
      }, 2000);
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('error');
    }
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCallStatus('idle');
    setShowCallModal(false);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'preparing': return 'warning';
      case 'dispatched': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'preparing': return 33;
      case 'dispatched': return 66;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  useEffect(() => {
    return () => {
      // Clean up WebRTC resources when component unmounts
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <CartContainer show={show} onHide={onClose} placement="end"
      style={{
        zIndex: '2000'
      }} >
        <Offcanvas.Header closeButton className="border-bottom" style={{ backgroundColor: colors.cardBackground }}>
          <Offcanvas.Title className="d-flex align-items-center gap-2">
            <CartPlus fontSize={24} style={{ color: colors.primary }} />
            <span className="fw-bold" style={{ color: colors.darkText }}>Your Food Cart</span>
            <Badge bg="secondary" pill style={{ backgroundColor: colors.placeholderText }}>
              {cart.length}
            </Badge>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-0" style={{ backgroundColor: colors.lightBackground }}>
          <Tabs
            activeKey={activeTab}
            onSelect={setActiveTab}
            id="cart-tabs"
            className="mb-3 px-3"
            variant="pills"
          >
            <Tab eventKey="cart" title="Current Order">
              <div className="flex-grow-1 overflow-auto p-3">
                {cart.length === 0 ? (
                  <div className="text-center py-4" style={{ color: colors.placeholderText }}>
                    Your cart is empty. Start adding delicious items!
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {cart.map(item => (
                      <CartItem key={item.id}>
                        <Stack direction="horizontal" gap={3} className="align-items-start">
                          <FoodImage 
                            src={item.photoUrls?.[0] || '/placeholder-food.jpg'}
                            alt={item.title}
                            className="mt-1"
                          />
                          
                          <Stack className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold mb-2 ms-3" style={{ color: colors.darkText }}>
                              {item.title}
                            </h6>
                            
                            {item.isPreOrder && (
                              <div className="ms-3 mb-2">
                                <PreOrderBadge className="me-2">Pre-Order</PreOrderBadge>
                                <small style={{ color: colors.placeholderText }}>
                                  {item.preOrderDate} at {item.preOrderTime}
                                </small>
                              </div>
                            )}
                            
                            <Stack direction="horizontal" gap={2} className="align-items-center ms-3">
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="d-flex align-items-center justify-content-center p-1"
                                style={{ 
                                  width: '32px',
                                  borderColor: colors.borderColor
                                }}
                                onClick={() => updateCart(item, -1)}
                                disabled={item.quantity === 1}
                              >
                                <Dash />
                              </Button>
                              <span className="fw-bold" style={{ color: colors.primary }}>{item.quantity}</span>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                className="d-flex align-items-center justify-content-center p-1"
                                style={{ 
                                  width: '32px',
                                  borderColor: colors.primary,
                                  color: colors.primary
                                }}
                                onClick={() => updateCart(item, 1)}
                              >
                                <Plus />
                              </Button>
                            </Stack>
                          </Stack>

                          <Stack className="align-items-end">
                            <div className="text-end mb-2">
                              <span className="fw-semibold" style={{ color: colors.darkText }}>
                                KSh {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            <Button 
                              size="sm"
                              className="d-flex align-items-center gap-1 border-0"
                              onClick={() => updateCart(item, -item.quantity)}
                              style={{ 
                                backgroundColor: 'transparent',
                                color: colors.errorText,
                                padding: 0
                              }}
                            >
                              <Trash size={14} />
                              <span>Remove</span>
                            </Button>
                          </Stack>
                        </Stack>
                      </CartItem>
                    ))}
                  </ListGroup>
                )}
              </div>

              <FixedFooter>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: colors.placeholderText }}>Subtotal:</span>
                    <span className="fw-semibold" style={{ color: colors.darkText }}>
                      KSh {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top">
                    <span className="fw-bold" style={{ color: colors.darkText }}>Total:</span>
                    <span className="fw-bold" style={{ color: colors.primary }}>
                      KSh {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-100 fw-bold py-3 border-0"
                  onClick={onCheckout}
                  disabled={cart.length === 0}
                  style={{ 
                    backgroundColor: cart.length === 0 ? colors.disabledButton : colors.primary,
                    '&:hover': {
                      backgroundColor: cart.length === 0 ? colors.disabledButton : colors.buttonHover
                    }
                  }}
                >
                  Proceed to Checkout →
                </Button>
              </FixedFooter>
            </Tab>
            
            <Tab eventKey="active" title="Active Orders">
              <div className="p-3">
                {(activeOrders?.length ?? 0) === 0 ? (
                  <div className="text-center py-4" style={{ color: colors.placeholderText }}>
                    You have no active orders
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {activeOrders.map(order => (
                      <ListGroup.Item key={order.id} className="py-3 border-bottom" 
                        style={{ borderBottomColor: colors.borderColor }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <h6 className="mb-0 fw-bold" style={{ color: colors.darkText }}>
                              Order #{order.id.slice(0, 8)}
                            </h6>
                            <small style={{ color: colors.placeholderText }}>
                              {new Date(order.date).toLocaleString()}
                            </small>
                          </div>
                          <OrderStatusBadge variant={order.status}>
                            {order.status}
                          </OrderStatusBadge>
                        </div>
                        
                        <ProgressBar 
                          now={getStatusProgress(order.status)} 
                          className="mb-3"
                          label={`${getStatusProgress(order.status)}%`}
                          style={{
                            backgroundColor: colors.lightBackground,
                            '& .progress-bar': {
                              backgroundColor: getStatusVariant(order.status) === 'warning' ? '#FFC107' :
                                              getStatusVariant(order.status) === 'info' ? '#3498DB' :
                                              getStatusVariant(order.status) === 'success' ? colors.secondary : 
                                              colors.errorText
                            }
                          }}
                        />
                        
                        <Row className="mb-2">
                          <Col>
                            <div className="small" style={{ color: colors.placeholderText }}>Chef</div>
                            <div className="fw-semibold" style={{ color: colors.darkText }}>
                              {order.chef?.name || 'Not assigned'}
                            </div>
                          </Col>
                          <Col>
                            <div className="small" style={{ color: colors.placeholderText }}>Rider</div>
                            <div className="fw-semibold" style={{ color: colors.darkText }}>
                              {order.rider ? `${order.rider.name} (ID: ${order.rider.id})` : 'Not assigned'}
                            </div>
                          </Col>
                        </Row>
                        
                        <div className="mb-2">
                          <strong style={{ color: colors.darkText }}>Items:</strong> 
                          <span className="ms-2" style={{ color: colors.placeholderText }}>
                            {order.items.map(i => i.title).join(', ')}
                          </span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <strong style={{ color: colors.darkText }}>Total:</strong> 
                            <span style={{ color: colors.primary, marginLeft: '5px' }}>
                              KSh {order.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => startCall(order, 'chef')}
                              disabled={!order.chef}
                              style={{ 
                                borderColor: colors.primary,
                                color: colors.primary
                              }}
                            >
                              <Telephone className="me-1" /> Chef
                            </Button>
                            {order.rider && (
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => startCall(order, 'rider')}
                                style={{ 
                                  borderColor: colors.secondary,
                                  color: colors.secondary
                                }}
                              >
                                <Scooter className="me-1" /> Rider
                              </Button>
                            )}
                            {userType === 'customer' && order.status === 'dispatched' && (
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => onConfirmDelivery(order.id)}
                                style={{ backgroundColor: colors.secondary, borderColor: colors.secondary }}
                              >
                                <CheckCircle className="me-1" /> Confirm
                              </Button>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Tab>
            
            <Tab eventKey="history" title="Order History">
              <div className="p-3">
                {(pastOrders?.length ?? 0) === 0 ? (
                  <div className="text-center py-4" style={{ color: colors.placeholderText }}>
                    You haven't placed any orders yet
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {pastOrders.map(order => (
                      <ListGroup.Item key={order.id} className="py-3 border-bottom" 
                        style={{ borderBottomColor: colors.borderColor }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <h6 className="mb-0 fw-bold" style={{ color: colors.darkText }}>
                              Order #{order.id.slice(0, 8)}
                            </h6>
                            <small style={{ color: colors.placeholderText }}>
                              {new Date(order.date).toLocaleString()}
                            </small>
                          </div>
                          <OrderStatusBadge variant={order.status}>
                            {order.status}
                          </OrderStatusBadge>
                        </div>
                        
                        <Row className="mb-2">
                          <Col>
                            <div className="small" style={{ color: colors.placeholderText }}>Chef</div>
                            <div className="fw-semibold" style={{ color: colors.darkText }}>
                              {order.chef?.name || 'N/A'}
                            </div>
                          </Col>
                          <Col>
                            <div className="small" style={{ color: colors.placeholderText }}>Rider</div>
                            <div className="fw-semibold" style={{ color: colors.darkText }}>
                              {order.rider ? `${order.rider.name} (ID: ${order.rider.id})` : 'N/A'}
                            </div>
                          </Col>
                        </Row>
                        
                        <div className="mb-2">
                          <strong style={{ color: colors.darkText }}>Items:</strong> 
                          <span className="ms-2" style={{ color: colors.placeholderText }}>
                            {order.items.map(i => i.title).join(', ')}
                          </span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong style={{ color: colors.darkText }}>Total:</strong> 
                            <span style={{ color: colors.primary, marginLeft: '5px' }}>
                              KSh {order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </CartContainer>
      
      {/* Audio Call Modal */}
      <Modal show={showCallModal} onHide={endCall} centered>
        <Modal.Header closeButton style={{ backgroundColor: colors.cardBackground }}>
          <Modal.Title style={{ color: colors.darkText }}>
            <Telephone className="me-2" />
            Calling {callRecipient === 'chef' ? 'Chef' : 'Rider'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center" style={{ backgroundColor: colors.cardBackground }}>
          <h5 style={{ color: colors.darkText }}>Order #{currentOrder?.id.slice(0, 8)}</h5>
          <p style={{ color: colors.placeholderText }}>
            Calling {callRecipient === 'chef' 
              ? currentOrder?.chef?.name || 'Chef'
              : currentOrder?.rider?.name || 'Rider'}
          </p>
          
          <div className="my-4">
            {callStatus === 'calling' && (
              <div style={{ color: colors.primary }}>Ringing...</div>
            )}
            {callStatus === 'connected' && (
              <div style={{ color: colors.secondary }}>Connected</div>
            )}
          </div>
          
          {/* Hidden audio elements */}
          <audio ref={localAudioRef} muted autoPlay />
          <audio ref={remoteAudioRef} autoPlay />
        </Modal.Body>
        <Modal.Footer className="justify-content-center" style={{ backgroundColor: colors.cardBackground }}>
          <CallControls>
            <Button 
              variant={callStatus === 'connected' ? 'danger' : 'secondary'} 
              size="lg" 
              className="rounded-circle p-3"
              onClick={endCall}
              style={{ 
                backgroundColor: callStatus === 'connected' ? colors.errorText : colors.placeholderText,
                border: 'none'
              }}
            >
              <Telephone size={24} />
            </Button>
          </CallControls>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export { CartSidebar, PreOrderModal };