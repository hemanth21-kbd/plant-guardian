"use client";
import React, { useState, useRef } from 'react';

interface VideoPost {
    id: string;
    user: string;
    avatar: string;
    videoUrl: string;
    description: string;
    likes: number;
    comments: number;
    time: string;
}

export default function Community() {
    const [posts, setPosts] = useState<VideoPost[]>([
        {
            id: "1",
            user: "Sarah Jenkins",
            avatar: "👩‍🌾",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            description: "My tomatoes are finally turning red! 🍅 Any tips on keeping pests away during this stage?",
            likes: 124,
            comments: 18,
            time: "2 hours ago"
        },
        {
            id: "2",
            user: "Michael Green",
            avatar: "👨‍🌾",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            description: "Checking row covers on the cabbage patch today. Wind was brutal yesterday! 🥬",
            likes: 89,
            comments: 5,
            time: "5 hours ago"
        }
    ]);

    const [isUploading, setIsUploading] = useState(false);
    const [newDesc, setNewDesc] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedFileUrl(url);
            setIsUploading(true);
        }
    };

    const handlePostVideo = () => {
        if (selectedFileUrl) {
            const newPost: VideoPost = {
                id: Date.now().toString(),
                user: "You",
                avatar: "👤",
                videoUrl: selectedFileUrl,
                description: newDesc,
                likes: 0,
                comments: 0,
                time: "Just now"
            };
            setPosts([newPost, ...posts]);
            setIsUploading(false);
            setNewDesc("");
            setSelectedFileUrl(null);
        }
    };

    const cancelUpload = () => {
        setIsUploading(false);
        setNewDesc("");
        setSelectedFileUrl(null);
    };

    return (
        <div className="flex flex-col h-full bg-[#f0f9ff] text-slate-800 font-sans pb-24 relative min-h-screen">

            {/* Header Info */}
            <div className="px-6 pt-6 pb-4 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-sky-100 flex justify-between items-center shadow-sm">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crop Community</h2>

                {/* Upload Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md shadow-blue-200 transition-transform active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
                <input
                    type="file"
                    accept="video/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleVideoSelect}
                />
            </div>

            {/* Uploading Modal / Section */}
            {isUploading && selectedFileUrl && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">New Crop Video</h3>
                            <button onClick={cancelUpload} className="text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                                <video src={selectedFileUrl} controls className="w-full h-full object-contain" />
                            </div>

                            <textarea
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Describe your crop, ask a question, or share a tip..."
                                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                rows={3}
                            />

                            <button
                                onClick={handlePostVideo}
                                disabled={!newDesc.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Post Video
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feed */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-6">
                {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100">
                        {/* Post Header */}
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-xl">
                                {post.avatar}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-slate-800">{post.user}</h4>
                                <span className="text-xs text-slate-500">{post.time}</span>
                            </div>
                        </div>

                        {/* Video Content */}
                        <div className="bg-black relative group w-full aspect-[4/5] object-cover flex items-center justify-center">
                            <video
                                src={post.videoUrl}
                                controls
                                className="w-full h-full object-cover"
                                preload="metadata"
                            />
                        </div>

                        {/* Description & Actions */}
                        <div className="p-4">
                            <div className="flex gap-4 mb-3">
                                <button className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    <span className="font-medium text-sm">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-slate-500 hover:text-blue-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                                    </svg>
                                    <span className="font-medium text-sm">{post.comments}</span>
                                </button>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                <span className="font-bold mr-2">{post.user}</span>
                                {post.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
