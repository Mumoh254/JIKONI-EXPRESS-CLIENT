import React, { useState, useEffect } from 'react';

// Define the brand colors
const colors = {
  primary: '#FF4532', // Brand Red
  secondary: '#2ECC71', // Fresh Green
  dark: '#2D3436',
  light: '#F8F9FA'
};

// Main App Component
const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Function to show custom modal messages
  const showCustomModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Notification</h3>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 md:px-12 flex justify-between items-center rounded-b-xl">
        <div className="flex items-center space-x-2">
          {/* Jikoni Express Logo - Placeholder for actual logo */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <span className="font-bold text-white text-xl">JE</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: colors.dark }}>Jikoni Express</h1>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition duration-300">Features</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 font-medium transition duration-300">How it Works</a>
          <a href="#about" className="text-gray-700 hover:text-gray-900 font-medium transition duration-300">About Us</a>
          <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium transition duration-300">Contact</a>
        </nav>
        <button
          onClick={() => showCustomModal('Download options coming soon!')}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md hidden md:block"
        >
          Download App
        </button>
        {/* Mobile menu button */}
        <button className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center py-16 px-6 md:px-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://placehold.co/1920x1080/E0E0E0/2D3436?text=African+Food+Background')" }}></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6" style={{ color: colors.dark }}>
            Africa's <span style={{ color: colors.primary }}>First Decentralized</span> Food Delivery
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-700">
            Experience the future of food delivery. Jikoni Express connects you directly to local kitchens and fresh produce, powered by a secure, transparent, and community-driven network.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => showCustomModal('Coming soon to App Store!')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Get on App Store
            </button>
            <button
              onClick={() => showCustomModal('Coming soon to Google Play!')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Get on Google Play
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 md:px-12 bg-white rounded-xl shadow-lg mx-auto my-8 max-w-6xl">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: colors.dark }}>Why Choose Jikoni Express?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300">
            <div className="p-4 rounded-full mb-4" style={{ backgroundColor: colors.primary + '20' }}>
              <svg className="w-12 h-12" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>Decentralized & Fair</h4>
            <p className="text-gray-600">
              Direct connections, fairer prices for producers, and transparent transactions. No hidden fees, just honest food.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300">
            <div className="p-4 rounded-full mb-4" style={{ backgroundColor: colors.secondary + '20' }}>
              <svg className="w-12 h-12" style={{ color: colors.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4M13 17v4m-2-2h4M19 3v4m-2-2h4m-5 16v4m-2-2h4M19 17v4m-2-2h4"></path>
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>Community Powered</h4>
            <p className="text-gray-600">
              Support local businesses and farmers directly. Our network thrives on community participation and trust.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300">
            <div className="p-4 rounded-full mb-4" style={{ backgroundColor: colors.primary + '20' }}>
              <svg className="w-12 h-12" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.944 12c0 2.879 1.144 5.462 2.944 7.318A11.955 11.955 0 0112 21.056c2.879 0 5.462-1.144 7.318-2.944A11.955 11.955 0 0021.056 12c0-2.879-1.144-5.462-2.944-7.318z"></path>
              </svg>
            </div>
            <h4 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>Secure & Transparent</h4>
            <p className="text-gray-600">
              Blockchain technology ensures every transaction is secure, verifiable, and transparent from farm to table.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6 md:px-12 bg-gradient-to-r from-red-50 to-green-50 rounded-xl shadow-lg mx-auto my-8 max-w-6xl">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: colors.dark }}>How Jikoni Express Works</h3>
        <div className="flex flex-col md:flex-row items-center justify-around space-y-8 md:space-y-0 md:space-x-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-md" style={{ border: `3px solid ${colors.primary}` }}>
              <span className="text-4xl font-bold" style={{ color: colors.primary }}>1</span>
            </div>
            <h4 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>Browse Local</h4>
            <p className="text-gray-600">Discover authentic African dishes and fresh produce from local kitchens and farms.</p>
          </div>
          {/* Arrow */}
          <div className="hidden md:block text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-md" style={{ border: `3px solid ${colors.secondary}` }}>
              <span className="text-4xl font-bold" style={{ color: colors.secondary }}>2</span>
            </div>
            <h4 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>Order Securely</h4>
            <p className="text-gray-600">Place your order with confidence, knowing your transactions are secure and transparent.</p>
          </div>
          {/* Arrow */}
          <div className="hidden md:block text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-md" style={{ border: `3px solid ${colors.primary}` }}>
              <span className="text-4xl font-bold" style={{ color: colors.primary }}>3</span>
            </div>
            <h4 className="text-xl font-semibold mb-2" style={{ color: colors.dark }}>Enjoy Fresh Delivery</h4>
            <p className="text-gray-600">Your delicious food and liquor are delivered fresh, right to your doorstep.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-6 md:px-12 text-center bg-white rounded-xl shadow-lg mx-auto my-8 max-w-6xl">
        <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: colors.dark }}>Ready to Taste the Future?</h3>
        <p className="text-lg md:text-xl mb-8 text-gray-700">Join the Jikoni Express revolution and support local while enjoying unparalleled convenience.</p>
        <button
          onClick={() => showCustomModal('Be the first to know when we launch!')}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Sign Up for Updates
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6 md:px-12 text-center rounded-t-xl">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Jikoni Express. All rights reserved.</p>
            <p className="text-sm mt-1">Powered by Welt Tallis.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
