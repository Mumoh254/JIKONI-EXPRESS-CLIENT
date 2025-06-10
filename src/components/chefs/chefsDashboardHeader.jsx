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
  // New dark background for the header
  headerBackground: '#1A202C', // Dark charcoal/navy for a premium look
  headerGradientStart: '#2C3E50', // Dark blue-gray for subtle gradient
  headerGradientEnd: '#1A252C',   // Even darker for depth
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

const StyledNavbar = styled(Navbar)`
  background: linear-gradient(to right, ${colors.headerGradientStart} 0%, ${colors.headerGradientEnd} 100%);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  padding: 0.8rem 1.5rem; /* Slightly more padding for balanced look */
  margin-bottom: 2.5rem;
  color: white;
  animation: ${fadeIn} 0.6s ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 992px) {
    padding: 0.7rem 1.2rem;
    margin-bottom: 2rem;
  }
  @media (max-width: 768px) {
    flex-wrap: nowrap;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
  }
`;

const JikoniBrandTitle = styled.span`
  font-size: 1.6rem; /* Slightly smaller for balance */
  font-weight: 800;
  color: ${colors.secondary}; /* Jikoni Green */
  white-space: nowrap;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.2);

  span {
    color: ${colors.primary}; /* Jikoni Red */
  }

  @media (max-width: 992px) {
    font-size: 1.4rem;
  }
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const BrandSection = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0; /* Prevent shrinking */

  .brand-title { /* This style block is now redundant, as JikoniBrandTitle is its own component */
    font-size: 1.6rem; /* Slightly smaller for balance */
    font-weight: 800;
    color: ${colors.secondary}; /* Jikoni Green */
    white-space: nowrap;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.2);

    span {
      color: ${colors.primary}; /* Jikoni Red */
    }

    @media (max-width: 992px) {
      font-size: 1.4rem;
    }
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

const ChefProfileSummary = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px; /* Space from brand */
  
  @media (max-width: 992px) {
    margin-left: 15px;
  }
  @media (max-width: 768px) {
    display: none; /* Hidden on mobile */
  }
`;

const ProfileAvatar = styled.div`
  width: 34px; /* Even smaller avatar size */
  height: 34px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15); /* Slightly darker transparent background */
  border: 1.5px solid rgba(255, 255, 255, 0.4); /* Thinner border */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-right: 6px; /* Reduced margin */
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .placeholder-icon {
    font-size: 1.4rem; /* Adjusted icon size */
    color: white;
  }
`;

const ChefName = styled.div`
  font-weight: 600;
  font-size: 0.95rem; /* Slightly smaller font */
  color: white;
  white-space: nowrap; /* Keep on one line */
`;

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 25px; /* Increased gap for better visual separation */
  flex-grow: 1; /* Key change: allows stats to fill available space */
  justify-content: center; /* Center the stats within their expanded area */
  margin: 0 20px; /* Horizontal margin from sides */

  @media (max-width: 992px) {
    gap: 15px;
    margin: 0 10px;
  }
  @media (max-width: 768px) {
    display: none; /* Hidden on mobile */
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; /* Increased gap for icon and text */
  color: white;

  .stat-icon {
    font-size: 1.2rem; /* Slightly larger icon */
    color: ${colors.greenAccent}; /* Specific green accent for stats */
  }

  .stat-text {
    display: flex;
    flex-direction: column;
    text-align: left;
    .stat-label {
      font-size: 0.68rem; /* Adjusted label font size */
      color: rgba(255, 255, 255, 0.65); /* Less muted */
      white-space: nowrap;
    }
    .stat-value {
      font-weight: 700; /* Bolder value */
      font-size: 1rem; /* Slightly larger value font */
      color: white;
      white-space: nowrap;
    }
  }
`;

const StyledNavbarToggle = styled(Navbar.Toggle)`
  border: none !important;
  color: white !important;
  padding: 0.5rem; /* Slightly more padding for better tap area */
  &:focus {
    box-shadow: none !important;
    background-color: rgba(255, 255, 255, 0.15); /* More visible focus state */
  }
  .bi {
    font-size: 1.5rem; /* Slightly larger icon */
  }
`;

const StyledOffcanvas = styled(Navbar.Offcanvas)`
  .offcanvas-header {
    background: linear-gradient(to right, ${colors.headerGradientStart} 0%, ${colors.headerGradientEnd} 100%); /* Consistent gradient */
    color: white;
    border-bottom: none;
    padding: 1rem 1.2rem;
    .offcanvas-title {
      font-weight: 700;
      font-size: 1.4rem;
    }
    .btn-close {
      filter: invert(1);
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
 * Redesigned for a sleeker, more compact, and modern look.
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
 */
export default function ChefMainHeader({
  notifications,
  markNotificationAsRead,
  chefName,
  chefAvatarUrl,
  totalOrdersMade = 0,
  totalEarnings = 0,
  onShowAnalytics,
  onShowRiders,
  onShowProfile
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const unreadNotifications = (notifications || []).filter(n => !n.read).length;

  return (
    <StyledNavbar expand="lg">
      <BrandSection>
        <Navbar.Brand>
          <JikoniBrandTitle className="brand-title">
            Jikoni <span>Express</span>
          </JikoniBrandTitle>
        </Navbar.Brand>
        <ChefProfileSummary>
          <ProfileAvatar>
            {chefAvatarUrl ? (
              <img src={chefAvatarUrl} alt={`${chefName}'s avatar`} />
            ) : (
              <PersonCircle className="placeholder-icon" />
            )}
          </ProfileAvatar>
          <ChefName>{chefName}</ChefName>
        </ChefProfileSummary>
      </BrandSection>

      <StatsContainer>
        <StatItem>
          <BoxSeam className="stat-icon" />
          <div className="stat-text">
            <div className="stat-label">Orders</div>
            <div className="stat-value">{totalOrdersMade}</div>
          </div>
        </StatItem>
        <StatItem>
          <CurrencyDollar className="stat-icon" />
          <div className="stat-text">
            <div className="stat-label">Earnings</div>
            <div className="stat-value">KES {totalEarnings.toFixed(2)}</div>
          </div>
        </StatItem>
      </StatsContainer>

      <StyledNavbarToggle aria-controls="offcanvasNavbar">
        <List />
      </StyledNavbarToggle>

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
    </StyledNavbar>
  );
}
