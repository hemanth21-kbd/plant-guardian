"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AuthFormProps {
    onLoginSuccess: (user: any) => void;
}

export default function AuthForm({ onLoginSuccess }: AuthFormProps) {
    // Auth Fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

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
                email: email || undefined, 
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
            setError(err.response?.data?.detail || 'Registration failed. Please use a unique farmer name.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Farmer Registration
            </h2>
            <p className="text-slate-400 text-sm mb-8 text-center">
                Join Plant Guardian to protect your crops
            </p>

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
        </div>
    );
}
