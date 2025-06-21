import React, { useState, useEffect } from "react";
import { PieChart, LineChart, ColumnChart } from "react-chartkick";
import "chartkick/chart.js";
import { Chart, registerables } from "chart.js";
import { Container, Row, Col, Card, Spinner, Modal, Button, ListGroup, Badge, Form } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(...registerables, ChartDataLabels);

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
  gradientStart: '#FF6F59', // Lighter red for gradient
  successGreen: '#28A745', // For positive feedback
  // Expanded and refined custom colors for charts to match Jikoni theme, with more blues and vibrancy
  chartColors: [
    '#4285F4', // Google Blue (vibrant)
    '#34A853', // Google Green (vibrant)
    '#FBBC04', // Google Yellow (vibrant)
    '#EA4335', // Google Red (vibrant)
    '#1ABC9C', // Turquoise
    '#2C3E50', // Midnight Blue
    '#9B59B6', // Amethyst
    '#3498DB', // Peter River (light blue)
    '#E67E22', // Carrot Orange
    '#7F8C8D', // Asbestos (dark grey)
    '#C0392B', // Pomegranate (dark red)
    '#27AE60', // Nephritis (dark green)
    '#2980B9', // Belize Hole (medium blue)
    '#8E44AD', // Wisteria (medium purple)
    '#D35400', // Pumpkin (dark orange)
    '#BDC3C7', // Silver (light grey)
  ],
};

const BASE_URL = "http://localhost:8000/apiV1/smartcity-ke"; // Your base URL for the backend

const JikoniDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userStats: {
      total: 0,
      genderDistribution: {}, // { 'Male': 100, 'Female': 80, 'Other': 20 }
      weekly: {},
      monthly: {}
    },
    foodStats: {
      total: 0,
      categories: {} // This will remain empty if backend doesn't provide it
    },
    orderStats: {
      total: 0,
      totalDeliveredOrders: 0, // Added new field
      monthly: {},
      status: {}
    },
    riderStats: {
      total: 0,
      totalPayoutToRiders: 0, // Added new field
    },
    chefStats: {
      total: 0
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const currentYear = new Date().getFullYear();
  // State for year selection, initialized to current year as a string
  const [selectedYearForTrends, setSelectedYearForTrends] = useState(String(currentYear));

  // Helper function to get available years from monthly data
  const getAvailableYears = (data) => {
    const years = new Set();
    Object.keys(data).forEach(monthYear => {
      const year = monthYear.split(' ')[1];
      if (year) years.add(year);
    });
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    return sortedYears.length > 0 ? sortedYears : [String(currentYear)]; // Fallback to current year
  };

  const parseMonthYear = (monthYearStr) => {
    const [monthAbbr, year] = monthYearStr.split(' ');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = months.indexOf(monthAbbr);
    return new Date(year, monthIndex);
  };

  // Function to show alerts (SweetAlert2)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data from the jikoni-analytics endpoint
        const response = await axios.get(`http://localhost:8000/apiV1/smartcity-ke/jikoni-analytics`);
        // The backend response has the actual data nested under 'data' key
        const d = response.data.data; // Get the nested 'data' object

        setDashboardData({
          userStats: {
            total: d.totalUsers || 0,
            genderDistribution: d.genderDistribution || {}, // Use genderDistribution directly
            weekly: d.weeklyRegistrations || {},
            monthly: d.monthlyRegistrations || {}
          },
          foodStats: {
            total: d.totalFoodsListed || 0,
            categories: d.foodCategories || {} // If backend adds foodCategories in future
          },
          orderStats: {
            total: d.totalOrdersMade || 0,
            totalDeliveredOrders: d.totalDeliveredOrders || 0, // Assign new field
            monthly: d.monthlyOrderTrends || {},
            status: d.orderStatus || {} // Use orderStatus directly
          },
          riderStats: {
            total: d.totalRiders || 0,
            totalPayoutToRiders: d.totalPayoutToRiders || 0, // Assign new field
          },
          chefStats: {
            total: d.totalChefs || 0
          }
        });

        setLoading(false);
      } catch (error) {
        showAlert("error", "Failed to load dashboard data");
        console.error("API Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.lightBackground }}>
        <Spinner animation="border" style={{ color: colors.primary }} />
        <p className="ms-3" style={{ color: colors.darkText }}>Loading Jikoni Express Analytics...</p>
      </div>
    );
  }

  // Helper to format numbers with commas
  const formatNumber = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Get available years for month/year dropdowns
  const monthlyRegYears = dashboardData?.userStats?.monthly
    ? getAvailableYears(dashboardData.userStats.monthly)
    : [];

  const monthlyOrderYears = dashboardData?.orderStats?.monthly
    ? getAvailableYears(dashboardData.orderStats.monthly)
    : [];

  // Simplified handleChartClick for generic modal display (no specific drill-down lists for now)
  const handleChartClick = (label, value, chartType) => {
    setSelectedData({
      label: label,
      value: value,
      chartType: chartType,
    });
    setShowModal(true);
  };

  const renderModalContent = () => {
    if (!selectedData) return <p>No data selected</p>;
    return (
      <div>
        <h5>{selectedData.label}</h5>
        <p className="mb-3">Count: {selectedData.value}</p>
        <p className="text-muted">
          This chart segment represents {selectedData.label} in the {selectedData.chartType} chart.
          Detailed lists can be added here if your backend supports specific filtering for these data points.
        </p>
      </div>
    );
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: colors.lightBackground, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h2 className="text-center p-3 mb-5 fw-bold" style={{ color: colors.darkText, backgroundColor: colors.cardBackground, borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
        <span style={{ color: colors.primary }}>Jikoni Express</span> <span style={{ color: colors.chartColors[0] }}>Analytics</span> Dashboard
      </h2>

      <Row className="g-4 mb-5 justify-content-center">
        {/* Total Counts Cards */}
        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
          <Card className="h-100 shadow-lg border-0 transform-hover" style={{ backgroundColor: colors.primary, color: colors.cardBackground, borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
              <h3 className="mb-1 fw-bold fs-2">
                {formatNumber(dashboardData.userStats.total)}
              </h3>
              <p className="mb-0 fs-6 text-opacity-75">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
          <Card className="h-100 shadow-lg border-0 transform-hover" style={{ backgroundColor: colors.secondary, color: colors.cardBackground, borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
              <h3 className="mb-1 fw-bold fs-2">
                {formatNumber(dashboardData.foodStats.total)}
              </h3>
              <p className="mb-0 fs-6 text-opacity-75">Foods Listed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
          <Card className="h-100 shadow-lg border-0 transform-hover" style={{ backgroundColor: colors.chartColors[0], color: colors.cardBackground, borderRadius: '15px' }}> {/* Bright Blue */}
            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
              <h3 className="mb-1 fw-bold fs-2">
                {formatNumber(dashboardData.orderStats.total)}
              </h3>
              <p className="mb-0 fs-6 text-opacity-75">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
          <Card className="h-100 shadow-lg border-0 transform-hover" style={{ backgroundColor: colors.chartColors[3], color: colors.cardBackground, borderRadius: '15px' }}> {/* Google Red */}
            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
              <h3 className="mb-1 fw-bold fs-2">
                {formatNumber(dashboardData.orderStats.totalDeliveredOrders)}
              </h3>
              <p className="mb-0 fs-6 text-opacity-75">Orders Delivered</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
          <Card className="h-100 shadow-lg border-0 transform-hover" style={{ backgroundColor: colors.chartColors[4], color: colors.cardBackground, borderRadius: '15px' }}> {/* Turquoise */}
            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
              <h3 className="mb-1 fw-bold fs-2">
                {formatNumber(dashboardData.riderStats.total)}
              </h3>
              <p className="mb-0 fs-6 text-opacity-75">Registered Riders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
          <Card className="h-100 shadow-lg border-0 transform-hover" style={{ backgroundColor: colors.chartColors[6], color: colors.cardBackground, borderRadius: '15px' }}> {/* Amethyst */}
            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
              <h3 className="mb-1 fw-bold fs-2">
                {formatNumber(dashboardData.chefStats.total)}
              </h3>
              <p className="mb-0 fs-6 text-opacity-75">Registered Chefs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
          <Card className="h-100 shadow-lg border-0 transform-hover" style={{ backgroundColor: colors.chartColors[8], color: colors.cardBackground, borderRadius: '15px' }}> {/* Carrot Orange */}
            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
              <h3 className="mb-1 fw-bold fs-2">
                Ksh {formatNumber(dashboardData.riderStats.totalPayoutToRiders)}
              </h3>
              <p className="mb-0 fs-6 text-opacity-75">Payout to Riders</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* User Gender Distribution */}
        <Col xl={4} lg={6}>
          <Card className="h-100 shadow-lg" style={{ border: `1px solid ${colors.borderColor}`, borderRadius: '12px' }}>
            <Card.Body>
              <h5 className="card-title mb-4 fw-bold" style={{ color: colors.darkText }}>User Gender Distribution</h5>
              <PieChart
                data={dashboardData.userStats.genderDistribution}
                colors={[colors.chartColors[0], colors.chartColors[3], colors.chartColors[9], colors.chartColors[15]]} // Blues, Reds, and Greys for contrast
                library={{
                  onClick: (e, elements) => {
                    if (elements.length > 0) {
                      const chart = e.chart;
                      const index = elements[0].index;
                      const label = chart.data.labels[index];
                      const value = chart.data.datasets[0].data[index];
                      handleChartClick(label, value, 'Gender Distribution');
                    }
                  },
                  plugins: {
                    datalabels: {
                      formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                          sum += data;
                        });
                        let percentage = (value * 100 / sum).toFixed(2) + "%";
                        return percentage;
                      },
                      color: '#fff',
                      textShadowColor: 'rgba(0,0,0,0.6)',
                      textShadowBlur: 4,
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Weekly Registrations */}
        <Col xl={4} lg={6}>
          <Card className="h-100 shadow-lg" style={{ border: `1px solid ${colors.borderColor}`, borderRadius: '12px' }}>
            <Card.Body>
              <h5 className="card-title mb-4 fw-bold" style={{ color: colors.darkText }}>Weekly Registrations</h5>
              <ColumnChart
                data={Object.entries(dashboardData.userStats.weekly).sort((a, b) => {
                  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  return dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]);
                })}
                colors={[colors.chartColors[1]]} // Google Green
                library={{
                  onClick: (e, elements) => {
                    if (elements?.length > 0) {
                      const chart = e.chart;
                      const pointIndex = elements[0].index;
                      const day = chart.data.labels[pointIndex];
                      const value = chart.data.datasets[0].data[pointIndex];
                      handleChartClick(day, value, 'Weekly Registrations');
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: (value) => value.toLocaleString() }
                    }
                  },
                  plugins: {
                    datalabels: {
                      display: true,
                      color: colors.darkText,
                      anchor: "end",
                      align: "top",
                      formatter: (value) => value > 0 ? value : '', // Only show if value > 0
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Monthly User Registrations */}
        <Col xl={4} lg={12}>
          <Card className="h-100 shadow-lg" style={{ border: `1px solid ${colors.borderColor}`, borderRadius: '12px' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold" style={{ color: colors.darkText }}>Monthly User Registrations</h5>
                <Form.Select
                  style={{ width: '120px', borderColor: colors.borderColor, borderRadius: '8px' }}
                  value={selectedYearForTrends}
                  onChange={(e) => setSelectedYearForTrends(e.target.value)}
                >
                  {monthlyRegYears.map(year => (
                    <option key={`reg-${year}`} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </div>
              <LineChart
                data={Object.entries(dashboardData.userStats.monthly)
                  .filter(([monthYear]) => monthYear.endsWith(selectedYearForTrends))
                  .sort((a, b) => parseMonthYear(a[0]) - parseMonthYear(b[0]))
                  .map(([monthYear, count]) => {
                    const monthAbbr = monthYear.split(' ')[0];
                    return [monthAbbr, count];
                  })}
                colors={[colors.chartColors[7]]} // Peter River (Light Blue)
                library={{
                  onClick: (e, elements) => {
                    if (elements?.length > 0) {
                      const chart = e.chart;
                      const pointIndex = elements[0].index;
                      const monthAbbr = chart.data.labels[pointIndex];
                      const value = chart.data.datasets[0].data[pointIndex];
                      handleChartClick(`${monthAbbr} ${selectedYearForTrends}`, value, 'Monthly Registrations');
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: (value) => value.toLocaleString() }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Order Status Distribution */}
        <Col xl={6} lg={6}>
          <Card className="h-100 shadow-lg" style={{ border: `1px solid ${colors.borderColor}`, borderRadius: '12px' }}>
            <Card.Body>
              <h5 className="card-title mb-4 fw-bold" style={{ color: colors.darkText }}>Order Status Distribution</h5>
              <PieChart
                data={dashboardData.orderStats.status}
                colors={[
                  colors.chartColors[0],  // Google Blue
                  colors.chartColors[1],  // Google Green
                  colors.chartColors[3],  // Google Red
                  colors.chartColors[4],  // Turquoise
                  colors.chartColors[6],  // Amethyst
                  colors.chartColors[8],  // Carrot Orange
                  colors.chartColors[11], // Nephritis
                ]} // Diverse colors for status
                library={{
                  onClick: (e, elements) => {
                    if (elements.length > 0) {
                      const chart = e.chart;
                      const index = elements[0].index;
                      const label = chart.data.labels[index];
                      const value = chart.data.datasets[0].data[index];
                      handleChartClick(label, value, 'Order Status');
                    }
                  },
                  plugins: {
                    datalabels: {
                      formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                          sum += data;
                        });
                        let percentage = (value * 100 / sum).toFixed(2) + "%";
                        return percentage;
                      },
                      color: '#fff',
                      textShadowColor: 'rgba(0,0,0,0.6)',
                      textShadowBlur: 4,
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Monthly Order Trends */}
        <Col xl={6} lg={12}>
          <Card className="h-100 shadow-lg" style={{ border: `1px solid ${colors.borderColor}`, borderRadius: '12px' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold" style={{ color: colors.darkText }}>Monthly Order Trends</h5>
                <Form.Select
                  style={{ width: '120px', borderColor: colors.borderColor, borderRadius: '8px' }}
                  value={selectedYearForTrends}
                  onChange={(e) => setSelectedYearForTrends(e.target.value)}
                >
                  {monthlyOrderYears.map(year => (
                    <option key={`order-${year}`} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </div>
              <LineChart
                data={Object.entries(dashboardData.orderStats.monthly)
                  .filter(([monthYear]) => monthYear.endsWith(selectedYearForTrends))
                  .sort((a, b) => parseMonthYear(a[0]) - parseMonthYear(b[0]))
                  .map(([monthYear, count]) => {
                    const monthAbbr = monthYear.split(' ')[0];
                    return [monthAbbr, count];
                  })}
                colors={[colors.chartColors[5]]} // Midnight Blue
                library={{
                  onClick: (e, elements) => {
                    if (elements?.length > 0) {
                      const chart = e.chart;
                      const pointIndex = elements[0].index;
                      const monthAbbr = chart.data.labels[pointIndex];
                      const value = chart.data.datasets[0].data[pointIndex];
                      handleChartClick(`${monthAbbr} ${selectedYearForTrends}`, value, 'Monthly Orders');
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { callback: (value) => value.toLocaleString() }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="md" centered>
        <Modal.Header closeButton style={{ backgroundColor: colors.primary, color: colors.cardBackground, borderBottom: 'none' }}>
          <Modal.Title>{selectedData?.label} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: colors.lightBackground }}>
          {renderModalContent()}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: colors.cardBackground, borderTop: 'none' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ backgroundColor: colors.secondary, border: 'none' }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Add a simple style for hover effect on cards, as inline styles don't support :hover */}
      <style jsx>{`
        .transform-hover {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .transform-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.25) !important;
        }
      `}</style>
    </Container>
  );
};

export default JikoniDashboard;
