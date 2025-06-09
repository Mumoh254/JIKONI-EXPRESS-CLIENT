import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { formatDistanceToNow, parseISO } from 'date-fns'; // Import parseISO for date string parsing

const colors = {
  primary: '#FF4532', // Orange-Red
  secondary: '#00C853', // Green
  darkText: '#1A202C', // Dark Charcoal
  lightBackground: '#F0F2F5', // Light Grey Blue
  cardBackground: '#FFFFFF', // White
  borderColor: '#D1D9E6', // Light Blue-Grey
  errorText: '#EF4444', // Red
  placeholderText: '#A0AEC0', // Grey
  buttonHover: '#E6392B', // Darker Orange-Red
  disabledButton: '#CBD5E1', // Light Grey
  infoBackground: '#E0F7FA', // Light Cyan for assigned status
  infoText: '#00838F', // Dark Cyan for assigned status
  newBackground: '#FFE0D9', // Light Orange for new status
  newText: '#FF4532', // Primary color for new status
  inTransitBackground: '#E8F5E9', // Light Green for in-transit status
  inTransitText: '#00C853', // Secondary color for in-transit status
};

const RiderDashboard = () => {
  const [riderId, setRiderId] = useState(null);

  useEffect(() => {
    const storedRiderId = localStorage.getItem('riderId');
    if (storedRiderId) {
      setRiderId(storedRiderId);
    } else {
      // For demonstration, if no riderId is stored, set a default one
      // In a real app, this would be handled by a login flow
      const defaultRiderId = '666141a4a601844b205317b6'; // Example ID
      localStorage.setItem('riderId', defaultRiderId);
      setRiderId(defaultRiderId);
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [earnings, setEarnings] = useState({
    balance: 0,
    totalDeliveries: 0,
    weeklyEarnings: 0,
    paymentStatus: 'Pending',
  });

  const [profile, setProfile] = useState({
    id: riderId,
    name: 'Loading...',
    phone: '',
    rating: 4.8,
    vehicleType: 'Motorcycle',
    photo: '/images/delivery.png', // Ensure this path is correct or use a placeholder from a CDN
    available: true,
  });

  const [notifications, setNotifications] = useState([]);
  const [callStatus, setCallStatus] = useState({ active: false, type: '', phoneNumber: '' });
  const audioRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch rider data on mount
  useEffect(() => {
    if (!riderId) return; // Ensure riderId is set before fetching data

    const fetchRiderData = async () => {
      try {
        // Fetch profile
        const profileRes = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/rider/${riderId}`);
        const profileData = await profileRes.json();
        setProfile(prev => ({ ...prev, ...profileData }));

        // Fetch orders
        const ordersRes = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/orders`);
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders.map(formatOrder));

        // Fetch earnings - Assuming an API endpoint exists
        // This is a placeholder for actual earnings data.
        // In a real app, you'd fetch this from an API.
        setEarnings({
          balance: 1250.75, // Example: Current balance
          totalDeliveries: 78, // Example: Total deliveries
          weeklyEarnings: 320.50, // Example: Earnings this week
          paymentStatus: 'Pending', // Example: Payment status
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchRiderData();

    // Setup socket connection
    socketRef.current = io('https://neuro-apps-api-express-js-production-redy.onrender.com', { // Use the correct API URL
      reconnection: true,
      query: { riderId },
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on('order:assigned', (data) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'order',
          content: `New delivery: ${data.order.id}`,
          sound: data.notificationSound,
          order: formatOrder(data.order),
        },
        ...prev,
      ]);

      // Play notification sound
      if (notificationSoundRef.current) {
        notificationSoundRef.current.src = data.notificationSound || '/sounds/notification.mp3'; // Provide a default sound
        notificationSoundRef.current.play().catch(e => console.error('Notification sound error:', e));
      }

      setOrders(prev => [formatOrder(data.order), ...prev]);
    });

    socketRef.current.on('order:updated', (data) => {
      setOrders(prev =>
        prev.map(order => (order.id === data.order.id ? formatOrder(data.order) : order))
      );
      if (selectedOrder && selectedOrder.id === data.order.id) {
        setSelectedOrder(formatOrder(data.order));
      }
    });

    socketRef.current.on('order:delivered', (data) => {
      if (data.riderId === riderId) {
        setEarnings(prev => ({
          ...prev,
          balance: prev.balance + data.riderFee,
          totalDeliveries: prev.totalDeliveries + 1,
          weeklyEarnings: prev.weeklyEarnings + data.riderFee, // Assuming riderFee contributes to weekly earnings
        }));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [riderId, selectedOrder]); // Added selectedOrder to dependency array to update modal view

  const formatOrder = (order) => ({
    id: order.id,
    pickup: order.foodListing?.chef?.address || "Chef's address not available",
    dropoff: order.deliveryAddress || 'Customer address not available',
    time: '25 min', // Placeholder - ideally calculated dynamically
    distance: '4.2 km', // Placeholder - ideally calculated dynamically
    status:
      order.status === 'preparing'
        ? 'New'
        : order.status === 'assigned'
        ? 'Assigned'
        : order.status === 'in-transit'
        ? 'In Transit'
        : 'Delivered',
    items: order.foodListing?.title || 'Food items',
    customer: order.user?.PhoneNumber || 'N/A',
    customerName: order.user?.Name || 'Customer',
    otp: order.otpCode || '123456', // Placeholder if not available
    coordinates: {
      pickup: [order.foodListing?.chef?.latitude || -1.286389, order.foodListing?.chef?.longitude || 36.817223],
      dropoff: [order.latitude || -1.292066, order.longitude || 36.821946],
    },
    rawStatus: order.status,
    createdAt: order.createdAt,
    assignedAt: order.assignedAt,
  });

  // Accept order
  const acceptOrder = async (id) => {
    try {
      const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/order/${id}/assign-rider`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to accept order');

      setOrders(prev => prev.map(order => (order.id === id ? { ...order, status: 'Assigned', rawStatus: 'assigned' } : order)));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, status: 'Assigned', rawStatus: 'assigned' }));
      }
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert(error.message);
    }
  };

  // Start delivery
  const startDelivery = async (id) => {
    try {
      const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/order/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-transit' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start delivery');

      setOrders(prev => prev.map(order => (order.id === id ? { ...order, status: 'In Transit', rawStatus: 'in-transit' } : order)));
      setSelectedOrder(prev => (prev && prev.id === id ? { ...prev, status: 'In Transit', rawStatus: 'in-transit' } : null)); // Update selected order and close if different
    } catch (error) {
      console.error('Failed to start delivery:', error);
      alert(error.message);
    }
  };

  // Complete delivery
  const completeDelivery = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/order/${selectedOrder.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Delivery completion failed');

      // Update orders
      setOrders(prev => prev.map(order => (order.id === selectedOrder.id ? { ...order, status: 'Delivered', rawStatus: 'delivered' } : order)));

      // Close modal and reset OTP
      setSelectedOrder(null);
      setOtpInput('');

      // Show success message
      alert(`Delivery completed! You earned KSH ${data.riderFee?.toFixed(2) || 'N/A'} in ${data.deliveryTime || 'N/A'} minutes`);

      // Optionally refresh earnings or rely on socket update
      setEarnings(prev => ({
        ...prev,
        balance: prev.balance + (data.riderFee || 0),
        totalDeliveries: prev.totalDeliveries + 1,
        weeklyEarnings: prev.weeklyEarnings + (data.riderFee || 0), // Assuming riderFee contributes to weekly earnings
      }));
    } catch (error) {
      console.error('Delivery completion failed:', error);
      alert(error.message);
    }
  };

  const openNavigation = (order, app = 'google') => {
    if (!order?.coordinates?.pickup || !order?.coordinates?.dropoff) {
      console.error('Missing coordinates for navigation.');
      alert('Navigation coordinates are not available.');
      return;
    }

    const { pickup, dropoff } = order.coordinates;
    const origin = `${pickup[0]},${pickup[1]}`;
    const destination = `${dropoff[0]},${dropoff[1]}`;

    const baseUrls = {
      google: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
      waze: `https://www.waze.com/ul?ll=${dropoff[0]},${dropoff[1]}&navigate=yes&zoom=17`,
    };

    const url = baseUrls[app] || baseUrls.google;
    window.open(url, '_blank');
  };

  // Make phone call
  const makeCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Toggle availability
  const toggleAvailability = async () => {
    const newStatus = !profile.available;
    setProfile(prev => ({ ...prev, available: newStatus }));

    try {
      // Assuming an API endpoint for availability
      // await fetch(`/api/rider/${riderId}/availability`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ available: newStatus })
      // });
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  // Simulate WebRTC call
  const startAudioCall = async (type, phoneNumber) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCallStatus({ active: true, type, phoneNumber });

      // For demo purposes - simulate ringing
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
          audioRef.current.play().catch(e => console.error('Play error:', e));
        }
      }, 2000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const endCall = () => {
    if (audioRef.current?.srcObject) {
      audioRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCallStatus({ active: false, type: '', phoneNumber: '' });
  };

  // Calculate time since assignment
  const getTimeSinceAssignment = (assignedAt) => {
    if (!assignedAt) return 'Just now';
    return formatDistanceToNow(parseISO(assignedAt), { addSuffix: true }); // Use parseISO for robust date parsing
  };

  // Inline styles for reusability and clarity
  const buttonBaseStyle = {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const primaryButton = {
    ...buttonBaseStyle,
    backgroundColor: colors.primary,
    color: colors.cardBackground,
    '&:hover': {
      backgroundColor: colors.buttonHover,
    },
  };

  const secondaryButton = {
    ...buttonBaseStyle,
    backgroundColor: colors.secondary,
    color: colors.cardBackground,
    '&:hover': {
      backgroundColor: '#00B04A', // Slightly darker green
    },
  };

  const outlineButton = {
    ...buttonBaseStyle,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.primary}`,
    color: colors.primary,
    '&:hover': {
      backgroundColor: '#FFF5F4', // Very light primary tint
    },
  };

  const dangerButton = {
    ...buttonBaseStyle,
    backgroundColor: colors.errorText,
    color: colors.cardBackground,
    '&:hover': {
      backgroundColor: '#D62C2C', // Darker red
    },
  };

  const toggleSwitchContainerStyle = {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '28px', // Adjusted height for better visual
    marginRight: '10px',
  };

  const toggleSwitchSliderStyle = {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: profile.available ? colors.secondary : colors.disabledButton,
    transition: '.4s',
    borderRadius: '28px', // Adjusted for full pill shape
  };

  const toggleSwitchKnobStyle = {
    position: 'absolute',
    content: '""',
    height: '24px', // Adjusted size
    width: '24px', // Adjusted size
    left: '2px',
    bottom: '2px',
    backgroundColor: colors.cardBackground,
    transition: '.4s',
    borderRadius: '50%',
    transform: profile.available ? 'translateX(22px)' : 'translateX(0)', // Adjusted transform
  };

  return (
    <div
      style={{
        backgroundColor: colors.lightBackground,
        minHeight: '100vh',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: '500px',
        margin: '0 auto',
        boxShadow: '0 0 15px rgba(0,0,0,0.05)',
        boxSizing: 'border-box', // Ensure padding is included in width
      }}
    >
      {/* Audio elements for notifications and calls */}
      <audio ref={audioRef} />
      <audio ref={notificationSoundRef} />

      {/* Call Status Modal */}
      {callStatus.active && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: colors.cardBackground,
              padding: '30px',
              borderRadius: '15px',
              textAlign: 'center',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
            }}
          >
            <h2 style={{ color: colors.primary, marginBottom: '20px', fontSize: '22px' }}>
              Calling {callStatus.type === 'chef' ? 'Chef' : 'Customer'}
            </h2>
            <p style={{ marginBottom: '15px', fontSize: '18px', color: colors.darkText }}>{callStatus.phoneNumber}</p>
            <div
              style={{
                width: '100px', // Larger icon
                height: '100px',
                backgroundColor: colors.primary,
                borderRadius: '50%',
                margin: '0 auto 25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(255, 69, 50, 0.3)',
              }}
            >
              <span style={{ fontSize: '36px', color: 'white' }}>📞</span>
            </div>
            <button onClick={endCall} style={dangerButton}>
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: `1px solid ${colors.borderColor}`,
        }}
      >
        <div>
          <h1
            style={{
              color: colors.darkText, // Changed to darkText for better contrast
              margin: 0,
              fontSize: '26px',
              fontWeight: 'bold',
            }}
          >
            Hello, {profile.name.split(' ')[0]}!
          </h1>
          <p
            style={{
              color: profile.available ? colors.secondary : colors.errorText, // Dynamic color for status
              margin: '8px 0 0',
              fontSize: '15px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{profile.available ? '🟢' : '🔴'}</span>
            {profile.available ? 'Online' : 'Offline'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={profile.photo}
            alt="Profile"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              marginRight: '15px',
              border: `3px solid ${profile.available ? colors.secondary : colors.errorText}`,
              objectFit: 'cover',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              <label style={toggleSwitchContainerStyle}>
                <input
                  type="checkbox"
                  checked={profile.available}
                  onChange={toggleAvailability}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={toggleSwitchSliderStyle}>
                  <span style={toggleSwitchKnobStyle} />
                </span>
              </label>
              <span style={{ fontSize: '15px', color: colors.darkText }}>{profile.available ? 'Available' : 'Unavailable'}</span>
            </div>
            <div style={{ fontSize: '15px', color: colors.placeholderText, display: 'flex', alignItems: 'center', gap: '5px' }}>
              ⭐ <strong style={{ color: colors.darkText }}>{profile.rating || '4.8'}</strong> ({profile.vehicleType})
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div
        style={{
          backgroundColor: colors.cardBackground,
          borderRadius: '16px',
          padding: '25px',
          marginBottom: '25px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.borderColor}`,
        }}
      >
        <h2
          style={{
            color: colors.darkText,
            marginTop: '0',
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Total Earnings: <span style={{ color: colors.primary, fontSize: '28px' }}>KSH {earnings.balance.toFixed(2)}</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
          }}
        >
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: colors.lightBackground, borderRadius: '10px' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: colors.primary,
              }}
            >
              {earnings.totalDeliveries}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.placeholderText,
              }}
            >
              Deliveries
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: colors.lightBackground, borderRadius: '10px' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: colors.secondary,
              }}
            >
              KSH {earnings.weeklyEarnings?.toFixed(2) || '0.00'}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.placeholderText,
              }}
            >
              This Week
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: colors.lightBackground, borderRadius: '10px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: earnings.paymentStatus.includes('Paid') ? colors.secondary : colors.primary,
                padding: '8px',
                backgroundColor: earnings.paymentStatus.includes('Paid') ? '#E6F5ED' : '#FFEBEE',
                borderRadius: '25px',
                display: 'inline-block',
                minWidth: '80px',
              }}
            >
              {earnings.paymentStatus}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.placeholderText,
                marginTop: '5px',
              }}
            >
              Payment Status
            </div>
          </div>
        </div>
      </div>

      {/* Orders Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        <h2
          style={{
            color: colors.darkText,
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        >
          Active Orders
        </h2>
        <span
          style={{
            backgroundColor: colors.primary,
            color: 'white',
            borderRadius: '16px',
            padding: '5px 12px',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          {orders.filter(o => o.rawStatus !== 'delivered').length} pending
        </span>
      </div>

      {/* Orders List */}
      <div style={{ marginBottom: '80px' }}>
        {orders.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              color: colors.placeholderText,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛵</div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.darkText }}>No active orders right now.</p>
            <p style={{ fontSize: '15px' }}>You'll be notified when new orders arrive. Stay tuned!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                border: `1px solid ${colors.borderColor}`,
                position: 'relative', // For absolute positioning of status badge
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '10px',
                  borderBottom: `1px dashed ${colors.borderColor}`,
                }}
              >
                <strong style={{ color: colors.darkText, fontSize: '18px' }}>Order #{order.id.substring(0, 8)}</strong>
                <span
                  style={{
                    backgroundColor:
                      order.status === 'New'
                        ? colors.newBackground
                        : order.status === 'Assigned'
                        ? colors.infoBackground
                        : order.status === 'In Transit'
                        ? colors.inTransitBackground
                        : '#EEEEEE',
                    color:
                      order.status === 'New'
                        ? colors.newText
                        : order.status === 'Assigned'
                        ? colors.infoText
                        : order.status === 'In Transit'
                        ? colors.inTransitText
                        : colors.placeholderText,
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {order.status}
                </span>
              </div>

              {order.rawStatus === 'assigned' && (
                <div
                  style={{
                    backgroundColor: colors.infoBackground,
                    padding: '10px 15px',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    fontSize: '14px',
                    color: colors.infoText,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>⏰</span> Assigned {getTimeSinceAssignment(order.assignedAt)}
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      color: colors.primary,
                      fontSize: '20px',
                      marginRight: '10px',
                      flexShrink: 0,
                    }}
                  >
                    📍
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: colors.placeholderText }}>Pickup Location</div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: colors.darkText }}>{order.pickup}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '24px',
                      color: colors.secondary,
                      fontSize: '20px',
                      marginRight: '10px',
                      flexShrink: 0,
                    }}
                  >
                    🏠
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: colors.placeholderText }}>Dropoff Location</div>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: colors.darkText }}>{order.dropoff}</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  paddingTop: '15px',
                  borderTop: `1px dashed ${colors.borderColor}`,
                  fontSize: '14px',
                  color: colors.placeholderText,
                  fontWeight: '500',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>⏱ {order.time}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📏 {order.distance}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setSelectedOrder(order)} style={outlineButton}>
                  Details
                </button>

                {order.status === 'New' && (
                  <button onClick={() => acceptOrder(order.id)} style={primaryButton}>
                    Accept Order
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          style={{
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
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: '15px',
              padding: '25px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  color: colors.darkText,
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                Order #{selectedOrder.id.substring(0, 8)}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: colors.placeholderText,
                  padding: '5px',
                  lineHeight: '1',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  color: colors.darkText,
                  marginBottom: '10px',
                  fontWeight: '600',
                }}
              >
                📦 Order Details
              </h3>
              <div
                style={{
                  backgroundColor: colors.lightBackground,
                  padding: '18px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  color: colors.darkText,
                  lineHeight: '1.6',
                  fontWeight: '500',
                }}
              >
                {selectedOrder.items}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  color: colors.darkText,
                  marginBottom: '10px',
                  fontWeight: '600',
                }}
              >
                📞 Contact Customer
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', color: colors.placeholderText }}>Customer Name</div>
                  <div style={{ fontSize: '17px', fontWeight: '500', color: colors.darkText }}>{selectedOrder.customerName || 'Customer'}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => makeCall(selectedOrder.customer)} style={primaryButton}>
                    <span>📞</span> Call
                  </button>

                  <button onClick={() => startAudioCall('customer', selectedOrder.customer)} style={secondaryButton}>
                    <span>🎧</span> Audio Call
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Options */}
            <div style={{ marginBottom: '25px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  color: colors.darkText,
                  marginBottom: '10px',
                  fontWeight: '600',
                }}
              >
                🗺️ Navigation
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => openNavigation(selectedOrder, 'google')} style={primaryButton}>
                  <span>Google Maps</span>
                </button>
                <button onClick={() => openNavigation(selectedOrder, 'waze')} style={outlineButton}>
                  <span>Waze</span>
                </button>
              </div>
            </div>

            {/* Action Buttons based on Order Status */}
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {selectedOrder.rawStatus === 'new' && (
                <button onClick={() => acceptOrder(selectedOrder.id)} style={primaryButton}>
                  Accept Order
                </button>
              )}
              {selectedOrder.rawStatus === 'assigned' && (
                <button onClick={() => startDelivery(selectedOrder.id)} style={primaryButton}>
                  Start Delivery
                </button>
              )}
              {selectedOrder.rawStatus === 'in-transit' && (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="otp" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: colors.darkText }}>
                      Enter OTP to Complete Delivery:
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g., 123456"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.borderColor}`,
                        fontSize: '16px',
                        color: colors.darkText,
                        backgroundColor: colors.lightBackground,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button onClick={completeDelivery} style={secondaryButton} disabled={otpInput.length !== 6}>
                    Complete Delivery
                  </button>
                </>
              )}
              {selectedOrder.rawStatus === 'delivered' && (
                <p style={{ textAlign: 'center', color: colors.secondary, fontSize: '18px', fontWeight: 'bold' }}>
                  Delivery Completed! 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;