import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Button, Spinner, Alert
} from 'react-bootstrap';
import {
  FiBriefcase, FiMapPin, FiGlobe, FiUser,
  FiClock, FiSend, FiTag, FiHash,
  FiPhone, FiMail, FiCheckSquare,
  FiAward, FiBox, FiNavigation
} from 'react-icons/fi';
import styled, { keyframes, css } from 'styled-components'; // Import css for conditional styling

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

// --- Animations ---
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// --- Styled Components ---
const StyledModalHeader = styled(Modal.Header)`
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  color: ${colors.cardBackground};
  border-bottom: none;
  padding: 1.8rem 2.5rem;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  position: relative;
  overflow: hidden;

  .modal-title {
    font-weight: 700;
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%);
    font-size: 1.2rem;
    &:hover {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
`;

const StyledModalBody = styled(Modal.Body)`
  padding: 2.5rem;
  background-color: ${colors.cardBackground};
  animation: ${slideIn} 0.5s ease-out;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.75rem;
  position: relative;

  label {
    font-weight: 600;
    color: ${colors.darkText};
    margin-bottom: 0.6rem;
    display: block;
    font-size: 0.98rem;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 68%;
  left: 1rem;
  transform: translateY(-50%);
  color: ${colors.placeholderText};
  font-size: 1.2rem;
`;

const InputField = styled(Form.Control)`
  width: 100%;
  padding: 0.95rem 1rem 0.95rem 3rem;
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1.05rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground};
  transition: all 0.3s ease;

  &::placeholder {
    color: ${colors.placeholderText};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }

  &[as="textarea"] {
    min-height: 100px;
    padding-top: 1rem;
    padding-bottom: 1rem;
    line-height: 1.5;
  }

  // Style for readOnly inputs
  &:read-only {
    background-color: ${colors.lightBackground};
    cursor: not-allowed;
    border-color: ${colors.borderColor};
  }
`;

const LocationButton = styled(Button)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: ${colors.primary};
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  ${props => props.$isLocated && css`
    background-color: ${colors.secondary}; // Change color when location is set
    &:hover {
      background: ${colors.successGreen};
    }
  `}
`;


const SubmitButton = styled(Button)`
  width: 100%;
  padding: 1rem;
  background: ${colors.primary};
  color: ${colors.cardBackground};
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 20px;

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 69, 50, 0.3);
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

const HeaderIcon = styled.span`
  font-size: 2.8rem;
  color: ${colors.cardBackground};
`;

const LocationAlert = styled(Alert)`
  background-color: #e6f7ff;
  border-left: 4px solid ${colors.primary};
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;

  strong {
    color: ${colors.primary};
  }

  svg {
    color: ${colors.primary};
    margin-right: 10px;
  }
`;

const VendorRegistrationModal = ({ show, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [coordinates, setCoordinates] = useState({
    latitude: -1.286389, // Default Nairobi latitude
    longitude: 36.817223 // Default Nairobi longitude
  });
  const defaultCity = "Nairobi"; // Default city

  useEffect(() => {
    if (show) {
      // Attempt to get user location when the modal first shows
      getUserLocation();
    }
  }, [show]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please enter coordinates manually or use a different browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError('');  // Clear previous errors

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
        setLocationError(null); // Clear error on successful retrieval
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
        setLocationLoading(false);
        setCoordinates({ latitude: -1.2921, longitude: 36.8219 }); // fallback to Nairobi
      },
      {
        timeout: 10000, // optional timeout for location request (10 seconds)
        maximumAge: 60000, // use cached position if less than 1 minute old
        enableHighAccuracy: true // request the best possible results
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);

    const data = {
      businessName: formData.get('businessName'),
      licenceNumber: formData.get('licenceNumber'),
      contactPerson: formData.get('contactPerson'),
      phoneNumber: formData.get('phoneNumber'),
      email: formData.get('email'),
      typesOfLiquor: formData.get('typesOfLiquor') ? formData.get('typesOfLiquor').split(',').map(s => s.trim()) : [],
      operatingHours: formData.get('operatingHours'),
      physicalAddress: formData.get('physicalAddress'),
      city: formData.get('city'),
      latitude: coordinates.latitude, // Use state value for coordinates
      longitude: coordinates.longitude // Use state value for coordinates
    };

    await onSubmit(data); // This prop will typically make the API call
    setSubmitting(false);
  };

  const isLocationSet = coordinates.latitude !== -1.286389 || coordinates.longitude !== 36.817223; // Check if default has changed

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <StyledModalHeader closeButton>
        <Modal.Title>
          <HeaderIcon><FiAward /></HeaderIcon>
          Register Your Liquor Business
        </Modal.Title>
      </StyledModalHeader>
      <StyledModalBody>
        <p className="text-muted text-center mb-4">
          Join Jikoni Express to reach new customers and expand your liquor delivery services!
        </p>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Business Name</Form.Label>
                <IconWrapper><FiBriefcase /></IconWrapper>
                <InputField name="businessName" type="text" placeholder="e.g., Cheers Liquor Store" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Liquor License Number</Form.Label>
                <IconWrapper><FiHash /></IconWrapper>
                <InputField name="licenceNumber" type="text" placeholder="e.g., LRN/2023/12345" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Contact Person</Form.Label>
                <IconWrapper><FiUser /></IconWrapper>
                <InputField name="contactPerson" type="text" placeholder="e.g., Jane Doe (Owner/Manager)" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Phone Number</Form.Label>
                <IconWrapper><FiPhone /></IconWrapper>
                <InputField name="phoneNumber" type="tel" placeholder="e.g., +2547XXXXXXXX" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Email Address</Form.Label>
                <IconWrapper><FiMail /></IconWrapper>
                <InputField name="email" type="email" placeholder="e.g., info@cheers.com" required />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Types of Liquor Sold (comma separated)</Form.Label>
                <IconWrapper><FiBox /></IconWrapper>
                <InputField name="typesOfLiquor" placeholder="e.g., Wines, Spirits, Beers, Ciders" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Operating Hours</Form.Label>
                <IconWrapper><FiClock /></IconWrapper>
                <InputField name="operatingHours" type="text" placeholder="e.g., Mon-Sun 10 AM - 10 PM" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Physical Address</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="physicalAddress" placeholder="e.g., Shop 5, ABC Plaza, Ngong Road" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>City</Form.Label>
                <IconWrapper><FiGlobe /></IconWrapper>
                <InputField name="city" defaultValue={defaultCity} required readOnly /> {/* Set to readOnly */}
              </FormGroup>

              <FormGroup>
                <Form.Label>Latitude</Form.Label>
                <IconWrapper><FiNavigation /></IconWrapper>
                <InputField
                  name="latitude"
                  type="number"
                  step="any"
                  value={coordinates.latitude}
                  readOnly // Prevent manual input
                  required
                />
                <LocationButton
                  $isLocated={isLocationSet} // Pass prop for conditional styling
                  variant="primary"
                  onClick={getUserLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <>
                      <FiNavigation /> {isLocationSet ? 'Recalculate' : 'Locate My Business'}
                    </>
                  )}
                </LocationButton>
              </FormGroup>

              <FormGroup>
                <Form.Label>Longitude</Form.Label>
                <IconWrapper><FiNavigation /></IconWrapper>
                <InputField
                  name="longitude"
                  type="number"
                  step="any"
                  value={coordinates.longitude}
                  readOnly // Prevent manual input
                  required
                />
              </FormGroup>
            </div>
          </div>

          <LocationAlert variant="info">
            <div className="d-flex align-items-center">
              <FiNavigation size={24} />
              <div>
                <strong>Location Notice:</strong> Your coordinates will be used by Jikoni Express riders to
                navigate to your business for order pickups. Please ensure they are accurate by using the "Locate My Business" button.
              </div>
            </div>
          </LocationAlert>

          {locationError && (
            <Alert variant="danger" className="mt-3">
              {locationError}
            </Alert>
          )}

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Registering Vendor...</span>
              </>
            ) : (
              'Register My Liquor Business'
            )}
          </SubmitButton>
        </Form>
      </StyledModalBody>
    </Modal>
  );
};

export default VendorRegistrationModal;