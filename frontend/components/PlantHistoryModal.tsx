"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import CameraFeed from './CameraFeed';
import { useLanguage } from '../contexts/LanguageContext';

interface GardenLog {
    id: number;
    date: string;
    note: string;
    status: string;
    image_url?: string;
}

interface PlantHistoryModalProps {
    plantId: number;
    plantName: string;
    onClose: () => void;
}

export default function PlantHistoryModal({ plantId, plantName, onClose }: PlantHistoryModalProps) {
    const { language } = useLanguage();
    const [logs, setLogs] = useState<GardenLog[]>([]);
    const [loading, setLoading] = useState(false);

    // New Log Form
    const [note, setNote] = useState('');
    const [status, setStatus] = useState('Healthy');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    // Comparison State
    const [compareMode, setCompareMode] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
    const [isListening, setIsListening] = useState(false);

    // Analysis State
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [plantId]);

    const analyzeImage = async (imageFile: File) => {
        setAnalyzing(true);
        setAnalysisResult(null);
        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('language', language); // Pass language

            const res = await axios.post(`${API_BASE_URL}/predict`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Bypass-Tunnel-Reminder': 'true'
                }
            });
            setAnalysisResult(res.data);

            if (res.data.disease_name && !res.data.disease_name.toLowerCase().includes('healthy')) {
                setStatus('Sick');
            } else {
                setStatus('Healthy');
            }
        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setAnalyzing(false);
        }
    };

    // ... handleCameraCapture ...
    // ... fetchLogs ...

    // ... handleAddLog ...
    // Just putting helper here
    const toggleLogSelection = (logId: number) => {
        if (selectedLogs.includes(logId)) {
            setSelectedLogs(selectedLogs.filter(id => id !== logId));
        } else {
            if (selectedLogs.length < 2) {
                setSelectedLogs([...selectedLogs, logId]);
            }
        }
    };

    const startComparison = () => {
        if (selectedLogs.length === 2) {
            // We will render comparison view
        }
    };

    const handleCameraCapture = (imageSrc: string) => {
        // Convert Base64 to File
        const arr = imageSrc.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const capturedFile = new File([u8arr], "camera_capture.jpg", { type: mime });

        setFile(capturedFile);
        setShowCamera(false);
        analyzeImage(capturedFile);
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/my-garden/logs/${plantId}`, {
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            // Sort by date desc
            const sorted = res.data.sort((a: GardenLog, b: GardenLog) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setLogs(sorted);
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let imageUrl = null;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.url;
            }

            await axios.post(`${API_BASE_URL}/my-garden/logs/add`, {
                user_plant_id: plantId,
                date,
                note,
                status,
                image_url: imageUrl
            }, {
                headers: { "Bypass-Tunnel-Reminder": "true" }
            });
            setNote('');
            setStatus('Healthy');
            setFile(null); // Reset file
            fetchLogs();
        } catch (err) {
            console.error("Failed to add log", err);
            alert("Failed to add log");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">History: {plantName}</h2>
                        <p className="text-sm text-slate-500">Track growth and health updates</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {!compareMode ? (
                            <button
                                onClick={() => { setCompareMode(true); setSelectedLogs([]); }}
                                className="px-4 py-1.5 text-xs font-semibold border border-emerald-200 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                                Compare Photos
                            </button>
                        ) : (
                            <div className="flex gap-3 items-center">
                                <span className="text-xs font-semibold text-emerald-700">{selectedLogs.length}/2 Selected</span>
                                <button
                                    onClick={() => setCompareMode(false)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Comparison View Overlay */}
                    {compareMode && selectedLogs.length === 2 && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm animate-fade-in relative">
                            <h3 className="text-center text-emerald-800 font-bold mb-4">Growth Comparison</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {logs.filter(l => selectedLogs.includes(l.id)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(log => (
                                    <div key={log.id} className="space-y-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm shadow-slate-200">
                                        <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 relative">
                                            {log.image_url ? (
                                                <img src={log.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-medium">No Photo</div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-white/95 px-2 py-1 rounded shadow-sm text-xs text-slate-700 font-bold font-mono border border-slate-100">
                                                {log.date}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium text-center">{log.note}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => { setSelectedLogs([]); }}
                                className="absolute top-3 right-3 text-emerald-600 hover:text-emerald-800 text-xs font-bold bg-white px-2 py-1 rounded shadow-sm border border-emerald-100"
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* Add Log Form */}
                    {!compareMode && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-emerald-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                New Entry
                            </h3>
                            <form onSubmit={handleAddLog} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                                        <select
                                            value={status}
                                            onChange={e => setStatus(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                        >
                                            <option value="Healthy">Healthy 🟢</option>
                                            <option value="Flowering">Flowering 🌸</option>
                                            <option value="Fruiting">Fruiting 🍅</option>
                                            <option value="Sick">Sick / Pest ⚠️</option>
                                            <option value="Recovering">Recovering ❤️‍🩹</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Photo (Optional)</label>

                                    {showCamera ? (
                                        <div className="mb-4 bg-slate-900 rounded-xl overflow-hidden border border-emerald-500/50 shadow-md">
                                            <div className="flex justify-between items-center p-2 bg-slate-800">
                                                <span className="text-emerald-400 text-xs font-bold px-2 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                                    Camera Active
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCamera(false)}
                                                    className="bg-slate-700 text-white text-xs px-2 py-1 rounded hover:bg-slate-600 transition-colors"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                            <CameraFeed onCapture={handleCameraCapture} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        id="log-file-input"
                                                        onChange={e => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const f = e.target.files[0];
                                                                setFile(f);
                                                                analyzeImage(f); // Trigger analysis
                                                            }
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="log-file-input"
                                                        className={`flex items-center justify-center w-full p-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors shadow-sm ${file ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium' : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-400 font-medium'
                                                            }`}
                                                    >
                                                        <span className="text-sm truncate">
                                                            {file ? `📎 ${file.name}` : '📁 Upload Image'}
                                                        </span>
                                                    </label>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCamera(true)}
                                                    className="px-4 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-200 transition-colors shadow-sm"
                                                    title="Use Camera"
                                                >
                                                    📷
                                                </button>
                                            </div>

                                            {/* Analysis Result Section */}
                                            {(analyzing || analysisResult) && (
                                                <div className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm shadow-emerald-50 animate-fade-in text-sm">
                                                    {analyzing ? (
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                            AI is analyzing plant health...
                                                        </div>
                                                    ) : analysisResult && (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">AI Detected:</span>
                                                                    <span className={`font-bold pb-0.5 border-b-2 ${analysisResult.disease_name.toLowerCase().includes('healthy') ? 'text-emerald-600 border-emerald-200' : 'text-red-600 border-red-200'}`}>
                                                                        {analysisResult.disease_name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-right bg-slate-50 px-2 py-1 rounded shadow-sm border border-slate-100">
                                                                    <span className="block text-slate-400 text-[10px] uppercase font-bold text-nowrap">Confidence</span>
                                                                    <span className="text-slate-800 font-mono text-xs font-bold text-nowrap">{(analysisResult.confidence * 100).toFixed(1)}%</span>
                                                                </div>
                                                            </div>

                                                            {/* Precautions / Details */}
                                                            {analysisResult.details && (
                                                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                                                    <div>
                                                                        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wide flex items-center gap-1 mb-1">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                                            </svg>
                                                                            Treatment Advice:
                                                                        </span>
                                                                        <ul className="list-disc pl-5 text-slate-600 space-y-1 text-xs font-medium">
                                                                            {analysisResult.details.treatments?.slice(0, 2).map((t: any, i: number) => (
                                                                                <li key={i}>{t.description}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-blue-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1 mb-1">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                            </svg>
                                                                            Prevention:
                                                                        </span>
                                                                        <p className="text-slate-600 text-xs font-medium">{analysisResult.details.prevention}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-semibold text-slate-600">Notes (Voice Input Available)</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!('webkitSpeechRecognition' in window)) {
                                                    alert("Voice input not supported in this browser.");
                                                    return;
                                                }
                                                const SpeechRecognition = (window as any).webkitSpeechRecognition;
                                                const recognition = new SpeechRecognition();
                                                recognition.lang = 'en-US';
                                                recognition.onstart = () => setIsListening(true);
                                                recognition.onend = () => setIsListening(false);
                                                recognition.onresult = (event: any) => {
                                                    const transcript = event.results[0][0].transcript;
                                                    setNote(prev => (prev ? prev + ' ' : '') + transcript);
                                                };
                                                recognition.start();
                                            }}
                                            className={`text-xs font-bold flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md transition-colors ${isListening ? 'text-red-600 bg-red-50 animate-pulse' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                                        >
                                            {isListening ? '🔴 Listening...' : '🎤 Tap to Speak'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="e.g., Added compost today, looks taller..."
                                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-800 text-sm min-h-[80px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Saving...' : 'Save Entry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                    }

                    {/* Timeline */}
                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                        {loading && logs.length === 0 ? (
                            <p className="text-center text-slate-500 py-4 font-semibold">Loading history...</p>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500 italic font-medium">No logs yet. Add one above!</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="relative pl-8">
                                    {/* Dot or Checkbox */}
                                    {compareMode ? (
                                        <button
                                            onClick={() => toggleLogSelection(log.id)}
                                            className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${selectedLogs.includes(log.id) ? 'bg-emerald-500 border-white scale-125' : 'bg-white border-slate-400'
                                                }`}
                                        >
                                            {selectedLogs.includes(log.id) && <span className="text-[8px] font-bold text-white">✓</span>}
                                        </button>
                                    ) : (
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.status === 'Healthy' ? 'bg-emerald-500' :
                                            log.status === 'Sick' ? 'bg-red-500' :
                                                log.status === 'Flowering' ? 'bg-pink-500' :
                                                    'bg-blue-500'
                                            }`}></div>
                                    )}

                                    {/* Content */}
                                    <div
                                        onClick={() => compareMode && toggleLogSelection(log.id)}
                                        className={`bg-white border rounded-xl p-4 transition-all shadow-sm ${compareMode && selectedLogs.includes(log.id)
                                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 cursor-pointer shadow-md'
                                            : compareMode ? 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100 cursor-pointer' : 'border-slate-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded shadow-sm">{log.date}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shadow-sm ${log.status === 'Healthy' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                                log.status === 'Sick' ? 'text-red-700 bg-red-50 border-red-200' :
                                                    'text-blue-700 bg-blue-50 border-blue-200'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </div>
                                        {/* Log Image if available */}
                                        {log.image_url && (
                                            <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 shadow-sm max-w-full">
                                                <img
                                                    src={log.image_url}
                                                    alt="Log attachment"
                                                    className="w-full h-auto object-cover max-h-[200px]"
                                                />
                                            </div>
                                        )}
                                        <p className="text-slate-700 text-sm leading-relaxed font-medium">{log.note}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div >
            </div >
        </div >
    );
}
