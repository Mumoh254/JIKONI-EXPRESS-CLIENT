import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { ClockLoader } from 'react-spinners'; // For a subtle loading animation during logout

// --- Jikoni Express Color Palette (re-using) ---
const colors = {
  primary: '#FF4532',
  secondary: '#00C853',
  darkText: '#1A202C',
  lightBackground: '#F0F2F5',
  cardBackground: '#FFFFFF',
  placeholderText: '#A0AEC0',
};

// --- Animations (re-using) ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.lightBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const LogoutContainer = styled.div`
  max-width: 500px; /* Slightly wider for the message */
  width: 100%;
  padding: 3rem 2.5rem;
  background: ${colors.cardBackground};
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.primary} 100%);
  }
`;

const LogoutHeader = styled.div`
  margin-bottom: 2rem;

  h2 {
    font-size: 2.5rem; /* Larger and more prominent */
    color: ${colors.primary}; /* Jikoni Red for impact */
    margin: 0 0 1rem;
    font-weight: 800; /* Extra bold */
  }

  p {
    color: ${colors.darkText};
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
`;

const ActionLink = styled.button`
  background: ${colors.secondary}; /* Jikoni Green for positive action */
  color: ${colors.cardBackground};
  border: none;
  border-radius: 10px;
  padding: 0.9rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: #00B247; /* Darker green */
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${colors.disabledButton};
    cursor: not-allowed;
  }
`;

const Logout = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = () => {
      // Clear all authentication-related data
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail'); // In case it was left
      localStorage.removeItem('authVerified');

      // Dispatch a custom event to notify other parts of the app about auth state change
      window.dispatchEvent(new Event('authStateChanged'));

      setLoggingOut(false); // Indicate logout is complete
    };

    // Simulate a short delay for a smoother user experience, or for any cleanup
    const timer = setTimeout(performLogout, 1000); // 1 second delay

    return () => clearTimeout(timer); // Cleanup timer if component unmounts
  }, []);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  return (
    <PageWrapper>
      <LogoutContainer>
        <LogoutHeader>
          {loggingOut ? (
            <>
              <h2>Logging Out...</h2>
              <p>Please wait a moment while we securely log you out of your account.</p>
              <ClockLoader size={30} color={colors.primary} />
            </>
          ) : (
            <>
              <h2>See You Soon!</h2>
              <p>
                We're sorry to see you go, but we hope you enjoyed your time with Jikoni Express.
                There's always great content and delicious food waiting for you here!
              </p>
              <ActionLink onClick={handleReturnToLogin}>
                Return to Login
              </ActionLink>
            </>
          )}
        </LogoutHeader>
      </LogoutContainer>
    </PageWrapper>
  );
};

export default Logout;