// Header.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

const Header = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLinks = () => (
    <>
      <li>
        <Link
          to="/management"
          className="hover:text-blue-200 transition duration-300"
        >
          Management
        </Link>
      </li>
      {user && (
        <li>
          <Link
            to="/dashboard"
            className="hover:text-blue-200 transition duration-300"
          >
            Dashboard
          </Link>
        </li>
      )}
      {user && (
        <li>
          <Link
            to="/Customer"
            className="hover:text-blue-200 transition duration-300"
          >
            Customer
          </Link>
        </li>
      )}
      {user ? (
        <li>
          <button
            onClick={handleLogout}
            className="hover:text-blue-200 transition duration-300"
          >
            Logout
          </button>
        </li>
      ) : (
        <li>
          <Link
            to="/login"
            className="hover:text-blue-200 transition duration-300"
          >
            Login
          </Link>
        </li>
      )}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-bold text-xl">Service App</span>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <NavLinks />
            </ul>
          </nav>
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="focus:outline-none">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <nav className="px-2 pt-2 pb-4">
            <ul className="space-y-1">
              <NavLinks />
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
