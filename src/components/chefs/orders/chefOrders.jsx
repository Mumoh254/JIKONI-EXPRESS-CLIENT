import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Badge, Button, ListGroup, ProgressBar, Modal, Spinner, Alert } from 'react-bootstrap';
import {
  Clock, CheckCircle, Person, XCircle, Fire, Truck, Phone, Printer, Calendar, Mic, MicMute, QuestionCircle, EggFried, GeoAlt, InfoCircle, Coin
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import styled, { keyframes } from 'styled-components';
import moment from 'moment'; // For date/time formatting and comparison

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  accent: '#FFC107', // Amber (for call buttons, etc.)
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  gradientStart: '#FF6F59', // Lighter red for gradient
  successGreen: '#28A745', // Specific green for success
};

// --- Helper Functions ---
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning';
    case 'accepted': return 'info';
    case 'preparing': return 'primary';
    case 'ready': return 'success';
    case 'assigned': return 'info';
    case 'picked_up': return 'success';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return <Clock className="me-1" />;
    case 'accepted': return <CheckCircle className="me-1" />;
    case 'preparing': return <Fire className="me-1" />;
    case 'ready': return <CheckCircle className="me-1" />;
    case 'assigned': return <Truck className="me-1" />;
    case 'picked_up': return <Truck className="me-1" />;
    case 'delivered': return <CheckCircle className="me-1" />;
    case 'cancelled': return <XCircle className="me-1" />;
    default: return <QuestionCircle className="me-1" />;
  }
};

const getProgress = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 10;
    case 'accepted': return 25;
    case 'preparing': return 50;
    case 'ready': return 75;
    case 'assigned': return 80;
    case 'picked_up': return 90;
    case 'delivered': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

// --- Styled Components (omitted for brevity, assume they are correct as per your previous request) ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulsate = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 69, 50, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 69, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 69, 50, 0); }
`;

const CallOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  animation: ${fadeIn} 0.3s ease-out;
`;

const CallModalContent = styled.div`
  background: ${colors.cardBackground};
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  animation: ${slideInUp} 0.4s ease-out;
`;

const CallHeader = styled.div`
  margin-bottom: 25px;

  h4 {
    color: ${colors.darkText};
    font-weight: 700;
    margin-bottom: 10px;
    font-size: 1.8rem;
  }

  .call-status-badge {
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    animation: ${props => props.$status === 'ringing' ? `${pulsate} 1.5s infinite` : 'none'};
  }
`;

const CallActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;

  .btn {
    padding: 12px 25px;
    font-size: 1.1rem;
    border-radius: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  }
`;

const DashboardContainer = styled.div`
  background-color: ${colors.lightBackground};
  min-height: 100vh;
  padding: 10px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 5px 10px;
  background-color: ${colors.cardBackground};
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .dashboard-title {
    color: ${colors.darkText};
    font-weight: 700;
    margin: 0;
    font-size: 2rem;
  }

  .filter-button {
    border-color: ${colors.borderColor};
    color: ${colors.darkText};
    &:hover {
      background-color: ${colors.primary};
      color: ${colors.cardBackground};
      border-color: ${colors.primary};
    }
  }
`;

const OrderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  padding-bottom: 50px;
`;

const OrderCard = styled(Card)`
  border: none;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const OrderCardHeader = styled(Card.Header)`
  background-color: ${colors.lightBackground};
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.borderColor};

  .status-badge {
    font-size: 0.9rem;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
  }

  .order-id {
    font-size: 1rem;
    font-weight: 600;
    color: ${colors.darkText};
    margin-left: 10px;
  }

  small {
    display: flex;
    align-items: center;
    color: ${colors.placeholderText};
  }
`;

const CardBodyStyled = styled(Card.Body)`
  padding: 10px;
`;

const PreorderAlert = styled(Alert)`
  border-radius: 10px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: ${colors.accent}1A; /* Light amber background */
  border-color: ${colors.accent};
  color: ${colors.darkText};

  strong {
    color: ${colors.darkText};
  }
`;

const InfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed ${colors.borderColor};

  .section-title {
    color: ${colors.darkText};
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 8px;
  }

  .info-text {
    font-weight: 600;
    color: ${colors.darkText};
    margin-bottom: 0px;
  }

  small {
    color: ${colors.placeholderText};
  }

  .total-price {
    font-size: 1.4rem;
    font-weight: 700;
    color: ${colors.primary};
  }
`;

const ItemSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed ${colors.borderColor};

  .section-title {
    color: ${colors.darkText};
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 10px;
  }

  .item-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    background-color: transparent !important;
    border: none !important;
    font-size: 0.95rem;
    color: ${colors.darkText};
  }
`;

const RiderSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed ${colors.borderColor};

  .section-title {
    color: ${colors.darkText};
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 10px;
  }

  .rider-avatar {
    width: 40px;
    height: 40px;
    background-color: ${colors.primary}20; /* Light primary background */
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .info-text {
    font-weight: 600;
    color: ${colors.darkText};
    margin-bottom: 0px;
  }

  small {
    color: ${colors.placeholderText};
  }
`;

const ProgressSection = styled.div`
  margin-bottom: 25px;

  .section-title {
    color: ${colors.darkText};
    font-weight: 800;
    font-size: 1.5rem;
    margin-bottom: 15px;
  }

  .order-progress-bar {
    height: 12px;
    border-radius: 5px;
    background-color: ${colors.borderColor};
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: ${colors.placeholderText};
    margin-top: 5px;
    font-weight: 700;
   
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px dashed ${colors.borderColor};

  .action-button, .detail-button {
    font-size: 0.95rem;
    padding: 8px 15px;
    border-radius: 8px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .action-button.btn-primary {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
    &:hover {
      background-color: ${colors.buttonHover};
      border-color: ${colors.buttonHover};
    }
  }

  .action-button.btn-success {
    background-color: ${colors.secondary};
    border-color: ${colors.secondary};
    &:hover {
      background-color: ${colors.successGreen};
      border-color: ${colors.successGreen};
    }
  }

  .action-button.btn-warning {
    background-color: ${colors.accent};
    border-color: ${colors.accent};
    color: ${colors.darkText};
    &:hover {
      background-color: ${colors.accent}; // Keep same for hover
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 20px;
  background-color: ${colors.cardBackground};
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 30px;

  .empty-state-icon {
    font-size: 60px;
    color: ${colors.placeholderText};
    margin-bottom: 20px;
  }

  .empty-state-title {
    color: ${colors.darkText};
    font-weight: 700;
    margin-bottom: 10px;
  }

  .empty-state-text {
    color: ${colors.placeholderText};
    font-size: 1.1rem;
  }
`;

// --- Modal Specific Styles ---
const StyledModalHeader = styled(Modal.Header)`
  background-color: ${colors.lightBackground};
  border-bottom: 1px solid ${colors.borderColor};
  padding: 20px 30px;
  .modal-title {
    color: ${colors.darkText};
    font-weight: 700;
    font-size: 1.75rem;
  }
  .btn-close {
    font-size: 1.2rem;
  }
`;

const StyledModalBody = styled(Modal.Body)`
  background-color: ${colors.cardBackground};
  padding: 30px;
`;

const ModalSection = styled.div`
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px; /* Spacing between sections */

  &:last-child {
    margin-bottom: 0;
  }

  h5 {
    color: ${colors.darkText};
    font-weight: 700;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    &:last-child { margin-bottom: 0; }
  }

  .info-label {
    color: ${colors.placeholderText};
    font-size: 0.9rem;
    margin-bottom: 5px;
    display: block;
  }

  .info-value {
    font-weight: 600;
    color: ${colors.darkText};
    font-size: 1rem;
  }
`;

const FoodItemDetails = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 15px;

  img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 10px;
    margin-right: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .food-content {
    flex-grow: 1;
  }

  h6 {
    font-weight: 700;
    color: ${colors.darkText};
    font-size: 1.15rem;
    margin-bottom: 8px;
  }

  .food-description {
    color: ${colors.placeholderText};
    font-size: 0.9rem;
    margin-bottom: 15px;
    line-height: 1.4;
  }
`;

const CallModalButton = styled(Button)`
    background-color: ${props => props.$variant === 'accent' ? colors.accent : colors.primary};
    border-color: ${props => props.$variant === 'accent' ? colors.accent : colors.primary};
    color: ${props => props.$variant === 'accent' ? colors.darkText : colors.cardBackground};
    &:hover {
      background-color: ${props => props.$variant === 'accent' ? colors.accent : colors.buttonHover};
      border-color: ${props => props.$variant === 'accent' ? colors.accent : colors.buttonHover};
      box-shadow: ${props => props.$variant === 'accent' ? '0 4px 10px rgba(255, 193, 7, 0.2)' : '0 4px 10px rgba(255, 69, 50, 0.2)'};
    }
`;

const ModalProgressBar = styled(ProgressBar)`
  height: 12px;
  border-radius: 6px;
  .progress-bar {
    background-color: ${colors.secondary};
  }
`;

// --- OrderDetailModal Component ---
const OrderDetailModal = ({ show, onHide, order, onUpdateOrderStatus, onCallUser, onCallRider }) => {
  if (!order) return null;

  const isPreorder = order.deliveryDate ? moment(order.deliveryDate).isAfter(moment()) : false;

  // Derived disabled states based on the specific status transitions and preorder status
  const isAcceptActionDisabled = order.status.toLowerCase() !== 'pending' || isPreorder;
  const isPreparingOrReadyActionDisabled = (order.status.toLowerCase() !== 'accepted' && order.status.toLowerCase() !== 'preparing') || isPreorder;
  const isRequestRiderDisabled = order.status.toLowerCase() !== 'ready' || isPreorder;
  const isPickedUpActionDisabled = (order.status.toLowerCase() !== 'assigned' && order.status.toLowerCase() !== 'ready') || isPreorder;
  const isDeliveredActionDisabled = order.status.toLowerCase() !== 'picked_up' || isPreorder;

  const showCallButtons = order.user?.phoneNumber || order.rider?.phone;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <StyledModalHeader closeButton>
        <Modal.Title>Order Details: #{order.id}</Modal.Title>
      </StyledModalHeader>
      <StyledModalBody>
        {isPreorder && (
          <PreorderAlert variant="warning" className="mb-4">
            <Calendar size={24} />
            This is a **pre-order** scheduled for delivery on **{moment(order.deliveryDate).format('MMMM Do, hh:mm A')}**. Actions are disabled until the delivery date.
          </PreorderAlert>
        )}

        <ModalSection>
          <h5><InfoCircle size={20} /> Order Summary</h5>
          <div className="info-row">
            <div>
              <span className="info-label">Customer</span>
              <p className="info-value"><Person className="me-1" />{order.user?.Name || 'N/A'}</p>
            </div>
            <div>
              <span className="info-label">Order Date</span>
              <p className="info-value"><Calendar className="me-1" />{moment(order.createdAt).format('MMMM Do, h:mm A')}</p>
            </div>
          </div>
          <div className="info-row">
            <div>
              <span className="info-label">Delivery Address</span>
              <p className="info-value"><GeoAlt className="me-1" />{order.deliveryAddress || 'N/A'}</p>
            </div>
            <div>
              <span className="info-label">Total Amount</span>
              <p className="info-value"><Coin className="me-1" />KES {order.totalPrice?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="info-row">
            <div>
              <span className="info-label">Current Status</span>
              <Badge bg={getStatusColor(order.status)} className="status-badge">
                {getStatusIcon(order.status)} {order.status}
              </Badge>
            </div>
          </div>
        </ModalSection>

        <ModalSection>
          <h5><EggFried size={20} /> Items Ordered</h5>
          <ListGroup variant="flush">
            {order.items?.map((item, index) => (
              <ListGroup.Item key={index} className="item-list-item">
                <div>
                  <span className="fw-bold">{item.quantity}x {item.name}</span>
                  {item.notes && <small className="text-muted d-block">{item.notes}</small>}
                </div>
                <span>KES {(item.price * item.quantity).toFixed(2)}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
          {order.foodItem?.image && order.foodItem?.description && (
            <FoodItemDetails>
              <img src={order.foodItem.image} alt={order.foodItem.name} />
              <div className="food-content">
                <h6>{order.foodItem.name}</h6>
                <p className="food-description">{order.foodItem.description}</p>
              </div>
            </FoodItemDetails>
          )}
        </ModalSection>

        {order.rider && (
          <ModalSection>
            <h5><Truck size={20} /> Assigned Rider</h5>
            <div className="d-flex align-items-center mb-2">
              <div className="rider-avatar">
                <Person size={20} color={colors.primary} />
              </div>
              <div>
                <p className="info-value mb-0">{order.rider.Name}</p>
                <small>{order.rider.phone}</small>
              </div>
            </div>
            {onCallRider && (
              <Button variant="outline-primary" size="sm" onClick={() => onCallRider(order.rider.id, order.rider.Name)} className="mt-2">
                <Phone className="me-1" /> Call Rider
              </Button>
            )}
          </ModalSection>
        )}

        <ModalSection>
          <h5><ProgressBar className="me-1" /> Order Progress</h5>
          <ModalProgressBar now={getProgress(order.status)} variant={getStatusColor(order.status)} />
          <div className="progress-labels mt-2">
            <span>Pending</span>
            <span>Accepted</span>
            <span>Preparing</span>
            <span>Ready</span>
            
            <span>Picked Up</span>
            <span>Delivered</span>
            <span>Cancelled</span>
          </div>
        </ModalSection>

        <div className="d-flex justify-content-around mt-4 flex-wrap gap-2">
          {/* Accept Order Button */}
          {order.status.toLowerCase() === 'pending' && (
            <Button
              variant="success"
              className="action-button"
              onClick={() => onUpdateOrderStatus(order.id, 'ACCEPTED')}
              disabled={isAcceptActionDisabled}
            >
              <CheckCircle /> Accept Order
            </Button>
          )}

          {/* Mark as Preparing / Mark as Ready Button */}
          {(order.status.toLowerCase() === 'accepted' || order.status.toLowerCase() === 'preparing') && (
            <Button
              variant="primary"
              className="action-button"
              onClick={() => {
                let nextStatus;
                if (order.status.toLowerCase() === 'accepted') {
                  nextStatus = 'PREPARING';
                } else if (order.status.toLowerCase() === 'preparing') {
                  nextStatus = 'READY';
                }
                onUpdateOrderStatus(order.id, nextStatus);
              }}
              disabled={isPreparingOrReadyActionDisabled}
            >
              {order.status.toLowerCase() === 'accepted' ? <Fire /> : <EggFried />}
              {order.status.toLowerCase() === 'accepted' ? 'Mark as PREPARING' : 'Mark as READY'}
            </Button>
          )}

          {/* Request Rider Button */}
          {order.status.toLowerCase() === 'ready' && !order.rider && (
            <Button
              variant="warning"
              className="action-button"
              onClick={() => console.log('Request Rider logic for:', order.id)}
              disabled={isRequestRiderDisabled}
            >
              <Truck /> Connecting to Rider
            </Button>
          )}

          {/* Mark as Picked Up Button */}
          {order.rider && (order.status.toLowerCase() === 'assigned' || order.status.toLowerCase() === 'ready') && (
            <Button
              variant="info"
              className="action-button"
              onClick={() => onUpdateOrderStatus(order.id, 'ON_THE_WAY')}
              disabled={isPickedUpActionDisabled}
            >
              <Truck /> Mark as Picked Up
            </Button>
          )}

          {/* Mark as Delivered Button */}
          {order.rider && order.status.toLowerCase() === 'picked_up' && (
            <Button
              variant="success"
              className="action-button"
              onClick={() => onUpdateOrderStatus(order.id, 'DELIVERED')}
              disabled={isDeliveredActionDisabled}
            >
              <CheckCircle /> Mark as Delivered
            </Button>
          )}

          {/* Call Customer Button */}
          {showCallButtons && order.user?.phoneNumber && (
            <Button
              variant="outline-secondary"
              className="action-button"
              onClick={() => onCallUser(order.user.id, order.user.Name)}
            >
              <Phone /> Call Customer
            </Button>
          )}
          <Button variant="outline-dark" className="action-button" onClick={() => window.print()}>
            <Printer /> Print Receipt
          </Button>
        </div>
      </StyledModalBody>
    </Modal>
  );
};


// --- ChefOrders Component ---
const ChefOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true); // Start loading true
  const [chefId, setChefId] = useState(null); // Initialize as null
  const socketRef = useRef(null); // Use useRef to store the socket instance
  const peerRef = useRef(null); // Use useRef for PeerJS instance
  const localStreamRef = useRef(null); // Use useRef for local media stream
  const remoteAudioRef = useRef(null); // Ref for audio element to play remote stream

  // WebRTC state
  const [callActive, setCallActive] = useState(false);
  const [callingTo, setCallingTo] = useState(null);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);

  // Notification sound
  const notificationSoundRef = useRef(null);
  useEffect(() => {
    notificationSoundRef.current = new Audio('/audio/cliks.mp3');
  }, []);

  const playNotificationSound = useCallback(() => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, []);

  // Effect to load chefId from localStorage once on component mount
  useEffect(() => {
    const storedChefId = localStorage.getItem("chefId");
    if (storedChefId) {
      setChefId(parseInt(storedChefId, 10));
    } else {
      console.warn("No chefId found in localStorage. Redirecting to login or showing error.");
      // Potentially redirect to login: navigate('/login');
      setLoading(false); // Stop loading if no chefId is found
    }

    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []); // Empty dependency array means this runs once on mount

  // Memoize fetchOrders to avoid unnecessary re-creations
  const fetchOrders = useCallback(async () => {
    if (!chefId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Use your actual backend API endpoint for fetching orders
      // Make sure this endpoint filters orders by chefId if necessary, or your backend handles authorization
      const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/orders`);

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
    }
  }, [chefId]); // Depend on chefId

  // Effect to fetch orders when chefId becomes available
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Dependency on fetchOrders memoized function

  // --- Socket.IO Connection and Event Handling ---
  useEffect(() => {
    if (!chefId) return; // Don't connect if chefId is not yet available

    // Initialize socket only once
    if (!socketRef.current) {
      console.log('Initializing new socket connection...');
      socketRef.current = io('https://neuro-apps-api-express-js-production-redy.onrender.com', {
        path: '/apiV1/smartcity-ke/socket.io', // Ensure this matches your server
        query: { userId: chefId, userType: 'chef' },
        transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
        reconnectionAttempts: 5, // Attempt to reconnect 5 times
        reconnectionDelay: 1000, // Wait 1 second before first reconnect attempt
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket.io as chef:', chefId);
        socketRef.current.emit('chef:join', chefId);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
      });
    }

    const currentSocket = socketRef.current; // Use the ref for listeners

    // --- Order related events ---
    const handleNewOrder = (newOrder) => {
      console.log('Received new order via socket:', newOrder);
      if (newOrder.chefId === chefId) {
        setOrders(prev => [newOrder, ...prev]);
        playNotificationSound();
        if (Notification.permission === 'granted') {
          new Notification('New Order Received!', {
            body: `Order #${newOrder.id} from ${newOrder.user?.Name || 'a customer'} has been placed.`,
            icon: '/images/logo.png',
            vibrate: [200, 100, 200],
          });
        }
      }
    };

    const handleOrderUpdate = (updatedOrder) => {
      console.log('Received order update via socket:', updatedOrder);
      setOrders(prev => prev.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      ));
      if (orderDetails && orderDetails.id === updatedOrder.id) {
        setOrderDetails(updatedOrder); // Update modal details immediately
      }
    };

    const handleRiderAssigned = ({ orderId, rider }) => {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, rider, status: 'ASSIGNED' } : order // Status to uppercase
      ));
      // Update orderDetails if the modal for this order is open
      if (orderDetails && orderDetails.id === orderId) {
        setOrderDetails(prev => ({ ...prev, rider, status: 'ASSIGNED' }));
      }

      playNotificationSound();
      if (Notification.permission === 'granted') {
        new Notification('Rider Assigned!', {
          body: `Rider ${rider.Name} assigned to order #${orderId}.`,
          icon: '/jikoni-logo.png',
          vibrate: [200, 100, 200],
        });
      }
    };

    const handleOrderDelivered = (deliveredOrder) => {
      setOrders(prev => prev.map(order =>
        order.id === deliveredOrder.id ? deliveredOrder : order
      ));
      if (orderDetails && orderDetails.id === deliveredOrder.id) {
        setOrderDetails(deliveredOrder);
      }
      playNotificationSound();
      if (Notification.permission === 'granted') {
        new Notification('Order Delivered!', {
          body: `Order #${deliveredOrder.id} has been delivered.`,
          icon: '/jikoni-logo.png',
          vibrate: [200, 100, 200],
        });
      }
    };

    const handleOrderDeleted = ({ orderId }) => {
      setOrders(prev => prev.filter(order => order.id !== orderId));
      if (orderDetails && orderDetails.id === orderId) {
        setShowDetails(false); // Close modal if the deleted order was open
        setOrderDetails(null);
      }
    };

    currentSocket.on('order:new', handleNewOrder);
    currentSocket.on('order:updated', handleOrderUpdate);
    currentSocket.on('rider:assigned', handleRiderAssigned);
    currentSocket.on('order:delivered', handleOrderDelivered);
    currentSocket.on('order:deleted', handleOrderDeleted);

    // --- WebRTC Signaling (Chef Recipient & Initiator) ---
    const handleIncomingCall = async ({ from, signalData, type }) => {
      console.log('Incoming call from:', from, 'Type:', type);
      if (callActive && callStatus !== 'idle') {
        currentSocket.emit('call:busy', { to: from, from: chefId });
        return;
      }
      setRemoteUserId(from);
      setCallingTo(type === 'rider' ? 'Rider' : 'Customer');
      setCallStatus('ringing');
      setCallActive(true);
      playNotificationSound(); // Ringing sound

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;

        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream
        });

        peer.on('signal', (data) => {
          currentSocket.emit('call:accept', { to: from, from: chefId, signalData: data, type: 'chef' });
          console.log(`Emitted call:accept to ${from}`);
        });

        peer.on('stream', (remoteStream) => {
          console.log('Received remote stream:', remoteStream);
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(e => console.error("Audio playback error:", e));
          }
        });

        peer.on('connect', () => {
          console.log('WebRTC connected!');
          setCallStatus('connected');
        });

        peer.on('close', () => {
          console.log('WebRTC connection closed by remote peer or automatically.');
          endCall();
        });

        peer.on('error', (err) => {
          console.error('WebRTC error during incoming call:', err);
          alert('WebRTC error during incoming call: ' + err.message);
          endCall();
        });

        peer.signal(signalData);
        peerRef.current = peer;
      } catch (err) {
        console.error('Error handling incoming call:', err);
        alert('Could not handle incoming call. Please check microphone permissions and try again.');
        endCall();
      }
    };

    const handleCallAccepted = ({ from, signalData, type }) => {
      console.log('Call accepted by remote peer:', from, 'Type:', type);
      if (peerRef.current && peerRef.current.initiator && remoteUserId === from) {
        peerRef.current.signal(signalData);
        setCallStatus('connected');
      } else {
        console.warn('Received call:accepted for an unknown or non-initiator call.');
      }
    };

    const handleCallSignal = (signalData) => {
      if (peerRef.current) {
        peerRef.current.signal(signalData);
      }
    };

    const handleCallEnded = ({ from }) => {
      console.log(`Call with ${from} ended.`);
      if (remoteUserId === from) {
        endCall();
      }
    };

    const handleCallBusy = ({ from }) => {
      console.log(`Call to ${from} is busy.`);
      alert(`${callingTo} is busy. Please try again later.`);
      endCall();
    };

    currentSocket.on('call:incoming', handleIncomingCall);
    currentSocket.on('call:accepted', handleCallAccepted);
    currentSocket.on('call:signal', handleCallSignal); // For exchanging ICE candidates
    currentSocket.on('call:ended', handleCallEnded);
    currentSocket.on('call:busy', handleCallBusy);

    return () => {
      console.log('Cleaning up socket listeners and PeerJS...');
      currentSocket.off('order:new', handleNewOrder);
      currentSocket.off('order:updated', handleOrderUpdate);
      currentSocket.off('rider:assigned', handleRiderAssigned);
      currentSocket.off('order:delivered', handleOrderDelivered);
      currentSocket.off('order:deleted', handleOrderDeleted);
      currentSocket.off('call:incoming', handleIncomingCall);
      currentSocket.off('call:accepted', handleCallAccepted);
      currentSocket.off('call:signal', handleCallSignal);
      currentSocket.off('call:ended', handleCallEnded);
      currentSocket.off('call:busy', handleCallBusy);
      // We don't disconnect the socket here to allow for re-renders without full disconnections,
      // but ensure listeners are not duplicated.
      // If the component unmounts completely, you might want to disconnect.
      // currentSocket.disconnect();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [chefId, callActive, remoteUserId, callStatus, callingTo, playNotificationSound, orderDetails]);


  const handleShowDetails = (order) => {
    setOrderDetails(order);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setOrderDetails(null);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Simulate API call and update via socket
      // In a real app, you'd send this to your backend, and the backend would emit the update via socket
      const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      console.log('Order status updated via API:', updatedOrder);

      // The socket.io listener `handleOrderUpdate` will automatically update the UI
      // no need to manually refresh here due to socket integration.
      // We explicitly emit the update to ensure other connected clients also see it
      // if the backend doesn't already re-emit on status change.
      if (socketRef.current) {
        socketRef.current.emit('order:updateStatus', updatedOrder);
      }

      // If the modal is open for this order, update its details
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (orderDetails && orderDetails.id === orderId) {
        setOrderDetails(prevDetails => ({ ...prevDetails, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const startCall = useCallback(async (targetId, targetName, targetType) => {
    if (callActive) {
      alert('A call is already active. Please end the current call first.');
      return;
    }
    setRemoteUserId(targetId);
    setCallingTo(targetName);
    setCallStatus('calling');
    setCallActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const peer = new Peer({
        initiator: true,
        trickle: false, // Set to true for ICE candidate exchange
        stream: stream
      });

      peer.on('signal', (data) => {
        // Send signal data to the other peer via Socket.IO
        socketRef.current.emit('call:initiate', { to: targetId, from: chefId, signalData: data, type: 'chef' });
        console.log(`Emitted call:initiate to ${targetId}`);
      });

      peer.on('stream', (remoteStream) => {
        // When remote stream is received, play it
        console.log('Received remote stream:', remoteStream);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(e => console.error("Audio playback error:", e));
        }
      });

      peer.on('connect', () => {
        console.log('WebRTC connected!');
        setCallStatus('connected');
      });

      peer.on('close', () => {
        console.log('WebRTC connection closed.');
        endCall();
      });

      peer.on('error', (err) => {
        console.error('WebRTC error during outgoing call:', err);
        alert('WebRTC error during outgoing call: ' + err.message);
        endCall();
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      alert('Could not start call. Please check microphone permissions and try again.');
      endCall();
    }
  }, [chefId, callActive]);

  const endCall = useCallback(() => {
    console.log('Ending call...');
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    if (socketRef.current && remoteUserId) {
      socketRef.current.emit('call:end', { to: remoteUserId, from: chefId });
    }
    setCallActive(false);
    setCallingTo(null);
    setRemoteUserId(null);
    setCallStatus('ended'); // Or 'idle'
    setIsMuted(false);
  }, [chefId, remoteUserId]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const handleAcceptCall = () => {
    setCallStatus('connected');
    // The peer object should already be initialized in handleIncomingCall
    // No explicit action needed here beyond setting status, as signal was already sent
  };

  const handleRejectCall = () => {
    if (socketRef.current && remoteUserId) {
      socketRef.current.emit('call:reject', { to: remoteUserId, from: chefId });
    }
    endCall();
  };

  // Filter orders for display (e.g., exclude delivered/cancelled if desired)
  const displayOrders = orders.filter(order =>
    order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled'
  );

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h2 className="dashboard-title">Chef Dashboard</h2>
        <Button variant="outline-secondary" className="filter-button">
          Filter Orders
        </Button>
      </DashboardHeader>

      {loading ? (
        <div className="text-center py-1">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading Orders...</span>
          </Spinner>
          <p className="mt-3">Loading orders, please wait...</p>
        </div>
      ) : displayOrders.length === 0 ? (
        <EmptyState>
          <QuestionCircle className="empty-state-icon" />
          <h4 className="empty-state-title">No Active Orders</h4>
          <p className="empty-state-text">It looks like there are no new or ongoing orders at the moment. You'll see them here when they come in!</p>
        </EmptyState>
      ) : (
        <OrderGrid>
          {displayOrders.map(order => (
            <OrderCard key={order.id}>
              <OrderCardHeader>
                <div>
                  <Badge bg={getStatusColor(order.status)} className="status-badge">
                    {getStatusIcon(order.status)} {order.status}
                  </Badge>
                  <span className="order-id">#{order.id}</span>
                </div>
                <small><Clock className="m-3" />{moment(order.createdAt).fromNow()}</small>
              </OrderCardHeader>
              <CardBodyStyled>
                <InfoSection>
                  <div>
                    <p className="section-title">Customer</p>
                    <p className="info-text">{order.user?.Name || 'N/A'}</p>
                    <small>{order.user?.phoneNumber || 'N/A'}</small>
                  </div>
                  <div>
                    <p className="section-title text-end">Total</p>
                    <p className="total-price text-end">KES {order.totalPrice?.toFixed(2) || '0.00'}</p>
                  </div>
                </InfoSection>

            <ItemSection>
                  <p className="section-title">Items</p>
                  <ListGroup variant="flush">
                    {order.items?.slice(0, 2).map((item, index) => (
                      <ListGroup.Item key={index} className="item-list-item">
                        <span>{item.quantity}x {item.name}</span>
                        <span>KES {(item.price * item.quantity).toFixed(2)}</span>
                      </ListGroup.Item>
                    ))}
                    {order.items && order.items.length > 2 && ( // Changed here
                      <ListGroup.Item className="item-list-item text-muted">
                        <span>...and {order.items.length - 2} more items</span>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </ItemSection>

                {order.rider && (
                  <RiderSection>
                    <p className="section-title">Rider</p>
                    <div className="d-flex align-items-center">
                      <div className="rider-avatar">
                        <Person size={20} color={colors.primary} />
                      </div>
                      <div>
                        <p className="info-text mb-0">{order.rider.Name}</p>
                        <small>{order.rider.phone}</small>
                      </div>
                    </div>
                  </RiderSection>
                )}

                <ProgressSection>
                  <p className="section-title">Progress</p>
                  <ProgressBar now={getProgress(order.status)} variant={getStatusColor(order.status)} className="order-progress-bar" />
                  <div className="progress-labels">
                    <span>{order.status}</span>
                  </div>
                </ProgressSection>

                <ActionButtons>
                  {order.status.toLowerCase() === 'pending' && (
                    <Button variant="success" className="action-button" onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}>
                      <CheckCircle /> Accept
                    </Button>
                  )}
                  {(order.status.toLowerCase() === 'accepted' || order.status.toLowerCase() === 'preparing') && (
                    <Button variant="primary" className="action-button" onClick={() => updateOrderStatus(order.id, order.status.toLowerCase() === 'accepted' ? 'PREPARING' : 'READY')}>
                      {order.status.toLowerCase() === 'accepted' ? <Fire /> : <EggFried />} {order.status.toLowerCase() === 'accepted' ? 'Preparing' : 'Ready'}
                    </Button>
                  )}
                  {order.status.toLowerCase() === 'on_the_way' && !order.rider && (
                    <Button variant="warning" className="action-button" onClick={() => console.log('Request Rider for:', order.id)}>
                      <Truck /> Connecting Rider
                    </Button>
                  )}
                  {order.rider && (order.status.toLowerCase() === 'assigned' || order.status.toLowerCase() === 'ready') && (
                    <Button variant="info" className="action-button" onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}>
                      <Truck /> Picked Up
                    </Button>
                  )}
                  {order.rider && order.status.toLowerCase() === 'picked_up' && (
                    <Button variant="success" className="action-button" onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
                      <CheckCircle /> Delivered
                    </Button>
                  )}

                  <Button variant="outline-dark" className="detail-button" onClick={() => handleShowDetails(order)}>
                    View Details
                  </Button>
                </ActionButtons>
              </CardBodyStyled>
            </OrderCard>
          ))}
        </OrderGrid>
      )}

      <OrderDetailModal
        show={showDetails}
        onHide={handleCloseDetails}
        order={orderDetails}
        onUpdateOrderStatus={updateOrderStatus}
        onCallUser={(userId, userName) => startCall(userId, userName, 'customer')}
        onCallRider={(riderId, riderName) => startCall(riderId, riderName, 'rider')}
      />

      {/* Call Modal */}
      {callActive && (
        <CallOverlay>
          <CallModalContent>
            <CallHeader $status={callStatus}>
              <h4>{callStatus === 'ringing' ? 'Incoming Call' : `Call ${callingTo}`}</h4>
              <Badge bg={getStatusColor(callStatus === 'connected' ? 'success' : callStatus === 'ringing' ? 'warning' : 'primary')} className="call-status-badge">
                {callStatus === 'ringing' && <Phone />}
                {callStatus === 'calling' && <Spinner animation="grow" size="sm" className="me-1" />}
                {callStatus === 'connected' && <CheckCircle />}
                {callStatus.toUpperCase()}
              </Badge>
              {callStatus === 'connected' && (
                <p className="mt-2 text-muted">Speaking with {callingTo}</p>
              )}
            </CallHeader>
            <CallActions>
              {callStatus === 'ringing' && (
                <>
                  <Button variant="success" onClick={handleAcceptCall}>
                    <Phone /> Accept
                  </Button>
                  <Button variant="danger" onClick={handleRejectCall}>
                    <XCircle /> Reject
                  </Button>
                </>
              )}
              {callStatus === 'calling' && (
                <Button variant="danger" onClick={endCall}>
                  <XCircle /> Cancel Call
                </Button>
              )}
              {callStatus === 'connected' && (
                <>
                  <Button variant="secondary" onClick={toggleMute}>
                    {isMuted ? <MicMute /> : <Mic />} {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  <Button variant="danger" onClick={endCall}>
                    <XCircle /> End Call
                  </Button>
                </>
              )}
            </CallActions>
            <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
          </CallModalContent>
        </CallOverlay>
      )}
    </DashboardContainer>
  );
};

export default ChefOrders;