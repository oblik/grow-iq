"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Eye, 
  Zap, 
  TrendingUp, 
  Droplets, 
  Sun, 
  Wind, 
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Settings,
  Maximize2,
  Volume2,
  VolumeX
} from "lucide-react";

type Field = {
  field_id: string;
  crop_name: string;
  planting_date: string;
  expected_harvest_date: string;
  days_since_planting: number;
  growth_progress_percent: number;
  soil_moisture_percent: number;
  temperature_celsius: number;
  humidity_percent: number;
  timeline_instructions: string[];
  investment_pool: {
    pool_id: number;
    total_staked: number;
    apy_estimate: number;
    min_stake: number;
    max_stake: number;
    investors_count: number;
    risk_level: 'Low' | 'Medium' | 'High';
    liquidity_locked_until: string;
    is_active: boolean;
    contract_deployed: boolean;
  };
  status: 'active' | 'available_soon';
  ai_yield_prediction: {
    estimated_yield_tons: number;
    confidence_score: number;
    weather_risk_factor: number;
    market_price_estimate: number;
  };
};

type FarmData = {
  message: string;
  timestamp: string;
  fields: Field[];
};

interface FarmVerse3DProps {
  farmData: FarmData | null;
  onFieldSelect?: (field: Field) => void;
}

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'growth' | 'reward' | 'investment' | 'weather';
  color: string;
  size: number;
};

type WeatherState = 'sunny' | 'rainy' | 'windy' | 'cloudy';

export default function FarmVerse3D({ farmData, onFieldSelect }: FarmVerse3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [cameraAngle, setCameraAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [weatherState, setWeatherState] = useState<WeatherState>('sunny');
  const [showParticles, setShowParticles] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(0.5); // 0 = midnight, 0.5 = noon, 1 = midnight

  // Field positions in 3D space (normalized coordinates)
  const fieldPositions = useMemo(() => {
    if (!farmData?.fields) return [];
    
    const positions = farmData.fields.map((field, index) => {
      const angle = (index / farmData.fields.length) * Math.PI * 2;
      const radius = 0.3 + (index % 2) * 0.15;
      return {
        id: field.field_id,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: 0,
        field
      };
    });
    
    return positions;
  }, [farmData]);

  // Generate particles based on field data
  const generateParticles = () => {
    if (!showParticles || !fieldPositions.length) return;
    
    const newParticles: Particle[] = [];
    
    fieldPositions.forEach((pos, index) => {
      const field = pos.field;
      
      // Growth particles
      if (field.growth_progress_percent > 20) {
        for (let i = 0; i < Math.floor(field.growth_progress_percent / 20); i++) {
          newParticles.push({
            id: Date.now() + index * 100 + i,
            x: pos.x + (Math.random() - 0.5) * 0.2,
            y: 0.1 + Math.random() * 0.3,
            vx: (Math.random() - 0.5) * 0.02,
            vy: 0.01 + Math.random() * 0.02,
            life: 0,
            maxLife: 60 + Math.random() * 40,
            type: 'growth',
            color: `hsl(${120 + Math.random() * 60}, 70%, 50%)`,
            size: 2 + Math.random() * 3
          });
        }
      }
      
      // Investment particles
      if (field.investment_pool.total_staked > 1000) {
        for (let i = 0; i < Math.floor(field.investment_pool.total_staked / 10000); i++) {
          newParticles.push({
            id: Date.now() + index * 1000 + i,
            x: pos.x + (Math.random() - 0.5) * 0.3,
            y: 0.2 + Math.random() * 0.2,
            vx: (Math.random() - 0.5) * 0.01,
            vy: 0.005 + Math.random() * 0.01,
            life: 0,
            maxLife: 80 + Math.random() * 40,
            type: 'investment',
            color: `hsl(${200 + Math.random() * 40}, 80%, 60%)`,
            size: 3 + Math.random() * 2
          });
        }
      }
    });
    
    // Weather particles
    if (weatherState === 'rainy') {
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: Date.now() + 10000 + i,
          x: (Math.random() - 0.5) * 2,
          y: 0.8 + Math.random() * 0.2,
          vx: -0.01 + Math.random() * 0.02,
          vy: -0.05 - Math.random() * 0.03,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          type: 'weather',
          color: '#60A5FA',
          size: 1 + Math.random() * 2
        });
      }
    }
    
    setParticles(newParticles);
  };

  // Animation loop
  const animate = () => {
    if (!canvasRef.current || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const skyColor = getSkyColor(timeOfDay);
    gradient.addColorStop(0, skyColor.top);
    gradient.addColorStop(1, skyColor.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update camera
    setCameraAngle(prev => prev + 0.005);
    
    // Draw 3D farm
    drawFarm(ctx, canvas);
    
    // Update and draw particles
    updateParticles();
    drawParticles(ctx, canvas);
    
    // Update time of day
    setTimeOfDay(prev => (prev + 0.001) % 1);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const getSkyColor = (time: number) => {
    // Create day/night cycle colors
    if (time < 0.2 || time > 0.8) {
      // Night
      return {
        top: '#1e1b4b',
        bottom: '#312e81'
      };
    } else if (time < 0.4) {
      // Morning
      return {
        top: '#fbbf24',
        bottom: '#f59e0b'
      };
    } else if (time < 0.6) {
      // Day
      return {
        top: '#60a5fa',
        bottom: '#3b82f6'
      };
    } else {
      // Evening
      return {
        top: '#f97316',
        bottom: '#ea580c'
      };
    }
  };

  const drawFarm = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.3 * zoom;
    
    // Draw ground
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 100, scale * 0.8, scale * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw fields
    fieldPositions.forEach((pos, index) => {
      const screenX = centerX + (pos.x * Math.cos(cameraAngle) - pos.z * Math.sin(cameraAngle)) * scale;
      const screenY = centerY + pos.y * scale * 0.5 + 80;
      const isHovered = hoveredField === pos.id;
      const isSelected = selectedField?.field_id === pos.id;
      
      // Field base
      const fieldSize = 40 + (pos.field.growth_progress_percent / 100) * 20;
      ctx.fillStyle = isSelected ? '#10b981' : isHovered ? '#34d399' : '#16a34a';
      ctx.beginPath();
      ctx.ellipse(screenX, screenY, fieldSize, fieldSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Crop visualization
      drawCrop(ctx, screenX, screenY, pos.field, fieldSize);
      
      // Growth aura
      if (pos.field.growth_progress_percent > 50) {
        ctx.fillStyle = `rgba(34, 197, 94, ${0.1 + (pos.field.growth_progress_percent / 100) * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, fieldSize * 1.5, fieldSize * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Field label and stats
      drawFieldInfo(ctx, screenX, screenY - fieldSize - 10, pos.field, isHovered || isSelected);
    });
    
    // Draw connecting paths
    drawPaths(ctx, centerX, centerY, scale);
    
    // Draw central hub
    drawCentralHub(ctx, centerX, centerY + 80);
  };

  const drawCrop = (ctx: CanvasRenderingContext2D, x: number, y: number, field: Field, size: number) => {
    const progress = field.growth_progress_percent / 100;
    const cropHeight = progress * 20;
    
    // Crop-specific visualization
    switch (field.crop_name.toLowerCase()) {
      case 'wheat':
      case 'barley':
        // Draw wheat stalks
        for (let i = 0; i < Math.floor(progress * 8); i++) {
          const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
          const stalkX = x + Math.cos(angle) * (size * 0.7);
          const stalkY = y + Math.sin(angle) * (size * 0.4);
          
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(stalkX, stalkY);
          ctx.lineTo(stalkX, stalkY - cropHeight);
          ctx.stroke();
          
          // Grain head
          if (progress > 0.6) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(stalkX, stalkY - cropHeight, 3, 6, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
        
      case 'rice':
        // Rice paddies with water reflection
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.9, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        for (let i = 0; i < Math.floor(progress * 12); i++) {
          const angle = Math.random() * Math.PI * 2;
          const riceX = x + Math.cos(angle) * (size * 0.6);
          const riceY = y + Math.sin(angle) * (size * 0.3);
          
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(riceX, riceY);
          ctx.lineTo(riceX, riceY - cropHeight);
          ctx.stroke();
        }
        break;
        
      case 'maize':
        // Corn stalks
        for (let i = 0; i < Math.floor(progress * 6); i++) {
          const angle = (i / 6) * Math.PI * 2;
          const cornX = x + Math.cos(angle) * (size * 0.5);
          const cornY = y + Math.sin(angle) * (size * 0.3);
          
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cornX, cornY);
          ctx.lineTo(cornX, cornY - cropHeight * 1.2);
          ctx.stroke();
          
          // Corn cob
          if (progress > 0.7) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(cornX + 5, cornY - cropHeight * 0.8, 4, 8, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
        
      case 'cotton':
        // Cotton plants with white bolls
        for (let i = 0; i < Math.floor(progress * 8); i++) {
          const angle = Math.random() * Math.PI * 2;
          const cottonX = x + Math.cos(angle) * (size * 0.6);
          const cottonY = y + Math.sin(angle) * (size * 0.4);
          
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cottonX, cottonY);
          ctx.lineTo(cottonX, cottonY - cropHeight);
          ctx.stroke();
          
          // Cotton bolls
          if (progress > 0.6) {
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(cottonX + 3, cottonY - cropHeight * 0.7, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
        
      default:
        // Generic crop visualization
        for (let i = 0; i < Math.floor(progress * 10); i++) {
          const angle = Math.random() * Math.PI * 2;
          const plantX = x + Math.cos(angle) * (size * 0.6);
          const plantY = y + Math.sin(angle) * (size * 0.4);
          
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(plantX, plantY - cropHeight * 0.5, cropHeight * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
    }
  };

  const drawFieldInfo = (ctx: CanvasRenderingContext2D, x: number, y: number, field: Field, isHighlighted: boolean) => {
    if (!isHighlighted) return;
    
    // Info background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    // Use fillRect instead of roundRect for better compatibility
    ctx.fillRect(x - 80, y - 60, 160, 50);
    
    // Add border for better visibility
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 80, y - 60, 160, 50);
    
    // Field name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${field.crop_name} (${field.field_id})`, x, y - 35);
    
    // Progress
    ctx.font = '12px Arial';
    ctx.fillStyle = '#f3f4f6';
    ctx.fillText(`${field.growth_progress_percent}% Growth`, x, y - 20);
    
    // APY
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${field.investment_pool.apy_estimate}% APY`, x, y - 5);
  };

  const drawPaths = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    fieldPositions.forEach(pos => {
      const screenX = centerX + (pos.x * Math.cos(cameraAngle) - pos.z * Math.sin(cameraAngle)) * scale;
      const screenY = centerY + pos.y * scale * 0.5 + 80;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 80);
      ctx.lineTo(screenX, screenY);
      ctx.stroke();
    });
    
    ctx.setLineDash([]);
  };

  const drawCentralHub = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Hub glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Hub center
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Rotating elements
    const angle = cameraAngle * 3;
    for (let i = 0; i < 6; i++) {
      const elemAngle = (i / 6) * Math.PI * 2 + angle;
      const elemX = x + Math.cos(elemAngle) * 25;
      const elemY = y + Math.sin(elemAngle) * 25;
      
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(elemX, elemY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const updateParticles = () => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life + 1,
      vy: particle.vy + (particle.type === 'weather' ? -0.001 : 0.0005) // Gravity
    })).filter(particle => particle.life < particle.maxLife && particle.y > -0.2));
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.3 * zoom;
    
    particles.forEach(particle => {
      const screenX = centerX + particle.x * scale;
      const screenY = centerY + (particle.y - 0.5) * scale + 80;
      
      const alpha = 1 - (particle.life / particle.maxLife);
      ctx.fillStyle = particle.color.includes('rgba') ? 
        particle.color : 
        particle.color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
      
      ctx.beginPath();
      ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Particle trails for special effects
      if (particle.type === 'reward') {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX - particle.vx * scale * 20, screenY - particle.vy * scale * 20);
        ctx.stroke();
      }
    });
  };

  // Handle canvas interactions
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.3 * zoom;
    
    // Check if click is on a field
    fieldPositions.forEach(pos => {
      const screenX = centerX + (pos.x * Math.cos(cameraAngle) - pos.z * Math.sin(cameraAngle)) * scale;
      const screenY = centerY + pos.y * scale * 0.5 + 80;
      
      const distance = Math.sqrt(Math.pow(clickX - screenX, 2) + Math.pow(clickY - screenY, 2));
      if (distance < 40) {
        setSelectedField(pos.field);
        onFieldSelect?.(pos.field);
      }
    });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.3 * zoom;
    
    let hovering = false;
    fieldPositions.forEach(pos => {
      const screenX = centerX + (pos.x * Math.cos(cameraAngle) - pos.z * Math.sin(cameraAngle)) * scale;
      const screenY = centerY + pos.y * scale * 0.5 + 80;
      
      const distance = Math.sqrt(Math.pow(mouseX - screenX, 2) + Math.pow(mouseY - screenY, 2));
      if (distance < 40) {
        setHoveredField(pos.id);
        hovering = true;
      }
    });
    
    if (!hovering) {
      setHoveredField(null);
    }
  };

  // Weather effects
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      const weathers: WeatherState[] = ['sunny', 'rainy', 'windy', 'cloudy'];
      setWeatherState(weathers[Math.floor(Math.random() * weathers.length)]);
    }, 15000);
    
    return () => clearInterval(weatherInterval);
  }, []);

  // Particle generation
  useEffect(() => {
    if (isPlaying) {
      const particleInterval = setInterval(generateParticles, 3000);
      return () => clearInterval(particleInterval);
    }
  }, [isPlaying, showParticles, fieldPositions, weatherState]);

  // Animation control
  useEffect(() => {
    if (isPlaying) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, zoom, showParticles]);

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
    <div className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-green-200 rounded-xl overflow-hidden shadow-2xl border border-emerald-200">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        style={{ imageRendering: 'crisp-edges' }}
        aria-label="Interactive 3D farm visualization"
        role="img"
      />
      
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-black/20 backdrop-blur-sm text-white rounded-lg hover:bg-black/30 transition-all"
            aria-label={isPlaying ? "Pause animation" : "Play animation"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          
          <button
            onClick={() => setCameraAngle(0)}
            className="p-2 bg-black/20 backdrop-blur-sm text-white rounded-lg hover:bg-black/30 transition-all"
          >
            <RotateCcw size={16} />
          </button>
          
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`p-2 backdrop-blur-sm rounded-lg transition-all ${showParticles ? 'bg-emerald-500/50 text-white' : 'bg-black/20 text-white'}`}
          >
            <Sparkles size={16} />
          </button>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 backdrop-blur-sm rounded-lg transition-all ${soundEnabled ? 'bg-blue-500/50 text-white' : 'bg-black/20 text-white'}`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
        
        {/* Zoom Control */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="text-white hover:text-emerald-200 transition-colors"
          >
            -
          </button>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-16"
          />
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="text-white hover:text-emerald-200 transition-colors"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Weather Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/20 backdrop-blur-sm text-white rounded-lg px-3 py-2">
        {weatherState === 'sunny' && <Sun size={16} className="text-yellow-300" />}
        {weatherState === 'rainy' && <Droplets size={16} className="text-blue-300" />}
        {weatherState === 'windy' && <Wind size={16} className="text-gray-300" />}
        {weatherState === 'cloudy' && <span className="text-gray-300">☁</span>}
        <span className="capitalize text-sm">{weatherState}</span>
      </div>
      
      {/* Time of Day Indicator */}
      <div className="absolute top-16 right-4 bg-black/20 backdrop-blur-sm text-white rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-75"></div>
          <span className="text-xs">
            {timeOfDay < 0.25 ? 'Night' : 
             timeOfDay < 0.5 ? 'Morning' : 
             timeOfDay < 0.75 ? 'Day' : 'Evening'}
          </span>
        </div>
      </div>
      
      {/* Selected Field Info */}
      {selectedField && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/30 backdrop-blur-md text-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{selectedField.crop_name} - Field {selectedField.field_id}</h3>
            <button 
              onClick={() => setSelectedField(null)}
              className="text-white/60 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-white/60">Growth</div>
              <div className="font-semibold">{selectedField.growth_progress_percent}%</div>
            </div>
            <div>
              <div className="text-white/60">APY</div>
              <div className="font-semibold text-emerald-300">{selectedField.investment_pool.apy_estimate}%</div>
            </div>
            <div>
              <div className="text-white/60">Staked</div>
              <div className="font-semibold">{selectedField.investment_pool.total_staked.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-white/60">Moisture</div>
              <div className="font-semibold">{selectedField.soil_moisture_percent}%</div>
            </div>
          </div>
          
          {/* Mini progress bars */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Growth Progress</span>
              <span>{selectedField.growth_progress_percent}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${selectedField.growth_progress_percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {!farmData && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading FarmVerse 3D...</p>
          </div>
        </div>
      )}
      
      {/* Floating Action Button */}
      <button
        onClick={() => {
          // Toggle fullscreen or advanced view
          console.log('Advanced 3D features coming soon!');
        }}
        className="absolute bottom-4 right-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        <Maximize2 size={20} />
      </button>
    </div>
  );
}