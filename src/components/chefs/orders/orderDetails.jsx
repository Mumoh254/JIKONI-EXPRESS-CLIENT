import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Badge, Button, ListGroup, ProgressBar, Modal, Spinner, Alert, Form } from 'react-bootstrap';
import {
  Clock, CheckCircle, Person, XCircle, Fire, Truck, Phone, Printer, Calendar, QuestionCircle, EggFried, GeoAlt, InfoCircle, Coin, CashStack, ChatText
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
// Assuming socket.io-client and peerjs are for a different part (e.g., calls) and not directly for order details display
// import { io } from 'socket.io-client';
// import Peer from 'peerjs';
import styled, { keyframes } from 'styled-components';
import moment from 'moment'; // For date/time formatting and comparison

// --- Jikoni Express Redesigned Color Palette for Order Details ---
const colors = {
  primary: '#B00020', // Deep, assertive red (from previous redesign)
  jikoniGreen: '#00E676', // Bright, vibrant green (used explicitly for success/accept)
  accentYellow: '#FFC107', // Amber (for warning/pre-order)
  darkBackground: '#1A1A1D', // Very dark charcoal/near black
  cardBackground: '#2C2C30', // Slightly lighter dark for card elements
  lightText: '#E0E0E0', // Light grey for primary text on dark backgrounds
  mutedText: '#888888', // Softer grey for secondary text
  borderColor: '#4A4A50', // Subtle border for definition
  errorRed: '#FF4532', // Original Jikoni Red for errors/danger
  successGreen: '#00E676', // Alias for jikoniGreen for clarity
  infoBlue: '#00D4FF', // Electric blue for info/secondary accents
  disabledState: '#4A4A50', // Darker disabled state
  lightHover: '#3A3A3F', // Subtle hover background on dark elements
};

// --- Helper Functions (Updated to use new colors) ---
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning'; // Bootstrap warning is yellow
    case 'accepted': return 'info'; // Bootstrap info is light blue, good for accepted
    case 'preparing': return 'primary'; // Bootstrap primary is blue, good for in-progress
    case 'ready': return 'success'; // Bootstrap success is green
    case 'assigned': return 'info';
    case 'picked_up': return 'success';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger'; // Bootstrap danger is red
    default: return 'secondary'; // Bootstrap secondary is grey
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
    case 'cancelled': return 0; // Or a specific 'cancelled' state visually
    default: return 0;
  }
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// --- Styled Components for Order Details Modal ---

const StyledModalHeader = styled(Modal.Header)`
  background-color: ${colors.cardBackground}; /* Dark background from header palette */
  color: ${colors.lightText};
  border-bottom: 2px solid ${colors.borderColor};
  padding: 1.8rem 2rem;
  .modal-title {
    font-weight: 800;
    font-size: 2rem;
  }
  .btn-close {
    filter: invert(1); /* Makes the close icon white */
    font-size: 1.6rem;
  }
`;

const StyledModalBody = styled(Modal.Body)`
  background-color: ${colors.darkBackground}; /* Main Jikoni green background for view details */
  padding: 5px; /* More padding for a spacious feel */
  color: ${colors.lightText}; /* Light text on dark green */
`;

const ModalSection = styled.div`
  background-color: ${colors.cardBackground}; /* Slightly lighter dark for sections */
  border: 1px solid ${colors.borderColor};
  border-radius: 12px;
  padding: 15px; /* Generous padding */
  margin-bottom: 25px; /* Spacing between sections */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */

  &:last-child {
    margin-bottom: 0;
  }

  h5 {
    color: ${colors.lightText}; /* Light heading text */
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.4rem; /* Larger section titles */
    border-bottom: 1px dashed ${colors.borderColor}; /* Dashed separator */
    padding-bottom: 15px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Align items to top for multi-line content */
    margin-bottom: 15px; /* More spacing between rows */
    flex-wrap: wrap; /* Allow wrapping on smaller screens */

    &:last-child { margin-bottom: 0; }

    > div {
      flex: 1;
      min-width: 48%; /* Ensure two columns on wider screens */
      margin-bottom: 10px; /* For wrap scenarios */
      &:nth-child(even) {
        margin-left: 2%; /* Gap between columns */
      }
      @media (max-width: 768px) {
        min-width: 100%; /* Stack on small screens */
        margin-left: 0;
      }
    }
  }

  .info-label {
    color: ${colors.mutedText}; /* Muted label text */
    font-size: 0.95rem;
    margin-bottom: 8px;
    display: block;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-weight: 600;
    color: ${colors.lightText};
    font-size: 1.1rem; /* Slightly larger value text */
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-badge {
    padding: 8px 15px;
    border-radius: 25px; /* More rounded pill shape */
    font-size: 1rem;
    font-weight: 700;
    text-transform: capitalize;
  }
`;

const ItemListGroup = styled(ListGroup)`
  .list-group-item {
    background-color: transparent !important; /* No background for items */
    border: none !important;
    border-bottom: 1px dashed ${colors.borderColor} !important; /* Dashed separator */
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${colors.lightText};
    font-size: 1.05rem;

    &:last-child {
      border-bottom: none !important;
      padding-bottom: 0;
    }

    .item-name {
      font-weight: 600;
    }
    .item-notes {
      color: ${colors.mutedText};
      font-size: 0.85rem;
      margin-top: 5px;
    }
    .item-price {
      font-weight: 700;
      color: ${colors.lightText};
    }
  }
`;

const FoodItemDetails = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed ${colors.borderColor};

  img {
    width: 150px; /* Larger image */
    height: 150px;
    object-fit: cover;
    border-radius: 12px;
    margin-right: 25px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    border: 2px solid ${colors.borderColor};
  }

  .food-content {
    flex-grow: 1;
  }

  h6 {
    font-weight: 700;
    color: ${colors.lightText};
    font-size: 1.3rem;
    margin-bottom: 10px;
  }

  .food-description {
    color: ${colors.mutedText};
    font-size: 0.95rem;
    margin-bottom: 15px;
    line-height: 1.6;
  }
`;

const ModalProgressBar = styled(ProgressBar)`
  height: 15px; /* Taller progress bar */
  border-radius: 8px;
  background-color: ${colors.borderColor};

  .progress-bar {
    background-color: ${colors.jikoniGreen}; /* Always Jikoni Green for progress */
    transition: width 0.6s ease-in-out;
  }
`;

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: ${colors.mutedText};
  margin-top: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  div {
    text-align: center;
    flex: 1;
    position: relative;
    &:not(:last-child)::after {
        content: '•';
        position: absolute;
        right: -5px;
        color: ${colors.borderColor};
    }
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: center; /* Center buttons */
  flex-wrap: wrap; /* Allow buttons to wrap */
  gap: 15px; /* Spacing between buttons */
  padding-top: 25px;
  border-top: 1px dashed ${colors.borderColor};

  .action-button {
    font-size: 1.05rem; /* Larger button text */
    padding: 12px 25px; /* More padding */
    border-radius: 10px;
    font-weight: 700; /* Bolder */
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s ease, background-color 0.3s, border-color 0.3s; /* Smooth transitions */
    min-width: 180px; /* Ensure consistent button width */
    justify-content: center;

    &:hover:not(:disabled) {
      transform: translateY(-3px); /* Lift effect */
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3); /* Deeper shadow on hover */
    }

    &:disabled {
      background-color: ${colors.disabledState} !important;
      border-color: ${colors.disabledState} !important;
      color: ${colors.mutedText} !important;
      cursor: not-allowed;
      opacity: 0.8;
      box-shadow: none;
    }

    &.btn-success {
      background-color: ${colors.jikoniGreen};
      border-color: ${colors.jikoniGreen};
      color: ${colors.darkBackground}; /* Dark text on green */
      &:hover:not(:disabled) {
        background-color: #00BF5E; /* Slightly darker green on hover */
        border-color: #00BF5E;
      }
    }
    &.btn-primary {
      background-color: ${colors.primary};
      border-color: ${colors.primary};
      color: white;
      &:hover:not(:disabled) {
        background-color: #900018; /* Darker aggressive red */
        border-color: #900018;
      }
    }
    &.btn-info { /* Used for 'Mark as Ready' and 'Mark as Picked Up' */
      background-color: ${colors.infoBlue};
      border-color: ${colors.infoBlue};
      color: ${colors.darkBackground};
      &:hover:not(:disabled) {
        background-color: #00BFF5;
        border-color: #00BFF5;
      }
    }
    &.btn-warning { /* Used for 'Request Rider' */
      background-color: ${colors.accentYellow};
      border-color: ${colors.accentYellow};
      color: ${colors.darkBackground};
      &:hover:not(:disabled) {
        background-color: #FFB300;
        border-color: #FFB300;
      }
    }
    &.btn-outline-secondary { /* Used for 'Call Customer' / 'Call Rider' */
      background-color: transparent;
      border-color: ${colors.borderColor};
      color: ${colors.lightText};
      &:hover:not(:disabled) {
        background-color: ${colors.lightHover};
        border-color: ${colors.infoBlue};
        color: ${colors.infoBlue};
      }
    }
    &.btn-danger {
      background-color: ${colors.errorRed};
      border-color: ${colors.errorRed};
      color: white;
      &:hover:not(:disabled) {
        background-color: #E03B2A;
        border-color: #E03B2A;
      }
    }
    &.btn-outline-dark { /* Used for 'Print Receipt' */
      background-color: transparent;
      border-color: ${colors.borderColor};
      color: ${colors.mutedText};
      &:hover:not(:disabled) {
        background-color: ${colors.lightHover};
        border-color: ${colors.lightText};
        color: ${colors.lightText};
      }
    }
  }
`;

const PreorderAlert = styled(Alert)`
  border-radius: 10px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px; /* More padding */
  background-color: ${colors.accentYellow}20; /* Light amber background */
  border-color: ${colors.accentYellow};
  color: ${colors.lightText}; /* Light text */
  .alert-heading {
    color: ${colors.lightText};
    font-weight: 700;
  }
`;

const CancelModalContent = styled.div`
  background: ${colors.cardBackground};
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 500px;
  animation: ${slideInUp} 0.4s ease-out;
  position: relative; /* For the close button positioning */
  color: ${colors.lightText};

  h3 {
    color: ${colors.lightText};
    font-weight: 700;
    margin-bottom: 20px;
    font-size: 1.8rem;
  }

  textarea {
    width: 100%;
    min-height: 120px;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid ${colors.borderColor};
    background-color: ${colors.darkBackground};
    color: ${colors.lightText};
    font-size: 1rem;
    resize: vertical;
    &:focus {
      outline: none;
      border-color: ${colors.errorRed};
      box-shadow: 0 0 0 0.25rem rgba(255, 69, 50, 0.25);
    }
    &::placeholder {
      color: ${colors.mutedText};
    }
  }

  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 25px;

    .btn {
      padding: 12px 25px;
      font-size: 1.05rem;
      border-radius: 10px;
      font-weight: 600;
      transition: all 0.2s ease;

      &.confirm-cancel {
        background-color: ${colors.errorRed};
        border-color: ${colors.errorRed};
        color: white;
        &:hover {
          background-color: #E03B2A;
          border-color: #E03B2A;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(255, 69, 50, 0.2);
        }
      }
      &.cancel-modal {
        background-color: ${colors.cardBackground};
        border-color: ${colors.borderColor};
        color: ${colors.lightText};
        &:hover {
          background-color: ${colors.lightHover};
          border-color: ${colors.mutedText};
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
      }
    }
  }
`;

const CloseButtonAbsolute = styled(Button)`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${colors.mutedText};
  &:hover {
    color: ${colors.lightText};
    background: none;
    transform: rotate(90deg);
  }
  &:focus {
    box-shadow: none;
  }
`;

// --- OrderDetailModal Component (Redesigned) ---
const OrderDetailModal = ({ show, onHide, order, onUpdateOrderStatus, onCallUser, onCallRider }) => {
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCalling, setIsCalling] = useState(false); // State for call overlay

  if (!order) return null;

  const isPreorder = order.deliveryDate ? moment(order.deliveryDate).isAfter(moment()) : false;

  const handleUpdateStatus = (status) => {
    // Check if onUpdateOrderStatus is a function before calling
    if (typeof onUpdateOrderStatus === 'function') {
      onUpdateOrderStatus(order.id, status);
    }
  };

  const handleOpenCancelModal = () => {
    setCancelReason(''); // Clear previous reason
    setShowCancelReasonModal(true);
  };

  const handleConfirmCancel = () => {
    if (cancelReason.trim()) {
      if (typeof onUpdateOrderStatus === 'function') {
        onUpdateOrderStatus(order.id, 'cancelled', cancelReason); // Pass reason
      }
      setShowCancelReasonModal(false);
      setCancelReason('');
    } else {
      alert('Please provide a reason for cancellation.');
    }
  };

  const handleCallUser = () => {
    if (typeof onCallUser === 'function' && order.user?.phoneNumber) {
      onCallUser(order.user.id, order.user.Name);
      // setIsCalling(true); // Assuming call function will handle this state
    }
  };

  const handleCallRider = () => {
    if (typeof onCallRider === 'function' && order.rider?.phone) {
      onCallRider(order.rider.id, order.rider.Name);
      // setIsCalling(true); // Assuming call function will handle this state
    }
  };

  // Determine button disabled states more clearly
  const canAccept = order.status === 'pending' && !isPreorder;
  const canPrepare = ['accepted', 'preparing'].includes(order.status) && !isPreorder;
  const canReady = order.status === 'preparing' && !isPreorder;
  const canRequestRider = order.status === 'ready' && !order.rider && !isPreorder;
  const canPickup = order.status === 'assigned' && order.rider && !isPreorder;
  const canDeliver = order.status === 'picked_up' && order.rider && !isPreorder;
  const canCancel = ['pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked_up'].includes(order.status) && !isPreorder; // Can cancel at almost any stage before delivered

  const isOrderFinalized = ['delivered', 'cancelled'].includes(order.status);

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <StyledModalHeader closeButton>
          <Modal.Title>Order Details: #{order.id}</Modal.Title>
        </StyledModalHeader>
        <StyledModalBody>
          {isPreorder && (
            <PreorderAlert variant="warning" className="mb-4">
              <Calendar size={24} />
              <div>
                <h5 className="alert-heading">Pre-Order Scheduled</h5>
                This order is scheduled for delivery on **{moment(order.deliveryDate).format('MMMM Do, YYYY')} at {moment(order.deliveryDate).format('h:mm A')}**. Actions are disabled until then.
              </div>
            </PreorderAlert>
          )}

          {order.cancellationReason && order.status === 'cancelled' && (
             <Alert variant="danger" className="mb-4">
                <XCircle size={24} />
                <div>
                  <h5 className="alert-heading">Order Cancelled</h5>
                  This order was cancelled. Reason: <strong>{order.cancellationReason}</strong>
                </div>
            </Alert>
          )}

          <ModalSection>
            <h5><InfoCircle size={24} /> Order Summary</h5>
            <div className="info-row">
              <div>
                <span className="info-label">Customer Name</span>
                <p className="info-value"><Person />{order.user?.Name || 'N/A'}</p>
              </div>
              <div>
                <span className="info-label">Customer Phone</span>
                <p className="info-value"><Phone />{order.user?.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="info-label">Order Date & Time</span>
                <p className="info-value"><Calendar />{moment(order.createdAt).format('MMMM Do, YYYY h:mm A')}</p>
              </div>
              <div>
                <span className="info-label">Payment Method</span>
                <p className="info-value"><CashStack />{order.paymentMethod || 'N/A'}</p>
              </div>
            </div>
            <div className="info-row">
              <div>
                <span className="info-label">Delivery Address</span>
                <p className="info-value"><GeoAlt />{order.deliveryAddress || 'N/A'}</p>
              </div>
              <div>
                <span className="info-label">Delivery Notes</span>
                <p className="info-value"><ChatText />{order.deliveryNotes || 'None'}</p>
              </div>
            </div>
            <div className="info-row">
                <div>
                  <span className="info-label">Total Amount</span>
                  <p className="info-value"><Coin />KES {order.totalPrice?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <span className="info-label">Current Status</span>
                  <Badge bg={getStatusColor(order.status)} className="status-badge">
                    {getStatusIcon(order.status)} {order.status}
                  </Badge>
                </div>
            </div>
          </ModalSection>

          <ModalSection>
            <h5><EggFried size={24} /> Items Ordered</h5>
            <ItemListGroup variant="flush">
              {order.items?.length > 0 ? (
                order.items.map((item, index) => (
                  <ListGroup.Item key={index} className="item-list-item">
                    <div>
                      <span className="item-name">{item.quantity}x {item.name}</span>
                      {item.notes && <p className="item-notes">{item.notes}</p>}
                    </div>
                    <span className="item-price">KES {(item.price * item.quantity).toFixed(2)}</span>
                  </ListGroup.Item>
                ))
              ) : (
                <p className="text-center text-muted mt-3 mb-0">No items found for this order.</p>
              )}
            </ItemListGroup>
            {/* If you have a single foodItem associated with the order, display it */}
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
              <h5><Truck size={24} /> Assigned Rider</h5>
              <div className="info-row">
                <div>
                  <span className="info-label">Rider Name</span>
                  <p className="info-value"><Person />{order.rider.Name || 'N/A'}</p>
                </div>
                <div>
                  <span className="info-label">Rider Phone</span>
                  <p className="info-value"><Phone />{order.rider.phone || 'N/A'}</p>
                </div>
              </div>
              {onCallRider && order.rider.phone && (
                <Button variant="outline-secondary" className="action-button mt-3" onClick={handleCallRider}>
                  <Phone className="me-1" /> Call Rider
                </Button>
              )}
            </ModalSection>
          )}

          <ModalSection>
            <h5><ProgressBar className="me-1" /> Order Progress</h5>
            <ModalProgressBar now={getProgress(order.status)} />
            <ProgressLabels className="mt-2">
                <div>Pending</div>
                <div>Accepted</div>
                <div>Preparing</div>
                <div>Ready</div>
                <div>Picked Up</div>
                <div>Delivered</div>
            </ProgressLabels>
          </ModalSection>

          {!isOrderFinalized && (
            <ActionButtonsContainer>
              {/* Accept Order Button */}
              <Button
                variant="success"
                className="action-button"
                onClick={() => handleUpdateStatus('accepted')}
                disabled={!canAccept}
              >
                <CheckCircle /> Accept Order
              </Button>

              {/* Mark as Preparing Button */}
              <Button
                variant="primary"
                className="action-button"
                onClick={() => handleUpdateStatus('preparing')}
                disabled={!canPrepare}
              >
                <Fire /> Mark as Preparing
              </Button>

              {/* Mark as Ready Button */}
              <Button
                variant="info"
                className="action-button"
                onClick={() => handleUpdateStatus('ready')}
                disabled={!canReady}
              >
                <EggFried /> Mark as Ready
              </Button>

              {/* Request Rider Button */}
              <Button
                variant="warning"
                className="action-button"
                onClick={() => console.log('Simulate Request Rider for:', order.id)} // Placeholder for actual rider request logic
                disabled={!canRequestRider}
              >
                <Truck /> Request Rider
              </Button>

              {/* Mark as Picked Up Button (only shows if rider assigned) */}
              {order.rider && (order.status === 'assigned' || order.status === 'ready') && ( // Allow picked_up from ready if rider auto-assigned
                <Button
                  variant="info"
                  className="action-button"
                  onClick={() => handleUpdateStatus('picked_up')}
                  disabled={!canPickup}
                >
                  <Truck /> Mark as Picked Up
                </Button>
              )}


              {/* Mark as Delivered Button */}
              {order.rider && (order.status === 'picked_up' || order.status === 'assigned') && (
                <Button
                  variant="success"
                  className="action-button"
                  onClick={() => handleUpdateStatus('delivered')}
                  disabled={!canDeliver}
                >
                  <CheckCircle /> Mark as Delivered
                </Button>
              )}

              {/* Call Customer Button */}
              {order.user?.phoneNumber && (
                <Button
                  variant="outline-secondary"
                  className="action-button"
                  onClick={handleCallUser}
                >
                  <Phone /> Call Customer
                </Button>
              )}

              {/* Cancel Order Button */}
              <Button
                variant="danger"
                className="action-button"
                onClick={handleOpenCancelModal}
                disabled={!canCancel}
              >
                <XCircle /> Cancel Order
              </Button>
            </ActionButtonsContainer>
          )}

          {isOrderFinalized && (
            <div className="text-center mt-4">
              <p className="lead text-muted">This order is {order.status}. No further actions can be taken.</p>
            </div>
          )}

          <div className="text-center mt-4">
            <Button variant="outline-dark" className="action-button" onClick={() => window.print()}>
              <Printer /> Print Receipt
            </Button>
          </div>
        </StyledModalBody>
      </Modal>

      {/* Cancel Reason Modal (Separate from main Order Details Modal) */}
      <Modal show={showCancelReasonModal} onHide={() => setShowCancelReasonModal(false)} centered>
        <Modal.Body as={CancelModalContent}>
          <CloseButtonAbsolute onClick={() => setShowCancelReasonModal(false)}>
            &times;
          </CloseButtonAbsolute>
          <h3>Reason for Cancellation</h3>
          <textarea
            placeholder="Enter reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows="4"
          ></textarea>
          <div className="modal-actions">
            <button className="btn confirm-cancel" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </button>
            <button className="btn cancel-modal" onClick={() => setShowCancelReasonModal(false)}>
              Go Back
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Call Overlay (if you implement real-time calling) */}
      {/* {isCalling && (
        <CallOverlay>
          <CallModalContent>
            <CallHeader $status="ringing">
              <h4>Calling {callingUser}...</h4>
              <Badge bg="warning" className="call-status-badge">
                <Phone /> Ringing...
              </Badge>
            </CallHeader>
            <CallActions>
              <Button variant="danger" onClick={handleEndCall}>
                <MicMute /> End Call
              </Button>
            </CallActions>
          </CallModalContent>
        </CallOverlay>
      )} */}
    </>
  );
};

export default OrderDetailModal;