"use client";
import { useState, useEffect, useRef } from "react";
import { Brain, Cpu, Zap, Activity, Settings, Play, Pause, RotateCw } from "lucide-react";

interface NeuralVisualizerProps {
  data?: number[][];
  isActive?: boolean;
  className?: string;
  theme?: 'matrix' | 'neural' | 'quantum' | 'cyberpunk';
  speed?: number;
  intensity?: number;
}

type Neuron = {
  id: number;
  x: number;
  y: number;
  layer: number;
  activation: number;
  connections: Connection[];
  pulseTime: number;
  size: number;
};

type Connection = {
  from: number;
  to: number;
  weight: number;
  activity: number;
  pulse: number;
};

type DataPulse = {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  intensity: number;
  color: string;
};

const THEMES = {
  matrix: {
    bg: 'radial-gradient(circle at center, #001122 0%, #000011 100%)',
    neuron: '#00ff88',
    connection: '#004422',
    pulse: '#00ffaa',
    glow: '#00ff88'
  },
  neural: {
    bg: 'radial-gradient(circle at center, #1a1a2e 0%, #16213e 100%)',
    neuron: '#00d4ff',
    connection: '#0066cc',
    pulse: '#00aaff',
    glow: '#0099ff'
  },
  quantum: {
    bg: 'radial-gradient(circle at center, #2d1b69 0%, #11001b 100%)',
    neuron: '#bb86fc',
    connection: '#6200ea',
    pulse: '#cf6679',
    glow: '#bb86fc'
  },
  cyberpunk: {
    bg: 'radial-gradient(circle at center, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
    neuron: '#ff006e',
    connection: '#8338ec',
    pulse: '#ffbe0b',
    glow: '#ff006e'
  }
};

export default function NeuralVisualizer({
  data,
  isActive = true,
  className = "",
  theme = 'neural',
  speed = 1,
  intensity = 1
}: NeuralVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [dataPulses, setDataPulses] = useState<DataPulse[]>([]);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [stats, setStats] = useState({ 
    neurons: 0, 
    connections: 0, 
    pulses: 0,
    activity: 0 
  });

  // Initialize neural network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layers = [8, 12, 16, 12, 8]; // Network architecture
    const newNeurons: Neuron[] = [];
    let neuronId = 0;

    // Create neurons
    layers.forEach((layerSize, layerIndex) => {
      for (let i = 0; i < layerSize; i++) {
        const x = (canvas.width / (layers.length - 1)) * layerIndex;
        const y = (canvas.height / (layerSize + 1)) * (i + 1);
        
        newNeurons.push({
          id: neuronId++,
          x,
          y,
          layer: layerIndex,
          activation: Math.random() * 0.3,
          connections: [],
          pulseTime: 0,
          size: 4 + Math.random() * 4
        });
      }
    });

    // Create connections
    newNeurons.forEach(neuron => {
      if (neuron.layer < layers.length - 1) {
        const nextLayerNeurons = newNeurons.filter(n => n.layer === neuron.layer + 1);
        
        nextLayerNeurons.forEach(targetNeuron => {
          // Probabilistic connection
          if (Math.random() < 0.7) {
            neuron.connections.push({
              from: neuron.id,
              to: targetNeuron.id,
              weight: (Math.random() - 0.5) * 2,
              activity: 0,
              pulse: 0
            });
          }
        });
      }
    });

    setNeurons(newNeurons);

    // Update stats
    const totalConnections = newNeurons.reduce((sum, n) => sum + n.connections.length, 0);
    setStats(prev => ({
      ...prev,
      neurons: newNeurons.length,
      connections: totalConnections
    }));
  }, []);

  // Process input data
  useEffect(() => {
    if (!data || !neurons.length) return;

    // Simulate data processing through the network
    const inputLayer = neurons.filter(n => n.layer === 0);
    
    // Set input activations
    data[0]?.forEach((value, index) => {
      if (inputLayer[index]) {
        inputLayer[index].activation = Math.max(0, Math.min(1, value * intensity));
      }
    });

    // Forward propagation simulation
    for (let layer = 1; layer < 5; layer++) {
      const layerNeurons = neurons.filter(n => n.layer === layer);
      const prevLayerNeurons = neurons.filter(n => n.layer === layer - 1);
      
      layerNeurons.forEach(neuron => {
        let activation = 0;
        prevLayerNeurons.forEach(prevNeuron => {
          const connection = prevNeuron.connections.find(c => c.to === neuron.id);
          if (connection) {
            activation += prevNeuron.activation * connection.weight;
          }
        });
        
        // Apply activation function (sigmoid)
        neuron.activation = 1 / (1 + Math.exp(-activation));
      });
    }

    setNeurons([...neurons]);
  }, [data, neurons, intensity]);

  // Animation loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!isPlaying) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Clear canvas
      const themeColors = THEMES[currentTheme];
      ctx.fillStyle = themeColors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update neurons
      const updatedNeurons = neurons.map(neuron => ({
        ...neuron,
        activation: Math.max(0, neuron.activation + (Math.random() - 0.5) * 0.02 * speed),
        pulseTime: neuron.pulseTime + speed * 2
      }));

      // Create data pulses
      const newPulses: DataPulse[] = [];
      updatedNeurons.forEach(neuron => {
        if (Math.random() < neuron.activation * 0.1 * speed) {
          neuron.connections.forEach(connection => {
            const targetNeuron = updatedNeurons.find(n => n.id === connection.to);
            if (targetNeuron && Math.random() < 0.3) {
              newPulses.push({
                id: Date.now() + Math.random(),
                fromX: neuron.x,
                fromY: neuron.y,
                toX: targetNeuron.x,
                toY: targetNeuron.y,
                progress: 0,
                intensity: neuron.activation,
                color: themeColors.pulse
              });
            }
          });
        }
      });

      // Update existing pulses
      const updatedPulses = dataPulses
        .concat(newPulses)
        .map(pulse => ({
          ...pulse,
          progress: Math.min(1, pulse.progress + 0.02 * speed)
        }))
        .filter(pulse => pulse.progress < 1);

      setDataPulses(updatedPulses);

      // Draw connections
      ctx.strokeStyle = themeColors.connection;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;
      
      updatedNeurons.forEach(neuron => {
        neuron.connections.forEach(connection => {
          const targetNeuron = updatedNeurons.find(n => n.id === connection.to);
          if (targetNeuron) {
            ctx.beginPath();
            ctx.moveTo(neuron.x, neuron.y);
            ctx.lineTo(targetNeuron.x, targetNeuron.y);
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;

      // Draw data pulses
      updatedPulses.forEach(pulse => {
        const currentX = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress;
        const currentY = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress;
        
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 10 * pulse.intensity;
        
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2 + pulse.intensity * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail effect
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8 + pulse.intensity * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      ctx.shadowBlur = 0;

      // Draw neurons
      updatedNeurons.forEach(neuron => {
        const activation = Math.sin(neuron.pulseTime * 0.1) * 0.2 + neuron.activation;
        const alpha = 0.3 + activation * 0.7;
        
        // Glow effect
        ctx.shadowColor = themeColors.glow;
        ctx.shadowBlur = activation * 20;
        
        // Neuron body
        ctx.fillStyle = themeColors.neuron;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.size + activation * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = activation * 0.8;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, (neuron.size + activation * 2) * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
      });

      ctx.shadowBlur = 0;

      // Update stats
      const avgActivity = updatedNeurons.reduce((sum, n) => sum + n.activation, 0) / updatedNeurons.length;
      setStats(prev => ({
        ...prev,
        pulses: updatedPulses.length,
        activity: Math.round(avgActivity * 100)
      }));

      setNeurons(updatedNeurons);
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, neurons, dataPulses, currentTheme, speed]);

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

  const cycleTheme = () => {
    const themes = Object.keys(THEMES) as Array<keyof typeof THEMES>;
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200/20 ${className}`}>
      {/* Neural Network Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: THEMES[currentTheme].bg,
          imageRendering: 'crisp-edges'
        }}
      />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-black/20 backdrop-blur-sm text-white rounded-lg hover:bg-black/30 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          
          <button
            onClick={cycleTheme}
            className="p-2 bg-black/20 backdrop-blur-sm text-white rounded-lg hover:bg-black/30 transition-all"
            title="Change theme"
          >
            <RotateCw size={16} />
          </button>
          
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm text-white rounded-lg px-3 py-2">
            <Brain size={16} />
            <span className="text-xs font-mono">{currentTheme.toUpperCase()}</span>
          </div>
        </div>
      </div>
      
      {/* Stats Panel */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white rounded-lg p-3 border border-white/20">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-green-400" />
          <span className="text-sm font-bold drop-shadow-lg">Neural Activity</span>
        </div>
        
        <div className="space-y-1 text-xs font-mono">
          <div className="flex justify-between gap-4">
            <span className="text-white drop-shadow-md">Neurons:</span>
            <span className="text-cyan-300 font-bold drop-shadow-md">{stats.neurons}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white drop-shadow-md">Connections:</span>
            <span className="text-blue-300 font-bold drop-shadow-md">{stats.connections}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white drop-shadow-md">Active Pulses:</span>
            <span className="text-purple-300 font-bold drop-shadow-md">{stats.pulses}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white drop-shadow-md">Avg Activity:</span>
            <span className="text-green-300 font-bold drop-shadow-md">{stats.activity}%</span>
          </div>
        </div>
        
        {/* Activity Bar */}
        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-green-400 to-cyan-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${stats.activity}%` }}
          />
        </div>
      </div>
      
      {/* Layer Labels */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white text-xs font-semibold">
        <span className="drop-shadow-lg">INPUT</span>
        <span className="drop-shadow-lg">HIDDEN</span>
        <span className="drop-shadow-lg">PROCESSING</span>
        <span className="drop-shadow-lg">ANALYSIS</span>
        <span className="drop-shadow-lg">OUTPUT</span>
      </div>
      
      {/* Loading State */}
      {neurons.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm font-semibold drop-shadow-lg">Initializing Neural Network...</p>
          </div>
        </div>
      )}
      
      {/* Data Input Indicator */}
      {data && data.length > 0 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/20 backdrop-blur-sm text-white rounded-lg px-3 py-2">
          <Zap size={14} className="text-yellow-400 animate-pulse" />
          <span className="text-xs">Processing Data</span>
        </div>
      )}
    </div>
  );
}