import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';

const colors = {
  primary: '#FF4532',
  secondary: '#00C853',
  darkText: '#1A202C',
  lightBackground: '#F0F2F5',
  cardBackground: '#FFFFFF',
  borderColor: '#D1D9E6',
  errorText: '#EF4444',
  placeholderText: '#A0AEC0',
  buttonHover: '#E6392B',
  disabledButton: '#CBD5E1',
};

const RiderDashboard = () => {

   const [riderId, setRiderId] = useState(null);

  useEffect(() => {
    const storedRiderId = localStorage.getItem('riderId');
    if (storedRiderId) {
      setRiderId(storedRiderId);
    }
  }, []);

  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [earnings, setEarnings] = useState({ 
    balance: 0, 
    totalDeliveries: 0,
    weeklyEarnings: 0,
    paymentStatus: 'Pending'
  });


  const [profile, setProfile] = useState({
    id: riderId,
    name: 'Loading...',
    phone: '',
    rating: 4.8,
    vehicleType: 'Motorcycle',
    photo: '/images/delivery.png',
    available: true,
  });

  const [notifications, setNotifications] = useState([]);
  const [callStatus, setCallStatus] = useState({ active: false, type: '' });
  const audioRef = useRef(null);
  const notificationSoundRef = useRef(null);
  const socketRef = useRef(null);



  // Fetch rider data on mount
  useEffect(() => {
    const fetchRiderData = async () => {
      try {
        // Fetch profile
        const profileRes = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/rider/${riderId}`);
        const profileData = await profileRes.json();
        setProfile(prev => ({ ...prev, ...profileData }));
        
        // Fetch orders
        const ordersRes = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/orders`);
        console.log(ordersRes)
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders.map(formatOrder));
        
        // Fetch earnings
        const earningsRes = await fetch(`/api/rider/${riderId}/earnings`);
        const earningsData = await earningsRes.json();
        setEarnings(earningsData);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    
    fetchRiderData();
    
    // Setup socket connection
  socketRef.current = io('http://localhost:8000/apiV1/smartcity-ke', {
  reconnection: true,
  query: { riderId }
});

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    socketRef.current.on('order:assigned', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'order',
        content: `New delivery: ${data.order.id}`,
        sound: data.notificationSound,
        order: formatOrder(data.order)
      }, ...prev]);
      
      // Play notification sound
      if (notificationSoundRef.current) {
        notificationSoundRef.current.src = data.notificationSound;
        notificationSoundRef.current.play().catch(e => console.error('Notification sound error:', e));
      }
      
      setOrders(prev => [formatOrder(data.order), ...prev]);
    });
    
    socketRef.current.on('order:updated', (data) => {
      setOrders(prev => 
        prev.map(order => 
          order.id === data.order.id ? formatOrder(data.order) : order
        )
      );
    });
    
    socketRef.current.on('order:delivered', (data) => {
      if (data.riderId === riderId) {
        setEarnings(prev => ({
          ...prev,
          balance: prev.balance + data.riderFee,
          totalDeliveries: prev.totalDeliveries + 1,
          totalEarnings: prev.totalEarnings + data.riderFee
        }));
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [riderId]);
  const formatOrder = (order) => ({
  id: order.id,
  pickup: order.foodListing?.chef?.address || "Chef's address not available",
  dropoff: order.deliveryAddress || "Customer address not available",
  time: '25 min', // Can be replaced by actual ETA if available
  distance: '4.2 km', // Can be replaced with calculated distance if needed
  status:
    order.status === 'preparing' ? 'New' :
    order.status === 'assigned' ? 'Assigned' :
    order.status === 'in-transit' ? 'In Transit' : 'Delivered',
  items: order.foodListing?.title || "Food items",
  customer: order.user?.PhoneNumber || "Customer phone",
  customerName: order.user?.Name || "Customer",
  otp: order.otpCode || "123456",
  coordinates: {
    pickup: [
      order.foodListing?.chef?.latitude || -1.286389,
      order.foodListing?.chef?.longitude || 36.817223
    ],
    dropoff: [
      order.latitude || -1.292066,
      order.longitude || 36.821946
    ]
  },
  rawStatus: order.status,
  createdAt: order.createdAt,
  assignedAt: order.assignedAt
});

  // Accept order
  const acceptOrder = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/order/${id}/assign-rider`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status: 'Assigned', rawStatus: 'assigned' } : order
      ));
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert(error.message);
    }
  };

  // Start delivery
  const startDelivery = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/order/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in-transit' })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status: 'In Transit', rawStatus: 'in-transit' } : order
      ));
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to start delivery:', error);
      alert(error.message);
    }
  };

  // Complete delivery
  const completeDelivery = async () => {
    if (!selectedOrder) return;
    
    try {
      const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/order/${selectedOrder.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      // Update orders
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id ? { ...order, status: 'Delivered', rawStatus: 'delivered' } : order
      ));
      
      // Close modal and reset OTP
      setSelectedOrder(null);
      setOtpInput('');
      
      // Show success message
      alert(`Delivery completed! You earned $${data.riderFee.toFixed(2)} in ${data.deliveryTime} minutes`);
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

  const baseUrls = {
    google: `https://www.google.com/maps/dir/?api=1&origin=${pickup[0]},${pickup[1]}&destination=${dropoff[0]},${dropoff[1]}&travelmode=driving`,
    waze: `https://www.waze.com/ul?ll=${dropoff[0]},${dropoff[1]}&navigate=yes&zoom=17`
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
      await fetch(`/api/rider/${riderId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newStatus })
      });
    } catch (error) {
      console.error('Failed to update availability:', error);
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
    setCallStatus({ active: false, type: '' });
  };

  // Calculate time since assignment
  const getTimeSinceAssignment = (assignedAt) => {
    if (!assignedAt) return 'Just now';
    return formatDistanceToNow(new Date(assignedAt), { addSuffix: true });
  };

  return (
    <div style={{ 
      backgroundColor: colors.lightBackground, 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Audio elements */}
      <audio ref={audioRef} />
      <audio ref={notificationSoundRef} />
      
      {/* Call Status Modal */}
      {callStatus.active && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: colors.cardBackground,
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: colors.primary, marginBottom: '20px' }}>
              Calling {callStatus.type === 'chef' ? 'Chef' : 'Customer'}...
            </h2>
            <div style={{ marginBottom: '15px', fontSize: '18px' }}>
              {callStatus.phoneNumber}
            </div>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: colors.primary, 
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px', color: 'white' }}>📞</span>
            </div>
            <button 
              onClick={endCall}
              style={{
                backgroundColor: colors.errorText,
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: `1px solid ${colors.borderColor}`
      }}>
        <div>
          <h1 style={{ 
            color: colors.primary, 
            margin: 0,
            fontSize: '24px'
          }}>
            {profile.name}
          </h1>
          <p style={{ 
            color: colors.placeholderText,
            margin: '5px 0 0',
            fontSize: '14px'
          }}>
            {profile.available ? '🟢 Available for orders' : '🔴 Not available'}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={profile.photo} 
            alt="Profile" 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%',
              marginRight: '15px',
              border: `2px solid ${profile.available ? colors.secondary : colors.errorText}`
            }} 
          />
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <label style={{ 
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px',
                marginRight: '10px'
              }}>
                <input
                  type="checkbox"
                  checked={profile.available}
                  onChange={toggleAvailability}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: profile.available ? colors.secondary : colors.disabledButton,
                  transition: '.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '20px',
                    width: '20px',
                    left: '2px',
                    bottom: '2px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%',
                    transform: profile.available ? 'translateX(26px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
              <span style={{ fontSize: '14px' }}>
                {profile.available ? 'Available' : 'Offline'}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: colors.placeholderText }}>
              ⭐ {profile.rating || '4.8'}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div style={{
        backgroundColor: colors.cardBackground,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ 
          color: colors.darkText, 
          marginTop: '0',
          marginBottom: '15px',
          fontSize: '18px'
        }}>
          Earnings: <span style={{ color: colors.primary }}> KSH {earnings.balance.toFixed(2)}</span>
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: colors.primary
            }}>
              {earnings.totalDeliveries}
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.placeholderText
            }}>
              Deliveries
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: colors.primary
            }}>
              KSH {earnings.weeklyEarnings?.toFixed(2) || '0.00'}
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.placeholderText
            }}>
              This Week
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: earnings.paymentStatus.includes('Paid') ? colors.secondary : colors.primary,
              padding: '5px',
              backgroundColor: earnings.paymentStatus.includes('Paid') ? '#E6F5ED' : '#FFEBEE',
              borderRadius: '20px'
            }}>
              {earnings.paymentStatus}
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.placeholderText,
              marginTop: '5px'
            }}>
              Payment Status
            </div>
          </div>
        </div>
      </div>

      {/* Orders Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h2 style={{ 
          color: colors.darkText, 
          margin: 0,
          fontSize: '18px'
        }}>
          Active Orders
        </h2>
        <span style={{ 
          backgroundColor: colors.primary, 
          color: 'white',
          borderRadius: '12px',
          padding: '3px 10px',
          fontSize: '12px'
        }}>
          {orders.filter(o => o.rawStatus !== 'delivered').length} pending
        </span>
      </div>

      {/* Orders List */}
      <div style={{ marginBottom: '80px' }}>
        {orders.length === 0 ? (
          <div style={{
            backgroundColor: colors.cardBackground,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            color: colors.placeholderText
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🍔</div>
            <p>No active orders</p>
            <p>You'll be notified when new orders arrive</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={{
              backgroundColor: colors.cardBackground,
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '15px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <strong style={{ color: colors.darkText }}>#{order.id}</strong>
                <span style={{
                  backgroundColor: 
                    order.status === 'New' ? '#FFE0D9' : 
                    order.status === 'Assigned' ? '#E0F7FA' : 
                    order.status === 'In Transit' ? '#E8F5E9' : '#EEEEEE',
                  color: 
                    order.status === 'New' ? colors.primary : 
                    order.status === 'Assigned' ? '#00838F' : 
                    order.status === 'In Transit' ? colors.secondary : colors.placeholderText,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {order.status}
                </span>
              </div>
              
              {order.rawStatus === 'assigned' && (
                <div style={{ 
                  backgroundColor: '#E0F7FA',
                  padding: '8px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '12px',
                  color: '#00838F'
                }}>
                  ⏱ Assigned {getTimeSinceAssignment(order.assignedAt)}
                </div>
              )}
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ 
                    width: '20px', 
                    color: colors.primary,
                    marginRight: '8px'
                  }}>📍</div>
                  <div>
                    <div style={{ fontSize: '12px', color: colors.placeholderText }}>Pickup</div>
                    <div style={{ fontSize: '14px' }}>{order.pickup}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '20px', 
                    color: colors.secondary,
                    marginRight: '8px'
                  }}>📦</div>
                  <div>
                    <div style={{ fontSize: '12px', color: colors.placeholderText }}>Dropoff</div>
                    <div style={{ fontSize: '14px' }}>{order.dropoff}</div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '15px',
                fontSize: '14px',
                color: colors.placeholderText
              }}>
                <span>⏱ {order.time}</span>
                <span>📏 {order.distance}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.primary}`,
                    color: colors.primary,
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Details
                </button>
                
                {order.status === 'New' && (
                  <button 
                    onClick={() => acceptOrder(order.id)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Accept
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
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
            borderRadius: '15px',
            padding: '20px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '5px'
            }}>
              <h2 style={{ 
                color: colors.darkText, 
                margin: 0,
                fontSize: '20px'
              }}>
                Order #{selectedOrder.id}
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: colors.placeholderText
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '16px',
                color: colors.darkText,
                marginBottom: '10px'
              }}>
                Order Items
              </h3>
              <div style={{ 
                backgroundColor: colors.lightBackground,
                padding: '15px',
                borderRadius: '10px',
                fontSize: '14px'
              }}>
                {selectedOrder.items}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '16px',
                color: colors.darkText,
                marginBottom: '10px'
              }}>
                Contact Information
              </h3>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: colors.placeholderText }}>Customer</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>{selectedOrder.customerName || 'Customer'}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => makeCall(selectedOrder.customer)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>📞</span> Call
                  </button>
                  
                  <button 
                    onClick={() => startAudioCall('customer', selectedOrder.customer)}
                    style={{
                      flex: 1,
                      backgroundColor: colors.secondary,
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🎧</span> Audio
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '16px',
                color: colors.darkText,
                marginBottom: '10px'
              }}>
                Delivery Verification
              </h3>
              <div style={{ 
                backgroundColor: colors.lightBackground,
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '5px',
                color: colors.primary,
                marginBottom: '10px'
              }}>
                {selectedOrder.otp}
              </div>
              <p style={{ 
                textAlign: 'center',
                color: colors.placeholderText,
                fontSize: '14px',
                marginBottom: '15px'
              }}>
                Provide this OTP to customer upon delivery
              </p>
              
              {selectedOrder.rawStatus === 'in-transit' && (
                <div>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter customer's OTP"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.borderColor}`,
                      fontSize: '16px',
                      textAlign: 'center',
                      marginBottom: '10px'
                    }}
                  />
                  <p style={{ 
                    textAlign: 'center',
                    color: colors.placeholderText,
                    fontSize: '14px'
                  }}>
                    Verify OTP to complete delivery
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '16px',
                color: colors.darkText,
                marginBottom: '10px'
              }}>
                Navigation
              </h3>
              <div style={{ 
                display: 'flex',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <button 
                  onClick={() => openNavigation(selectedOrder, 'google')}
                  style={{
                    flex: 1,
                    backgroundColor: '#4285F4',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>G</span> Google Maps
                </button>
                
                <button 
                  onClick={() => openNavigation(selectedOrder, 'waze')}
                  style={{
                    flex: 1,
                    backgroundColor: '#33CCFF',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>W</span> Waze
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedOrder.rawStatus === 'assigned' && (
                <button 
                  onClick={() => startDelivery(selectedOrder.id)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Start Delivery
                </button>
              )}
              
              {selectedOrder.rawStatus === 'in-transit' && (
                <button 
                  onClick={completeDelivery}
                  disabled={otpInput.length !== 6}
                  style={{
                    flex: 1,
                    backgroundColor: otpInput.length === 6 ? colors.secondary : colors.disabledButton,
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Complete Delivery
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.cardBackground,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '15px 0',
        borderTop: `1px solid ${colors.borderColor}`,
        zIndex: 10
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          color: colors.primary
        }}>
          <div style={{ fontSize: '24px' }}>📋</div>
          <span style={{ fontSize: '12px' }}>Orders</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '24px' }}>🔔</div>
          <span style={{ fontSize: '12px' }}>Alerts</span>
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: colors.primary,
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              {notifications.length}
            </span>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <div style={{ fontSize: '24px' }}>👤</div>
          <span style={{ fontSize: '12px' }}>Profile</span>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;