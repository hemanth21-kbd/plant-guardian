"use client";
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AILogo from '@/components/icons/AILogo';
import CameraFeed from '@/components/CameraFeed';
import ImageUpload from '@/components/ImageUpload';
import GoogleAssist from '@/components/GoogleAssist';
import Garden from '@/components/Garden';
import { languageOptions } from '@/utils/translations';
import { useState, useEffect } from 'react';

interface DashboardUIProps {
    onTabChange: (tab: "home" | "camera" | "upload" | "google" | "garden" | "community" | "market" | "shops" | "profile") => void;
    onCameraTrigger: () => void;
    activeTab: string;
    userPlants?: string[];
    children?: React.ReactNode;
}

export default function DashboardUI({ onTabChange, onCameraTrigger, activeTab, userPlants = [], children }: DashboardUIProps) {
    const { t, language, setLanguage } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState<'main' | 'language'>('main');
    const [locationStatus, setLocationStatus] = useState<'prompt' | 'loading' | 'granted' | 'denied'>('prompt');
    const [weatherData, setWeatherData] = useState<any>(null);

    useEffect(() => {
        if (activeTab === 'home' && locationStatus === 'prompt') {
            requestLocation();
        }
    }, [activeTab]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('denied');
            return;
        }

        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setLocationStatus('granted');
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`);
                    const data = await res.json();
                    setWeatherData(data);
                } catch (err) {
                    console.error("Failed to fetch weather", err);
                }
            },
            (error) => {
                console.error("Location error:", error);
                setLocationStatus('denied');
            }
        );
    };

    // Weather interpretation helper
    const getWeatherDetails = (code: number) => {
        if (code === undefined) return { label: 'Clear', icon: '☀️' };
        if (code <= 3) return { label: 'Clear/Partly Cloudy', icon: '🌤️' };
        if (code <= 48) return { label: 'Cloudy/Fog', icon: '☁️' };
        if (code <= 67) return { label: 'Rain', icon: '🌧️' };
        if (code <= 77) return { label: 'Snow', icon: '❄️' };
        if (code <= 82) return { label: 'Showers', icon: '🌦️' };
        return { label: 'Storm', icon: '⛈️' };
    };

    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    // Determine the optimal spray times dynamically based on weather
    let optimalSprayTime = 'Loading...';
    let optimalSprayReason = 'Fetching weather...';
    let optimalHours: number[] = [];

    if (weatherData && weatherData.hourly) {
        const slots = [9, 12, 15, 18, 21];

        // Calculate a score for each slot to find the best times
        const scoredSlots = slots.map(h => {
            const temp = weatherData.hourly.temperature_2m[h];
            const wind = weatherData.hourly.wind_speed_10m[h];
            const code = weatherData.hourly.weather_code[h];

            let score = 0;
            // Conditions for spraying: no rain (code < 50), temp < 30, wind < 15
            if (code < 50 && temp >= 10 && temp <= 30 && wind <= 15) {
                score += 10;
                if (temp >= 15 && temp <= 25) score += 5; // Ideal temp
                if (wind < 10) score += 5; // Ideal wind
            }
            return { hour: h, score };
        }).filter(s => s.score > 0);

        if (scoredSlots.length === 0) {
            optimalSprayTime = 'Not Recommended';
            optimalSprayReason = 'Poor weather conditions';
        } else {
            // Sort by score descending and take the top 2
            scoredSlots.sort((a, b) => b.score - a.score);
            const topSlots = scoredSlots.slice(0, 2).map(s => s.hour).sort((a, b) => a - b);
            optimalHours = topSlots;

            const formatHour = (h: number) => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const disp = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                return `${disp}:00 ${ampm}`;
            };

            optimalSprayTime = topSlots.map(formatHour).join(', ');
            optimalSprayReason = 'Good conditions for spraying';
        }
    } else {
        optimalHours = [18]; // fallback
        optimalSprayTime = '4:00 PM';
        optimalSprayReason = 'Usually optimal';
    }

    // Default list if no user selection
    const displayPlants = userPlants.length > 0
        ? userPlants
        : ['Apple', 'Bean', 'Cabbage', 'Cauliflower', 'Tomato', 'Rose'];

    const getIcon = (crop: string) => {
        const icons: Record<string, string> = {
            'Apple': '🍎', 'Bean': '🫘', 'Cabbage': '🥬', 'Cauliflower': '🥦',
            'Tomato': '🍅', 'Rose': '🌹', 'Banana': '🍌', 'Mango': '🥭',
            'Orange': '🍊', 'Grapes': '🍇', 'Carrot': '🥕', 'Potato': '🥔',
            'Pepper': '🫑', 'Corn': '🌽', 'Wheat': '🌾', 'Rice': '🍚'
        };
        return icons[crop] || '🌱';
    };

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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-medium text-sm shadow-sm ${activeTab === 'google' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'}`}
                    >
                        <AILogo className={`w-4 h-4 ${activeTab === 'google' ? 'text-white' : 'text-indigo-600'}`} />
                        <span>Assistant</span>
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" onClick={() => onTabChange('home')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </button>

                    {/* Three Dots Menu */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                if (!isMenuOpen) setActiveSubmenu('main');
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                {activeSubmenu === 'main' ? (
                                    <div className="p-1">
                                        <button
                                            onClick={() => setActiveSubmenu('language')}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors rounded-lg flex items-center justify-between text-slate-700"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>🌐</span>
                                                <span>Language</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">▶</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                alert("Help feature coming soon!");
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors rounded-lg flex items-center gap-2 text-slate-700"
                                        >
                                            <span>❓</span>
                                            <span>Help</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                alert("Feedback feature coming soon!");
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors rounded-lg flex items-center gap-2 text-slate-700"
                                        >
                                            <span>💬</span>
                                            <span>Feedback</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-1">
                                        <button
                                            onClick={() => setActiveSubmenu('main')}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors rounded-lg flex items-center gap-2 text-slate-500 font-medium mb-1 border-b border-slate-100 pb-2"
                                        >
                                            <span>◀</span>
                                            <span>Back</span>
                                        </button>
                                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar pt-1">
                                            {languageOptions.map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        setLanguage(lang.code as any);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors rounded-lg flex items-center gap-2 ${language === lang.code ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700'
                                                        }`}
                                                >
                                                    <span className="text-base">{lang.flag}</span>
                                                    <span>{lang.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24 space-y-6">

                {/* Dynamically render content based on activeTab */}
                {activeTab === 'home' && (
                    <>

                        {/* Crops Horizontal Scroll */}
                        <div className="px-4">
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {displayPlants.map((crop, i) => (
                                    <div key={crop} className="flex flex-col items-center gap-2 min-w-[72px]">
                                        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2">
                                            {/* Placeholder Icons based on crop names */}
                                            <span className="text-2xl">
                                                {getIcon(crop)}
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

                        {/* Advanced Weather & Spraying Widget */}
                        <div className="px-6 pb-2 mt-2">
                            <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                                {/* Decorative background elements */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-40"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>

                                <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            {todayStr}
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-black text-slate-800">
                                                {weatherData ? Math.round(weatherData.current.temperature_2m) : '--'}°
                                            </span>
                                            <span className="text-sm font-medium text-slate-500 mb-1">
                                                {weatherData ? getWeatherDetails(weatherData.current.weather_code).label : 'Loading...'}
                                            </span>
                                        </div>
                                        {weatherData && (
                                            <div className="text-xs text-sky-700 mt-2 font-medium flex gap-3">
                                                <span>💧 {weatherData.current.relative_humidity_2m}%</span>
                                                <span>🌬️ {Math.round(weatherData.current.wind_speed_10m)} km/h</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white/60 rounded-2xl p-3 flex flex-col justify-center border border-white/80 shadow-sm backdrop-blur-sm relative overflow-hidden">
                                        {/* Highlight glow for spraying box */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent"></div>
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <span>🧪</span> Spray Fertilizer
                                            </div>
                                            <div className="font-bold text-emerald-900 leading-tight">
                                                {optimalSprayTime}
                                            </div>
                                            <div className="text-[10px] text-emerald-700 mt-0.5">
                                                {optimalSprayReason}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full day temperature timeline */}
                                <div className="relative z-10 w-full pt-4 border-t border-sky-100/60">
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Hourly Forecast & Conditions</div>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
                                        {weatherData && weatherData.hourly ? (
                                            [9, 12, 15, 18, 21].map((hourIndex, i) => {
                                                const temp = Math.round(weatherData.hourly.temperature_2m[hourIndex]);
                                                const wind = Math.round(weatherData.hourly.wind_speed_10m[hourIndex]);
                                                const code = weatherData.hourly.weather_code[hourIndex];
                                                const { icon } = getWeatherDetails(code);
                                                const timeLab = `${hourIndex}:00`;
                                                const highlight = optimalHours.includes(hourIndex);

                                                return (
                                                    <div key={i} className={`flex flex-col items-center flex-shrink-0 snap-center rounded-2xl p-2.5 min-w-[70px] ${highlight ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-2 ring-emerald-400 ring-offset-1 ring-offset-blue-50' : 'bg-white/70 text-slate-700 border border-white/80 shadow-sm'}`}>
                                                        <span className={`text-[10px] font-bold ${highlight ? 'text-emerald-50' : 'text-slate-500'}`}>{timeLab}</span>
                                                        <span className="text-xl my-1.5">{icon}</span>
                                                        <span className="text-sm font-bold">{temp}°</span>
                                                        <span className={`text-[8px] font-medium mt-1 ${highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{wind} km/h</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            [
                                                { time: '09:00', temp: '--°', icon: '⏳', wind: '-- km/h', highlight: optimalHours.includes(9) },
                                                { time: '12:00', temp: '--°', icon: '⏳', wind: '-- km/h', highlight: optimalHours.includes(12) },
                                                { time: '15:00', temp: '--°', icon: '⏳', wind: '-- km/h', highlight: optimalHours.includes(15) },
                                                { time: '18:00', temp: '--°', icon: '⏳', wind: '-- km/h', highlight: optimalHours.includes(18) },
                                                { time: '21:00', temp: '--°', icon: '⏳', wind: '-- km/h', highlight: optimalHours.includes(21) },
                                            ].map((slot, i) => (
                                                <div key={i} className={`flex flex-col items-center flex-shrink-0 snap-center rounded-2xl p-2.5 min-w-[70px] ${slot.highlight ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-2 ring-emerald-400 ring-offset-1 ring-offset-blue-50' : 'bg-white/70 text-slate-700 border border-white/80 shadow-sm'}`}>
                                                    <span className={`text-[10px] font-bold ${slot.highlight ? 'text-emerald-50' : 'text-slate-500'}`}>{slot.time}</span>
                                                    <span className="text-xl my-1.5">{slot.icon}</span>
                                                    <span className="text-sm font-bold">{slot.temp}</span>
                                                    <span className={`text-[8px] font-medium mt-1 ${slot.highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{slot.wind}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Permission */}
                        {locationStatus !== 'granted' && (
                            <div className="mx-6 p-4 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between transition-all animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                                        {locationStatus === 'loading' ? (
                                            <div className="w-4 h-4 border-2 border-sky-400 border-t-sky-600 rounded-full animate-spin"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.08 19.08 0 002.274 1.765c.311.192.571.337.757.433.092.047.186.095.281.14l.018.008.006.003h.002zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-600 leading-tight">
                                        {locationStatus === 'loading' ? "Detecting location..." : locationStatus === 'denied' ? "Location access denied" : "Allow location access to see weather info"}
                                    </div>
                                </div>
                                {locationStatus !== 'loading' && (
                                    <button
                                        onClick={requestLocation}
                                        className="text-sm font-bold text-blue-600 px-3 py-1 hover:bg-blue-50 rounded-lg"
                                    >
                                        {locationStatus === 'denied' ? "Retry" : "Allow"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Hero Section - Diagnosis */}
                        <div className="mx-6 mt-4 flex flex-col items-center text-center relative">

                            {/* App Icon Image Mockup */}
                            <div className="relative w-48 h-48 mb-6 animate-float">
                                {/* Background blobs */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-200/60 rounded-full blur-2xl"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-300/40 rounded-full blur-xl animate-pulse"></div>

                                {/* The plant app image */}
                                <img
                                    src="/images/app-icon.svg"
                                    alt="Plant Guardian App"
                                    className="w-full h-full relative z-10 object-contain drop-shadow-2xl"
                                />
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
                    </>
                )}

                {activeTab === 'google' && (
                    <div className="px-6 h-full flex items-center pt-8">
                        <GoogleAssist />
                    </div>
                )}

                {activeTab === 'camera' && (
                    <div className="px-6 pb-20">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Scanner</h2>
                        {children}
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="px-6 pb-20">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Upload Image</h2>
                        {children}
                    </div>
                )}

                {activeTab === 'garden' && (
                    <div className="px-6 pb-20">
                        {children}
                    </div>
                )}

                {activeTab === 'community' && (
                    <div className="pb-20">
                        {children}
                    </div>
                )}
                {activeTab === 'market' && (
                    <div className="pb-20 h-full">
                        {children}
                    </div>
                )}

                {activeTab === 'shops' && (
                    <div className="pb-20 h-full">
                        {children}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="pb-20 h-full">
                        {children}
                    </div>
                )}
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
                    onClick={() => onTabChange('community')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'community' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <div className={`p-1 rounded-full ${activeTab === 'community' ? 'bg-blue-50' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'community' ? 2.5 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium">Community</span>
                </button>

                <button
                    onClick={() => onTabChange('market')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'market' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <div className={`p-1 rounded-full ${activeTab === 'market' ? 'bg-blue-50' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'market' ? 2.5 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.197 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium">Market</span>
                </button>

                <button
                    onClick={() => onTabChange('shops')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'shops' ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                    <div className={`p-1 rounded-full ${activeTab === 'shops' ? 'bg-emerald-50' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeTab === 'shops' ? 2.5 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.197 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium">Shops</span>
                </button>

                <button
                    onClick={() => onTabChange('profile')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
                >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center overflow-hidden ${activeTab === 'profile' ? 'border-blue-500 bg-blue-100' : 'bg-slate-200 border-slate-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full translate-y-1 ${activeTab === 'profile' ? 'text-blue-500' : 'text-slate-400'}`}>
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium">You</span>
                </button>
            </nav>
        </div>
    );
}
