import React, { useState, useEffect, useRef  } from "react";
import {logout, getAuthenticatedUser, sendOtp, verifyOtp, updateUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { IoArrowForwardCircle } from "react-icons/io5";
import { Menu } from "lucide-react"
import Navbar from "../components/Navbar";
import ProfileNavbar from "../components/ProfileNavbar";

const ProfileSettings = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState(""); 
  const [emailVerified, setEmailVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID not found. Redirecting to login...");
        }

        const userData = await getAuthenticatedUser(userId);
        setUsername(userData.username);
        setEmail(userData.email);
      } catch (err) {
        setError("Failed to load user details. Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }

      await sendOtp(userId, email);
      setOtpSent(true);
      setSuccessMessage("OTP sent successfully! Check your email.");
    } catch (err) {
      console.error("OTP Error:", err.response ? err.response.data : err.message);
      setError("Failed to send OTP. Try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }

      const response = await verifyOtp(userId, otp);

      if (response.status === "success") {
        setVerifiedEmail(email); //Store verified email temporarily
        setEmailVerified(true);
        setSuccessMessage("OTP verified! Click 'Save Changes' to update your email.");
      } else {
        setError("Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err.response ? err.response.data : err.message);
      setError("OTP verification failed.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setUpdating(true);

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setError("User ID not found. Please log in again.");
      setUpdating(false);
      return;
    }

    if (!username && !emailVerified && !password) {
      setError("Please update at least one field.");
      setUpdating(false);
      return;
    }

    try {
      const userData = { userId };
      if (username) userData.username = username;
      if (emailVerified) userData.email = verifiedEmail;
      if (password) userData.password = password;

      await updateUser(userData);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      console.error("Profile Update Error:", err.response ? err.response.data : err.message);
      setError("Failed to update profile. Try again.");
    } finally {
      setUpdating(false);
    }
  };
    const handleLogout = () => {
          logout(); // Clear auth data
          navigate("/"); // Redirect to login page
    };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Navigation Bar */}
                <Navbar />
                <div className="bg-gray-100 flex flex-grow items-center justify-center px-4 mt-10">
      <div className="bg-white p-8 shadow-lg rounded-xl max-w-lg w-full">
        <h1 className="text-2xl font-semibold mb-6 text-center">Update Profile</h1>

        {loading ? (
          <p className="text-gray-500 text-center">Loading user details...</p>
        ) : (
          <>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                  placeholder="Enter new username"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium">Email</label>
                <div className="flex items-center border rounded-lg p-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setOtpSent(false);
                      setEmailVerified(false);
                    }}
                    className="w-full outline-none"
                    placeholder="Enter new email"
                    disabled={emailVerified} 
                  />
                  {!emailVerified && (
                    <button type="button" onClick={handleSendOtp} className="ml-2 text-gray-500 hover:text-gray-700">
                      <IoArrowForwardCircle className="text-2xl" />
                    </button>
                  )}
                </div>
              </div>

              {otpSent && !emailVerified && (
                <div>
                  <label className="block text-gray-700 text-sm font-medium">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                    placeholder="Enter OTP"
                  />
                  <button type="button" onClick={handleVerifyOtp} className="mt-2 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                    Verify OTP
                  </button>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                  placeholder="Enter new password"
                />
              </div>

              <button type="submit" className={`w-full py-2 rounded-lg text-white ${updating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`} disabled={updating}>
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default ProfileSettings;
