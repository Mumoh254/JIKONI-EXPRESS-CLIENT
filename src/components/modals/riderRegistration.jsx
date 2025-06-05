import React, { useEffect, useState } from 'react';
import {
  Modal, Form, Button, Spinner // Keep necessary react-bootstrap components for structure
} from 'react-bootstrap';
import {
  FiUser, FiMapPin, FiTruck, FiClock, FiCheckSquare, FiHash // Use react-icons for more modern feel
} from 'react-icons/fi'; // Import icons for form fields
import styled, { keyframes } from 'styled-components'; // Import styled-components and keyframes
import   { getUserNameFromToken  } from '../../handler/tokenDecorder'
// --- Jikoni Express Color Palette ---
import { SiCoinmarketcap } from "react-icons/si";
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
    align-items: center;
    gap: 0.75rem;
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

const RiderRegistration = ({ show, onClose, onSubmit }) => {
   const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const userData = getUserNameFromToken();
    setUser(userData);
  }, []);

    console.log(user)


 const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  // Manually override the checkbox with the boolean state
  data.agreedToTerms = agreedToTerms;
  data.userId = user?.id || user?._id;

  await onSubmit(data);
  setSubmitting(false);
};


  return (
    <Modal show={show} onHide={onClose} centered size="lg"> 
      <StyledModalHeader closeButton>
        <Modal.Title>
          <FormHeaderIcon><FiTruck /></FormHeaderIcon>
          Become a Jikoni Rider!
        </Modal.Title>
      </StyledModalHeader>
      <StyledModalBody>
        <p className="text-muted text-center mb-4">Join our team and start delivering delicious food across Nairobi!</p>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <FormGroup>
                <Form.Label>National ID</Form.Label>
                <IconWrapper><FiUser /></IconWrapper>
                <InputField name="nationalId" type="text" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>City</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="city" type="text" required defaultValue="Nairobi" disabled />
              </FormGroup>

              <FormGroup>
                <Form.Label>Area</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="area" type="text" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Neighborhood</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="neighborhood" type="text" required />
              </FormGroup>
            </div>
            <div className="col-md-6">
              <FormGroup>
                <Form.Label>Vehicle Type</Form.Label>
                <IconWrapper><FiTruck /></IconWrapper>
             <SelectField name="vehicleType" required>

                  <option value="">Select your vehicle type</option> {/* Added default empty option */}
                  <option>Bicycle</option>
                  <option>Motorcycle</option>
                  <option>Car</option>
                </SelectField>
              </FormGroup>

              <FormGroup>
                <Form.Label>Registration Number Plate</Form.Label>
                <IconWrapper><FiHash /></IconWrapper>
                <InputField name="registrationPlate" type="text" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Preferred Work Hours</Form.Label>
                <IconWrapper><FiClock /></IconWrapper>
                <InputField name="workHours" type="text" placeholder="e.g. 9am - 5pm or Flexible" required />
              </FormGroup>


               <FormGroup>
                <Form.Label>Service City</Form.Label>
                <IconWrapper><iCoinmarketcap  /></IconWrapper>
                <InputField name="city" type="text" required />
              </FormGroup>

              <FormGroup>
                <Form.Label>Service Area</Form.Label>
                <IconWrapper><FiMapPin /></IconWrapper>
                <InputField name="serviceArea" type="text" required />
              </FormGroup>
            </div>
          </div> {/* End Row */}

          <FormGroup className="mb-4 text-center"> {/* Centered checkbox */}
     <CheckboxField
  name="agreedToTerms"
  type="checkbox"
  label="I agree to Jikoni Express Rider Terms and Conditions"
  required
/>

          </FormGroup>

          <SubmitButton type="submit" disabled={submitting}>
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