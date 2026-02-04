import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-600">Susing & Rufin's Farm</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActiveLink('/') 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/venues" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActiveLink('/venues') 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Our Spaces
            </Link>
            <Link 
              to="/about" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActiveLink('/about') 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                isActiveLink('/contact') 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Contact
            </Link>
            
            {/* Always show Login/Register buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                  isActiveLink('/login') 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveLink('/') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/venues" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveLink('/venues') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Our Spaces
            </Link>
            <Link 
              to="/about" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveLink('/about') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActiveLink('/contact') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            {/* Mobile Login/Register */}
            <div className="border-t border-gray-200 pt-4">
              <Link 
                to="/login" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveLink('/login') ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;