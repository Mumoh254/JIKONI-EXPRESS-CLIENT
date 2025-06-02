import React, { useRef, useState } from 'react';
import { 
  Row, Col, Card, Badge, Button, Carousel, 
  Modal, Form, OverlayTrigger, Tooltip, Container
} from 'react-bootstrap';
import { 
  Clock, StarFill, CartPlus, Heart, HeartFill, 
  Eye, InfoCircle, ShieldCheck, Plus, Dash, Fire
} from 'react-bootstrap-icons';


import   PremiumTrendingCarousel   from '../Liqour/premium'
const LiquorProductsGrid = () => {

   const carouselRef = useRef(null);
  const theme = {
    primary: '#1a237e',
    secondary: '#ff6f00',
    light: '#f5f7ff',
    dark: '#121212'
  };
  
  // Mock liquor products data
  const [products, setProducts] = useState([
    {
      id: 1,
      title: "Glenfiddich 18 Year Old",
      brand: "Glenfiddich",
      category: "Single Malt Scotch",
      price: 8500,
      alcoholPercentage: 40,
      volume: 750,
      description: "Aged for 18 years in Oloroso sherry and bourbon casks. Rich oakiness with baked apple and robust oak.",
      rating: 4.8,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      photoUrls: [
        "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png",
       "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png"
      ],
      vendor: {
        id: 101,
        user: {
          Name: "Premium Spirits Kenya"
        },
        rating: 4.9,
        profilePicture: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
        openingHours: "Mon-Sat: 9am-10pm"
      },
      likes: 42,
      views: 128,
      stock: 15,
      trending: true
    },
    {
      id: 2,
      title: "Grey Goose Vodka",
      brand: "Grey Goose",
      category: "Premium Vodka",
      price: 4500,
      alcoholPercentage: 40,
      volume: 1000,
      description: "Crafted from the finest French ingredients. Exceptionally smooth with a hint of almond.",
      rating: 4.6,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      photoUrls: [
        "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png",
   "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png"
      ],
      vendor: {
        id: 102,
        user: {
          Name: "Luxury Liquor Distributors"
        },
        rating: 4.7,
        profilePicture: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
        openingHours: "Mon-Fri: 10am-9pm"
      },
      likes: 28,
      views: 95,
      stock: 8,
      trending: true
    },
    {
      id: 3,
      title: "Patrón Silver Tequila",
      brand: "Patrón",
      category: "Premium Tequila",
      price: 6800,
      alcoholPercentage: 40,
      volume: 750,
      description: "Handcrafted from 100% Weber Blue Agave. Smooth with hints of citrus and light pepper.",
      rating: 4.9,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      photoUrls: [
        "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png",
     "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png"
      ],
      vendor: {
        id: 103,
        user: {
          Name: "Agave Masters Ltd"
        },
        rating: 4.8,
        profilePicture: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
        openingHours: "24/7 Online"
      },
      likes: 35,
      views: 112,
      stock: 12
    },
    {
      id: 4,
      title: "Hendrick's Gin",
      brand: "Hendrick's",
      category: "Craft Gin",
      price: 5200,
      alcoholPercentage: 41.4,
      volume: 700,
      description: "Infused with rose and cucumber. Unusual, refreshing and perfectly balanced.",
      rating: 4.7,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      photoUrls: [
        "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png",
  "https://www.oaks.delivery/wp-content/uploads/image-49-300x300.png"
      ],
      vendor: {
        id: 104,
        user: {
          Name: "Botanical Spirits Co"
        },
        rating: 4.6,
        profilePicture: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
        openingHours: "Tue-Sun: 12pm-10pm"
      },
      likes: 31,
      views: 87,
      stock: 5
    },
    {
      id: 5,
      title: "Dom Pérignon Vintage 2010",
      brand: "Dom Pérignon",
      category: "Champagne",
      price: 24500,
      alcoholPercentage: 12.5,
      volume: 750,
      description: "A vintage champagne with complex aromas of white flowers, citrus and brioche.",
      rating: 4.9,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      photoUrls: [
        "https://www.oaks.delivery/wp-content/uploads/image-31-1-300x300.png",
        "https://www.oaks.delivery/wp-content/uploads/Copy-of-Copy-of-Social-Media-Product-Ad-800-x-800-px-2024-08-30T155845.500-300x300.png"
      ],
      vendor: {
        id: 105,
        user: {
          Name: "Vineyard Estates"
        },
        rating: 5.0,
        profilePicture: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
        openingHours: "Mon-Sat: 11am-8pm"
      },
      likes: 49,
      views: 145,
      stock: 3,
      trending: true
    },
    {
      id: 6,
      title: "Captain Morgan Spiced Gold",
      brand: "Captain Morgan",
      category: "Spiced Rum",
      price: 3200,
      alcoholPercentage: 35,
      volume: 1000,
      description: "Blend of Caribbean rums with secret spices and natural flavors. Smooth with vanilla and caramel notes.",
      rating: 4.3,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      photoUrls: [
        "https://www.oaks.delivery/wp-content/uploads/Copy-of-Copy-of-Social-Media-Product-Ad-800-x-800-px-2024-08-30T155845.500-300x300.png",
        "https://images.unsplash.com/photo-1601053952941-5e3b1b2f3b0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
      ],
      vendor: {
        id: 106,
        user: {
          Name: "Caribbean Spirits Kenya"
        },
        rating: 4.5,
        profilePicture: "https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80",
        openingHours: "Mon-Sun: 10am-11pm"
      },
      likes: 22,
      views: 76,
      stock: 18
    }
  ]);
  
  const trendingProducts = products.filter(p => p.trending);
  
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [liked, setLiked] = useState({});

  
  const formatDistanceToNow = (date) => {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days/7)} weeks ago`;
    return 'Over a month ago';
  };
  
  const isVendorOpen = (hours) => {
    return true; // Simplified for demo
  };
  
  const handleLike = (id) => {
    setLiked(prev => ({...prev, [id]: !prev[id]}));
  };
  
  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };
  
  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const newValue = Math.max(1, current + delta);
      return {...prev, [id]: newValue};
    });
  };
  
  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    alert(`Added ${quantity} ${quantity > 1 ? 'bottles' : 'bottle'} of ${product.title} to cart!`);
  };

  
 const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  const AgeVerificationBadge = () => (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="age-tooltip">
          <ShieldCheck className="me-1" /> Age verification required at delivery
        </Tooltip>
      }
    >
      <Badge pill bg="dark" className="position-absolute bottom-0 start-0 m-2 px-3 py-2 d-flex align-items-center">
        <ShieldCheck size={16} className="me-1" /> 18+
      </Badge>
    </OverlayTrigger>
  );

  return (
    <div className="liquor-products-grid py-5" style={{ backgroundColor: theme.light }}>
      <div className="container">


        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3" style={{ color: theme.primary }}>
            Premium Liquor Collection
          </h2>
          <p className="lead" style={{ maxWidth: '700px', margin: '0 auto', color: theme.dark }}>
            Discover our curated selection of premium spirits, carefully selected from the world's finest distilleries
          </p>
        </div>

        {/* Top Trending Section */}
   <div className="mb-5">
      <div className="trending-carousel-container py-4 position-relative">
        {/* Header with Fire Icon and Scroll Buttons */}
        <div className="d-flex align-items-center justify-content-between mb-4 px-4">
          <div className="d-flex align-items-center">
            <Fire className="text-warning me-2" size={28} style={{ filter: "drop-shadow(0 0 4px rgba(197, 164, 103, 0.6))" }} />
            <h3 className="fw-bold mb-0" style={{ color: theme.primary, letterSpacing: "1px", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              TOP TRENDING SPIRITS
            </h3>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-light" 
              className="rounded-circle p-2 d-flex align-items-center justify-content-center scroll-btn"
              style={{ width: '42px', height: '42px', border: `1px solid ${theme.primary}` }}
              onClick={scrollLeft}
            >
              &lt;
            </Button>
            <Button 
              variant="outline-light" 
              className="rounded-circle p-2 d-flex align-items-center justify-content-center scroll-btn"
              style={{ width: '42px', height: '42px', border: `1px solid ${theme.primary}` }}
              onClick={scrollRight}
            >
              &gt;
            </Button>
          </div>
        </div>

        {/* Carousel Scrollable List */}
        <div
          ref={carouselRef}
          className="trending-carousel d-flex gap-4 px-4 pb-4"
        >
          {products.map(product => (
            <div 
              key={product.id} 
              className="trending-item flex-shrink-0"
              style={{ 
                width: '300px',
                scrollSnapAlign: 'start',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              <Card className="h-100 overflow-hidden border-0" 
                style={{ 
                  borderRadius: '16px', 
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
            
              
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
              >
                <div className="position-relative d-flex align-items-center" 
                  style={{ 
                    height: '220px',
                
                  }}
                >
               <div className="w-50 h-100 d-flex align-items-center justify-content-center p-3">
  <div
    className="w-100 h-100 d-flex align-items-center justify-content-center rounded"
    style={{
      backdropFilter: "blur(5px)",
      border: "1px solid rgba(197, 164, 103, 0.1)",
      overflowX: "auto",
      gap: "0.5rem",
    }}
  >
{product.photoUrls?.[0] && (
  <img
    src={product.photoUrls[0]}
    alt={`${product.title} - 1`}
    className="img-fluid"
    style={{
      minHeight: "100%",
      objectFit: "cover",
    }}
      />
    )}
  </div>
</div>

                  <div className="w-50 p-3">
                    <Badge pill className="mb-2" 
                      style={{ 
                        background: "linear-gradient(135deg, #C5A467 0%, #8A6D3B 100%)", 
                        border: "none",
                        fontWeight: 500,
                        letterSpacing: "0.5px"
                      }}
                    >
                      TRENDING
                    </Badge>
                    <h5 className="fw-bold mb-1" style={{ color: theme.light, fontSize: '1.1rem' }}>{product.title}</h5>
                    <div className="d-flex align-items-center mb-2">
                      <StarFill className="text-warning me-1" size={14} />
                      <span className="fw-medium" style={{ color: "#ddd" }}>{product.rating}</span>
                    </div>
                    <p className="mb-2 small" style={{ color: "#aaa" }}>{product.brand}</p>
                    <h4 className="fw-bold mb-3" style={{ color: theme.primary, fontSize: '1.4rem', textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                      KES {product.price.toLocaleString()}
                    </h4>
                    <Button 
                      variant="outline-light" 
                      size="sm"
                      className="mt-1 view-details-btn"
                      onClick={() => handleViewDetail(product)}
                      style={{ 
                        width: '100%', 
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                        background: "transparent",
                        border: `1px solid ${theme.primary}`,
                        color: theme.primary,
                        transition: "all 0.3s ease"
                      }}
                    >
                      VIEW DETAILS
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* CSS Styling */}
        <style jsx>{`
          .trending-carousel {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 12px;
          }
          
          .trending-carousel::-webkit-scrollbar {
            display: none;
          }
          
          .trending-item {
            scroll-snap-align: start;
          }
          
          .trending-item:hover {
            transform: translateY(-8px);
            z-index: 5;
          }
          
          .trending-item:hover .card {
          
            border: 1px solid rgba(197, 164, 103, 0.4);
          }
          
          .trending-carousel-container::before,
          .trending-carousel-container::after {
            content: '';
            position: absolute;
            top: 70px;
            bottom: 25px;
            width: 100px;
            pointer-events: none;
            z-index: 10;
            transition: opacity 0.3s ease;
          }
          
          .trending-carousel-container::before {
            left: 0;
         
          }
          
          .trending-carousel-container::after {
            right: 0;
         
          }
          
          .scroll-btn {
            transition: all 0.3s ease;
          }
          
          .scroll-btn:hover {
            background: ${theme.primary} !important;
            color: #1a1a1a !important;
            transform: scale(1.05);
            border: 1px solid ${theme.primary} !important;
          }
          
          .view-details-btn:hover {
            background: ${theme.primary} !important;
            color: #1a1a1a !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(197, 164, 103, 0.3);
          }
          
          .badge {
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </div>






        </div>

        {/* All Products Grid */}
        <div className="mb-4">
          <h3 className="fw-bold mb-4" style={{ color: theme.primary }}>All Premium Spirits</h3>
          
          <Row className="g-4">
          {products.map(product => (
            <Col key={product.id} xs={12} md={6} lg={4} xl={4}>
              <Card className="h-100 border-0 overflow-hidden shadow-lg" 
                style={{ 
                  borderRadius: '16px',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  background: 'linear-gradient(to bottom, #ffffff, #f9f5f0)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div className="position-relative p-4" style={{ height: '500px', overflow: 'hidden' }}>
                <Carousel 
  interval={null} 
  indicators={product.photoUrls?.length > 1}
 controls={false} 
  nextIcon={<span className="carousel-control-next-icon bg-dark p-2 rounded-circle" />}
  prevIcon={<span className="carousel-control-prev-icon bg-dark p-2 rounded-circle" />}
>
  {product.photoUrls?.map((img, i) => (
    <Carousel.Item key={i}>
      <img
        src={img}
        alt={`${product.title} - Photo ${i+1}`}
        className="w-100 h-100 object-fit-cover"
        style={{ minHeight: '100%' }}
      />
    </Carousel.Item>
  ))}
</Carousel>

                  <div className="position-absolute top-0 end-0 m-3">
                    <Badge className="price-tag fw-bold px-3 py-2" 
                      style={{ 
                        backgroundColor: theme.primary,
                        fontSize: '1.1rem'
                      }}
                    >
                      KES {product.price.toLocaleString()}
                    </Badge>
                  </div>
                  
                  <AgeVerificationBadge />
                  
                  <div className="position-absolute top-0 start-0 m-3">
                    <Badge  bg="danger" className="px-3 py-2 fw-bold">
                      {product.alcoholPercentage}% ABV
                    </Badge>
                  </div>
                  
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <Button 
                      variant="light" 
                      className=" p-2 d-flex align-items-center justify-content-center"
                      style={{ width: '35px', height: '35px' }}
                      onClick={() => handleViewDetail(product)}
                    >
                      <InfoCircle size={20} />
                    </Button>
                  </div>
                </div>

                <Card.Body className="d-flex flex-column pt-3 pb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge  style={{ 
                      background: 'rgba(231, 102, 10, 0.15)', 
                      color: 'white',
                      fontSize: '0.9rem'
                    }}>
                      {product.category}
                    </Badge>
                    <div className="d-flex align-items-center">
                      <Clock className="me-1" style={{ color: theme.primary }} size={16} />
                      <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                        {formatDistanceToNow(product.createdAt)}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0 fw-bold" style={{ fontSize: '1.3rem', color: theme.dark }}>
                      {product.title}
                    </h5>
                    <div className="d-flex align-items-center">
                      <StarFill className="text-warning me-1" />
                      <span className="fw-bold" style={{ color: theme.dark }}>{product.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                    {product.brand} • {product.volume}ml
                  </p>
                  
                  <div className="vendor-profile bg-white p-3 rounded-3 mt-auto mb-3" style={{ 
                    border: '1px solid rgba(139, 69, 19, 0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="vendor-avatar"
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${theme.primary}`,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={'/images/liqour.png'}
                            alt={product.vendor?.user?.Name || 'Distributor'}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>

                        <div className="vendor-info">
                          <h6 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '130px', color: theme.dark }}>
                            {product.vendor?.user?.Name || 'Distributor'}
                          </h6>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <div className="d-flex align-items-center">
                              <StarFill className="text-warning" size={14} />
                              <small className="fw-medium ms-1" style={{ color: theme.dark }}>
                                {product.vendor?.rating || 'New'}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="engagement-metric">
                          <div className="d-flex align-items-center justify-content-center gap-1" style={{ color: product.liked ? '#d32f2f' : theme.dark }}>
                            <Button 
                              variant="link" 
                              className="p-0"
                              onClick={() => handleLike(product.id)}
                              style={{ color: 'inherit' }}
                            >
                              {product.liked ? <HeartFill size={20} /> : <Heart size={20} />}
                            </Button>
                            <span className="small fw-bold">{product.likes || 0}</span>
                          </div>
                        </div>
                        
                        <div className="engagement-metric">
                          <div className="d-flex align-items-center justify-content-center gap-1" style={{ color: theme.dark }}>
                            <Eye size={20} />
                            <span className="small fw-bold">{product.views || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={16} className="" style={{ color: theme.primary }} />
                        <small className="fw-medium" style={{ color: theme.dark }}>
                          {product.vendor?.openingHours || '5pm - 2am'}
                        </small>
                      </div>
                      <Badge
                        bg={isVendorOpen(product.vendor?.openingHours || '5pm - 2am') ? 'success' : 'secondary'}
                        className="p-2 fw-medium"
                      >
                        {isVendorOpen(product.vendor?.openingHours || '5pm - 2am') ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
  <Button 
    variant="outline-primary" 
    className=" px-4 py-1 fw-semibold"
    onClick={() => handleViewDetail(product)}
                      style={{ 
                        width: '100%', 
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                        background: "transparent",
                        border: `1px solid ${theme.primary}`,
                        color: theme.primary,
                        transition: "all 0.3s ease"
                      }}
  >
    View Details
  </Button>
</div>

                    
                    <div className="stock-info">
                      <small className={product.stock > 5 ? "text-success fw-bold" : "text-danger fw-bold"}>
                        {product.stock > 5 ? 'In Stock' : `Only ${product.stock} left`}
                      </small>
                    </div>
                  </div>

                   <div className="d-flex gap-3 mt-4 mb-4">
                      <Button 
                        className="flex-grow-1 py-2 fw-bold"
                        style={{ 
                          borderRadius: '12px', 
                          border: `2px solid ${theme.primary}`, 
                          color: theme.primary,
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => handlePreOrder(product)}
                      >
                        Pre-Order
                      </Button>

                      <Button 
                        variant="primary" 
                        className="flex-grow-1 py-2 fw-bold"
                        style={{ 
                          borderRadius: '12px',
                          background: theme.secondary,
                          border: 'none'
                        }}
                        onClick={() => updateCart(product, 1)}
                      >
                        <CartPlus className="me-2" size={20} />
                        Add to Cart
                      </Button>
                    </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        </div>
      </div>
      
      <style jsx global>{`
        .liquor-carousel .carousel-indicators {
          bottom: 5px;
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          justify-content: center;
        }
        
        .liquor-carousel .carousel-indicators button {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid #fff;
          background: rgba(255,255,255,0.3);
          margin: 0 4px;
          transition: all 0.3s ease;
        }
        
        .liquor-carousel .carousel-indicators .active {
          background: #fff;
          transform: scale(1.3);
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        }
        
        .liquor-carousel .carousel-control-prev,
        .liquor-carousel .carousel-control-next {
          display: none;
        }
        
        .liquor-products-grid .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
        }
        
        .liquor-products-grid .card:hover {
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        
        .price-tag {
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
          z-index: 10;
        }
      `}</style>
  
      
      {/* Product Detail Modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        {selectedProduct && (
          <>
            <Modal.Header closeButton className="border-0" style={{ backgroundColor: theme.light }}>
              <Modal.Title className="fw-bold" style={{ color: theme.primary }}>
                {selectedProduct.title}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <div className="position-relative" style={{ height: '400px', overflow: 'hidden', borderRadius: '12px', backgroundColor: '#f8f9ff' }}>
                    <Carousel 
                      interval={null} 
                      indicators={selectedProduct.photoUrls?.length > 1}
                      controls={selectedProduct.photoUrls?.length > 1}
                    >
                      {selectedProduct.photoUrls?.map((img, i) => (
                        <Carousel.Item key={i} className="h-100">
                          <div className="d-flex align-items-center justify-content-center h-100">
                            <img
                              src={img}
                              alt={`${selectedProduct.title} - Photo ${i+1}`}
                              className="img-fluid"
                              style={{ maxHeight: '380px', objectFit: 'contain' }}
                            />
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                    <AgeVerificationBadge />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="fw-bold mb-0" style={{ color: theme.dark, fontSize: '1.8rem' }}>
                      {selectedProduct.title}
                    </h3>
                    <div className="d-flex align-items-center">
                      <StarFill className="text-warning me-1" size={20} />
                      <span className="fw-bold fs-4">{selectedProduct.rating}</span>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-primary fw-bold mb-0" style={{ fontSize: '1.6rem' }}>
                      KES {selectedProduct.price.toLocaleString()}
                    </h4>
                    <div className="d-flex align-items-center">
                      <span className="me-2 fw-medium" style={{ color: theme.dark }}>{selectedProduct.volume}ml</span>
                      <Badge pill bg="danger" className="px-3 py-2 fw-bold">
                        {selectedProduct.alcoholPercentage}% ABV
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: theme.primary }}>Description</h5>
                    <p className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                      {selectedProduct.description}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3" style={{ color: theme.primary }}>Product Details</h5>
                    <Row>
                      <Col xs={6} className="mb-2">
                        <div className="fw-medium">Brand:</div>
                        <div className="fw-bold">{selectedProduct.brand}</div>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <div className="fw-medium">Category:</div>
                        <div className="fw-bold">{selectedProduct.category}</div>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <div className="fw-medium">Stock:</div>
                        <div className={selectedProduct.stock > 5 ? "text-success fw-bold" : "text-danger fw-bold"}>
                          {selectedProduct.stock} bottles available
                        </div>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <div className="fw-medium">Vendor:</div>
                        <div className="fw-bold">{selectedProduct.vendor?.user?.Name || 'Distributor'}</div>
                      </Col>
                    </Row>
                  </div>
                  
                  <div className="d-flex align-items-center mb-4">
                  
              
                   <div className="d-flex gap-3 mt-4 mb-4">
                      <Button 
                        className="flex-grow-1 py-2 fw-bold"
                        style={{ 
                          borderRadius: '12px', 
                          border: `2px solid ${theme.primary}`, 
                          color: theme.primary,
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => handlePreOrder(product)}
                      >
                        Pre-Order
                      </Button>

                      <Button 
                        variant="primary" 
                        className="flex-grow-1 py-2 fw-bold"
                        style={{ 
                          borderRadius: '12px',
                          background: theme.secondary,
                          border: 'none'
                        }}
                        onClick={() => updateCart(product, 1)}
                      >
                        <CartPlus className="me-2" size={20} />
                        Add to Cart
                      </Button>


                         <Button 
                        className="flex-grow-1 py-2 fw-bold"
                        style={{ 
                          borderRadius: '12px', 
                          border: `2px solid ${theme.primary}`, 
                          color: theme.primary,
                          backgroundColor: 'transparent'
                        }}
                        onClick={() => handlePreOrder(product)}
                      >
                         Close 
                      </Button>

                    </div>
                  </div>
                  
                  <div className="bg-light p-3 rounded" style={{ border: `1px solid ${theme.primary}20` }}>
                    <div className="d-flex align-items-center mb-2">
                      <ShieldCheck size={20} className="text-primary me-2" />
                      <span className="fw-bold">Age Verification Required</span>
                    </div>
                    <p className="mb-0 small">
                      By purchasing this product, you confirm that you are at least 18 years of age. 
                      Valid ID will be required at the time of delivery.
                    </p>
                  </div>
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>
    </div>
  );
};

export default LiquorProductsGrid;