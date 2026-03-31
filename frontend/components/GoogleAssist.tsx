"use client";
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const resume = localStorage.getItem('resumeDiscussion');
        if (resume) {
            const parsed = JSON.parse(resume);
            setQuery(parsed.query || '');
            setAnswer(parsed.answer || '');
            localStorage.removeItem('resumeDiscussion');
        }
    }, []);

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

        for (const [key, url] of Object.entries(websiteMap)) {
            if (lowerText.includes(key)) {
                setAnswer(`Opening ${key}...`);
                window.open(url, "_blank");
                return;
            }
        }

        setLoading(true);
        setAnswer('');
        try {
            const response = await fetch(`${API_BASE_URL}/ask-google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({ query: text }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server responded with ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedAnswer = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedAnswer += chunk;
                    setAnswer(accumulatedAnswer);
                }
            }

            if (!accumulatedAnswer) {
                setAnswer("I'm sorry, I couldn't get a response from the AI. Please try again.");
            } else {
                toast.success("Found an answer for you!", { icon: "💡" });
            }

            // Save the discussion
            const newDiscussion = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                query: text,
                answer: accumulatedAnswer
            };
            const existingDiscussions = JSON.parse(localStorage.getItem('savedDiscussions') || '[]');
            localStorage.setItem('savedDiscussions', JSON.stringify([newDiscussion, ...existingDiscussions]));

        } catch (err: any) {
            console.error("Google Assist Error:", err);
            setAnswer(`**Connection Error:** I cannot reach the server at \`${API_BASE_URL}\`. 

Please make sure:
1. The backend server is running (\`run.bat\`).
2. Your device is on the same network as the server.
3. The API URL in settings/config is correct.

*Technical detail: ${err.message}*`);
            toast.error("Failed to fetch answer.");
        } finally {
            setLoading(false);
        }
    };



    const stopListening = async () => {
        try {
            await SpeechRecognition.stop();
        } catch (e) {
            console.error("Error stopping voice recognition", e);
        }
        setIsListening(false);
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
                await SpeechRecognition.start({
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

                // Listening typically stops automatically on Android after the user is silent.
                // We'll set a timeout or rely on the final result if possible.
                // For a more robust native feel, we use the 'listeningState' if Capacitor supports it or just a timeout.
                
                return;
            }
        } catch (e) {
            console.log("Native Voice not available, falling back to Web API", e);
        }

        // Fallback to Web Speech API (for Desktop/Web)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const WindowSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new WindowSpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => {
                setIsListening(false);
                // Trigger fetch automatically on end if query exists
                if (query.trim()) {
                    fetchAnswer(query);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                toast.error("Speech recognition failed. Please try again.");
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                setQuery(transcript);
            };

            recognition.start();
        } else {
            toast.error("Voice search is not supported in this browser.");
        }
    };

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchAnswer(query);
    };

    const suggestedQuestions = [
        "How often should I water my tomatoes?",
        "Best fertilizer for houseplants?",
        "How to treat yellow leaves?",
        "What plants grow well in shade?",
    ];

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

            <form onSubmit={handleAsk} className="mb-4 relative z-10">
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
                        onClick={isListening ? stopListening : startListening}
                        className={`px-4 py-4 rounded-xl font-semibold transition-all shadow-sm ${isListening
                            ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
                            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                            }`}
                        title={isListening ? "Stop Listening" : "Voice Search"}
                    >
                        {isListening ? '🛑 Stop' : '🎤'}
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

            <div className="flex flex-wrap gap-2 mb-8 items-center justify-center">
                {suggestedQuestions.map((q, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setQuery(q);
                            fetchAnswer(q);
                        }}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 text-sm rounded-full border border-slate-200 hover:border-emerald-200 transition-all"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {answer && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm animate-fade-in relative overflow-hidden group">
                    <button 
                        onClick={() => setAnswer('')}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Clear Answer"
                    >
                        ✕
                    </button>
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
