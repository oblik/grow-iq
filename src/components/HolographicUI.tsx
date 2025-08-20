"use client";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, DollarSign, Zap, Eye, Target, Sparkles } from "lucide-react";

interface HolographicUIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string[];
  className?: string;
  animated?: boolean;
  glowEffect?: boolean;
  dataStream?: number[];
}

export default function HolographicUI({
  title,
  value,
  subtitle,
  icon,
  gradient = ['#00ff88', '#00d4ff'],
  className = "",
  animated = true,
  glowEffect = true,
  dataStream = []
}: HolographicUIProps) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (animated) {
      intervalRef.current = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 360);
      }, 50);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [animated]);

  // Draw data visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dataStream.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw data stream
    ctx.strokeStyle = gradient[0];
    ctx.lineWidth = 2;
    ctx.beginPath();

    const stepX = canvas.width / (dataStream.length - 1);
    dataStream.forEach((value, index) => {
      const x = index * stepX;
      const y = canvas.height - (value * canvas.height);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Add glow effect
    if (glowEffect) {
      ctx.shadowColor = gradient[0];
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
  }, [dataStream, gradient, glowEffect]);

  const gradientStyle = {
    background: `linear-gradient(135deg, ${gradient[0]}22, ${gradient[1]}22)`,
    borderColor: gradient[0],
    boxShadow: glowEffect ? `0 0 20px ${gradient[0]}44, inset 0 1px 0 ${gradient[0]}66` : undefined
  };

  const pulseAnimation = animated ? {
    animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
    animationDelay: `${animationPhase * 0.01}s`
  } : {};

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border backdrop-blur-lg transition-all duration-500 hover:scale-[1.02] ${className}`}
      style={gradientStyle}
    >
      {/* Holographic scan lines */}
      {animated && (
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              ${gradient[0]}33 2px,
              ${gradient[0]}33 4px
            )`,
            transform: `translateY(${animationPhase % 100}%)`,
            transition: 'transform 0.1s linear'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: `${gradient[0]}33`,
                  color: gradient[0]
                }}
              >
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold drop-shadow-sm" style={{ color: gradient[0], textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm opacity-90 font-medium drop-shadow-sm" style={{ color: gradient[1], textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {animated && (
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: gradient[0] }}
              />
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: gradient[1], animationDelay: '0.5s' }}
              />
            </div>
          )}
        </div>

        {/* Value display */}
        <div 
          className="text-3xl font-bold mb-2 drop-shadow-lg"
          style={{ 
            color: gradient[0],
            textShadow: glowEffect ? `0 0 15px ${gradient[0]}88, 0 2px 4px rgba(0,0,0,0.3)` : '0 2px 4px rgba(0,0,0,0.3)',
            ...pulseAnimation
          }}
        >
          {value}
        </div>

        {/* Data visualization */}
        {dataStream.length > 0 && (
          <div className="h-12 mb-4 relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full absolute inset-0"
            />
          </div>
        )}

        {/* Decorative elements */}
        <div className="flex justify-between items-end text-xs opacity-90">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-1 rounded"
              style={{ backgroundColor: gradient[0] }}
            />
            <span style={{ color: gradient[0], textShadow: '0 1px 2px rgba(0,0,0,0.3)' }} className="font-semibold">LIVE</span>
          </div>
          
          {animated && (
            <div className="flex items-center gap-1">
              <Sparkles size={12} style={{ color: gradient[1] }} />
              <span style={{ color: gradient[1], textShadow: '0 1px 2px rgba(0,0,0,0.3)' }} className="font-semibold">REAL-TIME</span>
            </div>
          )}
        </div>
      </div>

      {/* Corner accent */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 opacity-20"
        style={{
          background: `linear-gradient(225deg, ${gradient[0]}, transparent)`
        }}
      />

      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${gradient[0]}, transparent)`
        }}
      />
    </div>
  );
}