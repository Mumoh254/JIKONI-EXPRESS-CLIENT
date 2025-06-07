import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Button, Spinner, Alert, Row, Col
} from 'react-bootstrap';
import {
  FiBriefcase, FiAward, FiMapPin, FiGlobe, FiFeather, FiStar, FiRefreshCw
} from 'react-icons/fi';
import styled, { keyframes } from 'styled-components';

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532',
  secondary: '#00C853',
  darkText: '#1A202C',
  lightBackground: '#F0F2F5',
  cardBackground: '#FFFFFF',
  borderColor: '#D1D9E6',
  errorText: '#EF4444',
  placeholderText: '#A0AEC0',
  buttonHover: '#E6392B',
  disabledButton: '#CBD5E1',
  gradientStart: '#FF6F59',
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
`;

const LocationButton = styled(Button)`
  width: 100%;
  margin-top: 1rem;
  padding: 0.8rem;
  background: ${colors.secondary};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #00B74A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: ${colors.disabledButton};
  }
`;

const LocationPin = styled.div`
  width: 24px;
  height: 24px;
  background: ${colors.primary};
  border-radius: 50% 50% 50% 0;
  position: relative;
  transform: rotate(-45deg);
  animation: ${pulse} 1.5s infinite;
  
  &:after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    top: 6px;
    left: 6px;
  }
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

const LocationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.error ? colors.errorText : colors.secondary};
`;

const ChefRegistrationModal = ({ show, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Click below to detect your location');
  
  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    speciality: '',
    experienceYears: '',
    certifications: '',
    location: '',
    city: '',
    latitude: '',
    longitude: ''
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setFormData({
        bio: '',
        speciality: '',
        experienceYears: '',
        certifications: '',
        location: '',
        city: '',
        latitude: '',
        longitude: ''
      });
      setGeolocationError(null);
      setLocationStatus('Click below to detect your location');
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const data = {
      ...formData,
      experienceYears: parseInt(formData.experienceYears),
      certifications: formData.certifications 
        ? formData.certifications.split(',').map(s => s.trim()) 
        : [],
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    };

    await onSubmit(data);
    setSubmitting(false);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setGeolocating(true);
    setLocationStatus('Detecting your location...');
    setGeolocationError(null);

    if (!navigator.geolocation) {
      setGeolocationError('Geolocation is not supported by your browser');
      setGeolocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch address information');
          }
          
          const data = await response.json();
          
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            city: data.address.city || data.address.town || data.address.village || 'Nairobi',
            location: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          
          setLocationStatus('Location detected successfully!');
        } catch (error) {
          setGeolocationError('Failed to get address details. Using coordinates only.');
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          setLocationStatus('Coordinates detected but address lookup failed');
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setGeolocationError(errorMessage);
        setLocationStatus('Location detection failed');
        setGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <StyledModalHeader closeButton>
        <Modal.Title>
          <HeaderIcon><FiFeather /></HeaderIcon>
          Become a Jikoni Master Chef!
        </Modal.Title>
      </StyledModalHeader>
      <StyledModalBody>
        <p className="text-muted text-center mb-4">
          Share your culinary passion with the world! Fill out your profile to join the Jikoni Express network.
        </p>
        
        {geolocationError && (
          <Alert variant="danger" className="mb-4">
            <strong>Location Error:</strong> {geolocationError}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Form.Label>Chef Bio</Form.Label>
                <IconWrapper><FiFeather /></IconWrapper>
                <InputField 
                  name="bio" 
                  as="textarea" 
                  rows={3} 
                  placeholder="Tell us about your culinary journey..." 
                  value={formData.bio}
                  onChange={handleChange}
                  required 
                />
              </FormGroup>

              <FormGroup>
                <Form.Label>Culinary Specialty</Form.Label>
                <IconWrapper><FiStar /></IconWrapper>
                <InputField 
                  as="select"
                  name="speciality" 
                  value={formData.speciality}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a specialty</option>
                  <option value="African Cuisine">African Cuisine</option>
                  <option value="Continental">Continental</option>
                  <option value="Fusion">Fusion</option>
                  <option value="Asian">Asian</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Baking & Pastry">Baking & Pastry</option>
                </InputField>
              </FormGroup>

              <FormGroup>
                <Form.Label>Years of Experience</Form.Label>
                <IconWrapper><FiBriefcase /></IconWrapper>
                <InputField 
                  name="experienceYears" 
                  type="number" 
                  min="0" 
                  placeholder="e.g., 5" 
                  value={formData.experienceYears}
                  onChange={handleChange}
                  required 
                />
              </FormGroup>

              <FormGroup>
                <Form.Label>Certifications (comma separated)</Form.Label>
                <IconWrapper><FiAward /></IconWrapper>
                <InputField 
                  name="certifications" 
                  placeholder="e.g., HACCP, Food Safety, Culinary Diploma" 
                  value={formData.certifications}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>

            <Col md={6}>
              <div className="mb-4 p-3 border rounded" style={{ backgroundColor: colors.lightBackground }}>
                <h5 className="mb-3 d-flex align-items-center">
                  <FiMapPin className="me-2" /> Location Details
                </h5>
                
                <FormGroup>
                  <Form.Label>Your Location Address</Form.Label>
                  <IconWrapper><FiMapPin /></IconWrapper>
                  <InputField 
                    name="location" 
                    placeholder="e.g., Kileleshwa, Othaya Road" 
                    value={formData.location}
                    onChange={handleChange}
                    required 
                  />
                </FormGroup>

                <FormGroup>
                  <Form.Label>City</Form.Label>
                  <IconWrapper><FiGlobe /></IconWrapper>
                  <InputField 
                    name="city" 
                    value={formData.city || "Nairobi"} 
                    onChange={handleChange}
                    required 
                  />
                </FormGroup>

                <Row>
                  <Col>
                    <FormGroup>
                      <Form.Label>Latitude</Form.Label>
                      <InputField 
                        name="latitude" 
                        type="number" 
                        step="any" 
                        placeholder="e.g., -1.286389" 
                        value={formData.latitude}
                        onChange={handleChange}
                        required 
                      />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Form.Label>Longitude</Form.Label>
                      <InputField 
                        name="longitude" 
                        type="number" 
                        step="any" 
                        placeholder="e.g., 36.817223" 
                        value={formData.longitude}
                        onChange={handleChange}
                        required 
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <LocationButton 
                  onClick={getCurrentLocation} 
                  disabled={geolocating}
                >
                  {geolocating ? (
                    <>
                      <Spinner size="sm" animation="border" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw />
                      Use My Current Location
                    </>
                  )}
                </LocationButton>
                
                <LocationStatus error={!!geolocationError}>
                  <LocationPin />
                  {locationStatus}
                </LocationStatus>
              </div>
            </Col>
          </Row>

          <SubmitButton type="submit" disabled={submitting || !formData.latitude}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Registering Chef Profile...</span>
              </>
            ) : (
              'Register My Chef Profile'
            )}
          </SubmitButton>
        </Form>
      </StyledModalBody>
    </Modal>
  );
};

export default ChefRegistrationModal;