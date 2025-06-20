import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Peer from 'peerjs';

// --- Jikoni Express Color Palette ---
const colors = {
    primary: '#FF4532', // Jikoni Red
    secondary: '#00C853', // Jikoni Green
    darkText: '#1A202C',
    lightBackground: '#F0F2F5',
    cardBackground: '#FFFFFF',
    borderColor: '#D1D9E6',
    error: '#EF4444',
    placeholderText: '#A0AEC0',
    buttonHover: '#E6392B',
    disabledButton: '#CBD5E1',
    success: '#00C853',
    warning: '#FFC107',
    info: '#2196F3',
    accent: '#4361EE',
    chefCard: '#FFF8F0',
    riderCard: '#F0F5FF',
};

const RiderDashboard = () => {
    // State initialization
    const [riderId, setRiderId] = useState('');
    const [activeOrders, setActiveOrders] = useState([]);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [earnings, setEarnings] = useState({
        balance: 3425.75,
        totalDeliveries: 42,
        weeklyEarnings: 1250.50,
        paymentStatus: 'Pending'
    });
    const [profile, setProfile] = useState({
        name: 'Peter Mumo',
        phone: '0740045355',
        rating: 4.8,
        vehicleType: 'Motorcycle',
        photo: '/images/rider.png',
        available: true
    });

    // Modal states
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [detailedOrder, setDetailedOrder] = useState(null);
    const [otpInput, setOtpInput] = useState('');
    const [otpVerificationError, setOtpVerificationError] = useState('');
    const [showDeliverySuccessModal, setShowDeliverySuccessModal] = useState(false);
    const [showOrderAcceptedModal, setShowOrderAcceptedModal] = useState(false);
    const [showStartDeliveryConfirmationModal, setShowStartDeliveryConfirmationModal] = useState(false);
    const [showNavigationOptions, setShowNavigationOptions] = useState(false);
    const [navigationDestination, setNavigationDestination] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);

    // PeerJS States & Refs
    const [myPeerId, setMyPeerId] = useState(null);
    const [callStatus, setCallStatus] = useState('idle');
    const [message, setMessage] = useState('Welcome!');
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [incomingCallData, setIncomingCallData] = useState(null);
    const [currentContact, setCurrentContact] = useState({ name: '', type: '', phoneNumber: '', peerId: '' });

    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const currentCallRef = useRef(null);
    const audioRef = useRef(null);
    const notificationSoundRef = useRef(null);
    const socketRef = useRef(null);

    // Format order data
    const formatOrder = (order) => ({
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        riderId: order.riderId,
        assignedAt: order.assignedAt,
        deliveryAddress: order.deliveryAddress,
        totalPrice: order.totalPrice,
        riderPay: order.riderPay,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        notes: order.notes,
        otp: order.otpCode,
        deliveryDate: order.deliveryDate,
        customer: {
            name: order.user?.Name || 'Customer',
            phone: order.user?.PhoneNumber || 'N/A',
            address: order.deliveryAddress,
            peerId: order.user?.peerId || null
        },
        chef: {
            id: order.chef?.id,
            name: order.chef?.user?.Name || 'Chef',
            phone: order.chef?.user?.PhoneNumber || 'N/A',
            location: order.chef?.location,
            rating: order.chef?.rating || 4.5,
            speciality: order.chef?.speciality || 'Grilled Meats',
            latitude: order.chef?.latitude,
            longitude: order.chef?.longitude,
            peerId: order.chef?.peerId || null
        },
        food: {
            id: order.foodListing?.id,
            title: order.foodListing?.title || 'Food Item',
            description: order.foodListing?.description || 'Delicious meal prepared with care',
            price: order.foodListing?.price || 0,
            images: order.foodListing?.photoUrls || []
        },
        paymentMethod: order.paymentMethod,
        coordinates: {
            pickup: [order.chef?.latitude || -1.3007, order.chef?.longitude || 36.8782],
            dropoff: [order.latitude || -1.2921, order.longitude || 36.8219]
        },
    });

    // Calculate estimated time based on distance and vehicle type
    const calculateEstimatedTime = (destination) => {
        // In a real app, this would use actual distance calculation APIs
        const baseTime = profile.vehicleType === 'Motorcycle' ? 15 : 25;
        const randomVariation = Math.floor(Math.random() * 10);
        return `${baseTime + randomVariation} mins`;
    };

    // Open navigation options modal
    const showNavigationModal = (destination, order) => {
        setDetailedOrder(order);
        setNavigationDestination(destination);
        setEstimatedTime(calculateEstimatedTime(destination));
        setShowNavigationOptions(true);
    };

    // Open navigation in selected app
    const openNavigation = (app) => {
        if (!detailedOrder) return;
        
        let destinationLat, destinationLon;
        
        if (navigationDestination === 'chef') {
            destinationLat = detailedOrder.chef.latitude;
            destinationLon = detailedOrder.chef.longitude;
        } else {
            destinationLat = detailedOrder.coordinates.dropoff[0];
            destinationLon = detailedOrder.coordinates.dropoff[1];
        }

        const urls = {
            google: `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLon}&travelmode=driving`,
            waze: `https://www.waze.com/ul?ll=${destinationLat},${destinationLon}&navigate=yes`
        };

        window.open(urls[app], '_blank');
        setShowNavigationOptions(false);
    };

    // PeerJS Call Handling Functions
    const cleanupCall = useCallback((statusMessage = 'Call ended.') => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
        if (currentCallRef.current) {
            currentCallRef.current.close();
            currentCallRef.current = null;
        }
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
        }

        setCallStatus('idle');
        setMessage(statusMessage);
        setIsMuted(false);
        setIncomingCallData(null);
        setCurrentContact({ name: '', type: '', phoneNumber: '', peerId: '' });
    }, []);

    const handleStream = useCallback((stream) => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.onloadedmetadata = () => {
                remoteAudioRef.current.play().catch(e => console.error("Audio play failed:", e));
            };
        }
        setCallStatus('in-call');
        setMessage(`Connected with ${currentContact.name || currentContact.peerId?.substring(0, 8)}`);
    }, [currentContact.name, currentContact.peerId]);

    const startPeerCall = async (targetPeerId, contactName, contactType, phoneNumber) => {
        if (!peerRef.current || !myPeerId) {
            setMessage('App not ready. Please wait for PeerJS to initialize.');
            return;
        }
        if (!targetPeerId) {
            setMessage(`Cannot call ${contactType}. No Peer ID available.`);
            return;
        }
        if (targetPeerId === myPeerId) {
            setMessage('Cannot call yourself!');
            return;
        }
        if (callStatus !== 'idle') {
            setMessage('Already in a call or connecting.');
            return;
        }

        setCallStatus('connecting');
        setMessage(`Dialing ${contactName || contactType}...`);
        setCurrentContact({ name: contactName, type: contactType, phoneNumber, peerId: targetPeerId });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            const call = peerRef.current.call(targetPeerId, stream);
            currentCallRef.current = call;

            call.on('stream', handleStream);
            call.on('close', () => cleanupCall('Call ended.'));
            call.on('error', (err) => {
                console.error('Call Error:', err);
                cleanupCall(`Call failed: ${err.message}`);
            });

        } catch (error) {
            console.error('Failed to get local stream or initiate call:', error);
            setMessage(`Microphone access needed to make calls. Please allow access and try again.`);
            setCallStatus('error');
            cleanupCall();
        }
    };

    const answerPeerCall = async () => {
        if (!incomingCallData) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
        }

        setCallStatus('connecting');
        setMessage(`Answering call from ${incomingCallData.contactName || incomingCallData.fromPeerId.substring(0, 8)}...`);
        setCurrentContact({
            name: incomingCallData.contactName,
            type: incomingCallData.contactType,
            phoneNumber: incomingCallData.phoneNumber,
            peerId: incomingCallData.fromPeerId
        });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;

            incomingCallData.call.answer(stream);
            currentCallRef.current = incomingCallData.call;

            incomingCallData.call.on('stream', handleStream);
            incomingCallData.call.on('close', () => cleanupCall(`Call ended by ${incomingCallData.contactName || 'remote party'}.`));
            incomingCallData.call.on('error', (err) => {
                console.error('Call Error:', err);
                cleanupCall(`Call error: ${err.message}`);
            });

            setIncomingCallData(null);
        } catch (error) {
            console.error('Failed to get local stream or answer call:', error);
            setMessage(`Microphone access needed to answer calls. Please allow access and try again.`);
            setCallStatus('error');
            cleanupCall();
        }
    };

    const rejectPeerCall = () => {
        if (incomingCallData) {
            setMessage(`Call from ${incomingCallData.contactName || incomingCallData.fromPeerId.substring(0, 8)} rejected.`);
            incomingCallData.call.close();
            setIncomingCallData(null);
            setCallStatus('idle');
            setCurrentContact({ name: '', type: '', phoneNumber: '', peerId: '' });
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.src = '';
            }
        } else if (callStatus === 'connecting' && currentCallRef.current) {
            cleanupCall('Call cancelled.');
        }
    };

    const endPeerCall = () => {
        cleanupCall('Call ended.');
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            if (audioTracks.length > 0) {
                const newState = !isMuted;
                audioTracks[0].enabled = !newState;
                setIsMuted(newState);
                setMessage(newState ? 'Microphone Muted.' : 'Microphone Unmuted.');
            } else {
                setMessage('No microphone detected in active stream.');
            }
        } else {
            setMessage('No active call to mute/unmute.');
        }
    };

    const toggleSpeaker = () => {
        const newState = !isSpeakerOn;
        setIsSpeakerOn(newState);
        setMessage(newState ? 'Loudspeaker ON.' : 'Loudspeaker OFF (using default output).');
    };

    // Initialize rider ID from localStorage
    useEffect(() => {
        const storedRiderId = localStorage.getItem('riderId');
        const storedActiveOrders = localStorage.getItem('riderActiveOrders');
        
        if (storedRiderId) {
            setRiderId(storedRiderId);
        } else {
            const newRiderId = 'cmbnnx2kv0000dk2ag7wrm4au';
            localStorage.setItem('riderId', newRiderId);
            setRiderId(newRiderId);
        }
        
        if (storedActiveOrders) {
            setActiveOrders(JSON.parse(storedActiveOrders));
        }

        // Initialize PeerJS
        setMessage('Initializing secure connection...');
        try {
            const peer = new Peer(storedRiderId || 'cmbnnx2kv0000dk2ag7wrm4au', {
                host: 'localhost',
                port: 9000,
                path: '/jikoni-call',
                debug: 2,
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                    ]
                }
            });

            peer.on('open', id => {
                setMyPeerId(id);
                setCallStatus('idle');
                setMessage(`Ready! Your Rider ID: ${id}`);
                if (!localStorage.getItem('jikoniRiderPeerId') || localStorage.getItem('jikoniRiderPeerId') !== id) {
                    localStorage.setItem('jikoniRiderPeerId', id);
                }
            });

            peer.on('call', call => {
                const callingPartyType = call.metadata?.type || (call.peer.includes('chef') ? 'Chef' : (call.peer.includes('user') ? 'Customer' : 'Unknown'));
                const callingPartyName = call.metadata?.name || (callingPartyType !== 'Unknown' ? `${callingPartyType} ${call.peer.substring(0, 8)}` : call.peer);
                const callingPartyPhone = call.metadata?.phoneNumber || 'N/A';

                if (callStatus === 'idle' || callStatus === 'ended') {
                    setIncomingCallData({
                        call,
                        fromPeerId: call.peer,
                        contactName: callingPartyName,
                        contactType: callingPartyType,
                        phoneNumber: callingPartyPhone
                    });
                    setCallStatus('ringing');
                    setMessage(`Incoming call from ${callingPartyName}...`);
                    if (audioRef.current) {
                        audioRef.current.loop = true;
                        audioRef.current.src = '/sounds/ringing.mp3';
                        audioRef.current.play().catch(e => console.error("Ringing sound play failed:", e));
                    }
                } else {
                    call.close();
                }
            });

            peer.on('error', err => {
                console.error('PeerJS Error:', err);
                setMessage(`Connection Error: ${err.message}.`);
                setCallStatus('error');
                cleanupCall();
            });

            peerRef.current = peer;

            return () => {
                if (peerRef.current) {
                    peerRef.current.destroy();
                    peerRef.current = null;
                }
                cleanupCall();
            };
        } catch (error) {
            console.error('Failed to initialize PeerJS:', error);
            setMessage(`Failed to connect to call service: ${error.message}`);
            setCallStatus('error');
        }
    }, [cleanupCall, handleStream]);

    // Save active orders to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('riderActiveOrders', JSON.stringify(activeOrders));
    }, [activeOrders]);

    // Socket.IO connection
    useEffect(() => {
        socketRef.current = io('http://localhost:8000');

        socketRef.current.on('connect', () => {
            socketRef.current.emit('rider:online', riderId);
        });

        socketRef.current.on('new:order:available', (order) => {
            const formattedOrder = formatOrder(order);
            setAvailableOrders(prev => [formattedOrder, ...prev]);
            if (notificationSoundRef.current) {
                notificationSoundRef.current.play().catch(e => console.error("Notification sound play failed:", e));
            }
            setMessage(`New order ${formattedOrder.id} available!`);
        });

        socketRef.current.on('order:assigned:to:rider', (order) => {
            const formattedOrder = formatOrder(order);
            setActiveOrders(prev => {
                if (!prev.some(o => o.id === formattedOrder.id)) {
                    return [formattedOrder, ...prev];
                }
                return prev.map(o => o.id === formattedOrder.id ? formattedOrder : o);
            });
            setAvailableOrders(prev => prev.filter(o => o.id !== formattedOrder.id));
            setMessage(`Order ${formattedOrder.id} has been assigned to you!`);
        });

        socketRef.current.on('order:status:updated', (updatedOrder) => {
            const formattedOrder = formatOrder(updatedOrder);
            setActiveOrders(prev => prev.map(order =>
                order.id === formattedOrder.id ? formattedOrder : order
            ));
            setAvailableOrders(prev => prev.filter(order => order.id !== formattedOrder.id));
            setMessage(`Order ${formattedOrder.id} status updated to ${formattedOrder.status}`);
        });

        socketRef.current.on('order:cancelled', (orderId) => {
            setActiveOrders(prev => prev.filter(order => order.id !== orderId));
            setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(null);
            }
            setMessage(`Order ${orderId} has been cancelled.`);
        });

        socketRef.current.on('disconnect', () => {
            setMessage('Disconnected from server. Reconnecting...');
        });

        socketRef.current.on('error', (err) => {
            console.error('Socket.IO Error:', err);
            setMessage(`Socket Error: ${err.message}`);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [riderId]);

    // Initial fetch of orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8000/apiV1/smartcity-ke/orders');
                if (!response.ok) throw new Error("Failed to fetch orders");
                const data = await response.json();
                const formattedOrders = data.orders.map(formatOrder);

                const riderSpecificOrders = formattedOrders.filter(order =>
                    order.riderId === riderId || (order.riderId === null && order.status === 'READY')
                );

                setAvailableOrders(riderSpecificOrders.filter(order => order.status === 'READY' && order.riderId === null));
                
                // Merge localStorage orders with server data
                setActiveOrders(prev => {
                    const serverActiveOrders = riderSpecificOrders.filter(order =>
                        (order.status === 'ASSIGNED' || order.status === 'OUT_FOR_DELIVERY') && order.riderId === riderId
                    );
                    
                    // Create a map of order IDs from server for quick lookup
                    const serverOrderIds = new Set(serverActiveOrders.map(o => o.id));
                    
                    // Preserve orders from localStorage that are not in server response
                    const preservedOrders = prev.filter(order => 
                        !serverOrderIds.has(order.id) && 
                        (order.status === 'ASSIGNED' || order.status === 'OUT_FOR_DELIVERY')
                    );
                    
                    return [...serverActiveOrders, ...preservedOrders];
                });
            } catch (err) {
                console.error('Error fetching orders:', err);
                setMessage('Error fetching orders. Please try again later.');
            }
        };

        if (riderId) fetchOrders();
    }, [riderId]);

    // Handle order acceptance
    const handleAcceptOrder = async (orderId) => {
        const orderToAccept = availableOrders.find(order => order.id === orderId);
        if (!orderToAccept) {
            setMessage("Order not found or already accepted.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/order/${orderId}/assign-rider`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ riderId: riderId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to assign rider to order ${orderId}`);
            }

            const updatedOrderData = await response.json();
            const updatedOrder = formatOrder(updatedOrderData.order);

            setActiveOrders(prev => {
                const existingIndex = prev.findIndex(o => o.id === updatedOrder.id);
                if (existingIndex > -1) {
                    return prev.map((o, idx) => idx === existingIndex ? updatedOrder : o);
                }
                return [updatedOrder, ...prev];
            });
            setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
            setSelectedOrder(updatedOrder);

            setShowOrderAcceptedModal(true);
            setMessage(`Order ${orderId} accepted and assigned!`);

            socketRef.current.emit('order:assign:rider', {
                orderId: updatedOrder.id,
                riderId: riderId,
                status: updatedOrder.status,
                assignedAt: updatedOrder.assignedAt
            });

        } catch (error) {
            console.error('Error accepting order:', error);
            setMessage(`Error accepting order: ${error.message}`);
        }
    };

    const declineOrder = (orderId) => {
        setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
        socketRef.current.emit('order:decline', { orderId: orderId, riderId: riderId });
        setMessage(`Order ${orderId} declined.`);
    };

    const handleStartDeliveryClick = (order) => {
        setSelectedOrder(order);
        setShowStartDeliveryConfirmationModal(true);
    };

    const confirmStartDelivery = () => {
        if (!selectedOrder) return;

        const id = selectedOrder.id;
        setActiveOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status: 'OUT_FOR_DELIVERY' } : order
        ));
        socketRef.current.emit('order:status:update', { orderId: id, status: 'OUT_FOR_DELIVERY', riderId });
        setShowStartDeliveryConfirmationModal(false);
        setSelectedOrder(null);
        setMessage(`Order ${id} is now out for delivery!`);
    };

    // Function to open detailed order view
    const openOrderDetails = (order) => {
        setDetailedOrder(order);
        setOtpInput('');
        setOtpVerificationError('');
        setShowOrderDetailsModal(true);
    };

    // Verify delivery OTP
    const verifyDeliveryOTP = async () => {
        if (!detailedOrder) return;
        
        if (otpInput !== detailedOrder.otp) {
            setOtpVerificationError("Incorrect OTP. Please try again.");
            return;
        }
        
        try {
            // Send delivery confirmation to API
            const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/order/${detailedOrder.id}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    riderId: riderId,
                    otp: otpInput
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to confirm delivery for order ${detailedOrder.id}`);
            }

            const result = await response.json();
            
            // Update earnings
            setEarnings(prev => ({
                ...prev,
                balance: prev.balance + detailedOrder.riderPay,
                totalDeliveries: prev.totalDeliveries + 1
            }));
            
            // Remove from active orders
            setActiveOrders(prev => prev.filter(order => order.id !== detailedOrder.id));
            setShowDeliverySuccessModal(true);
            
            // Emit socket event
            socketRef.current.emit('order:status:update', { 
                orderId: detailedOrder.id, 
                status: 'DELIVERED', 
                riderId, 
                otpVerified: true 
            });
            
            setMessage(`Delivery for order ${detailedOrder.id} completed!`);
            setOtpInput('');
            setOtpVerificationError('');
            setShowOrderDetailsModal(false);
        } catch (error) {
            console.error('Delivery confirmation error:', error);
            setOtpVerificationError(error.message || "Failed to confirm delivery. Please try again.");
        }
    };

    const toggleAvailability = () => {
        const newAvailability = !profile.available;
        setProfile(prev => ({ ...prev, available: newAvailability }));
        socketRef.current.emit('rider:availability:update', { riderId, available: newAvailability });
    };

    const getTimeSinceAssignment = (assignedAt) => {
        if (!assignedAt) return 'N/A';
        return formatDistanceToNow(parseISO(assignedAt), { addSuffix: true });
    };

    // Button styles
    const buttonStyles = {
        base: {
            padding: '12px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        primary: {
            backgroundColor: colors.primary,
            color: 'white',
            '&:hover': {
                backgroundColor: colors.buttonHover,
            },
            '&:disabled': {
                backgroundColor: colors.disabledButton,
                cursor: 'not-allowed',
                boxShadow: 'none'
            }
        },
        secondary: {
            backgroundColor: colors.secondary,
            color: 'white',
            '&:hover': {
                backgroundColor: '#00B080',
            }
        },
        accent: {
            backgroundColor: colors.accent,
            color: 'white',
            '&:hover': {
                backgroundColor: '#3A54D0',
            }
        },
        outline: {
            backgroundColor: 'transparent',
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
            '&:hover': {
                backgroundColor: colors.primary + '10'
            }
        },
        danger: {
            backgroundColor: colors.error,
            color: 'white',
            '&:hover': {
                backgroundColor: '#C0392B',
            }
        },
        info: {
            backgroundColor: colors.info,
            color: 'white',
            '&:hover': {
                backgroundColor: '#2A72B0',
            }
        },
        success: {
            backgroundColor: colors.success,
            color: 'white',
            '&:hover': {
                backgroundColor: '#00A040',
            }
        }
    };

    // Inline style function for dynamic button styles
    const getButtonStyle = (type) => ({ ...buttonStyles.base, ...buttonStyles[type] });

    return (
        <div style={{
            backgroundColor: colors.lightBackground,
            minHeight: '100vh',
            padding: '20px',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative',
            boxShadow: '0 0 20px rgba(0,0,0,0.05)'
        }}>
            {/* Audio elements */}
            <audio ref={remoteAudioRef} autoPlay />
            <audio ref={audioRef} />
            <audio ref={notificationSoundRef} src="/sounds/notification.mp3" preload="auto" />

            {/* Navigation Options Modal */}
            {showNavigationOptions && detailedOrder && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={{ 
                            color: colors.primary, 
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            Navigate to {navigationDestination === 'chef' ? 'Chef' : 'Customer'}
                        </h2>
                        
                        <div style={{ 
                            backgroundColor: colors.lightBackground, 
                            padding: '15px', 
                            borderRadius: '10px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <p style={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                color: colors.darkText,
                                marginBottom: '5px'
                            }}>
                                Estimated Time: 
                            </p>
                            <p style={{ 
                                fontSize: '24px', 
                                color: colors.primary,
                                margin: 0
                            }}>
                                {estimatedTime}
                            </p>
                        </div>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '15px',
                            marginBottom: '25px'
                        }}>
                            <button 
                                onClick={() => openNavigation('google')}
                                style={{ 
                                    ...getButtonStyle('info'),
                                    padding: '15px',
                                    flexDirection: 'column'
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>🗺️</span>
                                Google Maps
                            </button>
                            <button 
                                onClick={() => openNavigation('waze')}
                                style={{ 
                                    ...getButtonStyle('accent'),
                                    padding: '15px',
                                    flexDirection: 'column'
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>🚗</span>
                                Waze
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowNavigationOptions(false)}
                            style={{ ...getButtonStyle('outline'), width: '100%' }}
                        >
                            Cancel Navigation
                        </button>
                    </div>
                </div>
            )}

            {/* Order Accepted Success Modal */}
            {showOrderAcceptedModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                        <h3 style={{ color: colors.darkText, marginTop: '25px', fontSize: '24px' }}>Order Accepted!</h3>
                        <p style={{ color: colors.placeholderText, marginBottom: '25px' }}>You've successfully taken order <strong style={{color: colors.primary}}>{selectedOrder?.id}</strong>.</p>
                        <button
                            onClick={() => setShowOrderAcceptedModal(false)}
                            style={{ ...getButtonStyle('primary'), width: '100%', maxWidth: '200px' }}
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            {/* Start Delivery Confirmation Modal */}
            {showStartDeliveryConfirmationModal && selectedOrder && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ color: colors.darkText, fontSize: '24px', marginBottom: '15px' }}>Confirm Delivery Start?</h3>
                        <p style={{ color: colors.placeholderText, marginBottom: '25px', textAlign: 'center' }}>
                            Are you sure you want to mark order <strong style={{color: colors.primary}}>{selectedOrder.id}</strong> as `OUT FOR DELIVERY`?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '15px', width: '100%' }}>
                            <button
                                onClick={() => setShowStartDeliveryConfirmationModal(false)}
                                style={{ ...getButtonStyle('outline'), flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStartDelivery}
                                style={{ ...getButtonStyle('primary'), flex: 1 }}
                            >
                                Yes, Start Delivery
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderDetailsModal && detailedOrder && (
                <div style={modalOverlayStyle}>
                    <div style={{
                        ...modalContentStyle,
                        maxWidth: '90%',
                        width: '500px',
                        textAlign: 'left',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{
                            color: colors.primary,
                            fontSize: '24px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            Order #{detailedOrder.id} Details
                        </h2>
                        
                        <div style={{ marginBottom: '25px' }}>
                            <h3 style={{ color: colors.primary, fontSize: '18px', marginBottom: '10px' }}>
                                <span role="img" aria-label="chef">👨‍🍳</span> Chef Information
                            </h3>
                            <div style={{ 
                                backgroundColor: colors.chefCard, 
                                padding: '15px', 
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <p style={orderDetailStyle}>
                                    <strong>Name:</strong> {detailedOrder.chef.name}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Speciality:</strong> {detailedOrder.chef.speciality}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Rating:</strong> {detailedOrder.chef.rating} ⭐
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Location:</strong> {detailedOrder.chef.location}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Phone:</strong> {detailedOrder.chef.phone}
                                </p>
                            </div>
                            
                            <h3 style={{ color: colors.primary, fontSize: '18px', marginBottom: '10px' }}>
                                <span role="img" aria-label="food">🍲</span> Food Information
                            </h3>
                            <div style={{ 
                                backgroundColor: colors.lightBackground, 
                                padding: '15px', 
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <p style={orderDetailStyle}>
                                    <strong>Item:</strong> {detailedOrder.food.title}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Description:</strong> {detailedOrder.food.description}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Price:</strong> Ksh {detailedOrder.food.price.toFixed(2)}
                                </p>
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Images:</strong>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        {detailedOrder.food.images.map((img, index) => (
                                            <img 
                                                key={index} 
                                                src={img} 
                                                alt={`Food ${index}`} 
                                                style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <h3 style={{ color: colors.primary, fontSize: '18px', marginBottom: '10px' }}>
                                <span role="img" aria-label="customer">👤</span> Customer Information
                            </h3>
                            <div style={{ 
                                backgroundColor: colors.riderCard, 
                                padding: '15px', 
                                borderRadius: '10px',
                                marginBottom: '15px'
                            }}>
                                <p style={orderDetailStyle}>
                                    <strong>Name:</strong> {detailedOrder.customer.name}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Delivery Address:</strong> {detailedOrder.deliveryAddress}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Phone:</strong> {detailedOrder.customer.phone}
                                </p>
                            </div>
                            
                            <h3 style={{ color: colors.primary, fontSize: '18px', marginBottom: '10px' }}>
                                <span role="img" aria-label="order">📦</span> Order Information
                            </h3>
                            <div style={{ 
                                backgroundColor: colors.cardBackground, 
                                padding: '15px', 
                                borderRadius: '10px',
                                borderLeft: `3px solid ${colors.primary}`
                            }}>
                                <p style={orderDetailStyle}>
                                    <strong>Status:</strong> 
                                    <span style={{
                                        backgroundColor: 
                                            detailedOrder.status === 'READY' ? colors.info + '30' :
                                            detailedOrder.status === 'ASSIGNED' ? colors.warning + '30' :
                                            detailedOrder.status === 'OUT_FOR_DELIVERY' ? colors.accent + '30' :
                                            colors.success + '30',
                                        color: 
                                            detailedOrder.status === 'READY' ? colors.info :
                                            detailedOrder.status === 'ASSIGNED' ? colors.warning :
                                            detailedOrder.status === 'OUT_FOR_DELIVERY' ? colors.accent :
                                            colors.success,
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        marginLeft: '10px',
                                        fontSize: '14px'
                                    }}>
                                        {detailedOrder.status.replace(/_/g, ' ')}
                                    </span>
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Created:</strong> {formatDistanceToNow(parseISO(detailedOrder.createdAt), { addSuffix: true })}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Estimated Delivery:</strong> {detailedOrder.estimatedDeliveryTime || 'N/A'}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Payment Method:</strong> {detailedOrder.paymentMethod}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Total Price:</strong> Ksh {detailedOrder.totalPrice.toFixed(2)}
                                </p>
                                <p style={orderDetailStyle}>
                                    <strong>Your Earnings:</strong> Ksh {detailedOrder.riderPay.toFixed(2)}
                                </p>
                                {detailedOrder.notes && (
                                    <p style={orderDetailStyle}>
                                        <strong>Special Notes:</strong> {detailedOrder.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Delivery Verification Section */}
                        {detailedOrder.status === 'OUT_FOR_DELIVERY' && (
                            <div style={{ marginTop: '25px' }}>
                                <h3 style={{ 
                                    color: colors.primary, 
                                    fontSize: '18px', 
                                    marginBottom: '15px',
                                    textAlign: 'center'
                                }}>
                                    Delivery Verification
                                </h3>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    gap: '15px',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap'
                                }}>
                                    <button 
                                        onClick={() => showNavigationModal('chef', detailedOrder)}
                                        style={{ 
                                            ...getButtonStyle('info'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            flex: '1 1 45%'
                                        }}
                                    >
                                        <span role="img" aria-label="navigate to chef">👨‍🍳</span> To Chef
                                    </button>
                                    <button 
                                        onClick={() => showNavigationModal('customer', detailedOrder)}
                                        style={{ 
                                            ...getButtonStyle('accent'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            flex: '1 1 45%'
                                        }}
                                    >
                                        <span role="img" aria-label="navigate to customer">👤</span> To Customer
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* OTP Input Section - Always visible for delivery confirmation */}
                        <div style={{ 
                            marginTop: '20px',
                            padding: '20px',
                            backgroundColor: colors.lightBackground,
                            borderRadius: '10px',
                            border: `1px solid ${colors.borderColor}`
                        }}>
                            <h3 style={{ 
                                color: colors.primary, 
                                fontSize: '18px', 
                                marginBottom: '15px',
                                textAlign: 'center'
                            }}>
                                Confirm Delivery
                            </h3>
                            
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP from customer"
                                    value={otpInput}
                                    onChange={(e) => {
                                        setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setOtpVerificationError('');
                                    }}
                                    style={{
                                        padding: '15px',
                                        borderRadius: '10px',
                                        border: `2px solid ${otpVerificationError ? colors.error : colors.borderColor}`,
                                        fontSize: '16px',
                                        width: '100%',
                                        textAlign: 'center',
                                        letterSpacing: '8px',
                                        fontWeight: 'bold',
                                        backgroundColor: colors.cardBackground
                                    }}
                                    maxLength={6}
                                />
                                
                                {otpVerificationError && (
                                    <p style={{ 
                                        color: colors.error, 
                                        textAlign: 'center',
                                        margin: '5px 0'
                                    }}>
                                        {otpVerificationError}
                                    </p>
                                )}
                                
                                <button 
                                    onClick={verifyDeliveryOTP}
                                    disabled={otpInput.length !== 6}
                                    style={{ 
                                        ...getButtonStyle('success'),
                                        width: '100%',
                                        padding: '15px',
                                        opacity: otpInput.length !== 6 ? 0.7 : 1,
                                        fontSize: '18px'
                                    }}
                                >
                                    <span role="img" aria-label="verify">✅</span> Verify & Complete Delivery
                                </button>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <button
                                onClick={() => setShowOrderDetailsModal(false)}
                                style={{ ...getButtonStyle('primary'), width: '100%', maxWidth: '200px' }}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Success Modal */}
            {showDeliverySuccessModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                        <h3 style={{ color: colors.darkText, marginTop: '25px', fontSize: '24px' }}>
                            Delivery Completed!
                        </h3>
                        <p style={{ 
                            color: colors.placeholderText, 
                            marginBottom: '25px',
                            textAlign: 'center',
                            fontSize: '18px',
                            lineHeight: '1.5'
                        }}>
                            <span style={{ color: colors.success, fontWeight: 'bold' }}>Congrats!</span> You've successfully delivered the order to the customer.
                        </p>
                        <button
                            onClick={() => setShowDeliverySuccessModal(false)}
                            style={{ ...getButtonStyle('success'), width: '100%', maxWidth: '200px', padding: '12px' }}
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            {/* Dashboard Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: colors.darkText, fontSize: '28px', margin: 0 }}>Jikoni Rider</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: colors.darkText, fontWeight: '500' }}>{profile.name}</span>
                    <img src={profile.photo} alt="Rider" style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${colors.primary}` }} />
                </div>
            </div>

            {/* Availability Toggle */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: colors.cardBackground, padding: '15px', borderRadius: '15px',
                marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <span style={{ color: colors.darkText, fontWeight: '600' }}>
                    Status: {profile.available ? <span style={{ color: colors.success }}>Online</span> : <span style={{ color: colors.error }}>Offline</span>}
                </span>
                <button
                    onClick={toggleAvailability}
                    style={{
                        ...getButtonStyle('base'),
                        backgroundColor: profile.available ? colors.error : colors.secondary,
                        color: 'white',
                        padding: '8px 18px',
                        fontSize: '14px'
                    }}
                >
                    Go {profile.available ? 'Offline' : 'Online'}
                </button>
            </div>

            {/* Call Status Display */}
            <div style={{
                backgroundColor: colors.info + '15',
                color: colors.info,
                padding: '10px 15px',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: '500',
                border: `1px solid ${colors.info}`
            }}>
                Call Status: <span style={{ fontWeight: 'bold' }}>{callStatus.toUpperCase()}</span> - {message}
            </div>


            {/* Earnings Summary */}
            <h2 style={{ color: colors.darkText, fontSize: '22px', marginBottom: '15px' }}>Your Earnings</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                marginBottom: '30px'
            }}>
                <div style={summaryCardStyle}>
                    <p style={summaryCardLabelStyle}>Balance</p>
                    <p style={summaryCardValueStyle}>Ksh {earnings.balance.toFixed(2)}</p>
                </div>
                <div style={summaryCardStyle}>
                    <p style={summaryCardLabelStyle}>Total Deliveries</p>
                    <p style={summaryCardValueStyle}>{earnings.totalDeliveries}</p>
                </div>
                <div style={summaryCardStyle}>
                    <p style={summaryCardLabelStyle}>Weekly Earnings</p>
                    <p style={summaryCardValueStyle}>Ksh {earnings.weeklyEarnings.toFixed(2)}</p>
                </div>
            </div>

            {/* Available Orders Section */}
            <h2 style={{ color: colors.darkText, fontSize: '22px', marginBottom: '15px' }}>Available Orders ({availableOrders.length})</h2>
            <div style={{ marginBottom: '30px', minHeight: '100px' }}>
                {availableOrders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: colors.placeholderText, padding: '20px', backgroundColor: colors.cardBackground, borderRadius: '15px' }}>
                        No new orders available at the moment.
                    </p>
                ) : (
                    availableOrders.map(order => (
                        <div key={order.id} style={orderCardStyle}>
                            <div style={orderHeaderStyle}>
                                <h3 style={orderTitleStyle}>Order #{order.id}</h3>
                                <span style={orderPayoutStyle}>Ksh {order.riderPay?.toFixed(2) || 'N/A'}</span>
                            </div>
                            <p style={orderDetailStyle}>
                                <span role="img" aria-label="customer">👤</span> {order.customer.name}
                            </p>
                            <p style={orderDetailStyle}>
                                <span role="img" aria-label="location">📍</span> {order.deliveryAddress}
                            </p>
                            <div style={orderBadgeStyle(colors.info)}>
                                <span role="img" aria-label="time">⏱️</span> Estimated: {order.estimatedDeliveryTime || 'N/A'}
                            </div>
                            <div style={orderActionsStyle}>
                                <button
                                    onClick={() => handleAcceptOrder(order.id)}
                                    style={getButtonStyle('primary')}
                                >
                                    Accept Order
                                </button>
                                <button
                                    onClick={() => declineOrder(order.id)}
                                    style={getButtonStyle('outline')}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Active Orders Section */}
            <h2 style={{ color: colors.darkText, fontSize: '22px', marginBottom: '15px' }}>
                Active Orders ({activeOrders.length})
            </h2>
            <div style={{ minHeight: '100px' }}>
                {activeOrders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: colors.placeholderText, padding: '20px', backgroundColor: colors.cardBackground, borderRadius: '15px' }}>
                        No active deliveries.
                    </p>
                ) : (
                    activeOrders.map(order => (
                        <div key={order.id} style={orderCardStyle}>
                            <div style={orderHeaderStyle}>
                                <h3 style={orderTitleStyle}>Order #{order.id}</h3>
                                <span style={orderPayoutStyle}>Ksh {order.riderPay?.toFixed(2) || 'N/A'}</span>
                            </div>
                            <p style={orderDetailStyle}>
                                <span role="img" aria-label="customer">👤</span> {order.customer.name}
                            </p>
                            <p style={orderDetailStyle}>
                                <span role="img" aria-label="location">📍</span> {order.deliveryAddress}
                            </p>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px'}}>
                                <span style={orderBadgeStyle(colors.info)}>
                                    <span role="img" aria-label="time">⏱️</span> Estimated: {order.estimatedDeliveryTime || 'N/A'}
                                </span>
                                <span style={orderBadgeStyle(order.status === 'OUT_FOR_DELIVERY' ? colors.success : colors.warning)}>
                                    Status: {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            {/* View Details Button */}
                            <div style={{ marginTop: '15px' }}>
                                <button
                                    onClick={() => openOrderDetails(order)}
                                    style={{ 
                                        ...getButtonStyle('outline'),
                                        width: '100%',
                                        padding: '10px',
                                        fontSize: '15px'
                                    }}
                                >
                                    <span role="img" aria-label="details">🔍</span> View Full Order Details
                                </button>
                            </div>

                            <div style={{ ...orderActionsStyle, marginTop: '20px' }}>
                                {order.customer.phone && (
                                    <a href={`tel:${order.customer.phone}`} style={{ textDecoration: 'none' }}>
                                        <button style={{ ...getButtonStyle('accent'), padding: '10px 15px' }}>
                                            <span role="img" aria-label="call customer">📞</span> Call Customer
                                        </button>
                                    </a>
                                )}
                                {order.chef.phone && (
                                    <a href={`tel:${order.chef.phone}`} style={{ textDecoration: 'none' }}>
                                        <button style={{ ...getButtonStyle('accent'), padding: '10px 15px' }}>
                                            <span role="img" aria-label="call chef">📞</span> Call Chef
                                        </button>
                                    </a>
                                )}
                                {myPeerId && order.customer.peerId && order.customer.peerId !== myPeerId && (
                                    <button
                                        onClick={() => startPeerCall(order.customer.peerId, order.customer.name, 'Customer', order.customer.phone)}
                                        disabled={callStatus !== 'idle'}
                                        style={{ ...getButtonStyle('info'), padding: '10px 15px' }}
                                    >
                                        <span role="img" aria-label="video call">🌐</span> App Call Customer
                                    </button>
                                )}
                                {myPeerId && order.chef.peerId && order.chef.peerId !== myPeerId && (
                                    <button
                                        onClick={() => startPeerCall(order.chef.peerId, order.chef.name, 'Chef', order.chef.phone)}
                                        disabled={callStatus !== 'idle'}
                                        style={{ ...getButtonStyle('info'), padding: '10px 15px' }}
                                    >
                                        <span role="img" aria-label="video call">🌐</span> App Call Chef
                                    </button>
                                )}
                            </div>

                            <div style={{ ...orderActionsStyle, marginTop: '10px', flexDirection: 'column', gap: '10px' }}>
                                <button
                                    onClick={() => showNavigationModal('chef', order)}
                                    style={getButtonStyle('info')}
                                >
                                    <span role="img" aria-label="navigate to chef">👨‍🍳</span> Navigate to Chef
                                </button>
                                <button
                                    onClick={() => showNavigationModal('customer', order)}
                                    style={getButtonStyle('info')}
                                >
                                    <span role="img" aria-label="navigate to customer">👤</span> Navigate to Customer
                                </button>
                                {order.status === 'ASSIGNED' && (
                                    <button
                                        onClick={() => handleStartDeliveryClick(order)}
                                        style={getButtonStyle('primary')}
                                    >
                                        <span role="img" aria-label="start delivery">📦</span> Start Delivery
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Custom Keyframe Styles */}
            <style>
                {`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                    100% { transform: scale(1); }
                }

                .checkmark {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: #fff;
                    stroke-miterlimit: 10;
                    margin: 0 auto;
                    box-shadow: inset 0px 0px 0px ${colors.success};
                    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                }

                .checkmark__circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 2;
                    stroke-miterlimit: 10;
                    stroke: ${colors.success};
                    fill: none;
                    animation: stroke 0.6s cubic-bezier(0.650, 0.000, 0.450, 1.000) forwards;
                }

                .checkmark__check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: stroke 0.3s cubic-bezier(0.650, 0.000, 0.450, 1.000) 0.8s forwards;
                }

                @keyframes stroke {
                    100% {
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes fill {
                    100% {
                        box-shadow: inset 0px 0px 0px 30px ${colors.success};
                    }
                }

                @keyframes scale {
                    0%, 100% {
                        transform: none;
                    }
                    50% {
                        transform: scale3d(1.1, 1.1, 1);
                    }
                }
                `}
            </style>

        </div>
    );
};

export default RiderDashboard;

// --- Inline Styles for Reusability ---
const summaryCardStyle = {
    backgroundColor: colors.cardBackground,
    padding: '15px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
};

const summaryCardLabelStyle = {
    color: colors.placeholderText,
    fontSize: '14px',
    marginBottom: '5px'
};

const summaryCardValueStyle = {
    color: colors.darkText,
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0
};

const orderCardStyle = {
    backgroundColor: colors.cardBackground,
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    borderLeft: `5px solid ${colors.primary}`,
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)'
    }
};

const orderHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
};

const orderTitleStyle = {
    color: colors.darkText,
    fontSize: '20px',
    fontWeight: '700',
    margin: 0
};

const orderPayoutStyle = {
    backgroundColor: colors.secondary,
    color: 'white',
    padding: '5px 10px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '15px'
};

const orderDetailStyle = {
    color: colors.darkText,
    fontSize: '15px',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const orderActionsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '15px'
};

const orderBadgeStyle = (backgroundColor) => ({
    backgroundColor: backgroundColor + '20',
    color: backgroundColor,
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    marginRight: '8px',
    marginBottom: '5px'
});

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    backgroundColor: colors.cardBackground,
    padding: '35px',
    borderRadius: '20px',
    textAlign: 'center',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
    animation: 'fadeInScale 0.3s ease-out'
};