import React, { useState, useEffect, useRef } from 'react';

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

const Board = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 245.5,
    totalDeliveries: 17,
    paymentStatus: 'Paid Weekly',
  });
  const [profile, setProfile] = useState({
    name: 'John Rider',
    photo: '/images/delivery.png',
    available: true,
  });
  const [notifications, setNotifications] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [callStatus, setCallStatus] = useState({ active: false, type: '' });
  const [audioStream, setAudioStream] = useState(null);
  const audioRef = useRef(null);

  // Simulate WebRTC call
  const startAudioCall = async (type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setCallStatus({ active: true, type });
      
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
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    setCallStatus({ active: false, type: '' });
    setAudioStream(null);
  };

  useEffect(() => {
    // Simulated data
    setOrders([
      {
        id: 'ORD-001',
        pickup: 'Jikoni Kitchen - Downtown',
        dropoff: '123 Main St, Apt 4B',
        time: '25 min',
        distance: '4.2 km',
        status: 'Assigned',
        items: '2x Chicken Curry, 3x Naan Bread',
        customer: '+254712345678',
        otp: '4738',
        coordinates: { pickup: [-1.286389, 36.817223], dropoff: [-1.292066, 36.821946] },
      },
      {
        id: 'ORD-002',
        pickup: 'Jikoni Express - Westside',
        dropoff: '456 Market Rd',
        time: '15 min',
        distance: '2.1 km',
        status: 'New',
        items: '1x Veggie Platter, 2x Mango Lassi',
        customer: '+254798765432',
        otp: '5912',
        coordinates: { pickup: [-1.270840, 36.798740], dropoff: [-1.268250, 36.803820] },
      },
    ]);

    setNotifications([
      { id: '1', type: 'order', content: 'New order available: ORD-002' },
      { id: '2', type: 'payment', content: 'Weekly payment processed: $245.50' },
      { id: '3', type: 'admin', content: 'Festival discount starts tomorrow' },
    ]);

    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const acceptOrder = (id) => {
    setOrders((orders) =>
      orders.map((order) =>
        order.id === id ? { ...order, status: 'Assigned' } : order
      )
    );
  };

  const startDelivery = (id) => {
    setOrders((orders) =>
      orders.map((order) =>
        order.id === id ? { ...order, status: 'In Transit' } : order
      )
    );
    setSelectedOrder(null);
  };

  const completeDelivery = (id) => {
    setOrders((orders) =>
      orders.map((order) =>
        order.id === id ? { ...order, status: 'Delivered' } : order
      )
    );
    setEarnings((prev) => ({
      ...prev,
      today: prev.today + 8.5,
      totalDeliveries: prev.totalDeliveries + 1,
    }));
    setSelectedOrder(null);
  };

  const openNavigation = (order, app = 'google') => {
    if (!order.coordinates) return;
    
    const { pickup, dropoff } = order.coordinates;
    const baseUrls = {
      google: `https://www.google.com/maps/dir/?api=1&origin=${pickup[0]},${pickup[1]}&destination=${dropoff[0]},${dropoff[1]}&travelmode=driving`,
      waze: `https://www.waze.com/ul?ll=${dropoff[0]},${dropoff[1]}&navigate=yes&zoom=17`
    };
    
    window.open(baseUrls[app], '_blank');
  };

  return (
    <div style={{ 
      backgroundColor: colors.lightBackground, 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Audio element for WebRTC call */}
      <audio ref={audioRef} />
      
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
            Delivery Dashboard
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
                  onChange={(e) =>
                    setProfile({ ...profile, available: e.target.checked })
                  }
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
            <button style={{
              backgroundColor: 'transparent',
              border: `1px solid ${colors.primary}`,
              color: colors.primary,
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              Log Out
            </button>
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
          Today's Earnings: <span style={{ color: colors.primary }}>${earnings.today.toFixed(2)}</span>
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
              ${(earnings.today / earnings.totalDeliveries).toFixed(2)}
            </div>
            <div style={{
              fontSize: '14px',
              color: colors.placeholderText
            }}>
              Avg Order
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
          {orders.filter(o => o.status !== 'Delivered').length} pending
        </span>
      </div>

      {/* Orders List */}
      <div style={{ marginBottom: '80px' }}>
        {orders.map((order) => (
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
        ))}
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
              marginBottom: '15px'
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
                borderRadius: '10px'
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
                gap: '10px',
                marginBottom: '15px'
              }}>
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
                  <span>📞</span> Call Customer
                </button>
                
                <button 
                  onClick={() => startAudioCall('customer')}
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
                  <span>🎧</span> Audio Call
                </button>
              </div>
              
              <button 
                onClick={() => startAudioCall('chef')}
                style={{
                  width: '100%',
                  backgroundColor: '#3498db',
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
                <span>👨‍🍳</span> Call Chef
              </button>
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
                color: colors.primary
              }}>
                {selectedOrder.otp}
              </div>
              <p style={{ 
                textAlign: 'center',
                color: colors.placeholderText,
                fontSize: '14px',
                marginTop: '5px'
              }}>
                Provide this OTP to customer upon delivery
              </p>
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
              {selectedOrder.status === 'Assigned' && (
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
              
              {selectedOrder.status === 'In Transit' && (
                <button 
                  onClick={() => completeDelivery(selectedOrder.id)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.secondary,
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

export default Board;