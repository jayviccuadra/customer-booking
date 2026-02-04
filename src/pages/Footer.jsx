import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Farm Information */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Susing & Rufin's Farm</h3>
            <p className="text-gray-300 mb-4">
              Your perfect venue for celebrations in the heart of Tarlac. Family-owned and operated with authentic Filipino hospitality.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📍 Barangay Apsayan, Gerona, Tarlac</p>
              <p>📞 0912 345 6789</p>
              <p>✉️ susing.rufin.farm@gmail.com</p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/venues" className="text-gray-300 hover:text-white transition duration-300">
                  Our Spaces
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Event Types */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Event Types</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">Birthday Celebrations</li>
              <li className="text-gray-300">18th Birthday/Debut</li>
              <li className="text-gray-300">Family Reunion</li>
              <li className="text-gray-300">Christmas Party</li>
              <li className="text-gray-300">Christening</li>
              <li className="text-gray-300">Wedding</li>
            </ul>
          </div>
          
          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Business Hours</h4>
            <div className="text-gray-300 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>7:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>7:00 AM - 9:00 PM</span>
              </div>
              <div className="mt-4 p-2 bg-green-900 rounded text-center">
                <p className="font-semibold">24/7 Online Booking Available</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-gray-300">
                &copy; {currentYear} Web-Based Development of Events and Booking Management System for Susing and Rufin's Farm. All rights reserved.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.7-3.062-1.745-.614-1.045-.614-2.34 0-3.385.614-1.045 1.765-1.745 3.062-1.745s2.448.7 3.062 1.745c.614 1.045.614 2.34 0 3.385-.614 1.045-1.765 1.745-3.062 1.745z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;