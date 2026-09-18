import { motion, AnimatePresence } from 'motion/react';
import { mockDashboardData, mockInsights } from '../data/mockData';
import { PieChart, Download, ArrowRight, ChevronDown, CheckCircle, AlertTriangle, Sparkles, Building, Briefcase, MessageSquare, Send, Zap, FileText, Target, Clock, Lock } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useAuth } from './FirebaseProvider';
import { Pricing } from './Pricing';

function SlideVisual({ type, title }: { type: string, title: string }) {
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('problem')) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[var(--color-brand-pink)]/10 rounded-full blur-3xl" />
        <span className="text-xs font-bold tracking-widest text-[var(--color-brand-pink)] uppercase mb-2">CRITICAL GAP</span>
        <h4 className="text-xl md:text-2xl font-black text-white text-center max-w-xs">{title}</h4>
        <div className="mt-4 flex gap-2">
          <div className="w-12 h-1.5 bg-red-500 rounded-full" />
          <div className="w-6 h-1.5 bg-slate-800 rounded-full" />
          <div className="w-6 h-1.5 bg-slate-800 rounded-full" />
        </div>
      </div>
    );
  }
  
  if (typeLower.includes('solution')) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0fbac6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--color-brand-cyan)]/20 rounded-full blur-2xl" />
        <span className="text-xs font-bold tracking-widest text-[var(--color-brand-cyan)] uppercase mb-2">CORE PRODUCT</span>
        <h4 className="text-xl md:text-2xl font-black text-white text-center max-w-xs">{title}</h4>
        <div className="mt-4 flex items-center justify-center gap-4 bg-slate-900/80 border border-slate-800 p-2 rounded-xl px-4 shadow-lg">
          <Zap className="w-4 h-4 text-[var(--color-brand-cyan)]" />
          <span className="text-xs font-bold text-slate-300">AI-Powered Automation</span>
        </div>
      </div>
    );
  }
  
  if (typeLower.includes('market')) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="flex flex-col items-center relative">
          <div className="w-32 h-32 rounded-full border-4 border-[var(--color-brand-pink)]/30 flex items-center justify-center relative animate-pulse">
            <div className="w-24 h-24 rounded-full border-4 border-[var(--color-brand-cyan)]/50 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border-2 border-white/20 flex items-center justify-center">
                <span className="text-xs font-bold text-white font-mono">$TAM</span>
              </div>
            </div>
          </div>
          <h4 className="text-lg font-bold text-white mt-4">{title}</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative">
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#334155_25%,transparent_25%,transparent_50%,#334155_50%,#334155_75%,transparent_75%,transparent)] [background-size:20px_20px]" />
      <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">{type}</span>
      <h4 className="text-lg font-bold text-slate-300 text-center">{title}</h4>
    </div>
  );
}

export function Dashboard({ data, onGoHome }: { data?: any, onGoHome?: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'slides'>('overview');
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [personaMode, setPersonaMode] = useState<'vc' | 'angel'>('vc');
  const [isExporting, setIsExporting] = useState(false);
  // Use active real data or fallback to mock if omitted/failed
  const sourceData = data || mockDashboardData;
  const slideData = data?.slides || mockInsights;

  const [chatHistories, setChatHistories] = useState<Record<string, { sender: 'user' | 'bot', text: string }[]>>({});
  const [isPricingOpen, setIsPricingOpen] = useState(false);
// isFree removed; no longer needed

  const getChatHistory = useCallback((slideId: string) => {
     const key = `${slideId}-${personaMode}`;
     if (!chatHistories[key]) {
        const initMsg = personaMode === 'vc' 
          ? `Welcome. I've reviewed your complete pitch deck material. Let's dissect the institutional metrics, dealbreakers, and strategic leverage points. What would you like to address first?`
          : `Hey there! Great vision across this workspace. Let's dive into the team roadmap, strategic pivots, and long-term optimization. Ask me anything!`;
        return [{ sender: 'bot', text: initMsg }];
     }
     return chatHistories[key];
  }, [chatHistories, personaMode]);

  const handleSendMessage = useCallback(async (slideId: string) => {
     if (!chatInput.trim()) return;
     const userMsg = chatInput;
     const key = `${slideId}-${personaMode}`;
     const currentHistory = getChatHistory(slideId);
     const updatedHistory = [...currentHistory, { sender: 'user', text: userMsg }];
     
     setChatHistories(prev => ({ ...prev, [key]: updatedHistory }));
     setChatInput('');
     
     try {
        const { GoogleGenAI } = await import('@google/genai');
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key missing");
        const ai = new GoogleGenAI({ apiKey });
        
        const chatHistoryPrompt = updatedHistory.map(m => `${m.sender === 'user' ? 'Founder' : 'Advisor'}: ${m.text}`).join('\n');
        
        const fullDeckContext = JSON.stringify(sourceData);

        const personaPrompt = personaMode === 'vc'
           ? `You are an elite, highly critical Tier-1 Silicon Valley Venture Capitalist (e.g., Sequoia, a16z partner). You have complete omniscience over this startup's pitch deck. Data: ${fullDeckContext}. 
              Be absolutely ruthless, data-driven, and focused on dealbreakers, CAC/LTV, TAM, and capital efficiency. Do not sugar-coat anything. If they have high capital risk or fatal flaws, aggressively challenge them on it. 
              Respond to the founder's latest prompt in a challenging, insightful VC manner. Max 3 sentences.`
           : `You are an elite Angel Syndicate Lead and exited founder. You have complete omniscience over this startup's pitch deck. Data: ${fullDeckContext}. 
              You are highly strategic, focusing on early-stage pivot mechanics, traction hacking, and eliminating narrative friction. Be constructive but hyper-analytical. Help the founder optimize their story to win over institutional investors. 
              Respond to the founder's message constructively, mapping out strategic optimization routes. Max 3 sentences.`;

        const response = await ai.models.generateContent({
           model: 'gemini-3-flash-preview',
           contents: [
              { text: `${personaPrompt}\n\nConversation History:\n${chatHistoryPrompt}` }
           ]
        });

        const replyText = response.text || "Let's build actionable validation models.";
        
        setChatHistories(prev => ({
           ...prev,
           [key]: [...(prev[key] || []), { sender: 'bot', text: replyText }]
        }));
     } catch (err) {
        console.error("Gemini global chat failed:", err);
        const fallback = personaMode === 'vc'
          ? "Address calculation depth properly to proceed smoothly."
          : "Mitigating pipeline milestones establishes trust rapidly.";
        setChatHistories(prev => ({
           ...prev,
           [key]: [...(prev[key] || []), { sender: 'bot', text: fallback }]
        }));
     }
  }, [chatInput, getChatHistory, personaMode, sourceData]);



  const exportToPDF = useCallback(async () => {
    const container = document.getElementById('pdf-export-template');
    if (!container) {
       alert("Report template not found.");
       return;
    }
    
    container.style.display = 'block';
    setIsExporting(true);
    
    try {
      const [html2canvasModule, jspdfModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const html2canvas = html2canvasModule.default;
      const jsPDF = jspdfModule.jsPDF;

      const pages = container.querySelectorAll('.pdf-page');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 800,
          height: 1131
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save('Capnexis_Executive_Report.pdf');
    } catch (error) {
       console.error("PDF Export failed", error);
       alert("PDF Export failed. Please try again.");
    } finally {
       setIsExporting(false);
       container.style.display = 'none';
    }
  }, []);

  const getStandard = useCallback((subject: string) => {
    if (personaMode === 'angel') {
      switch(subject) {
        case 'Market': return 80;
        case 'Product': return 95;
        case 'Financials': return 60;
        case 'Story': return 95;
        case 'Clarity': return 85;
      }
    }
    // VC standards
    switch(subject) {
      case 'Market': return 90;
      case 'Product': return 85;
      case 'Financials': return 85;
      case 'Story': return 90;
      case 'Clarity': return 85;
    }
    return 80;
  }, [personaMode]);

  const dynamicRadarData = useMemo(() => {
     const isAngel = personaMode === 'angel';
     return [
       { 
          subject: 'Market', 
          deck: isAngel ? Math.max(40, (sourceData.sections?.market ?? 85) - 5) : (sourceData.sections?.market ?? 85), 
          standard: getStandard('Market'), 
          fullMark: 100 
       },
       { 
          subject: 'Product', 
          deck: isAngel ? Math.min(100, (sourceData.sections?.product ?? 80) + 8) : (sourceData.sections?.product ?? 80), 
          standard: getStandard('Product'), 
          fullMark: 100 
       },
       { 
          subject: 'Financials', 
          deck: isAngel ? Math.max(30, (sourceData.sections?.financials ?? 70) - 10) : (sourceData.sections?.financials ?? 70), 
          standard: getStandard('Financials'), 
          fullMark: 100 
       },
       { 
          subject: 'Story', 
          deck: isAngel ? Math.min(100, (sourceData.sections?.storytelling ?? 90) + 12) : (sourceData.sections?.storytelling ?? 90), 
          standard: getStandard('Story'), 
          fullMark: 100 
       },
       { 
          subject: 'Clarity', 
          deck: isAngel ? Math.min(100, (sourceData.sections?.clarity ?? 80) + 10) : (sourceData.sections?.clarity ?? 80), 
          standard: getStandard('Clarity'), 
          fullMark: 100 
       },
     ];
  }, [sourceData, personaMode, getStandard]);

  const displayScore = useMemo(() => {
     const base = sourceData.generalScore || sourceData.overallScore || 72;
     return personaMode === 'angel' ? Math.min(100, base + 12) : base;
  }, [sourceData, personaMode]);

  const displaySummary = useMemo(() => {
     const baseSummary = sourceData.summary || mockDashboardData.summary;
     if (personaMode === 'angel') {
        return `[Angel Syndicate Perspective] While institutional VCs will ruthlessly dissect your unit economics, early-stage angels focus heavily on execution velocity and narrative momentum. \n\nYour pitch demonstrates strong potential, but you must emphasize traction hacking and team agility over long-term financial modeling. ${baseSummary}`;
     }
     return `[Institutional VC Perspective] ${baseSummary}`;
  }, [sourceData, personaMode]);

  return (
    <div id="dashboard-content" className="min-h-screen bg-[var(--color-brand-dark)] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-6">
              <button 
                onClick={onGoHome}
                className="font-brush text-4xl md:text-6xl text-[var(--color-brand-cyan)] transform -rotate-2 hover:scale-105 hover:brightness-110 transition-all cursor-pointer"
                title="Back to Home"
              >
                Capnexis
              </button> 
              Report
            </h1>
            <p className="text-slate-400 mt-1">Powered by CapNexgen Pitch Intelligence</p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-slate-800 p-1 rounded-lg flex border border-slate-700">
               <button 
                 onClick={() => setPersonaMode('vc')}
                 className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${personaMode === 'vc' ? 'bg-slate-700 shadow text-white' : 'text-slate-400 hover:text-white'}`}
               >
                 <Briefcase className="w-3 h-3" /> VC Mode
               </button>
               <button 
                 onClick={() => setPersonaMode('angel')}
                 className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-colors ${personaMode === 'angel' ? 'bg-slate-700 shadow text-white' : 'text-slate-400 hover:text-white'}`}
               >
                 <Building className="w-3 h-3" /> Angel Mode
               </button>
            </div>
            <button 
              onClick={exportToPDF} 
              disabled={isExporting}
              className="bg-[var(--color-brand-cyan)]/20 hover:bg-[var(--color-brand-cyan)]/30 border border-[var(--color-brand-cyan)]/50 text-[var(--color-brand-cyan)] font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(15,186,198,0.4)] disabled:opacity-50">
              <Download className="w-4 h-4" /> {isExporting ? 'Exporting PDF...' : 'Export Deal Memo'}
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-8 gap-8">
          <button 
             onClick={() => setActiveTab('overview')}
             className={`pb-4 text-sm font-bold uppercase tracking-wider relative ${activeTab === 'overview' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Overview
            {activeTab === 'overview' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-brand-cyan)]" />
            )}
          </button>
          <button 
             onClick={() => setActiveTab('slides')}
             className={`pb-4 text-sm font-bold uppercase tracking-wider relative flex items-center gap-2 ${activeTab === 'slides' ? 'text-[var(--color-brand-cyan)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
             Ask the VC / Angel
             {activeTab === 'slides' && (
               <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-brand-cyan)]" />
             )}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
               key="overview"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              <div className="flex flex-col gap-6 lg:col-span-1">
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--color-brand-cyan)] to-[var(--color-brand-pink)]"></div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 mb-2 w-full tracking-wider flex items-center justify-between">
                      Success Probability Matrix
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </h3>
                    
                    <div className="w-full h-[500px] mt-6 flex justify-center items-center">
                      <ResponsiveContainer key={personaMode} width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dynamicRadarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13, dy: 5 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name={personaMode === 'vc' ? "YC Standard" : "Angel Standard"} dataKey="standard" stroke="#f72585" fill="#f72585" fillOpacity={0.1} strokeDasharray="3 3" />
                          <Radar name="Your Deck" dataKey="deck" stroke="#0fbac6" fill="#0fbac6" fillOpacity={0.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-6 w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center">
                       <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Fundability Score ({personaMode === 'vc' ? "VC" : "Angel"})</span>
                       <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-cyan)] to-[var(--color-brand-pink)] drop-shadow-md">
                         {displayScore} / 100
                       </span>
                    </div>
                 </div>

                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg h-full flex flex-col">
                   <h2 className="text-xl font-bold mb-4">{personaMode === 'vc' ? 'VC Summary' : 'Angel Summary'}</h2>
                    <p className="text-slate-300 leading-relaxed text-sm font-medium">
                      {displaySummary}
                    </p>

                    {/* Institutional Diligence Roadmap Visual */}
                    <div className="mt-6 bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 relative overflow-hidden">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-[var(--color-brand-cyan)]" /> Diligence Execution Roadmap
                       </h4>
                       <div className="flex flex-col gap-4 relative">
                          {/* Step 1 */}
                          <div className="flex items-start gap-3 border-l-2 border-green-500/30 pl-4 relative">
                             <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-green-500 border border-slate-950 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                             <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-green-400 flex items-center gap-1">Phase 1: Structural Audit <CheckCircle className="w-3 h-3" /></span>
                                <span className="text-[10px] text-slate-400 leading-relaxed">Proprietary readiness compliance checks passed.</span>
                             </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex items-start gap-3 border-l-2 border-[var(--color-brand-cyan)]/30 pl-4 relative">
                             <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[var(--color-brand-cyan)] border border-slate-950 shadow-[0_0_10px_rgba(15,186,198,0.6)] animate-pulse"></div>
                             <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-[var(--color-brand-cyan)] flex items-center gap-1">Phase 2: Narrative Mitigation <Clock className="w-3 h-3" /></span>
                                <span className="text-[10px] text-slate-300 leading-relaxed">Actively restructuring pitch mechanics.</span>
                             </div>
                          </div>

                          {/* Step 3 */}
                          <div className="flex items-start gap-3 border-l-2 border-slate-800 pl-4 relative">
                             <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-slate-700 border border-slate-950"></div>
                             <div className="flex flex-col gap-0.5">
                                 <span className="text-xs font-bold text-[var(--color-brand-pink)] flex items-center gap-1">Phase 3: Syndicate Matching <Lock className="w-3 h-3" /></span>
                                 <span className="text-[10px] text-[var(--color-brand-pink)]/80 leading-relaxed font-bold">Locked. Intervention required before institutional introduction.</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Required Structural Interventions relocated to balance layout */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg mt-auto relative overflow-hidden">
                      <h3 className="font-bold uppercase tracking-wider text-[var(--color-brand-cyan)] text-sm mb-4 flex items-center gap-2">
                         <Zap className="w-4 h-4" /> Required Structural Interventions
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                         {(sourceData.aiRecommendations || [
                            { title: "Restructure Financial Ask", description: "Your ask lacks a precise 'Use of Funds' breakdown. Investors view this as a red flag for poor capital efficiency." },
                            { title: "Inject CAC/LTV Metrics", description: "Missing Customer Acquisition Cost data makes your go-to-market strategy look theoretical, not validated." }
                         ]).map((rec: any, idx: number) => {
                            const isLocked = false;
                            return (
                              <div key={idx} className={`bg-slate-900 p-4 rounded-xl border border-slate-800/50 relative overflow-hidden ${isLocked ? 'cursor-pointer' : ''}`} onClick={() => isLocked && setIsPricingOpen(true)}>
                                 <div className={isLocked ? 'blur-[3px] opacity-80 grayscale select-none' : ''}>
                                    <h4 className="font-bold text-sm mb-2 text-white">{idx + 1}. {rec.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                                 </div>
                              </div>
                            );
                         })}
                         <div onClick={() => setActiveTab('slides')} className="bg-gradient-to-br from-[var(--color-brand-cyan)]/10 to-[var(--color-brand-pink)]/10 p-4 rounded-xl border border-[var(--color-brand-pink)]/30 group cursor-pointer hover:border-[var(--color-brand-pink)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand-pink)]/5">
                            <div className="flex justify-between items-center mb-2">
                               <h4 className="font-bold text-sm text-[var(--color-brand-pink)] flex items-center gap-1"><Sparkles className="w-4 h-4" /> AI Rewrite Protocol</h4>
                               <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-pink)] bg-[var(--color-brand-pink)]/10 px-2 py-0.5 rounded border border-[var(--color-brand-pink)]/30">Active</span>
                            </div>
                            <p className="text-xs text-slate-300">Interact with the AI Assistant to rewrite or refine slides in real-time.</p>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Middle & Right Column - Insights */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Advanced Parameter Diagnostics */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                     <h3 className="font-bold uppercase tracking-wider text-slate-400 text-sm mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--color-brand-cyan)]" /> Parameter Diagnostics Matrix
                     </h3>
                     
                     {/* Top Row: Metric Tiles */}
                     <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
                        {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).map(([key, val]) => {
                           const value = val as number;
                           let colorClass = 'text-[var(--color-brand-pink)] border-[var(--color-brand-pink)]/30 bg-[var(--color-brand-pink)]/5';
                           if (value >= 80) colorClass = 'text-green-400 border-green-500/30 bg-green-500/5';
                           else if (value >= 60) colorClass = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5';

                           return (
                              <div key={key} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${colorClass}`}>
                                 <span className="text-xl md:text-2xl font-black">{value}</span>
                                 <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80">{key}</span>
                              </div>
                           );
                        })}
                     </div>

                     {/* Categorization Boxes */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* STRONG */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-green-500/30 flex flex-col gap-3">
                           <span className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> STRONG
                           </span>
                           <ul className="flex flex-col gap-1.5">
                              {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).filter(([k, v]) => (v as number) >= 80).map(([k, v]) => (
                                 <li key={k} className="text-sm font-medium text-slate-300 capitalize">{k}: {v as number}/100</li>
                              ))}
                           </ul>
                        </div>
                        {/* OPTIMIZE */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-yellow-500/30 flex flex-col gap-3">
                           <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> OPTIMIZE
                           </span>
                           <ul className="flex flex-col gap-1.5">
                              {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).filter(([k, v]) => (v as number) >= 60 && (v as number) < 80).map(([k, v]) => (
                                 <li key={k} className="text-sm font-medium text-slate-300 capitalize">{k}: {v as number}/100</li>
                              ))}
                           </ul>
                        </div>
                        {/* FIX NOW */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-[var(--color-brand-pink)]/30 flex flex-col gap-3 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-brand-pink)]/10 blur-xl rounded-full"></div>
                           <span className="text-xs font-bold text-[var(--color-brand-pink)] uppercase tracking-wider flex items-center gap-1 relative z-10">
                              <AlertTriangle className="w-3 h-3" /> FIX NOW
                           </span>
                           <ul className="flex flex-col gap-1.5 relative z-10">
                              {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).filter(([k, v]) => (v as number) < 60).map(([k, v]) => (
                                 <li key={k} className="text-sm font-medium text-slate-300 capitalize">{k}: {v as number}/100</li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Validated Strengths */}
                     <div className="bg-slate-900 border border-green-900/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                           <CheckCircle className="w-5 h-5 text-green-500" /> Validated Strengths <span className="text-[10px] text-green-500/70 font-mono uppercase border border-green-500/30 px-1.5 py-0.5 rounded bg-green-500/10 ml-2">Top 1% Alignment</span>
                        </h3>
                        <ul className="space-y-3">
                           {(sourceData.strengths || mockDashboardData.strengths).map((s: string, i: number) => (
                             <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                               <span className="text-green-500 mt-0.5 font-bold">+</span> 
                               <span>{s}</span>
                             </li>
                           ))}
                        </ul>
                     </div>

                     {/* Critical Vulnerabilities */}
                     <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-6 shadow-lg relative overflow-hidden bg-gradient-to-b from-slate-900 to-red-950/10">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-brand-pink)]"></div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2 text-[var(--color-brand-pink)]">
                           <AlertTriangle className="w-5 h-5" /> Critical Vulnerabilities
                        </h3>
                        <p className="text-xs text-red-400/80 uppercase tracking-wider font-bold mb-4">Fatal Flaws - Do Not Ignore</p>
                        <ul className="space-y-4">
                           {(sourceData.weaknesses || mockDashboardData.weaknesses).map((s: string, i: number) => {
                             const isLocked = false;
                             return (
                               <li key={i} className={`text-slate-200 text-sm flex items-start gap-3 bg-red-950/30 p-3 rounded-lg border border-red-900/30 relative overflow-hidden ${isLocked ? 'cursor-pointer' : ''}`} onClick={() => isLocked && setIsPricingOpen(true)}>
                                 <span className="text-[var(--color-brand-pink)] mt-0.5 font-bold text-lg leading-none">!</span> 
                                 <div className={`flex flex-col gap-1 ${isLocked ? 'blur-[3px] opacity-80 grayscale select-none' : ''}`}>
                                    <span className="font-semibold">{s}</span>
                                    <span className="text-xs text-slate-400 italic">Result: Institutional investors will pass without asking questions.</span>
                                 </div>
                                 {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
                                       <div className="bg-slate-900 border border-[var(--color-brand-pink)]/40 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(247,37,133,0.3)]">
                                          <Lock className="w-3.5 h-3.5 text-[var(--color-brand-pink)] animate-pulse" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-pink)]">Locked Flag</span>
                                       </div>
                                    </div>
                                 )}
                               </li>
                             );
                           })}
                        </ul>
                     </div>
                  </div>

                  {/* Assessment Matrix Layer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--color-brand-cyan)]"></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Revenue Quality Assessment</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                           {sourceData.dealMemo?.financialFlags?.[0] ? `Primary metric validation check: ${sourceData.dealMemo.financialFlags[0]}` : 'Overall baseline health meets expectations; core scaling mechanics require tighter unit economic tracking across secondary cohorts.'}
                        </p>
                     </div>
                     
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--color-brand-pink)]"></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Moat / Differentiation</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                           {sourceData.dealMemo?.marketNotes?.[0] ? `Strategic barrier audit: ${sourceData.dealMemo.marketNotes[0]}` : 'Barriers to entry are presently moderate. The team must isolate deeper IP moats to guarantee long-term defensibility against legacy enterprise platforms.'}
                        </p>
                     </div>

                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500"></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Market Context Assessment</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                           {sourceData.dealMemo?.marketNotes?.[1] || 'Rapidly evolving adoption pathways dictate immediate scale. High deployment demand offers strong asymmetric expansion possibilities.'}
                        </p>
                     </div>
                  </div>

                  {/* Comprehensive Institutional Deal Memo */}
                  {(sourceData.dealMemo || mockDashboardData.dealMemo) && (
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                        <h3 className="font-bold uppercase tracking-wider text-[var(--color-brand-cyan)] text-sm mb-6 flex items-center gap-2">
                           <FileText className="w-4 h-4" /> Comprehensive Institutional Deal Memo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Left Column: Flags & Notes */}
                           <div className="flex flex-col gap-6">
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                 <h4 className="text-sm font-bold text-[var(--color-brand-cyan)] mb-3 uppercase tracking-wider">Market and Competitive Notes</h4>
                                 <ul className="space-y-2">
                                    {(sourceData.dealMemo?.marketNotes || mockDashboardData.dealMemo.marketNotes).map((item: string, i: number) => (
                                       <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                                          <span className="text-[var(--color-brand-cyan)] font-bold">•</span> <span>{item}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>

                              <div className="bg-slate-950 p-4 rounded-xl border border-red-900/30">
                                 <h4 className="text-sm font-bold text-red-400 mb-3 uppercase tracking-wider">Missing Signals / Diligence Gaps</h4>
                                 <ul className="space-y-2">
                                    {(sourceData.dealMemo?.diligenceGaps || mockDashboardData.dealMemo.diligenceGaps).map((item: string, i: number) => (
                                       <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                                          <span className="text-red-400 font-bold">•</span> <span>{item}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>

                              <div className="bg-slate-950 p-4 rounded-xl border border-[var(--color-brand-pink)]/30">
                                 <h4 className="text-sm font-bold text-[var(--color-brand-pink)] mb-3 uppercase tracking-wider">Financial Flags</h4>
                                 <ul className="space-y-2">
                                    {(sourceData.dealMemo?.financialFlags || mockDashboardData.dealMemo.financialFlags).map((item: string, i: number) => (
                                       <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                                          <span className="text-[var(--color-brand-pink)] font-bold">•</span> <span>{item}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </div>

                           {/* Right Column: Directives */}
                           <div className="flex flex-col gap-6">
                              <div className="bg-slate-950 p-4 rounded-xl border border-green-900/30">
                                 <h4 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wider">What would increase conviction</h4>
                                 <ul className="space-y-2">
                                    {(sourceData.dealMemo?.increaseConviction || mockDashboardData.dealMemo.increaseConviction).map((item: string, i: number) => (
                                       <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                                          <span className="text-green-400 font-bold">•</span> <span>{item}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>

                              <div className="bg-slate-950 p-4 rounded-xl border border-yellow-500/20">
                                 <h4 className="text-sm font-bold text-yellow-500 mb-3 uppercase tracking-wider">Recommended Diligence Questions</h4>
                                 <ul className="space-y-2">
                                    {(sourceData.dealMemo?.recommendedDiligence || mockDashboardData.dealMemo.recommendedDiligence).map((item: string, i: number) => (
                                       <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                                          <span className="text-yellow-500 font-bold">•</span> <span>{item}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>

                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                 <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Assumptions</h4>
                                 <ul className="space-y-2">
                                    {(sourceData.dealMemo?.assumptions || mockDashboardData.dealMemo.assumptions).map((item: string, i: number) => (
                                       <li key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                                          <span className="text-slate-500 font-bold">•</span> <span>{item}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </div>
                        </div>

                        {/* Full Width Final Verdict */}
                        <div className="mt-6 bg-slate-950 border border-slate-800/60 p-5 rounded-xl relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--color-brand-cyan)] to-[var(--color-brand-pink)]"></div>
                           <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Final Investment Committee Verdict</h4>
                           <p className="text-slate-200 text-sm leading-relaxed italic">
                              "{sourceData.dealMemo?.finalVerdict || mockDashboardData.dealMemo.finalVerdict}"
                           </p>
                        </div>
                     </div>
                  )}
                  
                  <div className="mt-2 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-pink)]/5 rounded-full blur-3xl" />
                     <div className="flex flex-col gap-2 relative z-10 max-w-xl">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                           <AlertTriangle className="w-6 h-6 text-[var(--color-brand-pink)]" /> Stop Guessing What Investors Want.
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                           Your deck currently contains <strong className="text-[var(--color-brand-pink)]">fatal flaws</strong> that will cause high-tier investors to pass. Don't burn your lead list. CapNexgen Advisory can restructure your narrative to top 1% standards within 48 hours.
                        </p>
                     </div>
                     <a 
                        href="https://www.capnexgen.com/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="relative z-10 shrink-0 bg-white text-slate-950 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[var(--color-brand-cyan)] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(15,186,198,0.4)] hover:-translate-y-1"
                     >
                        Request Intervention
                     </a>
                  </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'slides' && (
             <motion.div 
              key="chat-assistant"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[650px]"
             >
                {/* Chat Header */}
                <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cyan)]/20 flex items-center justify-center text-white">
                         {personaMode === 'vc' ? <Briefcase className="w-5 h-5 text-[var(--color-brand-cyan)]" /> : <Building className="w-5 h-5 text-[var(--color-brand-cyan)]" />}
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            Ask {personaMode === 'vc' ? 'Institutional VC Advisor' : 'Angel Growth Advisor'}
                         </h3>
                         <p className="text-xs text-slate-400">Multi-turn contextual insights on your venture funding parameters.</p>
                      </div>
                   </div>
                   <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 flex">
                      <button 
                        onClick={() => setPersonaMode('vc')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${personaMode === 'vc' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                      >
                        VC Layer
                      </button>
                      <button 
                        onClick={() => setPersonaMode('angel')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${personaMode === 'angel' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                      >
                        Angel Layer
                      </button>
                   </div>
                </div>

                {/* Chat Stream Area */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-slate-950/50 relative">
                   {getChatHistory('global').map((msg: any, mIdx: number) => (
                      <div key={mIdx} className={`flex gap-4 max-w-[75%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${msg.sender === 'user' ? 'bg-slate-700' : 'bg-[var(--color-brand-cyan)]/20'}`}>
                           {msg.sender === 'user' ? 'ME' : personaMode === 'vc' ? <Briefcase className="w-4 h-4 text-[var(--color-brand-cyan)]" /> : <Building className="w-4 h-4 text-[var(--color-brand-cyan)]" />}
                         </div>
                         <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[var(--color-brand-cyan)]/20 text-white border-[var(--color-brand-cyan)]/30 rounded-tr-sm' : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-sm shadow-md'}`}>
                            {msg.text}
                         </div>
                      </div>
                   ))}
                </div>

                {/* Floating Starter Prompts */}
                <div className="px-6 py-2 bg-slate-950/20 flex flex-wrap gap-2 border-t border-slate-800/40">
                   {personaMode === 'vc' ? (
                      <>
                        <button onClick={() => setChatInput("Why did my Financials slide trigger a High Capital Risk warning?")} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-full px-3 py-1.5 transition-colors">Analyze Capital Risk</button>
                        <button onClick={() => setChatInput("What exact CAC/LTV ratio do you need to see to eliminate this dealbreaker?")} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-full px-3 py-1.5 transition-colors">Resolve Dealbreaker</button>
                        <button onClick={() => setChatInput("How severely does my TAM calculation deviate from institutional standards?")} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-full px-3 py-1.5 transition-colors">Audit TAM Validity</button>
                      </>
                   ) : (
                      <>
                        <button onClick={() => setChatInput("How can we eliminate narrative friction before pitching to Sequoia?")} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-full px-3 py-1.5 transition-colors">Eliminate Friction</button>
                        <button onClick={() => setChatInput("What early traction pivots would force investors to ignore my weaknesses?")} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-full px-3 py-1.5 transition-colors">Traction Hacking</button>
                        <button onClick={() => setChatInput("Help me map out a strategic 18-month Use of Funds timeline.")} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-full px-3 py-1.5 transition-colors">Optimize Roadmap</button>
                      </>
                   )}
                </div>

                {/* Chat Input Interface */}
                <div className="p-6 bg-slate-950 border-t border-slate-800">
                   <div className="relative flex items-center">
                      <input 
                        type="text" 
                        placeholder={`Ask ${personaMode === 'vc' ? 'the VC' : 'the Angel'} to clarify details on the deck...`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('global')}
                        className="w-full bg-slate-900 border border-slate-800 text-sm text-white rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:border-[var(--color-brand-cyan)] placeholder-slate-500 shadow-inner font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => handleSendMessage('global')}
                        className="absolute right-3 w-10 h-10 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-cyan)]/80 text-white rounded-xl flex items-center justify-center transition-colors shadow-md"
                      >
                         <Send className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

      {/* Hidden PDF Export Template */}
      <div id="pdf-export-template" style={{ display: 'none' }}>
         
         {/* PAGE 1: Overview & Executive Summary */}
         <div className="pdf-page" style={{ width: '800px', height: '1131px', padding: '60px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ borderBottom: '3px solid #0fbac6', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
               <div>
                  <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#09102b', margin: 0 }}>Pitch Deck Analysis Report</h1>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 0 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Powered by Capnexis Intelligence</p>
               </div>
               <span style={{ fontSize: '12px', color: '#94a3b8' }}>Date: {new Date().toLocaleDateString()}</span>
            </div>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', alignItems: 'center' }}>
               <div style={{ flex: '0 0 140px', height: '140px', borderRadius: '50%', border: '10px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#0fbac6' }}>{displayScore}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '-2px' }}>Overall Score</div>
               </div>
               
               <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '1px', fontWeight: 'bold' }}>Investment Posture</h3>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: displayScore >= 80 ? '#22c55e' : displayScore >= 60 ? '#eab308' : '#f72585', margin: 0 }}>
                     {displayScore >= 80 ? 'High Conviction Target' : displayScore >= 60 ? 'Promising First-Pass Opportunity' : 'Requires Significant Remediation'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: '8px', lineHeight: '1.5' }}>
                     {displayScore >= 80 ? 'Recommended for immediate advancement to technical diligence.' : displayScore >= 60 ? 'Warrants continued diligence, prioritizing revenue validation and retention analysis.' : 'Not currently conviction-ready without heavy structural improvements.'}
                  </p>
               </div>
            </div>

            {/* Core Section Scores */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', padding: '15px 20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
               {dynamicRadarData.map(item => (
                  <div key={item.subject} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.subject}</span>
                     <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{item.deck} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>/ 100</span></span>
                  </div>
               ))}
            </div>

            <div style={{ marginBottom: '40px' }}>
               <h2 style={{ fontSize: '16px', color: '#09102b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Executive Summary</h2>
               <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155', margin: 0 }}>{displaySummary}</p>
            </div>

            {/* ADDED: Advanced Parameter Diagnostics */}
            <div style={{ marginBottom: '40px' }}>
               <h2 style={{ fontSize: '16px', color: '#09102b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Parameter Diagnostics Matrix</h2>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '25px' }}>
                  {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).map(([key, val]) => {
                     const value = val as number;
                     let color = '#f72585'; // default pink/red
                     let bgColor = '#fdf2f8';
                     if (value >= 80) { color = '#16a34a'; bgColor = '#f0fdf4'; }
                     else if (value >= 60) { color = '#ca8a04'; bgColor = '#fefce8'; }

                     return (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', borderRadius: '8px', border: `1px solid ${color}30`, backgroundColor: bgColor }}>
                           <span style={{ fontSize: '20px', fontWeight: '900', color: color }}>{value}</span>
                           <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px', color: '#64748b', letterSpacing: '0.5px' }}>{key}</span>
                        </div>
                     );
                  })}
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '8px' }}>
                     <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#15803d', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>✓ Strong</span>
                     <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '12px', color: '#1e3a8a', lineHeight: '1.6' }}>
                        {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).filter(([k, v]) => (v as number) >= 80).map(([k]) => (
                           <li key={k} style={{ textTransform: 'capitalize' }}>{k}</li>
                        ))}
                     </ul>
                  </div>
                  <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '15px', borderRadius: '8px' }}>
                     <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#a16207', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>⚠ Optimize</span>
                     <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '12px', color: '#713f12', lineHeight: '1.6' }}>
                        {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).filter(([k, v]) => (v as number) >= 60 && (v as number) < 80).map(([k]) => (
                           <li key={k} style={{ textTransform: 'capitalize' }}>{k}</li>
                        ))}
                     </ul>
                  </div>
                  <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', padding: '15px', borderRadius: '8px' }}>
                     <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#be123c', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>✖ Fix Now</span>
                     <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '12px', color: '#9f1239', lineHeight: '1.6' }}>
                        {Object.entries(sourceData.advancedMetrics || mockDashboardData.advancedMetrics).filter(([k, v]) => (v as number) < 60).map(([k]) => (
                           <li key={k} style={{ textTransform: 'capitalize' }}>{k}</li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>

            <div style={{ position: 'absolute', bottom: '30px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
               <strong>Capnexis Premium Analytics</strong>
               <span>Page 1 of 4</span>
            </div>
         </div>

         {/* PAGE 2: Strengths, Risks & Assessments */}
         <div className="pdf-page" style={{ width: '800px', height: '1131px', padding: '60px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ marginBottom: '35px' }}>
               <h2 style={{ fontSize: '16px', color: '#22c55e', borderBottom: '2px solid #bbf7d0', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>Top Strengths</h2>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {(sourceData.strengths || mockDashboardData.strengths).map((s: string, i: number) => (
                     <li key={i} style={{ marginBottom: '10px' }}>{s}</li>
                  ))}
               </ul>
            </div>

            <div style={{ marginBottom: '35px' }}>
               <h2 style={{ fontSize: '16px', color: '#f72585', borderBottom: '2px solid #fecdd3', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>Top Risks</h2>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {(sourceData.weaknesses || mockDashboardData.weaknesses).map((s: string, i: number) => (
                     <li key={i} style={{ marginBottom: '10px' }}>{s}</li>
                  ))}
               </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', backgroundColor: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <div>
                  <h3 style={{ fontSize: '14px', color: '#09102b', margin: '0 0 8px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue Quality</h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                     {sourceData.dealMemo?.financialFlags?.[0] ? `Diligence required: ${sourceData.dealMemo.financialFlags[0]}` : 'Overall baseline health meets expectations; core scaling mechanics require tighter unit economic tracking across secondary cohorts.'}
                  </p>
               </div>

               <div>
                  <h3 style={{ fontSize: '14px', color: '#09102b', margin: '0 0 8px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moat / Differentiation</h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                     {sourceData.dealMemo?.marketNotes?.[0] ? `Strategic overview: ${sourceData.dealMemo.marketNotes[0]}` : 'Barriers to entry are presently moderate. The team must isolate deeper IP moats to guarantee long-term defensibility against legacy enterprise platforms.'}
                  </p>
               </div>

               <div>
                  <h3 style={{ fontSize: '14px', color: '#09102b', margin: '0 0 8px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Market Context</h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                     {sourceData.dealMemo?.marketNotes?.[1] || 'Rapidly evolving adoption pathways dictate immediate scale. High deployment demand offers strong asymmetric expansion possibilities.'}
                  </p>
               </div>
            </div>

            <div style={{ position: 'absolute', bottom: '30px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
               <strong>Capnexis Premium Analytics</strong>
               <span>Page 2 of 4</span>
            </div>
         </div>

         {/* PAGE 3: Gaps & Financial Flags */}
         <div className="pdf-page" style={{ width: '800px', height: '1131px', padding: '60px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ marginBottom: '35px' }}>
               <h2 style={{ fontSize: '16px', color: '#eab308', borderBottom: '2px solid #fef08a', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>Missing Signals</h2>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {(sourceData.dealMemo?.diligenceGaps || mockDashboardData.dealMemo.diligenceGaps).map((item: string, i: number) => (
                     <li key={i} style={{ marginBottom: '10px' }}>{item}</li>
                  ))}
               </ul>
            </div>

            <div style={{ marginBottom: '35px' }}>
               <h2 style={{ fontSize: '16px', color: '#ef4444', borderBottom: '2px solid #fecaca', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>Financial Flags</h2>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {(sourceData.dealMemo?.financialFlags || mockDashboardData.dealMemo.financialFlags).map((item: string, i: number) => (
                     <li key={i} style={{ marginBottom: '10px' }}>{item}</li>
                  ))}
               </ul>
            </div>

            <div style={{ marginBottom: '35px', backgroundColor: '#fdf4ff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #d946ef' }}>
               <h2 style={{ fontSize: '16px', color: '#d946ef', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Conviction Boosters</h2>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {(sourceData.dealMemo?.increaseConviction || mockDashboardData.dealMemo.increaseConviction).map((item: string, i: number) => (
                     <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
                  ))}
               </ul>
            </div>

            <div style={{ position: 'absolute', bottom: '30px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
               <strong>Capnexis Premium Analytics</strong>
               <span>Page 3 of 4</span>
            </div>
         </div>

         {/* PAGE 4: Diligence & Final Verdict */}
         <div className="pdf-page" style={{ width: '800px', height: '1131px', padding: '60px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', position: 'relative' }}>
            <div style={{ marginBottom: '35px' }}>
               <h2 style={{ fontSize: '16px', color: '#09102b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>Recommended Diligence Questions</h2>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {(sourceData.dealMemo?.recommendedDiligence || mockDashboardData.dealMemo.recommendedDiligence || []).map((item: string, i: number) => (
                     <li key={i} style={{ marginBottom: '10px' }}>{item}</li>
                  ))}
               </ul>
            </div>

            <div style={{ marginBottom: '35px' }}>
               <h2 style={{ fontSize: '16px', color: '#09102b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>Underlying Assumptions</h2>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  {(sourceData.dealMemo?.assumptions || mockDashboardData.dealMemo.assumptions || []).map((item: string, i: number) => (
                     <li key={i} style={{ marginBottom: '10px' }}>{item}</li>
                  ))}
               </ul>
            </div>

            <div style={{ backgroundColor: '#09102b', color: '#ffffff', padding: '30px', borderRadius: '12px', marginTop: '40px', borderLeft: '6px solid #0fbac6', boxShadow: '0 4px 12px rgba(9,16,43,0.1)' }}>
               <h2 style={{ fontSize: '14px', color: '#0fbac6', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Final Strategic Verdict</h2>
               <p style={{ fontSize: '15px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                  "{sourceData.dealMemo?.finalVerdict || mockDashboardData.dealMemo.finalVerdict}"
               </p>
            </div>

            <div style={{ position: 'absolute', bottom: '30px', left: '60px', right: '60px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
               <strong>Capnexis Premium Analytics</strong>
               <span>Page 4 of 4</span>
            </div>
         </div>
      </div>

      <footer className="w-full text-center mt-12 pt-6 border-t border-slate-800 text-sm text-slate-500">
        <p>A flagship product engineered by <a href="https://www.capnexgen.com/" target="_blank" rel="noreferrer" className="text-[var(--color-brand-cyan)] hover:text-white transition-colors font-bold tracking-wide">CapNexgen</a></p>
      </footer>

      <Pricing 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
      />
    </div>
  </div>
  );
}
