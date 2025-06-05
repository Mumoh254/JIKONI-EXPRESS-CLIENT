// src/components/AnalyticsDashboard.jsx
import React, { useState, useEffect  , useMemo} from 'react';
import { 
  Card, Row, Col, Form, Spinner, Alert, Carousel, Table, Modal, Button, Badge, Pagination 
} from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { 
  CashCoin, CartCheck, Clock, GraphUp, People, Tag, 
  CreditCard, BoxSeam, ArrowRepeat, CurrencyDollar, Send, Star 
} from 'react-bootstrap-icons';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement,
  ArcElement, // Add this for doughnut charts
  Filler // Add this for area fills
} from 'chart.js';
import { BiDownload } from 'react-icons/bi';
import { FaBatteryQuarter, FaBatteryHalf, FaBatteryFull  ,  FaHeartbeat } from 'react-icons/fa';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  PointElement,
  ArcElement, // Register ArcElement for doughnut/pie charts
  Filler // Register Filler plugin for area fills
);




ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const CHART_COLORS = ["#ff3b30", "#5856d6", "#ffcc00", "#ff2d55", "#007aff"];

const styles = `
  .dashboard-container {
    background: #f8fafc;
    min-height: 100vh;
    padding: 2rem;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(31,38,135,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(31,38,135,0.15);
  }
  .metric-highlight {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    background: linear-gradient(135deg, #6366f1, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .compact-carousel {
    height: 280px;
    border-radius: 1rem;
    overflow: hidden;
  }
  .carousel-image {
    height: 280px;
    object-fit: cover;
    width: 100%;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }
  .carousel-image:hover {
    transform: scale(1.02);
  }
  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-color: rgba(0,0,0,0.5);
    border-radius: 50%;
    padding: 15px;
    background-size: 60%;
  }
  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .fast-moving {
    background: #e3fcef;
    color: #006644;
  }
  .slow-moving {
    background: #ffe8e8;
    color: #d1242f;
  }
  .icon-wrapper {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #007aff, #00a8ff);
    color: white;
    margin-bottom: 1rem;
  }
  .table-hover-modern tbody tr:hover {
    background: rgba(0,122,255,0.03);
  }
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 1rem;
  }
  .time-selector {
    width: 200px;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
  }
`;

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('weekly');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/sales/analytics?range=${timeRange}`);
        setAnalytics(data);
        console.log(data)
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  // Loyal Customer Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = analytics?.repeatCustomers?.slice(indexOfFirstCustomer, indexOfLastCustomer) || [];

  // Fuel Gauge Chart for Peak Hour
  const peakHourGaugeData = {
    datasets: [{
      data: [
        Math.min(analytics?.peakHour?.revenue || 0, 100000),  // Ensure revenue doesn't exceed 100000
        100000 - (Math.min(analytics?.peakHour?.revenue || 0, 100000))  // Ensure the second value is correct
      ],
      backgroundColor: ['#00ff00', '#e0e0e0'],
      circumference: 270,  // Creates a semi-circle effect
      rotation: 225,  // Start the gauge at 225 degrees
      borderWidth: 0
    }]
  };
  
  const customerGrowthData = {
    labels: ['2025-13'], // This would be dynamic based on your weekly data
    datasets: [
      {
        label: 'Customer Growth',
        data: [5], // Customer growth count for the specific week(s)
        borderColor: 'rgba(75,192,192,1)', // Line color
        backgroundColor: 'rgba(75,192,192,0.2)', // Line fill color
        pointRadius: 10, // Circle size
        pointBackgroundColor: (context) => {
          const value = context.raw;
          // Color based on the customer count ranges
          if (value <= 500) return 'rgba(255,99,132,1)'; // Low
          if (value <= 2000) return 'rgba(255,159,64,1)'; // Medium
          if (value <= 5000) return 'rgba(255,205,86,1)'; // Upper
          return 'rgba(75,192,192,1)'; // High
        },
        pointHoverBackgroundColor: 'rgba(54,162,235,1)', // Hover color
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' },
    },
    scales: {
      x: { grid: { display: false }, title: { display: true, text: 'Weeks' } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Customer Count' },
        ticks: {
          callback: (value) => {
            // Custom y-axis labels based on value ranges
            if (value === 500) return 'Low';
            if (value === 2000) return 'Medium';
            if (value === 5000) return 'Upper';
            if (value > 5000) return 'High';
          },
        },
      },
    },
  };
  

  const productSalesData = {
    labels: [...new Set((analytics?.productSalesTrends || []).flatMap(p => p.salesData.map(d => d.date)))],
    datasets: (analytics?.productSalesTrends || []).map((product, index) => ({
      label: product.name,
      data: product.salesData.map(d => d.units_sold),
      borderColor: (analytics?.chartColors ? analytics.chartColors[index % analytics.chartColors.length] : CHART_COLORS[index % CHART_COLORS.length]),
      backgroundColor: `KSH{(analytics?.chartColors ? analytics.chartColors[index % analytics.chartColors.length] : CHART_COLORS[index % CHART_COLORS.length])}20`,
      tension: 0.3,
      pointRadius: 3
    }))
  };

  const exportToExcel = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/sales/export');
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, 'sales_report.xlsx');
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Revenue Trends Chart Data (Past 7 Days)
  const revenueChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // X-axis labels
    datasets: [
      {
        label: 'Revenue',
        data: [1000, 1200, 1100, 900, 1500, 1300, 1400], // Y-axis values
        borderColor: '#007bff', // Line color (blue)
        backgroundColor: 'rgba(0, 123, 255, 0.2)', // Fill under line
        tension: 0.4, // Smooth line
      },
    ],
  };
  



  const businessHealthPercent = useMemo(() => {
    if (analytics?.costAnalysis?.length > 0) {
      const overallCOGS = analytics.costAnalysis.reduce((sum, item) => sum + (Number(item.totalCOGS) || 0), 0);
      const overallRevenue = analytics.costAnalysis.reduce((sum, item) => sum + (Number(item.totalRevenue) || 0), 0);
  
      if (overallRevenue === 0) return 0; 
  
      // If revenue is below 1,000,000, set health to 20%
      if (overallRevenue < 1_000_000) {
        return 20;
      }
  
      let health = ((overallRevenue - overallCOGS) / overallRevenue) * 100;
  
      return Math.min(health, 100); 
    }
    return 0;
  }, [analytics]);
  
  

  const [discounts, setDiscounts] = useState([]);
const [selectedProducts, setSelectedProducts] = useState([]);
const [emailTemplate, setEmailTemplate] = useState({
  subject: 'New Discount Alert!',
  body: 'Check out these amazing deals just for you!'
});

// Add these effects and functions
useEffect(() => {
  const loadDiscounts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/discounts');
      setDiscounts(data);
    } catch (err) {
      console.error('Error loading discounts:', err);
    }
  };
  loadDiscounts();
}, []);

const sendDiscountEmails = async () => {
  try {
    const { data } = await axios.post('http://localhost:5000/api/discounts/notify', {
      discounts: selectedProducts,
      emailTemplate
    });
    alert(`Emails sent to ${data.sentCount} customers!`);
    setShowDiscountModal(false);
  } catch (err) {
    console.error('Email send error:', err);
    alert('Failed to send emails');
  }
};

  if (loading)
    return (
      <div className="dashboard-container text-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <div className="dashboard-container">
        <Alert variant="danger" className="m-4">{error}</Alert>
      </div>
    );

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

      {/* Header */}
      <div className="analytics-header">
        <h2 className="mb-0 d-flex align-items-center gap-2">
          <GraphUp size={38} className="text-primary  " />
  <p className=' text-black' >
 Your  Daily  Analytics
  </p>
        </h2>
        <Form.Select 
          className="time-selector"
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Form.Select>
        <Button variant="success" onClick={exportToExcel}>
          <BiDownload className="me-2" /> Export to Excel
        </Button>
      </div>

      <Row className="g-4 mb-4 d-flex align-items-center">
  {/* Revenue */}
  <Col xl={4} md={6}>
    <Card className="glass-card p-3">
      <div className="d-flex align-items-center gap-3">
        <div className="icon-wrapper bg-primary">
          <CurrencyDollar size={24} color="white" />
        </div>
        <div>
          <h5 className="text-muted mb-1">Revenue Per Day</h5>
          <div className="metric-highlight">
            Ksh {analytics?.todaySales?.totalSales || 0}
          </div>
        </div>
      </div>
    </Card>
  </Col>

  {/* Transactions */}
  <Col xl={4} md={6}>
    <Card className="glass-card p-3">
      <div className="d-flex align-items-center gap-3">
        <div className="icon-wrapper bg-success">
          <CartCheck size={24} color="white" />
        </div>
        <div>
          <h5 className="text-muted mb-1">Transactions</h5>
          <div className="metric-highlight">
            {analytics?.todaySales?.transactions || 0}
          </div>
        </div>
      </div>
    </Card>
  </Col>

  {/* Customers */}
  {/* <Col xl={3} md={6}>
    <Card className="glass-card p-3">
      <div className="d-flex align-items-center gap-3">
        <div className="icon-wrapper bg-warning">
          <People size={24} color="white" />
        </div>
        <div>
          <h5 className="text-muted mb-1">Customers</h5>
          <div className="metric-highlight">
            {analytics?.todaySales?.totalCustomers || 0}
          </div>
        </div>
      </div>
    </Card>
  </Col> */}

  {/* Health */}
  <Col xl={4} md={6}>
    <Card className="glass-card p-3 d-flex align-items-center justify-content-center">
      <div className="d-flex align-items-center  flex-column gap-2">
        <p className="text-muted mb-1">Business Health</p>
        <div className="battery-container" style={{ display: 'flex', alignItems: 'center', border: '2px solid #333', padding: '4px', borderRadius: '4px', position: 'relative' }}>
          {[...Array(4)].map((_, index) => (
            <div 
              key={index} 
              className="battery-segment" 
              style={{ 
                width: '8px', 
                height: '16px', 
                marginRight: '2px',
                backgroundColor: businessHealthPercent > (index * 25) ? (businessHealthPercent < 30 ? 'red' : businessHealthPercent < 70 ? 'blue' : 'green') : '#ccc'
              }}
            />
          ))}
          <div style={{ width: '3px', height: '10px', backgroundColor: '#333', position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', borderRadius: '2px' }}></div>
        </div>
        <div className="metric-highlight">
          {businessHealthPercent.toFixed(0)}%
        </div>
      </div>
    </Card>
  </Col>
</Row>


      {/* Peak Hour Fuel Gauge */}
      <Row className="g-4 mb-4">
        <Col xl={4} lg={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Clock size={24} />
              <h4 className="text-primary mb-0">Peak Hour Performance</h4>
            </div>
            <div className="position-relative" style={{ height: '200px' }}>
              <Doughnut
                data={peakHourGaugeData}
                options={{
                  cutout: '80%',
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                  }
                }}
              />
              <div className="position-absolute top-50 start-50 translate-middle text-center">
                <div className="h3 mb-0">{analytics?.peakHour?.hour || '--'}:00</div>
                <small className="text-muted">Peak Hour</small>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Badge bg="success" className="me-2">
                Transactions: {analytics?.peakHour?.transactions || 0}
              </Badge>
              <Badge bg="warning" text="dark">
                Revenue: Ksh {Number(analytics?.peakHour?.revenue || 0).toLocaleString()}
              </Badge>
            </div>
          </Card>
        </Col>

        {/* Customer Growth Chart */}
        <Col xl={8}>
      <Card className="glass-card p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <People size={24} />
          <h4 className="text-primary mb-0">Customer Growth (Weekly)</h4>
        </div>
        <Bar
          data={customerGrowthData}
          options={options}
        />
      </Card>
    </Col>
      </Row>

      {/* Loyal Customers with Pagination */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Star size={24} />
          <h4 className="text-primary mb-0">Loyal Customers</h4>
        </div>
        {analytics?.repeatCustomers?.length > 0 ? (
          <>
            <div className="table-responsive">
              <Table hover className="table-hover-modern mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Visits</th>
                    <th>Total Spent</th>
                    <th>Products Bought</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((cust, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="me-2">📧</span>
                        {cust.customer_email}
                      </td>
                      <td>
                        <Badge bg="primary">{cust.transactionCount}</Badge>
                      </td>
                      <td className="text-success">
                        Ksh {Number(cust.lifetimeValue).toLocaleString()}
                      </td>
                      <td>
                        <Badge bg="warning" text="dark">
                          {cust.totalProducts || 0}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                {[...Array(Math.ceil(analytics.repeatCustomers.length / customersPerPage)).keys()].map(number => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => setCurrentPage(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted">
            <People size={32} className="mb-2" />
            <p>No repeat customers</p>
          </div>
        )}
      </Card>

      {/* Product Sales Trends & Manage Discounts */}
      <Row className="g-4 mb-4">
        <Col xl={8}>
          <Card className="glass-card sales-chart-container p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-gradient-primary">
                <GraphUp size={24} className="me-2" />
                Product Sales Trends
              </h4>
              <Button variant="primary" onClick={() => setShowDiscountModal(true)}>
                <Tag className="me-2" /> Manage Discounts
              </Button>
            </div>
            <Line
              data={productSalesData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
                interaction: { mode: 'nearest', axis: 'x' },
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
              }}
            />
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="glass-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Top Products</h5>
              <small className="text-muted">Weekly Performance</small>
            </div>
            <Carousel className="compact-carousel" indicators={false}>
              {(analytics?.topProducts || []).map(product => (
                <Carousel.Item key={product.id}>
                  <div className="position-relative">
                    <img
                      src={
                        product.image 
                          ? `http://localhost:5000/uploads/${encodeURIComponent(product.image)}`
                          : '/default-product.png'
                      }
                      className="carousel-image"
                      alt={product.name}
                    />
                    {product.discount > 0 && (
                      <div className="discount-badge">
                        {product.discount}% OFF
                      </div>
                    )}
                    <div className="carousel-caption bg-dark bg-opacity-75 p-3">
                      <h6 className="mb-1 text-white">{product.name}</h6>
                      <div className="d-flex justify-content-between text-white">
                        <span> Revenue  <br /> Today </span>
                        <span  className='text-black fw-bold bg-white p-2' >KSH {Number(product.revenue || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Breakdown */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <CreditCard size={24} />
          <h4 className="text-primary mb-0">Payment Methods Breakdown (Today)</h4>
        </div>
        {analytics.paymentMethods?.length > 0 ? (
          <div className="table-responsive">
            <Table bordered hover className="table-hover-modern mb-0">
              <thead className="table-light">
                <tr>
                  <th>Method</th>
                  <th>Transactions</th>
                  <th>Total Revenue (Ksh)</th>
                </tr>
              </thead>
              <tbody>
                {analytics.paymentMethods.map((pm, index) => (
                  <tr key={index}>
                    <td>{pm.payment_method}</td>
                    <td>{pm.transactions}</td>
                    <td className="text-success">
                      Ksh {Number(pm.totalRevenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <CreditCard size={32} className="mb-2" />
            <p>No payment data available for today.</p>
          </div>
        )}
      </Card>

      {/* Repeat Customers Section */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <People size={24} />
          <h4 className="text-primary mb-0">Repeat Customers</h4>
        </div>
        {analytics.repeatCustomers?.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="table-hover-modern mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Visits</th>
                  <th>Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                {analytics.repeatCustomers.map((cust, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="d-inline-block me-2">📧</span>
                      {cust.customer_email}
                    </td>
                    <td>
                      <Badge bg="primary-subtle" text="primary">
                        {cust.transactionCount}
                      </Badge>
                    </td>
                    <td className="text-success">
                      Ksh {Number(cust.lifetimeValue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <People size={32} className="mb-2" />
            <p>No repeat customers</p>
          </div>
        )}
      </Card>

      {/* Cost Analysis by Category */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <ArrowRepeat size={24} />
          <h4 className="text-primary mb-0">Cost Analysis by Category (Today)</h4>
        </div>
        {analytics.costAnalysis?.length > 0 ? (
          <div className="table-responsive">
            <Table bordered hover className="table-hover-modern mb-0">
              <thead className="table-light">
                <tr>
                  <th>Category</th>
                  <th>Total COGS (Ksh)</th>
                  <th>Total Revenue (Ksh)</th>
                  <th>Profit Margin (%)</th>
                </tr>
              </thead>
              <tbody>
                {analytics.costAnalysis.map((cat, idx) => {
                  const profitMargin = cat.totalRevenue > 0 
                    ? ((cat.totalRevenue - cat.totalCOGS) / cat.totalRevenue * 100).toFixed(2)
                    : '0.00';
                  return (
                    <tr key={idx}>
                      <td>{cat.category}</td>
                      <td>{Number(cat.totalCOGS).toLocaleString()}</td>
                      <td>{Number(cat.totalRevenue).toLocaleString()}</td>
                      <td>{profitMargin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <ArrowRepeat size={32} className="mb-2" />
            <p>No cost analysis data available.</p>
          </div>
        )}
      </Card>

      {/* Product Movement Section */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <BoxSeam size={24} />
          <h4 className="text-primary mb-0">Product Movement</h4>
        </div>
        {analytics.productMovement?.length > 0 ? (
          <div className="table-responsive">
            <Table bordered hover className="table-hover-modern mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.productMovement.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.name}</td>
                    <td>{prod.stock}</td>
                    <td>{prod.movement_status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <BoxSeam size={32} className="mb-2" />
            <p>No inventory data</p>
          </div>
        )}
      </Card>

      {/* Revenue Trends Chart */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <GraphUp size={24} />
          <h4 className="text-primary mb-0">Revenue Trends (Past 7 Days)</h4>
        </div>
        <div className="chart-container" style={{ height: '300px' }}>
          <Line 
            data={revenueChartData} 
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f3f5' } } }
            }} 
          />
        </div>
      </Card>

      {/* Discount Management Modal */}
      <Modal show={showDiscountModal} onHide={() => setShowDiscountModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>📢 Manage Discount Campaigns</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="row g-3">
      <div className="col-md-8">
        <h5>Select Products for Discount</h5>
        <div className="product-grid">
          {analytics.topProducts.map(product => (
            <Card 
              key={product.id}
              className={`product-card ${selectedProducts.some(p => p.id === product.id) ? 'selected' : ''}`}
              onClick={() => {
                const exists = selectedProducts.some(p => p.id === product.id);
                setSelectedProducts(prev => 
                  exists 
                    ? prev.filter(p => p.id !== product.id) 
                    : [...prev, product]
                );
              }}
            >
              <Card.Img 
                variant="top" 
                src={`http://localhost:5000/uploads/${product.image}`} 
                className="product-image"
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                  Current Price: Ksh {product.price}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="col-md-4">
        <h5>Email Template</h5>
        <Form.Group className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control 
            type="text" 
            value={emailTemplate.subject}
            onChange={(e) => setEmailTemplate({...emailTemplate, subject: e.target.value})}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email Body</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={5}
            value={emailTemplate.body}
            onChange={(e) => setEmailTemplate({...emailTemplate, body: e.target.value})}
          />
        </Form.Group>
        
        <Button 
          variant="success" 
          onClick={sendDiscountEmails}
          disabled={selectedProducts.length === 0}
        >
          <Send className="me-2" /> Send to {analytics.repeatCustomers.length} Customers
        </Button>
      </div>
    </div>
  </Modal.Body>
</Modal>

    </div>
  );
};

export default AnalyticsDashboard;
