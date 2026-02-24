"use client";
import React, { useState } from 'react';

// Mock list of fertilizer shops
const NEARBY_SHOPS = [
    { id: 1, name: "Kisan Krishi Kendra", distance: "1.2 km", status: "Open Now", closesAt: "8:00 PM", address: "Main Road, Agri Circle", query: "Kisan+Krishi+Kendra" },
    { id: 2, name: "Green Earth Fertilizers", distance: "3.5 km", status: "Open Now", closesAt: "8:30 PM", address: "Near Old Bus Stand", query: "Fertilizer+Shop" },
    { id: 3, name: "National Agro Agency", distance: "5.0 km", status: "Closed", closesAt: "Opens 8:00 AM", address: "APMC Market Yard", query: "Agro+Agency" },
];

// Mock fertilizer and pesticide prices
const FERTILIZER_PRICES = [
    {
        id: 1, category: "Urea & Nitrogen", items: [
            { name: "Neem Coated Urea", brand: "IFFCO", weight: "45 kg bag", price: "₹266.50", trend: "stable", change: "0" },
            { name: "Ammonium Sulphate", brand: "GSFC", weight: "50 kg bag", price: "₹950", trend: "up", change: "+₹15" },
        ]
    },
    {
        id: 2, category: "Phosphorus & Potassium", items: [
            { name: "DAP (Diammonium Phosphate)", brand: "IFFCO", weight: "50 kg bag", price: "₹1,350", trend: "stable", change: "0" },
            { name: "MOP (Muriate of Potash)", brand: "IPL", weight: "50 kg bag", price: "₹1,700", trend: "down", change: "-₹20" },
            { name: "NPK 12:32:16", brand: "Gromor", weight: "50 kg bag", price: "₹1,470", trend: "up", change: "+₹10" }
        ]
    },
    {
        id: 3, category: "Organic & Bio-Fertilizers", items: [
            { name: "Vermicompost", brand: "Local", weight: "50 kg bag", price: "₹350", trend: "stable", change: "0" },
            { name: "City Compost", brand: "EcoFert", weight: "50 kg bag", price: "₹250", trend: "stable", change: "0" }
        ]
    }
];

export default function Shops() {
    const [activeTab, setActiveTab] = useState<'prices' | 'nearby'>('prices');

    return (
        <div className="flex flex-col h-full bg-[#f0f9ff] text-slate-800 font-sans pb-6">
            {/* Header Info */}
            <div className="px-6 pt-6 pb-2 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-sky-100 flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agri Shops</h2>
                <p className="text-xs text-slate-500 font-medium">Fertilizers & Pesticides</p>

                {/* Toggle between Prices and Nearby Shops */}
                <div className="flex bg-slate-100/80 p-1 rounded-xl mt-2 w-full">
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'prices' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Fertilizer Prices
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
                        {/* Mock Map View Element */}
                        <div className="w-full h-48 bg-sky-100 rounded-2xl border border-sky-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/12/2932/1559.png')] bg-cover bg-center mix-blend-multiply"></div>
                            <div className="relative z-10 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 border-4 border-white mb-2 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                                </svg>
                            </div>
                            <span className="relative z-10 font-bold text-slate-700 bg-white/80 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm shadow-sm border border-white">Finding closest shops...</span>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-slate-800">Shops within 5 km</h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{NEARBY_SHOPS.length} Found</span>
                        </div>

                        <div className="space-y-3">
                            {NEARBY_SHOPS.map(shop => (
                                <div key={shop.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="pr-4">
                                            <h4 className="font-bold text-slate-800 text-base">{shop.name}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{shop.address}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-bold text-blue-600 text-sm">{shop.distance}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${shop.status === 'Open Now' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            <span className={`text-xs font-bold ${shop.status === 'Open Now' ? 'text-emerald-700' : 'text-red-600'}`}>{shop.status}</span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-500">[{shop.closesAt}]</span>
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.query}`, '_blank', 'noopener,noreferrer')}
                                            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg ml-auto transition-colors"
                                        >
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
                                placeholder="Search urea, DAP, compost..."
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-3.5 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>

                        {FERTILIZER_PRICES.map(category => (
                            <div key={category.id} className="space-y-3">
                                <h3 className="font-bold text-slate-800 border-l-4 border-emerald-500 pl-3">{category.category}</h3>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {category.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3 w-1/2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm whitespace-normal">{item.name}</span>
                                                    <div className="flex gap-2 items-center mt-0.5">
                                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">{item.brand}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{item.weight}</span>
                                                    </div>
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
