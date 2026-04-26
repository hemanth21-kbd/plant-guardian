"use client";
import React, { useState, useEffect, Suspense, lazy } from "react";
import CameraFeed from "@/components/CameraFeed";
import ImageUpload from "@/components/ImageUpload";
import DiseaseInfo from "@/components/DiseaseInfo";
import AILogo from "@/components/icons/AILogo";
import DashboardUI from "@/components/DashboardUI";
import PlantSelection from "@/components/PlantSelection";
import axios from "axios";
import { API_BASE_URL } from "@/config";

import Garden from "@/components/Garden";
import Community from "@/components/Community";
import Market from "@/components/Market";
import Profile from "@/components/Profile";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageOptions } from "@/utils/translations";
import { Toaster, toast } from "react-hot-toast";

// Dynamically import ShopMap to avoid SSR issues with Leaflet
import dynamic from 'next/dynamic';
const Shops = dynamic(() => import('@/components/Shops'), { ssr: false });

// Global axios interceptor for tunnel bypass
axios.interceptors.request.use(config => {
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

export default function Home() {
  const { t, language, setLanguage } = useLanguage();

  // App State: 'selection' -> 'main'
  const [view, setView] = useState<'selection' | 'main'>('selection');

  // App Data
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "camera" | "upload" | "garden" | "community" | "market" | "shops" | "profile">("home");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    // Wake up the backend server immediately in case Render put it to sleep
    fetch(`${API_BASE_URL}/`).catch(() => {});

    // Check for existing state
    const storedPlants = localStorage.getItem('selectedPlants');

    if (storedPlants) {
      setSelectedPlants(JSON.parse(storedPlants));
      setView('main');
    } else {
      setView('selection');
    }

    // Optional Keep-Alive local interval (pings every 10 minutes while app is open)
    const keepAlive = setInterval(() => {
        fetch(`${API_BASE_URL}/`).catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(keepAlive);
  }, []);

  const handleSelectionComplete = (plants: string[]) => {
    setSelectedPlants(plants);
    localStorage.setItem('selectedPlants', JSON.stringify(plants));
    setView('main');
  };

  const handleCapture = async (imageSrc: string) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          "Bypass-Tunnel-Reminder": "true"
        },
      });
      setResult(response.data);
      toast.success("Analysis complete!", { icon: "🌿" });

      // Save to scan history
      const newHistory = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          plant_name: response.data.plant_name,
          disease_name: response.data.disease_name
      };
      const existingHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      localStorage.setItem('scanHistory', JSON.stringify([newHistory, ...existingHistory]));

    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
      toast.error("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // VIEW: SELECTION
  // ----------------------------------------------------------------------
  if (view === 'selection') {
    return <PlantSelection onComplete={handleSelectionComplete} />;
  }

  // ----------------------------------------------------------------------
  // VIEW: MAIN APP (Existing Logic)
  // ----------------------------------------------------------------------

  let tabContent = null;
  if (activeTab === "camera") {
    tabContent = <CameraFeed onCapture={handleCapture} />;
  } else if (activeTab === "upload") {
    tabContent = <ImageUpload onImageSelect={handleCapture} />;
  } else if (activeTab === "garden") {
    tabContent = <Garden />;
  } else if (activeTab === "community") {
    tabContent = <Community />;
  } else if (activeTab === "market") {
    tabContent = <Market />;
  } else if (activeTab === "shops") {
    tabContent = <Shops />;
  } else if (activeTab === "profile") {
    tabContent = <Profile />;
  }

  return (
    <DashboardUI
      activeTab={activeTab}
      onTabChange={(tab: any) => setActiveTab(tab)}
      onCameraTrigger={() => setActiveTab("camera")}
      userPlants={selectedPlants}
    >
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl min-h-[300px]">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-700 font-medium animate-pulse">Analyzing specimen...</p>
          </div>
        )}

        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
          {tabContent}
        </div>

        {error && (
          <div className="mt-4 animate-fade-in bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center shadow-sm">
            <span className="block font-bold mb-1">Diagnosis Failed</span>
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 bg-white border border-emerald-100 rounded-3xl p-6 shadow-xl shadow-emerald-900/5 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">
              Analysis Report
            </h2>
            <DiseaseInfo result={result} />
          </div>
        )}
        <Toaster position="top-center" />
      </div>
    </DashboardUI>
  );
}
