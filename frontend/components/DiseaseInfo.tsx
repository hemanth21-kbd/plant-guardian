import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface Treatment {
    type: string;
    description: string;
    cost_approx?: string;
}

interface DiseaseDetails {
    name: string;
    severity: string;
    symptoms: string;
    prevention: string;
    treatments: Treatment[];
}

interface PredictionResult {
    plant_name: string;
    disease_name: string;
    confidence: number;
    details?: DiseaseDetails;
}

interface DiseaseInfoProps {
    result: PredictionResult;
}



const DiseaseInfo: React.FC<DiseaseInfoProps> = ({ result }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { language } = useLanguage();

    const getLocale = (langCode: string) => {
        const localeMap: Record<string, string> = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'bn': 'bn-IN',
            'gu': 'gu-IN',
            'mr': 'mr-IN',
            'pa': 'pa-IN',
            'ur': 'ur-PK',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'Zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ar': 'ar-SA'
        };
        return localeMap[langCode] || 'en-US';
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // Construct text to read - reusing the translated content in 'result'
        const text = `${result.plant_name}. ${result.disease_name}. 
        ${result.details ? `${result.details.severity}. ${result.details.symptoms}. ${result.details.treatments.map(t => t.description).join('. ')}` : ''}`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getLocale(language);
        utterance.rate = 0.9; // Slightly slower for better clarity

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech error", e);
            setIsSpeaking(false);
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{result.plant_name}</h2>
                    <p className="text-lg text-red-600 font-semibold">{result.disease_name}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={handleSpeak}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold transition-colors ${isSpeaking ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    >
                        {isSpeaking ? '🔊 Stop' : '🔊 Listen'}
                    </button>
                    <div className="text-right">
                        <span className="block text-sm text-gray-500">Confidence</span>
                        <span className="text-xl font-bold text-green-600">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {result.details ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg">
                            <h3 className="font-bold text-red-800 mb-2">Severity</h3>
                            <p className="text-red-700">{result.details.severity}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-bold text-yellow-800 mb-2">Symptoms</h3>
                            <p className="text-yellow-700 text-sm">{result.details.symptoms}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Treatments</h3>
                        <div className="space-y-3">
                            {result.details.treatments.map((t, idx) => (
                                <div key={idx} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded uppercase mb-2 ${t.type === 'Organic' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {t.type}
                                        </span>
                                        <p className="text-gray-700">{t.description}</p>
                                    </div>
                                    {t.cost_approx && (
                                        <div className="text-right min-w-[100px]">
                                            <span className="block text-xs text-gray-500">Approx. Cost</span>
                                            <span className="font-bold text-gray-900">{t.cost_approx}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-bold text-green-800 mb-2">Prevention</h3>
                        <p className="text-green-700 text-sm">{result.details.prevention}</p>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-gray-100 rounded text-center text-gray-500">
                    No detailed information available for this disease in our database.
                </div>
            )}
        </div>
    );
};

export default DiseaseInfo;
