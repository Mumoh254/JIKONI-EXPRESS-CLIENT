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

    </div>
  );
};

export default App;
