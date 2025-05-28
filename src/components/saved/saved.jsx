import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spinner, Carousel, Badge, Button } from 'react-bootstrap';
import { HeartFill, GeoAlt, StarFill, CashCoin, Heart } from 'react-bootstrap-icons';

const SavedFoods = ({ user }) => {
  const BASE_URL = "http://localhost:8000/apiV1/smartcity-ke";
  const [savedFoods, setSavedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  useEffect(() => {
    const fetchSavedFoods = async () => {
      try {
        setLoading(true);
        // Simulate API delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await fetch(`${BASE_URL}/user/smart_ke_WT_536237943/saved-foods`);
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
  }, []);

  // Function to remove a saved food item
  const handleRemoveSaved = (foodId) => {
    setSavedFoods(prev => prev.filter(food => food.id !== foodId));
  };

  // Filter foods based on active filter
  const filteredFoods = activeFilter === 'all' 
    ? savedFoods 
    : savedFoods.filter(food => food.cuisineType === activeFilter);

  // Get unique cuisine types for filter buttons
  const cuisineTypes = [...new Set(savedFoods.map(food => food.cuisineType))];

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
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-3" style={{ 
          color: '#FF6B6B',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          position: 'relative',
          display: 'inline-block'
        }}>
          <HeartFill className="me-2" style={{ 
            color: '#FF6B6B', 
            filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' 
          }} />
          Your Saved Foods
          <div className="position-absolute bottom-0 start-50 translate-middle-x" 
            style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, #FF6B6B, #FFD166)',
              borderRadius: '2px'
            }}
          ></div>
        </h1>
        <p className="text-muted">Your personal collection of delicious favorites</p>
      </div>
      
      {savedFoods.length > 0 && (
        <div className="mb-4 d-flex flex-wrap justify-content-center gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'primary' : 'outline-primary'} 
            onClick={() => setActiveFilter('all')}
            className="rounded-pill px-3"
          >
            All
          </Button>
          {cuisineTypes.map(type => (
            <Button 
              key={type}
              variant={activeFilter === type ? 'primary' : 'outline-primary'} 
              onClick={() => setActiveFilter(type)}
              className="rounded-pill px-3"
            >
              {type}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="text-center">
            <div className="spinner-grow text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fw-medium" style={{ color: '#6c757d' }}>Loading your delicious favorites...</p>
          </div>
        </div>
      ) : savedFoods.length === 0 ? (
        <div className="text-center py-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="position-relative mb-4">
            <div className="d-flex justify-content-center">
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD3D3, #FF6B6B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(255,107,107,0.3)'
              }}>
                <HeartFill style={{ fontSize: '3rem', color: 'white' }} />
              </div>
            </div>
          </div>
          <h4 className="mb-3" style={{ color: '#495057' }}>Your food collection is empty</h4>
          <p className="text-muted mb-4">Start exploring delicious foods and save your favorites here!</p>
          <Link to="/food" className="btn btn-primary px-4 py-2 rounded-pill d-inline-flex align-items-center">
            <StarFill className="me-2" />
            Discover Foods
          </Link>
        </div>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredFoods.map(food => (
              <Col key={food.id}>
                <Card className="h-100 shadow-sm border-0 overflow-hidden position-relative"
                  style={{
                    borderRadius: '16px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    transformOrigin: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="position-absolute top-3 end-3 z-2">
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                      onClick={() => handleRemoveSaved(food.id)}
                    >
                      <HeartFill size={14} />
                    </Button>
                  </div>
                  
                  <Carousel interval={null} indicators={food.photoUrls?.length > 1}>
                    {(food.photoUrls || []).map((img, i) => (
                      <Carousel.Item key={i}>
                        <div className="ratio ratio-4x3">
                          <img
                            src={img}
                            alt={`${food.title} - Photo ${i + 1}`}
                            className="card-img-top object-fit-cover"
                            style={{ 
                              filter: 'brightness(0.95)',
                              borderTopLeftRadius: '16px',
                              borderTopRightRadius: '16px'
                            }}
                            onError={(e) => {
                              e.target.src = '/placeholder-food.jpg';
                            }}
                          />
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>

                  <Card.Body className="d-flex flex-column pb-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold mb-0" style={{ color: '#2d3436' }}>
                        {food.title}
                      </h5>
                      <Badge pill className="fs-6 fw-normal" style={{ 
                        backgroundColor: '#FF6B6B',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        KES {food.price}
                      </Badge>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <GeoAlt className="me-2" style={{ color: '#6c757d' }} />
                      <small className="text-muted">{food.location}</small>
                    </div>

                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <Badge pill className="fw-normal" style={{ 
                        backgroundColor: '#4ECDC4',
                        color: 'white'
                      }}>
                        {food.cuisineType}
                      </Badge>
                      <Badge pill className="fw-normal" style={{ 
                        backgroundColor: '#FFD166',
                        color: '#495057'
                      }}>
                        {food.dietary}
                      </Badge>
                      {food.isVegetarian && (
                        <Badge pill className="fw-normal" style={{ 
                          backgroundColor: '#06D6A0',
                          color: 'white'
                        }}>
                          Vegetarian
                        </Badge>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex gap-2">
                        <Link 
                          to={`/chef/${food.chefId}`}
                          className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center py-2 rounded-pill"
                          style={{
                            background: 'linear-gradient(90deg, #4ECDC4, #1A936F)',
                            border: 'none',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <StarFill className="me-2" />
                          View Chef
                        </Link>
                        <Button variant="outline-primary" className="rounded-pill px-3 py-2">
                          Order
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div className="text-center mt-5">
            <Button variant="outline-primary" className="rounded-pill px-4 py-2">
              Load More
            </Button>
          </div>
        </>
      )}
      
      <style jsx>{`
        .card:hover {
          box-shadow: 0 12px 20px rgba(0,0,0,0.15) !important;
        }
        .card-img-top {
          transition: transform 0.5s ease;
        }
        .card:hover .card-img-top {
          transform: scale(1.05);
        }
        .carousel-control-prev, .carousel-control-next {
          background: rgba(0,0,0,0.2);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          margin: 0 10px;
        }
      `}</style>
    </div>
  );
};

export default SavedFoods;