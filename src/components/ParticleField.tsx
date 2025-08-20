"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, Zap, DollarSign, TrendingUp, Star } from "lucide-react";

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
  animationSpeed?: number;
  interactionRadius?: number;
  colors?: string[];
  size?: { min: number; max: number };
  effects?: ('glow' | 'trail' | 'magnetic' | 'burst')[];
}

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'default' | 'money' | 'growth' | 'energy' | 'star';
  brightness: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
};

const PARTICLE_TYPES = {
  money: { char: '$', color: '#10b981', glow: true },
  growth: { char: '↗', color: '#22c55e', glow: false },
  energy: { char: '⚡', color: '#f59e0b', glow: true },
  star: { char: '★', color: '#8b5cf6', glow: true },
  default: { char: '●', color: '#60a5fa', glow: false }
};

export default function ParticleField({
  className = "",
  particleCount = 50,
  animationSpeed = 1,
  interactionRadius = 100,
  colors = ['#10b981', '#22c55e', '#f59e0b', '#8b5cf6', '#60a5fa'],
  size = { min: 2, max: 8 },
  effects = ['glow', 'magnetic']
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const types = Object.keys(PARTICLE_TYPES) as Array<keyof typeof PARTICLE_TYPES>;
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      newParticles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2 * animationSpeed,
        vy: (Math.random() - 0.5) * 2 * animationSpeed,
        size: size.min + Math.random() * (size.max - size.min),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 300 + Math.random() * 200,
        type: randomType,
        brightness: 0.5 + Math.random() * 0.5,
        trail: []
      });
    }
    
    setParticles(newParticles);
  }, [particleCount, animationSpeed, colors, size]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!isActive) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          let newParticle = { ...particle };
          
          // Update position
          newParticle.x += newParticle.vx;
          newParticle.y += newParticle.vy;
          
          // Boundary collision
          if (newParticle.x < 0 || newParticle.x > canvas.width) {
            newParticle.vx *= -1;
            newParticle.x = Math.max(0, Math.min(canvas.width, newParticle.x));
          }
          if (newParticle.y < 0 || newParticle.y > canvas.height) {
            newParticle.vy *= -1;
            newParticle.y = Math.max(0, Math.min(canvas.height, newParticle.y));
          }
          
          // Mouse interaction (magnetic effect)
          if (effects.includes('magnetic') && mouseRef.current.isMoving) {
            const dx = mouseRef.current.x - newParticle.x;
            const dy = mouseRef.current.y - newParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < interactionRadius) {
              const force = (interactionRadius - distance) / interactionRadius * 0.5;
              newParticle.vx += (dx / distance) * force;
              newParticle.vy += (dy / distance) * force;
              
              // Speed limiting
              const speed = Math.sqrt(newParticle.vx ** 2 + newParticle.vy ** 2);
              if (speed > 5) {
                newParticle.vx = (newParticle.vx / speed) * 5;
                newParticle.vy = (newParticle.vy / speed) * 5;
              }
            }
          }
          
          // Update trail
          if (effects.includes('trail')) {
            newParticle.trail.unshift({ x: newParticle.x, y: newParticle.y, alpha: 1 });
            newParticle.trail = newParticle.trail.slice(0, 10).map((point, index) => ({
              ...point,
              alpha: 1 - index / 10
            }));
          }
          
          // Update life
          newParticle.life += 1;
          
          // Respawn if needed
          if (newParticle.life > newParticle.maxLife) {
            newParticle.life = 0;
            newParticle.x = Math.random() * canvas.width;
            newParticle.y = Math.random() * canvas.height;
            newParticle.vx = (Math.random() - 0.5) * 2 * animationSpeed;
            newParticle.vy = (Math.random() - 0.5) * 2 * animationSpeed;
          }
          
          return newParticle;
        });
      });

      // Draw particles
      particles.forEach(particle => {
        const typeConfig = PARTICLE_TYPES[particle.type];
        
        // Draw trail
        if (effects.includes('trail') && particle.trail.length > 1) {
          ctx.globalCompositeOperation = 'screen';
          particle.trail.forEach((point, index) => {
            if (index === 0) return;
            
            ctx.globalAlpha = point.alpha * 0.3;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, particle.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
        }
        
        // Draw glow effect
        if (effects.includes('glow') && typeConfig.glow) {
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 20 * particle.brightness;
        } else {
          ctx.shadowBlur = 0;
        }
        
        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.brightness;
        
        if (particle.type === 'default') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw special characters
          ctx.font = `${particle.size * 2}px bold Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(typeConfig.char, particle.x, particle.y);
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isActive) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, isActive, effects, interactionRadius]);

  // Mouse tracking
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    mouseRef.current = { x, y, isMoving: true };
    setMousePosition({ x, y });
    
    // Create burst effect on mouse move
    if (effects.includes('burst')) {
      createBurstParticles(x, y);
    }
  };

  const handleMouseLeave = () => {
    mouseRef.current.isMoving = false;
  };

  const createBurstParticles = (x: number, y: number) => {
    const burstParticles: Particle[] = [];
    
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i;
      const speed = 3 + Math.random() * 2;
      
      burstParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 30,
        type: 'star',
        brightness: 1,
        trail: []
      });
    }
    
    setParticles(prev => [...prev, ...burstParticles]);
  };

  // Canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ background: 'transparent' }}
      />
      
      {/* Particle Controls */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`p-1 rounded-full transition-all ${
            isActive 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}
          title={isActive ? 'Pause particles' : 'Resume particles'}
        >
          <Sparkles size={12} />
        </button>
      </div>
      
      {/* Interaction Indicator */}
      {mouseRef.current.isMoving && effects.includes('magnetic') && (
        <div 
          className="absolute pointer-events-none border border-emerald-400/30 rounded-full"
          style={{
            left: mousePosition.x - interactionRadius,
            top: mousePosition.y - interactionRadius,
            width: interactionRadius * 2,
            height: interactionRadius * 2,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
          }}
        />
      )}
      
      {/* Stats Overlay */}
      <div className="absolute bottom-2 left-2 text-xs text-white/60 bg-black/20 rounded px-2 py-1 backdrop-blur-sm">
        {particles.length} particles
      </div>
    </div>
  );
}