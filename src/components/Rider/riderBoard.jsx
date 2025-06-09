import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { formatDistanceToNow, parseISO } from 'date-fns';

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
  const [callStatus, setCallStatus] = useState({ active: false, type: '', phoneNumber: '', isMuted: false }); // Added isMuted
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState(null);

  const audioRef = useRef(null); // For general audio playback (e.g., ringing)
  const notificationSoundRef = useRef(null); // For new order notification sound
  const socketRef = useRef(null);

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
      address: order.deliveryAddress
    },
    chef: {
      id: order.chef?.id,
      name: order.chef?.user?.Name || 'Chef',
      phone: order.chef?.user?.PhoneNumber || 'N/A',
      location: order.chef?.location,
      rating: order.chef?.rating || 4.5,
      speciality: order.chef?.speciality || 'Grilled Meats'
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
    riderId: order.riderId || null // Ensure riderId is part of the formatted order if assigned
  });

  useEffect(() => {
    // Set rider ID from localStorage or use default
    const storedRiderId = localStorage.getItem('riderId') || 'cmbnnx2kv0000dk2ag7wrm4au';
    setRiderId(storedRiderId);
    localStorage.setItem('riderId', storedRiderId);

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
    socketRef.current = io('https://neuro-apps-api-express-js-production-redy.onrender.com', {
      query: { riderId: storedRiderId }
    });

    // Socket event listeners
    socketRef.current.on('order:new', (data) => {
      // Add new order to available orders for acceptance
      setAvailableOrders(prev => [formatOrder(data.order), ...prev]);
      if (notificationSoundRef.current) {
        notificationSoundRef.current.play();
      }
    });

    socketRef.current.on('order:assigned', (data) => {
      const assignedOrder = formatOrder(data.order);
      // If this order was assigned to *this* rider
      if (assignedOrder.riderId === riderId) {
        setActiveOrders(prev => [assignedOrder, ...prev.filter(o => o.id !== assignedOrder.id)]);
        setAvailableOrders(prev => prev.filter(o => o.id !== assignedOrder.id)); // Remove from available
      } else {
        // If assigned to another rider, remove from available orders for this rider
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

    // Cleanup socket connection
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [riderId]); 

  const acceptOrder = (orderId) => {
    const orderToAccept = availableOrders.find(order => order.id === orderId);
    if (orderToAccept) {
      // Simulate backend assignment and status update
      // In a real app, the backend would handle the assignment and then emit 'order:assigned'
      // For this simulation, we immediately update local state and emit 'order:accept'
      const updatedOrder = {...orderToAccept, status: 'assigned', assignedAt: new Date().toISOString(), riderId: riderId }; // Explicitly assign riderId
      setActiveOrders(prev => [updatedOrder,...prev]);
      setAvailableOrders(prev => prev.filter(order => order.id!== orderId));
      setSelectedOrder(updatedOrder); // Show details of the accepted order

      // Emit socket event to backend for assignment
      socketRef.current.emit('order:accept', { orderId: orderId, riderId: riderId });
      // The backend should then emit 'order:assigned' to all relevant parties.
    }
  };

  const declineOrder = (orderId) => {
    setAvailableOrders(prev => prev.filter(order => order.id!== orderId));
    // Optionally, emit a socket event to inform the backend of the decline
    socketRef.current.emit('order:decline', { orderId: orderId, riderId: riderId });
  };

  const startDelivery = (id) => {
    setActiveOrders(prev => prev.map(order =>
      order.id === id? {...order, status: 'in-transit' } : order
    ));
    socketRef.current.emit('order:status:update', { orderId: id, status: 'in-transit', riderId });
  };

  const completeDelivery = () => {
    if (!selectedOrder) return;

    if (otpInput!== selectedOrder.otp) {
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
      order.id === selectedOrder.id? {...order, status: 'delivered' } : order
    ));
    socketRef.current.emit('order:status:update', { orderId: selectedOrder.id, status: 'delivered', riderId });
    setSelectedOrder(null);
    setOtpInput('');
  };

  const openNavigation = (order, app = 'google') => {
    const origin = `${order.coordinates.pickup},${order.coordinates.pickup[1]}`;
    const destination = `${order.coordinates.dropoff},${order.coordinates.dropoff[1]}`;

    const urls = {
      google: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
      waze: `https://www.waze.com/ul?ll=${destination}&navigate=yes`
    };

    window.open(urls[app], '_blank');
  };

  const makeCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const startAudioCall = (type, phoneNumber) => {
    setCallStatus({ active: true, type, phoneNumber, isMuted: false });
    // In a real app, this would initiate a WebRTC call.
    // For simulation, we can play a generic ringing sound if audioRef is set up for it.
    if (audioRef.current) {
      // audioRef.current.src = '/sounds/ringing.mp3'; // Assuming a ringing sound exists
      // audioRef.current.play();
    }
  };

  const endCall = () => {
    setCallStatus({ active: false, type: '', phoneNumber: '', isMuted: false });
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleMuteCall = () => {
    setCallStatus(prev => ({...prev, isMuted:!prev.isMuted }));
    if (audioRef.current) {
      audioRef.current.muted =!callStatus.isMuted; // This controls the actual audio element's mute state
    }
  };

  const toggleAvailability = () => {
    setProfile(prev => ({...prev, available:!prev.available }));
    socketRef.current.emit('rider:availability:update', { riderId, available:!profile.available });
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
      <audio ref={audioRef} />
      <audio ref={notificationSoundRef} src="/sounds/notification.mp3" preload="auto" />

      {/* Call Modal - Enhanced UI for professionalism */}
      {callStatus.active && (
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
              Calling {callStatus.type === 'chef'? 'Chef' : 'Customer'}
            </h2>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: colors.primary, marginBottom: '30px' }}>{callStatus.phoneNumber}</p>
            <div style={{
              width: '100px',
              height: '100px',
              backgroundColor: colors.primary + '20', // Lighter primary for background
              borderRadius: '50%',
              margin: '0 auto 30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '48px', color: colors.primary }}>📞</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
              <button
                onClick={toggleMuteCall}
                style={{
                 ...buttonStyles.base,
                  backgroundColor: callStatus.isMuted? colors.accent : colors.lightBackground, // Use accent for muted state
                  color: callStatus.isMuted? 'white' : colors.darkText,
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  fontSize: '24px'
                }}
              >
                {callStatus.isMuted? '🔇' : '🎤'}
              </button>
              <button
                onClick={endCall}
                style={{
                 ...buttonStyles.base,
                  backgroundColor: colors.error,
                  color: 'white',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  fontSize: '24px'
                }}
              >
                📞
              </button>
            </div>
            <button
              onClick={endCall}
              style={{
               ...buttonStyles.base,
               ...buttonStyles.danger,
                width: '100%'
              }}
            >
              End Call
            </button>
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

   {/* Header - Professional and inviting */}
{/* Header - Sleek and Professional for Jikoni Express */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px', // Reduced margin for a more compact look
  paddingBottom: '10px', // Reduced padding
  borderBottom: `1px solid ${colors.borderColor}`,
  backgroundColor: colors.background,
  paddingTop: '12px', // Slightly reduced padding
  borderRadius: '10px', 
  boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  padding: '0 15px', // More compact padding
}}>

  {/* Left Section: Greeting and Brand Name */}
  <div>
    <h1 style={{
      color: colors.darkText,
      margin: 0,
      fontSize: '24px', // Reduced font size for a smaller profile
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
      fontSize: '14px', // Slightly reduced font size
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      <span style={{ fontSize: '16px' }}>●</span>
      {profile.available ? 'Online' : 'Offline'}
    </p>
  </div>

  {/* Right Section: Profile Image & Availability Toggle */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img
      src={profile.photo}
      alt="Profile"
      style={{
        width: '50px', // Smaller profile image
        height: '50px',
        borderRadius: '50%',
        marginRight: '12px', // Reduced margin for a more compact look
        border: `3px solid ${profile.available ? colors.primary : colors.error}`,
        objectFit: 'cover',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        transition: 'border 0.3s ease',
      }}
    />
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{
        position: 'relative',
        width: '48px', // Reduced toggle width
        height: '26px', // Smaller toggle height
        marginRight: '10px', // Reduced margin
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
        fontSize: '12px', // Reduced font size for a more compact display
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
        borderRadius: '18px', // More rounded
        padding: '25px', // More padding
        marginBottom: '25px',
        boxShadow: '0 6px 12px rgba(0,0,0,0.08)' // Stronger shadow for depth
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
            fontSize: '20px', // Larger font
            fontWeight: '600'
          }}>
            Total Earnings
          </h2>
          <span style={{
            backgroundColor: colors.primary + '20',
            color: colors.primary,
            borderRadius: '14px', // More rounded
            padding: '6px 12px',
            fontSize: '15px',
            fontWeight: '600'
          }}>
            {earnings.paymentStatus}
          </span>
        </div>

        <div style={{
          fontSize: '36px', // Larger amount
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
          {activeOrders.filter(o => o.status!== 'delivered').length} pending
        </span>
      </div>

      {/* Orders List - Visually distinct statuses */}
      <div style={{ marginBottom: '100px' }}>
        {activeOrders.length === 0 && availableOrders.length === 0? (
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
                  order.status === 'in-transit'? colors.warning :
                  order.status === 'assigned'? colors.info :
                  order.status === 'delivered'? colors.success : colors.primary
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
                    fontSize: '14px',
                    color: colors.darkText,
                    opacity: 0.7
                  }}>
                    {new Date(order.createdAt).toLocaleTimeString({ hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <span style={{
                  backgroundColor:
                    order.status === 'in-transit'? colors.warning + '20' :
                    order.status === 'assigned'? colors.info + '20' :
                    order.status === 'delivered'? colors.success + '20' : colors.primary + '20',
                  color:
                    order.status === 'in-transit'? colors.warning :
                    order.status === 'assigned'? colors.info :
                    order.status === 'delivered'? colors.success : colors.primary,
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {order.status.replace('-', ' ')}
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '15px'
              }}>
              {order.food.images.length > 0 && (
  <img
    src={order.food.images[0]} // Access the first image from the array
    alt={order.food.title}
    style={{
      width: '80px',
      height: '80px',
      borderRadius: '12px',
      objectFit: 'cover',
    }}
  />


                )}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.darkText,
                    marginBottom: '5px'
                  }}>
                    {order.food.title}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.darkText,
                    opacity: 0.8,
                    marginBottom: '5px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {order.food.description}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: colors.primary
                  }}>
                    KSH {order.food.price}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: colors.darkText,
                opacity: 0.8
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>From</div>
                  <div>{order.chef.name}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>To</div>
                  <div>{order.customer.name}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>Distance</div>
                  <div>4.2 km</div> {/* This distance is hardcoded; in a real app, it would be dynamic */}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal - Comprehensive and easy to navigate */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: '20px',
            padding: '25px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
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
                fontSize: '22px',
                fontWeight: '700'
              }}>
                Order #{selectedOrder.id.substring(0, 8)}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '28px', // Larger close button for easy tap
                  cursor: 'pointer',
                  color: colors.darkText,
                  opacity: 0.5,
                  padding: '5px',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>

            {/* Food Details Card */}
            <div style={{
              backgroundColor: colors.lightBackground,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                color: colors.darkText,
                marginTop: 0,
                marginBottom: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>🍔</span> Food Details
              </h3>

              <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '15px'
              }}>
               {selectedOrder.food.images.length > 0 && (
  <img
    src={selectedOrder.food.images[0]} // Access the first image in the array
    alt={selectedOrder.food.title}
    style={{
      width: '100px',
      height: '100px',
      borderRadius: '12px',
      objectFit: 'cover'
    }}
  />
)}

              
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: colors.darkText,
                    marginBottom: '5px'
                  }}>
                    {selectedOrder.food.title}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: colors.darkText,
                    opacity: 0.9,
                    marginBottom: '10px'
                  }}>
                    {selectedOrder.food.description}
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: colors.primary
                  }}>
                    KSH {selectedOrder.food.price}
                  </div>
                </div>
              </div>
            </div>

            {/* Chef Details Card */}
            <div style={{
              backgroundColor: colors.chefCard,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                color: colors.darkText,
                marginTop: 0,
                marginBottom: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>👨‍🍳</span> Pickup From Chef
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.darkText,
                  marginBottom: '5px'
                }}>
                  {selectedOrder.chef.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: colors.darkText,
                  opacity: 0.8,
                  marginBottom: '10px'
                }}>
                  {selectedOrder.chef.speciality} • ⭐ {selectedOrder.chef.rating}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: colors.darkText,
                  opacity: 0.9
                }}>
                  {selectedOrder.chef.location}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => makeCall(selectedOrder.chef.phone)}
                  style={{
                   ...buttonStyles.base,
                   ...buttonStyles.accent,
                    flex: 1
                  }}
                >
                  <span>📞</span> Call Chef
                </button>
                <button
                  onClick={() => startAudioCall('chef', selectedOrder.chef.phone)}
                  style={{
                   ...buttonStyles.base,
                   ...buttonStyles.outline,
                    borderColor: colors.accent,
                    color: colors.accent,
                    flex: 1
                  }}
                >
                  <span>🎧</span> Audio Call
                </button>
              </div>
            </div>

            {/* Customer Details Card */}
            <div style={{
              backgroundColor: colors.riderCard,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                color: colors.darkText,
                marginTop: 0,
                marginBottom: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>🏠</span> Deliver to Customer
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.darkText,
                  marginBottom: '5px'
                }}>
                  {selectedOrder.customer.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: colors.darkText,
                  opacity: 0.9
                }}>
                  {selectedOrder.customer.address}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => makeCall(selectedOrder.customer.phone)}
                  style={{
                   ...buttonStyles.base,
                   ...buttonStyles.accent,
                    flex: 1
                  }}
                >
                  <span>📞</span> Call Customer
                </button>
                <button
                  onClick={() => startAudioCall('customer', selectedOrder.customer.phone)}
                  style={{
                   ...buttonStyles.base,
                   ...buttonStyles.outline,
                    borderColor: colors.accent,
                    color: colors.accent,
                    flex: 1
                  }}
                >
                  <span>🎧</span> Audio Call
                </button>
              </div>
            </div>

            {/* Actions based on status */}
            {selectedOrder.status === 'assigned' && (
              <button
                onClick={() => startDelivery(selectedOrder.id)}
                style={{
                 ...buttonStyles.base,
                 ...buttonStyles.primary,
                  width: '100%',
                  marginBottom: '10px'
                }}
              >
                Start Delivery
              </button>
            )}

            {selectedOrder.status === 'in-transit' && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{
                  fontSize: '18px',
                  color: colors.darkText,
                  marginBottom: '15px',
                  fontWeight: '600'
                }}>
                  Enter OTP to Complete Delivery
                </h3>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.borderColor}`,
                    marginBottom: '15px',
                    fontSize: '16px',
                    color: colors.darkText,
                    backgroundColor: colors.lightBackground
                  }}
                />
                <button
                  onClick={completeDelivery}
                  style={{
                   ...buttonStyles.base,
                   ...buttonStyles.success,
                    width: '100%'
                  }}
                >
                  Complete Delivery
                </button>
              </div>
            )}

            <button
              onClick={() => openNavigation(selectedOrder)}
              style={{
               ...buttonStyles.base,
               ...buttonStyles.info,
                width: '100%',
                marginTop: selectedOrder.status === 'in-transit'? '15px' : '0'
              }}
            >
              <span>🗺️</span> Open Navigation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;