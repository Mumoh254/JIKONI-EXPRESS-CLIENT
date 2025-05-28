import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spinner, Carousel, Badge, Button } from 'react-bootstrap';
import { HeartFill, GeoAlt, StarFill, CashCoin } from 'react-bootstrap-icons';

const SavedFoods = ({ user }) => {
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const [savedFoods, setSavedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedFoods = async () => {
      try {
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }

        const response = await fetch(`${BASE_URL}/user/${user.id}/saved-foods`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved foods');
        }

        const data = await response.json();
        setSavedFoods(data);
      } catch (error) {
        console.error('Error fetching saved foods:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedFoods();
  }, [user]);

  if (error) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-danger">Error loading saved foods</h4>
        <p>{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4 fw-bold" style={{ color: '#FF4532' }}>
        <HeartFill className="me-2" /> Your Saved Foods
      </h2>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Loading your saved foods...</p>
        </div>
      ) : savedFoods.length === 0 ? (
        <div className="text-center text-muted py-5">
          <h5>No saved foods yet</h5>
          <p>Like foods from chef profiles to see them here</p>
          <Link to="/food" className="btn btn-primary mt-3">
            Explore Foods
          </Link>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {savedFoods.map(food => (
            <Col key={food.id}>
              <Card className="h-100 shadow-sm border-0 overflow-hidden">
                <Carousel interval={null} indicators={food.photoUrls?.length > 1}>
                  {(food.photoUrls || []).map((img, i) => (
                    <Carousel.Item key={i}>
                      <div className="ratio ratio-4x3">
                        <img
                          src={img}
                          alt={`${food.title} - Photo ${i + 1}`}
                          className="card-img-top object-fit-cover"
                          style={{ filter: 'brightness(0.95)' }}
                          onError={(e) => {
                            e.target.src = '/placeholder-food.jpg';
                          }}
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>

                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0" style={{ color: '#2d3436' }}>
                      {food.title}
                    </h5>
                    <Badge pill className="fs-6" style={{ backgroundColor: '#FF4532' }}>
                      KES {food.price}
                    </Badge>
                  </div>

                  <div className="d-flex align-items-center mb-2">
                    <GeoAlt className="me-2 text-muted" />
                    <small className="text-muted">{food.location}</small>
                  </div>

                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <Badge pill className="bg-primary">
                      {food.cuisineType}
                    </Badge>
                    <Badge pill className="bg-success">
                      {food.dietary}
                    </Badge>
                  </div>

                  <div className="mt-auto">
                    <Link 
                      to={`/chef/${food.chefId}`}
                      className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    >
                      <StarFill className="me-2" />
                      View Chef Profile
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default SavedFoods;