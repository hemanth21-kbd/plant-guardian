"use client";
import React, { useState } from 'react';

// Mock list of nearby markets
const NEARBY_MARKETS = [
    { id: 1, name: "Central APMC Market", distance: "2.4 km", status: "Open Now", closesAt: "9:00 PM", type: "Wholesale" },
    { id: 2, name: "Green Valley Farmers Market", distance: "4.1 km", status: "Open Now", closesAt: "7:00 PM", type: "Retail & Wholesale" },
    { id: 3, name: "City Center Agro Hub", distance: "7.8 km", status: "Closed", closesAt: "Opens 5:00 AM", type: "Wholesale" },
];

// Mock daily prices
const DAILY_PRICES = [
    {
        id: 1, category: "Vegetables", items: [
            { name: "Tomato", variety: "Hybrid", price: "₹35 / kg", trend: "up", change: "+₹2" },
            { name: "Onion", variety: "Red Big", price: "₹28 / kg", trend: "stable", change: "0" },
            { name: "Potato", variety: "Regular", price: "₹22 / kg", trend: "down", change: "-₹1" },
            { name: "Cauliflower", variety: "Medium", price: "₹40 / pc", trend: "up", change: "+₹5" }
        ]
    },
    {
        id: 2, category: "Fruits", items: [
            { name: "Apple", variety: "Fuji", price: "₹140 / kg", trend: "stable", change: "0" },
            { name: "Banana", variety: "Robusta", price: "₹45 / dozen", trend: "up", change: "+₹3" },
            { name: "Mango", variety: "Alphonso", price: "₹350 / dozen", trend: "down", change: "-₹20" }
        ]
    },
    {
        id: 3, category: "Flowers", items: [
            { name: "Rose", variety: "Red Local", price: "₹120 / bundle", trend: "up", change: "+₹10" },
            { name: "Marigold", variety: "Orange", price: "₹60 / kg", trend: "stable", change: "0" }
        ]
    }
];

export default function Market() {
    const [activeTab, setActiveTab] = useState<'prices' | 'nearby'>('prices');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col h-full bg-[#f0f9ff] text-slate-800 font-sans pb-6">
            {/* Header Info */}
            <div className="px-6 pt-6 pb-2 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-sky-100 flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agri Market</h2>
                <p className="text-xs text-slate-500 font-medium">{today}</p>

                {/* Toggle between Prices and Nearby */}
                <div className="flex bg-slate-100/80 p-1 rounded-xl mt-2 w-full">
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'prices' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Daily Prices
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
                        {/* Mock Map View Element */}
                        <div className="w-full h-48 bg-sky-100 rounded-2xl border border-sky-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                            {/* Placeholder for actual GMaps iframe or map view */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/12/2932/1559.png')] bg-cover bg-center mix-blend-multiply"></div>
                            <div className="relative z-10 w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 border-4 border-white mb-2 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="relative z-10 font-bold text-slate-700 bg-white/80 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm shadow-sm border border-white">Finding closest APMC...</span>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-slate-800">Markets within 10 km</h3>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{NEARBY_MARKETS.length} Found</span>
                        </div>

                        <div className="space-y-3">
                            {NEARBY_MARKETS.map(market => (
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
                                            <div className={`w-2 h-2 rounded-full ${market.status === 'Open Now' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            <span className={`text-xs font-bold ${market.status === 'Open Now' ? 'text-emerald-700' : 'text-red-600'}`}>{market.status}</span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">[{market.closesAt}]</span>
                                        <button className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg ml-auto transition-colors">
                                            Directions
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'prices' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Search / Filter Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search crops, fruits, flowers..."
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-3.5 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>

                        {DAILY_PRICES.map(category => (
                            <div key={category.id} className="space-y-3">
                                <h3 className="font-bold text-slate-800 border-l-4 border-blue-500 pl-3">{category.category} Mandi Rates</h3>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {category.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{item.variety}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-slate-900 text-sm">{item.price}</span>
                                                <div className={`flex items-center gap-1 text-[10px] font-bold ${item.trend === 'up' ? 'text-red-500' : item.trend === 'down' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {item.trend === 'up' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" className="rotate-180 origin-center" /></svg>}
                                                    {item.trend === 'down' && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>}
                                                    {item.change !== "0" && <span>{item.change}</span>}
                                                    {item.change === "0" && <span>Stable</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
