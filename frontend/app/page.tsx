"use client";
import React, { useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import ImageUpload from "@/components/ImageUpload";
import DiseaseInfo from "@/components/DiseaseInfo";
import GoogleAssist from "@/components/GoogleAssist";
import AILogo from "@/components/icons/AILogo";
import axios from "axios";
import { API_BASE_URL } from "@/config";

import Garden from "@/components/Garden";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageOptions } from "@/utils/translations";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "google" | "garden">("camera");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

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

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* ... decorative ... */}

      <div className="max-w-4xl w-full relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 relative">
          {/* Language Switcher */}
          {/* Language Switcher */}
          <div className="absolute top-0 right-0 z-50 text-left">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium text-slate-300 backdrop-blur-md"
            >
              <span>🌐</span>
              <span>{languageOptions.find(l => l.code === language)?.name || 'Language'}</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 max-h-[300px] overflow-y-auto bg-[#1a1c23] border border-emerald-500/20 rounded-xl shadow-2xl backdrop-blur-xl custom-scrollbar z-50">
                <div className="p-1">
                  {languageOptions.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors rounded-lg flex items-center gap-2 ${language === lang.code ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-300'
                        }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="inline-block p-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mb-4 mt-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-bold text-sm tracking-wider uppercase px-4">
              {t.appTitle}
            </span>
          </div>
          <h1 className="text-6xl font-bold text-white tracking-tight drop-shadow-lg">
            Plant <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Guardian</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Main Interface */}
        <div className="glass-panel rounded-3xl p-1 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 p-1 gap-1 bg-black/20 rounded-2xl mb-1">
            <button
              onClick={() => setActiveTab("camera")}
              className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === "camera"
                ? "bg-emerald-500/20 text-emerald-300 shadow-lg border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <span className="mr-2">📸</span> {t.tabs.camera}
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === "upload"
                ? "bg-blue-500/20 text-blue-300 shadow-lg border border-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <span className="mr-2">📤</span> {t.tabs.upload}
            </button>
            <button
              onClick={() => setActiveTab("google")}
              className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center ${activeTab === "google"
                ? "bg-amber-500/20 text-amber-300 shadow-lg border border-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <AILogo className="w-5 h-5 mr-2" /> {t.tabs.assist}
            </button>
            <button
              onClick={() => setActiveTab("garden")}
              className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center ${activeTab === "garden"
                ? "bg-purple-500/20 text-purple-300 shadow-lg border border-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <span className="mr-2">🌿</span> {t.tabs.garden}
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 min-h-[500px] flex flex-col justify-center bg-black/20 rounded-2xl m-1 border border-white/5 relative">
            {loading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-400 font-medium animate-pulse">Analyzing specimen...</p>
              </div>
            )}

            <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
              {activeTab === "camera" ? (
                <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                  <CameraFeed onCapture={handleCapture} />
                </div>
              ) : activeTab === "upload" ? (
                <ImageUpload onImageSelect={handleCapture} />
              ) : activeTab === "google" ? (
                <GoogleAssist />
              ) : (
                <Garden />
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="animate-fade-in bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-center backdrop-blur-md">
            <span className="block font-bold text-red-400 mb-1">Diagnosis Failed</span>
            {error}
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="animate-fade-in glass-panel rounded-3xl p-8 border-t-4 border-t-emerald-500 shadow-2xl shadow-emerald-900/20">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 border-b border-white/10 pb-4">
              Analysis Report
            </h2>
            <DiseaseInfo result={result} />
          </div>
        )}
      </div>
    </main>
  );
}
