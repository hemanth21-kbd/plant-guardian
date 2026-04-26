"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'main' | 'edit' | 'history' | 'terms'>('main');
    const [editForm, setEditForm] = useState({ username: '', email: '' });
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setEditForm({ username: parsed.username || '', email: parsed.email || '' });
        }
    }, []);



    const loadHistory = () => {
        setHistory(JSON.parse(localStorage.getItem('scanHistory') || '[]'));
        setViewMode('history');
    };

    const handleSaveProfile = () => {
        const updatedUser = { ...user, ...editForm };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success("Profile updated!");
        setViewMode('main');
    };



    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">👤</div>
                <h2 className="text-xl font-bold text-slate-800">Not Logged In</h2>
            </div>
        );
    }

    if (viewMode === 'edit') {
        return (
            <div className="p-6 h-full bg-[#f8fafc] overflow-y-auto">
                <button onClick={() => setViewMode('main')} className="mb-4 text-emerald-600 font-bold flex items-center gap-1">
                    ◀ Back
                </button>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Name</label>
                        <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full border p-3 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
                        <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full border p-3 rounded-lg" />
                    </div>
                    <button onClick={handleSaveProfile} className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-bold p-3 rounded-lg mt-4 shadow-md shadow-emerald-500/20">Save Changes</button>
                </div>
            </div>
        );
    }



    if (viewMode === 'history') {
        return (
            <div className="p-6 h-full bg-[#f8fafc] overflow-y-auto">
                <button onClick={() => setViewMode('main')} className="mb-4 text-emerald-600 font-bold flex items-center gap-1">◀ Back</button>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Disease Scan History</h2>
                {history.length === 0 ? <p className="text-slate-500">No previous scans found.</p> : history.map((h: any) => (
                    <div key={h.id} className="bg-white p-4 rounded-xl border mb-3 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-700">{h.plant_name}</p>
                            <p className="text-sm text-rose-600 font-medium">{h.disease_name}</p>
                        </div>
                        <p className="text-xs text-slate-400">{h.date}</p>
                    </div>
                ))}
            </div>
        );
    }

    if (viewMode === 'terms') {
        return (
            <div className="p-6 h-full bg-[#f8fafc] overflow-y-auto pb-20">
                <button onClick={() => setViewMode('main')} className="mb-4 text-emerald-600 font-bold flex items-center gap-1">◀ Back</button>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Terms & Conditions</h2>
                <div className="bg-white p-6 border rounded-2xl text-sm text-slate-600 space-y-4 shadow-sm">
                    <p><strong>1. Introduction</strong><br/>Welcome to PlantGuardian. By using our application, you agree to comply with and be bound by these terms.</p>
                    <p><strong>2. Use of Service</strong><br/>The application provides educational and AI-assisted crop diagnosis functionalities. We provide no guarantee and cannot be held liable for crop loss or damages resulting from actions taken based on app data.</p>
                    <p><strong>3. Privacy Policy</strong><br/>We prioritize your data privacy. Profile settings and scanning histories are predominantly stored locally on your device unless explicitly backed up to our servers upon login.</p>
                    <p><strong>4. Support and Maintenance</strong><br/>We offer specialized help to address your concerns. Reach us through the 'Help & Support' option within the profile section.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 font-sans pb-6">
            {/* Header / Profile Summary */}
            <div className="px-6 pt-10 pb-6 bg-white border-b border-slate-100 flex flex-col items-center shadow-sm relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-70"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-70"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden mb-3">
                        {/* Placeholder Avatar */}
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt="Farmer Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.username}</h2>
                    <p className="text-sm font-medium text-slate-500">{user.email}</p>

                    <div className="mt-3 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-600">
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-bold text-emerald-700">Verified Farmer</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-6">

                {/* Account & Activity */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3">My Account</h3>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">

                        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">My Farm / Crops</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>



                        <button onClick={loadHistory} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Disease Scan History</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3">Preferences</h3>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">

                        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                                    <span>🌐</span>
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-sm font-semibold text-slate-700">App Language</span>
                                    <span className="text-[10px] text-slate-400 font-medium">English</span>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>

                        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Notifications</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Enabled</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                            </div>
                        </button>

                        <button onClick={() => setViewMode('edit')} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Edit Profile</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                    </div>
                </div>

                {/* Support & About */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3">Support & Legal</h3>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">

                        <button onClick={() => window.location.href = "mailto:support@plantguardian.com?subject=Help%20and%20Support"} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Help & Support</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>

                        <button onClick={() => setViewMode('terms')} className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">Terms & Privacy Policy</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>

                        <button className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-sm font-semibold text-slate-700">About PlantGuardian</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Version 2.0.4</span>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                    <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3.5 rounded-xl transition-colors border border-slate-100 flex items-center justify-center gap-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                        About Developer
                    </button>
                </div>

                <p className="text-center text-[10px] text-slate-400 font-medium pt-2 pb-6">
                    Made with ❤️ for Farmers
                </p>

            </div>
        </div>
    );
}
