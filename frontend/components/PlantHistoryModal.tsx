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
            const res = await axios.get(`${API_BASE_URL}/my-garden/logs/${plantId}`);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1c23] border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white">History: {plantName}</h2>
                        <p className="text-sm text-slate-400">Track growth and health updates</p>
                    </div>
                    <div className="flex gap-2">
                        {!compareMode ? (
                            <button
                                onClick={() => { setCompareMode(true); setSelectedLogs([]); }}
                                className="px-3 py-1 text-xs border border-white/10 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                                Compare Photos
                            </button>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-white">{selectedLogs.length}/2 Selected</span>
                                <button
                                    onClick={() => setCompareMode(false)}
                                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Comparison View Overlay */}
                    {compareMode && selectedLogs.length === 2 && (
                        <div className="mb-6 bg-black/40 border border-emerald-500/30 rounded-xl p-4 animate-fade-in relative">
                            <h3 className="text-center text-emerald-400 font-bold mb-4">Growth Comparison</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {logs.filter(l => selectedLogs.includes(l.id)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(log => (
                                    <div key={log.id} className="space-y-2">
                                        <div className="aspect-square rounded-lg overflow-hidden border border-white/20 relative">
                                            {log.image_url ? (
                                                <img src={log.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-500 text-xs">No Photo</div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono">
                                                {log.date}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 text-center">{log.note}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => { setSelectedLogs([]); }}
                                className="absolute top-2 right-2 text-slate-500 hover:text-white text-xs"
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* Add Log Form */}
                    {!compareMode && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">New Entry</h3>
                            <form onSubmit={handleAddLog} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Date ... */}
                                    {/* Status ... */}
                                </div>

                                {/* NOTE: Existing date/status inputs logic is preserved by "..." above, but I'll write full form block to be safe if I can view it all. 
                                Actually, replace chunk is safer.
                            */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Status</label>
                                        <select
                                            value={status}
                                            onChange={e => setStatus(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
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
                                    <label className="block text-xs text-slate-400 mb-1">Photo (Optional)</label>

                                    {showCamera ? (
                                        <div className="mb-4 bg-black rounded-xl overflow-hidden border border-emerald-500/50">
                                            <div className="flex justify-between items-center p-2 bg-black/40">
                                                <span className="text-white text-xs font-bold px-2">📷 Camera Active</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCamera(false)}
                                                    className="text-red-400 text-xs hover:text-white"
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
                                                        className={`flex items-center justify-center w-full p-3 rounded-lg border border-dashed cursor-pointer transition-colors ${file ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/20 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/40'
                                                            }`}
                                                    >
                                                        <span className="text-sm truncate">
                                                            {file ? `📎 ${file.name}` : '📁 Upload / Capture'}
                                                        </span>
                                                    </label>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCamera(true)}
                                                    className="px-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors"
                                                    title="Use Camera"
                                                >
                                                    📷
                                                </button>
                                            </div>

                                            {/* Analysis Result Section */}
                                            {(analyzing || analysisResult) && (
                                                <div className="bg-black/30 rounded-lg p-3 border border-white/10 animate-fade-in text-sm">
                                                    {analyzing ? (
                                                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                            Analyzing plant health...
                                                        </div>
                                                    ) : analysisResult && (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="block text-slate-400 text-xs">Detected:</span>
                                                                    <span className={`font-bold ${analysisResult.disease_name.toLowerCase().includes('healthy') ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                        {analysisResult.disease_name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="block text-slate-400 text-xs text-nowrap">Confidence:</span>
                                                                    <span className="text-white font-mono text-nowrap">{(analysisResult.confidence * 100).toFixed(1)}%</span>
                                                                </div>
                                                            </div>

                                                            {/* Precautions / Details */}
                                                            {analysisResult.details && (
                                                                <div className="mt-2 pt-2 border-t border-white/10 space-y-3">
                                                                    <div>
                                                                        <span className="text-emerald-400 font-semibold text-xs uppercase tracking-wide">Treatment Advice:</span>
                                                                        <ul className="list-disc pl-4 text-slate-300 mt-1 space-y-1 text-xs">
                                                                            {analysisResult.details.treatments?.slice(0, 2).map((t: any, i: number) => (
                                                                                <li key={i}>{t.description}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-blue-400 font-semibold text-xs uppercase tracking-wide">Prevention:</span>
                                                                        <p className="text-slate-300 mt-1 text-xs">{analysisResult.details.prevention}</p>
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
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs text-slate-400">Notes (Voice Input Available)</label>
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
                                            className={`text-xs flex items-center gap-1 ${isListening ? 'text-red-400 animate-pulse' : 'text-emerald-400 hover:text-emerald-300'}`}
                                        >
                                            {isListening ? '🔴 Listening...' : '🎤 Tap to Speak'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="e.g., Added compost today, looks taller..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm min-h-[80px]"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Saving...' : 'Add Entry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                    }

                    {/* Timeline */}
                    <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pb-4">
                        {loading && logs.length === 0 ? (
                            <p className="text-center text-slate-500 py-4">Loading history...</p>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500 italic">No logs yet. Add one above!</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="relative pl-8">
                                    {/* Dot or Checkbox */}
                                    {compareMode ? (
                                        <button
                                            onClick={() => toggleLogSelection(log.id)}
                                            className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedLogs.includes(log.id) ? 'bg-emerald-500 border-white scale-125' : 'bg-[#1a1c23] border-slate-500'
                                                }`}
                                        >
                                            {selectedLogs.includes(log.id) && <span className="text-[8px] text-white">✓</span>}
                                        </button>
                                    ) : (
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-[#1a1c23] ${log.status === 'Healthy' ? 'bg-emerald-500' :
                                            log.status === 'Sick' ? 'bg-red-500' :
                                                log.status === 'Flowering' ? 'bg-pink-500' :
                                                    'bg-blue-500'
                                            }`}></div>
                                    )}

                                    {/* Content */}
                                    <div
                                        onClick={() => compareMode && toggleLogSelection(log.id)}
                                        className={`bg-white/5 border rounded-xl p-4 transition-all cursor-pointer ${compareMode && selectedLogs.includes(log.id)
                                            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-900/10'
                                            : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono text-slate-400">{log.date}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full bg-white/5 border ${log.status === 'Healthy' ? 'text-emerald-400 border-emerald-500/30' :
                                                log.status === 'Sick' ? 'text-red-400 border-red-500/30' :
                                                    'text-blue-400 border-blue-500/30'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </div>
                                        {/* Log Image if available */}
                                        {log.image_url && (
                                            <div className="mb-3 rounded-lg overflow-hidden border border-white/10 max-w-full">
                                                <img
                                                    src={log.image_url}
                                                    alt="Log attachment"
                                                    className="w-full h-auto object-cover max-h-[200px]"
                                                />
                                            </div>
                                        )}
                                        <p className="text-slate-200 text-sm leading-relaxed">{log.note}</p>
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
