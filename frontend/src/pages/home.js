import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="login-wrapper">
    <div className="home-container">
      <h1 style={{color:"black"}}>Welcome to Bug Board</h1>
      <div style={{display:"flex", justifyContent:"space-evenly",width:"100%", marginTop:"20px", gap:"12px"}}>
      <Link to="/login" className="link-btn">Sign In</Link>
      <Link to="/register" className="link-btn">Sign Up</Link>
      </div>
    </div>
    </div>
  );
};

export default HomePage;
