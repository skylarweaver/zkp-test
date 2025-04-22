import React from 'react';

/**
 * Navigation component for the application
 * @param {Object} props - Component props
 * @param {string} props.activePage - The currently active page
 * @param {Function} props.setActivePage - Function to change the active page
 */
function Navigation({ activePage, setActivePage }) {
  const pages = [
    { id: 'pod-creator', label: 'Create POD' },
    { id: 'proof-generator', label: 'Create Proof' },
    { id: 'proof-verifier', label: 'Verify Proof' },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-2xl font-bold mb-3 sm:mb-0">
          <span className="text-indigo-400">ZKP</span> Demo
        </div>
        
        <div className="flex space-x-2">
          {pages.map((page) => (
            <button
              key={page.id}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                activePage === page.id
                  ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setActivePage(page.id)}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 