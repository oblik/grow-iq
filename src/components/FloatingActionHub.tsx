"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Eye, 
  Brain, 
  Zap, 
  Settings, 
  Maximize2,
  Camera,
  Layers,
  Activity,
  Music,
  Palette,
  Rocket
} from "lucide-react";

interface FloatingActionHubProps {
  onAction?: (action: string) => void;
  className?: string;
}

type ActionItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string[];
  action: () => void;
};

export default function FloatingActionHub({ 
  onAction, 
  className = "" 
}: FloatingActionHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const hubRef = useRef<HTMLDivElement>(null);

  const actions: ActionItem[] = [
    {
      id: 'vr-mode',
      label: 'VR Mode',
      icon: <Eye size={20} />,
      color: '#00ff88',
      gradient: ['#00ff88', '#00d4ff'],
      action: () => handleAction('vr-mode')
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: <Brain size={20} />,
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#a78bfa'],
      action: () => handleAction('ai-insights')
    },
    {
      id: 'neural-view',
      label: 'Neural View',
      icon: <Activity size={20} />,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fbbf24'],
      action: () => handleAction('neural-view')
    },
    {
      id: 'holographic',
      label: 'Holographic',
      icon: <Layers size={20} />,
      color: '#06b6d4',
      gradient: ['#06b6d4', '#0891b2'],
      action: () => handleAction('holographic')
    },
    {
      id: 'screenshot',
      label: 'Screenshot',
      icon: <Camera size={20} />,
      color: '#ec4899',
      gradient: ['#ec4899', '#f472b6'],
      action: () => handleAction('screenshot')
    },
    {
      id: 'sound-fx',
      label: 'Sound FX',
      icon: <Music size={20} />,
      color: '#10b981',
      gradient: ['#10b981', '#22c55e'],
      action: () => handleAction('sound-fx')
    },
    {
      id: 'themes',
      label: 'Themes',
      icon: <Palette size={20} />,
      color: '#ef4444',
      gradient: ['#ef4444', '#f87171'],
      action: () => handleAction('themes')
    },
    {
      id: 'boost',
      label: 'Boost',
      icon: <Rocket size={20} />,
      color: '#7c3aed',
      gradient: ['#7c3aed', '#8b5cf6'],
      action: () => handleAction('boost')
    }
  ];

  const handleAction = (actionId: string) => {
    onAction?.(actionId);
    createRipple();
    
    // Handle specific actions
    switch (actionId) {
      case 'vr-mode':
        console.log('🥽 Entering VR Mode...');
        break;
      case 'ai-insights':
        console.log('🤖 Loading AI Insights...');
        break;
      case 'neural-view':
        console.log('🧠 Activating Neural View...');
        break;
      case 'holographic':
        console.log('✨ Enabling Holographic Display...');
        break;
      case 'screenshot':
        console.log('📸 Taking Screenshot...');
        break;
      case 'sound-fx':
        console.log('🔊 Toggling Sound Effects...');
        break;
      case 'themes':
        console.log('🎨 Opening Theme Selector...');
        break;
      case 'boost':
        console.log('🚀 Activating Performance Boost...');
        break;
    }
    
    setIsOpen(false);
  };

  const createRipple = () => {
    const newRipple = {
      id: Date.now(),
      x: 50,
      y: 50
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  };

  const toggleHub = () => {
    setIsOpen(!isOpen);
    createRipple();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Action Items */}
      <div className={`absolute bottom-20 right-0 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
        <div className="flex flex-col-reverse gap-3">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={`transform transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ 
                transitionDelay: `${index * 50}ms`,
                transform: isOpen ? 'translateY(0)' : 'translateY(40px)'
              }}
            >
              <button
                onClick={action.action}
                onMouseEnter={() => setHoveredItem(action.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="group relative flex items-center justify-center w-12 h-12 rounded-full border-2 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: `${action.color}22`,
                  borderColor: action.color,
                  boxShadow: `0 4px 20px ${action.color}44, inset 0 1px 0 ${action.color}66`
                }}
              >
                <div style={{ color: action.color }}>
                  {action.icon}
                </div>
                
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${action.color}66, transparent)`
                  }}
                />
                
                {/* Label */}
                <div 
                  className={`absolute right-14 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg backdrop-blur-xl border transition-all duration-200 whitespace-nowrap ${
                    hoveredItem === action.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                  }`}
                  style={{
                    backgroundColor: `${action.color}22`,
                    borderColor: action.color,
                    color: action.color
                  }}
                >
                  <span className="text-sm font-medium">{action.label}</span>
                  
                  {/* Arrow */}
                  <div 
                    className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-4 border-transparent"
                    style={{ borderLeftColor: action.color }}
                  />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Hub Button */}
      <div className="relative" ref={hubRef}>
        <button
          onClick={toggleHub}
          className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-2 border-purple-400 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
          style={{
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-30 animate-pulse" />
          
          {/* Icon */}
          <div className="relative z-10 text-white transform transition-transform duration-300">
            {isOpen ? (
              <div className="rotate-45">
                <Sparkles size={24} />
              </div>
            ) : (
              <Sparkles size={24} />
            )}
          </div>
          
          {/* Ripple effects */}
          {ripples.map(ripple => (
            <div
              key={ripple.id}
              className="absolute inset-0 border-2 border-white rounded-full animate-ping"
              style={{
                left: `${ripple.x - 50}%`,
                top: `${ripple.y - 50}%`,
                width: '100%',
                height: '100%'
              }}
            />
          ))}
          
          {/* Rotating orbital ring */}
          <div className="absolute inset-[-4px] rounded-full opacity-60 animate-spin" style={{ animationDuration: '4s' }}>
            <div className="w-full h-full rounded-full border border-dashed border-purple-300" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-purple-300 rounded-full" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-blue-300 rounded-full" />
          </div>
        </button>

        {/* Floating particles */}
        {isOpen && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
                style={{
                  left: `${50 + Math.cos((i * 60) * Math.PI / 180) * 40}%`,
                  top: `${50 + Math.sin((i * 60) * Math.PI / 180) * 40}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Custom CSS for float animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.8;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}