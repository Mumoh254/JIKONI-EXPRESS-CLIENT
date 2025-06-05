import React, { useState } from 'react';
import {
  Modal, Form, Button, Spinner // Keep necessary react-bootstrap components for structure
} from 'react-bootstrap';
import {
  FiBriefcase, FiAward, FiMapPin, FiGlobe, FiFeather, FiCheckSquare, FiSend, FiStar // Using react-icons for modern appeal
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
  position: relative; /* For potential background elements */
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

const ChefRegistrationModal = ({ show, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    const data = {
      bio: formData.get('bio'),
      speciality: formData.get('speciality'),
      experienceYears: parseInt(formData.get('experienceYears')),
      certifications: formData.get('certifications') ? formData.get('certifications').split(',').map(s => s.trim()) : [], // Handle empty or split by comma
      location: formData.get('location'),
      city: formData.get('city'),
      latitude: parseFloat(formData.get('latitude')),
      longitude: parseFloat(formData.get('longitude'))
    };

    await onSubmit(data); // Assume onSubmit handles its own async logic and SweetAlert
    setSubmitting(false);
  };

  // Set Nairobi as default city and its coordinates (Kenya's capital)
  const defaultCity = "Nairobi";
  const defaultLatitude = -1.286389; // Latitude for Nairobi
  const defaultLongitude = 36.817223; // Longitude for Nairobi

  return (
    <Modal show={show} onHide={onClose} centered size="lg"> {/* Increased size for more content */}
      <StyledModalHeader closeButton>
        <Modal.Title>
          <HeaderIcon><FiFeather /></HeaderIcon> {/* Chef's hat or similar icon */}
          Become a Jikoni Master Chef!
        </Modal.Title>
      </StyledModalHeader>
      <StyledModalBody>
        <p className="text-muted text-center mb-4">
          Share your culinary passion with the world! Fill out your profile to join the Jikoni Express network of talented chefs.
        </p>
        <Form onSubmit={handleSubmit}>
          <div className="row"> {/* Use Bootstrap grid for a two-column layout */}
            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Chef Bio</Form.Label>
                <IconWrapper><FiFeather /></IconWrapper> {/* Feather or pen icon */}
                <InputField name="bio" as="textarea" rows={3} placeholder="Tell us about your culinary journey..." required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Culinary Specialty</Form.Label>
                <IconWrapper><FiStar /></IconWrapper> {/* Star for specialty */}
                <SelectField name="speciality" required>
                  <option value="">Select a specialty</option> {/* Added default empty option */}
                  <option value="African Cuisine">African Cuisine</option>
                  <option value="Continental">Continental</option>
                  <option value="Fusion">Fusion</option>
                  <option value="Asian">Asian</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Baking & Pastry">Baking & Pastry</option>
                </SelectField>
              </FormGroup>

              <FormGroup>
                <Form.Label>Years of Experience</Form.Label>
                <IconWrapper><FiBriefcase /></IconWrapper> {/* Briefcase for experience */}
                <InputField name="experienceYears" type="number" min="0" placeholder="e.g., 5" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Certifications (comma separated)</Form.Label>
                <IconWrapper><FiAward /></IconWrapper> {/* Award for certifications */}
                <InputField name="certifications" placeholder="e.g., HACCP, Food Safety, Culinary Diploma" />
              </FormGroup>
            </div>

            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Your Location Address</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="location" placeholder="e.g., Kileleshwa, Othaya Road" required />
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