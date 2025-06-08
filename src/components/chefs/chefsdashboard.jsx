// src/components/ChefDashboard.js
import React, { useState, useEffect } from 'react';
import ChefDashboardHeader from './chefsDashboardHeader';
import AdminProductsTable from './productsTable/products';
import ChefOrders from './orders/chefOrders';
// import RidersSidebar from '../Rider/rider';
// import ChefProfile from './ChefProfile';
import OrderDetailsModal from './orders/orderDetails';
import { Button, Badge } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const mockOrders = [
  {
    id: 'ORD001',
    customer: { name: 'John Doe', phone: '+254712345678' },
    items: [
      { name: 'Nyama Choma', quantity: 2, price: 1200 },
      { name: 'Ugali', quantity: 1, price: 200 },
      { name: 'Kachumbari', quantity: 1, price: 100 }
    ],
    total: 1500,
    orderTime: '2023-07-15T10:30:00',
    status: 'pending',
    rider: null,
    deliveryAddress: '123 Mombasa Road, Nairobi',
    pickupLocation: 'Jikoni Express Kitchen, Westlands',
    deliveryNotes: 'Call when arriving'
  },
  {
    id: 'ORD002',
    customer: { name: 'Mary Wanjiku', phone: '+254722334455' },
    items: [
      { name: 'Chapati', quantity: 4, price: 200 },
      { name: 'Beef Stew', quantity: 2, price: 800 }
    ],
    total: 1000,
    orderTime: '2023-07-15T09:15:00',
    status: 'preparing',
    rider: { name: 'Peter Mwangi', phone: '+254733445566', rating: 4.8, totalDeliveries: 42 },
    deliveryAddress: '456 Koinange Street, CBD',
    pickupLocation: 'Jikoni Express Kitchen, Westlands',
    deliveryNotes: 'Gate code: 1234'
  },
  {
    id: 'ORD003',
    customer: { name: 'David Kimani', phone: '+254711223344' },
    items: [
      { name: 'Pilau', quantity: 3, price: 900 },
      { name: 'Salad', quantity: 1, price: 150 }
    ],
    total: 1050,
    orderTime: '2023-07-14T18:45:00',
    status: 'delivered',
    rider: { name: 'Susan Akinyi', phone: '+254744556677', rating: 4.9, totalDeliveries: 68 },
    deliveryAddress: '789 Thika Road, Ruiru',
    pickupLocation: 'Jikoni Express Kitchen, Westlands',
    deliveryNotes: 'Leave at security desk'
  }
];

const mockFoods = [
  { id: 1, name: 'Nyama Choma', price: 1200, description: 'Grilled meat', available: true },
  { id: 2, name: 'Ugali', price: 200, description: 'Maize flour dish', available: true },
  { id: 3, name: 'Chapati', price: 50, description: 'Flatbread', available: true },
  { id: 4, name: 'Beef Stew', price: 400, description: 'Tender beef in sauce', available: false }
];

const mockRiders = [
  { id: 1, name: 'Peter Mwangi', status: 'available' },
  { id: 2, name: 'Susan Akinyi', status: 'on-delivery' },
  { id: 3, name: 'James Omondi', status: 'available' }
];

const Toast = withReactContent(Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
}));

export default function ChefDashboard({ setIsChefMode }) {
  // State management
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // Default to products
  const [showFoodPost, setShowFoodPost] = useState(false);
  const [showEditFood, setShowEditFood] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBikers, setShowBikers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setIsChefMode(true);
    return () => setIsChefMode(false);
  }, [setIsChefMode]);

  useEffect(() => {
    // Initialize with mock data
    setFoods(mockFoods);
    setOrders(mockOrders);
    setRiders(mockRiders);
    
    // Mock notifications
    const mockNotifications = [
      {
        id: 1,
        title: 'New Order Received',
        message: 'Order #ORD004 for KES 2,300 from Jane Muthoni',
        time: '10:30 AM',
        read: false
      },
      {
        id: 2,
        title: 'Order Status Update',
        message: 'Order #ORD002 is being prepared',
        time: '9:45 AM',
        read: false
      },
      {
        id: 3,
        title: 'Rider Assigned',
        message: 'Peter Mwangi is assigned to deliver order #ORD001',
        time: '9:15 AM',
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    
    // Simulate real-time notifications
    const notificationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification = {
          id: Date.now(),
          title: 'New Order Received',
          message: `Order #ORD${Math.floor(1000 + Math.random() * 9000)} for KES ${Math.floor(500 + Math.random() * 3000)}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        // Play notification sound
        try {
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
          audio.play();
        } catch (e) {
          console.log('Audio play failed:', e);
        }
      }
    }, 30000);
    
    return () => clearInterval(notificationInterval);
  }, []);

  const deleteFood = async (id) => {
    try {
      setFoods(prev => prev.filter(food => food.id !== id));
      Toast.fire({ icon: 'success', title: 'Food deleted' });
    } catch (error) {
      console.error('Error deleting food:', error);
      Toast.fire({ icon: 'error', title: 'Failed to delete food' });
    }
  };
  
  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    // Add notification
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const notification = {
        id: Date.now(),
        title: `Order ${orderId} Updated`,
        message: `Status changed to ${status}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };
  
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const addNewFood = (newFood) => {
    setFoods(prev => [...prev, { ...newFood, id: Date.now() }]);
    setShowFoodPost(false);
  };
  
  const updateFood = (updatedFood) => {
    setFoods(prev => prev.map(f => f.id === updatedFood.id ? updatedFood : f));
    setShowEditFood(null);
  };

  return (
    <div className="py-2">
      <ChefDashboardHeader 
        setShowAnalytics={() => setShowAnalytics(true)}
        setShowBikers={() => setShowBikers(true)}
        setShowProfile={() => setShowProfile(true)}
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
      />
      
      <div className="d-flex border-bottom mb-4">
        <Button 
          variant={activeTab === 'products' ? 'primary' : 'light'} 
          className={`rounded-0 border-0 ${activeTab === 'products' ? 'fw-bold' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </Button>
        <Button 
          variant={activeTab === 'foods' ? 'primary' : 'light'} 
          className={`rounded-0 border-0 ${activeTab === 'foods' ? 'fw-bold' : ''}`}
          onClick={() => setActiveTab('foods')}
        >
          My Food Items
        </Button>
        <Button 
          variant={activeTab === 'orders' ? 'primary' : 'light'} 
          className={`rounded-0 border-0 ${activeTab === 'orders' ? 'fw-bold' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <Badge bg="danger" className="ms-2">
              {orders.filter(o => o.status === 'pending').length}
            </Badge>
          )}
        </Button>
      </div>
      
      {activeTab === 'products' && (
        <AdminProductsTable 
          products={foods} 
          onEdit={setShowEditFood}
          onDelete={deleteFood}
          onCreate={() => setShowFoodPost(true)}
        />
      )}
      
      {activeTab === 'foods' && (
        <>
          <AdminProductsTable 
            products={foods} 
            onEdit={setShowEditFood}
            onDelete={deleteFood}
            onCreate={() => setShowFoodPost(true)}
          />
          
          <Button 
            variant="success" 
            className="d-flex align-items-center rounded-pill px-4 py-2 mt-4 mx-auto"
            onClick={() => setShowFoodPost(true)}
            style={{
              background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
              border: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)'
            }}
          >
            <Plus className="me-2" /> Post New Food
          </Button>
        </>
      )}
      
      {activeTab === 'orders' && (
        <ChefOrders 
          orders={orders} 
          updateOrderStatus={updateOrderStatus}
          onViewDetails={setShowOrderDetails}
        />
      )}
      
    
      
      <OrderDetailsModal 
        order={showOrderDetails}
        show={!!showOrderDetails}
        onHide={() => setShowOrderDetails(null)}
        updateOrderStatus={updateOrderStatus}
      />
      
      {/* <AnalyticsSidebar 
        show={showAnalytics} 
        onHide={() => setShowAnalytics(false)}
        orders={orders}
      />
      
      <RidersSidebar 
        show={showBikers} 
        onHide={() => setShowBikers(false)}
        riders={riders}
      />
      
      <ChefProfile 
        show={showProfile} 
        onHide={() => setShowProfile(false)}
      /> */}
    </div>
  );
}