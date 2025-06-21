import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, Form, Button, Spinner, Alert, Row, Col
} from 'react-bootstrap';
import {
  Briefcase, MapPin, Globe, User,
  Clock, Hash, Phone, Mail, Box, LocateFixed, Lock
} from 'lucide-react'; // Using lucide-react for icons
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import Swal for alerts

// --- Jikoni Express Color Palette ---
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

const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

// Helper function to decode JWT and get user ID
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

// Function to show alerts (re-used for consistency)
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

// --- New Business Login Modal Component ---
const BusinessLoginModal = ({ show, onClose, onSuccess, initialBusinessName = '' }) => {
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear form and errors when modal is opened or closed
  useEffect(() => {
    if (show) {
      setBusinessName(initialBusinessName);
      setLicenseNumber('');
      setError('');
    }
  }, [show, initialBusinessName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8000/apiV1/smartcity-ke/vendor-login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName, licenseNumber }),
      });

      const data = await response.json();
      console.log('Business Login API Response:', data); // Log the full response for debugging

      // Check if the overall response indicates success and contains necessary data
      if (response.ok && data.isVendor && data.token && data.vendor && data.vendor.id) { // Corrected access to data.vendor.id
        localStorage.setItem('isVendor', 'true');
        localStorage.setItem('vendorId', data.vendor.id); // Corrected: Access id from nested vendor object
        localStorage.setItem('vendorToken', data.token); // Store vendor-specific token if provided
        showAlert('success', 'Successfully logged in as vendor!');
        onSuccess(); // Call success callback from parent
        onClose();   // Close this modal
      } else {
        // If the API call itself was successful (response.ok is true), but login failed
        setError(data.message || 'Business login failed. Please check your details.');
      }
    } catch (err) {
      console.error("Error during business login:", err);
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Inline styles for this modal (similar to main modal for consistency)
  const modalHeaderStyle = {
    background: `linear-gradient(90deg, ${colors.secondary} 0%, #00B247 100%)`, // Different gradient for distinction
    color: colors.cardBackground,
    borderBottom: 'none',
    padding: '1.8rem 2.5rem',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    position: 'relative',
    overflow: 'hidden',
  };

  const modalTitleStyle = {
    fontWeight: 700,
    fontSize: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const modalBodyStyle = {
    padding: '2.5rem',
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
  };

  const formGroupStyle = {
    marginBottom: '1.75rem',
    position: 'relative',
  };

  const labelStyle = {
    fontWeight: 600,
    color: colors.darkText,
    marginBottom: '0.6rem',
    display: 'block',
    fontSize: '0.98rem',
  };

  const iconWrapperStyle = {
    position: 'absolute',
    top: '50%',
    left: '1rem',
    transform: 'translateY(-50%)',
    color: colors.placeholderText,
    fontSize: '1.2rem',
  };

  const inputFieldStyle = {
    width: '100%',
    padding: '0.95rem 1rem 0.95rem 3rem',
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '10px',
    fontSize: '1.05rem',
    color: colors.darkText,
    backgroundColor: colors.lightBackground,
    transition: 'all 0.3s ease',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '1rem',
    background: colors.secondary, // Green for login
    color: colors.cardBackground,
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.2rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    marginTop: '20px',
  };

  const submitButtonDisabledStyle = {
    background: colors.disabledButton,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  };

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header style={modalHeaderStyle} closeButton>
        <Modal.Title style={modalTitleStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <JikoniExpressLogoSvg size={48} color={colors.cardBackground} />
            <span style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>Jikoni Express</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.9 }}>Vendor Login</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={modalBodyStyle}>
        {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}
        <p className="text-muted text-center mb-4">
          It looks like your business is already registered. Please log in to your vendor account.
        </p>
        <Form onSubmit={handleSubmit}>
          <Form.Group style={formGroupStyle}>
            <Form.Label style={labelStyle}>Business Name</Form.Label>
            <div style={iconWrapperStyle}><Briefcase size={24} /></div>
            <Form.Control
              type="text"
              placeholder="e.g., Cheers Liquor Store"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              style={inputFieldStyle}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group style={formGroupStyle}>
            <Form.Label style={labelStyle}>Liquor License Number</Form.Label>
            <div style={iconWrapperStyle}><Lock size={24} /></div>
            <Form.Control
              type="text"
              placeholder="e.g., LRN/2023/12345"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              style={inputFieldStyle}
              disabled={loading}
            />
          </Form.Group>

          <Button
            type="submit"
            disabled={loading}
            style={loading ? { ...submitButtonStyle, ...submitButtonDisabledStyle } : submitButtonStyle}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Logging in...</span>
              </>
            ) : (
              'Login to Vendor Account'
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};


// --- Vendor Registration Modal Component ---
const VendorRegistrationModal = ({ show, onClose }) => { // Removed onSubmit prop as it's handled internally
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [coordinates, setCoordinates] = useState({
    latitude: -1.286389, // Default Nairobi latitude
    longitude: 36.817223 // Default Nairobi longitude
  });
  const [userId, setUserId] = useState(null); // State to store the user ID
  const [authMessage, setAuthMessage] = useState(''); // Message for auth status
  const [showBusinessLoginModal, setShowBusinessLoginModal] = useState(false); // Control BusinessLoginModal visibility
  const [initialBusinessNameForLogin, setInitialBusinessNameForLogin] = useState(''); // To pre-fill business name in login modal

  const defaultCity = "Nairobi"; // Default city

  // Effect to get userId from token and handle authentication status
  useEffect(() => {
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
      }, 4000); // 4 seconds delay
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
  }, [navigate]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please enter coordinates manually or use a different browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location. ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access to use this feature.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "The request to get user location timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        errorMessage += " Default Nairobi coordinates are used as a fallback.";
        setLocationError(errorMessage);
        setCoordinates({ latitude: -1.2921, longitude: 36.8219 }); // fallback to Nairobi
      },
      {
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: true
      }
    ).finally(() => { // Ensure loading state is reset even on error
        setLocationLoading(false);
    });
  };

  const handleVendorLoginSuccess = () => {
    // This function is called when BusinessLoginModal successfully logs in
    onClose(); // Close the registration modal
    navigate('/vendor/dashboard'); // Redirect to vendor dashboard
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocationError(''); // Clear previous errors

    const formData = new FormData(e.target);

    const data = {
      businessName: formData.get('businessName'),
      licenseNumber: formData.get('licenseNumber'),
      contactPerson: formData.get('contactPerson'),
      phoneNumber: formData.get('phoneNumber'),
      email: formData.get('email'),
      typesOfLiquor: formData.get('typesOfLiquor') ? formData.get('typesOfLiquor').split(',').map(s => s.trim()) : [],
      operatingHours: formData.get('operatingHours'),
      physicalAddress: formData.get('physicalAddress'),
      city: formData.get('city'),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      userId: userId
    };

    try {
      const response = await fetch(`${BASE_URL}/register-vendor`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is sent
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) { // Check for successful HTTP status (2xx)
        if (responseData.message === 'Vendor registered successfully!' && responseData.vendor && responseData.vendor.id) {
          localStorage.setItem('isVendor', 'true');
          localStorage.setItem('vendorId', responseData.vendor.id);
          if (responseData.token) { // If the registration response also gives a vendor token
            localStorage.setItem('vendorToken', responseData.token);
          }
          onClose(); // Close registration modal
          navigate('/vendor/dashboard');
          showAlert('success', 'Vendor registered successfully!');
        } else {
          // Fallback for unexpected success response structure
          setLocationError(responseData.message || 'Vendor registration succeeded, but response was unexpected.');
          showAlert('warning', responseData.message || 'Vendor registration succeeded, but response was unexpected.');
        }
      } else { // Handle non-2xx HTTP status codes
        // Specific check for "vendor already has a profile"
        if (responseData.message && (responseData.message.includes('Vendor with this license number or email already exists') || responseData.message.includes('Vendor already has a profile') || responseData.message.includes('This user already has a vendor profile.'))) {
          setInitialBusinessNameForLogin(data.businessName); // Pre-fill business name
          setShowBusinessLoginModal(true); // Show the business login modal
          showAlert('info', 'Your business is already registered. Please log in.');
        } else {
          setLocationError(responseData.message || 'Vendor registration failed. Please try again.');
          showAlert('error', responseData.message || 'Vendor registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error("Error during vendor registration submission:", error);
      setLocationError('An unexpected error occurred. Please try again later.');
      showAlert('error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLocationSet = coordinates.latitude !== -1.286389 || coordinates.longitude !== 36.817223;
  const isFormDisabled = !userId || submitting || locationLoading; // Disable if no userId or submitting/loading

  // Inline styles that correspond to the previous styled-components
  const modalHeaderStyle = {
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%)`,
    color: colors.cardBackground,
    borderBottom: 'none',
    padding: '1.8rem 2.5rem',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    position: 'relative',
    overflow: 'hidden',
  };

  const modalTitleStyle = {
    fontWeight: 700,
    fontSize: '2rem',
    display: 'flex',
    flexDirection: 'column', // Arrange logo/text vertically
    alignItems: 'flex-start', // Align content to start
    gap: '0.5rem', // Reduced gap
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const btnCloseStyle = {
    filter: 'invert(1) grayscale(100%) brightness(200%)',
    fontSize: '1.2rem',
    // Hover effects handled by Bootstrap's .btn-close
  };

  const modalBodyStyle = {
    padding: '2.5rem',
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
  };

  const formGroupStyle = {
    marginBottom: '1.75rem',
    position: 'relative',
  };

  const labelStyle = {
    fontWeight: 600,
    color: colors.darkText,
    marginBottom: '0.6rem',
    display: 'block',
    fontSize: '0.98rem',
  };

  const iconWrapperStyle = {
    position: 'absolute',
    top: '50%',
    left: '1rem',
    transform: 'translateY(-50%)',
    color: colors.placeholderText,
    fontSize: '1.2rem',
  };

  const inputFieldStyle = {
    width: '100%',
    padding: '0.95rem 1rem 0.95rem 3rem',
    border: `1px solid ${colors.borderColor}`,
    borderRadius: '10px',
    fontSize: '1.05rem',
    color: colors.darkText,
    backgroundColor: colors.lightBackground,
    transition: 'all 0.3s ease',
  };

  const inputPlaceholderStyle = {
    color: colors.placeholderText,
    opacity: 0.8,
  };

  const textareaFieldStyle = {
    minHeight: '100px',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    lineHeight: '1.5',
  };

  const readOnlyInputFieldStyle = {
    backgroundColor: colors.lightBackground,
    cursor: 'not-allowed',
    borderColor: colors.borderColor,
  };

  const locationButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: isLocationSet ? colors.secondary : colors.primary, // Dynamic background based on location set
    border: 'none',
    borderRadius: '8px',
    padding: '6px 10px',
    zIndex: 10,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    opacity: locationLoading ? 0.7 : 1,
    cursor: locationLoading ? 'not-allowed' : 'pointer',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '1rem',
    background: colors.primary,
    color: colors.cardBackground,
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.2rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    marginTop: '20px',
  };

  const submitButtonHoverStyle = {
    backgroundColor: colors.buttonHover,
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 16px ${colors.primary}4D`, // Using a transparent primary color for shadow
  };

  const submitButtonDisabledStyle = {
    background: colors.disabledButton,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  };

  const headerIconStyle = {
    fontSize: '2.8rem',
    color: colors.cardBackground,
  };

  const locationAlertStyle = {
    backgroundColor: '#e6f7ff',
    borderLeft: `4px solid ${colors.primary}`,
    borderRadius: '8px',
    padding: '15px',
    marginTop: '15px',
  };

  const locationAlertStrongStyle = {
    color: colors.primary,
  };

  const locationAlertSvgStyle = {
    color: colors.primary,
    marginRight: '10px',
  };

  return (
    <>
      <Modal show={show} onHide={onClose} centered size="lg">
        {/* Modal Header */}
        <Modal.Header style={modalHeaderStyle} closeButton>
          <Modal.Title style={modalTitleStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <JikoniExpressLogoSvg size={48} color={colors.cardBackground} />
              <span style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>Jikoni Express</span>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.9 }}>Register Your Liquor Business</span>
          </Modal.Title>
        </Modal.Header>

        {/* Modal Body */}
        <Modal.Body style={modalBodyStyle}>
          {authMessage && (
            <Alert variant={userId ? "success" : "danger"} className="mb-4 text-center">
              {authMessage}
            </Alert>
          )}

          <p className="text-muted text-center mb-4">
            Join Jikoni Express to reach new customers and expand your liquor delivery services!
          </p>
          <Form onSubmit={handleSubmit} disabled={isFormDisabled}>
            <Row>
              <Col md={6}>
                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Business Name</Form.Label>
                  <div style={iconWrapperStyle}><Briefcase size={24} /></div>
                  <Form.Control
                    name="businessName"
                    type="text"
                    placeholder="e.g., Cheers Liquor Store"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Liquor License Number</Form.Label>
                  <div style={iconWrapperStyle}><Hash size={24} /></div>
                  <Form.Control
                    name="licenseNumber"
                    type="text"
                    placeholder="e.g., LRN/2023/12345"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Contact Person</Form.Label>
                  <div style={iconWrapperStyle}><User size={24} /></div>
                  <Form.Control
                    name="contactPerson"
                    type="text"
                    placeholder="e.g., Jane Doe (Owner/Manager)"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Phone Number</Form.Label>
                  <div style={iconWrapperStyle}><Phone size={24} /></div>
                  <Form.Control
                    name="phoneNumber"
                    type="tel"
                    placeholder="e.g., +2547XXXXXXXX"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Email Address</Form.Label>
                  <div style={iconWrapperStyle}><Mail size={24} /></div>
                  <Form.Control
                    name="email"
                    type="email"
                    placeholder="e.g., info@cheers.com"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Types of Liquor Sold (comma separated)</Form.Label>
                  <div style={iconWrapperStyle}><Box size={24} /></div>
                  <Form.Control
                    name="typesOfLiquor"
                    placeholder="e.g., Wines, Spirits, Beers, Ciders"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Operating Hours</Form.Label>
                  <div style={iconWrapperStyle}><Clock size={24} /></div>
                  <Form.Control
                    name="operatingHours"
                    type="text"
                    placeholder="e.g., Mon-Sun 10 AM - 10 PM"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Physical Address</Form.Label>
                  <div style={iconWrapperStyle}><MapPin size={24} /></div>
                  <Form.Control
                    name="physicalAddress"
                    placeholder="e.g., Shop 5, ABC Plaza, Ngong Road"
                    required
                    style={inputFieldStyle}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>City</Form.Label>
                  <div style={iconWrapperStyle}><Globe size={24} /></div>
                  <Form.Control
                    name="city"
                    defaultValue={defaultCity}
                    required
                    readOnly
                    style={{ ...inputFieldStyle, ...readOnlyInputFieldStyle }}
                    disabled={isFormDisabled}
                  />
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Latitude</Form.Label>
                  <div style={iconWrapperStyle}><LocateFixed size={24} /></div>
                  <Form.Control
                    name="latitude"
                    type="number"
                    step="any"
                    value={coordinates.latitude}
                    readOnly
                    required
                    style={{ ...inputFieldStyle, ...readOnlyInputFieldStyle }}
                    disabled={isFormDisabled}
                  />
                  <Button
                    variant="primary"
                    onClick={getUserLocation}
                    disabled={locationLoading || isFormDisabled}
                    style={locationButtonStyle}
                  >
                    {locationLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <LocateFixed size={18} /> {isLocationSet ? 'Recalculate' : 'Locate My Business'}
                      </>
                    )}
                  </Button>
                </Form.Group>

                <Form.Group style={formGroupStyle}>
                  <Form.Label style={labelStyle}>Longitude</Form.Label> {/* Corrected closing tag */}
                  <div style={iconWrapperStyle}><LocateFixed size={24} /></div>
                  <Form.Control
                    name="longitude"
                    type="number"
                    step="any"
                    value={coordinates.longitude}
                    readOnly
                    required
                    style={{ ...inputFieldStyle, ...readOnlyInputFieldStyle }}
                    disabled={isFormDisabled}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info" style={locationAlertStyle}>
              <div className="d-flex align-items-center">
                <LocateFixed size={24} style={locationAlertSvgStyle} />
                <div>
                  <strong style={locationAlertStrongStyle}>Location Notice:</strong> Your coordinates will be used by Jikoni Express riders to
                  navigate to your business for order pickups. Please ensure they are accurate by using the "Locate My Business" button.
                </div>
              </div>
            </Alert>

            {locationError && (
              <Alert variant="danger" className="mt-3">
                {locationError}
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isFormDisabled}
              style={isFormDisabled ? { ...submitButtonStyle, ...submitButtonDisabledStyle } : submitButtonStyle}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Registering Vendor...</span>
                </>
              ) : (
                'Register My Liquor Business'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Business Login Modal */}
      <BusinessLoginModal
        show={showBusinessLoginModal}
        onClose={() => setShowBusinessLoginModal(false)}
        onSuccess={handleVendorLoginSuccess}
        initialBusinessName={initialBusinessNameForLogin}
      />
    </>
  );
};

export default VendorRegistrationModal;
