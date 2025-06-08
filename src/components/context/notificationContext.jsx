import React, { useEffect, useState, createContext, useContext } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chefId, setChefId] = useState(null);

  useEffect(() => {
    // Get chefId from localStorage
    const storedChefId = localStorage.getItem('chefId');
    if (storedChefId) {
      setChefId(parseInt(storedChefId)); // Store as number
    }
  }, []);

  useEffect(() => {
    if (!chefId) return;

    const newSocket = io('https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke');
    setSocket(newSocket);

    newSocket.emit('chef:join', chefId);
newSocket.on('order:new', (data) => {
  console.log('Notification Data:', data); // Verify payload
  
  // Check if notification is for this chef
  if (data.order.chefId === chefId) {
    setNotifications(prev => [{
      id: data.order.id,
      title: 'New Order!',
      message: `Order #${data.order.id} for KES ${data.order.totalPrice}`,
      time: new Date().toLocaleTimeString(),
      read: false,
      chefId: data.order.chefId
    }, ...prev]);
  }
});

    return () => newSocket.close();
  }, [chefId]);

  const markNotificationAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, markNotificationAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
