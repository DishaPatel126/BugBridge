import React, { useState, useEffect, useRef } from "react";
import { logout, getAuthenticatedUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react"
import ProfileNavbar from "../components/ProfileNavbar";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            try {
                const userId = sessionStorage.getItem("userId");

                if (!userId) {
                    throw new Error("User ID not found. Please log in again.");
                }

                const userData = await getAuthenticatedUser(userId);
                setUser(userData);
                setError("");
            } catch (err) {
                setError("Failed to load user details. Redirecting to login...");
                setTimeout(() => navigate("/"), 5000);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchUserDetails();
    }, []);

    const handleLogout = () => {
        logout(); // Clear auth data
        navigate("/"); // Redirect to login page
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation Bar */}
            <ProfileNavbar />
            <div className="bg-gray-100 flex flex-grow items-center justify-center px-4 mt-10">
                <div className="bg-white p-8 shadow-lg rounded-xl max-w-lg w-full">
                    <h1 className="text-2xl font-semibold mb-6 text-center">User Profile</h1>

                    {loading && <p className="text-gray-500 text-center">Loading user details...</p>}
                    {!loading && error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    {!loading && user ? (
                        <div className="space-y-4">
                            <p className="text-gray-700"><strong>Username:</strong> {user.username}</p>
                            <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>

                            <button
                                onClick={() => navigate("/profile-settings")}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Update Details
                            </button>
                        </div>
                    ) : (
                        !loading && <p className="text-gray-500 text-center">No user details available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
