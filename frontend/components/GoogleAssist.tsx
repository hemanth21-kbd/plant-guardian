"use client";
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import AILogo from './icons/AILogo';
import { API_BASE_URL } from '../config';

export default function GoogleAssist() {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const fetchAnswer = async (text: string) => {
        if (!text.trim()) return;

        // Browser-like navigation logic
        const lowerText = text.toLowerCase();

        const websiteMap: { [key: string]: string } = {
            "youtube": "https://www.youtube.com",
            "google": "https://www.google.com",
            "facebook": "https://www.facebook.com",
            "twitter": "https://twitter.com",
            "instagram": "https://www.instagram.com",
            "linkedin": "https://www.linkedin.com",
            "reddit": "https://www.reddit.com",
            "netflix": "https://www.netflix.com",
            "amazon": "https://www.amazon.com",
            "github": "https://github.com",
            "stackoverflow": "https://stackoverflow.com",
            "wikipedia": "https://www.wikipedia.org",
        };

        // Check for direct website names or "open [website]"
        for (const [key, url] of Object.entries(websiteMap)) {
            if (lowerText.includes(key)) {
                setAnswer(`Opening ${key}...`);
                window.open(url, "_blank");
                return;
            }
        }

        // Search logic if it looks like a general search query but not a specific site match above ??
        // For now, let's keep the user's request simple: "search youtube" -> opens youtube.

        setLoading(true);
        setAnswer('');
        try {
            const res = await axios.post(`${API_BASE_URL}/ask-google`, { query: text }, {
                headers: { 'Bypass-Tunnel-Reminder': 'true' }
            });
            setAnswer(res.data.answer);
        } catch (err: any) {
            console.error("Google Assist Error:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
            } else if (err.request) {
                console.error("No response received:", err.request);
            } else {
                console.error("Error setting up request:", err.message);
            }
            setAnswer('Sorry, I usually know the answer, but I cannot reach the server right now. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                fetchAnswer(transcript);
            };

            recognition.start();
        } else {
            alert("Voice search is not supported in this browser.");
        }
    };

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchAnswer(query);
    };

    return (
        <div className="max-w-3xl mx-auto w-full">
            <div className="text-center mb-8 space-y-2">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 animate-float">
                        <AILogo className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white">Google Gardening Assistant</h2>
                <p className="text-slate-300">Ask any question about plants, fertilizers, or diseases.</p>
            </div>

            <form onSubmit={handleAsk} className="mb-8 relative z-10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., How often should I water my tomatoes?"
                        className="glass-input flex-1 p-4 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                    <button
                        type="button"
                        onClick={startListening}
                        className={`px-4 py-4 rounded-xl font-semibold transition-all shadow-lg backdrop-blur-md ${isListening
                            ? "bg-red-500/80 text-white animate-pulse border border-red-400/50"
                            : "bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10"
                            }`}
                        title="Voice Search"
                    >
                        {isListening ? 'Listening...' : '🎤'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20"
                    >
                        {loading ? 'Asking...' : 'Ask Google'}
                    </button>
                </div>
            </form>

            {answer && (
                <div className="glass-panel border-l-4 border-l-amber-500 rounded-xl p-6 shadow-xl animate-fade-in">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                            <AILogo className="w-6 h-6" />
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed">
                            <ReactMarkdown>{answer}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
