
import React, { useState, useEffect, useRef } from 'react';
import { LiveVoiceAgent } from './components/LiveVoiceAgent';
import { Button } from './components/Button';
import { GoogleGenAI } from '@google/genai';
import { mockBackendService } from './services/mockBackend';

// --- SVGs & Icons ---
const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const VoiceAiIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.5 10.5v3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.5 10.5v3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2v3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19v3" /></svg>;
const StarIcon = ({ className = "w-4 h-4 text-white fill-current" }: { className?: string }) => <svg className={className} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>;
const WorkflowIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DataIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const CrmIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const BrainIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ShieldCheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const ServerIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
const ZapIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const TrophyIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>;
const MailIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;


// --- Brand Logo Component (Rounded Triangle with W) ---
const WozenaLogo = ({ className = "w-8 h-8", fill = "currentColor" }: { className?: string, fill?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M11.999 1.5C18.667 1.5 22 5.8 22 12C22 18.2 18.667 22.5 11.999 22.5C5.331 22.5 2 18.2 2 12C2 5.8 5.331 1.5 11.999 1.5Z" 
      fill={fill} 
      className="transition-colors duration-300"
    />
    <path 
      d="M7 8L9.5 16H11.5L12 13L12.5 16H14.5L17 8H15L14 13L13.5 8H10.5L10 13L9 8H7Z" 
      fill="currentColor" 
      className="text-white dark:text-black" 
    />
  </svg>
);

// --- Components ---

// Scroll Reveal Component
interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      style={{ transitionDelay: `${delay}ms` }} 
      className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
    >
      {children}
    </div>
  );
};

// Meteor Effect Component
const MeteorEffect = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="absolute h-0.5 w-0.5 rounded-full bg-zinc-900 dark:bg-white shadow-[0_0_40px_2px_currentColor] animate-meteor"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5 + 0.5}s`,
                        animationDuration: `${Math.random() * 5 + 3}s`,
                    }}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[100px] h-[1px] bg-gradient-to-r from-transparent via-zinc-900/50 dark:via-white/50 to-transparent transform rotate-180 origin-left" />
                </div>
            ))}
        </div>
    );
};

// Confetti Effect Component
const Confetti = () => {
  const [particles, setParticles] = useState<Array<{id: number, left: string, delay: string, duration: string, size: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${Math.random() * 2 + 2}s`,
      size: Math.random() * 6 + 4
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-sm opacity-80 ${p.id % 2 === 0 ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-400'}`}
          style={{
            left: p.left,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `confetti ${p.duration} ease-out ${p.delay} forwards`
          }}
        />
      ))}
    </div>
  );
};

// Hyper Text Component (Liquid Gradient) - Monochrome
const HyperText = ({ text, className = "" }: { text: string, className?: string }) => {
    return (
        <span className={`bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.zinc.900),theme(colors.zinc.500),theme(colors.zinc.900),theme(colors.zinc.500))] dark:bg-[linear-gradient(to_right,theme(colors.white),theme(colors.zinc.400),theme(colors.white),theme(colors.zinc.400))] bg-[length:200%_auto] animate-shine inline-block ${className}`}>
            {text}
        </span>
    );
};

// 1. Hero Animation: "System Stable Infrastructure" (Match Reference)
const AgentHologramCard = () => {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt
        const rotateX = ((y - centerY) / centerY) * -4; // degrees
        const rotateY = ((x - centerX) / centerX) * 4; // degrees

        setRotate({ x: rotateX, y: rotateY });
        setSpotlight({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    };

    const onMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
        setSpotlight({ x: 50, y: 50 });
    };

    return (
      <div className="perspective-1000 relative w-full max-w-[480px] mx-auto z-20">
        
        {/* Main Card Container */}
        <div 
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transformStyle: 'preserve-3d',
            }}
            className="bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:bg-[#030303] rounded-3xl overflow-hidden shadow-2xl relative transition-transform duration-200 ease-out"
        >
            
            {/* Dynamic Spotlight Effect */}
            <div 
                className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.06) 0%, transparent 50%)`
                }}
            />

            {/* Header */}
            <div className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/5 dark:bg-[#050505]/90 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-900/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">System Stable</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Secure</span>
                </div>
            </div>

            {/* Body */}
            <div className="relative h-[400px] bg-zinc-950 dark:bg-[#020202] flex items-center justify-center overflow-hidden transform-style-3d">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                
                {/* Breathing Background Hue/Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,78,59,0.15),transparent_70%)] animate-pulse-slow"></div>

                {/* Central Core System */}
                <div className="relative z-10 flex items-center justify-center transform-style-3d">
                    
                    {/* Concentric Rings with varied speeds/opacity - Gyroscopic Effect */}
                    {/* Ring 1: Slow, Outer, Dashed */}
                    <div className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-zinc-700/60 dark:border-zinc-800/60 opacity-60 animate-[spin_60s_linear_infinite]"></div>
                    
                    {/* Ring 2: Medium, Reverse, Subtle Emerald Accent */}
                    <div className="absolute w-[240px] h-[240px] rounded-full border border-zinc-700/40 dark:border-zinc-800/40 border-t-emerald-900/40 border-b-emerald-900/40 animate-[spin_45s_linear_infinite_reverse]"></div>
                    
                    {/* Ring 3: Fast, Inner, Fine */}
                    <div className="absolute w-[180px] h-[180px] rounded-full border border-zinc-700/30 dark:border-zinc-800/30 border-l-zinc-600 dark:border-l-zinc-700 border-r-zinc-600 dark:border-r-zinc-700 animate-[spin_30s_linear_infinite]"></div>
                    
                    {/* The Core */}
                    <div 
                        className="relative w-24 h-24 bg-gradient-to-b from-zinc-800 to-zinc-950 dark:from-zinc-900 dark:to-black rounded-2xl border border-zinc-600 dark:border-zinc-700 shadow-2xl flex items-center justify-center z-20 group transform-style-3d hover:scale-105 transition-transform duration-500"
                        style={{ transform: 'translateZ(20px)' }}
                    >
                        {/* Core Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl opacity-50"></div>
                        
                        {/* W Logo with synced pulse - UPDATED LOGO */}
                        <div className="z-30 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse relative">
                            <WozenaLogo className="w-14 h-14 text-white fill-white" />
                        </div>
                        
                        {/* Inner breathing glow */}
                        <div className="absolute inset-0 rounded-2xl bg-white/5 animate-pulse-slow"></div>
                    </div>

                    {/* Connected Nodes - Organic Floating */}
                    {/* Node 1: Auto-Scaling (Top) */}
                    <div className="absolute -top-[100px] flex flex-col items-center animate-float">
                        <div className="px-3 py-1.5 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-2 shadow-lg mb-2 hover:border-zinc-500 transition-colors duration-300 cursor-default">
                            <ServerIcon className="w-3 h-3 text-zinc-400" />
                            <span className="text-[10px] font-mono font-bold text-white tracking-wide">Auto-Scaling</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-800 border-l border-dashed border-zinc-700"></div>
                    </div>

                    {/* Node 2: Self-Healing (Bottom Left) */}
                    <div className="absolute -bottom-[90px] -left-[80px] flex flex-col items-end animate-float-delayed">
                         <div className="h-10 w-px bg-zinc-800 border-l border-dashed border-zinc-700 origin-bottom rotate-[-30deg] translate-x-4"></div>
                         <div className="px-3 py-1.5 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-2 shadow-lg hover:border-zinc-500 transition-colors duration-300 cursor-default">
                            <ZapIcon className="w-3 h-3 text-zinc-400" />
                            <span className="text-[10px] font-mono font-bold text-white tracking-wide">Self-Healing</span>
                        </div>
                    </div>

                    {/* Node 3: E2E Encrypted (Bottom Right) */}
                    <div className="absolute -bottom-[90px] -right-[80px] flex flex-col items-start animate-float" style={{ animationDelay: '1.5s' }}>
                         <div className="h-10 w-px bg-zinc-800 border-l border-dashed border-zinc-700 origin-bottom rotate-[30deg] -translate-x-4"></div>
                         <div className="px-3 py-1.5 bg-[#0a0a0a] border border-zinc-800 rounded-lg flex items-center gap-2 shadow-lg hover:border-zinc-500 transition-colors duration-300 cursor-default">
                            <ShieldCheckIcon className="w-3 h-3 text-zinc-400" />
                            <span className="text-[10px] font-mono font-bold text-white tracking-wide">E2E Encrypted</span>
                        </div>
                    </div>

                </div>

            </div>

            {/* Footer Metrics */}
            <div className="relative z-10 grid grid-cols-3 border-t border-white/10 bg-black/5 dark:bg-[#050505] divide-x divide-white/10">
                <div className="p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-default group">
                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors">Uptime SLA</span>
                    <span className="text-sm font-mono font-bold text-zinc-200 dark:text-white">99.99%</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-default group">
                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors">Requests/Sec</span>
                    <span className="text-sm font-mono font-bold text-zinc-200 dark:text-white">12.4k</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-default group">
                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors">Global Latency</span>
                    <span className="text-sm font-mono font-bold text-emerald-500">~45ms</span>
                </div>
            </div>

        </div>
      </div>
    );
};

// Input Component with Animation - Monochrome
const FocusInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (e: any) => void, placeholder: string }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex justify-between">
                {label}
                {hasValue && <span className="text-zinc-900 dark:text-white animate-pulse">● Processing</span>}
            </label>
            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
                {/* Animated Border Gradient */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-zinc-400 to-zinc-200 dark:from-zinc-600 dark:to-white rounded-lg opacity-0 transition duration-500 blur-sm ${isFocused ? 'opacity-30' : 'group-hover:opacity-10'}`}></div>
                
                {/* Active Background Pulse */}
                <div className={`absolute inset-0 bg-zinc-200/50 dark:bg-white/5 rounded-lg transition-opacity duration-700 ${hasValue || isFocused ? 'animate-pulse opacity-100' : 'opacity-0'}`}></div>

                <input 
                  type="text" 
                  value={value}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={onChange}
                  placeholder={placeholder}
                  className="relative w-full bg-white dark:bg-[#080808] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-0 transition-all font-mono text-sm shadow-xl z-10"
                />

                {/* Scanning Beam (Bottom) */}
                <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-900 dark:via-white to-transparent transition-all duration-300 z-20 ${isFocused ? 'w-full opacity-100 animate-scan-fast' : 'w-0 opacity-0'}`}></div>
                
                {/* Typing Indicator Icon */}
                {isFocused && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex gap-1 pointer-events-none">
                        <div className="w-1 h-1 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Text Area Component with Animation - Monochrome
const FocusTextArea = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (e: any) => void, placeholder: string }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex justify-between">
                {label}
                {hasValue && <span className="text-zinc-900 dark:text-white animate-pulse">● Processing</span>}
            </label>
            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
                {/* Animated Border Gradient */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-zinc-400 to-zinc-200 dark:from-zinc-600 dark:to-white rounded-lg opacity-0 transition duration-500 blur-sm ${isFocused ? 'opacity-30' : 'group-hover:opacity-10'}`}></div>
                
                {/* Active Background Pulse */}
                <div className={`absolute inset-0 bg-zinc-200/50 dark:bg-white/5 rounded-lg transition-opacity duration-700 ${hasValue || isFocused ? 'animate-pulse opacity-100' : 'opacity-0'}`}></div>

                <textarea
                  value={value}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={onChange}
                  placeholder={placeholder}
                  rows={4}
                  className="relative w-full bg-white dark:bg-[#080808] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-0 transition-all font-mono text-sm shadow-xl z-10 resize-none"
                />

                {/* Scanning Beam (Bottom) */}
                <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-900 dark:via-white to-transparent transition-all duration-300 z-20 ${isFocused ? 'w-full opacity-100 animate-scan-fast' : 'w-0 opacity-0'}`}></div>
                
                {/* Typing Indicator Icon */}
                {isFocused && (
                    <div className="absolute right-3 top-6 z-20 flex gap-1 pointer-events-none">
                        <div className="w-1 h-1 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-zinc-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 2. Strategy Generator (B&W Terminal with RGB Controls)
const StrategyGenerator = () => {
  const [industry, setIndustry] = useState('');
  const [bottleneck, setBottleneck] = useState('');
  const [generatedStrategy, setGeneratedStrategy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if(!industry || !bottleneck) return;
    setIsGenerating(true);
    setGeneratedStrategy(null);

    try {
        const apiKey = process.env.API_KEY;
        const ai = new GoogleGenAI({ apiKey: apiKey || '' });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Act as a senior automation architect. Create a brief, high-level automation strategy (max 150 words) for a "${industry}" business facing "${bottleneck}". 
            Format the output as a Markdown list with bold headers. Use professional, technical language. 
            Focus on specific tools (e.g., Gemini, Twilio, Zapier) and architectural patterns.`
        });
        setGeneratedStrategy(response.text);
    } catch (e) {
        setGeneratedStrategy("Error generating strategy. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <section id="strategy" className="py-24 bg-white dark:bg-[#050505] relative border-t border-zinc-200 dark:border-zinc-900 overflow-hidden transition-colors duration-300">
       {/* High contrast ambient bg */}
       <div className="absolute top-0 right-0 w-full h-full bg-grid-pattern opacity-[0.03]"></div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Input Side */}
          <Reveal>
              <div className="flex items-center gap-2 mb-6 opacity-70">
                <span className="text-zinc-500 font-mono text-xs font-bold tracking-wider">&gt;_ SYSTEM_GENERATOR_V2</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-[1.1]">
                  Generate Your <br />
                  <span className="text-zinc-400 dark:text-zinc-500">Automation Strategy</span>
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-10 max-w-md text-sm leading-relaxed">
                  Not sure where to start? Describe your business and pain points. 
                  Our engine will architect a custom Automata solution for you instantly.
              </p>

              <div className="space-y-6 max-w-md">
                  <FocusInput 
                    label="Industry / Sector"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Dental Clinic, Logistics Firm..."
                  />

                  <FocusInput 
                    label="Operational Bottleneck"
                    value={bottleneck}
                    onChange={(e) => setBottleneck(e.target.value)}
                    placeholder="e.g. Missing after-hours calls..."
                  />

                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !industry || !bottleneck}
                    className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black font-bold h-12 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                      {isGenerating ? (
                          <>
                           <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                           Processing...
                          </>
                      ) : (
                          <>
                            Generate Strategy
                          </>
                      )}
                  </button>
              </div>
          </Reveal>

          {/* Output Side - Terminal Style (Strict B&W - Always Dark) */}
          <Reveal delay={200} className="relative">
              <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden min-h-[420px] flex flex-col shadow-2xl relative">
                  
                  {/* Terminal Header */}
                  <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                      <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></div>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">wozena_output.md</div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8 font-mono text-sm leading-relaxed overflow-y-auto max-h-[420px] no-scrollbar flex-1 flex flex-col">
                      {!generatedStrategy && !isGenerating && (
                          <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 space-y-6">
                              <span className="text-8xl opacity-10 font-thin">&gt;</span>
                              <p className="max-w-[200px] text-center text-xs text-zinc-600">Awaiting input parameters.</p>
                          </div>
                      )}
                      
                      {isGenerating && (
                          <div className="space-y-3 pt-4">
                              <div className="flex items-center gap-3 text-white">
                                  <span className="opacity-50">1</span>
                                  <span>&gt; Analyzing industry requirements...</span>
                              </div>
                              <div className="flex items-center gap-3 text-zinc-400 animate-pulse delay-100">
                                  <span className="opacity-50">2</span>
                                  <span>&gt; Identifying bottleneck constraints...</span>
                              </div>
                              <div className="flex items-center gap-3 text-zinc-600 animate-pulse delay-200">
                                  <span className="opacity-50">3</span>
                                  <span>&gt; Synthesizing solution...</span>
                              </div>
                          </div>
                      )}

                      {generatedStrategy && (
                          <div className="text-zinc-200 whitespace-pre-line animate-fade-in-up">
                              {generatedStrategy}
                              <span className="inline-block w-2.5 h-5 bg-white ml-1 cursor-blink align-middle"></span>
                          </div>
                      )}
                  </div>
              </div>
          </Reveal>
       </div>
    </section>
  )
}

// 3. Process Section (New)
const ProcessSection = () => {
    const steps = [
      { number: "01", title: "Discovery & Audit", desc: "We meet to understand your business bottlenecks. We identify exactly where AI can replace manual labor to generate ROI." },
      { number: "02", title: "Custom Architecture", desc: "Our engineers design a bespoke solution. We map out the conversation flows, data pipelines, and tool integrations specific to your needs." },
      { number: "03", title: "Development & Testing", desc: "We build your agents and workflows. Rigorous testing ensures 99.9% reliability and human-like interaction before launch." },
      { number: "04", title: "Deployment & Management", desc: "We go live. Wozena monitors the system 24/7, optimizing performance and handling maintenance so you don't have to." },
    ];
  
    return (
      <section id="process" className="py-32 bg-white dark:bg-[#050505] relative z-10 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
              {/* Left Content */}
              <Reveal className="sticky top-32">
                  <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
                      Your Partner In <br />
                      <span className="text-zinc-400 dark:text-zinc-500">Automation.</span>
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-10 max-w-md font-light">
                      Moving from manual operations to AI automation is complex. Our "Done-For-You" service handles the entire lifecycle.
                  </p>
                  <Button
                      onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                       className="h-12 px-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-bold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors border-none"
                  >
                      Start Your Project
                  </Button>
              </Reveal>
  
              {/* Right Steps */}
              <div className="space-y-6">
                  {steps.map((step, idx) => (
                      <Reveal key={step.number} delay={idx * 100}>
                          <div className="group p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md">
                               <div className="absolute top-0 right-0 p-6 opacity-5 font-mono text-7xl font-bold text-zinc-900 dark:text-white group-hover:opacity-10 transition-opacity select-none">
                                  {step.number}
                               </div>
                               <div className="relative z-10">
                                  <div className="flex items-center gap-4 mb-4">
                                      <span className="text-xl font-bold text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors font-mono">{step.number}</span>
                                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{step.title}</h3>
                                  </div>
                                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                                      {step.desc}
                                  </p>
                               </div>
                          </div>
                      </Reveal>
                  ))}
              </div>
          </div>
        </div>
      </section>
    )
  }

// 4. Booking / Discovery Section (Functional Multi-Step)
const BookingSection = () => {
  const [selectedType, setSelectedType] = useState('discovery');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'slot' | 'details' | 'processing' | 'confirmed'>('slot');
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTimeSelect = (time: string) => {
      setSelectedTime(time);
      setStep('details');
  }

  const handleBack = () => {
      setStep('slot');
      setErrorMessage(null);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setErrorMessage(null);
  }

  const handleSubmit = async () => {
      if (!formData.name || !formData.email) return;
      setStep('processing');
      setErrorMessage(null);

      try {
        await mockBackendService.submitBooking({
            type: selectedType,
            date: selectedDate!,
            time: selectedTime!,
            ...formData
        });
        setStep('confirmed');
      } catch (err: any) {
        setErrorMessage(err.message || "An unexpected error occurred.");
        setStep('details');
      }
  }

  const resetBooking = () => {
      setStep('slot');
      setSelectedDate(null);
      setSelectedTime(null);
      setFormData({ name: '', email: '', company: '' });
      setErrorMessage(null);
  }

  const dates = Array.from({length: 12}, (_, i) => 15 + i);

  return (
    <section id="booking" className="py-24 bg-white dark:bg-black relative overflow-hidden border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16">
                
                {/* Left: Selection */}
                <div className="lg:col-span-5 space-y-10">
                    <Reveal>
                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                            Let's Discuss <br />
                            <span className="text-zinc-400 dark:text-zinc-500">Your Project.</span>
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-500 mt-6 text-sm leading-relaxed">
                            Ready to automate your business? Book a free discovery call with a Senior Automation Architect. 
                            We'll analyze your needs and provide a roadmap.
                        </p>
                    </Reveal>

                    <div className="space-y-3">
                        {[
                            { id: 'discovery', title: 'No-Pressure Discovery', desc: 'We listen to your problems first.' },
                            { id: 'technical', title: 'Technical Feasibility', desc: "We'll tell you honestly what AI can do." },
                            { id: 'quote', title: 'Custom Quote', desc: 'Receive a tailored proposal for your needs.' }
                        ].map((option, idx) => (
                            <Reveal key={option.id} delay={idx * 100}>
                                <div 
                                    onClick={() => setSelectedType(option.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-4 group ${
                                        selectedType === option.id 
                                        ? 'bg-zinc-50 border-zinc-300 dark:bg-[#111] dark:border-zinc-700' 
                                        : 'bg-transparent border-zinc-200 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                        selectedType === option.id ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black' : 'border-zinc-300 text-zinc-500 dark:border-zinc-800 dark:text-zinc-600 group-hover:border-zinc-400 dark:group-hover:border-zinc-600'
                                    }`}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold text-sm ${selectedType === option.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>{option.title}</h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5">{option.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>

                {/* Right: Calendar & Form Interface */}
                <Reveal delay={300} className="lg:col-span-7">
                    <div className="bg-white dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 min-h-[520px] flex flex-col shadow-2xl relative overflow-hidden transition-colors duration-300">
                         
                         {step === 'confirmed' ? (
                             <div className="absolute inset-0 z-20 bg-white dark:bg-[#050505] flex flex-col items-center justify-center animate-fade-in-up">
                                 {/* Celebration Confetti */}
                                 <Confetti />
                                 
                                 <div className="w-20 h-20 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center mb-6 relative z-10">
                                     <CheckCircleIcon className="w-10 h-10" />
                                 </div>
                                 <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 relative z-10">Booking Confirmed</h3>
                                 <p className="text-zinc-500 mb-8 relative z-10 text-center">
                                     Thanks, {formData.name.split(' ')[0]}.<br/>
                                     We've sent a confirmation to <span className="text-zinc-900 dark:text-white font-mono">{formData.email}</span>.
                                 </p>
                                 <Button onClick={resetBooking} variant="outline" className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 relative z-10">Book Another</Button>
                             </div>
                         ) : step === 'processing' ? (
                             <div className="absolute inset-0 z-20 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-sm flex flex-col items-center justify-center">
                                 <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white rounded-full animate-spin mb-4"></div>
                                 <p className="text-zinc-500 dark:text-zinc-400 text-sm tracking-widest uppercase">Syncing with Backend...</p>
                             </div>
                         ) : step === 'details' ? (
                             <div className="flex flex-col h-full animate-fade-in-up">
                                 <div className="flex items-center justify-between mb-8">
                                     <div>
                                         <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Finalize Details</div>
                                         <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Booking for Oct {selectedDate} @ {selectedTime}</h3>
                                     </div>
                                     <button onClick={handleBack} className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline">Change Time</button>
                                 </div>
                                 
                                 {errorMessage && (
                                     <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                                         <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                         {errorMessage}
                                     </div>
                                 )}

                                 <div className="space-y-6 flex-1">
                                     <FocusInput 
                                        label="Full Name *" 
                                        value={formData.name} 
                                        onChange={(e) => handleInputChange(e, 'name')} 
                                        placeholder="John Doe" 
                                     />
                                     <FocusInput 
                                        label="Email Address *" 
                                        value={formData.email} 
                                        onChange={(e) => handleInputChange(e, 'email')} 
                                        placeholder="john@company.com" 
                                     />
                                     <FocusInput 
                                        label="Company Name" 
                                        value={formData.company} 
                                        onChange={(e) => handleInputChange(e, 'company')} 
                                        placeholder="Acme Corp" 
                                     />
                                 </div>

                                 <div className="mt-8">
                                     <Button 
                                        onClick={handleSubmit} 
                                        disabled={!formData.name || !formData.email}
                                        className="w-full h-12 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         Complete Booking
                                     </Button>
                                 </div>
                             </div>
                         ) : (
                             // Step: Slot Selection
                             <>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Consultation</div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Project Discovery Call</h3>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 flex-1 relative z-10">
                                    {/* Date Grid */}
                                    <div>
                                        <div className="text-xs font-medium text-zinc-500 mb-4">Select Date</div>
                                        <div className="grid grid-cols-4 gap-2.5">
                                            {dates.map((date) => (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                                        selectedDate === date 
                                                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg shadow-zinc-900/20 dark:shadow-white/20' 
                                                        : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-[#111] dark:border-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {date}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="flex flex-col border-l border-zinc-100 dark:border-zinc-800 pl-8">
                                        <div className="text-xs font-medium text-zinc-500 mb-4">Select Time</div>
                                        {!selectedDate ? (
                                            <div className="flex-1 flex items-center justify-center text-zinc-400 dark:text-zinc-800 text-xs italic">
                                                Please select a date first.
                                            </div>
                                        ) : (
                                            <div className="space-y-2 animate-fade-in-up">
                                                {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map((time) => (
                                                    <button 
                                                        key={time} 
                                                        onClick={() => handleTimeSelect(time)}
                                                        className="w-full py-3 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:bg-[#111] dark:border-zinc-800 dark:text-zinc-300 text-xs dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all text-left flex justify-between group"
                                                    >
                                                        {time}
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                             </>
                         )}
                    </div>
                </Reveal>

            </div>
        </div>
    </section>
  )
}

// 8. Contact Section (Fully Functional)
const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: any, field: string) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (status === 'error') setStatus('idle');
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.message) return;
        setStatus('sending');
        
        try {
            await mockBackendService.submitContactForm(formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || "Failed to send message.");
        }
    };

    return (
        <section id="contact" className="py-24 bg-white dark:bg-[#020202] border-t border-zinc-200 dark:border-zinc-900 relative z-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-20">
                    {/* Left: Info */}
                    <Reveal>
                        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            <MailIcon className="w-4 h-4" />
                            Get in Touch
                        </div>
                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Contact Us</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mb-10 max-w-md font-light">
                            Have a custom requirement? Need a partnership? Fill out the form and our team will get back to you within 24 hours.
                        </p>
                        
                        <div className="space-y-6">
                             <div className="flex items-start gap-4">
                                 <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-zinc-900 dark:text-white">Phone</h4>
                                     <p className="text-zinc-500 dark:text-zinc-400 text-sm">+1 (555) 123-4567</p>
                                 </div>
                             </div>
                             <div className="flex items-start gap-4">
                                 <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-900 dark:text-white">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-zinc-900 dark:text-white">Email</h4>
                                     <p className="text-zinc-500 dark:text-zinc-400 text-sm">hello@wozena.ai</p>
                                 </div>
                             </div>
                        </div>
                    </Reveal>

                    {/* Right: Form */}
                    <Reveal delay={200}>
                        <div className="bg-white dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                             {status === 'success' ? (
                                 <div className="absolute inset-0 z-20 bg-white dark:bg-[#050505] flex flex-col items-center justify-center animate-fade-in-up p-8 text-center">
                                     <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-6">
                                         <CheckCircleIcon className="w-8 h-8" />
                                     </div>
                                     <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Message Sent!</h3>
                                     <p className="text-zinc-500 mb-8">
                                         Thank you for reaching out. We will respond to your inquiry shortly.
                                     </p>
                                     <Button onClick={() => setStatus('idle')} variant="outline" className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900">Send Another</Button>
                                 </div>
                             ) : (
                                 <div className="space-y-6 relative z-10">
                                     {status === 'error' && (
                                         <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs">
                                             {errorMessage}
                                         </div>
                                     )}
                                     
                                     <div className="grid md:grid-cols-2 gap-6">
                                         <FocusInput 
                                             label="Name *" 
                                             value={formData.name} 
                                             onChange={(e) => handleChange(e, 'name')} 
                                             placeholder="Your Name" 
                                         />
                                         <FocusInput 
                                             label="Email *" 
                                             value={formData.email} 
                                             onChange={(e) => handleChange(e, 'email')} 
                                             placeholder="you@email.com" 
                                         />
                                     </div>
                                     <FocusInput 
                                         label="Subject" 
                                         value={formData.subject} 
                                         onChange={(e) => handleChange(e, 'subject')} 
                                         placeholder="Project Inquiry" 
                                     />
                                     <FocusTextArea 
                                         label="Message *" 
                                         value={formData.message} 
                                         onChange={(e) => handleChange(e, 'message')} 
                                         placeholder="Tell us about your project details..." 
                                     />

                                     <Button 
                                         onClick={handleSubmit} 
                                         disabled={status === 'sending' || !formData.name || !formData.email || !formData.message}
                                         className="w-full h-12 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                     >
                                         {status === 'sending' ? (
                                             <>
                                                <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                                Sending...
                                             </>
                                         ) : 'Send Message'}
                                     </Button>
                                 </div>
                             )}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

// 5. Partner Logos Component (Scrolling Marquee with Real Icons)
const PartnerLogos = () => {
    // Using SimpleIcons.org CDN for 100% accurate vector brands.
    // REMOVED grayscale to show "real colors".
    // Applied dark:invert ONLY to monochrome logos so they appear white on dark backgrounds.
    const logos = [
        { name: "OpenAI", url: "https://cdn.simpleicons.org/openai", monochrome: true },
        { name: "Google", url: "https://cdn.simpleicons.org/google", monochrome: false },
        { name: "Anthropic", url: "https://cdn.simpleicons.org/anthropic", monochrome: true },
        { name: "Twilio", url: "https://cdn.simpleicons.org/twilio", monochrome: false },
        { name: "Zapier", url: "https://cdn.simpleicons.org/zapier", monochrome: false },
        { name: "Make", url: "https://cdn.simpleicons.org/make", monochrome: false },
        { name: "Vercel", url: "https://cdn.simpleicons.org/vercel", monochrome: true },
        { name: "Grok", url: "https://cdn.simpleicons.org/x", monochrome: true }, 
    ];

    return (
        <div className="w-full bg-white dark:bg-[#030303] py-16 border-b border-zinc-200 dark:border-zinc-900 overflow-hidden">
            <div className="flex w-full whitespace-nowrap overflow-hidden">
                <div className="flex animate-scroll w-max">
                    {/* First Copy */}
                    <div className="flex shrink-0 gap-24 pr-24 items-center">
                        {logos.map((logo, i) => (
                            <div key={`set1-${i}`} className="flex items-center gap-4 transition-opacity duration-300 cursor-pointer hover:opacity-100 opacity-100">
                                <img 
                                    src={logo.url} 
                                    alt={logo.name}
                                    className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-300 ${logo.monochrome ? 'dark:invert' : ''}`} 
                                />
                                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white hidden md:block">{logo.name}</span>
                            </div>
                        ))}
                    </div>
                    {/* Second Copy (Seamless Loop) */}
                    <div className="flex shrink-0 gap-24 pr-24 items-center" aria-hidden="true">
                        {logos.map((logo, i) => (
                            <div key={`set2-${i}`} className="flex items-center gap-4 transition-opacity duration-300 cursor-pointer hover:opacity-100 opacity-100">
                                <img 
                                    src={logo.url} 
                                    alt={logo.name}
                                    className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-300 ${logo.monochrome ? 'dark:invert' : ''}`} 
                                />
                                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white hidden md:block">{logo.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// 6. Testimonials Section (Refactored to Infinite Marquee)
const TestimonialsSection = () => {
    const testimonials = [
        {
            quote: "Wozena's voice agents handled 40% of our inbound calls within the first week. The seamless handoff was a game changer.",
            author: "Sarah Jenkins",
            role: "CTO, FinEdge",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128"
        },
        {
            quote: "We reduced our support latency by 85%. The conversational flow is so natural clients don't realize they are speaking to AI.",
            author: "David Chen",
            role: "VP Ops, LogisticsOne",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&h=128"
        },
        {
            quote: "Syncing call data directly into Salesforce without manual entry saved our sales team hundreds of hours per month.",
            author: "Emily Ross",
            role: "Head of Sales, TechFlow",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&h=128"
        },
        {
            quote: "The strategic insights from the predictive analytics module helped us optimize workforce allocation by 30%.",
            author: "Michael Chang",
            role: "Director, CareHealth",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128"
        }
    ];

    return (
        <section className="py-24 bg-zinc-50 dark:bg-[#030303] border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300 overflow-hidden relative">
             {/* Background Pattern */}
             <div className="absolute inset-0 bg-dot-pattern opacity-[0.05] pointer-events-none"></div>

             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-12">
                 <div className="mb-8 inline-flex items-center justify-center p-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800">
                     <TrophyIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
                 </div>
                 <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Trusted by Industry Leaders</h2>
             </div>

             {/* Infinite Marquee Container */}
             <div className="relative w-full overflow-hidden group">
                 {/* Gradient Masks */}
                 <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-50 dark:from-[#030303] to-transparent z-20 pointer-events-none"></div>
                 <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-50 dark:from-[#030303] to-transparent z-20 pointer-events-none"></div>

                 <div className="flex w-max animate-scroll group-hover:pause gap-8 px-4">
                     {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                         <div 
                            key={i}
                            className="w-[350px] md:w-[450px] flex-shrink-0 p-8 rounded-2xl bg-white dark:bg-[#080808] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300"
                         >
                             <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed mb-6 font-light">
                                 "{t.quote}"
                             </p>
                             <div className="flex items-center gap-4">
                                 <img 
                                    src={t.image} 
                                    alt={t.author} 
                                    className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                                 />
                                 <div className="text-left">
                                     <div className="font-bold text-zinc-900 dark:text-white text-sm">{t.author}</div>
                                     <div className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">{t.role}</div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             
             {/* Partner Logos Below */}
             <div className="mt-0">
                <PartnerLogos />
             </div>
        </section>
    );
}

// 7. Benefits Section (Enhanced "Cyber-Industrial" Look)
const BenefitsSection = () => {
  const benefits = [
    {
      title: "Enterprise Security",
      desc: "SOC-2 Type II compliant infrastructure with end-to-end encryption for all voice and data streams.",
      icon: <ShieldCheckIcon />,
      code: "SEC-01"
    },
    {
      title: "99.99% Uptime SLA",
      desc: "Redundant architecture ensures your AI workforce never sleeps, maintaining business continuity.",
      icon: <ServerIcon />,
      code: "UPT-99"
    },
    {
      title: "Seamless Integration",
      desc: "Plug-and-play connectors for Salesforce, HubSpot, Zendesk, and your custom internal APIs.",
      icon: <ZapIcon />,
      code: "INT-X"
    }
  ];

  return (
    <section className="py-32 bg-white dark:bg-[#020202] border-t border-zinc-200 dark:border-zinc-900 relative z-10 overflow-hidden transition-colors duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.03),transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <Reveal>
                <div className="inline-block px-3 py-1 mb-6 rounded-full bg-white border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">
                    The Wozena Advantage
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-6 leading-[1.1] animate-shimmer bg-clip-text">
                    Why Leading <br />
                    Enterprises <span className="text-zinc-400 dark:text-zinc-500">Choose Us.</span>
                </h2>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-lg font-light">
                    We don't just wrap generic APIs. We engineer bespoke neural architectures designed for high-throughput, mission-critical environments. 
                    <span className="block mt-4 text-zinc-900 dark:text-white">Scale without compromise.</span>
                </p>
            </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
                <Reveal key={i} delay={i * 100}>
                    <div className="group relative h-full p-8 rounded-3xl bg-white border border-zinc-200 dark:bg-[#080808] dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all duration-500 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md">
                        
                        {/* Scanning Laser Effect */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-900/20 dark:via-white/20 to-transparent -translate-y-full group-hover:animate-scan z-10"></div>
                        
                        {/* Active Grid Background (Fade in on hover) */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                        {/* Expanding Corners */}
                        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-zinc-300 dark:border-zinc-800 group-hover:border-zinc-900 dark:group-hover:border-white group-hover:w-12 group-hover:h-12 transition-all duration-300 rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-zinc-300 dark:border-zinc-800 group-hover:border-zinc-900 dark:group-hover:border-white group-hover:w-12 group-hover:h-12 transition-all duration-300 rounded-bl-3xl"></div>

                        <div className="relative z-10">
                             <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-zinc-900 border border-zinc-200 dark:bg-[#111] dark:text-white dark:border-zinc-800 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300 shadow-sm">
                                    {b.icon}
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors">{b.code}</span>
                             </div>

                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 group-hover:translate-x-1 transition-transform">{b.title}</h3>
                            <p className="text-zinc-600 dark:text-zinc-500 leading-relaxed text-sm group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition-colors">
                                {b.desc}
                            </p>
                        </div>
                    </div>
                </Reveal>
            ))}
        </div>
      </div>
    </section>
  )
}


function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [scrollY, setScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Force dark mode on mount for the desired aesthetic
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Smart Navbar: Hide on scroll down, show on scroll up
        if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
            setIsNavVisible(false); // Scrolling down & past threshold
        } else {
            setIsNavVisible(true); // Scrolling up or at top
        }

        lastScrollY.current = currentScrollY;
        setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#020202] dark:text-zinc-50 font-sans transition-colors duration-300 relative selection:bg-zinc-200 dark:selection:bg-zinc-700 selection:text-black dark:selection:text-white overflow-hidden">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 bg-white/90 dark:bg-[#020202]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 transition-all duration-500 transform ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {/* NEW LOGO IMPLEMENTATION */}
              <div className="w-10 h-10 text-black dark:text-white transition-transform duration-500 group-hover:scale-105">
                <WozenaLogo className="w-full h-full text-black dark:text-white fill-current" />
              </div>
              <span className="font-bold text-2xl tracking-tighter text-zinc-900 dark:text-zinc-50 group-hover:tracking-widest transition-all duration-300">wozena.</span>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <button onClick={() => scrollToSection('features')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Solutions</button>
                  <button onClick={() => scrollToSection('strategy')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Strategy AI</button>
                  <button onClick={() => scrollToSection('process')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">How We Work</button>
                </div>

                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 focus:outline-none"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === 'dark' ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                  )}
                </button>

                <div className="hidden md:block">
                  <Button size="sm" className="rounded-lg px-6 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 border-none" onClick={() => scrollToSection('booking')}>Book a Call</Button>
                </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10 bg-white dark:bg-black transition-colors duration-300">
        
        {/* Meteor Shower Animation */}
        <MeteorEffect />

        {/* Dynamic Scroll-Reactive Background */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
             {/* Base Grid - Moving */}
             <div 
               className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10 animate-grid-move"
               style={{ transform: `translateY(${scrollY * 0.1}px)` }}
             ></div>
             
             {/* Moving Orbs (Parallax) - Enhanced "White Lights" */}
             <div 
               className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-zinc-200/[0.4] dark:bg-white/[0.03] rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"
               style={{ transform: `translateY(${scrollY * -0.2}px)` }}
             ></div>
             <div 
               className="absolute bottom-[-10%] left-[-20%] w-[1000px] h-[1000px] bg-zinc-300/[0.4] dark:bg-zinc-800/[0.05] rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen"
               style={{ transform: `translateY(${scrollY * 0.15}px)` }}
             ></div>
             
             {/* Vignette fade for depth */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Left: Text Content */}
                <div className="text-left">
                    <Reveal>
                      <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-white animate-pulse"></span>
                          Accepting New Enterprise Clients
                      </div>
                      
                      <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[1.05]">
                          <span className="block animate-fade-in-up">We Build Your</span>
                          <HyperText text="AI Workforce." className="block mt-2 animate-fade-in-up" />
                      </h1>

                      <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-10 leading-relaxed font-light">
                          Wozena is a premier automation agency. We design, develop, and deploy custom Voice Agents and AI Workflows that scale your operations 24/7.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                              onClick={() => scrollToSection('booking')}
                              className="h-12 px-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                          >
                              Get Your Custom Plan
                              <ArrowRightIcon />
                          </button>
                          <button 
                              onClick={() => scrollToSection('features')}
                              className="h-12 px-8 rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-transparent dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                          >
                              Explore Services
                          </button>
                      </div>
                    </Reveal>

                    <div className="mt-16 flex items-center gap-6">
                        <Reveal delay={200}>
                            <div className="flex -space-x-3">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-50 dark:border-black object-cover" />
                                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-50 dark:border-black object-cover" />
                                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-50 dark:border-black object-cover" />
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64" alt="User" className="w-10 h-10 rounded-full border-2 border-zinc-50 dark:border-black object-cover" />
                                <div className="w-10 h-10 rounded-full border-2 border-zinc-50 dark:border-black bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-900 dark:text-white font-bold">+50</div>
                            </div>
                        </Reveal>
                        <Reveal delay={400}>
                            <div className="text-sm">
                                <div className="flex text-yellow-500 dark:text-white mb-1 gap-0.5">
                                    <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-500 text-xs"><span className="text-zinc-900 dark:text-white font-medium">Trusted by 50+</span> Companies.</p>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* Right: Agent Hologram Card */}
                <Reveal delay={300} className="relative hidden lg:block">
                    {/* Additional parallax for dashboard */}
                    <div style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
                       <AgentHologramCard />
                    </div>
                </Reveal>
            </div>
        </div>
      </section>

      {/* STRATEGY GENERATOR */}
      <StrategyGenerator />

      {/* DEMO SECTION (Voice Agent) */}
      <section id="demo" className="py-24 bg-white dark:bg-zinc-900/20 border-y border-zinc-200 dark:border-zinc-800/50 relative z-10 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
                <Reveal className="lg:col-span-4">
                     <div className="inline-block px-3 py-1 mb-4 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white text-xs font-mono font-bold">LIVE DEMO</div>
                     <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Experience the Intelligence.</h2>
                     <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                        Interact with our core agent model directly. It can understand nuance, context, and complex instructions in real-time.
                     </p>
                     
                     <div className="space-y-3 mb-8">
                        {['Sub-100ms Latency', 'Context Retention', 'Multi-turn Reasoning'].map(feat => (
                            <div key={feat} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <CheckCircleIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
                                {feat}
                            </div>
                        ))}
                     </div>
                </Reveal>
                <div className="lg:col-span-8">
                    <LiveVoiceAgent />
                </div>
            </div>
        </div>
      </section>

      {/* FEATURES / SERVICES */}
      <section id="features" className="py-32 bg-white dark:bg-[#020202] relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-20">
              <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">Our Automation Suite</h2>
              <p className="text-zinc-600 dark:text-zinc-400">Comprehensive solutions for the modern enterprise.</p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: "Voice Agents", code: "01 // SYS_VOICE", desc: "Deploy conversational AI agents capable of handling complex outbound sales calls and inbound support queries with <100ms latency and human-level emotional intelligence.", icon: <VoiceAiIcon /> },
                    { title: "Workflow Auto", code: "02 // SYS_FLOW", desc: "Orchestrate multi-step business logic across your entire tech stack. Automate approvals, notifications, and data routing without writing a single line of glue code.", icon: <WorkflowIcon /> },
                    { title: "Data Extraction", code: "03 // SYS_DATA", desc: "Transform unstructured documents (PDFs, emails, invoices) into structured JSON. Our models achieve 99.8% accuracy on handwritten and low-quality inputs.", icon: <DataIcon /> },
                    { title: "CRM Sync", code: "04 // SYS_SYNC", desc: "Real-time, bi-directional synchronization ensures your CRM is the single source of truth. Automatically log calls, update deal stages, and enrich lead profiles.", icon: <CrmIcon /> },
                    { title: "Predictive Analytics", code: "05 // SYS_PRED", desc: "Leverage historical data to forecast call volumes and resource requirements. Optimize workforce allocation with machine learning models trained on your specific KPIs.", icon: <ChartIcon /> },
                    { title: "Custom LLMs", code: "06 // SYS_CORE", desc: "Fine-tune open-weights models on your proprietary datasets. Deploy secure, private LLMs that understand your specific industry jargon and compliance requirements.", icon: <BrainIcon /> }
                ].map((item, i) => (
                    <Reveal key={i} delay={i * 50}>
                      <div className="group relative p-6 h-full rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 dark:bg-zinc-900/40 dark:border-zinc-800 dark:hover:border-zinc-500 hover:-translate-y-2 hover:shadow-lg hover:shadow-zinc-200 dark:hover:shadow-white/5 transition-all duration-300 overflow-hidden backdrop-blur-sm">
                          {/* Module Header */}
                          <div className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{item.code}</span>
                              <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-green-500 transition-colors"></div>
                              </div>
                          </div>

                          <div className="relative z-10">
                              <div className="w-10 h-10 bg-white border border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-transparent dark:text-zinc-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:text-white dark:group-hover:bg-zinc-700 transition-all">
                                  {item.icon}
                              </div>
                              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{item.title}</h3>
                              <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed mb-6 group-hover:text-zinc-800 dark:group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                              
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                  View Specs <ArrowRightIcon />
                              </div>
                          </div>
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 to-transparent dark:from-zinc-900 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                    </Reveal>
                ))}
            </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <TestimonialsSection />

      {/* BENEFITS SECTION */}
      <BenefitsSection />

      {/* PROCESS / HOW WE WORK */}
      <ProcessSection />

      {/* BOOKING SECTION */}
      <BookingSection />

      {/* CONTACT SECTION */}
      <ContactSection />

      {/* FOOTER */}
      <footer className="bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-900 pt-20 pb-12 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                 <div className="col-span-2 md:col-span-1">
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 text-black dark:text-white">
                           <WozenaLogo className="w-full h-full text-black dark:text-white fill-current" />
                        </div>
                        <span className="font-bold text-lg text-zinc-900 dark:text-white">wozena.</span>
                     </div>
                     <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed mb-6">
                         Building the workforce of tomorrow with next-generation AI infrastructure.
                     </p>
                 </div>
                 
                 <div>
                     <h4 className="text-zinc-900 dark:text-white font-bold mb-6">Services</h4>
                     <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-500">
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Voice Automation</a></li>
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Workflow Design</a></li>
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Consulting</a></li>
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Enterprise</a></li>
                     </ul>
                 </div>

                 <div>
                     <h4 className="text-zinc-900 dark:text-white font-bold mb-6">Company</h4>
                     <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-500">
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About Us</a></li>
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Careers</a></li>
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</a></li>
                         <li><button onClick={() => scrollToSection('contact')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</button></li>
                     </ul>
                 </div>

                 <div>
                     <h4 className="text-zinc-900 dark:text-white font-bold mb-6">Legal</h4>
                     <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-500">
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
                         <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cookie Policy</a></li>
                     </ul>
                 </div>
            </div>
            
            <div className="border-t border-zinc-200 dark:border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-zinc-500 dark:text-zinc-600 text-xs">© 2024 Wozena Inc. All rights reserved.</p>
                <div className="flex gap-6">
                     <a href="#" className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"><span className="sr-only">Twitter</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                     <a href="#" className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"><span className="sr-only">GitHub</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg></a>
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
