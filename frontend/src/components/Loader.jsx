import React, { useState, useEffect } from 'react';

const FunnyLoader = ({
    message = "Preparing magic...",
    emojis = ['🧙', '🪄', '✨', '🐇', '🎩', '🔮'],
    funnyMessages = [
        "Brewing coffee...",
        "Training hamsters...",
        "Reversing entropy...",
        "Convincing AI to work...",
        "Waking up the developer...",
        "Almost there..."
    ],
    speed = 800,
    themeColor = 'bg-gradient-to-r from-pink-500 to-purple-600'
}) => {
    const [activeEmoji, setActiveEmoji] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const emojiInterval = setInterval(() => {
            setActiveEmoji(prev => (prev + 1) % emojis.length);
        }, speed);

        const progressInterval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + Math.random() * 10));
        }, speed / 2);

        return () => {
            clearInterval(emojiInterval);
            clearInterval(progressInterval);
        };
    }, [emojis.length, speed]);

    const getRandomMessage = () => {
        return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    };

    return (
        <div className="max-w-xs mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
            {/* Emoji with bounce animation */}
            <div className="text-6xl mb-4 animate-bounce">
                {emojis[activeEmoji]}
            </div>

            {/* Progress bar with animated gradient */}
            <div className="h-5 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <div
                    className={`h-full rounded-full ${themeColor} transition-all duration-300 ease-out`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                >
                    <span className="text-xs font-bold text-white pl-2">
                        {Math.min(Math.floor(progress), 100)}%
                    </span>
                </div>
            </div>

            {/* Rotating messages */}
            <p className="text-gray-700 min-h-5 mb-4">
                {progress % 20 < 5 ? message : getRandomMessage()}
            </p>

            {/* Floating sparkles */}
            <div className="relative h-8">
                {[...Array(8)].map((_, i) => (
                    <span
                        key={i}
                        className="absolute text-xl opacity-0"
                        style={{
                            animation: `sparkle 2s infinite ease-in-out ${i * 0.1}s`,
                            left: `${Math.random() * 90 + 5}%`
                        }}
                    >
                        ✨
                    </span>
                ))}
            </div>

            {/* Inject the animation styles */}
            <style jsx>{`
                @keyframes sparkle {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-50px) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default FunnyLoader;