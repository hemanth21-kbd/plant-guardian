"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AuthFormProps {
    onLoginSuccess: (user: any) => void;
}

export default function AuthForm({ onLoginSuccess }: AuthFormProps) {
    // We only want registration now
    const [method, setMethod] = useState<'password' | 'otp'>('password');

    // Auth Fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // OTP Fields
    const [identifier, setIdentifier] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegistrationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            // Force registration endpoint
            const endpoint = '/auth/register';
            const payload = { 
                username, 
                email, 
                phone_number: phone, 
                password 
            };

            const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

            // Handle response data
            const userData = { ...res.data, user_id: res.data.id };

            localStorage.setItem('user', JSON.stringify(userData));
            onLoginSuccess(userData);
        } catch (err: any) {
            console.error("Registration error details:", err);
            setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/auth/request-otp`, { identifier });
            setOtpSent(true);
            setSuccessMsg(res.data.message || 'OTP Sent successfully');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { identifier, code: otpCode });
            localStorage.setItem('user', JSON.stringify(res.data));
            onLoginSuccess(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Farmer Registration
            </h2>
            <p className="text-slate-400 text-sm mb-6 text-center">
                Join Plant Guardian to protect your crops
            </p>

            <div className="flex bg-white/5 p-1 rounded-lg mb-6">
                <button
                    onClick={() => { setMethod('password'); setError(''); setOtpSent(false); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'password' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Standard Form
                </button>
                <button
                    onClick={() => { setMethod('otp'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'otp' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Quick OTP Sign up
                </button>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg mb-4 text-sm text-center">
                    {successMsg}
                </div>
            )}

            {method === 'otp' ? (
                <div className="space-y-4 animate-fade-in">
                    {!otpSent ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Email or Phone Number</label>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="e.g. 555-1234 or email@test.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !identifier}
                                className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? 'Sending...' : 'Send OTP Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Enter 6-digit OTP Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="123456"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center tracking-widest text-lg"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-2 text-center flex flex-col items-center">
                                    <span>Check the backend console output for the code!</span>
                                    <span className="opacity-60">(Simulation Mode)</span>
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otpCode.length < 4}
                                className="w-full bg-teal-500 text-white font-semibold py-3 rounded-lg hover:bg-teal-400 transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
                            >
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setOtpSent(false)}
                                className="w-full text-slate-400 text-sm mt-2 hover:text-white"
                            >
                                Use a different number/email
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <form onSubmit={handleRegistrationSubmit} className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Farmer Name"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                        />
                    </div>

                    <div className="animate-fade-in">
                        <label className="block text-sm text-slate-400 mb-1">Email (Optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    
                    <div className="animate-fade-in">
                        <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 00000 00000"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Registering...' : 'Register as Farmer'}
                    </button>
                    
                    <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest">
                        One-time registration for crop protection
                    </p>
                </form>
            )}
        </div>
    );
}
