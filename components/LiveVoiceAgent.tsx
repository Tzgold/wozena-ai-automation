import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Message, ConnectionState } from '../types';
import { createBlob, decode, decodeAudioData } from '../services/liveApiUtils';

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m5 7 2.1-2.1"/><path d="M19 7l-2.1-2.1"/><path d="M6 11v4a6 6 0 0 0 12 0v-4"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);

const LoadingIcon = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

export const LiveVoiceAgent: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSendingText, setIsSendingText] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(5).fill(10));
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio Visualizer Loop
  const updateVisualizer = () => {
    if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Sample a few frequencies for the bars
        const levels = [];
        const step = Math.floor(dataArray.length / 5);
        for(let i = 0; i < 5; i++) {
            const val = dataArray[i * step];
            // Normalize to a height between 10% and 100%
            levels.push(Math.max(10, (val / 255) * 100));
        }
        setAudioLevels(levels);
    } else if (connectionState === ConnectionState.DISCONNECTED) {
        // Reset to default when disconnected
        setAudioLevels(new Array(5).fill(10));
    }
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED) {
        updateVisualizer();
    } else {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevels([10, 10, 10, 10, 10]);
    }
    return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  }, [connectionState]);

  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        try { session.close(); } catch (e) { console.error(e); }
      });
      sessionPromiseRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    analyserRef.current = null;
    setConnectionState(ConnectionState.DISCONNECTED);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');
    
    // Add user message to UI immediately
    const now = new Date();
    const newMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: now };
    setMessages(prev => [...prev, newMsg]);

    setIsSendingText(true);
    
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key not found");
        
        const ai = new GoogleGenAI({ apiKey });
        
        // Prepare chat history
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: "You are 'Automata', a highly sophisticated AI automation architect. Your tone is professional, concise, and helpful. You engage in conversation. Keep answers under 3 sentences.",
            }
        });

        const result = await chat.sendMessage({ message: textToSend });
        const responseText = result.text;
        
        if (responseText) {
            setMessages(prev => [...prev, { id: Date.now().toString() + 'm', role: 'model', text: responseText, timestamp: new Date() }]);
        }
    } catch (err) {
        console.error("Failed to send text message", err);
        setMessages(prev => [...prev, { id: Date.now().toString() + 'err', role: 'model', text: "I encountered an error processing your request.", timestamp: new Date() }]);
    } finally {
        setIsSendingText(false);
    }
  };

  const startSession = async () => {
    setError(null);
    setConnectionState(ConnectionState.CONNECTING);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      // Setup Analyser
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are 'Automata', a highly sophisticated AI automation architect. You engage in natural, flowing spoken conversation. Your tone is professional but warm. Keep responses concise.",
          inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
          outputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            // Connect source -> analyser -> scriptProcessor -> dest
            source.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            scriptProcessor.onaudioprocess = (e) => {
              if (!inputAudioContextRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            const userTrans = message.serverContent?.inputTranscription?.text;
            const modelTrans = message.serverContent?.outputTranscription?.text;
            
            if (userTrans || modelTrans) {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const now = new Date();
                    if (userTrans && message.serverContent?.turnComplete) {
                         newMsgs.push({ id: Date.now().toString(), role: 'user', text: userTrans, timestamp: now });
                    }
                    if (modelTrans && message.serverContent?.turnComplete) {
                         newMsgs.push({ id: Date.now().toString() + 'm', role: 'model', text: modelTrans, timestamp: now });
                    }
                    return newMsgs;
                });
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.addEventListener('ended', () => sourcesRef.current.delete(source));
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => { if (connectionState === ConnectionState.CONNECTED) setConnectionState(ConnectionState.DISCONNECTED); },
          onerror: (e) => { 
              console.error(e); 
              setError("Connection error."); 
              stopSession(); 
          }
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      setError(err.message || "Failed to start session");
      setConnectionState(ConnectionState.DISCONNECTED);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[700px] bg-white dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      
      {/* Left Panel: Controls & Visualizer */}
      <div className="w-full md:w-5/12 bg-white dark:bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between relative overflow-hidden group">
        
        {/* Background ambient effect */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.05] text-zinc-900 dark:text-zinc-100"></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-zinc-100 dark:bg-zinc-800 rounded-full blur-3xl transition-opacity duration-1000 ${connectionState === ConnectionState.CONNECTED ? 'opacity-40' : 'opacity-0'}`}></div>

        {/* Header */}
        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 shadow-sm mb-4">
                <div className={`w-2 h-2 rounded-full ${connectionState === ConnectionState.CONNECTED ? 'bg-black dark:bg-white animate-pulse' : 'bg-zinc-400'}`}></div>
                {connectionState === ConnectionState.CONNECTED ? 'Live Agent Active' : 'Ready to Connect'}
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Automata Live</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                Experience the next generation of conversational AI. Speak naturally or type to interact.
            </p>
        </div>

        {/* Visualizer Centerpiece */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-8">
            {connectionState === ConnectionState.CONNECTED ? (
                 <div className="flex items-center gap-2 h-32 items-end justify-center">
                    {audioLevels.map((level, i) => (
                        <div 
                            key={i} 
                            className="w-3 bg-zinc-900 dark:bg-white rounded-full transition-all duration-75 ease-out" 
                            style={{ 
                                height: `${Math.max(10, level)}%`,
                                opacity: Math.max(0.3, level / 100)
                            }} 
                        ></div>
                    ))}
                 </div>
            ) : (
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:scale-105 transition-transform duration-300">
                    <MicIcon />
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-full">
             
             {/* Text Input Area */}
             <form onSubmit={handleSendMessage} className="w-full relative mb-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Automata anything..."
                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-600 transition-all shadow-sm"
                />
                <button 
                    type="submit"
                    disabled={(!inputText.trim() && !isSendingText) || isSendingText}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 transition-colors"
                >
                    {isSendingText ? <LoadingIcon /> : <SendIcon />}
                </button>
             </form>

             {error && <p className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full animate-pulse">{error}</p>}
             
             {connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR ? (
                <button 
                    onClick={startSession}
                    className="group relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-black dark:bg-white px-8 font-medium text-white dark:text-black transition-all duration-300 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                >
                    <span className="mr-2"><MicIcon /></span>
                    Start Voice Session
                </button>
             ) : (
                <button 
                    onClick={stopSession}
                    className="group relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-8 font-medium text-zinc-900 dark:text-white transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none"
                >
                    <span className="mr-2"><StopIcon /></span>
                    End Session
                </button>
             )}
        </div>
      </div>

      {/* Right Panel: Transcript */}
      <div className="w-full md:w-7/12 bg-white dark:bg-[#050505] flex flex-col h-full relative">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white/80 dark:bg-[#050505]/80 backdrop-blur-sm sticky top-0 z-20">
            <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Live Transcript</span>
            <button 
                onClick={() => setMessages([])} 
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-md transition-colors"
                title="Clear Transcript"
            >
                <TrashIcon />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar">
            {messages.length === 0 && (
                 // Empty state is hidden to look like a clean terminal/chat start
                 <div className="h-full flex flex-col items-center justify-center opacity-30">
                     <div className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-4">
                         <BotIcon />
                     </div>
                 </div>
            )}
            
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`} style={{ animationDuration: '0.4s' }}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-black border-zinc-200 dark:bg-black dark:text-white dark:border-zinc-800'}`}>
                        {msg.role === 'user' ? <UserIcon /> : <BotIcon />}
                    </div>
                    <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-sm' 
                            : 'bg-white border border-zinc-100 text-zinc-800 dark:bg-[#111] dark:border-zinc-800 dark:text-zinc-200 rounded-tl-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};