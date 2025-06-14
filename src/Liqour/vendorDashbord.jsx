import React, { useState, useEffect } from 'react';
import ChefDashboardHeader from '../components/chefs/chefsDashboardHeader'; // Assuming this component is handled separately
import AdminProductsTable from '../components/chefs/productsTable/products'; // Your existing table component
import ChefOrders from '../components/chefs/orders/chefOrders'; // Your existing orders component
import OrderDetailsModal from '../components/chefs/orders/orderDetails'; // Your existing order details modal
import { Button, Badge } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';


import withReactContent from 'sweetalert2-react-content';
import styled, { keyframes, css } from 'styled-components'; // Make sure 'css' is imported!
import FoodPostForm from '../components/chefs/foods/foodPostForm';
import EditFoodModal from '../components/chefs/foods/foodEdit'; // Assuming this is the correct path for your EditFoodModal


// --- Jikoni Express Color Palette (Expanded for richer UI) ---
const colors = {
  primary: '#FF4532',       // Jikoni Red (Main accent)
  secondary: '#00C853',     // Jikoni Green (Secondary accent, success)
  darkText: '#1A202C',      // Dark text for headings
  lightText: '#6C757D',     // Muted text for descriptions/placeholders
  lightBackground: '#F8F9FA', // Very light background for page/sections
  cardBackground: '#FFFFFF', // White for cards/modals
  borderColor: '#D1D9E6',   // Light border for inputs/dividers
  errorText: '#EF4444',     // Red for errors
  buttonHover: '#E6392B',   // Darker red on button hover
  tabActiveBg: '#FF4532',   // Active tab background (Jikoni Red)
  tabInactiveBg: '#F0F2F5', // Inactive tab background
  tabActiveText: '#FFFFFF', // Active tab text (white)
  tabInactiveText: '#1A202C', // Inactive tab text
  gradientRedStart: '#FF6F59', // Lighter red for gradients
  gradientRedEnd: '#FF4532',   // Deeper red for gradients
  greenGradientStart: '#00D66E', // Lighter green for gradients
  greenGradientEnd: '#00B84D',   // Deeper green for gradients
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Define a separate keyframe for the tab underline animation
const tabUnderlineAnimation = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

// --- Styled Components ---

const StyledDashboardContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background: linear-gradient(150deg, ${colors.lightBackground} 0%, #E6EBF0 100%);
  min-height: 100vh;
  padding: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const DashboardHeaderSection = styled.div`
  background-color: ${colors.cardBackground};
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem 2.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: 'JIKONI EXPRESS'; /* JIKONI EXPRESS branding here! */
    position: absolute;
    top: -20px;
    left: -20px;
    font-size: 5rem;
    font-weight: 900;
    color: rgba(255, 69, 50, 0.05); /* Very light Jikoni Red */
    transform: rotate(-10deg);
    z-index: 0;
    pointer-events: none;
    user-select: none; /* Prevent text selection */
  }

  h1 {
    color: ${colors.darkText};
    font-weight: 800;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
    span {
      color: ${colors.primary};
    }
  }

  p {
    color: ${colors.lightText};
    font-size: 1.1rem;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
    text-align: center;
    h1 {
      font-size: 2rem;
      margin-bottom: 0.2rem;
    }
    p {
      font-size: 0.95rem;
    }
    &::before {
      font-size: 3rem;
      top: 10px;
      left: 10px;
    }
  }
`;

const TabNavigationContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${colors.borderColor};
  margin-bottom: 2rem;
  background-color: ${colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  overflow: hidden;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }
`;

const StyledTabButton = styled(Button)`
  flex: 1;
  background-color: ${(props) => (props.$active ? colors.tabActiveBg : colors.tabInactiveBg)};
  color: ${(props) => (props.$active ? colors.tabActiveText : colors.tabInactiveText)};
  border: none;
  border-radius: 0;
  padding: 1rem 1.5rem;
  font-weight: ${(props) => (props.$active ? 700 : 500)};
  font-size: 1.05rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${(props) => (props.$active ? colors.tabActiveBg : colors.lightBackground)};
    color: ${(props) => (props.$active ? colors.tabActiveText : colors.darkText)};
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }

  &:not(:last-child) {
    border-right: 1px solid ${colors.borderColor};
  }

  ${(props) => props.$active && css` /* Wrapped with css helper */
    box-shadow: 0 5px 15px rgba(255, 69, 50, 0.2);
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: ${colors.secondary}; /* Green highlight for active tab */
      animation: ${tabUnderlineAnimation} 0.3s ease-out forwards;
    }
  `}

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
    width: 100%;
    &:not(:last-child) {
      border-right: none;
      border-bottom: 1px solid ${colors.borderColor};
    }
  }
`;

const StyledPostFoodButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.greenGradientStart} 0%, ${colors.greenGradientEnd} 100%);
  border: none;
  font-weight: 600;
  padding: 0.8rem 1.8rem;
  border-radius: 50px; /* Pill shape */
  box-shadow: 0 6px 20px rgba(0, 200, 83, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: white;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 200, 83, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 10px rgba(0, 200, 83, 0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 1.5rem;
    font-size: 0.9rem;
    padding: 0.7rem 1.5rem;
  }
`;

const StyledBadge = styled(Badge)`
  background-color: ${colors.primary} !important; /* Force Jikoni Red for badge */
  font-weight: 700;
  padding: 0.4em 0.7em;
  border-radius: 50px;
  font-size: 0.8rem;
  animation: ${keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  `} 1s infinite alternate;
`;

// Mock Data (kept for demonstration purposes)
const mockOrders = [
  {
    id: 'ORD001', customer: { name: 'John Doe', phone: '+254712345678' },
    items: [{ name: 'Nyama Choma', quantity: 2, price: 1200 }, { name: 'Ugali', quantity: 1, price: 200 }],
    total: 1500, orderTime: '2023-07-15T10:30:00', status: 'pending', rider: null,
    deliveryAddress: '123 Mombasa Road, Nairobi', pickupLocation: 'Jikoni Express Kitchen, Westlands', deliveryNotes: 'Call when arriving'
  },
  {
    id: 'ORD002', customer: { name: 'Mary Wanjiku', phone: '+254722334455' },
    items: [{ name: 'Chapati', quantity: 4, price: 200 }, { name: 'Beef Stew', quantity: 2, price: 800 }],
    total: 1000, orderTime: '2023-07-15T09:15:00', status: 'preparing',
    rider: { name: 'Peter Mwangi', phone: '+254733445566', rating: 4.8, totalDeliveries: 42 },
    deliveryAddress: '456 Koinange Street, CBD', pickupLocation: 'Jikoni Express Kitchen, Westlands', deliveryNotes: 'Gate code: 1234'
  },
  {
    id: 'ORD003', customer: { name: 'David Kimani', phone: '+254711223344' },
    items: [{ name: 'Pilau', quantity: 3, price: 900 }, { name: 'Salad', quantity: 1, price: 150 }],
    total: 1050, orderTime: '2023-07-14T18:45:00', status: 'delivered',
    rider: { name: 'Susan Akinyi', phone: '+254744556677', rating: 4.9, totalDeliveries: 68 },
    deliveryAddress: '789 Thika Road, Ruiru', pickupLocation: 'Jikoni Express Kitchen, Westlands', deliveryNotes: 'Leave at security desk'
  }
];

const mockFoods = [
  { id: 1, name: 'Nyama Choma', price: 1200, description: 'Grilled meat', available: true, slug: 'nyama-choma', category: 'Main Courses', brand: 'Jikoni Chef', quantity: 50, sizes: ['Standard'] },
  { id: 2, name: 'Ugali', price: 200, description: 'Maize flour dish', available: true, slug: 'ugali', category: 'Side Dishes', brand: 'Local Bites', quantity: 15, sizes: ['Small', 'Large'] },
  { id: 3, name: 'Chapati', price: 50, description: 'Flatbread', available: true, slug: 'chapati', category: 'Side Dishes', brand: 'Local Bites', quantity: 5, sizes: ['Single', 'Pack of 5'] },
  { id: 4, name: 'Beef Stew', price: 400, description: 'Tender beef in sauce', available: false, slug: 'beef-stew', category: 'Main Courses', brand: 'Jikoni Chef', quantity: 0, sizes: ['Standard'] }
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
  },
  customClass: {
    popup: 'jikoni-toast-popup', // Custom class for styling
    title: 'jikoni-toast-title',
    icon: 'jikoni-toast-icon'
  },
  background: colors.cardBackground, // Use card background for toasts
  color: colors.darkText // Dark text for readability
}));

export default function VendorDashboard({ setIsChefMode }) {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [showFoodPost, setShowFoodPost] = useState(false); // For "Add Product" modal
  const [showEditFood, setShowEditFood] = useState(null); // For "Edit Product" modal, holds item to edit
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
    setFoods(mockFoods);
    setOrders(mockOrders);
    setRiders(mockRiders);

    const initialNotifications = [
      { id: 1, title: 'New Order Received', message: 'Order #ORD004 for KES 2,300 from Jane Muthoni', time: '10:30 AM', read: false },
      { id: 2, title: 'Order Status Update', message: 'Order #ORD002 is being prepared', time: '9:45 AM', read: false },
    ];
    setNotifications(initialNotifications);

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

        try {
          const audio = new Audio('[https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3](https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3)');
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
      // In a real app, make an API call here. Mocking success for now.
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

  // This is the function passed to FoodPostForm for new creations
  const addNewFood = (newFoodData) => {
    // In a real app, you'd send newFoodData to your backend.
    // For mock, we just add it to the state.
    setFoods(prev => [...prev, { ...newFoodData, id: Date.now(), available: true }]); // Assign a mock ID
    setShowFoodPost(false); // Close the modal
    Toast.fire({ icon: 'success', title: 'New Food Posted!' });
  };

  // This is the function passed to EditFoodModal for updates
  const updateFood = (updatedFoodData) => {
    // In a real app, you'd send updatedFoodData to your backend.
    setFoods(prev => prev.map(f => f.id === updatedFoodData.id ? updatedFoodData : f));
    setShowEditFood(null); // Close the modal
    Toast.fire({ icon: 'success', title: 'Food Updated!' });
  };

  return (
    <StyledDashboardContainer>
      <DashboardHeaderSection>
        <div>
          <h1>Welcome, <span>Chef!</span></h1>
          <p>Manage your culinary masterpieces and incoming orders.</p>
        </div>
        <ChefDashboardHeader
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
        />
      </DashboardHeaderSection>

      <TabNavigationContainer>
        <StyledTabButton
          $active={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
        >
          Products
        </StyledTabButton>
        <StyledTabButton
          $active={activeTab === 'foods'}
          onClick={() => setActiveTab('foods')}
        >
          My Food Items
        </StyledTabButton>
        <StyledTabButton
          $active={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        >
          Orders
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <StyledBadge className="ms-2">
              {orders.filter(o => o.status === 'pending').length}
            </StyledBadge>
          )}
        </StyledTabButton>
      </TabNavigationContainer>

      {activeTab === 'products' && (
        <AdminProductsTable
          onEdit={setShowEditFood}
          onDelete={deleteFood}
          onCreate={() => setShowFoodPost(true)}
        />
      )}

      {activeTab === 'foods' && (
        <>
          <AdminProductsTable
            onEdit={setShowEditFood}
            onDelete={deleteFood}
            onCreate={() => setShowFoodPost(true)}
          />

          <StyledPostFoodButton
            onClick={() => setShowFoodPost(true)}
          >
            <Plus className="me-2" /> Post New Food
          </StyledPostFoodButton>
        </>
      )}

      {activeTab === 'orders' && (
        <ChefOrders
          orders={orders}
          updateOrderStatus={updateOrderStatus}
          onViewDetails={setShowOrderDetails}
        />
      )}

      {/* Modals are rendered here, controlled by state */}
      <FoodPostForm
        show={showFoodPost}
        onHide={() => setShowFoodPost(false)}
        setFoods={addNewFood}
      />

      {showEditFood && (
        <EditFoodModal
          show={!!showEditFood}
          food={showEditFood}
          onHide={() => setShowEditFood(null)}
          onUpdate={updateFood}
        />
      )}

      <OrderDetailsModal
        order={showOrderDetails}
        show={!!showOrderDetails}
        onHide={() => setShowOrderDetails(null)}
        updateOrderStatus={updateOrderStatus}
      />
    </StyledDashboardContainer>
  );
}
