"use client";
import React, { useState, useEffect } from "react";
import CameraFeed from "@/components/CameraFeed";
import ImageUpload from "@/components/ImageUpload";
import DiseaseInfo from "@/components/DiseaseInfo";
import GoogleAssist from "@/components/GoogleAssist";
import AILogo from "@/components/icons/AILogo";
import DashboardUI from "@/components/DashboardUI";
import AuthForm from "@/components/AuthForm";
import PlantSelection from "@/components/PlantSelection";
import axios from "axios";
import { API_BASE_URL } from "@/config";

import Garden from "@/components/Garden";
import Community from "@/components/Community";
import Market from "@/components/Market";
import Shops from "@/components/Shops";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageOptions } from "@/utils/translations";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();

  // App State: 'auth' -> 'selection' -> 'main'
  const [view, setView] = useState<'auth' | 'selection' | 'main'>('auth');

  // User Data
  const [user, setUser] = useState<any>(null);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "camera" | "upload" | "google" | "garden" | "community" | "market" | "shops">("home");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const storedPlants = localStorage.getItem('selectedPlants');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedPlants) {
        setSelectedPlants(JSON.parse(storedPlants));
        setView('main');
      } else {
        setView('selection');
      }
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setView('selection');
  };

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
          "Content-Type": "multipart/form-data",
          "Bypass-Tunnel-Reminder": "true"
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // VIEW: AUTHENTICATION
  // ----------------------------------------------------------------------
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="hidden md:block space-y-6">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Grow Smarter with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Plant Guardian</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Your AI-powered assistant for healthy crops and bountiful harvests.
              Detect diseases, manage your garden, and get expert advice instantly.
            </p>

            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <span>🌱</span> <span>Instant Diagnosis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <span>🌦️</span> <span>Real-time Alerts</span>
              </div>
            </div>
          </div>

          <AuthForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

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
      </div>
    </DashboardUI>
  );
}
