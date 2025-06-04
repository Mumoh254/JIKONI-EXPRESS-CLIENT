import React, { useState } from 'react';
import {
  Modal, Form, Button, Spinner // Keep necessary react-bootstrap components for structure
} from 'react-bootstrap';
import {
  FiBriefcase, FiMapPin, FiGlobe, FiSend, FiTag, FiHash, FiPhone, FiMail, FiCheckSquare, FiAward, FiBox // Using react-icons for modern appeal
} from 'react-icons/fi'; // Import icons for form fields
import styled, { keyframes } from 'styled-components'; // Import styled-components and keyframes

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

// --- Styled Components ---

const StyledModalHeader = styled(Modal.Header)`
  background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.gradientStart} 100%);
  color: ${colors.cardBackground};
  border-bottom: none;
  padding: 1.8rem 2.5rem; /* More generous padding */
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  position: relative;
  overflow: hidden;

  .modal-title {
    font-weight: 700;
    font-size: 2rem; /* Larger title */
    display: flex;
    align-items: center;
    gap: 1rem; /* More space around icon */
    text-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Subtle text shadow */
  }

  .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%); /* Make close button white */
    font-size: 1.2rem; /* Larger close button */
    &:hover {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
`;

const StyledModalBody = styled(Modal.Body)`
  padding: 2.5rem; /* More padding inside body */
  background-color: ${colors.cardBackground};
  animation: ${slideIn} 0.5s ease-out;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.75rem; /* Increased margin for better separation */
  position: relative;

  label {
    font-weight: 600;
    color: ${colors.darkText};
    margin-bottom: 0.6rem; /* More space above input */
    display: block;
    font-size: 0.98rem; /* Slightly larger label font */
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 68%; /* Adjust to align with input field's visual center */
  left: 1rem;
  transform: translateY(-50%);
  color: ${colors.placeholderText};
  font-size: 1.2rem; /* Larger icon */
`;

const InputField = styled(Form.Control)`
  width: 100%;
  padding: 0.95rem 1rem 0.95rem 3rem; /* Generous padding for icon */
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
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2); /* Red glow on focus */
    background-color: ${colors.cardBackground};
  }

  &[as="textarea"] {
    min-height: 100px; /* Minimum height for textarea */
    padding-top: 1rem; /* Adjust padding for textarea */
    padding-bottom: 1rem;
    line-height: 1.5;
  }
`;

const SelectField = styled(Form.Select)`
  width: 100%;
  padding: 0.95rem 1rem 0.95rem 3rem; /* Generous padding for icon */
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1.05rem;
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
`;

const SubmitButton = styled(Button)`
  width: 100%;
  padding: 1rem; /* Larger padding for button */
  background: ${colors.primary};
  color: ${colors.cardBackground};
  border: none;
  border-radius: 10px;
  font-size: 1.2rem; /* Larger font for button */
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem; /* More space between icon and text */

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-2px); /* More pronounced lift */
    box-shadow: 0 6px 16px rgba(255, 69, 50, 0.3); /* Stronger shadow on hover */
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
  font-size: 2.8rem; /* Larger icon for header */
  color: ${colors.cardBackground};
`;

const LiquorVendorRegistrationModal = ({ show, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);

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
      latitude: parseFloat(formData.get('latitude')),
      longitude: parseFloat(formData.get('longitude'))
    };

    await onSubmit(data); // Assume onSubmit handles its own async logic and SweetAlert
    setSubmitting(false);
  };

  // Default city and coordinates for Nairobi, Kenya
  const defaultCity = "Nairobi";
  const defaultLatitude = -1.286389;
  const defaultLongitude = 36.817223;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <StyledModalHeader closeButton>
        <Modal.Title>
          <HeaderIcon><FiAward /></HeaderIcon> {/* Icon for liquor vendor/license */}
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
                <IconWrapper><FiBox /></IconWrapper> {/* Box for products */}
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
                <InputField name="city" defaultValue={defaultCity} required disabled />
              </FormGroup>

              <FormGroup>
                <Form.Label>Latitude</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="latitude" type="number" step="any" placeholder="e.g., -1.286389" defaultValue={defaultLatitude} required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Longitude</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="longitude" type="number" step="any" placeholder="e.g., 36.817223" defaultValue={defaultLongitude} required />
              </FormGroup>
            </div>
          </div>

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

export default LiquorVendorRegistrationModal;