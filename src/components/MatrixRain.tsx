"use client";
import { useEffect, useRef } from "react";

interface MatrixRainProps {
  className?: string;
  opacity?: number;
  speed?: number;
  characters?: string[];
  color?: string;
}

export default function MatrixRain({ 
  className = "",
  opacity = 0.1,
  speed = 1,
  characters = ['0', '1', '$', '₿', '⚡', '🌱', '📈', '💎'],
  color = '#00ff88'
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = Array(columns).fill(0);

    const draw = () => {
      // Semi-transparent black background
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Matrix rain effect
      ctx.fillStyle = color;
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = characters[Math.floor(Math.random() * characters.length)];
        const x = i * 20;
        const y = drops[i] * 20;

        ctx.fillText(char, x, y);

        // Reset drop when it reaches bottom or randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i] += speed;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, characters, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
    />
  );
}