import React, { useRef } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { StarFill, Fire, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

const PremiumTrendingCarousel = () => {
  const theme = {
    primary: '#1a237e', // Deep navy blue
    secondary: '#c5a47e', // Gold accent
    dark: '#0d0d0d',    // Almost black
    light: '#f5f7ff'    // Light blue tint
  };
  
  const carouselRef = useRef(null);
  
  const trendingProducts = [
    {
      id: 1,
      title: "Glenfiddich 18 Year Old",
      brand: "Glenfiddich",
      category: "Single Malt Scotch",
      price: 8500,
      rating: 4.8,
      photoUrl: "https://images.unsplash.com/photo-1599594201378-9e51b1f6c0a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      title: "Grey Goose Vodka",
      brand: "Grey Goose",
      category: "Premium Vodka",
      price: 4500,
      rating: 4.6,
      photoUrl: "https://images.unsplash.com/photo-1581015177131-1c8bdf3b2a1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      title: "Patrón Silver Tequila",
      brand: "Patrón",
      category: "Premium Tequila",
      price: 6800,
      rating: 4.9,
      photoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      title: "Hendrick's Gin",
      brand: "Hendrick's",
      category: "Craft Gin",
      price: 5200,
      rating: 4.7,
      photoUrl: "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 5,
      title: "Dom Pérignon Vintage 2010",
      brand: "Dom Pérignon",
      category: "Champagne",
      price: 24500,
      rating: 4.9,
      photoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 6,
      title: "Captain Morgan Spiced Gold",
      brand: "Captain Morgan",
      category: "Spiced Rum",
      price: 3200,
      rating: 4.3,
      photoUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
    }
  ];
  
  const handleViewDetail = (product) => {
    alert(`Viewing details for ${product.title}`);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="premium-trending-carousel py-5" style={{ backgroundColor: theme.dark }}>
      <div className="container position-relative">
        {/* Header with Fire Icon and Title */}
        <div className="d-flex align-items-center justify-content-center mb-5">
          <div className="position-relative">
            <Fire className="text-danger" size={40} style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)' }} />
            <h2 className="fw-bold text-center mb-0" style={{ 
              color: theme.secondary, 
              fontSize: '2.5rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              position: 'relative',
              paddingTop: '20px'
            }}>
              <span className="d-block" style={{ fontSize: '1.2rem', color: '#fff', letterSpacing: '4px' }}>PREMIUM SELECTION</span>
              Top Trending Spirits
            </h2>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="position-absolute d-none d-md-flex" style={{ top: '50%', left: '-30px', transform: 'translateY(-50%)', zIndex: 10 }}>
          <Button 
            variant="outline-light" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '50px', height: '50px', borderWidth: '2px' }}
            onClick={scrollLeft}
          >
            <ChevronLeft size={24} />
          </Button>
        </div>
        
        <div className="position-absolute d-none d-md-flex" style={{ top: '50%', right: '-30px', transform: 'translateY(-50%)', zIndex: 10 }}>
          <Button 
            variant="outline-light" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '50px', height: '50px', borderWidth: '2px' }}
            onClick={scrollRight}
          >
            <ChevronRight size={24} />
          </Button>
        </div>

        {/* Carousel Scrollable List */}
        <div
          ref={carouselRef}
          className="premium-carousel d-flex gap-4 pb-4"
        >
          {trendingProducts.map(product => (
            <div 
              key={product.id} 
              className="premium-item flex-shrink-0 position-relative"
              style={{ 
                width: '300px',
                transition: 'transform 0.3s ease'
              }}
            >
              <Card className="h-100 border-0 overflow-hidden" 
                style={{ 
                  borderRadius: '16px',
                  background: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(197, 164, 126, 0.2)'
                }}
              >
                {/* Card Badge */}
                <div className="position-absolute top-4 right-4">
                  <Badge pill className="py-2 px-3 fw-bold" style={{ 
                    background: 'linear-gradient(135deg, #c5a47e 0%, #9c7c5c 100%)',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}>
                    Trending
                  </Badge>
                </div>
                
                {/* Product Image */}
                <div className="position-relative" style={{ height: '220px', overflow: 'hidden' }}>
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <img
                      src={product.photoUrl}
                      alt={product.title}
                      className="img-fluid"
                      style={{ 
                        maxHeight: '200px', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                      }}
                    />
                  </div>
                  
                  {/* Gold Decorative Line */}
                  <div className="position-absolute bottom-0 left-0 right-0" style={{ 
                    height: '4px', 
                    background: 'linear-gradient(90deg, transparent, #c5a47e, transparent)',
                    opacity: 0.7
                  }}></div>
                </div>

                {/* Product Info */}
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1" style={{ 
                        color: '#fff', 
                        fontSize: '1.3rem',
                        letterSpacing: '0.5px'
                      }}>
                        {product.title}
                      </h5>
                      <p className="mb-0 small" style={{ color: theme.secondary, opacity: 0.8 }}>{product.brand}</p>
                    </div>
                    
                    <div className="d-flex align-items-center bg-dark p-2 rounded" style={{ minWidth: '60px' }}>
                      <StarFill className="text-warning me-1" size={14} />
                      <span className="fw-bold" style={{ color: '#fff' }}>{product.rating}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span className="small text-light" style={{ opacity: 0.7 }}>Starting at</span>
                        <h4 className="fw-bold mb-0" style={{ color: theme.secondary, fontSize: '1.8rem' }}>
                          KES {product.price.toLocaleString()}
                        </h4>
                      </div>
                      
                      <div className="bg-dark p-2 rounded" style={{ minWidth: '80px' }}>
                        <span className="small text-light d-block" style={{ opacity: 0.7 }}>Category</span>
                        <span className="fw-bold" style={{ color: '#fff' }}>{product.category}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline-light" 
                      className="w-100 py-2 fw-bold"
                      onClick={() => handleViewDetail(product)}
                      style={{ 
                        borderWidth: '2px',
                        borderRadius: '8px',
                        letterSpacing: '1px',
                        fontSize: '1.1rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      VIEW DETAILS
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="d-flex d-md-none justify-content-center gap-3 mt-4">
        <Button 
          variant="outline-light" 
          className="rounded-circle p-2 d-flex align-items-center justify-content-center"
          style={{ width: '50px', height: '50px', borderWidth: '2px' }}
          onClick={scrollLeft}
        >
          <ChevronLeft size={24} />
        </Button>
        <Button 
          variant="outline-light" 
          className="rounded-circle p-2 d-flex align-items-center justify-content-center"
          style={{ width: '50px', height: '50px', borderWidth: '2px' }}
          onClick={scrollRight}
        >
          <ChevronRight size={24} />
        </Button>
      </div>

      {/* CSS Styling */}
      <style jsx>{`
        .premium-trending-carousel {
          position: relative;
          overflow: hidden;
          padding-bottom: 3rem;
        }
        
        .premium-carousel {
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scroll-padding: 0 1.5rem;
          padding: 0 1.5rem;
          scrollbar-width: none;
        }

        .premium-carousel::-webkit-scrollbar {
          display: none;
        }
        
        .premium-carousel > div {
          scroll-snap-align: start;
        }

        .premium-item:hover {
          transform: translateY(-10px);
        }
        
        .premium-carousel::before,
        .premium-carousel::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100px;
          pointer-events: none;
          z-index: 5;
        }
        
        .premium-carousel::before {
          left: 0;
          background: linear-gradient(90deg, rgba(13,13,13,0.8) 0%, rgba(13,13,13,0) 100%);
        }
        
        .premium-carousel::after {
          right: 0;
          background: linear-gradient(270deg, rgba(13,13,13,0.8) 0%, rgba(13,13,13,0) 100%);
        }
        
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important;
          transform: translateY(-5px);
        }
        
        .premium-trending-carousel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c5a47e, transparent);
          opacity: 0.3;
        }
        
        .premium-trending-carousel::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c5a47e, transparent);
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default PremiumTrendingCarousel;