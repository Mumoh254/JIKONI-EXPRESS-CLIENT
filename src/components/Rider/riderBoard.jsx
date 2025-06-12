import React, { useState, useEffect, useRef, useCallback } from 'react';


import io from 'socket.io-client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Peer from 'peerjs'; // Import PeerJS

// --- Jikoni Express Color Palette ---
const colors = {
    primary: '#FF4532', // Jikoni Red
    secondary: '#00C853', // Jikoni Green (used for success states)
    darkText: '#1A202C', // Dark text for headings and main content
    lightBackground: '#F0F2F5', // Light background for the page
    cardBackground: '#FFFFFF', // White for cards and modals
    borderColor: '#D1D9E6', // Light border for inputs and separators
    error: '#EF4444', // Red for errors and destructive actions
    placeholderText: '#A0AEC0', // Muted text for placeholders
    buttonHover: '#E6392B', // Darker red on button hover
    disabledButton: '#CBD5E1', // Gray for disabled buttons

    // Derived/adapted colors for specific UI elements to maintain a sleek and professional look
    success: '#00C853', // Directly using secondary for success states
    warning: '#FFC107', // A standard yellow for warning, providing clear visual cues
    info: '#2196F3', // A standard blue for informational states
    accent: '#4361EE', // Keeping a distinct accent blue for call buttons for strong contrast and action
    chefCard: '#FFF8F0', // A very light, warm tint for chef details, complementing primary
    riderCard: '#F0F5FF', // A very light, cool tint for rider/customer details, complementing the overall palette
};

const RiderDashboard = () => {
    // State initialization
    const [riderId, setRiderId] = useState('cmbnnx2kv0000dk2ag7wrm4au');
    const [activeOrders, setActiveOrders] = useState([]); // Orders assigned or in-transit
    const [availableOrders, setAvailableOrders] = useState([]); // New orders waiting for acceptance
    const [selectedOrder, setSelectedOrder] = useState(null); // Selected order for detail modal
    const [otpInput, setOtpInput] = useState('');
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

    // --- PeerJS States & Refs ---
    const [myPeerId, setMyPeerId] = useState(null);
    const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'connecting', 'ringing', 'in-call', 'error'
    const [message, setMessage] = useState('Welcome!');
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Placeholder for speaker control
    const [incomingCallData, setIncomingCallData] = useState(null); // { call, fromPeerId, contactName, contactType }
    const [currentContact, setCurrentContact] = useState({ name: '', type: '', phoneNumber: '', peerId: '' }); // The person you are currently calling or are in a call with

    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const currentCallRef = useRef(null); // Stores the active PeerJS media connection


    const audioRef = useRef(null); // For general audio playback (e.g., ringing)
    const notificationSoundRef = useRef(null); // For new order notification sound
    const socketRef = useRef(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deliveryDetails, setDeliveryDetails] = useState(null);

    // Function to format the order data received from API/Socket
    const formatOrder = (order) => ({
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        assignedAt: order.assignedAt,
        deliveryAddress: order.deliveryAddress,
        customer: {
            name: order.user?.Name || 'Customer',
            phone: order.user?.PhoneNumber || 'N/A',
            address: order.deliveryAddress,
            peerId: order.user?.peerId || null // Assuming user has a peerId
        },
        chef: {
            id: order.chef?.id,
            name: order.chef?.user?.Name || 'Chef',
            phone: order.chef?.user?.PhoneNumber || 'N/A',
            location: order.chef?.location,
            rating: order.chef?.rating || 4.5,
            speciality: order.chef?.speciality || 'Grilled Meats',
            peerId: order.chef?.peerId || null // Assuming chef has a peerId
        },
        food: {
            id: order.foodListing?.id,
            title: order.foodListing?.title || 'Food Item',
            description: order.foodListing?.description || 'Delicious meal prepared with care',
            price: order.foodListing?.price || 0,
            images: order.foodListing?.photoUrls || []
        },
        payment: {
            method: order.paymentMethod,
            amount: order.totalPrice,
            status: 'Paid'
        },
        otp: order.otpCode || '123456',
        coordinates: {
            pickup: [order.chef?.latitude || -1.3007, order.chef?.longitude || 36.8782],
            dropoff: [-1.2921, 36.8219]
        },
        riderId: order.riderId || null,
        riderPeerId: order.rider?.peerId || null // Assuming rider has a peerId in the backend
    });

    // --- PeerJS Call Handling Functions ---

    /**
     * Cleans up the current call and resets states.
     * This is a utility function used by other call-ending functions.
     */
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

        setCallStatus('idle');
        setMessage(statusMessage);
        setIsMuted(false);
        setIncomingCallData(null);
        setCurrentContact({ name: '', type: '', phoneNumber: '', peerId: '' });
    }, []);

    /**
     * Handles incoming stream (remote audio) from a PeerJS call.
     */
    const handleStream = useCallback((stream) => {
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.onloadedmetadata = () => {
                remoteAudioRef.current.play().catch(e => console.error("Audio play failed:", e));
            };
        }
        setCallStatus('in-call');
        setMessage(`Connected with ${currentContact.name || currentContact.peerId?.substring(0, 8)}`);
        console.log('Remote stream received.');
    }, [currentContact.name, currentContact.peerId]);

    /**
     * Initiates an outgoing PeerJS call.
     */
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
        if (callStatus !== 'idle' && callStatus !== 'ended') {
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

            console.log('Call initiated to:', targetPeerId);
        } catch (error) {
            console.error('Failed to get local stream or initiate call:', error);
            setMessage(`Microphone access needed to make calls. Please allow access and try again.`);
            setCallStatus('error');
            cleanupCall();
        }
    };

    /**
     * Answers an incoming PeerJS call.
     */
    const answerPeerCall = async () => {
        if (!incomingCallData) return;

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
            console.log('Call answered.');
        } catch (error) {
            console.error('Failed to get local stream or answer call:', error);
            setMessage(`Microphone access needed to answer calls. Please allow access and try again.`);
            setCallStatus('error');
            cleanupCall();
        }
    };

    /**
     * Rejects an incoming call or cancels an outgoing call attempt.
     */
    const rejectPeerCall = () => {
        if (incomingCallData) {
            setMessage(`Call from ${incomingCallData.contactName || incomingCallData.fromPeerId.substring(0, 8)} rejected.`);
            incomingCallData.call.close();
            setIncomingCallData(null);
            setCallStatus('idle');
            setCurrentContact({ name: '', type: '', phoneNumber: '', peerId: '' });
        } else if (callStatus === 'connecting' && currentCallRef.current) {
            cleanupCall('Call cancelled.');
        }
    };

    /**
     * Ends the current active PeerJS call.
     */
    const endPeerCall = () => {
        cleanupCall('Call ended.');
        console.log('Call ended by user.');
    };

    /**
     * Toggles the mute status of the local microphone for the PeerJS call.
     */
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

    /**
     * Toggles the conceptual "speaker" mode. (Actual browser control is limited)
     */
    const toggleSpeaker = () => {
        const newState = !isSpeakerOn;
        setIsSpeakerOn(newState);
        setMessage(newState ? 'Loudspeaker ON.' : 'Loudspeaker OFF (using default output).');
        // In a real application, you might try to set sinkId on remoteAudioRef.current
        // remoteAudioRef.current.setSinkId('speakerId') if supported by browser/device
    };


    // --- General Dashboard Effects & Functions ---

    useEffect(() => {
        // Set rider ID from localStorage or use default
        const storedRiderId = localStorage.getItem('riderId') || 'cmbnnx2kv0000dk2ag7wrm4au';
        setRiderId(storedRiderId);
        localStorage.setItem('riderId', storedRiderId);

        // --- PeerJS Initialization ---
        if (!peerRef.current) {
            setMessage('Initializing secure connection...');
            try {
                // Initialize PeerJS client instance. The ID should be unique,
                // and consistent for the rider for signaling.
                const peer = new Peer(storedRiderId, {
                    host: 'localhost', // Your PeerJS server host
                    port: 9000,        // Your PeerJS server port
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
                    console.log('My Peer ID:', id);
                    if (!localStorage.getItem('jikoniRiderPeerId') || localStorage.getItem('jikoniRiderPeerId') !== id) {
                        localStorage.setItem('jikoniRiderPeerId', id);
                        console.log('Peer ID saved to localStorage:', id);
                    }
                });

                // PeerJS listener for incoming calls
                peer.on('call', call => {
                    console.log('Incoming call from:', call.peer);
                    // Determine who is calling based on the order data if possible,
                    // or just use the peer ID. For now, we'll just use the ID.
                    // In a real app, you'd match call.peer to an existing order's customer/chef peerId
                    const callingPartyType = call.peer.includes('chef') ? 'Chef' : (call.peer.includes('user') ? 'Customer' : 'Unknown');
                    const callingPartyName = callingPartyType !== 'Unknown' ? `${callingPartyType} ${call.peer.substring(0, 8)}` : call.peer;

                    if (callStatus === 'idle' || callStatus === 'ended') {
                        setIncomingCallData({
                            call,
                            fromPeerId: call.peer,
                            contactName: callingPartyName,
                            contactType: callingPartyType,
                            // phoneNumber: 'N/A' // You might fetch this from order details
                        });
                        setCallStatus('ringing');
                        setMessage(`Incoming call from ${callingPartyName}...`);
                        if (audioRef.current) {
                            audioRef.current.loop = true;
                            audioRef.current.src = '/sounds/ringing.mp3'; // Ensure you have this sound
                            audioRef.current.play().catch(e => console.error("Ringing sound play failed:", e));
                        }
                    } else {
                        console.log(`Rejecting incoming call from ${call.peer} as current status is ${callStatus}`);
                        call.close(); // Automatically reject if busy
                    }
                });

                peer.on('error', err => {
                    console.error('PeerJS Error:', err);
                    setMessage(`Connection Error: ${err.message}. Please check your network and PeerJS server setup.`);
                    setCallStatus('error');
                    cleanupCall();
                });

                peerRef.current = peer;

                // Cleanup function for PeerJS
                return () => {
                    if (peerRef.current) {
                        peerRef.current.destroy();
                        peerRef.current = null;
                        console.log('PeerJS instance destroyed.');
                    }
                    cleanupCall();
                };
            } catch (error) {
                console.error('Failed to initialize PeerJS:', error);
                setMessage(`Failed to connect to call service: ${error.message}`);
                setCallStatus('error');
            }
        }
    }, [cleanupCall, riderId, callStatus, handleStream]);


    // Fetch orders from the API and Socket.IO setup
    useEffect(() => {
        // Fetch orders from the API
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:8000/apiV1/smartcity-ke/orders');
                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }
                const data = await response.json();
                const formattedOrders = data.orders.map(formatOrder);

                // Separate orders into available (new/pending) and active (assigned/in-transit)
                setAvailableOrders(formattedOrders.filter(order => order.status === 'preparing' || order.status === 'new'));
                setActiveOrders(formattedOrders.filter(order => order.status === 'assigned' || order.status === 'in-transit'));
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
        };

        fetchOrders();

        // Setup socket connection
        if (!socketRef.current) {
            socketRef.current = io('https://neuro-apps-api-express-js-production-redy.onrender.com', {
                query: { riderId: riderId }
            });

            // Socket event listeners
            socketRef.current.on('order:new', (data) => {
                setAvailableOrders(prev => [formatOrder(data.order), ...prev]);
                if (notificationSoundRef.current) {
                    notificationSoundRef.current.play();
                }
            });

            socketRef.current.on('order:assigned', (data) => {
                const assignedOrder = formatOrder(data.order);
                if (assignedOrder.riderId === riderId) {
                    setActiveOrders(prev => [assignedOrder, ...prev.filter(o => o.id !== assignedOrder.id)]);
                    setAvailableOrders(prev => prev.filter(o => o.id !== assignedOrder.id)); // Remove from available
                } else {
                    setAvailableOrders(prev => prev.filter(o => o.id !== assignedOrder.id));
                }
                if (notificationSoundRef.current) {
                    notificationSoundRef.current.play();
                }
            });

            socketRef.current.on('order:updated', (data) => {
                setActiveOrders(prev => prev.map(order =>
                    order.id === data.order.id ? formatOrder(data.order) : order
                ));
                setAvailableOrders(prev => prev.map(order =>
                    order.id === data.order.id ? formatOrder(data.order) : order
                ));
            });
        }

        // Cleanup socket connection
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [riderId]);

    const acceptOrder = (orderId) => {
        const orderToAccept = availableOrders.find(order => order.id === orderId);
        if (orderToAccept) {
            const updatedOrder = { ...orderToAccept, status: 'assigned', assignedAt: new Date().toISOString(), riderId: riderId };
            setActiveOrders(prev => [updatedOrder, ...prev]);
            setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
            setSelectedOrder(updatedOrder);

            socketRef.current.emit('order:accept', { orderId: orderId, riderId: riderId });
        }
    };

    const declineOrder = (orderId) => {
        setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
        socketRef.current.emit('order:decline', { orderId: orderId, riderId: riderId });
    };

    const startDelivery = (id) => {
        setActiveOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status: 'in-transit' } : order
        ));
        socketRef.current.emit('order:status:update', { orderId: id, status: 'in-transit', riderId });
    };

    const completeDelivery = () => {
        if (!selectedOrder) return;

        if (otpInput !== selectedOrder.otp) {
            alert("Incorrect OTP. Please try again.");
            return;
        }

        const deliveryTime = Math.floor(Math.random() * 15) + 15;
        const riderFee = Math.floor(selectedOrder.food.price * 0.15) + 50;

        setDeliveryDetails({
            orderId: selectedOrder.id,
            deliveryTime,
            riderFee,
            customer: selectedOrder.customer.name,
            food: selectedOrder.food.title
        });

        setShowSuccessModal(true);
        setActiveOrders(prev => prev.map(order =>
            order.id === selectedOrder.id ? { ...order, status: 'delivered' } : order
        ));
        socketRef.current.emit('order:status:update', { orderId: selectedOrder.id, status: 'delivered', riderId });
        setSelectedOrder(null);
        setOtpInput('');
    };

    const openNavigation = (order, app = 'google') => {
        const origin = `${order.coordinates.pickup[0]},${order.coordinates.pickup[1]}`;
        const destination = `${order.coordinates.dropoff[0]},${order.coordinates.dropoff[1]}`;

        const urls = {
            google: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
            waze: `https://www.waze.com/ul?ll=${destination}&navigate=yes`
        };

        window.open(urls[app], '_blank');
    };

    const toggleAvailability = () => {
        setProfile(prev => ({ ...prev, available: !prev.available }));
        socketRef.current.emit('rider:availability:update', { riderId, available: !profile.available });
    };

    const getTimeSinceAssignment = (assignedAt) => {
        if (!assignedAt) return 'Just now';
        return formatDistanceToNow(parseISO(assignedAt), { addSuffix: true });
    };

    // Button styles - updated to use the new color palette and more modern look
    const buttonStyles = {
        base: {
            padding: '12px 20px',
            borderRadius: '10px', // Slightly more rounded
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Center content
            gap: '8px',
            transition: 'all 0.2s ease-in-out', // Smooth transition
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Subtle shadow
        },
        primary: {
            backgroundColor: colors.primary,
            color: 'white',
            '&:hover': {
                backgroundColor: colors.buttonHover, // Use defined buttonHover
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
                backgroundColor: '#00B080', // Darker green for hover
            }
        },
        accent: {
            backgroundColor: colors.accent, // Using the accent blue
            color: 'white',
            '&:hover': {
                backgroundColor: '#3A54D0', // Darker accent for hover
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
        success: { // Added success button style
            backgroundColor: colors.success,
            color: 'white',
            '&:hover': {
                backgroundColor: '#00A040', // Darker green for hover
            }
        }
    };

    return (
        <div style={{
            backgroundColor: colors.lightBackground,
            minHeight: '100vh',
            padding: '20px',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative',
            boxShadow: '0 0 20px rgba(0,0,0,0.05)' // Overall app shadow for a sleek look
        }}>
            {/* Audio elements for notifications and calls */}
            <audio ref={remoteAudioRef} autoPlay /> {/* For remote peer's audio */}
            <audio ref={audioRef} /> {/* For local ringing/notification sounds */}
            <audio ref={notificationSoundRef} src="/sounds/notification.mp3" preload="auto" />

            {/* PeerJS Call Modal */}
            {(callStatus === 'connecting' || callStatus === 'in-call' || callStatus === 'ringing') && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: colors.cardBackground,
                        padding: '30px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        width: '85%',
                        maxWidth: '400px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                        <h2 style={{ color: colors.darkText, marginBottom: '20px', fontSize: '24px' }}>
                            {callStatus === 'ringing' ? 'Incoming Call' : `Call with ${currentContact.type}`}
                        </h2>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary, marginBottom: '30px' }}>
                            {currentContact.name || currentContact.peerId?.substring(0, 8)}
                        </p>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            backgroundColor: colors.primary + '20',
                            borderRadius: '50%',
                            margin: '0 auto 30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '48px', color: colors.primary }}>📞</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
                            {callStatus === 'in-call' && (
                                <>
                                    <button
                                        onClick={toggleMute}
                                        style={{
                                            ...buttonStyles.base,
                                            backgroundColor: isMuted ? colors.accent : colors.lightBackground,
                                            color: isMuted ? 'white' : colors.darkText,
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                            fontSize: '24px'
                                        }}
                                    >
                                        {isMuted ? '🔇' : '🎤'}
                                    </button>
                                    <button
                                        onClick={toggleSpeaker}
                                        style={{
                                            ...buttonStyles.base,
                                            backgroundColor: isSpeakerOn ? colors.accent : colors.lightBackground,
                                            color: isSpeakerOn ? 'white' : colors.darkText,
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                            fontSize: '24px'
                                        }}
                                    >
                                        {isSpeakerOn ? '🔊' : '🔈'}
                                    </button>
                                </>
                            )}
                            {callStatus === 'ringing' && (
                                <button
                                    onClick={answerPeerCall}
                                    style={{
                                        ...buttonStyles.base,
                                        ...buttonStyles.success,
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        fontSize: '36px'
                                    }}
                                >
                                    ✅
                                </button>
                            )}
                            <button
                                onClick={callStatus === 'ringing' ? rejectPeerCall : endPeerCall}
                                style={{
                                    ...buttonStyles.base,
                                    backgroundColor: colors.error,
                                    color: 'white',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    fontSize: '36px'
                                }}
                            >
                                📞
                            </button>
                        </div>
                        {callStatus === 'connecting' && <p style={{ color: colors.placeholderText, fontSize: '16px' }}>Connecting...</p>}
                    </div>
                </div>
            )}

            {/* Success Modal - Clean and celebratory design */}
            {showSuccessModal && deliveryDetails && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: colors.cardBackground,
                        padding: '30px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        width: '85%',
                        maxWidth: '400px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            backgroundColor: colors.success + '20',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '50px', color: colors.success }}>🎉</span>
                        </div>

                        <h2 style={{ color: colors.success, marginBottom: '15px', fontSize: '24px' }}>
                            Delivery Completed!
                        </h2>

                        <p style={{ fontSize: '18px', marginBottom: '25px', color: colors.darkText }}>
                            You delivered <strong>{deliveryDetails.food}</strong> to {deliveryDetails.customer} in {deliveryDetails.deliveryTime} minutes.
                        </p>

                        <div style={{
                            backgroundColor: colors.lightBackground,
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '25px'
                        }}>
                            <p style={{ margin: '5px 0', fontSize: '16px', color: colors.darkText }}>
                                <span style={{ color: colors.darkText, fontWeight: '500' }}>Order ID:</span> {deliveryDetails.orderId.substring(0, 8)}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>
                                Earned: KSH {deliveryDetails.riderFee.toFixed(2)}
                            </p>
                        </div>

                        <p style={{ fontSize: '16px', marginBottom: '25px', fontStyle: 'italic', color: colors.darkText, opacity: 0.8 }}>
                            "Great job! Your efficiency makes our customers happy. Keep up the excellent work!"
                        </p>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            style={{
                                ...buttonStyles.base,
                                ...buttonStyles.success,
                                width: '100%',
                                backgroundColor: colors.success
                            }}
                        >
                            Continue Delivering
                        </button>
                    </div>
                </div>
            )}

            {/* Header - Sleek and Professional for Jikoni Express */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '10px',
                borderBottom: `1px solid ${colors.borderColor}`,
                backgroundColor: colors.background,
                paddingTop: '12px',
                borderRadius: '10px',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                padding: '0 15px',
            }}>

                {/* Left Section: Greeting and Brand Name */}
                <div>
                    <h1 style={{
                        color: colors.darkText,
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: '700',
                        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                        letterSpacing: '0.5px'
                    }}>
                        Hello, {profile.name.split(' ')[0]}!
                    </h1>

                    {/* Display "Jikoni Express" Brand Name */}
                    <p style={{
                        color: colors.primary,
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                        marginTop: '5px',
                    }}>
                        Jikoni Express
                    </p>

                    <p style={{
                        color: profile.available ? colors.primary : colors.error,
                        marginTop: '4px',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                        <span style={{ fontSize: '16px' }}>●</span>
                        {profile.available ? 'Online' : 'Offline'}
                    </p>
                    {myPeerId && (
                        <p style={{ fontSize: '10px', color: colors.placeholderText, marginTop: '5px' }}>
                            My Peer ID: {myPeerId.substring(0, 8)}...
                        </p>
                    )}
                    {message && (
                        <p style={{ fontSize: '12px', color: (callStatus === 'error' ? colors.error : colors.darkText), marginTop: '5px' }}>
                            Status: {message}
                        </p>
                    )}
                </div>

                {/* Right Section: Profile Image & Availability Toggle */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={profile.photo}
                        alt="Profile"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            marginRight: '12px',
                            border: `3px solid ${profile.available ? colors.primary : colors.error}`,
                            objectFit: 'cover',
                            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                            transition: 'border 0.3s ease',
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            position: 'relative',
                            width: '48px',
                            height: '26px',
                            marginRight: '10px',
                        }}>
                            <input
                                type="checkbox"
                                checked={profile.available}
                                onChange={toggleAvailability}
                                style={{
                                    opacity: 0,
                                    width: 0,
                                    height: 0,
                                    position: 'absolute',
                                    cursor: 'pointer',
                                }}
                            />
                            <span style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: profile.available ? colors.primary : colors.disabledButton,
                                borderRadius: '50px',
                                transition: '0.3s ease-in-out',
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    height: '20px',
                                    width: '20px',
                                    left: '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    transition: '0.3s ease-in-out',
                                    transform: profile.available ? 'translateX(20px)' : 'translateX(0)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                }} />
                            </span>
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: colors.darkText,
                            fontWeight: '600',
                            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                        }}>
                            {profile.available ? 'Available' : 'Busy'}
                        </div>
                    </div>
                </div>
            </div>


            {/* Earnings Summary - Structured and clear */}
            <div style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '18px',
                padding: '25px',
                marginBottom: '25px',
                boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{
                        color: colors.darkText,
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: '600'
                    }}>
                        Total Earnings
                    </h2>
                    <span style={{
                        backgroundColor: colors.primary + '20',
                        color: colors.primary,
                        borderRadius: '14px',
                        padding: '6px 12px',
                        fontSize: '15px',
                        fontWeight: '600'
                    }}>
                        {earnings.paymentStatus}
                    </span>
                </div>

                <div style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: colors.primary,
                    marginBottom: '20px'
                }}>
                    KSH {earnings.balance.toFixed(2)}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px'
                }}>
                    <div style={{
                        backgroundColor: colors.lightBackground,
                        borderRadius: '14px',
                        padding: '18px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: colors.darkText,
                            marginBottom: '5px'
                        }}>
                            {earnings.totalDeliveries}
                        </div>
                        <div style={{ color: colors.darkText, fontSize: '15px' }}>
                            Deliveries
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: colors.lightBackground,
                        borderRadius: '14px',
                        padding: '18px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: colors.secondary,
                            marginBottom: '5px'
                        }}>
                            KSH {earnings.weeklyEarnings.toFixed(2)}
                        </div>
                        <div style={{ color: colors.darkText, fontSize: '15px' }}>
                            This Week
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Orders Section - Prominent and actionable */}
            {availableOrders.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                    <h2 style={{
                        color: colors.darkText,
                        margin: '0 0 15px 0',
                        fontSize: '20px',
                        fontWeight: '600'
                    }}>
                        New Order Available!
                    </h2>
                    {availableOrders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                backgroundColor: colors.cardBackground,
                                borderRadius: '16px',
                                padding: '20px',
                                marginBottom: '15px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                borderLeft: `4px solid ${colors.primary}`,
                                animation: 'pulse 1.5s infinite' // Simple pulse animation for new orders
                            }}
                        >
                            <style>{`
                                @keyframes pulse {
                                    0% { transform: scale(1); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                                    50% { transform: scale(1.01); box-shadow: 0 6px 10px rgba(0,0,0,0.1); }
                                    100% { transform: scale(1); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                                }
                            `}</style>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: colors.darkText
                                    }}>
                                        New Order #{order.id.substring(0, 8)}
                                    </div>
                                    <div style={{
                                        fontSize: '15px',
                                        color: colors.darkText,
                                        opacity: 0.8
                                    }}>
                                        From {order.chef.name} to {order.customer.name}
                                    </div>
                                </div>
                                <span style={{
                                    backgroundColor: colors.primary + '20',
                                    color: colors.primary,
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    KSH {order.food.price}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button
                                    onClick={() => acceptOrder(order.id)}
                                    style={{
                                        ...buttonStyles.base,
                                        ...buttonStyles.primary,
                                        flex: 1
                                    }}
                                >
                                    Accept Order
                                </button>
                                <button
                                    onClick={() => declineOrder(order.id)}
                                    style={{
                                        ...buttonStyles.base,
                                        ...buttonStyles.outline,
                                        borderColor: colors.error,
                                        color: colors.error,
                                        flex: 1
                                    }}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Orders Header - Clear categorization */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <h2 style={{
                    color: colors.darkText,
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: '600'
                }}>
                    Active Orders
                </h2>
                <span style={{
                    backgroundColor: colors.primary,
                    color: 'white',
                    borderRadius: '16px',
                    padding: '5px 12px',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    {activeOrders.filter(o => o.status !== 'delivered').length} pending
                </span>
            </div>

            {/* Orders List - Visually distinct statuses */}
            <div style={{ marginBottom: '100px' }}>
                {activeOrders.length === 0 && availableOrders.length === 0 ? (
                    <div style={{
                        backgroundColor: colors.cardBackground,
                        borderRadius: '16px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: colors.darkText,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛵</div>
                        <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
                            No active orders
                        </p>
                        <p style={{ color: colors.darkText, opacity: 0.7 }}>
                            You'll be notified when new orders arrive
                        </p>
                    </div>
                ) : (
                    activeOrders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                backgroundColor: colors.cardBackground,
                                borderRadius: '16px',
                                padding: '20px',
                                marginBottom: '15px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                borderLeft: `4px solid ${
                                    order.status === 'in-transit' ? colors.warning :
                                        order.status === 'assigned' ? colors.info :
                                            order.status === 'delivered' ? colors.success : colors.primary
                                    }`,
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedOrder(order)}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: colors.darkText
                                    }}>
                                        Order #{order.id.substring(0, 8)}
                                    </div>
                                    <div style={{
                                        fontSize: '15px',
                                        color: colors.darkText,
                                        opacity: 0.8
                                    }}>
                                        From {order.chef.name} to {order.customer.name}
                                    </div>
                                </div>
                                <span style={{
                                    backgroundColor: colors.primary + '20',
                                    color: colors.primary,
                                    padding: '5px 10px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    KSH {order.food.price}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '14px',
                                color: colors.darkText,
                                opacity: 0.7,
                                marginBottom: '10px'
                            }}>
                                <span>Status: <strong style={{ color: colors.primary }}>{order.status.replace('-', ' ')}</strong></span>
                                {order.assignedAt && <span>{getTimeSinceAssignment(order.assignedAt)}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Order Details Modal - Comprehensive and actionable */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.cardBackground,
                    borderTopLeftRadius: '25px',
                    borderTopRightRadius: '25px',
                    padding: '30px',
                    paddingBottom: 'calc(30px + env(safe-area-inset-bottom))', // For notched phones
                    boxShadow: '0 -8px 20px rgba(0,0,0,0.15)',
                    zIndex: 999,
                    maxHeight: '80%',
                    overflowY: 'auto'
                }}>
                    <button
                        onClick={() => setSelectedOrder(null)}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: colors.placeholderText
                        }}
                    >
                        &times;
                    </button>

                    <h2 style={{
                        color: colors.darkText,
                        marginBottom: '20px',
                        fontSize: '22px',
                        fontWeight: '700'
                    }}>
                        Order Details #{selectedOrder.id.substring(0, 8)}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ backgroundColor: colors.chefCard, padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: colors.darkText, fontSize: '18px', marginBottom: '8px' }}>Chef Info</h3>
                            <p style={{ margin: '5px 0', fontSize: '15px', color: colors.darkText }}><strong>{selectedOrder.chef.name}</strong></p>
                            <p style={{ margin: '5px 0', fontSize: '15px', color: colors.darkText }}>{selectedOrder.chef.location}</p>
                            <p style={{ margin: '5px 0', fontSize: '15px', color: colors.darkText }}>{selectedOrder.chef.phone}</p>
                            {selectedOrder.chef.peerId && (
                                <button
                                    onClick={() => startPeerCall(selectedOrder.chef.peerId, selectedOrder.chef.name, 'chef', selectedOrder.chef.phone)}
                                    style={{ ...buttonStyles.base, ...buttonStyles.accent, width: '100%', marginTop: '10px', fontSize: '14px' }}
                                >
                                    📞 Call Chef
                                </button>
                            )}
                        </div>
                        <div style={{ backgroundColor: colors.riderCard, padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: colors.darkText, fontSize: '18px', marginBottom: '8px' }}>Customer Info</h3>
                            <p style={{ margin: '5px 0', fontSize: '15px', color: colors.darkText }}><strong>{selectedOrder.customer.name}</strong></p>
                            <p style={{ margin: '5px 0', fontSize: '15px', color: colors.darkText }}>{selectedOrder.customer.address}</p>
                            <p style={{ margin: '5px 0', fontSize: '15px', color: colors.darkText }}>{selectedOrder.customer.phone}</p>
                            {selectedOrder.customer.peerId && (
                                <button
                                    onClick={() => startPeerCall(selectedOrder.customer.peerId, selectedOrder.customer.name, 'customer', selectedOrder.customer.phone)}
                                    style={{ ...buttonStyles.base, ...buttonStyles.accent, width: '100%', marginTop: '10px', fontSize: '14px' }}
                                >
                                    📞 Call Customer
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: colors.darkText, fontSize: '18px', marginBottom: '10px' }}>Food Items</h3>
                        <div style={{ backgroundColor: colors.lightBackground, padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                            <p style={{ margin: '5px 0', fontSize: '16px', color: colors.darkText }}>
                                <strong>{selectedOrder.food.title}</strong> - KSH {selectedOrder.food.price.toFixed(2)}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '14px', color: colors.placeholderText }}>
                                {selectedOrder.food.description}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: colors.darkText, fontSize: '18px', marginBottom: '10px' }}>Delivery Details</h3>
                        <div style={{ backgroundColor: colors.lightBackground, padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                            <p style={{ margin: '5px 0', fontSize: '16px', color: colors.darkText }}>
                                Pickup: {selectedOrder.chef.location}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '16px', color: colors.darkText }}>
                                Dropoff: {selectedOrder.customer.address}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '16px', color: colors.darkText }}>
                                Total Amount: <strong style={{ color: colors.primary }}>KSH {selectedOrder.payment.amount.toFixed(2)}</strong> ({selectedOrder.payment.method})
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '16px', color: colors.darkText }}>
                                OTP: <strong style={{ color: colors.accent }}>{selectedOrder.otp}</strong> (for delivery completion)
                            </p>
                        </div>
                    </div>

                    {selectedOrder.status === 'assigned' && (
                        <button
                            onClick={() => startDelivery(selectedOrder.id)}
                            style={{ ...buttonStyles.base, ...buttonStyles.primary, width: '100%', marginBottom: '15px' }}
                        >
                            Start Delivery
                        </button>
                    )}

                    {selectedOrder.status === 'in-transit' && (
                        <>
                            <button
                                onClick={() => openNavigation(selectedOrder, 'google')}
                                style={{ ...buttonStyles.base, ...buttonStyles.info, width: '100%', marginBottom: '15px' }}
                            >
                                Navigate to Customer (Google Maps)
                            </button>
                            <div style={{ marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP to complete delivery"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value)}
                                    style={{
                                        width: 'calc(100% - 20px)',
                                        padding: '12px 10px',
                                        borderRadius: '8px',
                                        border: `1px solid ${colors.borderColor}`,
                                        fontSize: '16px',
                                        marginBottom: '10px'
                                    }}
                                />
                                <button
                                    onClick={completeDelivery}
                                    style={{ ...buttonStyles.base, ...buttonStyles.success, width: '100%' }}
                                >
                                    Complete Delivery
                                </button>
                            </div>
                        </>
                    )}

                    {selectedOrder.status === 'delivered' && (
                        <p style={{ textAlign: 'center', color: colors.success, fontSize: '18px', fontWeight: '600' }}>
                            ✅ Order Delivered!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default RiderDashboard;