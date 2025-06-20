// src/components/JikoniAnalyticsDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Row, Col, Form, Spinner, Alert, Button 
} from 'react-bootstrap';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { 
  People, EggFried, Wine, Shop, PersonCircle, GraphUp, CloudDownload,
} from 'react-bootstrap-icons';
import styled from 'styled-components';

// --- Jikoni Express Color Palette ---
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  accent: '#FFC107', // Amber
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
  gradientStart: '#FF6F59', // Lighter red for gradient
  successGreen: '#28A745', // Specific green for success
};

// --- Styled Components (Minimal, focusing on requested metrics) ---
const DashboardContainer = styled.div`
  background: ${colors.lightBackground};
  min-height: 100vh;
  padding: 2rem;
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${colors.cardBackground};
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const MetricCard = styled(Card)`
  background: ${colors.cardBackground};
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(31,38,135,0.1);
  border: 1px solid rgba(255,255,255,0.18);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%; /* Ensure cards in a row have equal height */

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(31,38,135,0.15);
  }
`;

const IconWrapper = styled.div`
  width: 55px;
  height: 55px;
  border-radius: 50%; /* Changed to circle for a different look */
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ bgColor }) => bgColor || colors.primary};
  color: ${colors.cardBackground};
  font-size: 1.8rem;
  margin-right: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const MetricValue = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${colors.darkText}; /* Keep dark text for numbers */
`;

const MetricLabel = styled.h5`
  font-size: 1rem;
  color: ${colors.placeholderText};
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const BASE_URL = "http://localhost:5000/api/jikoni-express"; // New base URL for analytics

const JikoniAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    registeredChefs: 0,
    registeredVendors: 0,
    foodItemsPosted: 0,
    liquorItemsPosted: 0,
    registeredUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJikoniAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data from the new consolidated endpoint
      const response = await axios.get(`${BASE_URL}/analytics`);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching Jikoni Express analytics:', err);
      setError('Failed to load Jikoni Express analytics data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJikoniAnalytics();
  }, [fetchJikoniAnalytics]);

  const exportToExcel = async () => {
    if (!analyticsData) {
      alert("No data to export.");
      return;
    }

    try {
      const dataToExport = [
        { Metric: "Registered Chefs", Count: analyticsData.registeredChefs },
        { Metric: "Registered Vendors", Count: analyticsData.registeredVendors },
        { Metric: "Registered Users", Count: analyticsData.registeredUsers },
        { Metric: "Food Items Posted", Count: analyticsData.foodItemsPosted },
        { Metric: "Liquor Items Posted", Count: analyticsData.liquorItemsPosted },
      ];

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Jikoni Analytics');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, 'jikoni_express_analytics.xlsx');
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data to Excel.');
    }
  };

  if (loading) {
    return (
      <DashboardContainer className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading Jikoni Express Analytics...</span>
        </Spinner>
        <p className="ms-3 text-muted">Loading Jikoni Express Analytics...</p>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer className="d-flex justify-content-center align-items-center">
        <Alert variant="danger" className="text-center p-4 shadow-sm">
          <h4 className="alert-heading">Oh snap! An error occurred!</h4>
          <p>{error}</p>
          <hr />
          <Button variant="outline-danger" onClick={fetchJikoniAnalytics}>
            Try Reloading Analytics
          </Button>
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <AnalyticsHeader>
        <h2 className="mb-0 d-flex align-items-center gap-3 text-darkText">
          <GraphUp size={38} color={colors.primary} />
          Jikoni Express Key Metrics
        </h2>
        <Button variant="outline-primary" onClick={exportToExcel}>
          <CloudDownload className="me-2" /> Export to Excel
        </Button>
      </AnalyticsHeader>

      <Row className="g-4 mb-4">
        {/* Registered Chefs */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <MetricCard className="p-4 d-flex align-items-center">
            <IconWrapper bgColor={colors.primary}>
              <People />
            </IconWrapper>
            <div>
              <MetricLabel>Registered Chefs</MetricLabel>
              <MetricValue>{analyticsData.registeredChefs}</MetricValue>
            </div>
          </MetricCard>
        </Col>

        {/* Registered Vendors */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <MetricCard className="p-4 d-flex align-items-center">
            <IconWrapper bgColor={colors.secondary}>
              <Shop />
            </IconWrapper>
            <div>
              <MetricLabel>Registered Vendors</MetricLabel>
              <MetricValue>{analyticsData.registeredVendors}</MetricValue>
            </div>
          </MetricCard>
        </Col>

        {/* Registered Users */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <MetricCard className="p-4 d-flex align-items-center">
            <IconWrapper bgColor={colors.accent}>
              <PersonCircle />
            </IconWrapper>
            <div>
              <MetricLabel>Registered Users</MetricLabel>
              <MetricValue>{analyticsData.registeredUsers}</MetricValue>
            </div>
          </MetricCard>
        </Col>

        {/* Food Items Posted */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <MetricCard className="p-4 d-flex align-items-center">
            <IconWrapper bgColor={colors.primary}>
              <EggFried />
            </IconWrapper>
            <div>
              <MetricLabel>Food Items Posted</MetricLabel>
              <MetricValue>{analyticsData.foodItemsPosted}</MetricValue>
            </div>
          </MetricCard>
        </Col>

        {/* Liquor Items Posted */}
        <Col xs={12} sm={6} lg={4} xl={3}>
          <MetricCard className="p-4 d-flex align-items-center">
            <IconWrapper bgColor={colors.secondary}>
              <Wine />
            </IconWrapper>
            <div>
              <MetricLabel>Liquor Items Posted</MetricLabel>
              <MetricValue>{analyticsData.liquorItemsPosted}</MetricValue>
            </div>
          </MetricCard>
        </Col>
      </Row>

      {/* You can add more sections here if needed, following the same styling conventions */}

    </DashboardContainer>
  );
};

export default JikoniAnalyticsDashboard;
