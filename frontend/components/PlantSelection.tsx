"use client";
import React, { useState } from 'react';

interface PlantSelectionProps {
    onComplete: (selectedPlants: string[]) => void;
}

const AVAILABLE_PLANTS = [
    { name: 'Apple', icon: '🍎', type: 'Fruit' },
    { name: 'Banana', icon: '🍌', type: 'Fruit' },
    { name: 'Mango', icon: '🥭', type: 'Fruit' },
    { name: 'Orange', icon: '🍊', type: 'Fruit' },
    { name: 'Grapes', icon: '🍇', type: 'Fruit' },
    { name: 'Bean', icon: '🫘', type: 'Vegetable' },
    { name: 'Cabbage', icon: '🥬', type: 'Vegetable' },
    { name: 'Cauliflower', icon: '🥦', type: 'Vegetable' },
    { name: 'Tomato', icon: '🍅', type: 'Vegetable' },
    { name: 'Rose', icon: '🌹', type: 'Flower' },
    { name: 'Carrot', icon: '🥕', type: 'Vegetable' },
    { name: 'Potato', icon: '🥔', type: 'Vegetable' },
    { name: 'Pepper', icon: '🫑', type: 'Vegetable' },
    { name: 'Corn', icon: '🌽', type: 'Crop' },
    { name: 'Wheat', icon: '🌾', type: 'Crop' },
    { name: 'Rice', icon: '🍚', type: 'Crop' },
];

export default function PlantSelection({ onComplete }: PlantSelectionProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const MIN_SELECTION = 3;

    const togglePlant = (plantName: string) => {
        if (selected.includes(plantName)) {
            setSelected(selected.filter(p => p !== plantName));
        } else {
            setSelected([...selected, plantName]);
        }
    };

    const handleContinue = () => {
        if (selected.length >= MIN_SELECTION) {
            onComplete(selected);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                        Select Your Garden
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Choose at least {MIN_SELECTION} plants or fruits you want to monitor.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {AVAILABLE_PLANTS.map((plant) => {
                        const isSelected = selected.includes(plant.name);
                        return (
                            <div
                                key={plant.name}
                                onClick={() => togglePlant(plant.name)}
                                className={`cursor-pointer group relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 backdrop-blur-md
                                    ${isSelected
                                        ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`text-4xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {plant.icon}
                                </div>
                                <span className={`font-medium ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                                    {plant.name}
                                </span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleContinue}
                        disabled={selected.length < MIN_SELECTION}
                        className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2
                            ${selected.length >= MIN_SELECTION
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg hover:shadow-emerald-500/30 hover:scale-105'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <span>Continue to Dashboard</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <p className="text-center text-slate-500 text-sm">
                    {selected.length} selected
                </p>
            </div>
        </div>
    );
}
