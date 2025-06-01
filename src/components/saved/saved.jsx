import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spinner, Carousel, Badge, Button, Dropdown } from 'react-bootstrap';
import { 
  HeartFill, 
  GeoAlt, 
  StarFill, 
  ShareFill,
  Clock,
  PersonCircle
} from 'react-bootstrap-icons';


import { getUserIdFromToken } from '../../handler/tokenDecorder';
import { jwtDecode } from "jwt-decode"; // ✅ fixed

const SavedFoods = ({ user }) => {
  const BASE_URL = "http://localhost:8000/apiV1/smartcity-ke";
  const [savedFoods, setSavedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [userId, setUserId] = useState(null);
  
  // Get user ID from token
  useEffect(() => {
    const getUserIdFromToken = () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const decoded = jwtDecode(token);
        return decoded?.id || decoded?.userId || decoded?._id || null;
      } catch (error) {
        console.error("Invalid token:", error);
        return null;
      }
    };

    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

  // Fetch saved foods
  useEffect(() => {
    const fetchSavedFoods = async () => {
      try {
        setLoading(true);
        
        if (!userId) {
          throw new Error('User ID not available');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await fetch(`${BASE_URL}/user/smart_ke_WT_536237943/saved-foods`);
        if (!response.ok) {
          throw new Error('Failed to fetch saved foods');
        }

        const data = await response.json();
        const enhancedData = data.map(food => ({
          ...food,
          likes: Math.floor(Math.random() * 1000) + 50,
          shares: Math.floor(Math.random() * 200) + 10,
          postedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          chefName: food.chef?.username ? `Chef ${food.chef.username}` : `Chef ${String(food.chefId || 'Unknown').substring(0, 6)}`,
          isHot: Math.random() > 0.7,
          isMostLiked: Math.random() > 0.9,
        }));

        setSavedFoods(enhancedData);
      } catch (err) {
        console.error('Error fetching saved foods:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSavedFoods();
    }
  }, [userId]);

  const handleRemoveSaved = (foodId) => {
    setSavedFoods(prev => prev.filter(food => food.id !== foodId));
  };

  const filteredFoods = activeFilter === 'all' 
    ? savedFoods 
    : savedFoods.filter(food => food.cuisineType === activeFilter);

  const cuisineTypes = [...new Set(savedFoods.map(food => food.cuisineType))];

  // Calculate days ago
  const getDaysAgo = (date) => {
    const diffDays = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Enhanced share functionality with dynamic messages
  const shareFood = (platform, food) => {
    const dishTypes = {
      'ugali': 'delicious Ugali',
      'nyama choma': 'juicy Nyama Choma',
      'chapati': 'flaky Chapati',
      'githeri': 'hearty Githeri',
      'mandazi': 'sweet Mandazi'
    };
    
    const locations = {
      'nairobi': 'Nairobi',
      'westlands': 'Westlands',
      'kisumu': 'Kisumu',
      'mombasa': 'Mombasa',
      'nakuru': 'Nakuru'
    };
    
    const dishType = dishTypes[food.cuisineType?.toLowerCase()] || 'amazing dish';
    const chefLocation = locations[food.location?.toLowerCase()] || 'your city';
    
    const hashtags = ['#JikoniExpress', '#TasteKenya', '#EatLocal', '#KenyanFood'];
    
    const message = `Just discovered this ${dishType} by ${food.chefName} in ${chefLocation} on Jikoni Express! 🍲🔥\n\n"${food.title}" - ${food.description?.substring(0, 100)}...\n\n${hashtags.join(' ')}`;
    
    const url = `${window.location.origin}/food/${food.id}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n\nCheck it out: ${url}`)}`, '_blank');
        break;
      case 'instagram':
        alert(`Share this food to Instagram:\n${message}\n${url}`);
        // In a real app, you would use the Instagram sharing API
        break;
      case 'copy':
        navigator.clipboard.writeText(`${message}\n\n${url}`);
        alert('Link copied to clipboard!');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: `${food.title} - Jikoni Express`,
            text: message,
            url: url,
          });
        } else {
          navigator.clipboard.writeText(`${message}\n\n${url}`);
          alert('Link copied to clipboard!');
        }
    }
  };

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
      {/* Catchy Platform Advertisement */}
      <div className="text-center mb-4 p-4 rounded" style={{ 
        background: 'linear-gradient(135deg, #FF4532, #FF6B45)',
        color: 'white',
        boxShadow: '0 8px 24px rgba(255, 69, 50, 0.3)'
      }}>
        <h2 className="fw-bold display-5 mb-3">
          <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Discover Kenya's Hidden Culinary Gems!</span>
        </h2>
        <p className="lead mb-0" style={{ maxWidth: '700px', margin: '0 auto' }}>
          Jikoni Express connects you with authentic Kenyan chefs creating mouthwatering dishes in your neighborhood. 
          Save your favorites, share with friends, and taste the real Kenya!
        </p>
      </div>

      <div className="text-center mb-5">
        <h1 className="fw-bold mb-3" style={{ 
          color: '#FF4532',
          position: 'relative',
          display: 'inline-block'
        }}>
          <HeartFill className="me-2" style={{ 
            color: '#FF4532', 
            filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.2))' 
          }} />
          Your Favorites - Share with Friends!
          <div className="position-absolute bottom-0 start-50 translate-middle-x" 
            style={{
              width: '80px',
              height: '4px',
              background: '#2ECC71',
              borderRadius: '2px'
            }}
          ></div>
        </h1>
        <p className="text-muted">Your personal collection of delicious Kenyan favorites</p>
      </div>
      
      {savedFoods.length > 0 && (
        <div className="mb-4 d-flex flex-wrap justify-content-center gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'primary' : 'outline-primary'} 
            onClick={() => setActiveFilter('all')}
            className="rounded-pill px-3"
            style={{ 
              backgroundColor: activeFilter === 'all' ? '#FF4532' : 'transparent',
              borderColor: '#FF4532',
              color: activeFilter === 'all' ? 'white' : '#FF4532'
            }}
          >
            All
          </Button>
          {cuisineTypes.map(type => (
            <Button 
              key={type}
              variant={activeFilter === type ? 'primary' : 'outline-primary'} 
              onClick={() => setActiveFilter(type)}
              className="rounded-pill px-3"
              style={{ 
                backgroundColor: activeFilter === type ? '#2ECC71' : 'transparent',
                borderColor: '#2ECC71',
                color: activeFilter === type ? 'white' : '#2ECC71'
              }}
            >
              {type}
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="text-center">
            <div className="spinner-grow" role="status" style={{ 
              width: '3rem', 
              height: '3rem',
              color: '#FF4532'
            }}>
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
                background: 'linear-gradient(135deg, #FFD3D3, #FF4532)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(255, 69, 50, 0.3)'
              }}>
                <HeartFill style={{ fontSize: '3rem', color: 'white' }} />
              </div>
            </div>
          </div>
          <h4 className="mb-3" style={{ color: '#495057' }}>Your food collection is empty</h4>
          <p className="text-muted mb-4">Start exploring delicious Kenyan foods and save your favorites here!</p>
          <Link to="/food" className="btn btn-primary px-4 py-2 rounded-pill d-inline-flex align-items-center"
            style={{ backgroundColor: '#FF4532', border: 'none' }}>
            <StarFill className="me-2" />
            Discover Kenyan Foods
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
                    transformOrigin: 'center',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Trending Badges - Always visible */}
                  <div className="position-absolute top-3 start-3 z-2">
                    {food.isHot && (
                      <Badge pill style={{ 
                        backgroundColor: '#FF4532', 
                        color: 'white',
                        fontWeight: 500
                      }}>
                        🔥 Hot This Week
                      </Badge>
                    )}
                    {food.isMostLiked && (
                      <Badge pill style={{ 
                        backgroundColor: '#FFD166', 
                        color: '#495057',
                        fontWeight: 500
                      }}>
                        👑 Most Liked
                      </Badge>
                    )}
                  </div>
                  
                  {/* Action Buttons - Always visible */}
                  <div className="position-absolute top-3 end-3 z-2 d-flex gap-2">
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        backgroundColor: '#FF4532',
                        border: 'none'
                      }}
                      onClick={() => handleRemoveSaved(food.id)}
                    >
                      <HeartFill size={14} />
                    </Button>
                    
                    <Dropdown>
                      <Dropdown.Toggle 
                        variant="success" 
                        size="sm"
                        className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          backgroundColor: '#2ECC71',
                          border: 'none'
                        }}
                      >
                        <ShareFill size={14} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => shareFood('whatsapp', food)}>
                          <i className="bi bi-whatsapp me-2" style={{ color: '#25D366' }}></i>
                          WhatsApp
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => shareFood('instagram', food)}>
                          <i className="bi bi-instagram me-2" style={{ color: '#E1306C' }}></i>
                          Instagram
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => shareFood('copy', food)}>
                          <i className="bi bi-link-45deg me-2"></i>
                          Copy Link
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => shareFood('share', food)}>
                          <i className="bi bi-share me-2"></i>
                          Other Platforms
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
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
                      <Badge className="fs-6 fw-normal" style={{ 
                        backgroundColor: '#FF4532',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        KES {food.price}
                      </Badge>
                    </div>

                    {/* Chef Info with Navigation - Fixed visibility */}
                    <div className="d-flex align-items-center mb-1">
                      <PersonCircle className="me-2" style={{ color: '#6c757d' }} />
                      <Link 
                        to={`/chef/${food.chefId}`} 
                        className="text-decoration-none fw-medium"
                        style={{ color: '#FF4532' }}
                      >
                        {food.chefName}
                      </Link>
                    </div>

                    {/* Location and Time */}
                    <div className="d-flex justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <GeoAlt className="me-2" style={{ color: '#6c757d' }} />
                        <small className="text-muted">{food.location}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <Clock className="me-2" style={{ color: '#6c757d' }} />
                        <small className="text-muted">{getDaysAgo(food.postedDate)}</small>
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="d-flex justify-content-between align-items-center mb-3 py-2 px-3 rounded"
                      style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="d-flex align-items-center">
                        <HeartFill className="me-1" style={{ color: '#FF4532' }} />
                        <small className="fw-medium">
                          {food.likes} {food.likes > 1 ? 'likes' : 'like'}
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <ShareFill className="me-1" style={{ color: '#2ECC71' }} />
                        <small className="fw-medium">
                          {food.shares} {food.shares > 1 ? 'shares' : 'share'}
                        </small>
                      </div>
                    </div>

                    {/* Food Tags */}
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <Badge pill className="fw-normal" style={{ 
                        backgroundColor: '#FF4532',
                        color: 'white'
                      }}>
                        {food.cuisineType}
                      </Badge>
                      <Badge pill className="fw-normal" style={{ 
                        backgroundColor: '#2ECC71',
                        color: 'white'
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
                            background: 'linear-gradient(90deg, #FF4532, #FF6B45)',
                            border: 'none',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <StarFill className="me-2" />
                          View Chef Profile
                        </Link>
                        <Button variant="outline-primary" className="rounded-pill px-3 py-2"
                          style={{ 
                            color: '#2ECC71',
                            borderColor: '#2ECC71'
                          }}>
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
            <Button variant="outline-primary" className="rounded-pill px-4 py-2"
              style={{ 
                color: '#FF4532',
                borderColor: '#FF4532'
              }}>
              Load More
            </Button>
          </div>
        </>
      )}
      
      {/* Platform Promotion Footer */}
      <div className="text-center mt-5 pt-4 border-top">
        <h3 className="mb-3" style={{ color: '#FF4532' }}>Why Save with Jikoni Express?</h3>
        <Row className="g-4">
          <Col md={4}>
            <div className="p-3 bg-light rounded">
              <div className="mb-3">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#FF4532',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <i className="bi bi-share" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                </div>
              </div>
              <h5 className="mb-2">Share Kenyan Flavors</h5>
              <p className="mb-0">Spread the love for authentic Kenyan cuisine with friends and family</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded">
              <div className="mb-3">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#2ECC71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <i className="bi bi-heart" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                </div>
              </div>
              <h5 className="mb-2">Support Local Chefs</h5>
              <p className="mb-0">Your favorites help Kenyan chefs grow their culinary businesses</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded">
              <div className="mb-3">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#FFD166',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <i className="bi bi-lightning" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                </div>
              </div>
              <h5 className="mb-2">Quick Reordering</h5>
              <p className="mb-0">One-tap ordering for your favorite Kenyan dishes</p>
            </div>
          </Col>
        </Row>
      </div>

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
          border-radius: '50%';
          top: 50%;
          transform: translateY(-50%);
          margin: 0 10px;
        }
      `}</style>
    </div>
  );
};

export default SavedFoods;