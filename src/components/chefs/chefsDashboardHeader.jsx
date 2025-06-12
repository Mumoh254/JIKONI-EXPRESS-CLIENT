import React, { useState } from 'react';
import { Button, Nav, Navbar, Offcanvas, Badge, Dropdown } from 'react-bootstrap';
import {
  Bell, Gear, List, BoxSeam, CurrencyDollar, PersonCircle, GraphUp, Truck, PersonFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import NotificationsPanel from './orders/notificationPanel'; // Assuming this path is correct
import styled, { keyframes, css } from 'styled-components';

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532',       // Jikoni Red
  secondary: '#00C853',     // Jikoni Green
  darkText: '#1A202C',      // Dark text
  lightText: '#6C757D',     // Muted text
  cardBackground: '#FFFFFF', // White for card background
  borderColor: '#E0E6ED',   // Lighter border for sleekness
  greenAccent: '#00B84D',   // Deep green for accents
  // New header background colors (derived from your snippet's implied light background)
  headerBackground: '#FFFFFF', // Explicitly white background as per snippet
  errorText: '#dc3545', // Standard Bootstrap danger color, matching your example's implied 'colors.error'
  disabledButton: '#CBD5E1', // For toggle background when offline
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseEffect = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// --- Styled Components ---

const StyledHeader = styled(Navbar)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px; /* Adjust as needed for spacing from content below */
  padding: 12px 15px; /* Compact padding as per snippet */
  border-bottom: 1px solid ${colors.borderColor};
  background-color: ${colors.headerBackground}; /* White background as per snippet */
  border-radius: 10px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow as per snippet */
  font-family: 'Inter', sans-serif; /* Consistent font */
  animation: ${fadeIn} 0.6s ease-out; /* Smooth entrance */

  @media (max-width: 992px) {
    padding: 10px 15px;
    margin-bottom: 20px;
  }
  @media (max-width: 768px) {
    flex-wrap: nowrap; /* Prevent wrapping main header elements */
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 15px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const GreetingText = styled.h1`
  color: ${colors.darkText};
  margin: 0;
  font-size: 24px; /* From snippet */
  font-weight: 700;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const BrandText = styled.p`
  color: ${colors.primary}; /* From snippet */
  font-size: 14px; /* From snippet */
  font-weight: 600;
  margin-top: 5px; /* From snippet */
  margin-bottom: 0;
`;

const AvailabilityStatus = styled.p`
  color: ${props => props.$available ? colors.primary : colors.errorText}; /* Using errorText for consistency */
  margin-top: 4px; /* From snippet */
  font-weight: 600;
  font-size: 14px; /* From snippet */
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-size: 16px; /* From snippet */
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  /* Adjust margin for hamburger toggle on the far right */
  gap: 15px; /* Spacing between profile/toggle and hamburger */

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const ProfileImage = styled.img`
  width: 50px; /* From snippet */
  height: 50px; /* From snippet */
  border-radius: 50%;
  margin-right: 12px; /* From snippet */
  border: 3px solid ${props => props.$available ? colors.primary : colors.errorText}; /* From snippet */
  object-fit: cover;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); /* From snippet */
  transition: border 0.3s ease;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }
`;

const ToggleAndLabelWrapper = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none; /* Hide toggle and label on mobile, keep hamburger */
  }
`;

const ToggleContainer = styled.div`
  position: relative;
  width: 48px; /* From snippet */
  height: 26px; /* From snippet */
  margin-right: 10px; /* From snippet */

  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
    cursor: pointer;
  }

  span.slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$available ? colors.primary : colors.disabledButton};
    border-radius: 50px;
    transition: 0.3s ease-in-out;
    cursor: pointer;
  }

  span.knob {
    position: absolute;
    height: 20px; /* From snippet */
    width: 20px; /* From snippet */
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.3s ease-in-out;
    transform: ${props => props.$available ? 'translateX(20px)' : 'translateX(0)'}; /* From snippet */
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
`;

const ToggleLabel = styled.div`
  font-size: 12px; /* From snippet */
  color: ${colors.darkText};
  font-weight: 600;
  white-space: nowrap;
`;

// Stats Container to fill the middle space
const HeaderStatsCompact = styled.div`
  display: flex;
  flex-grow: 1; /* Allows it to take up space in the middle */
  justify-content: center; /* Center the stats */
  gap: 30px; /* Space between stat items */
  margin: 0 20px; /* Horizontal margin from sides */

  @media (max-width: 992px) {
    gap: 15px;
    margin: 0 10px;
  }
  @media (max-width: 768px) {
    display: none; /* Hidden on small mobile */
  }
`;

const CompactStatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${colors.darkText};
  
  .icon {
    font-size: 1.5rem; /* Smaller icon for compactness */
    color: ${colors.greenAccent}; /* Jikoni Green */
    margin-bottom: 5px;
  }

  .value {
    font-weight: 700;
    font-size: 1.2rem; /* Compact value font size */
    color: ${colors.darkText};
  }

  .label {
    font-size: 0.75rem; /* Compact label font size */
    color: ${colors.lightText};
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

const StyledNavbarToggle = styled(Navbar.Toggle)`
  border: none !important;
  /* Color needs to be dark for light background, but default Bootstrap icon is dark */
  /* If default icon is used, it will be visible. If custom icon, set color to colors.darkText */
  .navbar-toggler-icon {
    /* If you use a custom SVG for hamburger, you might style it here */
    /* Example: background-image: url("data:image/svg+xml,%3csvg ... fill='${encodeURIComponent(colors.darkText)}' ...%3e"); */
  }
  color: ${colors.darkText} !important; /* Explicitly set color for potential custom icon/text */
  padding: 0.5rem;
  &:focus {
    box-shadow: none !important;
    background-color: rgba(0, 0, 0, 0.05); /* Light hover/focus effect */
  }
  .bi { /* For react-bootstrap-icons List */
    font-size: 1.5rem;
    color: ${colors.darkText}; /* Ensure List icon is dark */
  }
`;

const StyledOffcanvas = styled(Navbar.Offcanvas)`
  .offcanvas-header {
    background-color: ${colors.primary}; /* Jikoni Red for Offcanvas header */
    color: white;
    border-bottom: none;
    padding: 1rem 1.2rem;
    .offcanvas-title {
      font-weight: 700;
      font-size: 1.4rem;
    }
    .btn-close {
      filter: invert(1); /* Make close button white */
    }
  }
  .offcanvas-body {
    background-color: ${colors.cardBackground};
    padding: 1.2rem;
  }
`;

const NavItemButton = styled(Button)`
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.4rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  border-color: ${colors.borderColor} !important;

  &.btn-outline-primary {
    color: ${colors.primary};
    &:hover {
      background-color: ${colors.primary};
      color: white;
    }
  }

  &.btn-outline-secondary {
    color: ${colors.darkText};
    &:hover {
      background-color: ${colors.lightBackground};
      color: ${colors.darkText};
    }
  }

  .notification-badge {
    position: static;
    margin-left: auto;
    font-size: 0.7rem;
    padding: 0.3em 0.6em;
    animation: ${pulseEffect} 1.5s infinite;
  }

  .bi {
    font-size: 1.1rem;
  }
`;

const StyledDropdownMenu = styled(Dropdown.Menu)`
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  border: 1px solid ${colors.borderColor};
  .dropdown-item {
    font-weight: 500;
    color: ${colors.darkText};
    padding: 0.7rem 1.2rem;
    &:hover {
      background-color: ${colors.lightBackground};
      color: ${colors.primary};
    }
  }
`;


/**
 * ChefMainHeader Component
 * A comprehensive header for the Chef Dashboard, combining navigation,
 * chef profile summary, and key performance metrics (orders and earnings).
 * Redesigned for a sleek, compact, and modern look, based on provided style snippet.
 *
 * @param {object} props - Component props.
 * @param {Array} props.notifications - List of notifications.
 * @param {function} props.markNotificationAsRead - Function to mark a notification as read.
 * @param {string} props.chefName - The name of the chef.
 * @param {string} [props.chefAvatarUrl] - URL to the chef's avatar image (optional).
 * @param {number} [props.totalOrdersMade=0] - The total number of orders made by the chef.
 * @param {number} [props.totalEarnings=0] - The total earnings of the chef.
 * @param {function} props.onShowAnalytics - Handler to show analytics.
 * @param {function} props.onShowRiders - Handler to show riders.
 * @param {function} props.onShowProfile - Handler to show chef profile.
 * @param {boolean} props.chefAvailable - Current availability status of the chef.
 * @param {function} props.toggleChefAvailability - Function to toggle chef's availability.
 */
export default function ChefMainHeader({
  notifications,
  markNotificationAsRead,
  chefName = '', // Added default value to prevent undefined errors
  chefAvatarUrl,
  totalOrdersMade = 0,
  totalEarnings = 0,
  onShowAnalytics,
  onShowRiders,
  onShowProfile,
  chefAvailable = true, // Default to true if not provided for profile dot
  toggleChefAvailability = () => console.log('Toggle availability not implemented') // Placeholder
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const unreadNotifications = (notifications || []).filter(n => !n.read).length;

  return (
    <StyledHeader expand="lg">
      <LeftSection>
        <GreetingText>Hello, {chefName.split(' ')[0]}!</GreetingText>
        <BrandText>Jikoni Express</BrandText>
        <AvailabilityStatus $available={chefAvailable}>
          <span>●</span> {chefAvailable ? 'Online' : 'Offline'}
        </AvailabilityStatus>
      </LeftSection>

      <HeaderStatsCompact>
        <CompactStatItem>
          <BoxSeam className="icon" />
          <div className="value">{totalOrdersMade}</div>
          <div className="label">Orders</div>
        </CompactStatItem>
        <CompactStatItem>
          <CurrencyDollar className="icon" />
          <div className="value">KES {totalEarnings.toFixed(2)}</div>
          <div className="label">Earnings</div>
        </CompactStatItem>
      </HeaderStatsCompact>

      <RightSection>
        <ProfileImage src={chefAvatarUrl || 'https://placehold.co/50x50/DDDDDD/A0AEC0?text=P'} alt="Chef Profile" $available={chefAvailable} />
        <ToggleAndLabelWrapper>
          <ToggleContainer $available={chefAvailable}>
            <input
              type="checkbox"
              checked={chefAvailable}
              onChange={toggleChefAvailability}
            />
            <span className="slider">
              <span className="knob" />
            </span>
          </ToggleContainer>
          <ToggleLabel>{chefAvailable ? 'Available' : 'Busy'}</ToggleLabel>
        </ToggleAndLabelWrapper>

        <StyledNavbarToggle aria-controls="offcanvasNavbar">
          <List />
        </StyledNavbarToggle>
      </RightSection>

      {/* Offcanvas and NotificationsPanel remain the same */}
      <StyledOffcanvas
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="offcanvasNavbarLabel">
            <PersonCircle size={24} className="me-2" /> Chef's Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <NavItemButton
              variant="outline-primary"
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={20} />
              Notifications
              {unreadNotifications > 0 && (
                <Badge pill bg="danger" className="notification-badge">
                  {unreadNotifications}
                </Badge>
              )}
            </NavItemButton>

            <NavItemButton
              variant="outline-secondary"
              onClick={onShowAnalytics}
            >
              <GraphUp size={20} /> Analytics
            </NavItemButton>
            <NavItemButton
              variant="outline-secondary"
              onClick={onShowRiders}
            >
              <Truck size={20} /> Riders
            </NavItemButton>

            <Dropdown as={Nav.Item} className="w-100">
              <NavItemButton
                as="div"
                variant="outline-secondary"
                className="dropdown-toggle"
              >
                <Gear size={20} /> Settings
              </NavItemButton>
              <StyledDropdownMenu>
                <Dropdown.Item onClick={onShowProfile}>
                    <PersonFill size={18} className="me-2" /> Chef Profile
                </Dropdown.Item>
                <Dropdown.Item>Availability</Dropdown.Item>
                <Dropdown.Item>Payments</Dropdown.Item>
              </StyledDropdownMenu>
            </Dropdown>
          </Nav>
        </Offcanvas.Body>
      </StyledOffcanvas>

      <NotificationsPanel
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
      />
    </StyledHeader>
  );
}
