// src/components/AnalyticsPage.js
import React, { useEffect, useState } from 'react';
import { getPageVisitStatistics, clearPageVisitStatistics } from '../hooks/usePageTracking'; // Adjust path

const AnalyticsPage = () => {
  const [pageStats, setPageStats] = useState({});

  useEffect(() => {
    setPageStats(getPageVisitStatistics());
  }, []);

  const handleClearStats = () => {
    clearPageVisitStatistics();
    setPageStats({}); // Clear local state after clearing localStorage
  };

  // Sort pages by visit count in descending order
  const sortedPages = Object.entries(pageStats).sort(([, countA], [, countB]) => countB - countA);

  return (
    <div>
      <h2>Page Visit Statistics</h2>
      {sortedPages.length > 0 ? (
        <>
          <ul>
            {sortedPages.map(([path, count]) => (
              <li key={path}>
                <strong>{path}</strong>: {count} visits
              </li>
            ))}
          </ul>
          <button onClick={handleClearStats} style={{ padding: '10px', margin: '20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Clear Statistics
          </button>
        </>
      ) : (
        <p>No page visit data recorded yet.</p>
      )}
    </div>
  );
};

export default AnalyticsPage;