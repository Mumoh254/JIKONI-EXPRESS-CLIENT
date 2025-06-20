import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styled, { keyframes, css } from 'styled-components';

// --- Local Component Imports ---
import ChefDashboardHeader from './chefsDashboardHeader'; // This is your main header component
import AdminProductsTable from './productsTable/products'; // Your existing table component
import ChefOrders from './orders/chefOrders'; // Your existing orders component
import OrderDetailsModal from './orders/orderDetails'; // Your existing order details modal
import FoodPostForm from './foods/foodPostForm';
import EditFoodModal from './foods/foodEdit'; // Assuming this is the correct path for your EditFoodModal


// --- Jikoni Express Color Palette ---
const colors = {
    primary: '#FF4532',        // Jikoni Red (Main accent)
    secondary: '#00C853',      // Jikoni Green (Secondary accent, success)
    darkText: '#1A202C',       // Dark text for headings
    lightText: '#6C757D',      // Muted text for descriptions/placeholders
    lightBackground: '#F8F9FA', // Very light background for page/sections
    cardBackground: '#FFFFFF', // White for cards/modals
    borderColor: '#D1D9E6',    // Light border for inputs/dividers
    buttonHover: '#E6392B',    // Darker red on button hover
    tabActiveBg: '#FF4532',    // Active tab background (Jikoni Red)
    tabInactiveBg: '#F0F2F5',  // Inactive tab background
    tabActiveText: '#FFFFFF',  // Active tab text (white)
    tabInactiveText: '#1A202C', // Inactive tab text
    greenGradientStart: '#00D66E', // Lighter green for gradients
    greenGradientEnd: '#00B84D',    // Deeper green for gradients
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const tabUnderlineAnimation = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

// --- Styled Components ---
const StyledDashboardContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background: linear-gradient(150deg, ${colors.lightBackground} 0%, #E6EBF0 100%);
  min-height: 100vh;
  padding: 0rem 7rem;
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
    content: 'JIKONI EXPRESS';
    position: absolute;
    top: -20px;
    left: -20px;
    font-size: 5rem;
    font-weight: 900;
    color: rgba(255, 69, 50, 0.05);
    transform: rotate(-10deg);
    z-index: 0;
    pointer-events: none;
    user-select: none;
  }

  h1 {
    color: ${colors.darkText};
    font-weight: 800;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.05); /* Subtle text shadow */

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

  @media (max-width: 992px) {
    padding: 1.8rem 2rem;
    h1 {
      font-size: 2.2rem;
    }
    p {
      font-size: 1rem;
    }
    &::before {
      font-size: 4rem;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
    text-align: left; /* Keep text left-aligned even in column mode */
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
  margin-bottom: 1rem;
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
  padding: 1rem 1rem;
  font-weight: ${(props) => (props.$active ? 700 : 500)};
  font-size: 1.85rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap; /* Prevent text wrapping */

  &:hover {
    background-color: ${(props) => (props.$active ? colors.tabActiveBg : colors.lightBackground)};
    color: ${(props) => (props.$active ? colors.tabActiveText : colors.darkText)};
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }

  &:not(:last-child) {
    border-right: 1px solid ${colors.borderColor};
  }

  ${(props) => props.$active && css`
    box-shadow: 0 5px 15px rgba(255, 69, 50, 0.2);
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: ${colors.secondary};
      animation: ${tabUnderlineAnimation} 0.3s ease-out forwards;
    }
  `}

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
    width: 100%; /* Make tabs full width on mobile */
    &:not(:last-child) {
      border-right: none;
      border-bottom: 1px solid ${colors.borderColor};
    }
    &:first-child {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }
    &:last-child {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    }
  }
`;

const StyledPostFoodButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.greenGradientStart} 0%, ${colors.greenGradientEnd} 100%);
  border: none;
  font-weight: 600;
  padding: 0.8rem 1.88rem;
 
  box-shadow: 0 6px 20px rgba(0, 200, 83, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: white;
max-width:  50% ;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 200, 83, 0.4);
    color: white; /* Ensure text color remains white on hover */
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 10px rgba(0, 200, 83, 0.2);
    color: white; /* Ensure text color remains white on active */
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 1.5rem;
    font-size: 0.9rem;
    padding: 0.7rem 1.5rem;
  }
`;

const pulseBadge = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const StyledBadge = styled(Badge)`
  background-color: ${colors.primary} !important;
  font-weight: 700;
  padding: 0.4em 0.7em;
  border-radius: 50px;
  font-size: 0.8rem;
  animation: ${pulseBadge} 1s infinite alternate;
`;

// Mock Data (Moved outside component for stability and clarity)
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

const MySwal = withReactContent(Swal); // Use MySwal for consistency

const Toast = MySwal.mixin({
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
        popup: 'jikoni-toast-popup', // Ensure this class is defined in your global CSS if needed
        title: 'jikoni-toast-title',
        icon: 'jikoni-toast-icon'
    },
    background: colors.cardBackground,
    color: colors.darkText
});

/**
 * ChefDashboard Component
 * This component serves as the main dashboard for chefs, allowing them to manage
 * their food items and track incoming orders.
 *
 * @param {object} props - Component props
 * @param {function} props.setIsChefMode - Function to set the chef mode in the parent app.
 */
export default function ChefDashboard({ setIsChefMode }) {
    const [foodItems, setFoodItems] = useState([]); // Renamed from 'foods' for clarity
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('foods'); // Default to 'foods' tab
    const [showFoodPost, setShowFoodPost] = useState(false);
    const [showEditFood, setShowEditFood] = useState(null); // Holds the food object to be edited
    const [showOrderDetails, setShowOrderDetails] = useState(null); // Holds the order object for details modal
    const [notifications, setNotifications] = useState([]);
    const [chefDetails, setChefDetails] = useState({
        chefName: 'Chef Excellence',
        chefEmail: 'chef.excellence@jikoni.com',
        chefPhone: '+254712345678',
        chefAvailable: true,
        chefAvatarUrl: 'https://placehold.co/100x100/DDDDDD/A0AEC0?text=C' // Example avatar URL
    });

    // Effect to set chef mode in parent component
    useEffect(() => {
        setIsChefMode(true);
        return () => setIsChefMode(false);
    }, [setIsChefMode]);

    // Effect to load initial data and set up notification interval
    useEffect(() => {
        setFoodItems(mockFoods);
        setOrders(mockOrders);

        const initialNotifications = [
            { id: 1, title: 'New Order Received', message: 'Order #ORD004 for KES 2,300 from Jane Muthoni', timestamp: '2025-06-18T10:30:00Z', read: false },
            { id: 2, title: 'Order Status Update', message: 'Order #ORD002 is being prepared', timestamp: '2025-06-18T09:45:00Z', read: false },
        ];
        setNotifications(initialNotifications);

        // Simulate new order notifications
        const notificationInterval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance of a new notification every 30 seconds
                const newNotification = {
                    id: Date.now(),
                    title: 'New Order Arrived!',
                    message: `A fresh order #ORD${Math.floor(1000 + Math.random() * 9000)} just came in for KES ${Math.floor(500 + Math.random() * 3000)}.`,
                    timestamp: new Date().toISOString(), // Use ISO string for consistency
                    read: false
                };

                setNotifications(prev => [newNotification, ...prev]);

                try {
                    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
                    audio.play();
                } catch (e) {
                    console.warn('Audio play failed:', e); // Use warn for non-critical issues
                }
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(notificationInterval); // Cleanup on unmount
    }, []); // Empty dependency array means this runs once on mount

    /**
     * Handles the deletion of a food item.
     * @param {number} id - The ID of the food item to delete.
     */
    const deleteFood = async (id) => {
        try {
            setFoodItems(prev => prev.filter(food => food.id !== id));
            Toast.fire({ icon: 'success', title: 'Food item deleted successfully!' });
        } catch (error) {
            console.error('Error deleting food item:', error);
            Toast.fire({ icon: 'error', title: 'Failed to delete food item.' });
        }
    };

    /**
     * Updates the status of a specific order.
     * @param {string} orderId - The ID of the order to update.
     * @param {string} status - The new status of the order.
     */
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
                title: `Order ${orderId} Status Update`,
                message: `Status for order ${orderId} changed to "${status}".`,
                timestamp: new Date().toISOString(),
                read: false
            };
            setNotifications(prev => [notification, ...prev]);
            Toast.fire({ icon: 'info', title: `Order ${orderId} status updated to: ${status}` });
        }
    };

    /**
     * Marks a notification as read.
     * @param {number} id - The ID of the notification to mark as read.
     */
    const markNotificationAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    /**
     * Adds a new food item to the list.
     * @param {object} newFoodData - The data for the new food item.
     */
    const addNewFoodItem = (newFoodData) => { // Renamed for clarity
        setFoodItems(prev => [...prev, { ...newFoodData, id: Date.now(), available: true }]);
        setShowFoodPost(false);
        Toast.fire({ icon: 'success', title: 'New food item posted successfully!' });
    };

    /**
     * Updates an existing food item.
     * @param {object} updatedFoodData - The updated data for the food item.
     */
    const updateFoodItem = (updatedFoodData) => { // Renamed for clarity
        setFoodItems(prev => prev.map(f => f.id === updatedFoodData.id ? updatedFoodData : f));
        setShowEditFood(null);
        Toast.fire({ icon: 'success', title: 'Food item updated successfully!' });
    };

    /**
     * Updates the chef's personal details.
     * @param {object} updatedDetails - The new chef details.
     */
    const updateChefDetails = (updatedDetails) => {
        setChefDetails(updatedDetails);
        Toast.fire({ icon: 'success', title: 'Chef profile updated!' });
    };

    return (
        <StyledDashboardContainer>
            {/* --- Dashboard Header Section --- */}
            <DashboardHeaderSection>
               
                <ChefDashboardHeader
                    notifications={notifications}
                    markNotificationAsRead={markNotificationAsRead}
                    chefName={chefDetails.chefName}
                    chefAvatarUrl={chefDetails.chefAvatarUrl}
                    chefAvailable={chefDetails.chefAvailable}
                    chefDetails={chefDetails} // Pass full chef details
                    onUpdateChefDetails={updateChefDetails} // Pass update function
                />
            </DashboardHeaderSection>

            {/* --- Tab Navigation --- */}
            <TabNavigationContainer>
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

            {/* --- Conditional Content Based on Active Tab --- */}
            {activeTab === 'foods' && (
                <>
                    <StyledPostFoodButton
                        onClick={() => setShowFoodPost(true)}
                        className="mb-4"
                    >
                        <Plus className="" /> Post New Food
                    </StyledPostFoodButton>
                    <AdminProductsTable
                        foods={foodItems}
                        onEdit={setShowEditFood}
                        onDelete={deleteFood}
                    />
                </>
            )}

            {activeTab === 'orders' && (
                <ChefOrders
                    orders={orders}
                    updateOrderStatus={updateOrderStatus}
                    onViewDetails={setShowOrderDetails}
                />
            )}

            {/* --- Modals --- */}
            <FoodPostForm
                show={showFoodPost}
                onHide={() => setShowFoodPost(false)}
                setFoods={addNewFoodItem} // Changed to addNewFoodItem
            />

            {showEditFood && (
                <EditFoodModal
                    show={!!showEditFood} // Ensures boolean true/false
                    food={showEditFood}
                    onHide={() => setShowEditFood(null)}
                    onUpdate={updateFoodItem} // Changed to updateFoodItem
                />
            )}

            <OrderDetailsModal
                order={showOrderDetails}
                show={!!showOrderDetails} // Ensures boolean true/false
                onHide={() => setShowOrderDetails(null)}
                updateOrderStatus={updateOrderStatus}
            />
        </StyledDashboardContainer>
    );
}