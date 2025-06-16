import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Badge, Button, ListGroup, ProgressBar, Modal, Spinner, Alert } from 'react-bootstrap';
import {
    Clock, CheckCircle, Person, XCircle, Fire, Truck, Phone, Printer, Calendar, Mic, MicMute, QuestionCircle, EggFried, GeoAlt, InfoCircle
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import styled, { keyframes } from 'styled-components';
import moment from 'moment'; // For date/time formatting and comparison

// Jikoni Express Color Palette
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
    switch (status) {
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
    switch (status) {
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
    switch (status) {
        case 'pending': return 10;
        case 'accepted': return 25;
        case 'preparing': return 50;
        case 'ready': return 75;
        case 'assigned': return 80;
        case 'picked_up': return 90;
        case 'delivered': return 100;
        case 'cancelled': return 0; // Or adjust for cancelled state visual
        default: return 0;
    }
};

// --- Styled Components (as provided, with minor adjustments) ---

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
  padding: 30px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px 20px;
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
  padding: 20px;
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
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 15px;
  }

  .order-progress-bar {
    height: 10px;
    border-radius: 5px;
    background-color: ${colors.borderColor};
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: ${colors.placeholderText};
    margin-top: 5px;
    font-weight: 500;
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

  .action-button.btn-accent {
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

// New styled component for progress bar in modal for better visibility
const ModalProgressBar = styled(ProgressBar)`
  height: 12px;
  border-radius: 6px;
  .progress-bar {
    background-color: ${colors.secondary}; /* Use Jikoni Green for progress */
  }
`;


const ChefOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chefId, setChefId] = useState('');
    const [socket, setSocket] = useState(null);

    // WebRTC state
    const [callActive, setCallActive] = useState(false);
    const [callingTo, setCallingTo] = useState(null); // 'Rider' or 'Customer' for display
    const [remoteUserId, setRemoteUserId] = useState(null); // ID of the person being called (customer or rider)
    const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'calling', 'ringing', 'connected'
    const audioRef = useRef(null); // Ref for the remote audio stream
    const currentPeer = useRef(null); // Use ref to hold mutable Peer object
    const localStreamRef = useRef(null); // To store the local audio stream
    const [isMuted, setIsMuted] = useState(false); // Local mute state

    // Notification sound
    const notificationSoundRef = useRef(null);

    useEffect(() => {
        // Request notification permission on component mount
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const storedChef = localStorage.getItem('chefId'); // Assuming chefId is stored here
        if (storedChef) {
            setChefId(storedChef);
        } else {
            console.error("Chef ID not found in localStorage. Please log in.");
            // navigate('/login'); // Uncomment to redirect
        }
    }, [navigate]);

    const fetchOrders = async () => {
        if (!chefId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/chef/orders/${chefId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            alert("Failed to fetch orders. Please try again.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chefId) {
            fetchOrders();
        }
    }, [chefId]); // Refetch when chefId becomes available

    // Socket.IO and WebRTC Setup
    useEffect(() => {
        if (!chefId) return;

        // Ensure socket is only created once per chefId
        let newSocket = socket;
        if (!newSocket) {
            newSocket = io('https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke', {
                query: { userId: chefId, userType: 'chef' } // Identify client to server
            });
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to socket.io as chef:', chefId);
                // Join chef's specific room
                newSocket.emit('chef:join', chefId);
            });
             newSocket.on('connect_error', (err) => {
                console.error('Socket.IO connection error:', err);
            });
        }
       

        // --- Order related events ---
        newSocket.on('order:new', (newOrder) => {
            if (newOrder.chefId === chefId) {
                setOrders(prev => [newOrder, ...prev]);
                playNotificationSound();
                if (Notification.permission === 'granted') {
                    new Notification('New Order Received!', {
                        body: `Order #${newOrder.id} from ${newOrder.customerName} has been placed.`,
                        icon: '/images/logo.png', // Ensure this path is correct
                        vibrate: [200, 100, 200],
                    });
                }
            }
        });

        newSocket.on('order:updated', (updatedOrder) => {
            setOrders(prev => prev.map(order =>
                order.id === updatedOrder.id ? updatedOrder : order
            ));
            // You might want to play a sound or show a notification for significant updates too
        });

        newSocket.on('rider:assigned', ({ orderId, rider }) => {
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, rider, status: 'assigned' } : order
            ));
            playNotificationSound();
             if (Notification.permission === 'granted') {
                    new Notification('Rider Assigned!', {
                        body: `Rider ${rider.name} assigned to order #${orderId}.`,
                        icon: '/jikoni-logo.png',
                        vibrate: [200, 100, 200],
                    });
                }
        });

        newSocket.on('order:delivered', (deliveredOrder) => {
            setOrders(prev => prev.map(order =>
                order.id === deliveredOrder.id ? deliveredOrder : order
            ));
            playNotificationSound();
             if (Notification.permission === 'granted') {
                    new Notification('Order Delivered!', {
                        body: `Order #${deliveredOrder.id} has been delivered.`,
                        icon: '/jikoni-logo.png',
                        vibrate: [200, 100, 200],
                    });
                }
        });

        newSocket.on('order:deleted', ({ orderId }) => {
            setOrders(prev => prev.filter(order => order.id !== orderId));
        });

        // --- WebRTC Signaling for Chef (Recipient Logic) ---
        newSocket.on('call:incoming', async ({ from, signalData, type }) => {
            console.log('Incoming call from:', from, 'Type:', type);
            // Prevent multiple incoming call UIs if already in a call or ringing
            if (callActive && callStatus !== 'idle') {
                 newSocket.emit('call:busy', { to: from, from: chefId }); // Inform caller that chef is busy
                 return;
            }

            setRemoteUserId(from);
            setCallingTo(type === 'rider' ? 'Rider' : 'Customer'); // Determine who is calling for display
            setCallStatus('ringing');
            setCallActive(true); // Show call UI
            playNotificationSound(); // Ringing sound

            try {
                // Request local audio stream
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream; // Store local stream

                // Create a new Peer object for the incoming call
                const peer = new Peer({
                    initiator: false, // Chef is not the initiator for incoming calls
                    trickle: false, // Send all ICE candidates at once
                    stream: stream // Add local audio stream to the peer connection
                });

                peer.on('signal', (data) => {
                    // Send the answer signal back to the caller
                    newSocket.emit('call:accept', { to: from, from: chefId, signalData: data, type: 'chef' });
                    console.log(`Emitted call:accept to ${from}`);
                });

                peer.on('stream', (remoteStream) => {
                    // When the remote stream is received, play it
                    console.log('Received remote stream:', remoteStream);
                    if (audioRef.current) {
                        audioRef.current.srcObject = remoteStream;
                        audioRef.current.play().catch(e => console.error("Audio playback error:", e));
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

                // Process the initial offer signal from the caller
                peer.signal(signalData);
                currentPeer.current = peer; // Store the peer object
            } catch (err) {
                console.error('Error handling incoming call:', err);
                alert('Could not handle incoming call. Please check microphone permissions and try again.');
                endCall(); // Ensure call UI is hidden
            }
        });

        // --- WebRTC Signaling for Chef (Initiator Logic - when chef calls customer/rider) ---
        newSocket.on('call:accepted', ({ from, signalData, type }) => {
            // This event is received by the chef (initiator) when the other party accepts
            console.log('Call accepted by remote peer:', from, 'Type:', type);
            if (currentPeer.current && currentPeer.current.initiator && remoteUserId === from) {
                currentPeer.current.signal(signalData); // Process the answer signal
                setCallStatus('connected');
            } else {
                console.warn('Received call:accepted for an unknown or non-initiator call.');
            }
        });

        newSocket.on('call:signal', (signalData) => {
            // Exchange ICE candidates
            if (currentPeer.current) {
                currentPeer.current.signal(signalData);
            }
        });

        newSocket.on('call:ended', () => {
            console.log('Call ended by other party');
            endCall();
        });

        newSocket.on('call:busy', ({from}) => {
             console.log(`Call to ${from} failed: Busy.`);
             alert(`${callingTo} is currently on another call. Please try again later.`);
             endCall(); // Terminate local call attempt UI
        });


        return () => {
            // Clean up all socket listeners and WebRTC resources on unmount or chefId change
            if (newSocket) {
                newSocket.off('order:new');
                newSocket.off('order:updated');
                newSocket.off('rider:assigned');
                newSocket.off('order:delivered');
                newSocket.off('order:deleted');
                newSocket.off('call:incoming');
                newSocket.off('call:accepted');
                newSocket.off('call:signal');
                newSocket.off('call:ended');
                newSocket.off('call:busy');
                // Don't disconnect if socket is potentially reused.
                // For simplicity here, we disconnect if we created it.
                // In a larger app, you might have a global socket or context.
                newSocket.disconnect();
                setSocket(null); // Clear socket state
            }
            if (currentPeer.current) {
                currentPeer.current.destroy();
                currentPeer.current = null;
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            if (audioRef.current && audioRef.current.srcObject) {
                audioRef.current.srcObject.getTracks().forEach(track => track.stop());
                audioRef.current.srcObject = null;
            }
            setCallActive(false); // Hide call UI on unmount
            setCallStatus('idle');
        };
    }, [chefId, remoteUserId, callActive, callStatus]); // Added callActive and callStatus to dependency for robust state
    // ^^^ IMPORTANT: This dependency array ensures socket setup reacts to chefId.
    // However, if your socket instance is managed by a context (e.g., `SocketProvider`),
    // you'd typically manage the socket in that context and only use `useSocket()` here.
    // For this self-contained component, `chefId` as a dependency is okay.


    const playNotificationSound = () => {
        try {
            const audio = new Audio('/audio/cliks.mp3'); // Ensure this path is correct relative to public/
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio constructor failed:', e);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        // Prevent status updates for pre-orders until their time
        const order = orders.find(o => o.id === orderId);
        if (order && order.orderType === 'pre_order') {
            const deliveryDateTime = moment(`${order.deliveryDate} ${order.deliveryTime}`, 'YYYY-MM-DD HH:mm');
            if (moment().isBefore(deliveryDateTime)) {
                alert(`This is a pre-order. Actions are disabled until ${deliveryDateTime.format('MMMM Do YYYY, h:mm a')}.`);
                return;
            }
        }

        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: status } : order
        ));

        try {
            const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/order/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                alert('Failed to update order status. Re-fetching orders.');
                fetchOrders(); // Revert optimistic update
                throw new Error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/order/${orderId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete order');
            }
            // Socket.io will handle UI update via 'order:deleted' event
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order');
        }
    };

    const handleCallPhone = (phone) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            alert("Phone number not available.");
        }
    };

    const handleViewDetails = (order) => {
        setOrderDetails(order);
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setOrderDetails(null);
    };

    // WebRTC call functions (Initiator logic)
    const startCall = async (type, targetUserId) => {
        if (!socket || !chefId) {
            alert('Socket not connected or chefId not set. Please refresh.');
            return;
        }
        if (!targetUserId) {
            alert(`Cannot call. ${type} ID is missing.`);
            return;
        }

        // Prevent initiating a call if already in one or ringing
        if (callActive && callStatus !== 'idle') {
            alert('Already in a call or ringing. Please end current call first.');
            return;
        }

        try {
            setCallStatus('calling'); // Set status to calling immediately
            setCallingTo(type === 'rider' ? 'Rider' : 'Customer');
            setRemoteUserId(targetUserId);
            setCallActive(true); // Show call UI
            setIsMuted(false); // Ensure mic is not muted initially

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream; // Store local stream

            const peer = new Peer({
                initiator: true, // Chef is the initiator
                trickle: false, // Send all ICE candidates at once
                stream: stream // Add local audio stream to the peer connection
            });

            peer.on('signal', (data) => {
                // Send the offer signal to the target user
                socket.emit('call:initiate', {
                    to: targetUserId,
                    from: chefId,
                    signalData: data,
                    type: type // 'rider' or 'customer'
                });
                console.log(`Emitted call:initiate to ${targetUserId}`);
            });

            peer.on('stream', (remoteStream) => {
                // When the remote stream is received, play it
                console.log('Received remote stream:', remoteStream);
                if (audioRef.current) {
                    audioRef.current.srcObject = remoteStream;
                    audioRef.current.play().catch(e => console.error("Audio playback error:", e));
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
                console.error('WebRTC error during call initiation:', err);
                alert('WebRTC error during call: ' + err.message);
                endCall();
            });

            currentPeer.current = peer; // Store the peer object
        } catch (err) {
            console.error('Error starting call:', err);
            alert('Could not start call. Please check microphone permissions and ensure your browser supports WebRTC.');
            endCall(); // Ensure call UI is hidden
        }
    };

    const endCall = () => {
        console.log('Ending call...');
        if (currentPeer.current) {
            currentPeer.current.destroy(); // Properly destroy the peer connection
            currentPeer.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop()); // Stop all tracks
            localStreamRef.current = null;
        }
        if (audioRef.current && audioRef.current.srcObject) {
            // If there's a remote stream playing, stop its tracks as well
            audioRef.current.srcObject.getTracks().forEach(track => track.stop());
            audioRef.current.srcObject = null;
        }

        if (socket && remoteUserId) {
            socket.emit('call:end', { to: remoteUserId, from: chefId }); // Notify other party
        }
        setCallActive(false);
        setCallingTo(null);
        setRemoteUserId(null);
        setCallStatus('idle');
        setIsMuted(false); // Reset mute state
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled); // Update local mute state
                console.log('Mic enabled:', audioTrack.enabled);
            }
        }
    };

    // Pre-order check for enabling/disabling buttons
    const isPreOrderActive = useMemo(() => {
        if (!orderDetails || orderDetails.orderType !== 'pre_order') {
            return true; // If not pre-order, actions are active by default
        }
        const deliveryDateTime = moment(`${orderDetails.deliveryDate} ${orderDetails.deliveryTime}`, 'YYYY-MM-DD HH:mm');
        return moment().isSameOrAfter(deliveryDateTime);
    }, [orderDetails]);

    return (
        <DashboardContainer>
            {/* Call Interface */}
            {callActive && (
                <CallOverlay>
                    <CallModalContent>
                        <CallHeader $status={callStatus}>
                            <h4>{callStatus === 'calling' ? `Calling ${callingTo}...` : callStatus === 'ringing' ? `Incoming Call from ${callingTo}` : `Connected with ${callingTo}`}</h4>
                            <Badge bg={callStatus === 'connected' ? 'success' : callStatus === 'ringing' ? 'warning' : 'info'} className="call-status-badge">
                                {callStatus === 'calling' ? 'Connecting...' : callStatus === 'ringing' ? 'Incoming...' : 'Connected'}
                            </Badge>
                        </CallHeader>

                        <CallActions>
                            {callStatus === 'ringing' && (
                                <Button variant="success" onClick={() => {
                                    // The actual accept logic is handled in socket.on('call:incoming') by `peer.signal(signalData)`
                                    // This button primarily signifies the user's intent to answer and updates UI.
                                    setCallStatus('connected');
                                }}>
                                    <Phone className="me-1" /> Accept
                                </Button>
                            )}
                            {(callStatus === 'connected' || callStatus === 'calling' || callStatus === 'ringing') && (
                                <Button
                                    variant={isMuted ? 'danger' : 'secondary'}
                                    onClick={toggleMute}
                                    disabled={callStatus !== 'connected' && callStatus !== 'ringing'} // Disable mute button if not connected or ringing
                                >
                                    {isMuted ? <MicMute /> : <Mic />}
                                    {isMuted ? 'Unmute' : 'Mute'}
                                </Button>
                            )}
                            <Button variant="danger" onClick={endCall}>
                                <XCircle className="me-1" /> End Call
                            </Button>
                        </CallActions>
                    </CallModalContent>
                    {/* Audio element for playing remote stream, must be outside CallModalContent */}
                    <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />
                </CallOverlay>
            )}

            <DashboardHeader>
                <h3 className="dashboard-title">Orders Dashboard</h3>
                <div className="dashboard-actions">
                    <Button
                        variant="outline-secondary"
                        className="me-2 filter-button"
                        onClick={() => setOrders(prev => prev.filter(o => o.status === 'pending'))} // Example filter
                    >
                        Pending Orders
                    </Button>
                    <Button
                        variant="outline-secondary"
                        className="filter-button"
                        onClick={() => { /* Filter logic for today's orders */ }}
                    >
                        Today's Orders
                    </Button>
                </div>
            </DashboardHeader>

            {loading ? (
                <div className="loading-state text-center py-5">
                    <Spinner animation="border" role="status" style={{ color: colors.primary }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="loading-text mt-3 text-muted">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <EmptyState>
                    <EggFried className="empty-state-icon" />
                    <h4 className="empty-state-title">No Orders Yet!</h4>
                    <p className="empty-state-text">New orders will appear here as customers place them.</p>
                </EmptyState>
            ) : (
                <OrderGrid>
                    {orders.map(order => (
                        <OrderCard key={order.id}>
                            <OrderCardHeader>
                                <div>
                                    <Badge bg={getStatusColor(order.status)} className="status-badge">
                                        {getStatusIcon(order.status)} {order.status.replace(/_/g, ' ')}
                                    </Badge>
                                    <span className="order-id">#{order.id}</span>
                                </div>
                                <small><Clock className="me-1" /> {moment(order.createdAt).format('MMM Do, h:mm A')}</small>
                            </OrderCardHeader>
                            <CardBodyStyled>
                                <InfoSection>
                                    <div>
                                        <div className="section-title">Customer</div>
                                        <p className="info-text"><Person className="me-1" /> {order.customerName}</p>
                                        <small><GeoAlt className="me-1" /> {order.deliveryAddress || 'N/A'}</small>
                                    </div>
                                    <div>
                                        <div className="section-title">Total</div>
                                        <p className="total-price">KES {order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>
                                    </div>
                                </InfoSection>

                                {/* Pre-order alert on the card */}
                                {order.orderType === 'pre_order' && moment(`${order.deliveryDate} ${order.deliveryTime}`, 'YYYY-MM-DD HH:mm').isAfter(moment()) && (
                                    <PreorderAlert variant="warning" className="mb-3">
                                        <Calendar /> <strong>Pre-Order:</strong> Scheduled for <br/>
                                        {moment(`${order.deliveryDate} ${order.deliveryTime}`, 'YYYY-MM-DD HH:mm').format('MMMM Do YYYY, h:mm A')}
                                    </PreorderAlert>
                                )}

                                <ListGroup variant="flush" className="mb-3">
                                    <div className="section-title">Items</div>
                                    {order.foodItems && order.foodItems.length > 0 ? (
                                        order.foodItems.map(item => (
                                            <ListGroup.Item key={item.foodId} className="item-list-item">
                                                <span>{item.quantity} x {item.foodName}</span>
                                                <span>KES {(item.quantity * item.foodPrice).toFixed(2)}</span>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <ListGroup.Item className="text-muted">No items found.</ListGroup.Item>
                                    )}
                                </ListGroup>

                                {order.rider && (
                                    <RiderSection>
                                        <div className="section-title">Assigned Rider</div>
                                        <div className="d-flex align-items-center">
                                            <div className="rider-avatar">
                                                <Person size={20} color={colors.primary} />
                                            </div>
                                            <div>
                                                <p className="info-text">{order.rider.name || 'Unknown Rider'}</p>
                                                <small>{order.rider.phone || 'N/A'}</small>
                                            </div>
                                        </div>
                                    </RiderSection>
                                )}

                                <ActionButtons>
                                    <Button
                                        variant="outline-secondary"
                                        className="detail-button"
                                        onClick={() => handleViewDetails(order)}
                                    >
                                        <InfoCircle className="me-1" /> View Details
                                    </Button>

                                    {order.status === 'pending' && (
                                        <Button
                                            variant="primary"
                                            className="action-button"
                                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                                            disabled={order.orderType === 'pre_order' && !isPreOrderActive}
                                        >
                                            <CheckCircle className="me-1" /> Accept Order
                                        </Button>
                                    )}
                                    {order.status === 'accepted' && (
                                        <Button
                                            variant="primary"
                                            className="action-button"
                                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                                            disabled={order.orderType === 'pre_order' && !isPreOrderActive}
                                        >
                                            <Fire className="me-1" /> Start Preparing
                                        </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <Button
                                            variant="success"
                                            className="action-button"
                                            onClick={() => updateOrderStatus(order.id, 'ready')}
                                            disabled={order.orderType === 'pre_order' && !isPreOrderActive}
                                        >
                                            <CheckCircle className="me-1" /> Mark Ready
                                        </Button>
                                    )}
                                    {order.status === 'ready' && (
                                        <Button
                                            variant="info"
                                            className="action-button"
                                            onClick={() => alert("Order is ready. Awaiting rider assignment.")}
                                            disabled={order.orderType === 'pre_order' && !isPreOrderActive}
                                        >
                                            <Truck className="me-1" /> Awaiting Rider
                                        </Button>
                                    )}
                                </ActionButtons>
                            </CardBodyStyled>
                        </OrderCard>
                    ))}
                </OrderGrid>
            )}

            {/* Order Details Modal */}
            {orderDetails && (
                <Modal show={showDetails} onHide={handleCloseDetails} size="lg" centered>
                    <StyledModalHeader closeButton>
                        <Modal.Title>Order Details <span className="text-muted">#{orderDetails.id}</span></Modal.Title>
                    </StyledModalHeader>
                    <StyledModalBody>
                        {/* Pre-order specific alert at the top of the modal */}
                        {orderDetails.orderType === 'pre_order' && (
                            <PreorderAlert variant="warning" className="mb-4">
                                <Calendar size={20} />
                                <div>
                                    <strong>This is a Pre-Order!</strong><br/>
                                    Delivery scheduled for <strong>{moment(`${orderDetails.deliveryDate} ${orderDetails.deliveryTime}`, 'YYYY-MM-DD HH:mm').format('MMMM Do YYYY, h:mm A')}.</strong><br/>
                                    Actions will be enabled at the scheduled time.
                                </div>
                            </PreorderAlert>
                        )}

                        <ModalSection>
                            <h5><InfoCircle /> Order Summary</h5>
                            <div className="info-row">
                                <span className="info-label">Order Type</span>
                                <span className="info-value">
                                    <Badge bg={orderDetails.orderType === 'pre_order' ? 'warning' : 'primary'}>
                                        {orderDetails.orderType.replace(/_/g, ' ')}
                                    </Badge>
                                </span>
                            </div>
                             <div className="info-row">
                                <span className="info-label">Status</span>
                                <span className="info-value">
                                    <Badge bg={getStatusColor(orderDetails.status)}>
                                        {getStatusIcon(orderDetails.status)} {orderDetails.status.replace(/_/g, ' ')}
                                    </Badge>
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Order Date</span>
                                <span className="info-value">{moment(orderDetails.createdAt).format('MMMM Do YYYY, h:mm A')}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Total Price</span>
                                <span className="info-value total-price">KES {orderDetails.totalPrice ? orderDetails.totalPrice.toFixed(2) : '0.00'}</span>
                            </div>
                        </ModalSection>

                        <ProgressSection>
                            <h5 className="section-title"><CheckCircle /> Order Progress</h5>
                            <ModalProgressBar now={getProgress(orderDetails.status)} label={`${getProgress(orderDetails.status)}%`} className="order-progress-bar" />
                            <div className="progress-labels">
                                <span>Pending</span>
                                <span>Accepted</span>
                                <span>Preparing</span>
                                <span>Ready</span>
                                <span>Delivered</span>
                            </div>
                        </ProgressSection>

                        <ModalSection>
                            <h5><Person /> Customer Details</h5>
                            <div className="info-row">
                                <span className="info-label">Name</span>
                                <span className="info-value">{orderDetails.customerName || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Phone</span>
                                <span className="info-value">{orderDetails.customerPhone || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Delivery Address</span>
                                <span className="info-value">{orderDetails.deliveryAddress || 'N/A'}</span>
                            </div>
                            <div className="d-flex justify-content-start gap-3 mt-3">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => handleCallPhone(orderDetails.customerPhone)}
                                    disabled={!orderDetails.customerPhone}
                                >
                                    <Phone /> Call Customer
                                </Button>
                                <CallModalButton
                                    $variant="accent" // Use the custom styled button
                                    onClick={() => startCall('customer', orderDetails.customerId)}
                                    disabled={!orderDetails.customerId || (callActive && callStatus !== 'idle') || (orderDetails.orderType === 'pre_order' && !isPreOrderActive)}
                                >
                                    <Mic /> Audio Call (App)
                                </CallModalButton>
                            </div>
                        </ModalSection>

                        <ModalSection>
                            <h5><EggFried /> Food Items</h5>
                            <ListGroup variant="flush">
                                {orderDetails.foodItems && orderDetails.foodItems.length > 0 ? (
                                    orderDetails.foodItems.map(item => (
                                        <React.Fragment key={item.foodId}>
                                            <ListGroup.Item className="py-3">
                                                <FoodItemDetails>
                                                    <img src={item.foodImage || '/placeholder-food.png'} alt={item.foodName} />
                                                    <div className="food-content">
                                                        <h6>{item.foodName} (x{item.quantity})</h6>
                                                        <p className="food-description">{item.foodDescription || 'No description provided.'}</p>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span>Category: <Badge bg="secondary">{item.foodCategory || 'N/A'}</Badge></span>
                                                            <span className="info-value">KES {item.foodPrice ? (item.quantity * item.foodPrice).toFixed(2) : '0.00'}</span>
                                                        </div>
                                                    </div>
                                                </FoodItemDetails>
                                            </ListGroup.Item>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <ListGroup.Item className="text-muted">No food items listed for this order.</ListGroup.Item>
                                )}
                            </ListGroup>
                        </ModalSection>

                        {orderDetails.rider && (
                            <ModalSection>
                                <h5><Truck /> Rider Details</h5>
                                <div className="info-row">
                                    <span className="info-label">Name</span>
                                    <span className="info-value">{orderDetails.rider.name || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{orderDetails.rider.phone || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-start gap-3 mt-3">
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => handleCallPhone(orderDetails.rider.phone)}
                                        disabled={!orderDetails.rider.phone}
                                    >
                                        <Phone /> Call Rider
                                    </Button>
                                    <CallModalButton
                                        $variant="accent"
                                        onClick={() => startCall('rider', orderDetails.rider.id)}
                                        disabled={!orderDetails.rider.id || (callActive && callStatus !== 'idle') || (orderDetails.orderType === 'pre_order' && !isPreOrderActive)}
                                    >
                                        <Mic /> Audio Call (App)
                                    </CallModalButton>
                                </div>
                            </ModalSection>
                        )}

                        <ModalSection>
                            <h5><Printer /> Actions</h5>
                            <div className="d-flex justify-content-start flex-wrap gap-2">
                                {/* Only allow actions if not a pre-order or if pre-order is active */}
                                {orderDetails.status === 'pending' && (
                                    <Button
                                        variant="success"
                                        className="action-button"
                                        onClick={() => updateOrderStatus(orderDetails.id, 'accepted')}
                                        disabled={orderDetails.orderType === 'pre_order' && !isPreOrderActive}
                                    >
                                        <CheckCircle /> Accept Order
                                    </Button>
                                )}
                                {orderDetails.status === 'accepted' && (
                                    <Button
                                        variant="primary"
                                        className="action-button"
                                        onClick={() => updateOrderStatus(orderDetails.id, 'preparing')}
                                        disabled={orderDetails.orderType === 'pre_order' && !isPreOrderActive}
                                    >
                                        <Fire /> Start Preparing
                                    </Button>
                                )}
                                {orderDetails.status === 'preparing' && (
                                    <Button
                                        variant="success"
                                        className="action-button"
                                        onClick={() => updateOrderStatus(orderDetails.id, 'ready')}
                                        disabled={orderDetails.orderType === 'pre_order' && !isPreOrderActive}
                                    >
                                        <CheckCircle /> Mark Ready
                                    </Button>
                                )}
                                {(orderDetails.status === 'pending' || orderDetails.status === 'accepted' || orderDetails.status === 'preparing' || orderDetails.status === 'ready') && (
                                    <Button
                                        variant="danger"
                                        className="action-button"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to cancel this order?')) {
                                                updateOrderStatus(orderDetails.id, 'cancelled');
                                                handleCloseDetails();
                                            }
                                        }}
                                        disabled={orderDetails.orderType === 'pre_order' && !isPreOrderActive}
                                    >
                                        <XCircle /> Cancel Order
                                    </Button>
                                )}
                                <Button
                                    variant="outline-secondary"
                                    className="action-button"
                                    onClick={() => alert('Printing invoice (not implemented)')}
                                >
                                    <Printer /> Print Invoice
                                </Button>
                            </div>
                        </ModalSection>
                    </StyledModalBody>
                </Modal>
            )}
            <audio ref={notificationSoundRef} src="/audio/cliks.mp3" preload="auto" />
        </DashboardContainer>
    );
};

export default ChefOrders;