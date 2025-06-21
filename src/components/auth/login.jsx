import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styled, { keyframes, css } from 'styled-components'; // Import css for conditional styles
import { FaEnvelope, FaLock, FaSpinner, FaUtensils } from 'react-icons/fa';

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
    max-width: 450px;
    width: 100%;
    padding: 2.5rem;
    background: ${colors.cardBackground};
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;

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

const LoginHeader = styled.div`
    text-align: center;
    margin-bottom: 2.5rem;

    .icon {
        font-size: 3.5rem;
        color: ${colors.primary};
        margin-bottom: 1rem;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    h2 {
        font-size: 2.2rem;
        color: ${colors.darkText};
        margin: 1rem 0 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        font-weight: 700;
    }

    p {
        color: ${colors.placeholderText};
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
    color: ${colors.placeholderText};
    font-size: 1.2rem;
`;

const InputField = styled.input`
    width: 100%;
    padding: 0.9rem 1.2rem 0.9rem 3rem;
    border: 1px solid ${colors.borderColor};
    border-radius: 10px;
    font-size: 1.05rem;
    color: ${colors.darkText};
    background-color: ${colors.lightBackground};
    transition: all 0.3s ease;

    &::placeholder {
        color: ${colors.placeholderText};
    }

    &:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
        background-color: ${colors.cardBackground};
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    /* Set a fixed height to prevent expansion during loading */
    height: 3.5rem; /* Adjust as needed to fit content + padding */
    min-height: 3.5rem; /* Ensure minimum height */
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
        cursor: not-allowed;
        transform: none;
    }

    .spinner {
        animation: ${spinnerAnimation} 1s linear infinite;
    }

    /* Style for the content wrapper inside the button to center items */
    ${props => props.loading && css`
        & > span {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }
    `}
`;

const LinkText = styled.p`
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.95rem;
    color: ${colors.darkText};

    a {
        color: ${colors.secondary};
        font-weight: 600;
        text-decoration: none;
        transition: color 0.2s ease;
        &:hover {
            color: #00B247;
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
    const [isAdmin, setIsAdmin] = useState(false); // New state for admin role

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
        setIsAdmin(false); // Reset isAdmin on new login attempt

        try {
            const response = await axios.post(`${BASE_URl}/login`, {
                Email,
                Password
            });

            console.log("Login Response Data:", response.data);

            if (response && response.data.sucess && response.data.user) {
                // Successful login
                localStorage.setItem('userEmail', Email);
                console.log('Stored user email in localStorage:', localStorage.getItem('userEmail'));

                // Check user role
                if (response.data.user.role === 'ADMIN') {
                    setIsAdmin(true);
                    localStorage.setItem('isAdmin', 'true'); // Store admin status
                    showAlert('success', 'Admin login successful!');
                    // Potentially navigate to an admin dashboard
                    navigate('/admin-dashboard'); // Example admin route
                } else {
                    localStorage.setItem('isAdmin', 'false'); // Ensure it's false for non-admins
                    showAlert('success', 'Login successful! Your OTP has been sent to your email.');
                    navigate('/verify-otp');
                }
            } else {
                showAlert('info', 'User not registered or an issue occurred. Please try again or register.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            showAlert('error', errorMessage);

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
                    <FaUtensils className="icon" />
                    <h2>Welcome to Jikoni Express</h2>
                    <p>Sign in to discover delicious meals and unique beverages.</p>
                </LoginHeader>

                <LoginForm onSubmit={handleSubmit}>
                    <InputGroup>
                        <IconStyled><FaEnvelope /></IconStyled>
                        <InputField
                            type="email" // Changed to type="email" for better validation
                            placeholder="Your Email Address"
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </InputGroup>

                    <InputGroup>
                        <IconStyled><FaLock /></IconStyled>
                        <InputField
                            type="password"
                            placeholder="Your Password"
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </InputGroup>

                    <SubmitButton type="submit" disabled={loading} loading={loading}>
                        {loading ? (
                            <span>
                                <FaSpinner className="spinner" />
                                Signing In...
                            </span>
                        ) : (
                            'Log In to Jikoni'
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
                    <Link to="/forgot-password">
                        Request Password Reset!
                    </Link>
                </LinkText>
            </LoginContainer>
        </PageWrapper>
    );
};

export default Login;
