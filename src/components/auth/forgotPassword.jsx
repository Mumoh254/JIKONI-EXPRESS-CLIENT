import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ClockLoader } from 'react-spinners';
import styled, { keyframes } from 'styled-components';

// --- Jikoni Express Color Palette (re-using from VerifyOtp) ---
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

// --- Animations (re-using from VerifyOtp) ---
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

const ForgotPasswordContainer = styled.div`
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

const Header = styled.div`
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
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: ${colors.darkText};
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }

  &::placeholder {
    color: ${colors.placeholderText};
  }
`;

const SubmitButton = styled.button`
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

const BackToLoginLink = styled.button`
  background: none;
  border: none;
  color: ${colors.secondary};
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease, text-decoration 0.2s ease;

  &:hover {
    color: #00B247;
    text-decoration: underline;
  }
`;

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showAlert('error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/request-password-reset`, { email });
      showAlert('success', 'If an account with that email exists, a password reset link has been sent!');
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after a short delay
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Failed to send password reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <ForgotPasswordContainer>
        <Header>
          <h2>Forgot Your Password?</h2>
          <p>
            Enter the email address associated with your Jikoni Express account, and we'll send you a link to reset your password.
          </p>
        </Header>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g., yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <ClockLoader size={20} color="#fff" />
            ) : (
              'Send Reset Link'
            )}
          </SubmitButton>
        </form>

        <BackToLoginLink onClick={() => navigate('/login')} disabled={loading}>
          Back to Login
        </BackToLoginLink>
      </ForgotPasswordContainer>
    </PageWrapper>
  );
};

export default ForgotPassword;