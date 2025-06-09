import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUserPlus,
  FiLock,
  FiMail,
  FiCheckCircle,
  FiUser,
  FiSmartphone,
  FiUserCheck,
  FiLoader
} from 'react-icons/fi'; // Removed FiCreditCard as it's not used
import axios from 'axios';
import styled, { keyframes } from 'styled-components'; // Import keyframes for animations
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';

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
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components (Updated) ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.lightBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const AuthContainer = styled.div`
  max-width: 450px; /* Slightly wider for better spacing */
  width: 100%;
  padding: 2.5rem;
  background: ${colors.cardBackground};
  border-radius: 16px; /* More rounded corners */
  box-shadow: 0 8px 24px rgba(0,0,0,0.15); /* More prominent shadow */
  text-align: center;
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  .icon {
    font-size: 3.5rem; /* Larger icon */
    color: ${colors.primary};
    margin-bottom: 1rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  h1 {
    font-size: 2.2rem; /* Larger heading */
    font-weight: 700;
    color: ${colors.darkText};
  }
  p {
    font-size: 1rem;
    color: ${colors.placeholderText};
    margin-top: 0.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: ${colors.placeholderText};
  font-size: 1.2rem; /* Larger icon in input */
`;

const InputField = styled(Field)`
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3rem; /* More padding and space for icon */
  border: 1px solid ${colors.borderColor};
  border-radius: 10px; /* Slightly more rounded */
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

const SelectField = styled.select`
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3rem;
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

const ErrorText = styled.div`
  color: ${colors.errorText};
  font-size: 0.875rem;
  margin-top: 0.5rem; /* More margin for clarity */
  text-align: left;
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
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem; /* More space */
  font-size: 0.95rem;
  color: ${colors.darkText};

  a {
    color: ${colors.secondary}; /* Use Jikoni Green for links */
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
    &:hover {
      color: #00B247; /* Slightly darker green on hover */
      text-decoration: underline;
    }
  }
`;

// --- Validation Schema (unchanged) ---
const validationSchema = Yup.object().shape({
  Name: Yup.string()
    .required('Full Name is required')
    .matches(/^[A-Za-z ]+$/, 'Name should only contain letters'),
  PhoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Invalid phone number (10 digits expected)')
    .required('Phone Number is required'),
  Email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  Gender: Yup.string()
    .required('Gender is required')
    .oneOf(['MALE', 'FEMALE', 'OTHER'], 'Invalid gender selection'),
  Password: Yup.string()
    .min(8, 'Password must be at least 8 characters') // Changed from 6 to 8 for stronger password
    .required('Password is required'),
  ConfirmPassword: Yup.string()
    .oneOf([Yup.ref('Password'), null], 'Passwords must match')
    .required('Confirm Password is required')
});

const BASE_URl = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError('');
      const response = await axios.post(`${BASE_URl}/register`, {
        Name: values.Name,
        PhoneNumber: values.PhoneNumber,
        Email: values.Email,
        Gender: values.Gender,
        Password: values.Password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/login');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <PageWrapper>
      <AuthContainer>
        <Header>
          <FiUserPlus className="icon" />
          <h1>Join Jikoni Express</h1>
          <p>Create your account to start your culinary journey.</p>
        </Header>

        <Formik
          initialValues={{
            Name: '',
            PhoneNumber: '',
            Email: '',
            Gender: '',
            Password: '',
            ConfirmPassword: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Full Name Field */}
              <FormGroup>
                <IconWrapper><FiUser /></IconWrapper>
                <InputField name="Name" type="text" placeholder="Full Name" />
                <ErrorMessage name="Name" component={ErrorText} />
              </FormGroup>

              {/* Phone Number Field */}
              <FormGroup>
                <IconWrapper><FiSmartphone /></IconWrapper>
                <InputField name="PhoneNumber" type="tel" placeholder="Phone Number" />
                <ErrorMessage name="PhoneNumber" component={ErrorText} />
              </FormGroup>

              {/* Email Field */}
              <FormGroup>
                <IconWrapper><FiMail /></IconWrapper>
                <InputField name="Email" type="email" placeholder="Email" />
                <ErrorMessage name="Email" component={ErrorText} />
              </FormGroup>

              {/* Gender Field */}
              <FormGroup>
                <IconWrapper><FiUserCheck /></IconWrapper>
                <Field name="Gender" as={SelectField}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Field>
                <ErrorMessage name="Gender" component={ErrorText} />
              </FormGroup>

              {/* Password Field */}
              <FormGroup>
                <IconWrapper><FiLock /></IconWrapper>
                <InputField name="Password" type="password" placeholder="Password" />
                <ErrorMessage name="Password" component={ErrorText} />
              </FormGroup>

              {/* Confirm Password Field */}
              <FormGroup>
                <IconWrapper><FiCheckCircle /></IconWrapper>
                <InputField name="ConfirmPassword" type="password" placeholder="Confirm Password" />
                <ErrorMessage name="ConfirmPassword" component={ErrorText} />
              </FormGroup>

              {serverError && <ErrorText style={{ marginBottom: '1rem' }}>{serverError}</ErrorText>}

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Create Jikoni Account' // More branded text
                )}
              </SubmitButton>

              <LinkText>
                Already have an account?{' '}
                <Link to="/login">
                  Login here
                </Link>
              </LinkText>
            </Form>
          )}
        </Formik>
      </AuthContainer>
    </PageWrapper>
  );
};

export default Register;