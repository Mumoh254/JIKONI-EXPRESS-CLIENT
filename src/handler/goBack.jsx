// handler/goBack.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';

// Styled components
export const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 1rem;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;

  h2 {
    flex-grow: 1;
    text-align: center;
    color: #2d3748;
    font-size: 1.25rem;
    margin: 0;
  }
`;

const FloatingBackButton = styled.button`
  position: fixed;
  bottom: 120px;
  right: 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 100;

  &:hover {
    background: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// PageWithBack component
export const PageWithBack = ({
  children,
  title,
  showBackButton = true,
  onBack = null,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <h2>{title}</h2>
      </PageHeader>

      {children}

      {showBackButton && (
        <FloatingBackButton onClick={handleBack} aria-label="Go back">
          <FiArrowLeft size={18} />
        </FloatingBackButton>
      )}
    </PageContainer>
  );
};
