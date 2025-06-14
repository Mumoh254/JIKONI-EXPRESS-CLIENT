import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useNavigate } from 'react-router-dom';
import ChefDashboardHeader from '../components/chefs/chefsDashboardHeader'; // Component name might need adjustment for full vendor branding
import AdminProductsTable from '../components/chefs/productsTable/products'; // Your existing table component, repurposed for liquor listings
import ChefOrders from '../components/chefs/orders/chefOrders'; // Your existing orders component, still relevant for vendors
import OrderDetailsModal from '../components/chefs/orders/orderDetails'; // Your existing order details modal
import { Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import styled, { keyframes, css } from 'styled-components';


// Jikoni Express SVG Logo - Re-defined here to ensure it's available within this file's scope.
const JikoniExpressLogoSvg = ({ size = 48, color = 'white' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4Z"
      fill={color}
    />
    <path
      d="M12 6V18M6 12H18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 9H7L6 12H18L17 9Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 17H14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


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
  disabledButton: '#CBD5E1', // Added for consistency with other forms
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

const StyledPostLiquorListingButton = styled(Button)`
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
  margin-top: 1.5rem; /* Added margin for spacing */

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 200, 83, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 10px rgba(0, 200, 83, 0.2);
  }

  &:disabled {
    background: ${colors.disabledButton};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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

// Mock Data (updated for Liquor Listings)
const mockLiquorListings = [
  { id: 1, name: 'Whiskey Brand X', price: 2500, description: 'Smooth aged whiskey', available: true, slug: 'whiskey-x', category: 'Whiskey', brand: 'Premium Spirits', quantity: 10, sizes: ['750ml'] },
  { id: 2, name: 'Local Craft Beer', price: 350, description: 'Refreshing Kenyan craft beer', available: true, slug: 'craft-beer', category: 'Beer', brand: 'NaiBrew', quantity: 50, sizes: ['500ml', 'Pack of 6'] },
  { id: 3, name: 'Imported Red Wine', price: 1800, description: 'Full-bodied Cabernet Sauvignon', available: true, slug: 'red-wine', category: 'Wine', brand: 'Vineyard Estates', quantity: 5, sizes: ['750ml'] },
  { id: 4, name: 'Vodka Classic', price: 1500, description: 'Triple distilled classic vodka', available: false, slug: 'vodka-classic', category: 'Vodka', brand: 'Spirit Masters', quantity: 0, sizes: ['1L'] }
];

const mockOrders = [
  {
    id: 'ORD001', customer: { name: 'John Doe', phone: '+254712345678' },
    items: [{ name: 'Whiskey Brand X', quantity: 1, price: 2500 }],
    total: 2500, orderTime: '2023-07-15T10:30:00', status: 'pending', rider: null,
    deliveryAddress: '123 Koinange Street, CBD', pickupLocation: 'Cheers Liquor Store, Westlands', deliveryNotes: 'Call when arriving'
  },
  {
    id: 'ORD002', customer: { name: 'Mary Wanjiku', phone: '+254722334455' },
    items: [{ name: 'Local Craft Beer (Pack of 6)', quantity: 1, price: 2100 }],
    total: 2100, orderTime: '2023-07-15T09:15:00', status: 'preparing',
    rider: { name: 'Peter Mwangi', phone: '+254733445566', rating: 4.8, totalDeliveries: 42 },
    deliveryAddress: '456 Mama Ngina Street, CBD', pickupLocation: 'Cheers Liquor Store, Westlands', deliveryNotes: 'Gate code: 1234'
  },
  {
    id: 'ORD003', customer: { name: 'David Kimani', phone: '+254711223344' },
    items: [{ name: 'Imported Red Wine', quantity: 2, price: 3600 }],
    total: 3600, orderTime: '2023-07-14T18:45:00', status: 'delivered',
    rider: { name: 'Susan Akinyi', phone: '+254744556677', rating: 4.9, totalDeliveries: 68 },
    deliveryAddress: '789 Karen Road, Karen', pickupLocation: 'Cheers Liquor Store, Westlands', deliveryNotes: 'Leave at security desk'
  }
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

export default function VendorDashboard({ setIsVendorMode }) { // Renamed prop to setIsVendorMode
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // State to store the user ID
  const [authMessage, setAuthMessage] = useState(''); // Message for auth status
  const redirectTimerRef = useRef(null); // Ref for the redirection timer

  const [liquorListings, setLiquorListings] = useState([]); // Renamed from foods
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]); // Keeping for potential future vendor-rider interaction view
  const [activeTab, setActiveTab] = useState('listings'); // Renamed default tab
  const [showLiquorPost, setShowLiquorPost] = useState(false); // Renamed from showFoodPost
  const [showEditLiquor, setShowEditLiquor] = useState(null); // Renamed from showEditFood
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);


  // Authentication check and redirection logic
  useEffect(() => {
    const getUserIdFromToken = () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          return payload?.id || payload?.userId || payload?._id || null;
        }
      } catch (err) {
        console.error("Token decode failed:", err);
      }
      return null;
    };

    const id = getUserIdFromToken();
    setUserId(id);

    // Clear any existing timer when the effect re-runs or component unmounts
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    if (!id) {
      setAuthMessage("⚠️ You must be logged in as a Vendor to access this dashboard. Redirecting to login...");

      // Set the timer and store its ID in the ref
      redirectTimerRef.current = setTimeout(() => {
        navigate("/login"); // Redirect to login page
      }, 4000); // 4 seconds delay
    } else {
      setAuthMessage(''); // Clear message if user is authenticated
    }

    // Cleanup function for the effect: clear timer when component unmounts
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [navigate]); // Depend on navigate

  // Set vendor mode on mount/unmount
  useEffect(() => {
    setIsVendorMode(true);
    return () => setIsVendorMode(false);
  }, [setIsVendorMode]);


  useEffect(() => {
    setLiquorListings(mockLiquorListings); // Use new mock data
    setOrders(mockOrders);
    setRiders(mockRiders); // Still keeping riders for potential future vendor-rider interaction view

    const initialNotifications = [
      { id: 1, title: 'New Liquor Order', message: 'Order #ORD004 for KES 4,500 from Alex Mwaniki', time: '10:30 AM', read: false },
      { id: 2, title: 'Order Status Update', message: 'Order #ORD002 is being prepared by your staff', time: '9:45 AM', read: false },
    ];
    setNotifications(initialNotifications);

    const notificationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification = {
          id: Date.now(),
          title: 'New Liquor Order Received!',
          message: `Order #${Math.floor(1000 + Math.random() * 9000)} for KES ${Math.floor(500 + Math.random() * 3000)} - Check Orders Tab!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        };

        setNotifications(prev => [newNotification, ...prev]);

        try {
          // Note: External audio URLs might have CORS issues or be unstable.
          // For a PWA, it's best to host your own audio file or use a data URI.
          // This is kept for demonstration purposes as per original code, but might not play directly.
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
          audio.play();
        } catch (e) {
          console.log('Audio play failed:', e);
        }
      }
    }, 30000);

    return () => clearInterval(notificationInterval);
  }, []);

  const deleteLiquorListing = async (id) => { // Renamed from deleteFood
    try {
      // In a real app, make an API call here. Mocking success for now.
      setLiquorListings(prev => prev.filter(listing => listing.id !== id));
      Toast.fire({ icon: 'success', title: 'Liquor Listing Deleted' });
    } catch (error) {
      console.error('Error deleting liquor listing:', error);
      Toast.fire({ icon: 'error', title: 'Failed to delete liquor listing' });
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
        title: `Order ${orderId} Status Updated`,
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

  // This is the function passed to FoodPostForm for new creations, now for Liquor Listings
  const addNewLiquorListing = (newListingData) => { // Renamed from addNewFood
    // In a real app, you'd send newListingData to your backend.
    // For mock, we just add it to the state.
    setLiquorListings(prev => [...prev, { ...newListingData, id: Date.now(), available: true }]); // Assign a mock ID
    setShowLiquorPost(false); // Close the modal
    Toast.fire({ icon: 'success', title: 'New Liquor Listing Posted!' });
  };

  // This is the function passed to EditFoodModal for updates, now for Liquor Listings
  const updateLiquorListing = (updatedListingData) => { // Renamed from updateFood
    // In a real app, you'd send updatedListingData to your backend.
    setLiquorListings(prev => prev.map(f => f.id === updatedListingData.id ? updatedListingData : f));
    setShowEditLiquor(null); // Close the modal
    Toast.fire({ icon: 'success', title: 'Liquor Listing Updated!' });
  };

  // Determine if the dashboard content should be disabled
  const isDashboardDisabled = !userId;

  return (
    <StyledDashboardContainer>
      {/* Authentication Message Alert */}
      {authMessage && (
        <Alert variant={userId ? "success" : "danger"} className="mb-4 text-center">
          {authMessage}
        </Alert>
      )}

      {/* Dashboard Header Section */}
      <DashboardHeaderSection>
        <div>
          {/* Branded Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <JikoniExpressLogoSvg size={48} color={colors.primary} /> {/* Use primary color for logo in header section */}
            <h1 style={{ color: colors.darkText, fontSize: '2.5rem', fontWeight: 800 }}>Jikoni <span>Express</span></h1>
          </div>
          <p style={{ fontSize: '1.1rem', color: colors.lightText }}>
            Welcome, <strong>Vendor!</strong> Manage your liquor listings and incoming orders.
          </p>
        </div>
        {/* ChefDashboardHeader is assumed to be a generic header that can adapt */}
        <ChefDashboardHeader
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
        />
      </DashboardHeaderSection>

      {/* Tab Navigation */}
      <TabNavigationContainer>
        <StyledTabButton
          $active={activeTab === 'listings'}
          onClick={() => setActiveTab('listings')}
          disabled={isDashboardDisabled}
        >
          My Liquor Listings
        </StyledTabButton>
        <StyledTabButton
          $active={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
          disabled={isDashboardDisabled}
        >
          Orders
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <StyledBadge className="ms-2">
              {orders.filter(o => o.status === 'pending').length}
            </StyledBadge>
          )}
        </StyledTabButton>
      </TabNavigationContainer>

      {/* Conditional Rendering of Content based on Active Tab */}
      {isDashboardDisabled && (
        <div style={{ textAlign: 'center', padding: '50px', color: colors.lightText }}>
          <Spinner animation="border" role="status" className="mb-3" />
          <p>Please log in as a vendor to view your dashboard.</p>
        </div>
      )}

      {!isDashboardDisabled && activeTab === 'listings' && (
        <>
          {/* Fallback for AdminProductsTable (assuming it handles mapping internally):
            The AdminProductsTable component should contain the logic to check if 
            'foods' (liquorListings) is empty and display a "No listings found" message.
            Example internal logic for AdminProductsTable (conceptual):
            {Array.isArray(foods) && foods.length > 0 ? (
                foods.map(item => <YourListingComponent key={item.id} item={item} />)
            ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: colors.lightText, backgroundColor: colors.cardBackground, borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>No liquor listings available yet.</p>
                  <p>Click the "Add New Liquor Listing" button below to get started and showcase your products!</p>
                </div>
            )}
          */}
          <AdminProductsTable
            foods={liquorListings} // Pass liquorListings, table component needs to adapt to `foods` prop name
            onEdit={setShowEditLiquor}
            onDelete={deleteLiquorListing}
            onCreate={() => setShowLiquorPost(true)}
          />

          <StyledPostLiquorListingButton
            onClick={() => setShowLiquorPost(true)}
          >
            <Plus className="me-2" /> Add New Liquor Listing
          </StyledPostLiquorListingButton>
        </>
      )}

      {!isDashboardDisabled && activeTab === 'orders' && (
        <ChefOrders // This component is generic enough for orders, but its internal UI might need chef-specific elements removed/renamed
          orders={orders}
          updateOrderStatus={updateOrderStatus}
          onViewDetails={setShowOrderDetails}
        />
      )}

      {/* Modals are rendered here, controlled by state */}
      <FoodPostForm // Re-purposed to handle liquor listings
        show={showLiquorPost}
        onHide={() => setShowLiquorPost(false)}
        setFoods={addNewLiquorListing} // Prop name 'setFoods' might need to be 'setLiquorListings' in FoodPostForm
      />

      {showEditLiquor && ( // Re-purposed to handle liquor listings
        <EditFoodModal
          show={!!showEditLiquor}
          food={showEditLiquor} // Prop name 'food' might need to be 'liquorListing' in EditFoodModal
          onHide={() => setShowEditLiquor(null)}
          onUpdate={updateLiquorListing}
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
