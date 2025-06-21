import React from 'react';
import styled from 'styled-components';
import { Settings, UserCircle2 } from 'lucide-react'; // Using lucide-react for icons

// --- Jikoni Express Color Palette (re-defined for self-containment) ---
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background
  cardBackground: '#FFFFFF', // White background
  borderColor: '#D1D9E6', // Light border
  placeholderText: '#A0AEC0', // Muted text
  gradientStart: '#FF6F59', // Lighter red for gradient
};

// Jikoni Express SVG Logo (re-defined for self-containment)
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
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 = 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4Z"
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

const HeaderContainer = styled.header`
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${colors.cardBackground};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 500; /* Ensure header stays on top */

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem 1rem;
    gap: 1rem;
  }
`;

const BrandSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  h1 {
    font-size: 2.2rem;
    font-weight: 800;
    margin: 0;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-weight: 600;
    font-size: 1.1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }

  .user-icon {
    font-size: 2rem;
    color: ${colors.cardBackground};
  }

  .settings-icon {
    font-size: 1.8rem;
    color: ${colors.cardBackground};
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: rotate(15deg);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    order: 1; /* Puts user section above brand on small screens */
  }
`;

const AdminDashboardHeader = ({ adminName = "Admin User", adminEmail = "admin@jikoni.com" }) => {
  return (
    <HeaderContainer>
      <BrandSection>
        <JikoniExpressLogoSvg size={48} color={colors.cardBackground} />
        <h1>Admin Dashboard</h1>
      </BrandSection>
      <UserSection>
        <UserCircle2 className="user-icon" />
        <span>{adminName}</span>
        {/* You can add a click handler for settings icon for a settings modal/page */}
        <Settings className="settings-icon" onClick={() => console.log('Settings clicked!')} />
      </UserSection>
    </HeaderContainer>
  );
};

export default AdminDashboardHeader;
