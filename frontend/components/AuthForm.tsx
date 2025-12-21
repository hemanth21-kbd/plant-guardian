"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AuthFormProps {
    onLoginSuccess: (user: any) => void;
}

export default function AuthForm({ onLoginSuccess }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { username, password }
                : { username, email, password };

            const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

            // Login returns { message, user_id, username }
            // Register returns { id, username, email }

            const userData = isLogin ? res.data : { ...res.data, user_id: res.data.id };

            localStorage.setItem('user', JSON.stringify(userData));
            onLoginSuccess(userData);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-black/30 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {isLogin ? 'Welcome Back' : 'Join Plant Guardian'}
            </h2>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                    />
                </div>

                {!isLogin && (
                    <div className="animate-fade-in">
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm text-slate-400 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </div>
    );
}
