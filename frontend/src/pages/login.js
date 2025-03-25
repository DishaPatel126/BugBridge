import React, { useState } from "react";
import { login } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await login({ email, password });
      localStorage.setItem("authToken", response.body.token);
      localStorage.setItem("userName", response.body.username);
      console.log(response)
      if (rememberMe) {
        localStorage.setItem("rememberMe", response.body.id);
      } else {
        localStorage.removeItem("rememberMe");
      }
      console.log("succesfully logged in");
      console.log(response.body.id);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] px-4">
      <div className="bg-white p-8 shadow-lg rounded-xl max-w-4xl w-full flex flex-col md:flex-row">
        {/* Left Side - Welcome Message */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r from-[#2D3E50] to-[#A3D8F4] text-white p-8 rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
          <h2 className="text-3xl font-bold text-center">Welcome Back to Bug Board</h2>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8">
          <h1 className=" mb-6 text-center md:text-left text-[#2D3E50] text-4xl font-bold">Login</h1>
          {error && <p className="text-red-500 text-sm mb-4 text-center md:text-left">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}
                  className="form-checkbox text-blue-500" />
                Remember Me
              </label>
              <Link to="/forgot-password" className="text-[#4B4F54] hover:underline">Forgot Password?</Link>
            </div>
            <button type="submit" disabled={loading}
              className={`w-full py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-[#2D3E50] hover:bg-[#1A2B37]'}`}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
          <p className="text-sm text-center text-gray-600 mt-4">
            Don't have an account? <Link to="/register" className="text-[#4B4F54] hover:underline">Sign Up!</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
