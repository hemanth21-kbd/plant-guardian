"use client";
import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface CameraFeedProps {
    onCapture: (imageSrc: string) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture }) => {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isAutoScanning, setIsAutoScanning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                // Only set local preview if NOT auto-scanning (to avoid flickering)
                // or if we want to show what was just caught. 
                // For auto-scan, we might want to keep the live feed.
                if (!isAutoScanning) {
                    setImgSrc(imageSrc);
                }
                onCapture(imageSrc);
            }
        }
    }, [webcamRef, onCapture, isAutoScanning]);

    const toggleAutoScan = () => {
        if (isAutoScanning) {
            setIsAutoScanning(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        } else {
            setIsAutoScanning(true);
            setImgSrc(null); // Clear any frozen image
            // Capture every 2 seconds
            intervalRef.current = setInterval(() => {
                capture();
            }, 2000);
        }
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const retake = () => {
        setImgSrc(null);
        if (isAutoScanning) toggleAutoScan(); // Stop auto-scan if retaking manually
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg group">
                {imgSrc && !isAutoScanning ? (
                    <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            videoConstraints={{ facingMode: "environment" }}
                        />
                        {isAutoScanning && (
                            <div className="absolute inset-0 pointer-events-none border-4 border-green-500/50 animate-pulse">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-scan"></div>
                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                    AUTO-SCANNING
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="mt-4 flex gap-4">
                {imgSrc && !isAutoScanning ? (
                    <button
                        onClick={retake}
                        className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition"
                    >
                        Retake
                    </button>
                ) : (
                    <>
                        <button
                            onClick={capture}
                            disabled={isAutoScanning}
                            className={`px-6 py-2 rounded-full transition font-bold ${isAutoScanning
                                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                        >
                            Capture
                        </button>
                        <button
                            onClick={toggleAutoScan}
                            className={`px-6 py-2 rounded-full transition font-bold border-2 ${isAutoScanning
                                ? "bg-red-100 border-red-500 text-red-600 hover:bg-red-200"
                                : "bg-white border-green-600 text-green-600 hover:bg-green-50"
                                }`}
                        >
                            {isAutoScanning ? "Stop Scan" : "Auto-Scan"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraFeed;
