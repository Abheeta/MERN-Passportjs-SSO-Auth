/**
 * @file LoggedIn.jsx
 * @description Authentication success page that displays user information and logout option
 * @requires React
 * @requires UserContext
 */

import React from 'react';
import { useLocation } from 'react-router';
import { useCurrentUser } from './UserContext';
import "../output.css";

// SVG paths for Google logo - extracted for cleaner JSX
const GOOGLE_LOGO_PATHS = [
  {
    d: "M19.5 10.7324C19.5 10.0778 19.4366 9.40206 19.331 8.76855H10.1874V12.5063H15.4244C15.2132 13.7099 14.5164 14.7658 13.4816 15.4415L16.6069 17.87C18.4441 16.1595 19.5 13.6677 19.5 10.7324Z",
    fill: "#4280EF"
  },
  {
    d: "M10.1874 20.1932C12.8059 20.1932 15.0021 19.3274 16.6069 17.8492L13.4816 15.4418C12.6158 16.0331 11.4966 16.371 10.1874 16.371C7.65334 16.371 5.52053 14.6605 4.7392 12.3799L1.52942 14.8506C3.17654 18.1237 6.51303 20.1932 10.1874 20.1932Z",
    fill: "#34A353"
  },
  {
    d: "M4.73923 12.3588C4.33801 11.1551 4.33801 9.84586 4.73923 8.64219L1.52945 6.15039C0.156849 8.8956 0.156849 12.1265 1.52945 14.8506L4.73923 12.3588Z",
    fill: "#F6B704"
  },
  {
    d: "M10.1874 4.65079C11.56 4.62967 12.9115 5.1576 13.904 6.10786L16.6703 3.32042C14.9176 1.67329 12.5947 0.78638 10.1874 0.807497C6.51303 0.807497 3.17654 2.87696 1.52942 6.15009L4.7392 8.6419C5.52053 6.34015 7.65334 4.65079 10.1874 4.65079Z",
    fill: "#E54335"
  }
];

/**
 * LoggedIn Component
 * Displays a welcome message and logout button for authenticated users.
 * Utilizes Google OAuth for authentication management.
 * 
 * @component
 * @returns {JSX.Element} Rendered logged-in view
 */
const LoggedIn = () => {
  // Custom hooks
  const { currentUser } = useCurrentUser();
  const location = useLocation();

  // Styles for the logout button
  const logoutButtonStyles = {
    border: '0.75px solid #333',
    background: '#0A0A0A'
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {/* Welcome Message */}
      <div className="mb-12 font-inter text-2xl font-semibold uppercase tracking-wide">
        Hi, You are logged in!
      </div>

      {/* Logout Section */}
      <a 
        href={`${import.meta.env.VITE_BACKEND_URL}/logout`}
        className="transition-transform hover:scale-105"
      >
        <button 
          className="flex w-[22.5rem] flex-row items-center justify-center rounded-md p-4"
          style={logoutButtonStyles}
        >
          {/* Google Logo */}
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="21" 
              viewBox="0 0 20 21" 
              fill="none"
              className="mr-4"
            >
              {GOOGLE_LOGO_PATHS.map((path, index) => (
                <path 
                  key={index}
                  d={path.d}
                  fill={path.fill}
                />
              ))}
            </svg>
          </div>

          {/* Button Text */}
          <span className="font-inter text-base font-semibold text-[#808080]">
            Log Out of Google
          </span>
        </button>
      </a>
    </main>
  );
};

export default LoggedIn;