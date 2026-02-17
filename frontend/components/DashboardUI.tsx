"use client";
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AILogo from '@/components/icons/AILogo';

interface DashboardUIProps {
    onTabChange: (tab: "camera" | "upload" | "google" | "garden") => void;
    onCameraTrigger: () => void;
    activeTab: string;
}

export default function DashboardUI({ onTabChange, onCameraTrigger, activeTab }: DashboardUIProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col h-full bg-[#f0f9ff] text-slate-800 font-sans min-h-screen relative overflow-hidden">
            {/* Background Gradients to match the airy feel */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-[#def7f9] -z-10" />

            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center z-10 pt-12">
                <div className="flex items-center gap-2">
                    {/* Logo Text */}
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Plant<span className="text-emerald-600">Guardian</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onTabChange('google')}
                        className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-full transition-colors font-medium text-sm shadow-sm"
                    >
                        <AILogo className="w-4 h-4 text-indigo-600" />
                        <span>Assistant</span>
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24 space-y-6">

                {/* Crops Horizontal Scroll */}
                <div className="px-4">
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {['Apple', 'Bean', 'Cabbage', 'Cauliflower', 'Tomato', 'Rose'].map((crop, i) => (
                            <div key={crop} className="flex flex-col items-center gap-2 min-w-[72px]">
                                <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2">
                                    {/* Placeholder Icons based on crop names */}
                                    <span className="text-2xl">
                                        {crop === 'Apple' ? '🍎' :
                                            crop === 'Bean' ? '🫘' :
                                                crop === 'Cabbage' ? '🥬' :
                                                    crop === 'Cauliflower' ? '🥦' :
                                                        crop === 'Tomato' ? '🍅' : '🌹'}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-slate-600">{crop}</span>
                            </div>
                        ))}

                        {/* Add Button */}
                        <div className="flex flex-col items-center gap-2 min-w-[72px]">
                            <button className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 flex items-center justify-center transition-transform active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                            <span className="text-xs font-medium text-slate-600">Add</span>
                        </div>
                    </div>
                </div>

                {/* Weather/Info Widgets */}
                <div className="px-6 flex gap-4 overflow-x-auto pb-2">
                    {/* Weather Card */}
                    <div className="min-w-[160px] bg-[#ffe4c4]/30 border border-orange-200 rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
                        <div className="flex justify-between items-start z-10">
                            <div className="text-xs font-medium text-amber-800 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                16 Feb
                            </div>
                            <span className="text-2xl">☁️</span>
                        </div>
                        <div className="z-10">
                            <div className="text-2xl font-bold text-slate-800">24°C</div>
                        </div>
                        {/* Decorative blob */}
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-200 rounded-full blur-xl opacity-50"></div>
                    </div>

                    {/* Spraying Conditions Card */}
                    <div className="min-w-[200px] flex-1 bg-[#ffedd5]/40 border border-orange-200 rounded-2xl p-4 h-28 relative overflow-hidden">
                        <div className="flex justify-between items-start z-10 mb-1">
                            <div className="text-xs font-medium text-amber-800 flex items-center gap-1">
                                <span className="line-through opacity-50">Sprayer</span> Spraying conditions
                            </div>
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">until 9 pm</span>
                        </div>
                        <div className="z-10">
                            <div className="text-lg font-bold text-amber-900 mt-1">Moderate</div>
                            <div className="w-full bg-white/50 h-1.5 mt-3 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 w-3/5 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Permission */}
                <div className="mx-6 p-4 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.08 19.08 0 002.274 1.765c.311.192.571.337.757.433.092.047.186.095.281.14l.018.008.006.003h.002zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="text-xs text-slate-600 leading-tight">
                            Allow location access to see weather info
                        </div>
                    </div>
                    <button className="text-sm font-bold text-blue-600 px-3 py-1 hover:bg-blue-50 rounded-lg">
                        Allow
                    </button>
                </div>

                {/* Hero Section - Diagnosis */}
                <div className="mx-6 mt-4 flex flex-col items-center text-center relative">

                    {/* Phone Illustration Mockup */}
                    <div className="relative w-40 h-40 mb-4 animate-float">
                        {/* Background blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-200/40 rounded-full blur-2xl"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-200/40 rounded-full blur-xl animate-pulse"></div>

                        {/* Phone SVG */}
                        <svg viewBox="0 0 100 160" className="w-full h-full relative z-10 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="20" y="10" width="60" height="120" rx="8" fill="#1e293b" />
                            <rect x="23" y="13" width="54" height="114" rx="6" fill="#f8fafc" />
                            {/* Plant Icon on screen */}
                            <text x="50" y="70" textAnchor="middle" fontSize="30">🌿</text>
                            {/* Scan line */}
                            <line x1="25" y1="40" x2="75" y2="40" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2">
                                <animate attributeName="y1" from="20" to="120" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="y2" from="20" to="120" dur="2s" repeatCount="indefinite" />
                            </line>
                        </svg>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-6">See diagnosis</h2>

                    <button
                        onClick={onCameraTrigger}
                        className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full shadow-xl shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                        Take a picture
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <nav className="absolute bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-4 pb-6 flex justify-between items-end z-50">
                <button
                    onClick={() => onTabChange('garden')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'garden' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <div className={`p-1 rounded-full ${activeTab === 'garden' ? 'bg-blue-50' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'garden' ? 2.5 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium">Your crops</span>
                </button>

                <button
                    onClick={() => { }}
                    className="flex flex-col items-center gap-1 text-slate-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <span className="text-[10px] font-medium">Community</span>
                </button>

                <button
                    onClick={() => { }}
                    className="flex flex-col items-center gap-1 text-slate-400"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.197 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                    <span className="text-[10px] font-medium">Market</span>
                </button>

                <button
                    onClick={() => { }}
                    className="flex flex-col items-center gap-1 text-slate-400"
                >
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-slate-400 translate-y-1">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium">You</span>
                </button>
            </nav>
        </div>
    );
}
