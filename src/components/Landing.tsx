import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, ArrowRight, BarChart3, Target, Sparkles, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { StarsBackground } from './ui/stars-background';
import { useAuth } from './FirebaseProvider';
import { signInWithGoogle } from '../lib/firebase';
import { Pricing } from './Pricing';

interface LandingProps {
  onStartAnalysis: (name: string, data: string) => void;
}

export function Landing({ onStartAnalysis }: LandingProps) {
  const { user, credits, loading } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
         onStartAnalysis(file.name, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-dark)] flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Aceternity Background Elements */}
        <StarsBackground />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>

        {/* AI Scanner Laser */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-brand-cyan)] to-transparent z-0 opacity-40 shadow-[0_0_20px_3px_var(--color-brand-cyan)]"
        />
        
        {/* Animated Ambient Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[var(--color-brand-cyan)] opacity-20 blur-[100px] md:blur-[150px] rounded-full mix-blend-screen"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -80, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-[var(--color-brand-pink)] opacity-20 blur-[100px] md:blur-[150px] rounded-full mix-blend-screen"
        />

        {/* Floating Abstract Wireframe Slides */}
        <motion.div
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], rotate: [-15, -10, -15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex absolute left-[15%] top-[25%] w-48 h-32 border border-white/10 bg-white/[0.02] rounded-xl backdrop-blur-sm flex-col p-4 gap-2 opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
        >
          <div className="w-1/2 h-2 bg-white/20 rounded"></div>
          <div className="w-3/4 h-2 bg-white/10 rounded"></div>
          <div className="w-1/3 h-2 bg-[var(--color-brand-cyan)]/40 rounded mt-2"></div>
          <div className="w-full text-[8px] text-[var(--color-brand-cyan)] font-mono mt-auto opacity-70 tracking-widest">PARSING_DECK...</div>
        </motion.div>
        
        <motion.div
          animate={{ y: [30, -30, 30], x: [10, -10, 10], rotate: [12, 18, 12] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="hidden lg:flex absolute right-[25%] bottom-[15%] w-40 h-52 border border-[var(--color-brand-pink)]/20 bg-[var(--color-brand-pink)]/[0.02] rounded-xl backdrop-blur-md flex-col p-4 gap-3 opacity-60 shadow-[0_0_40px_rgba(247,37,133,0.05)]"
        >
          <div className="w-full h-24 border border-[var(--color-brand-pink)]/30 rounded flex items-end p-2 gap-1.5 justify-center">
             <div className="w-1/3 h-1/3 bg-[var(--color-brand-pink)]/40 rounded-sm"></div>
             <div className="w-1/3 h-2/3 bg-[var(--color-brand-cyan)]/40 rounded-sm"></div>
             <div className="w-1/3 h-full bg-slate-100/40 rounded-sm"></div>
          </div>
          <div className="w-3/4 h-2 bg-white/20 rounded mt-2"></div>
          <div className="w-1/2 h-2 bg-white/10 rounded"></div>
        </motion.div>

        {/* Rotating Data UI Ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="hidden md:flex absolute right-[5%] top-[10%] w-64 h-64 border border-dashed border-[var(--color-brand-cyan)]/20 rounded-full items-center justify-center opacity-40"
        >
           <div className="w-48 h-48 border border-white/5 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border border-[var(--color-brand-pink)]/10 rounded-full"></div>
           </div>
           {/* Ring Data Nodes */}
           <div className="absolute top-[-4px] left-1/2 w-2 h-2 bg-[var(--color-brand-cyan)] rounded-full"></div>
           <div className="absolute bottom-[-4px] right-1/4 w-2 h-2 bg-[var(--color-brand-pink)] rounded-full"></div>
        </motion.div>

        {/* Tech Crosshairs (HUD Markers) */}
        <div className="hidden md:block absolute top-[20%] left-[30%] w-6 h-6 border-t border-l border-[var(--color-brand-cyan)]/40 opacity-70"></div>
        <div className="hidden md:block absolute top-[25%] right-[20%] w-6 h-6 border-t border-r border-[var(--color-brand-pink)]/40 opacity-70"></div>
        <div className="hidden md:block absolute bottom-[25%] left-[25%] w-6 h-6 border-b border-l border-[var(--color-brand-cyan)]/40 opacity-70"></div>
        <div className="hidden md:block absolute bottom-[20%] right-[30%] w-6 h-6 border-b border-r border-[var(--color-brand-pink)]/40 opacity-70"></div>
      </div>

      {/* Navbar Mock */}
      <nav className="w-full flex justify-between items-center px-4 md:px-8 py-3 md:py-6 z-10 relative">
        <div className="flex font-bold text-2xl tracking-tighter items-center gap-4">
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="font-brush text-4xl md:text-6xl text-[var(--color-brand-cyan)] transform -rotate-2 hover:scale-105 transition-transform cursor-pointer"
           >
             Capnexis
           </button>
        </div>
        <a 
           href="https://www.capnexgen.com/" 
           target="_blank" 
           rel="noreferrer"
           className="bg-[var(--color-brand-btn)] hover:bg-[var(--color-brand-btn-hover)] text-blue-900 font-bold px-6 py-2 rounded-full transition-colors shadow-lg text-sm"
        >
          Hire us
        </a>
      </nav>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 z-10 mt-2 md:mt-0 pb-12 w-full relative">
        
        {/* Background Floating SaaS Components */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center -z-10">
          
          {/* Floating Card 1: Score */}
          <motion.div 
            animate={{ y: [-15, 15, -15], rotate: [-2, 2, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:flex absolute left-[5%] xl:left-[10%] top-[20%] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex-col gap-3 w-48"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--color-brand-cyan)]" />
              <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">Clarity Score</span>
            </div>
            <div className="text-4xl font-black text-white">92<span className="text-lg text-slate-400">/100</span></div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-brand-cyan)] w-[92%] rounded-full"></div>
            </div>
          </motion.div>

          {/* Floating Card 2: AI Rewrite */}
          <motion.div 
            animate={{ y: [15, -15, 15], rotate: [2, -1, 2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="hidden lg:flex absolute right-[5%] xl:right-[10%] top-[15%] bg-slate-900/60 backdrop-blur-xl border border-[var(--color-brand-pink)]/30 p-5 rounded-2xl shadow-[0_20px_50px_rgba(247,37,133,0.15)] flex-col gap-2 w-56"
          >
            <div className="flex justify-between items-center bg-[var(--color-brand-pink)]/20 px-3 py-1 rounded-full w-fit mb-1 border border-[var(--color-brand-pink)]/50">
              <span className="text-[10px] font-bold text-[var(--color-brand-pink)] flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI REWRITE</span>
            </div>
            <div className="text-sm font-medium text-slate-300">"We help companies save money..."</div>
            <div className="text-[10px] text-slate-500 line-through">Too generic</div>
            <div className="h-[1px] w-full bg-slate-700 my-1"></div>
            <div className="text-sm font-medium text-white shadow-sm">"Reducing enterprise cloud waste by 40%..."</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#0fbac6]">Strong value prop</div>
          </motion.div>

          {/* Floating Card 3: Market Size */}
          <motion.div 
            animate={{ y: [10, -20, 10], rotate: [-4, 0, -4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="hidden md:flex absolute left-[10%] xl:left-[15%] bottom-[10%] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl flex-col gap-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">Market Analysis</span>
            </div>
            <div className="flex gap-2 items-end h-24">
               <div className="w-6 h-8 bg-slate-700 rounded-sm"></div>
               <div className="w-6 h-12 bg-slate-600 rounded-sm"></div>
               <div className="w-6 h-16 bg-slate-500 rounded-sm"></div>
               <div className="w-6 h-24 bg-[var(--color-brand-cyan)] rounded-sm relative shadow-[0_0_15px_rgba(15,186,198,0.4)]">
                 <div className="absolute -top-8 -left-4 bg-white text-slate-900 text-[11px] px-2 py-1 rounded font-bold shadow-lg">$12B TAM</div>
               </div>
            </div>
          </motion.div>

          {/* Floating Card 4: Actionable insight */}
          <motion.div 
            animate={{ y: [-20, 10, -20], rotate: [3, -2, 3] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="hidden lg:flex absolute right-[8%] xl:right-[15%] bottom-[10%] bg-slate-900/60 backdrop-blur-xl border border-yellow-500/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(234,179,8,0.1)] gap-3 w-64 items-start"
          >
             <div className="bg-yellow-500/20 p-2 rounded-full mt-1 shrink-0">
               <Zap className="w-4 h-4 text-yellow-500" />
             </div>
             <div>
               <h4 className="text-sm font-bold text-white mb-1">Missing Setup Detected</h4>
               <p className="text-xs text-slate-300 leading-relaxed">Your deck lacks a specific <b>Use of Funds</b> timeline. Investors need to see an 18-month roadmap.</p>
             </div>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="w-full flex flex-col items-center max-w-5xl mx-auto relative z-20"
        >
          <div className="flex flex-col items-center justify-center relative w-full mb-6 mt-12 md:mt-4">
            <motion.h2 
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: -5, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
              className="font-brush text-[3.5rem] md:text-[6rem] text-[var(--color-brand-cyan)] drop-shadow-lg self-center md:mr-[18rem] -mb-6 md:-mb-10 z-20 relative"
            >
              Analyze Your
            </motion.h2>
            <div className="relative">
              <h1 className="text-[3.25rem] sm:text-6xl md:text-[7.5rem] lg:text-[9rem] font-black text-white drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)] leading-none tracking-tighter relative z-10 whitespace-nowrap text-center">
                PITCH DECK
              </h1>
            </div>
          </div>
          
          <h3 className="text-lg md:text-2xl font-black text-[var(--color-brand-cyan)] mt-4 mb-2 uppercase tracking-widest text-center flex items-center gap-2 justify-center drop-shadow-md">
            <Target className="w-5 h-5 md:w-6 md:h-6" /> ELITE INSTITUTIONAL-GRADE ANALYSIS
          </h3>
          
          <p className="max-w-3xl text-white mt-4 text-base md:text-xl opacity-90 text-center mx-auto px-4 leading-relaxed font-medium">
            Stop guessing why investors are passing. Get an unfiltered, mathematically-precise breakdown of your <strong className="text-[var(--color-brand-pink)] font-black">fatal flaws</strong> and narrative friction before you burn your lead list.
          </p>

          {/* Psychological Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-8 mb-4 px-4 relative z-20">
             <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-green-500/30 rounded-full px-4 py-2 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-[10px] md:text-xs font-bold text-slate-200 uppercase tracking-widest">Trained on 10k+ Series A Decks</span>
             </div>
             <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-yellow-500/30 rounded-full px-4 py-2 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-[10px] md:text-xs font-bold text-slate-200 uppercase tracking-widest">Strict YC / Sequoia Alignment</span>
             </div>
          </div>

          {/* Upload Zone */}
          <motion.div 
            className={`mt-10 md:mt-12 w-full max-w-[28rem] md:max-w-xl bg-slate-900/40 backdrop-blur-xl border-2 border-dashed ${isDragging ? 'border-[var(--color-brand-pink)] bg-slate-900/60 scale-105' : 'border-[var(--color-brand-cyan)]/50'} rounded-3xl p-6 md:p-10 relative transition-all duration-300 cursor-pointer hover:bg-slate-900/60 hover:border-[var(--color-brand-cyan)] group shadow-[0_20px_40px_rgba(0,0,0,0.2)]`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
           <input 
             ref={fileInputRef}
             type="file" 
             className="hidden" 
             accept=".pdf,.ppt,.pptx"
             onChange={handleChange}
           />
           <div className="flex flex-col items-center justify-center gap-5 text-white text-center">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--color-brand-cyan)]/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--color-brand-pink)]/20 transition-all duration-500 shadow-inner">
               <Upload className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-brand-cyan)] group-hover:text-[var(--color-brand-pink)] group-hover:animate-bounce transition-colors" />
             </div>
             <div>
                <span className="font-bold text-xl md:text-2xl block mb-2 text-white/90">Click to upload or drag & drop</span>
                <p className="text-xs text-slate-400 mt-2 font-medium">PDF, PPT, PPTX (MAX. 50MB)<br/><span className="text-[var(--color-brand-cyan)] font-bold">FREE TESTING MODE</span></p>
             </div>
           </div>
           
           {/* Corner aesthetics for the dropzone */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--color-brand-cyan)] rounded-tl-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--color-brand-pink)] rounded-br-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>

             <button 
                onClick={() => onStartAnalysis("Project_Demo_Alpha.pdf", "")} 
                className="mt-8 px-6 py-3 border border-[var(--color-brand-cyan)]/30 rounded-full text-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-cyan)] hover:text-white transition-all text-sm font-bold tracking-widest uppercase z-40 relative shadow-[0_0_15px_rgba(15,186,198,0.1)] hover:shadow-[0_0_25px_rgba(15,186,198,0.3)] backdrop-blur-sm flex items-center gap-2"
             >
                View Live Demo Dashboard <ArrowRight className="w-4 h-4" />
             </button>
        </motion.div>
      </main>

      <footer className="w-full text-center py-6 text-sm text-slate-400 z-10 relative border-t border-slate-800 bg-[var(--color-brand-dark)]/80 backdrop-blur-sm mt-auto">
        <p>A flagship product engineered by <a href="https://www.capnexgen.com/" target="_blank" rel="noreferrer" className="text-[var(--color-brand-cyan)] hover:text-[var(--color-brand-pink)] transition-colors font-bold underline underline-offset-4">CapNexgen</a></p>
      </footer>

      <Pricing 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
      />
    </div>
  );
}
