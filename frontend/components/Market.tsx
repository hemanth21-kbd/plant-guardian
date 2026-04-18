"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '../config';
import AILogo from './icons/AILogo';

interface Market {
    id: number;
    name: string;
    distance: string;
    lat: number;
    lon: number;
    type: string;
}

export default function Market() {
    const [activeTab, setActiveTab] = useState<'prices' | 'nearby'>('prices');
    const [searchTerm, setSearchTerm] = useState('');
    const [aiResult, setAiResult] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loadingMarkets, setLoadingMarkets] = useState(false);
    const [location, setLocation] = useState<{lat: number; lon: number} | null>(null);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    useEffect(() => {
        getUserLocation();
    }, []);

    const getUserLocation = async () => {
        try {
            const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const ipData = await ipRes.json();
            const userLoc = { lat: ipData.latitude, lon: ipData.longitude };
            setLocation(userLoc);
            fetchNearbyMarkets(userLoc.lat, userLoc.lon);
        } catch (error) {
            console.error("Failed to get location:", error);
        }
    };

    const fetchNearbyMarkets = async (lat: number, lon: number) => {
        setLoadingMarkets(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/places/nearby-markets`, {
                params: { lat, lon, radius: 30000 },
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            if (res.data.markets && res.data.markets.length > 0) {
                setMarkets(res.data.markets);
            }
        } catch (error) {
            console.error("Failed to fetch markets:", error);
        } finally {
            setLoadingMarkets(false);
        }
    };

    const searchLivePrice = async () => {
        if (!searchTerm.trim() || searchTerm.length < 2) return;
        setAiLoading(true);
        setAiResult('');
        
        try {
            const res = await axios.get(`${API_BASE_URL}/places/live-price`, {
                params: { comparison: searchTerm },
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            
            if (res.data.price_data) {
                const pd = res.data.price_data;
                setAiResult(`**${res.data.commodity}**\n\n💰 Price: ₹${pd.price || 'Varies'}/${pd.unit || 'kg'}\n📍 Market: ${pd.market || 'Various'}\n📈 Trend: ${pd.trend || 'Stable'}`);
            } else {
                setAiResult("Unable to fetch live price. Please try again.");
            }
        } catch (error) {
            setAiResult("Failed to fetch price. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f0f9ff] text-slate-800 font-sans pb-6">
            <div className="px-6 pt-6 pb-2 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-sky-100 flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agri Market</h2>
                <p className="text-xs text-slate-500 font-medium">{today}</p>

                <div className="flex bg-slate-100/80 p-1 rounded-xl mt-2 w-full">
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'prices' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Live Prices
                    </button>
                    <button
                        onClick={() => setActiveTab('nearby')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'nearby' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Nearby Markets
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-6">

                {activeTab === 'nearby' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="w-full h-48 bg-sky-100 rounded-2xl border border-sky-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/12/2932/1559.png')] bg-cover bg-center mix-blend-multiply"></div>
                            <div className="relative z-10 w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 border-4 border-white mb-2 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="relative z-10 font-bold text-slate-700 bg-white/80 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm shadow-sm border border-white">
                                {loadingMarkets ? "Finding markets..." : location ? "Real markets near you" : "Location required"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-slate-800">Markets within 30 km</h3>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                {markets.length} Found
                            </span>
                        </div>

                        <div className="space-y-3">
                            {markets.length > 0 ? markets.map((market) => (
                                <div key={market.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-base">{market.name}</h4>
                                            <div className="text-xs text-slate-500 font-medium flex gap-2 mt-1">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{market.type}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-blue-600 text-sm">{market.distance}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-emerald-700">Open Now</span>
                                        </div>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${market.lat},${market.lon}`, '_blank')}
                                            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg ml-auto transition-colors"
                                        >
                                            Directions
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.243ZM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-700 font-bold mb-1">No markets found within 30 km</p>
                                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                        Try searching for crop prices using the Live Prices tab instead.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'prices' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="relative flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchLivePrice()}
                                placeholder="Search crops, fruits, vegetables (e.g., Tomato, Onion)..."
                                className="flex-1 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <button
                                onClick={searchLivePrice}
                                disabled={aiLoading || searchTerm.length < 2}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                            >
                                {aiLoading ? '...' : 'Search'}
                            </button>
                        </div>

                        {aiLoading && (
                            <div className="flex justify-center items-center gap-2 p-4 bg-blue-50 rounded-xl">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-blue-600 font-medium">Fetching live prices...</span>
                            </div>
                        )}

                        {aiResult && (
                            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <AILogo className="w-6 h-6 text-blue-600" />
                                <span className="font-bold text-slate-800">Live Market Prices</span>
                            </div>
                            <p className="text-sm text-slate-600">
                                Search for any crop, fruit, or vegetable to get real-time prices from Indian markets via AI!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}