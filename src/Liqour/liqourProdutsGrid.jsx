import React, { useRef, useState } from 'react';
import { 
  Row, Col, Card, Badge, Button, Carousel, 
  Modal, Form, OverlayTrigger, Tooltip, Container
} from 'react-bootstrap';
import { 
  Clock, StarFill, CartPlus, Heart, HeartFill, 
  Eye, InfoCircle, ShieldCheck, Plus, Dash, Fire
} from 'react-bootstrap-icons';

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
        "data:image/jpeg;base64,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",
        "https://images.unsplash.com/photo-1600271886742-f049cd5bba3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1601053952941-5e3b1b2f3b0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
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
        "https://images.unsplash.com/photo-1599594201378-9e51b1f6c0a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
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
        "https://images.unsplash.com/photo-1601053952941-5e3b1b2f3b0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
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
        "https://images.unsplash.com/photo-1601053952941-5e3b1b2f3b0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
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
          <div className="d-flex align-items-center mb-4">
            <Fire className="text-danger me-2" size={28} />
            <h3 className="fw-bold mb-0" style={{ color: theme.primary }}>Top Trending</h3>
          </div>


    <div className="trending-carousel-container py-4" style={{ position: 'relative' }}>
      <div className="d-flex align-items-center justify-content-between mb-4 px-4">
        <div className="d-flex align-items-center">
          <Fire className="text-danger me-2" size={28} />
          <h3 className="fw-bold mb-0" style={{ color: theme.primary }}>Top Trending Spirits</h3>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
            onClick={scrollLeft}
          >
            &lt;
          </Button>
          <Button 
            variant="outline-primary" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
            onClick={scrollRight}
          >
            &gt;
          </Button>
        </div>
      </div>
      
      <div 
        ref={carouselRef}
        className="trending-carousel d-flex gap-4 px-4 pb-4"
        style={{ 
          overflowX: 'auto', 
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {trendingProducts.map(product => (
          <div 
            key={product.id} 
            className="trending-item flex-shrink-0"
            style={{ 
              width: '300px', 
              scrollSnapAlign: 'start',
              transition: 'transform 0.3s ease'
            }}
          >
            <Card className="h-100 border-0 overflow-hidden shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="position-relative d-flex align-items-center" style={{ height: '200px', backgroundColor: '#f0f2ff' }}>
                <div className="w-50 h-100 d-flex align-items-center justify-content-center">
                  <img
                    src={product.photoUrl}
                    alt={product.title}
                    className="img-fluid"
                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                  />
                </div>
                <div className="w-50 p-3">
                  <Badge pill bg="danger" className="mb-2">
                    Trending
                  </Badge>
                  <h5 className="fw-bold mb-1" style={{ color: theme.dark, fontSize: '1.1rem' }}>{product.title}</h5>
                  <div className="d-flex align-items-center mb-2">
                    <StarFill className="text-warning me-1" size={14} />
                    <span className="fw-medium">{product.rating}</span>
                  </div>
                  <p className="mb-2 text-muted small">{product.brand}</p>
                  <h4 className="fw-bold" style={{ color: theme.primary, fontSize: '1.4rem' }}>
                    KES {product.price.toLocaleString()}
                  </h4>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="mt-2"
                    onClick={() => handleViewDetail(product)}
                    style={{ width: '100%' }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .trending-carousel {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        .trending-carousel::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        .trending-item:hover {
          transform: translateY(-5px);
        }
        
        .trending-carousel-container::before,
        .trending-carousel-container::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          pointer-events: none;
          z-index: 10;
        }
        
        .trending-carousel-container::before {
          left: 0;
          background: linear-gradient(90deg, rgba(245,247,255,0.8) 0%, rgba(245,247,255,0) 100%);
        }
        
        .trending-carousel-container::after {
          right: 0;
          background: linear-gradient(270deg, rgba(245,247,255,0.8) 0%, rgba(245,247,255,0) 100%);
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
                <div className="position-relative" style={{ height: '250px', overflow: 'hidden' }}>
                  <Carousel 
                    interval={null} 
                    indicators={product.photoUrls?.length > 1}
                    controls={product.photoUrls?.length > 1}
                    nextIcon={<span className="carousel-control-next-icon bg-dark p-2 rounded-circle" />}
                    prevIcon={<span className="carousel-control-prev-icon bg-dark p-2 rounded-circle" />}
                  >
                    {product.photoUrls?.map((img, i) => (
                      <Carousel.Item key={i}>
                        <img
                          src={img}
                          alt={`${product.title} - Photo ${i+1}`}
                          className="w-100 h-100 object-fit-cover"
                          style={{ minHeight: '250px' }}
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
                    <Badge pill bg="danger" className="px-3 py-2 fw-bold">
                      {product.alcoholPercentage}% ABV
                    </Badge>
                  </div>
                  
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <Button 
                      variant="light" 
                      className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}
                      onClick={() => handleViewDetail(product)}
                    >
                      <InfoCircle size={20} />
                    </Button>
                  </div>
                </div>

                <Card.Body className="d-flex flex-column pt-3 pb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge pill style={{ 
                      background: 'rgba(139, 69, 19, 0.15)', 
                      color: theme.primary,
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
                      <span className="me-2 fw-medium" style={{ color: theme.dark }}>Quantity:</span>
                      <div className="d-flex align-items-center border rounded-pill px-2" style={{ backgroundColor: 'white' }}>
                        <Button 
                          variant="link" 
                          className="p-0"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={quantities[product.id] <= 1}
                        >
                          <Dash size={20} />
                        </Button>
                        <span className="mx-2 fw-bold" style={{ minWidth: '25px', textAlign: 'center' }}>
                          {quantities[product.id] || 1}
                        </span>
                        <Button 
                          variant="link" 
                          className="p-0"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          disabled={quantities[product.id] >= product.stock}
                        >
                          <Plus size={20} />
                        </Button>
                      </div>
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
                    <div className="me-3">
                      <span className="fw-medium me-2">Quantity:</span>
                      <div className="d-flex align-items-center border rounded-pill px-2" style={{ backgroundColor: 'white' }}>
                        <Button 
                          variant="link" 
                          className="p-0"
                          onClick={() => handleQuantityChange(selectedProduct.id, -1)}
                          disabled={quantities[selectedProduct.id] <= 1}
                        >
                          <Dash size={20} />
                        </Button>
                        <span className="mx-2 fw-bold" style={{ minWidth: '25px', textAlign: 'center' }}>
                          {quantities[selectedProduct.id] || 1}
                        </span>
                        <Button 
                          variant="link" 
                          className="p-0"
                          onClick={() => handleQuantityChange(selectedProduct.id, 1)}
                          disabled={quantities[selectedProduct.id] >= selectedProduct.stock}
                        >
                          <Plus size={20} />
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="primary" 
                      className="py-2 px-4 fw-bold"
                      style={{ 
                        borderRadius: '12px',
                        background: theme.primary,
                        border: 'none',
                        fontSize: '1.1rem'
                      }}
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setShowDetail(false);
                      }}
                    >
                      <CartPlus className="me-2" size={20} />
                      Add to Cart
                    </Button>
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