import React, { useState, useEffect, useRef } from 'react'; // Added useRef for better OTP input management
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ClockLoader } from 'react-spinners'; // Assuming ClockLoader fits the Jikoni brand better than FaSpinner
import styled, { keyframes } from 'styled-components'; // Import keyframes

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

// --- Styled Components (Updated for Jikoni Express) ---

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
  max-width: 450px; /* Consistent width with login/register */
  width: 100%;
  padding: 2.5rem;
  background: ${colors.cardBackground};
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
  text-align: center; /* Center content within the container */

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px; /* Thicker accent line */
    background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  }
`;

const OtpHeader = styled.div`
  margin-bottom: 2.5rem;

  h2 {
    font-size: 2.2rem; /* Larger heading */
    color: ${colors.darkText};
    margin: 0 0 0.5rem;
    font-weight: 700;
  }

  p {
    color: ${colors.placeholderText};
    font-size: 1rem;

    span {
      font-weight: 600;
      color: ${colors.secondary}; /* Jikoni Green for email emphasis */
    }
  }
`;

const OtpInputs = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem; /* Slightly reduced gap for a tighter look */
  margin: 2rem 0;
`;

const OtpDigit = styled.input`
  width: 50px; /* Slightly smaller for aesthetic */
  height: 50px;
  text-align: center;
  font-size: 1.5rem; /* Larger font for digits */
  font-weight: 700; /* Bolder digits */
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  transition: all 0.3s ease;
  background-color: ${colors.lightBackground};
  color: ${colors.darkText};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2); /* Red glow on focus */
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
  color: ${colors.secondary}; /* Jikoni Green for resend link */
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, text-decoration 0.2s ease;
  font-size: 0.95rem; /* Consistent font size */

  &:hover {
    color: #00B247; /* Darker green on hover */
    text-decoration: underline;
  }

  &:disabled {
    color: ${colors.placeholderText}; /* Muted when disabled */
    cursor: not-allowed;
    text-decoration: none;
  }
`;

const TimerText = styled.span`
  color: ${colors.placeholderText}; /* Muted text color */
  font-size: 0.9rem;
  font-weight: 500;
`;

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedEmail = location.state?.email || localStorage.getItem('userEmail');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
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

      showAlert('success', 'Account verified successfully! Redirecting...');

      // Dispatch a custom event to notify other parts of the app about auth state change
      window.dispatchEvent(new Event('authStateChanged'));

      // Redirect based on role
      setTimeout(() => {
        const role = response.data.role.toLowerCase();
        if (role === 'admin') {
          window.location.href = '/admin-dashboard'; // Full page reload for dashboard
        } else if (role === 'corporate') {
          window.location.href = '/corporate-analytics'; // Full page reload for dashboard
        } else {
          window.location.href = '/peoples/favourites'; // Full page reload for user dashboard
        }
      }, 100); // Small delay to allow SweetAlert to show
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'OTP verification failed. Please try again.');
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
      </OtpContainer>
    </PageWrapper>
  );
};

export default VerifyOtp;