import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spinner, Carousel, Badge, Button, Dropdown, Modal, Form } from 'react-bootstrap';
import {
  HeartFill,
  GeoAlt,
  StarFill,
  ShareFill,
  Clock,
  PersonCircle,
  Search,
  Person,
  Chat
} from 'react-bootstrap-icons';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

// Reusable Share Modal Component
const ShareModal = ({ show, handleClose, food }) => {
  if (!food) return null;

  const dishTypes = {
    'ugali': 'delicious Ugali',
    'nyama choma': 'juicy Nyama Choma',
    'chapati': 'flaky Chapati',
    'githeri': 'hearty Githeri',
    'mandazi': 'sweet Mandazi',
  };
  const locations = {
    'nairobi': 'Nairobi',
    'westlands': 'Westlands',
    'kisumu': 'Kisumu',
    'mombasa': 'Mombasa',
    'nakuru': 'Nakuru',
  };

  const dishType = dishTypes[food.cuisineType?.toLowerCase()] || 'amazing dish';
  const chefLocation = locations[food.location?.toLowerCase()] || 'your city';

  const hashtags = ['#JikoniExpress', '#TasteKenya', '#EatLocal', '#KenyanFood'];

  const message = `Just discovered this ${dishType} by ${food.chefName} in ${chefLocation} on Jikoni Express! 🍲🔥\n\n"${food.title}" - ${food.description?.substring(0, 100)}...\n\n${hashtags.join(' ')}`;
  const url = `${window.location.origin}/food/${food.id}`;
  const imageUrl = food.photoUrls?.[0] || 'https://via.placeholder.com/400x300?text=Food+Image'; // Fallback image

  const shareToPlatform = (platform) => {
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n\nCheck it out: ${url}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags.map(h => h.substring(1)).join(','))}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(food.title)}&summary=${encodeURIComponent(message)}&source=${encodeURIComponent(window.location.origin)}`, '_blank');
        break;
      case 'instagram':
        // Instagram sharing via web is limited. Usually requires a mobile app or direct posting.
        // For web, we can only suggest copying the link.
        navigator.clipboard.writeText(`${message}\n\n${url}\n\n(For Instagram, please paste this into your story or post caption)`);
        alert('Content copied to clipboard for Instagram! Please paste it into your story or post caption.');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Check out this food on Jikoni Express: ${food.title}`)}&body=${encodeURIComponent(`${message}\n\nFind more here: ${url}`)}`, '_blank');
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
            files: imageUrl ? [new File([new Blob()], 'image.png', { type: 'image/png' })] : [] // Placeholder for actual image sharing
          }).then(() => console.log('Successful share'))
            .catch((error) => {
              console.error('Error sharing', error);
              // Fallback to copy if Web Share API fails
              navigator.clipboard.writeText(`${message}\n\n${url}`);
              alert('Could not share directly. Link copied to clipboard!');
            });
        } else {
          navigator.clipboard.writeText(`${message}\n\n${url}`);
          alert('Link copied to clipboard!');
        }
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-center w-100 fw-bold" style={{ color: '#FF4532' }}>Share This Delicious Food!</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {food && (
          <div className="text-center mb-4">
            <img
              src={imageUrl}
              alt={food.title}
              className="img-fluid rounded shadow-sm mb-3"
              style={{ maxHeight: '250px', objectFit: 'cover', width: '100%', borderRadius: '12px' }}
            />
            <h4 className="fw-bold mb-1" style={{ color: '#333' }}>{food.title}</h4>
            <p className="text-muted mb-2">by {food.chefName} in {food.location}</p>
            <p className="lead" style={{ fontSize: '1rem', color: '#555' }}>
              "{food.description?.substring(0, 150)}{food.description?.length > 150 ? '...' : ''}"
            </p>
          </div>
        )}

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Button
            variant="light"
            className="d-flex flex-column align-items-center p-3 shadow-sm rounded-lg"
            onClick={() => shareToPlatform('whatsapp')}
            style={{ minWidth: '120px', fontSize: '0.9rem', color: '#333', border: '1px solid #e0e0e0' }}
          >
            <FaWhatsapp size={35} className="mb-2" style={{ color: '#25D366' }} />
            WhatsApp
          </Button>
          <Button
            variant="light"
            className="d-flex flex-column align-items-center p-3 shadow-sm rounded-lg"
            onClick={() => shareToPlatform('instagram')}
            style={{ minWidth: '120px', fontSize: '0.9rem', color: '#333', border: '1px solid #e0e0e0' }}
          >
            <FaInstagram size={35} className="mb-2" style={{ color: '#E1306C' }} />
            Instagram
          </Button>
          <Button
            variant="light"
            className="d-flex flex-column align-items-center p-3 shadow-sm rounded-lg"
            onClick={() => shareToPlatform('facebook')}
            style={{ minWidth: '120px', fontSize: '0.9rem', color: '#333', border: '1px solid #e0e0e0' }}
          >
            <FaFacebook size={35} className="mb-2" style={{ color: '#1877F2' }} />
            Facebook
          </Button>
          <Button
            variant="light"
            className="d-flex flex-column align-items-center p-3 shadow-sm rounded-lg"
            onClick={() => shareToPlatform('twitter')}
            style={{ minWidth: '120px', fontSize: '0.9rem', color: '#333', border: '1px solid #e0e0e0' }}
          >
            <FaTwitter size={35} className="mb-2" style={{ color: '#1DA1F2' }} />
            Twitter
          </Button>
          <Button
            variant="light"
            className="d-flex flex-column align-items-center p-3 shadow-sm rounded-lg"
            onClick={() => shareToPlatform('linkedin')}
            style={{ minWidth: '120px', fontSize: '0.9rem', color: '#333', border: '1px solid #e0e0e0' }}
          >
            <FaLinkedin size={35} className="mb-2" style={{ color: '#0A66C2' }} />
            LinkedIn
          </Button>
          <Button
            variant="light"
            className="d-flex flex-column align-items-center p-3 shadow-sm rounded-lg"
            onClick={() => shareToPlatform('email')}
            style={{ minWidth: '120px', fontSize: '0.9rem', color: '#333', border: '1px solid #e0e0e0' }}
          >
            <FaEnvelope size={35} className="mb-2" style={{ color: '#D44638' }} />
            Email
          </Button>
          <Button
            variant="light"
            className="d-flex flex-column align-items-center p-3 shadow-sm rounded-lg"
            onClick={() => shareToPlatform('copy')}
            style={{ minWidth: '120px', fontSize: '0.9rem', color: '#333', border: '1px solid #e0e0e0' }}
          >
            <i className="bi bi-link-45deg mb-2" style={{ fontSize: '35px', color: '#6c757d' }}></i>
            Copy Link
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 justify-content-center">
        <Button variant="secondary" onClick={handleClose} className="px-4 py-2">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


const SavedFoods = ({ user }) => {
  const BASE_URL = "https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke";
  const [savedFoods, setSavedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [userId, setUserId] = useState(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // New state for share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFoodForShare, setSelectedFoodForShare] = useState(null);


  // Fetch saved foods from API
  useEffect(() => {
    const fetchSavedFoods = async () => {
      setLoading(true);
      setError(null);
      try {

        // Fetch saved foods for the user
        const response = await fetch(`https://neuro-apps-api-express-js-production-redy.onrender.com/apiV1/smartcity-ke/user/smart_ke_WT_536237943/saved-foods`);
        console.log('liked', response)
        if (!response.ok) throw new Error('Failed to fetch saved foods');

        const data = await response.json();

        // Enhance data with additional properties for UI
        const enhancedData = data.map(food => ({
          ...food,
          likes: Math.floor(Math.random() * 1000) + 50,
          shares: Math.floor(Math.random() * 200) + 10,
          postedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          chefName: food.chef?.username
            ? `Chef ${food.chef.username}`
            : `Chef ${String(food.chefId || 'Unknown').substring(0, 6)}`,
          isHot: Math.random() > 0.7,
          isMostLiked: Math.random() > 0.9,
        }));

        setSavedFoods(enhancedData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedFoods();
  }, [userId]);

  const handleRemoveSaved = (foodId) => {
    setSavedFoods(prev => prev.filter(food => food.id !== foodId));
  };

  const filteredFoods = activeFilter === 'all'
    ? savedFoods
    : savedFoods.filter(food => food.cuisineType === activeFilter);

  const cuisineTypes = [...new Set(savedFoods.map(food => food.cuisineType).filter(Boolean))];

  // Calculate days ago helper
  const getDaysAgo = (date) => {
    const diffDays = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Open share modal
  const openShareModal = (food) => {
    setSelectedFoodForShare(food);
    setShowShareModal(true);
  };

  // Close share modal
  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedFoodForShare(null);
  };


  // Open suggest modal
  const openSuggestModal = (food) => {
    setSelectedFood(food);
    setShowSuggestModal(true);
  };

  // Mock search users
  const searchUsers = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const mockUsers = [
      { id: 1, name: 'John Kamau' },
      { id: 2, name: 'Mary Wambui' },
      { id: 3, name: 'Peter Otieno' },
      { id: 4, name: 'Sarah Akinyi' },
      { id: 5, name: 'David Mwangi' },
    ];
    const results = mockUsers.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleSuggest = (userId) => {
    alert(`Suggested "${selectedFood.title}" to user ID ${userId}!`);
    setShowSuggestModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /> Loading saved foods...</div>;
  if (error) return <div className="text-danger text-center my-5">Error: {error}</div>;

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
    <div className="container py-4">
      {/* Platform Header */}
      <div className="text-center mb-4">
        <h1 className="fw-bold mb-1" style={{
          color: '#FF4532',
          fontSize: '2.2rem'
        }}>
          <HeartFill className="me-2" style={{
            color: '#FF4532',
            fontSize: '1.8rem'
          }} />
          Your Food Favorites
        </h1>
        <p className="mb-0" style={{ fontSize: '1.1rem' }}>
          Discover, save, and share Kenya's best homemade meals
        </p>
      </div>

      {/* Filter Buttons */}
      {savedFoods.length > 0 && (
        <div className="mb-4 d-flex flex-wrap justify-content-center gap-2">
          <Button
            variant={activeFilter === 'all' ? 'primary' : 'outline-secondary'}
            onClick={() => setActiveFilter('all')}
            className="px-3"
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
              variant={activeFilter === type ? 'primary' : 'outline-secondary'}
              onClick={() => setActiveFilter(type)}
              className="px-3"
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
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 fw-medium">Loading your delicious favorites...</p>
          </div>
        </div>
      ) : savedFoods.length === 0 ? (
        <div className="text-center py-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="mb-4">
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#FF4532',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <HeartFill style={{ fontSize: '2.5rem', color: 'white' }} />
            </div>
          </div>
          <h4 className="mb-3">Your food collection is empty</h4>
          <p className="mb-4">Start exploring delicious Kenyan foods and save your favorites!</p>
          <Link to="/food" className="btn px-4 py-2 d-inline-flex align-items-center"
            style={{ backgroundColor: '#FF4532', color: 'white' }}>
            <StarFill className="me-2" />
            Discover Foods
          </Link>
        </div>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredFoods.map(food => (
              <Col key={food.id}>
                <Card className="h-100 shadow-sm border-0 overflow-hidden"
                  style={{ borderRadius: '12px', border: '1px solid #eee' }}>

                  {/* Trending Badges */}
                  <div className="position-absolute top-3 start-3 z-2">
                    {food.isHot && (
                      <Badge pill className="me-1" style={{
                        backgroundColor: '#FF4532',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.85rem'
                      }}>
                        🔥 Hot This Week
                      </Badge>
                    )}
                    {food.isMostLiked && (
                      <Badge pill className="me-1" style={{
                        backgroundColor: '#FFD166',
                        color: '#495057',
                        fontWeight: 500,
                        fontSize: '0.85rem'
                      }}>
                        👑 Most Liked
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="position-absolute top-3 end-3 z-2 d-flex gap-2">
                    <Button
                      variant="danger"
                      className="d-flex align-items-center justify-content-center p-2"
                      style={{
                        backgroundColor: '#FF4532',
                        border: 'none'
                      }}
                      onClick={() => handleRemoveSaved(food.id)}
                    >
                      <HeartFill size={18} />
                    </Button>

                    <Button
                      variant="success"
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: '#2ECC71',
                        border: 'none',
                        width: '40px', // Increased size
                        height: '40px', // Increased size
                        borderRadius: '50%', // Make it circular
                      }}
                      onClick={() => openShareModal(food)} // Open custom share modal
                    >
                      <ShareFill size={22} /> {/* Bigger icon */}
                    </Button>
                  </div>

                  {/* Food Images */}
                  <Carousel interval={null} indicators={food.photoUrls?.length > 1}>
                    {(food.photoUrls || []).map((img, i) => (
                      <Carousel.Item key={i}>
                        <div className="ratio ratio-4x3">
                          <img
                            src={img}
                            alt={`${food.title} - Photo ${i + 1}`}
                            className="card-img-top object-fit-cover"
                            style={{
                              borderTopLeftRadius: '12px',
                              borderTopRightRadius: '12px'
                            }}
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
                      <h5 className="fw-bold mb-0">
                        {food.title}
                      </h5>
                      <Badge className="fs-6 fw-normal" style={{
                        backgroundColor: '#FF4532',
                        padding: '0.4em 0.7em'
                      }}>
                        KES {food.price}
                      </Badge>
                    </div>

                    {/* Chef Info */}
                    <div className="d-flex align-items-center mb-2">
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
                    <div className="d-flex justify-content-between mb-2 text-muted">
                      <div className="d-flex align-items-center">
                        <GeoAlt className="me-1" />
                        <small>{food.location}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <Clock className="me-1" />
                        <small>{getDaysAgo(food.postedDate)}</small>
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="d-flex justify-content-between align-items-center mb-3 py-2 px-3 rounded"
                      style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="d-flex align-items-center">
                        <HeartFill className="me-1" style={{ color: '#FF4532' }} />
                        <small className="fw-medium">
                          {food.likes} likes
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <ShareFill className="me-1" style={{ color: '#2ECC71' }} />
                        <small className="fw-medium">
                          {food.shares} shares
                        </small>
                      </div>
                    </div>

                    {/* Food Tags */}
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <Badge pill className="fw-normal" style={{
                        backgroundColor: '#FF4532',
                        color: 'white',
                        padding: '0.5em 0.8em'
                      }}>
                        {food.cuisineType}
                      </Badge>
                      <Badge pill className="fw-normal" style={{
                        backgroundColor: '#2ECC71',
                        color: 'white',
                        padding: '0.5em 0.8em'
                      }}>
                        {food.dietary}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto d-flex gap-2">
                      <Link
                        to={`/chef/${food.chefId}`}
                        className="btn d-flex align-items-center justify-content-center py-2 flex-grow-1"
                        style={{
                          backgroundColor: '#FF4532',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        <Person className="me-2" />
                        View Chef
                      </Link>
                      <Button className="py-2"
                        style={{
                          backgroundColor: '#2ECC71',
                          color: 'white',
                          border: 'none'
                        }}>
                        Order
                      </Button>
                      <Button
                        className="py-2"
                        style={{
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none'
                        }}
                        onClick={() => openSuggestModal(food)}
                      >
                        <Chat className="me-1" />
                        Suggest
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <Button variant="outline-secondary" className="px-4 py-2">
              Load More
            </Button>
          </div>
        </>
      )}

      {/* Suggest Modal */}
      <Modal show={showSuggestModal} onHide={() => setShowSuggestModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Suggest Food to a Friend</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFood && (
            <div className="mb-3">
              <p className="mb-1">Suggesting: <strong>{selectedFood.title}</strong></p>
              <p className="mb-2 text-muted">by {selectedFood.chefName}</p>
              <img
                src={selectedFood.photoUrls?.[0] || '/placeholder-food.jpg'}
                alt={selectedFood.title}
                className="img-fluid rounded"
                style={{ maxHeight: '150px' }}
              />
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Search users</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <Search />
              </span>
              <Form.Control
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </Form.Group>

          <div className="mt-3">
            <h6 className="mb-2">Search Results</h6>
            {searchResults.length > 0 ? (
              <div className="list-group">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <Person className="me-2" />
                      {user.name}
                    </div>
                    <Button
                      size="sm"
                      style={{ backgroundColor: '#FF4532', border: 'none' }}
                      onClick={() => handleSuggest(user.id)}
                    >
                      Suggest
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-3">
                {searchQuery ? 'No users found' : 'Start typing to search users'}
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuggestModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Share Modal */}
      <ShareModal
        show={showShareModal}
        handleClose={closeShareModal}
        food={selectedFoodForShare}
      />


      {/* Platform Promotion */}
      <div className="text-center mt-5 pt-4">
        <h3 className="mb-4" style={{ color: '#FF4532' }}>Why Use Jikoni Express?</h3>
        <Row className="g-4">
          <Col md={4}>
            <div className="p-3 border rounded h-100">
              <div className="mb-3">
                <div className="mx-auto" style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#FF4532',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShareFill style={{ fontSize: '1.5rem', color: 'white' }} />
                </div>
              </div>
              <h5 className="mb-2">Share Kenyan Flavors</h5>
              <p className="mb-0">Spread the love for authentic Kenyan cuisine with friends</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 border rounded h-100">
              <div className="mb-3">
                <div className="mx-auto" style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#2ECC71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Person style={{ fontSize: '1.5rem', color: 'white' }} />
                </div>
              </div>
              <h5 className="mb-2">Support Local Chefs</h5>
              <p className="mb-0">Help Kenyan chefs grow their culinary businesses</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 border rounded h-100">
              <div className="mb-3">
                <div className="mx-auto" style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#3498db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Chat style={{ fontSize: '1.5rem', color: 'white' }} />
                </div>
              </div>
              <h5 className="mb-2">Suggest to Friends</h5>
              <p className="mb-0">Share your favorite meals with friends and family</p>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SavedFoods;