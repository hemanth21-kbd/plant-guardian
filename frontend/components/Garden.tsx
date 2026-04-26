"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AuthForm from './AuthForm';
import { getPlaceholderImage } from '../utils/imageUtils';
import PlantHistoryModal from './PlantHistoryModal';

interface UserPlant {
    id: number;
    plant_name: string;
    species: string;
    date_planted: string;
    image_url?: string;
}

export default function Garden() {
    const [user, setUser] = useState<any>(null);
    const [plants, setPlants] = useState<UserPlant[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedPlantForHistory, setSelectedPlantForHistory] = useState<UserPlant | null>(null);

    // Form State
    const [newPlantName, setNewPlantName] = useState('');
    const [newPlantSpecies, setNewPlantSpecies] = useState('');
    const [newPlantDate, setNewPlantDate] = useState('');

    useEffect(() => {
        // Check for logged in user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            fetchPlants(userData.user_id || userData.id);
        }
    }, []);

    const fetchPlants = async (userId: number) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/my-garden/${userId}`, {
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            setPlants(res.data);
        } catch (err) {
            console.error("Failed to fetch garden", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await axios.post(`${API_BASE_URL}/my-garden/add`, {
                user_id: user.user_id || user.id,
                plant_name: newPlantName,
                species: newPlantSpecies,
                date_planted: newPlantDate,
                image_url: `https://source.unsplash.com/random/300x300/?${newPlantSpecies},plant`
            }, {
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            setShowAddForm(false);
            setNewPlantName('');
            setNewPlantSpecies('');
            setNewPlantDate('');
            fetchPlants(user.user_id || user.id);
        } catch (err) {
            console.error("Failed to add plant", err);
            alert("Failed to add plant.");
        }
    };

    const handleDeletePlant = async (plantId: number) => {
        if (!confirm("Are you sure you want to remove this plant from your garden?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/my-garden/${plantId}`, {
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            setPlants(plants.filter(p => p.id !== plantId));
        } catch (err) {
            console.error("Failed to delete plant", err);
            alert("Failed to delete plant.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setPlants([]);
    };

    if (!user) {
        return <AuthForm onLoginSuccess={(u) => { setUser(u); fetchPlants(u.user_id || u.id); }} />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* ... Header and Add Form ... */}

            {/* History Modal */}
            {selectedPlantForHistory && (
                <PlantHistoryModal
                    plantId={selectedPlantForHistory.id}
                    plantName={selectedPlantForHistory.plant_name}
                    onClose={() => setSelectedPlantForHistory(null)}
                />
            )}

            <div className="flex justify-between items-center bg-white shadow-sm p-4 rounded-xl border border-slate-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">🌿 {user.username}'s Garden</h2>
                    <p className="text-slate-500 text-sm">Managing {plants.length} plants</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md font-medium"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Plant'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg transition-colors border border-slate-200 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {showAddForm && (
                // ... Existing Add Form
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Plant</h3>
                    <form onSubmit={handleAddPlant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Plant Name (e.g. Big Tomato)"
                            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                            value={newPlantName}
                            onChange={(e) => setNewPlantName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Species (e.g. Tomato)"
                            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                            value={newPlantSpecies}
                            onChange={(e) => setNewPlantSpecies(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-500"
                            value={newPlantDate}
                            onChange={(e) => setNewPlantDate(e.target.value)}
                            required
                        />
                        <button type="submit" className="bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-md pt-3 pb-3 my-[2px]">
                            Plant It!
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-emerald-400 animate-pulse">Loading garden...</div>
            ) : plants.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-dashed border-2 border-slate-300 text-slate-500 shadow-sm">
                    <p className="text-xl font-semibold mb-2 text-slate-700">Your garden is empty 🌱</p>
                    <p className="text-sm">Add your first plant to start checking its history, comparing photos, and getting AI disease logging on it!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plants.map((plant) => (
                        <div key={plant.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-all hover:shadow-lg">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                <img
                                    src={plant.image_url || getPlaceholderImage(plant.species)}
                                    alt={plant.plant_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = getPlaceholderImage('Plant');
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-white/90 shadow-sm px-2 py-1 rounded-lg text-xs font-bold text-emerald-700 border border-emerald-200">
                                    {plant.species}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-slate-800 mb-1">{plant.plant_name}</h3>
                                <p className="text-slate-500 text-sm mb-4 font-medium">Planted: {plant.date_planted}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedPlantForHistory(plant)}
                                        className="flex-1 bg-slate-50 hover:bg-emerald-50 text-emerald-700 text-sm font-semibold py-2 rounded-lg transition-colors border border-slate-200 hover:border-emerald-200"
                                    >
                                        View History & AI
                                    </button>
                                    <button
                                        onClick={() => handleDeletePlant(plant.id)}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 text-sm px-3 py-2 rounded-lg transition-colors border border-red-100 hover:border-red-200"
                                        title="Remove Plant"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
