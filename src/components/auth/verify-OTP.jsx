import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ClockLoader } from 'react-spinners';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa'; // Import the check circle icon

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  gradientStart: '#FF6F59', // Lighter red for gradient
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
`;

const zoomIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
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

const OtpContainer = styled.div`
  max-width: 450px;
  width: 100%;
  padding: 2.5rem;
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
    background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  }
`;

const OtpHeader = styled.div`
  margin-bottom: 2.5rem;

  h2 {
    font-size: 2.2rem;
    color: ${colors.darkText};
    margin: 0 0 0.5rem;
    font-weight: 700;
  }

  p {
    color: ${colors.placeholderText};
    font-size: 1rem;

    span {
      font-weight: 600;
      color: ${colors.secondary};
    }
  }
`;

const OtpInputs = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin: 2rem 0;
`;

const OtpDigit = styled.input`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  transition: all 0.3s ease;
  background-color: ${colors.lightBackground};
  color: ${colors.darkText};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: ${colors.primary};
  color: ${colors.cardBackground};
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${colors.disabledButton};
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const ResendLink = styled.button`
  color: ${colors.secondary};
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, text-decoration 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    color: #00B247;
    text-decoration: underline;
  }

  &:disabled {
    color: ${colors.placeholderText};
    cursor: not-allowed;
    text-decoration: none;
  }
`;

const TimerText = styled.span`
  color: ${colors.placeholderText};
  font-size: 0.9rem;
  font-weight: 500;
`;

const VerifiedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  animation: ${slideIn} 0.5s ease-out;

  .check-icon {
    font-size: 4rem;
    color: ${colors.secondary};
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.8rem;
    color: ${colors.darkText};
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1rem;
    color: ${colors.placeholderText};
    margin-bottom: 1.5rem;
  }
`;

// New Styled Components for the Advertisement Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const AdvertModalContent = styled.div`
  background: ${colors.cardBackground};
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: ${zoomIn} 0.4s ease-out;

  h4 {
    font-size: 1.8rem;
    color: ${colors.primary};
    margin-bottom: 1rem;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    color: ${colors.darkText};
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .logo {
    width: 80px; /* Adjust logo size */
    height: 80px;
    margin-bottom: 1.5rem;
    border-radius: 50%; /* If your logo is circular */
    object-fit: contain;
  }
`;

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedEmail = location.state?.email || localStorage.getItem('userEmail');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [verified, setVerified] = useState(false); // New state for verification status
  const [advertMessage, setAdvertMessage] = useState(''); // New state for advert message
  const [showAdvertModal, setShowAdvertModal] = useState(false); // State for advert modal visibility
  const otpInputRefs = useRef([]); // To manage focus for OTP inputs

  const showAlert = (type, message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  useEffect(() => {
    if (!storedEmail) {
      showAlert('error', 'Please log in first to verify your account.');
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Initial focus on the first input
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }

    return () => clearInterval(timer);
  }, [navigate, storedEmail]);

  const handleInputChange = (index, value) => {
    if (/^\d?$/.test(value)) { // Only allow single digit or empty string
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next input if a digit was entered
      if (value && index < otp.length - 1) {
        otpInputRefs.current[index + 1].focus();
      } else if (!value && index > 0) { // Move focus to previous input if backspacing
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace when input is empty to move to previous
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    const newOtp = pasteData.split('');
    const paddedOtp = Array(6).fill('').map((_, i) => newOtp[i] || ''); // Ensure 6 elements
    setOtp(paddedOtp);

    // Move focus to the last pasted digit's input or the last input
    if (newOtp.length > 0) {
      otpInputRefs.current[Math.min(newOtp.length - 1, 5)].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showAlert('error', 'Please enter the complete 6-digit OTP.');
      return;
    }

    if (timeLeft === 0) {
      showAlert('error', 'OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/verify-otp`, {
        email: storedEmail,
        otp: otpCode,
      });

      localStorage.removeItem('userEmail'); // Clean up temporary email
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('authVerified', 'true'); // Indicate successful verification

      setVerified(true); // Set verified to true to show success message and icon

      // Set a random advert message
      const adverts = [
        "Hungry? Explore our delicious meals just for you!",
        "Don't miss out on today's specials! Find your next favorite dish.",
        "Order now and get exclusive discounts on your first meal!",
        "Fast, fresh, and flavorful. Your next meal is just a tap away!",
        "Discover local chefs and hidden culinary gems!"
      ];
      const randomAdvert = adverts[Math.floor(Math.random() * adverts.length)];
      setAdvertMessage(randomAdvert);

      showAlert('success', `Account verified!`); // Show only verified message in toast for now

      // Show advert modal for 4 seconds
      setShowAdvertModal(true);
      setTimeout(() => {
        setShowAdvertModal(false); // Hide modal
        // Dispatch a custom event to notify other parts of the app about auth state change
        window.dispatchEvent(new Event('authStateChanged'));

        // Redirect based on role
        const role = response.data.role.toLowerCase();
        if (role === 'admin') {
          window.location.href = '/admin-dashboard'; // Full page reload for dashboard
        } else if (role === 'corporate') {
          window.location.href = '/corporate-analytics'; // Full page reload for dashboard
        } else {
          window.location.href = '/culture/foods'; // Redirect to /culture/foods for regular users
        }
      }, 4000); // 4 seconds for advert
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'OTP verification failed. Please try again.');
      setVerified(false); // Ensure verified state is reset on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true); // Show loading during resend
    try {
      await axios.post(`${BASE_URL}/resend-otp`, { email: storedEmail });
      setTimeLeft(600); // Reset timer
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
      showAlert('success', 'A new OTP has been sent to your email!');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false); // Hide loading after resend attempt
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageWrapper>
      <OtpContainer>
        {verified ? (
          <VerifiedContainer>
            <FaCheckCircle className="check-icon" />
            <h3>Account Verified!</h3>
            <p>You're all set. Redirecting you to your delicious meals shortly.</p>
          </VerifiedContainer>
        ) : (
          <>
            <OtpHeader>
              <h2>Verify Your Jikoni Account</h2>
              <p>
                Enter the 6-digit verification code sent to{' '}
                <span>{storedEmail || 'your email'}</span>
              </p>
            </OtpHeader>

            <OtpInputs onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <OtpDigit
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric" // Hint for mobile keyboards
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (otpInputRefs.current[index] = el)} // Store ref for focus management
                  autoComplete="one-time-code" // Hint for browser autofill (SMS OTP)
                />
              ))}
            </OtpInputs>

            <VerifyButton onClick={handleVerify} disabled={loading}>
              {loading ? (
                <ClockLoader size={20} color="#fff" />
              ) : (
                'Verify Account' // More branded text
              )}
            </VerifyButton>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <TimerText>Code expires in: {formatTime(timeLeft)}</TimerText>
              <div style={{ marginTop: '0.75rem' }}>
                <ResendLink onClick={handleResendOtp} disabled={timeLeft > 0 || loading}>
                  {timeLeft > 0 ? (
                    `Resend OTP (in ${formatTime(timeLeft)})`
                  ) : (
                    'Resend OTP'
                  )}
                </ResendLink>
              </div>
            </div>
          </>
        )}
      </OtpContainer>

      {/* Advertisement Modal */}
      {showAdvertModal && (
        <ModalOverlay>
          <AdvertModalContent>
            {/* You can replace this with your actual company logo */}
            <img src="https://via.placeholder.com/80/FF4532/FFFFFF?text=Jikoni" alt="Company Logo" className="logo" />
            <h4>Welcome to Jikoni Express!</h4>
            <p>{advertMessage}</p>
            <p>Get ready to explore a world of flavors!</p>
          </AdvertModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default VerifyOtp;