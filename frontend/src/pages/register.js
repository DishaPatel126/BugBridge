import React, { useState } from "react";
import { signup } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Invalid email format.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await signup({ username, email, password });
      navigate("/");
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] px-4">
      <div className="bg-white p-8 shadow-lg rounded-xl max-w-4xl w-full flex flex-col md:flex-row">
        <div className="md:w-1/2 flex items-center justify-center bg-gradient-to-r from-[#2D3E50] to-[#A3D8F4] text-white p-8 rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Join the Bug Board Community</h2>
        </div>
        <div className="md:w-1/2 p-8">
          <h1 className="mb-6 text-center md:text-left text-[#2D3E50] text-4xl font-bold">Sign Up</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required />
            </div>
            <button type="submit" disabled={loading}
              className={`w-full py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-[#2D3E50] hover:bg-[#1A2B37]'}`}> 
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account? <Link to="/" className="text-[#4B4F54] hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;