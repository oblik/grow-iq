"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Zap, Eye, Target } from "lucide-react";

interface SpectacularLoaderProps {
  onComplete?: () => void;
  messages?: string[];
  duration?: number;
}

export default function SpectacularLoader({ 
  onComplete, 
  messages = [
    "🌱 Initializing GrowIQ DeFi Platform...",
    "🤖 Activating AI Neural Networks...",
    "✨ Loading Holographic Interfaces...",
    "🚀 Preparing FarmVerse 3D Environment...",
    "💎 Syncing Blockchain Data...",
    "🎯 Calibrating Investment Algorithms..."
  ],
  duration = 4000 
}: SpectacularLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Progress and message cycling
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 50));
        if (newProgress >= 100) {
          setIsComplete(true);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, duration / messages.length);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [duration, messages.length, onComplete]);

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: ['#10b981', '#22c55e', '#f59e0b', '#8b5cf6', '#60a5fa'][Math.floor(Math.random() * 5)],
        life: Math.random() * 100
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 1;

        // Boundary wrap
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.strokeStyle = `${particle.color}33`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          }
        });
      });

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0" 
      />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
            🌱 GrowIQ
          </div>
          <div className="text-2xl font-semibold text-emerald-300 mt-2">
            DeFi Platform
          </div>
          
          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <Sparkles className="text-yellow-400" size={20} />
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
              <Zap className="text-blue-400" size={20} />
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-x-4 -translate-y-1/2">
              <Eye className="text-purple-400" size={20} />
            </div>
            <div className="absolute right-0 top-1/2 transform translate-x-4 -translate-y-1/2">
              <Target className="text-red-400" size={20} />
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="mb-8">
          <div className="text-xl text-white mb-2 font-semibold min-h-[1.5rem] transition-all duration-500 drop-shadow-lg">
            {messages[currentMessage]}
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30 animate-shimmer" />
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-emerald-300 mt-2 font-semibold">
            <span className="drop-shadow-md">Loading...</span>
            <span className="drop-shadow-md">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {[
            '3D Visualization',
            'AI Neural Networks',
            'Holographic UI',
            'Real-time Data',
            'DeFi Integration',
            'Particle Effects'
          ].map((feature, index) => (
            <div
              key={feature}
              className={`px-3 py-1 rounded-full border transition-all duration-500 font-medium ${
                progress > (index + 1) * 16
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 drop-shadow-md'
                  : 'bg-gray-800/60 border-gray-600 text-gray-300'
              }`}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Pulse Ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="border border-emerald-400/30 rounded-full animate-pulse"
            style={{
              width: `${300 + progress * 2}px`,
              height: `${300 + progress * 2}px`
            }}
          />
          <div 
            className="absolute border border-emerald-400/20 rounded-full animate-pulse"
            style={{
              width: `${400 + progress * 3}px`,
              height: `${400 + progress * 3}px`,
              animationDelay: '0.5s'
            }}
          />
        </div>
      </div>

      {/* CSS for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}