"use client";
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import AILogo from './icons/AILogo';
import { API_BASE_URL } from '../config';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { toast } from 'react-hot-toast';

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
            toast.success("Found an answer for you!", { icon: "💡" });

            // Save the discussion
            const newDiscussion = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                query: text,
                answer: res.data.answer
            };
            const existingDiscussions = JSON.parse(localStorage.getItem('savedDiscussions') || '[]');
            localStorage.setItem('savedDiscussions', JSON.stringify([newDiscussion, ...existingDiscussions]));

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
            toast.error("Failed to fetch answer.");
        } finally {
            setLoading(false);
        }
    };



    const startListening = async () => {
        // Try Capacitor Native Plugin first (for Android)
        try {
            const hasPermission = await SpeechRecognition.checkPermissions();
            if (!hasPermission.speechRecognition) {
                await SpeechRecognition.requestPermissions();
            }

            const { available } = await SpeechRecognition.available();
            if (available) {
                setIsListening(true);
                SpeechRecognition.start({
                    language: "en-US",
                    maxResults: 1,
                    prompt: "Speak now...",
                    partialResults: true,
                    popup: false,
                });

                SpeechRecognition.addListener('partialResults', (data: any) => {
                    if (data.matches && data.matches.length > 0) {
                        setQuery(data.matches[0]);
                    }
                });

                // On Android, we might not get a clear 'end' event the same way, 
                // but usually the listener or a final result handles it.
                // For simplicity, we assume user stops speaking or hits the button to stop.

                return;
            }
        } catch (e) {
            console.log("Native Voice not available, falling back to Web API", e);
        }

        // Fallback to Web Speech API (for Desktop/Web)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const WindowSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new WindowSpeechRecognition();

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
                    <div className="p-4 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 animate-float">
                        <AILogo className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Plant Guardian Assistant</h2>
                <p className="text-slate-600">Ask any question about plants, fertilizers, or diseases.</p>
            </div>

            <form onSubmit={handleAsk} className="mb-8 relative z-10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., How often should I water my tomatoes?"
                        className="bg-white border border-slate-200 shadow-sm flex-1 p-4 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <button
                        type="button"
                        onClick={startListening}
                        className={`px-4 py-4 rounded-xl font-semibold transition-all shadow-sm ${isListening
                            ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
                            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                            }`}
                        title="Voice Search"
                    >
                        {isListening ? 'Listening...' : '🎤'}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                    >
                        {loading ? 'Asking...' : 'Ask Guardian'}
                    </button>
                </div>
            </form>

            {answer && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm animate-fade-in relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-teal-200/30 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200/50">
                            <AILogo className="w-6 h-6" />
                        </div>
                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium">
                            <ReactMarkdown>{answer}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
