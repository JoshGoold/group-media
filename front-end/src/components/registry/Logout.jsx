import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const nav = useNavigate();
  // Logout handler
  const handleLogout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    nav('/login');
  };
  return (
    <div className="mt-3">
      <button
        className="bg-white rounded-md p-2"
        onClick={() => handleLogout()}
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
