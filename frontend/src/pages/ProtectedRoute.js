import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
        return <Navigate to="/" replace />; // Redirect to login if no token
    }

    return children;
};

export default ProtectedRoute;
