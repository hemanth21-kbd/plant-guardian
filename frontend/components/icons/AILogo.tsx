
import React from 'react';

export default function AILogo({ className = "w-6 h-6" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22V8" />
            <path d="M12 8c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7z" />
            <path d="M12 2c0 3.3 2.7 6 6 6s6-2.7 6-6-2.7-6-6-6" />
            <path d="M12 2c0 3.3-2.7 6-6 6S0 5.3 0 2s2.7-6 6-6" />
        </svg>
    );
}
