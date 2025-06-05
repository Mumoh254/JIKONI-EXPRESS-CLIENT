// src/hooks/usePageTracking.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_VISITS_KEY = 'pageVisits'; // Key for localStorage

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPagePath = location.pathname;

    // Get existing data from localStorage
    const storedVisits = localStorage.getItem(PAGE_VISITS_KEY);
    const visitsData = storedVisits ? JSON.parse(storedVisits) : {};

    // Increment count for the current page
    visitsData[currentPagePath] = (visitsData[currentPagePath] || 0) + 1;

    // Save updated data to localStorage
    localStorage.setItem(PAGE_VISITS_KEY, JSON.stringify(visitsData));

    console.log(`Page visited: ${currentPagePath}. Total visits: ${visitsData[currentPagePath]}`);
  }, [location.pathname]); // Re-run when the path changes

  // Optional: Function to retrieve all visit statistics
  const getPageVisitStatistics = () => {
    const storedVisits = localStorage.getItem(PAGE_VISITS_KEY);
    return storedVisits ? JSON.parse(storedVisits) : {};
  };

  // Optional: Function to clear statistics (e.g., for testing)
  const clearPageVisitStatistics = () => {
    localStorage.removeItem(PAGE_VISITS_KEY);
    console.log('Page visit statistics cleared.');
  };

  return { getPageVisitStatistics, clearPageVisitStatistics };
};

// src/utils/pageAnalytics.js (for global access if needed)
export const getPageVisitStatistics = () => {
  const storedVisits = localStorage.getItem(PAGE_VISITS_KEY);
  return storedVisits ? JSON.parse(storedVisits) : {};
};

export const clearPageVisitStatistics = () => {
  localStorage.removeItem(PAGE_VISITS_KEY);
  console.log('Page visit statistics cleared.');
};