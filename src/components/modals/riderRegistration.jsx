import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import {
  Modal, Form, Button, Spinner, Alert // Keep necessary react-bootstrap components for structure
} from 'react-bootstrap';
import {
  FiUser, FiMapPin, FiTruck, FiClock, FiCheckSquare, FiHash // Use react-icons for more modern feel
} from 'react-icons/fi'; // Import icons for form fields
import styled, { keyframes } from 'styled-components'; // Import styled-components and keyframes
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// Assuming getUserNameFromToken is a utility function you have
// import { getUserNameFromToken } from '../../handler/tokenDecorder'; // Uncomment if you have this utility
// import { getUserIdFromToken } from '../../handler/tokenDecorder'; // Re-added if it's an external utility, but now handled internally as per previous instructions

// --- Jikoni Express Color Palette ---
import { SiCoinmarketcap } from "react-icons/si"; // Assuming this is for a specific icon used below
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for inputs/page
  cardBackground: '#FFFFFF', // White for the modal background
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  gradientStart: '#FF6F59', // Lighter red for gradient
  successGreen: '#28A745', // For positive feedback
};

// --- Animations ---
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const StyledModalHeader = styled(Modal.Header)`
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  color: ${colors.cardBackground};
  border-bottom: none;
  padding: 1.5rem 2rem;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;

  .modal-title {
    font-weight: 700;
    font-size: 1.8rem;
    display: flex;
    flex-direction: column; /* Arrange logo/text vertically */
    align-items: flex-start; /* Align content to start */
    gap: 0.5rem; /* Reduced gap */
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%); /* Make close button white */
    &:hover {
      opacity: 0.8;
    }
  }
`;

const StyledModalBody = styled(Modal.Body)`
  padding: 2rem;
  background-color: ${colors.cardBackground};
  animation: ${slideIn} 0.5s ease-out;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;
  position: relative;

  label {
    font-weight: 600;
    color: ${colors.darkText};
    margin-bottom: 0.5rem;
    display: block;
    font-size: 0.95rem;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 65%; /* Adjust to align with input field */
  left: 1rem;
  transform: translateY(-50%);
  color: ${colors.placeholderText};
  font-size: 1.1rem;
`;

const InputField = styled(Form.Control)`
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem; /* Add padding for icon */
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1rem;
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
  &:disabled { /* Style for disabled inputs */
    background-color: ${colors.disabledButton};
    cursor: not-allowed;
  }
`;

const SelectField = styled(Form.Select)`
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem; /* Add padding for icon */
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground};
  appearance: none; /* Hide default select arrow */
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }
  &:disabled { /* Style for disabled inputs */
    background-color: ${colors.disabledButton};
    cursor: not-allowed;
  }
`;

const CheckboxField = styled(Form.Check)`
  .form-check-input {
    border-color: ${colors.borderColor};
    &:checked {
      background-color: ${colors.secondary};
      border-color: ${colors.secondary};
    }
    &:focus {
      box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.2); /* Green glow for checkbox focus */
    }
  }
  .form-check-label {
    color: ${colors.darkText};
    font-size: 0.95rem;
    margin-left: 0.5rem;
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  padding: 0.9rem;
  background: ${colors.primary};
  color: ${colors.cardBackground};
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 69, 50, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background: ${colors.disabledButton};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const FormHeaderIcon = styled.span`
  font-size: 2.2rem;
  color: ${colors.cardBackground};
`;

// Jikoni Express SVG Logo
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
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4Z"
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


const RiderRegistration = ({ show, onClose, onSubmit }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null); // State to store the user ID
  const [authMessage, setAuthMessage] = useState(''); // Message for auth status
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Use a ref to hold the timer ID for redirection
  const redirectTimerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    nationalId: '',
    city: 'Nairobi', // Default to Nairobi
    area: '',
    neighborhood: '',
    vehicleType: '',
    registrationPlate: '',
    workHours: '',
    serviceCity: '', // This was already in your code, keeping it
    serviceArea: '', // This was already in your code, keeping it
  });


  // Effect to get userId from token and handle authentication status
  useEffect(() => {
    const getUserIdFromToken = () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          // Adjust based on your actual token payload structure for user ID
          return payload?.id || payload?.userId || payload?._id || null;
        }
      } catch (err) {
        console.error("Token decode failed:", err);
      }
      return null;
    };

    const id = getUserIdFromToken();
    setUserId(id);

    // Clear any existing timer when the effect re-runs or component unmounts
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    if (!id) {
      setAuthMessage("⚠️ You must be logged in to continue. Redirecting to registration...");

      // Set the timer and store its ID in the ref
      redirectTimerRef.current = setTimeout(() => {
        navigate("/register");
      }, 9000); // 4 seconds delay
    } else {
      // If user is now logged in, ensure no auth message is shown
      setAuthMessage('');
    }

    // Cleanup function for the effect: clear timer when component unmounts
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [navigate]); // Still depend only on navigate (which is stable)


  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setFormData({
        nationalId: '',
        city: 'Nairobi',
        area: '',
        neighborhood: '',
        vehicleType: '',
        registrationPlate: '',
        workHours: '',
        serviceCity: '',
        serviceArea: '',
      });
      setAgreedToTerms(false);
    }
  }, [show]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (type === 'checkbox') {
        setAgreedToTerms(checked);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = {
      ...formData,
      agreedToTerms: agreedToTerms,
      userId: userId, // Ensure userId is passed
    };

    // Simulate API call using onSubmit prop
    // In a real app, onSubmit would likely be an async function that handles API interaction
    await onSubmit(data);

    setSubmitting(false);
  };

  // Disable form if no user ID or if submitting
  const isFormDisabled = !userId || submitting;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <StyledModalHeader closeButton>
        <Modal.Title>
          {/* Jikoni Express Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <JikoniExpressLogoSvg size={48} color={colors.cardBackground} />
            <span style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>Jikoni Express</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.9 }}>Become a Jikoni Rider!</span>
        </Modal.Title>
      </StyledModalHeader>
      <StyledModalBody>
        {authMessage && (
          <Alert variant={userId ? "success" : "danger"} className="mb-4 text-center">
            {authMessage}
          </Alert>
        )}

        <p className="text-muted text-center mb-4">Join our team and start delivering delicious food across Nairobi!</p>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Form.Label>National ID</Form.Label>
                <IconWrapper><FiUser /></IconWrapper>
                <InputField
                  name="nationalId"
                  type="text"
                  required
                  value={formData.nationalId}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </FormGroup>

              <FormGroup>
                <Form.Label>City</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField
                  name="city"
                  type="text"
                  required
                  defaultValue="Nairobi"
                  disabled // This field is intentionally disabled
                  value={formData.city}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Form.Label>Area</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField
                  name="area"
                  type="text"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </FormGroup>

              <FormGroup>
                <Form.Label>Neighborhood</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField
                  name="neighborhood"
                  type="text"
                  required
                  value={formData.neighborhood}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Vehicle Type</Form.Label>
                <IconWrapper><FiTruck /></IconWrapper>
                <SelectField
                  name="vehicleType"
                  required
                  value={formData.vehicleType}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                >
                  <option value="">Select your vehicle type</option>
                  <option>Bicycle</option>
                  <option>Motorcycle</option>
                  <option>Car</option>
                </SelectField>
              </FormGroup>

              <FormGroup>
                <Form.Label>Registration Number Plate</Form.Label>
                <IconWrapper><FiHash /></IconWrapper>
                <InputField
                  name="registrationPlate"
                  type="text"
                  required
                  value={formData.registrationPlate}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </FormGroup>

              <FormGroup>
                <Form.Label>Preferred Work Hours</Form.Label>
                <IconWrapper><FiClock /></IconWrapper>
                <InputField
                  name="workHours"
                  type="text"
                  placeholder="e.g. 9am - 5pm or Flexible"
                  required
                  value={formData.workHours}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </FormGroup>


                <FormGroup>
                <Form.Label>Service City</Form.Label>
                <IconWrapper><SiCoinmarketcap /></IconWrapper> {/* Corrected icon usage */}
                <InputField
                  name="serviceCity"
                  type="text"
                  required
                  value={formData.serviceCity}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </FormGroup>

              <FormGroup>
                <Form.Label>Service Area</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField
                  name="serviceArea"
                  type="text"
                  required
                  value={formData.serviceArea}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </FormGroup>
            </div>
          </div> {/* End Row */}

          <FormGroup className="mb-4 text-center"> {/* Centered checkbox */}
            <CheckboxField
              name="agreedToTerms"
              type="checkbox"
              label="I agree to Jikoni Express Rider Terms and Conditions"
              checked={agreedToTerms}
              onChange={handleChange}
              required
              disabled={isFormDisabled}
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={isFormDisabled || !agreedToTerms || submitting}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Registering...</span>
              </>
            ) : (
              'Register as a Jikoni Rider'
            )}
          </SubmitButton>
        </Form>
      </StyledModalBody>
    </Modal>
  );
};

export default RiderRegistration;
