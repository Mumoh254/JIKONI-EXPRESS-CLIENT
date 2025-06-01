import React, { useState, useEffect, useRef } from "react";
import {
  Offcanvas, Badge, Tabs, Tab, ListGroup, Stack, Button,
  Modal, ProgressBar, Row, Col
} from 'react-bootstrap';
import {
  CartPlus, Plus, Dash, Trash, Person, Scooter, Telephone, CheckCircle
} from 'react-bootstrap-icons';
import styled from 'styled-components';

const CartContainer = styled(Offcanvas)`
  width: 380px !important;
  box-shadow: -4px 0 20px rgba(0,0,0,0.05);
  background: #f8f9fa;
`;

const CartItem = styled(ListGroup.Item)`
  transition: all 0.2s ease;
  background: transparent !important;
  border-bottom: 1px solid #eee !important;
  
  &:hover {
    transform: translateX(4px);
    background: white !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
`;

const FoodImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const FixedFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  border-radius: 12px 12px 0 0;
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
`;

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
      <CartContainer show={show} onHide={onClose} placement="end">
        <Offcanvas.Header closeButton className="border-bottom bg-white">
          <Offcanvas.Title className="d-flex align-items-center gap-2">
            <CartPlus fontSize={24} className="text-primary" />
            <span className="fw-bold">Your Food Cart</span>
            <Badge bg="secondary" pill>{cart.length}</Badge>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-0">
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
                  <div className="text-center text-muted py-4">
                    Your cart is empty. Start adding delicious items!
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {cart.map(item => (
                      <CartItem key={item.id} className="py-3 px-4">
                        <Stack direction="horizontal" gap={3} className="align-items-start">
                          <FoodImage 
                            src={item.photoUrls?.[0] || '/placeholder-food.jpg'}
                            alt={item.title}
                            className="mt-1"
                          />
                          
                          <Stack className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold mb-2 ms-3">{item.title}</h6>
                            
                            {item.isPreOrder && (
                              <div className="ms-3 mb-2">
                                <Badge bg="info" className="me-2">Pre-Order</Badge>
                                <small className="text-muted">{item.preOrderDate} at {item.preOrderTime}</small>
                              </div>
                            )}
                            
                            <Stack direction="horizontal" gap={2} className="align-items-center ms-3">
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="d-flex align-items-center justify-content-center p-1"
                                style={{ width: '32px' }}
                                onClick={() => updateCart(item, -1)}
                                disabled={item.quantity === 1}
                              >
                                <Dash />
                              </Button>
                              <span className="text-primary fw-bold">{item.quantity}</span>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                className="d-flex align-items-center justify-content-center p-1"
                                style={{ width: '32px' }}
                                onClick={() => updateCart(item, 1)}
                              >
                                <Plus />
                              </Button>
                            </Stack>
                          </Stack>

                          <Stack className="align-items-end">
                            <div className="text-end mb-2">
                              <span className="fw-semibold text-dark">KSh {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <Button 
                              size="sm"
                              className="d-flex align-items-center border-0 bgred gap-1"
                              onClick={() => updateCart(item, -item.quantity)}
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
                    <span className="text-muted">Subtotal:</span>
                    <span className="fw-semibold">KSh {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top">
                    <span className="fw-bold">Total:</span>
                    <span className="fw-bold text-primary">KSh {subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-100 fw-bold py-3 bgred border-0"
                  onClick={onCheckout}
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout →
                </Button>
              </FixedFooter>
            </Tab>
            
            <Tab eventKey="active" title="Active Orders">
              <div className="p-3">
              {(activeOrders?.length ?? 0) === 0 ? (
  <div className="text-center text-muted py-4">
  
                    You have no active orders
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {activeOrders.map(order => (
                      <ListGroup.Item key={order.id} className="py-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <h6 className="mb-0 fw-bold">Order #{order.id.slice(0, 8)}</h6>
                            <small className="text-muted">
                              {new Date(order.date).toLocaleString()}
                            </small>
                          </div>
                          <OrderStatusBadge bg={getStatusVariant(order.status)}>
                            {order.status}
                          </OrderStatusBadge>
                        </div>
                        
                        <ProgressBar 
                          now={getStatusProgress(order.status)} 
                          variant={getStatusVariant(order.status)}
                          className="mb-3"
                          label={`${getStatusProgress(order.status)}%`}
                        />
                        
                        <Row className="mb-2">
                          <Col>
                            <div className="text-muted small">Chef</div>
                            <div className="fw-semibold">{order.chef?.name || 'Not assigned'}</div>
                          </Col>
                          <Col>
                            <div className="text-muted small">Rider</div>
                            <div className="fw-semibold">
                              {order.rider ? `${order.rider.name} (ID: ${order.rider.id})` : 'Not assigned'}
                            </div>
                          </Col>
                        </Row>
                        
                        <div className="mb-2">
                          <strong>Items:</strong> 
                          <span className="ms-2">{order.items.map(i => i.title).join(', ')}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <strong>Total:</strong> KSh {order.total.toFixed(2)}
                          </div>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => startCall(order, 'chef')}
                              disabled={!order.chef}
                            >
                              <Telephone className="me-1" /> Chef
                            </Button>
                            {order.rider && (
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => startCall(order, 'rider')}
                              >
                                <Scooter className="me-1" /> Rider
                              </Button>
                            )}
                            {userType === 'customer' && order.status === 'dispatched' && (
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => onConfirmDelivery(order.id)}
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
  <div className="text-center text-muted py-4">
    You haven't placed any orders yet
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {pastOrders.map(order => (
                      <ListGroup.Item key={order.id} className="py-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <h6 className="mb-0 fw-bold">Order #{order.id.slice(0, 8)}</h6>
                            <small className="text-muted">
                              {new Date(order.date).toLocaleString()}
                            </small>
                          </div>
                          <OrderStatusBadge bg={getStatusVariant(order.status)}>
                            {order.status}
                          </OrderStatusBadge>
                        </div>
                        
                        <Row className="mb-2">
                          <Col>
                            <div className="text-muted small">Chef</div>
                            <div className="fw-semibold">{order.chef?.name || 'N/A'}</div>
                          </Col>
                          <Col>
                            <div className="text-muted small">Rider</div>
                            <div className="fw-semibold">
                              {order.rider ? `${order.rider.name} (ID: ${order.rider.id})` : 'N/A'}
                            </div>
                          </Col>
                        </Row>
                        
                        <div className="mb-2">
                          <strong>Items:</strong> 
                          <span className="ms-2">{order.items.map(i => i.title).join(', ')}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Total:</strong> KSh {order.total.toFixed(2)}
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
        <Modal.Header closeButton>
          <Modal.Title>
            <Telephone className="me-2" />
            Calling {callRecipient === 'chef' ? 'Chef' : 'Rider'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h5>Order #{currentOrder?.id.slice(0, 8)}</h5>
          <p className="text-muted">
            Calling {callRecipient === 'chef' 
              ? currentOrder?.chef?.name || 'Chef'
              : currentOrder?.rider?.name || 'Rider'}
          </p>
          
          <div className="my-4">
            {callStatus === 'calling' && (
              <div className="text-warning">Ringing...</div>
            )}
            {callStatus === 'connected' && (
              <div className="text-success">Connected</div>
            )}
          </div>
          
          {/* Hidden audio elements */}
          <audio ref={localAudioRef} muted autoPlay />
          <audio ref={remoteAudioRef} autoPlay />
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <CallControls>
            <Button 
              variant={callStatus === 'connected' ? 'danger' : 'secondary'} 
              size="lg" 
              className="rounded-circle p-3"
              onClick={endCall}
            >
              <Telephone size={24} />
            </Button>
          </CallControls>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CartSidebar;