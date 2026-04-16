"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Shop {
    id: number;
    name: string;
    distance: string;
    lat: number;
    lon: number;
    address: string;
}

const MOCK_FERTILIZERS = [
    { name: "Urea", image: "https://images.unsplash.com/photo-1588612502604-ee9c6fbda818?auto=format&fit=crop&q=80&w=150&h=150" },
    { name: "DAP", image: "https://images.unsplash.com/photo-1598282361664-88481ff23b36?auto=format&fit=crop&q=80&w=150&h=150" },
    { name: "NPK", image: "https://images.unsplash.com/photo-1588612502604-ee9c6fbda818?auto=format&fit=crop&q=80&w=150&h=150" },
    { name: "Vermicompost", image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=150&h=150" }
];

export default function Shops() {
    const [activeTab, setActiveTab] = useState<'prices' | 'nearby'>('prices');
    const [shops, setShops] = useState<Shop[]>([]);
    const [loadingShops, setLoadingShops] = useState(false);
    const [location, setLocation] = useState<{lat: number; lon: number} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [livePrice, setLivePrice] = useState<any>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    useEffect(() => {
        getUserLocation();
    }, []);

    const getUserLocation = async () => {
        try {
            const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const ipData = await ipRes.json();
            const userLoc = { lat: ipData.latitude, lon: ipData.longitude };
            setLocation(userLoc);
            fetchNearbyShops(userLoc.lat, userLoc.lon);
        } catch (error) {
            console.error("Failed to get location:", error);
        }
    };

    const fetchNearbyShops = async (lat: number, lon: number) => {
        setLoadingShops(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/places/nearby-shops`, {
                params: { lat, lon, radius: 5000 },
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            if (res.data.shops && res.data.shops.length > 0) {
                setShops(res.data.shops);
            }
        } catch (error) {
            console.error("Failed to fetch shops:", error);
        } finally {
            setLoadingShops(false);
        }
    };

    const searchLivePrice = async () => {
        if (!searchTerm.trim()) return;
        setLoadingPrice(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/places/fertilizer-price`, {
                params: { fertilizer: searchTerm },
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            setLivePrice(res.data);
        } catch (error) {
            console.error("Failed to fetch price:", error);
        } finally {
            setLoadingPrice(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f0f9ff] text-slate-800 font-sans pb-6">
            <div className="px-6 pt-6 pb-2 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-sky-100 flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agri Shops</h2>
                <p className="text-xs text-slate-500 font-medium">Fertilizers & Pesticides</p>

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
                        Nearby Shops
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-6">

                {activeTab === 'nearby' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="w-full h-48 bg-sky-100 rounded-2xl border border-sky-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/12/2932/1559.png')] bg-cover bg-center mix-blend-multiply"></div>
                            <div className="relative z-10 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 border-4 border-white mb-2 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                                </svg>
                            </div>
                            <span className="relative z-10 font-bold text-slate-700 bg-white/80 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm shadow-sm border border-white">
                                {loadingShops ? "Finding shops..." : location ? "Real shops near you" : "Location required"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-slate-800">Shops within 5 km</h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                {shops.length} Found
                            </span>
                        </div>

                        <div className="space-y-3">
                            {shops.length > 0 ? shops.map((shop) => (
                                <div key={shop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="h-32 w-full bg-slate-200 relative">
                                        <img src="https://images.unsplash.com/photo-1595991209266-5ff5a3a2f1ab?auto=format&fit=crop&q=80&w=400&h=200" alt={shop.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                                            <div className="font-bold text-white text-xs">{shop.distance}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="pr-2">
                                                <h4 className="font-bold text-slate-800 text-lg leading-tight">{shop.name}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">{shop.address || "Nearby"}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-xs font-bold text-emerald-700">Open Now</span>
                                            </div>
                                            <button
                                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lon}`, '_blank')}
                                                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg ml-auto transition-colors shadow-sm"
                                            >
                                                Directions
                                            </button>
                                        </div>

                                        <div className="pt-2">
                                            <span className="text-xs font-bold text-slate-600 mb-2 block">Available Stock:</span>
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                                {MOCK_FERTILIZERS.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="flex flex-col items-center gap-1 min-w-[60px]">
                                                        <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="text-[10px] text-center font-semibold text-slate-600 leading-tight">{item.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No shops found in this area.</p>
                                    <p className="text-xs mt-2">Try expanding your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'prices' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="relative flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchLivePrice()}
                                placeholder="Search fertilizer (e.g., Urea, DAP, NPK)..."
                                className="flex-1 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <button
                                onClick={searchLivePrice}
                                disabled={loadingPrice}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                            >
                                {loadingPrice ? '...' : 'Search'}
                            </button>
                        </div>

                        {livePrice && (
                            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-4 rounded-2xl border border-blue-100">
                                <h4 className="font-bold text-slate-800 mb-2">{livePrice.fertilizer}</h4>
                                {livePrice.price_data ? (
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black text-blue-600">
                                            ₹{livePrice.price_data.price || 'Varies'}
                                            <span className="text-sm font-normal text-slate-500">/{livePrice.price_data.unit || '50kg'}</span>
                                        </p>
                                        {livePrice.price_data.brand && (
                                            <p className="text-xs text-slate-600">Brand: {livePrice.price_data.brand}</p>
                                        )}
                                        <p className="text-xs text-slate-500">Source: {livePrice.source}</p>
                                    </div>
                                ) : (
                                    <p className="text-slate-600">{livePrice.error || 'Unable to fetch price'}</p>
                                )}
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                            <p className="text-sm text-amber-800 font-medium">
                                💡 Search for specific fertilizers to get live prices via AI!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}