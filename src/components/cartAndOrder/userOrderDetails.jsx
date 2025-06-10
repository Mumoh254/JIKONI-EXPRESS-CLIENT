import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiShoppingBag,
  FiKey,
  FiUser,
  FiAward,
  FiPhone,
  FiArrowLeft,
} from 'react-icons/fi';
import styled, { keyframes, css } from 'styled-components';

// --- Jikoni Express Color Palette (User's New Palette) ---
const colors = {
  primary: '#FF4532',       // Jikoni Red
  secondary: '#00C853',     // Jikoni Green (Now prominent!)
  darkText: '#1A202C',      // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6',   // Light border for inputs
  errorText: '#EF4444',     // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B',   // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  // Added accent for incentives, leveraging the green or a complementary shade
  accentComplement: '#FFC859', // Keeping a warm gold for contrast if needed, or using secondary
};

const BASE_URL = 'http://localhost:8000/apiV1/smartcity-ke';

// --- Styled Components ---

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
  50% { transform: scale(1.02); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2); }
  100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
`;

const stripedAnimation = keyframes`
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
`;

// New 3D-like hover effect
const cardHoverEffect = css`
  transform: translateY(-6px) rotateX(1deg); /* Lift and subtle tilt */
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); /* More pronounced shadow */
`;

export const StyledContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background: linear-gradient(145deg, ${colors.lightBackground} 0%, #FAFAFA 100%);
  padding: 2.5rem; /* Slightly less padding to show more info upfront */
  border-radius: 18px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); /* Enhanced shadow */
  max-width: 1100px; /* Slightly narrower to keep content denser */
  margin: 2.5rem auto;
  animation: ${fadeIn} 0.7s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40px;
    left: -40px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, ${colors.borderColor} 10%, transparent 70%);
    opacity: 0.25;
    transform: rotate(15deg);
    z-index: 0;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -60px;
    right: -60px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, ${colors.borderColor} 10%, transparent 70%);
    opacity: 0.2;
    transform: rotate(-35deg);
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 1.2rem;
    margin: 1.2rem auto;
    border-radius: 12px;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: ${colors.secondary}; /* Use Jikoni Green */
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem; /* Slightly smaller */
  transition: color 0.3s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:hover {
    color: ${colors.primary};
    transform: translateX(-5px);
  }
`;

export const Title = styled.h2`
  color: ${colors.darkText};
  border-bottom: 3px solid ${colors.primary};
  padding-bottom: 1rem;
  margin-bottom: 2.5rem;
  font-size: 2.2rem; /* Slightly smaller for density */
  font-weight: 800;
  text-align: center;
  position: relative;
  text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.1);

  &::after {
    content: "Jikoni Express: Your Meal, Our Mission.";
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1rem; /* Smaller subtitle */
    font-weight: 500;
    color: ${colors.placeholderText}; /* Muted color for subtitle */
    white-space: nowrap;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    &::after {
      font-size: 0.85rem;
      bottom: -20px;
    }
  }
`;

export const StyledCard = styled.div`
  background-color: ${colors.cardBackground};
  border: 1px solid ${colors.borderColor};
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* Enhanced shadow */
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  margin-bottom: 1.5rem; /* Tighter spacing */
  padding: 1.8rem; /* Slightly less padding */
  position: relative;
  overflow: hidden;
  z-index: 1;

  &:hover {
    ${cardHoverEffect}
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 50%; /* Only half of the top border */
    height: 4px; /* Thinner */
    background: ${colors.primary}; /* Primary color top border */
    border-radius: 14px 0 0 0;
  }
   &::after { /* New: secondary color accent on the other side */
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    right: 0;
    height: 4px;
    background: ${colors.secondary}; /* Secondary color top border */
    border-radius: 0 14px 0 0;
  }
`;

export const CardTitle = styled.h5`
  color: ${colors.darkText};
  font-size: 1.2rem; /* Smaller title for density */
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-shadow: 0 0.5px 0.5px rgba(0,0,0,0.05);

  svg {
    color: ${colors.primary}; /* Icons primarily red */
    font-size: 1.5rem; /* Smaller icons */
  }
`;

export const StatusBadge = styled.span`
  padding: 0.7rem 1.2rem;
  font-size: 0.95rem; /* Smaller text */
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 25px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  background-color: ${(props) => {
    switch (props.$variant) {
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      case 'primary': return colors.primary;
      case 'success': return colors.secondary; /* Success is now Jikoni Green! */
      case 'danger': return colors.errorText;
      default: return colors.placeholderText; // Default to muted
    }
  }};
  box-shadow: 0 3px 8px ${(props) => {
    switch (props.$variant) {
      case 'warning': return `${colors.warning}40`;
      case 'info': return `${colors.info}40`;
      case 'primary': return `${colors.primary}40`;
      case 'success': return `${colors.secondary}40`; /* Green shadow */
      case 'danger': return `${colors.errorText}40`;
      default: return `${colors.placeholderText}40`;
    }
  }};

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.5rem 0.9rem;
    margin-bottom: 0.5rem;
  }
`;

// Fixed ProgressBarFill component to be used inside StyledProgressBar
const ProgressBarFill = styled.div`
  height: 100%;
  border-radius: 10px;
  background-color: ${(props) => {
    switch (props.$variant) {
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      case 'primary': return colors.primary;
      case 'success': return colors.secondary; /* Success is now Jikoni Green! */
      case 'danger': return colors.errorText;
      default: return colors.placeholderText;
    }
  }};
  width: ${(props) => props.$now}%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem; /* Smaller text */
  transition: width 0.5s ease-in-out;

  ${(props) => props.$animated && css`
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
    animation: ${stripedAnimation} 1s linear infinite;
  `}
`;

export const StyledProgressBar = styled.div`
  width: 100%;
  max-width: 350px; /* Slightly narrower */
  height: 1.8rem; /* Slightly less tall */
  border-radius: 10px;
  overflow: hidden;
  margin-left: 1rem;
  background-color: ${colors.borderColor};
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);

  @media (max-width: 768px) {
    max-width: 100%;
    height: 1.5rem;
    margin-left: 0;
    margin-top: 0.8rem;
  }
`;

export const AvatarPlaceholder = styled.div`
  width: 70px; /* Smaller avatar */
  height: 70px;
  border-radius: 50%;
  background-color: ${colors.lightBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.primary};
  font-weight: bold;
  font-size: 2.2rem; /* Smaller icon/text */
  border: 3px solid ${colors.primary};
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
`;

export const PersonName = styled.div`
  color: ${colors.darkText};
  font-weight: 700;
  font-size: 1.15rem; /* Smaller name */

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const PersonDetails = styled.div`
  color: ${colors.placeholderText}; /* Muted details */
  font-size: 0.9rem; /* Smaller details */
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const CertListItem = styled.li`
  color: ${colors.placeholderText}; /* Muted text */
  margin-bottom: 0.3rem;
  font-size: 0.85rem; /* Smaller list item */
  list-style: disc;
  margin-left: 1.2rem;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px; /* Tighter spacing */
  background-color: ${colors.cardBackground};
  border: 1px solid ${colors.borderColor};
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 1.5rem;

  th, td {
    padding: 1rem 1.5rem; /* Slightly less padding */
    text-align: left;
    border-bottom: 1px solid ${colors.borderColor};
  }

  thead th {
    color: ${colors.darkText};
    font-weight: 700;
    font-size: 0.95rem; /* Smaller header text */
    border-bottom: 2px solid ${colors.secondary}; /* Jikoni Green header border */
    background-color: ${colors.lightBackground};
  }

  tbody tr {
    transition: background-color 0.2s ease, transform 0.2s ease;
    border-radius: 8px;
    overflow: hidden;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: ${colors.lightBackground};
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  }

  td {
    color: ${colors.darkText};
    vertical-align: middle;
    font-size: 0.9rem; /* Smaller cell text */
  }
`;

export const FoodItemImage = styled.img`
  width: 60px; /* Smaller image */
  height: 60px;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  flex-shrink: 0;
  border: 1px solid ${colors.borderColor};
`;

export const SummaryDl = styled.dl`
  margin-bottom: 0;
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.6rem 1.2rem; /* Tighter gap */
`;

export const SummaryDt = styled.dt`
  color: ${colors.darkText};
  font-weight: 600;
  font-size: 0.95rem; /* Smaller text */
  grid-column: 1;
`;

export const SummaryDd = styled.dd`
  color: ${colors.darkText};
  font-weight: 700;
  font-size: 0.95rem; /* Smaller text */
  text-align: end;
  grid-column: 2;
`;

export const SummaryTotal = styled(SummaryDd)`
  color: ${colors.primary};
  font-weight: 800;
  font-size: 1.4rem; /* Slightly smaller total but still prominent */
  padding-top: 0.75rem;
`;

export const SummaryDivider = styled.div`
  border-top: 1px dashed ${colors.borderColor}; /* Thinner dashed line */
  margin-top: 1rem;
  margin-bottom: 1rem;
  grid-column: 1 / -1;
`;

export const OtpSection = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: ${colors.lightBackground};
  border-radius: 14px;
  border: 1px dashed ${colors.secondary}; /* Jikoni Green dashed border */
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
`;

export const OtpDisplayBox = styled.div`
  background: rgba(255, 255, 255, 0.5); /* Lighter glassmorphism */
  backdrop-filter: blur(8px); /* Slightly less blur */
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  display: inline-block;
  padding: 0.8rem 1.5rem;
  font-size: 2.5rem; /* Smaller OTP */
  font-weight: 800;
  letter-spacing: 4px;
  color: ${colors.secondary}; /* Jikoni Green for OTP! */
  margin-bottom: 0.8rem;
  user-select: none;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.08);
  box-shadow: inset 0 0 5px rgba(255,255,255,0.3), 0 3px 10px rgba(0,0,0,0.08);
`;

export const OtpInstructionText = styled.p`
  color: ${colors.placeholderText};
  font-size: 0.85rem; /* Smaller text */
  font-weight: 500;
  margin-bottom: 0;
  line-height: 1.5;
`;

export const RiderActionButton = styled.button`
  background-color: ${(props) => (props.$variant === 'primary' ? colors.primary : 'transparent')};
  border: 1px solid ${colors.primary}; /* Thinner border */
  color: ${(props) => (props.$variant === 'primary' ? colors.cardBackground : colors.primary)};
  padding: 0.7rem 1.2rem; /* Tighter padding */
  font-size: 0.9rem; /* Smaller text */
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${(props) => (props.$variant === 'primary' ? colors.buttonHover : colors.primary)};
    color: ${colors.cardBackground};
    border-color: ${(props) => (props.$variant === 'primary' ? colors.buttonHover : colors.primary)};
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  &:disabled {
    background-color: ${colors.disabledButton};
    border-color: ${colors.disabledButton};
    color: ${colors.cardBackground};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const IncentiveCard = styled(StyledCard)`
  background: linear-gradient(145deg, ${colors.secondary} 0%, #00B050 120%); /* Stronger green gradient */
  border: none;
  text-align: center;
  padding: 3.5rem 2.5rem;
  border-radius: 22px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  margin-top: 4rem;
  position: relative;
  overflow: hidden;
  animation: ${pulse} 2.5s infinite ease-in-out;
  color: white;

  &::before {
    content: '';
    position: absolute;
    top: -70px;
    left: -70px;
    width: 200px;
    height: 200px;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    transform: rotate(40deg);
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -90px;
    right: -90px;
    width: 250px;
    height: 250px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: rotate(-25deg);
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

export const IncentiveIcon = styled(FiAward)`
  color: white;
  font-size: 4rem; /* Slightly smaller icon */
  margin-bottom: 1.8rem;
  filter: drop-shadow(0 3px 8px rgba(0,0,0,0.3));
`;

export const IncentiveTitle = styled.h3`
  color: white;
  font-size: 2.8rem; /* Slightly smaller, bold */
  font-weight: 800;
  margin-bottom: 1.2rem;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

export const IncentiveText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem; /* Smaller body text */
  line-height: 1.7;
  max-width: 750px;
  margin: 0 auto 2rem auto;
  text-shadow: 0 0.5px 1px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const ProgressBadge = styled.span`
  font-size: 1.1rem; /* Smaller text */
  padding: 0.8rem 1.6rem;
  border-radius: 25px;
  background-color: ${colors.cardBackground};
  color: ${colors.secondary}; /* Jikoni Green text */
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: inline-block;
  margin-bottom: 1.2rem;
`;

export const ShopNowButton = styled.button`
  background-color: ${colors.cardBackground};
  border: none;
  padding: 1.2rem 3rem; /* Slightly less padding */
  font-size: 1.2rem; /* Smaller text */
  font-weight: 700;
  border-radius: 10px;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease, color 0.3s ease;
  letter-spacing: 0.8px;
  color: ${colors.primary};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);

  &:hover {
    background-color: ${colors.primary};
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.9rem 2rem;
  }
`;

// --- OrderDetailsLoader Component (Unchanged logic, uses base HTML elements) ---
const OrderDetailsLoader = ({ children }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hardcode the orderId directly in the component for demonstration purposes
  const hardcodedOrderId = 'JE-250610-N2VI'; // Replace with your desired hardcoded order ID

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${BASE_URL}/orders/${hardcodedOrderId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error(`Order with ID ${hardcodedOrderId} not found.`);
          throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const intervalId = setInterval(fetchOrder, 30000);
    return () => clearInterval(intervalId);
  }, [hardcodedOrderId, navigate]);

  const statusConfig = {
    'preparing': { color: 'warning', progress: 25, icon: <FiClock />, display: 'Preparing' },
    'assigned': { color: 'info', progress: 50, icon: <FiPackage />, display: 'Rider Assigned' },
    'in-transit': { color: 'primary', progress: 75, icon: <FiTruck />, display: 'On the Way' },
    'delivered': { color: 'success', progress: 100, icon: <FiCheckCircle />, display: 'Delivered' },
    'cancelled': { color: 'danger', progress: 0, icon: <FiClock />, display: 'Cancelled' }
  };

  if (loading)
    return (
      <div style={{ textAlign: 'center', margin: '5rem 0' }}>
        <div style={{
          border: `4px solid ${colors.borderColor}`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '1rem', color: colors.darkText }}>Loading your Jikoni Express order details...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  if (error)
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '2rem', borderRadius: '12px', boxShadow: `0 5px 20px rgba(0,0,0,0.08)`, backgroundColor: colors.cardBackground }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '0.25rem',
          padding: '1rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <h5 style={{ color: '#721c24', margin: '0 0 0.5rem 0' }}>Oops! An error occurred.</h5>
          <p style={{ margin: '0 0 0.5rem 0' }}>{error}</p>
          <p style={{ margin: '0' }}>Please check the order ID or try again later.</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${colors.primary}`,
              color: colors.primary,
              padding: '0.8rem 2rem',
              fontSize: '1.1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => { e.target.style.backgroundColor = colors.primary; e.target.style.color = 'white'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = colors.primary; }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );

  return children(order, statusConfig);
};

// --- UserOrderDetails Component (Uses Styled Components) ---
const UserOrderDetails = () => {
  return (
    <OrderDetailsLoader>
      {(order, statusConfig) => {
        const currentStatusConfig =
          statusConfig[order.status] || {
            color: 'secondary',
            progress: 0,
            icon: <FiClock />,
            display: 'Unknown Status'
          };

        const riderName = order.rider?.user?.Name || 'Not yet assigned';
        const riderVehicleType = order.rider?.vehicleType || '';
        const riderLicensePlate = order.rider?.licensePlate ? ` • ${order.rider.licensePlate}` : '';
        const riderPhoneNumber = order.rider?.user?.PhoneNumber || null;

        const chefName = order.chef?.user?.Name || 'N/A';
        const chefSpeciality = order.chef?.speciality || 'Culinary Expert';
        const chefExperience = order.chef?.experienceYears ? `${order.chef.experienceYears} years experience` : 'Experience varies';
        const chefCertifications = order.chef?.certifications || [];

        const foodTitle = order.foodListing?.title || 'Delicious Meal';
        const foodImageUrl = order.foodListing?.photoUrls?.[0] || 'https://via.placeholder.com/100?text=Jikoni+Express';
        const foodPrice = order.foodListing?.price || 0;
        const orderQuantity = order.quantity || 1;
        const orderTotalPrice = order.totalPrice || 0;

        return (
          <StyledContainer>
            <BackButton onClick={() => window.history.back()} aria-label="Back to previous page">
              <FiArrowLeft /> Back to Orders
            </BackButton>

            <Title>Order Details</Title>

            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '4rem', gap: '1.5rem' }}> {/* Tighter overall gap */}
              <div style={{ flex: '3', minWidth: '300px' }}> {/* Adjusted flex basis and min-width */}
                {/* Order Status Card */}
                <StyledCard>
                  <CardTitle><FiPackage /> Order Status</CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <StatusBadge $variant={currentStatusConfig.color}>
                      {currentStatusConfig.icon}
                      {currentStatusConfig.display}
                    </StatusBadge>
                    <StyledProgressBar>
                      <ProgressBarFill
                        $now={currentStatusConfig.progress}
                        $variant={currentStatusConfig.color}
                        $animated={order.status !== 'delivered' && order.status !== 'cancelled'}
                      >
                        {currentStatusConfig.progress}%
                      </ProgressBarFill>
                    </StyledProgressBar>
                  </div>
                </StyledCard>

                {/* Order Summary Card - Moved higher for immediate info */}
                <StyledCard>
                  <CardTitle><FiCheckCircle /> Order Summary</CardTitle>
                  <SummaryDl>
                    <SummaryDt>Order ID:</SummaryDt>
                    <SummaryDd>**{order.id}**</SummaryDd> {/* Bold Order ID */}

                    <SummaryDt>Order Date:</SummaryDt>
                    <SummaryDd>
                      {new Date(order.createdAt).toLocaleDateString('en-KE', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </SummaryDd>

                    <SummaryDt>Delivery Type:</SummaryDt>
                    <SummaryDd className="text-capitalize">{order.deliveryType || 'N/A'}</SummaryDd>

                    <SummaryDt>Payment Method:</SummaryDt>
                    <SummaryDd className="text-capitalize">{order.paymentMethod || 'N/A'}</SummaryDd>

                    <SummaryDt>Delivery Address:</SummaryDt>
                    <SummaryDd>{order.deliveryAddress || 'N/A'}</SummaryDd>

                    <SummaryDivider />

                    <SummaryDt style={{ fontWeight: 'bold' }}>Total Amount:</SummaryDt>
                    <SummaryTotal>
                      Ksh {orderTotalPrice.toFixed(2)}
                    </SummaryTotal>
                  </SummaryDl>
                </StyledCard>

                {/* Order Items Table - Remains prominent */}
                <CardTitle><FiShoppingBag /> Your Order Items</CardTitle>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'end' }}>Unit Price</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'end' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FoodItemImage
                            src={foodImageUrl}
                            alt={foodTitle}
                          />
                          <span>{foodTitle}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'end' }}>Ksh {foodPrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>{orderQuantity}</td>
                      <td style={{ textAlign: 'end' }}>Ksh {(foodPrice * orderQuantity).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </StyledTable>
              </div>

              <div style={{ flex: '1', minWidth: '300px' }}> {/* Adjusted flex basis */}

                 {/* OTP Section (Conditionally Rendered) - Moved higher if available */}
                 {order.otpCode && order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <OtpSection>
                    <CardTitle>
                      <FiKey style={{ marginRight: '0.5rem' }} />
                      Your Delivery OTP
                    </CardTitle>
                    <OtpDisplayBox>
                      {order.otpCode}
                    </OtpDisplayBox>
                    <OtpInstructionText>
                      Please show this **One-Time Password** to the rider upon delivery for verification.
                    </OtpInstructionText>
                  </OtpSection>
                )}

                {/* Rider Information Card (Conditionally Rendered) */}
                {order.rider && (
                  <StyledCard>
                    <CardTitle><FiTruck /> Rider Information</CardTitle>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <AvatarPlaceholder style={{ marginRight: '1.5rem' }}>
                        {riderName.charAt(0).toUpperCase()}
                      </AvatarPlaceholder>
                      <div>
                        <PersonName>{riderName}</PersonName>
                        <PersonDetails>
                          {riderVehicleType} {riderLicensePlate}
                        </PersonDetails>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                      {riderPhoneNumber && (
                        <RiderActionButton as="a" href={`tel:${riderPhoneNumber}`} aria-label={`Call rider ${riderName}`}>
                          <FiPhone /> Call Rider
                        </RiderActionButton>
                      )}
                      <RiderActionButton $variant="primary" onClick={() => alert('Tracking functionality coming soon!')} aria-label="Track your order">
                        Track Order
                      </RiderActionButton>
                    </div>
                  </StyledCard>
                )}

                {/* Chef Information Card - Remains a bit lower but clearly visible */}
                <StyledCard>
                  <CardTitle><FiUser /> Chef Information</CardTitle>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <AvatarPlaceholder style={{ marginRight: '1.5rem' }}>
                      {chefName.charAt(0).toUpperCase()}
                    </AvatarPlaceholder>
                    <div>
                      <PersonName>{chefName}</PersonName>
                      <PersonDetails>
                        {chefSpeciality} {chefExperience && ` • ${chefExperience}`}
                      </PersonDetails>
                    </div>
                  </div>
                  {chefCertifications.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <CardTitle as="h6" style={{ marginBottom: '0.8rem' }}><FiAward size={18} /> Certifications & Expertise</CardTitle>
                      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {chefCertifications.map((cert, index) => (
                          <CertListItem key={index}>{cert}</CertListItem>
                        ))}
                      </ul>
                    </div>
                  )}
                </StyledCard>


              </div>
            </div>

            {/* Jikoni Express Incentive/Advertisement */}
            <div style={{ marginTop: '4rem' }}> {/* Slightly less top margin */}
              <IncentiveCard>
                <IncentiveIcon />
                <IncentiveTitle>
                  Spice Up Your Life with Jikoni Express!
                </IncentiveTitle>
                <IncentiveText>
                  Every order brings you closer to exclusive rewards. Complete **3 more orders** this month to unlock premium discounts and automatically enter our drawing for a free gourmet meal!
                </IncentiveText>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 2rem' }}>
                  <ProgressBadge>
                    Current Progress: {order.userOrdersCount || 1}/3 orders
                  </ProgressBadge>
                </div>
                <ShopNowButton onClick={() => window.location.href = '/menu'} aria-label="Shop now and earn points with Jikoni Express">
                  <FiShoppingBag />
                  Explore Our Menu & Earn Points!
                </ShopNowButton>
              </IncentiveCard>
            </div>
          </StyledContainer>
        );
      }}
    </OrderDetailsLoader>
  );
};

export default UserOrderDetails;