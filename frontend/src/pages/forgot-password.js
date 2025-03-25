import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackCircle, IoSend } from "react-icons/io5";
import { forgot, validate_token } from "../services/auth";
import "../styles/BugModal.css";


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!email) {
            setError("Please enter an email to receive OTP.");
            setOtpSent(false);
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            await forgot({ email }); // Simulate API Call
            setOtpSent(true);
            setSuccessMessage("OTP sent successfully!");
            setIsModalOpen(true);
        } catch (err) {
            setError("Failed to send OTP. Please try again.");
            setOtpSent(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        if (!code) {
            setError("Please enter the OTP.");
            setLoading(false);
            return;
        }
    
        try {
            const isValid = await validate_token(code); // API returns true or false

            if (isValid) {
                localStorage.setItem("resetToken", code);
                setSuccessMessage("OTP verified successfully!");
                setIsModalOpen(true);
                setTimeout(() => navigate("/reset-password"), 1500);
            } else {
                setError("Invalid or expired OTP. Please try again.");
            }
        } catch (err) {
            setError(err || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] px-4">
            <div className="bg-white p-8 shadow-lg rounded-xl max-w-4xl w-full flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-r from-[#2D3E50] to-[#A3D8F4] text-white p-8 rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
                    <h2 className="text-2xl md:text-3xl font-bold text-center">Recover Your Account</h2>
                </div>
                <div className="md:w-1/2 p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <IoArrowBackCircle className="text-3xl text-gray-700 cursor-pointer" onClick={() => navigate("/")} />
                        <h1 className="text-2xl font-semibold">Forgot Password</h1>
                    </div>
                    
                    {/* Error Message */}
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Enter Registered Email</label>
                            <div className="flex items-center border rounded-lg p-2">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full outline-none" required />
                                <button type="button" onClick={handleSendOtp} className="ml-2 text-black-500 hover:text-gray-700">
                                    <IoSend className="text-2xl" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium">Enter OTP</label>
                            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required />
                        </div>
                        <button type="submit" disabled={loading}
                            className={`w-full py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-[#2D3E50] hover:bg-[#1A2B37]'}`}>
                            {loading ? "Verifying..." : "Submit"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {isModalOpen && successMessage && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p className="text-green-600">{successMessage}</p>
                        <button onClick={() => setIsModalOpen(false)} className="modal button">
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordPage;
