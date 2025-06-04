import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styled, { keyframes } from 'styled-components'; // Import keyframes
import { FaEnvelope, FaLock, FaSpinner, FaUtensils } from 'react-icons/fa'; // Changed FaCity to FaUtensils for food theme

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

const spinnerAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

const LoginContainer = styled.div`
  max-width: 450px; /* Slightly wider for better spacing */
  width: 100%;
  padding: 2.5rem;
  background: ${colors.cardBackground};
  border-radius: 16px; /* More rounded corners */
  box-shadow: 0 8px 24px rgba(0,0,0,0.15); /* More prominent shadow */
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px; /* Thicker accent line */
    background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%); /* Jikoni red gradient */
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem; /* More space below header */

  .icon {
    font-size: 3.5rem; /* Larger icon */
    color: ${colors.primary};
    margin-bottom: 1rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  h2 {
    font-size: 2.2rem; /* Larger heading */
    color: ${colors.darkText};
    margin: 1rem 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem; /* More space for icon in heading */
    font-weight: 700;
  }

  p {
    color: ${colors.placeholderText}; /* Muted description text */
    font-size: 1rem;
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const IconStyled = styled.span`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.placeholderText}; /* Muted icon color */
  font-size: 1.2rem; /* Larger icon in input */
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3rem; /* More padding and space for icon */
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1.05rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground}; /* Light background for inputs */
  transition: all 0.3s ease;

  &::placeholder {
    color: ${colors.placeholderText};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary}; /* Focus color primary */
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2); /* Red glow on focus */
    background-color: ${colors.cardBackground}; /* White background on focus */
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: ${colors.primary};
  color: ${colors.cardBackground}; /* White text */
  border: none;
  border-radius: 10px;
  font-size: 1.1rem; /* Slightly larger text */
  font-weight: 600; /* Bolder text */
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem; /* More space between icon and text */

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-1px); /* Slight lift on hover */
  }

  &:disabled {
    background: ${colors.disabledButton};
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    animation: ${spinnerAnimation} 1s linear infinite;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: ${colors.darkText};

  a {
    color: ${colors.secondary}; /* Jikoni Green for links */
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
    &:hover {
      color: #00B247; /* Slightly darker green on hover */
      text-decoration: underline;
    }
  }
`;

const BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const Login = () => {
  const navigate = useNavigate();
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
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
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URl}/login`, {
        Email,
        Password
      });

      console.log(response.data.user);

      if (response && response.data.sucess && response.data.user) {
        // Successful login
        console.log(response.data.user.Email)
        localStorage.setItem('userEmail', Email);
        console.log('Stored user email in localStorage:', localStorage.getItem('userEmail'));

        showAlert('success', 'Login successful! Your OTP has been sent to your email.');
        navigate('/verify-otp');
      } else {
        // This 'else' block might be hit if `sucess` is false or `user` is missing,
        // but the backend sends a specific error message if it's a known issue.
        // It's generally better to catch specific backend error responses.
        showAlert('info', 'User not registered or an issue occurred. Please try again or register.');
        // Consider navigating to register only if it's a clear "user not found" error
        // navigate('/register'); // Might not always be appropriate here if other errors occur
      }
    } catch (error) {
      // Handle specific error messages from the backend
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showAlert('error', errorMessage);

      // If the error explicitly states user not found, then navigate to register
      if (errorMessage.includes("not registered")) {
        navigate('/register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <LoginContainer>
        <LoginHeader>
          <FaUtensils className="icon" /> {/* Changed icon to be food-related */}
          <h2>Welcome to Jikoni Express</h2>
          <p>Sign in to discover delicious meals and unique beverages.</p>
        </LoginHeader>

        <LoginForm onSubmit={handleSubmit}>
          <InputGroup>
            <IconStyled><FaEnvelope /></IconStyled>
            <InputField
              type="Email"
              placeholder="Your Email Address"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <IconStyled><FaLock /></IconStyled>
            <InputField
              type="Password"
              placeholder="Your Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                Signing In...
              </>
            ) : (
              'Log In to Jikoni' // Branded text for the button
            )}
          </SubmitButton>
        </LoginForm>

        <LinkText>
          Don't have an account?{' '}
          <Link to="/register">
            Register Here!
          </Link>
        </LinkText>

        <LinkText>
          Forgot your Password?{' '}
          <Link to="/forgot-password"> {/* Changed link to /forgot-password */}
            Request Password Reset!
          </Link>
        </LinkText>
      </LoginContainer>
    </PageWrapper>
  );
};

export default Login;