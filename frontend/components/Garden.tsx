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
            fetchPlants(userData.user_id);
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
                user_id: user.user_id,
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
            fetchPlants(user.user_id);
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

            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white">🌿 {user.username}'s Garden</h2>
                    <p className="text-slate-400 text-sm">Managing {plants.length} plants</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-900/20 font-medium"
                    >
                        {showAddForm ? 'Cancel' : '+ Add Plant'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-white/10"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {showAddForm && (
                // ... Existing Add Form
                <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl border border-white/10 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Add New Plant</h3>
                    <form onSubmit={handleAddPlant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Plant Name (e.g. Big Tomato)"
                            className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                            value={newPlantName}
                            onChange={(e) => setNewPlantName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Species (e.g. Tomato)"
                            className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                            value={newPlantSpecies}
                            onChange={(e) => setNewPlantSpecies(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                            value={newPlantDate}
                            onChange={(e) => setNewPlantDate(e.target.value)}
                            required
                        />
                        <button type="submit" className="bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-400 transition-colors">
                            Plant It!
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-emerald-400 animate-pulse">Loading garden...</div>
            ) : plants.length === 0 ? (
                <div className="text-center py-12 bg-black/10 rounded-xl border-dashed border-2 border-white/10 text-slate-400">
                    <p className="text-xl">Your garden is empty 🌱</p>
                    <p className="text-sm mt-2">Add your first plant to start tracking!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plants.map((plant) => (
                        <div key={plant.id} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-900/10">
                            <div className="h-40 bg-slate-800 relative overflow-hidden">
                                <img
                                    src={plant.image_url || getPlaceholderImage(plant.species)}
                                    alt={plant.plant_name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = getPlaceholderImage('Plant');
                                    }}
                                />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                    {plant.species}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-1">{plant.plant_name}</h3>
                                <p className="text-slate-400 text-sm mb-4">Planted: {plant.date_planted}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedPlantForHistory(plant)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2 rounded-lg transition-colors border border-white/10"
                                    >
                                        History
                                    </button>
                                    <button
                                        onClick={() => handleDeletePlant(plant.id)}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm px-3 py-2 rounded-lg transition-colors border border-red-500/20"
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
