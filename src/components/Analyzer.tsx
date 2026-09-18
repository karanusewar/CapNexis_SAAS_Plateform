import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { BrainCircuit, FileSearch, CheckCircle2 } from 'lucide-react';
import { useAuth } from './FirebaseProvider';
import { updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AnalyzerProps {
  fileData: { name: string, data: string } | null;
  onComplete: (data?: any) => void;
}

const steps = [
  { id: 1, text: "Parsing slide deck...", icon: FileSearch },
  { id: 2, text: "Extracting problem & solution...", icon: BrainCircuit },
  { id: 3, text: "Evaluating market size methodology...", icon: BrainCircuit },
  { id: 4, text: "Benchmarking against funded startups...", icon: BrainCircuit },
  { id: 5, text: "Generating actionable rewrites...", icon: BrainCircuit },
  { id: 6, text: "Synthesizing final VC scores...", icon: BrainCircuit },
  { id: 7, text: "Finalizing Capnexis schema...", icon: BrainCircuit },
  { id: 8, text: "Almost done, compiling report...", icon: CheckCircle2 }
];

export function Analyzer({ fileData, onComplete }: AnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorString, setErrorString] = useState<string | null>(null);
  const { user, credits } = useAuth();
  
  // To avoid running the fetch twice in strict mode
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (errorString) return;
    const timer = setTimeout(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : 4)); // Cycle back to step 4 instead of freezing
    }, 3500); // Slower updates to spread out the waiting time
    return () => clearTimeout(timer);
  }, [currentStep, errorString]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function analyze() {
       if (!fileData || !fileData.data) {
          setCurrentStep(steps.length);
          setTimeout(() => onComplete(null), 1000);
          return;
       }

        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              credits: increment(-1)
            });
          } catch(e) {
            console.log("Demo environment: bypassing strict token validation", e);
          }
        }

       try {
         const { GoogleGenAI, Type } = await import('@google/genai');
         const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
         if (!apiKey) {
           throw new Error("Missing GEMINI_API_KEY. Please add GEMINI_API_KEY to your Vercel Environment Variables and redeploy.");
         }
         const ai = new GoogleGenAI({ apiKey });

         const prompt = `You are a Tier-1 Silicon Valley Venture Capitalist committee (e.g., Sequoia, Y-Combinator). You are conducting a ruthless, un-sugar-coated, and highly accurate analysis of this startup pitch deck. You must extract extreme detail, point out fatal flaws that would kill the deal, and offer structural interventions to fix them. Crucially, you must strictly evaluate 8 core parameters (Idea, Product, GTM, Revenue, IP, Scalability, Network, Exit) from 0 to 100 based strictly on the content of the deck. You must also build a comprehensive institutional Deal Memo containing: market and competitive notes, missing signals/diligence gaps, financial flags, what would increase conviction, recommended diligence questions, baseline assumptions, and a definitive final verdict. Provide the exact JSON schema requested.`;

         const { name: fileName, data: documentData } = fileData;
         let contents: any[] = [prompt];
         
         if (documentData && documentData.startsWith("data:")) {
            const mimeMatch = documentData.match(/^data:(.*?);base64,/);
            if (mimeMatch) {
               const mimeType = mimeMatch[1];
               const base64Data = documentData.split(",")[1];
               contents = [
                 {
                   parts: [
                     { text: prompt },
                     { inlineData: { mimeType, data: base64Data } }
                   ]
                 }
               ];
            }
         } else {
            throw new Error("No valid document data provided.");
         }

         const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: contents,
           config: {
             responseMimeType: "application/json",
             responseSchema: {
                type: Type.OBJECT,
                properties: {
                   generalScore: { type: Type.INTEGER },
                   summary: { type: Type.STRING },
                   capitalRisk: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, or CRITICAL" },
                   narrativeMatch: { type: Type.INTEGER, description: "Score 0-100 indicating match to YC/Sequoia standard" },
                   strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                   weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                   aiRecommendations: { 
                      type: Type.ARRAY, 
                      items: { 
                         type: Type.OBJECT, 
                         properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                         } 
                      } 
                   },
                   sections: {
                      type: Type.OBJECT,
                      properties: {
                         market: { type: Type.INTEGER },
                         product: { type: Type.INTEGER },
                         financials: { type: Type.INTEGER },
                         storytelling: { type: Type.INTEGER },
                         clarity: { type: Type.INTEGER },
                      }
                   },
                   advancedMetrics: {
                      type: Type.OBJECT,
                      properties: {
                         idea: { type: Type.INTEGER },
                         product: { type: Type.INTEGER },
                         gtm: { type: Type.INTEGER },
                         revenue: { type: Type.INTEGER },
                         ip: { type: Type.INTEGER },
                         scalability: { type: Type.INTEGER },
                         network: { type: Type.INTEGER },
                         exit: { type: Type.INTEGER }
                      }
                   },
                   dealMemo: {
                      type: Type.OBJECT,
                      properties: {
                         marketNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                         diligenceGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                         financialFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                         increaseConviction: { type: Type.ARRAY, items: { type: Type.STRING } },
                         recommendedDiligence: { type: Type.ARRAY, items: { type: Type.STRING } },
                         assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                         finalVerdict: { type: Type.STRING }
                      }
                   },
                   slides: {
                      type: Type.ARRAY,
                      items: {
                         type: Type.OBJECT,
                         properties: {
                            id: { type: Type.INTEGER },
                            type: { type: Type.STRING },
                            title: { type: Type.STRING },
                            scores: {
                               type: Type.OBJECT,
                               properties: {
                                  impact: { type: Type.INTEGER }
                               }
                            },
                            issues: {
                               type: Type.ARRAY,
                               items: { type: Type.STRING }
                            },
                            rewrite: {
                               type: Type.OBJECT,
                               properties: {
                                  improved: { type: Type.STRING }
                               }
                            }
                         }
                      }
                   }
                }
             }
           }
         });

         const resultText = response.text;
         if (!resultText) {
            throw new Error("Empty response from AI");
         }

         const data = JSON.parse(resultText);

         // Mixture of Experts: HuggingFace Secondary Advisor Layer
         try {
            const hfToken = process.env.HUGGINGFACE_API_KEY;
            if (hfToken) {
               const hfPrompt = `Review this analysis: ${data.summary}. Suggest one extra VC risk.`;
               const hfRes = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct", {
                  method: "POST",
                  headers: { 
                     "Authorization": `Bearer ${hfToken}`,
                     "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ inputs: hfPrompt })
               });
               const hfData = await hfRes.json();
               if (hfData && hfData[0]?.generated_text) {
                  data.summary += `\n\n[HF Advisor Insight]: ${hfData[0].generated_text}`;
               }
            }
         } catch (hfErr) {
            console.log("HF Ensemble layer ignored.", hfErr);
         }
         setCurrentStep(steps.length);
         setTimeout(() => onComplete(data), 1000);

       } catch(err: any) {
         setErrorString(err.message || String(err));
       }
    }
    
    analyze();
  }, [fileData, onComplete, user]);

  return (
    <div className="min-h-screen bg-[var(--color-brand-dark)] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-brand-blue)]/20 via-[var(--color-brand-dark)] to-[var(--color-brand-dark)]">
      <div className="max-w-md w-full">
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex justify-center mb-8 relative">
            {currentStep < steps.length ? (
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-[var(--color-brand-cyan)] border-r-[var(--color-brand-pink)] flex items-center justify-center"
               >
                 <BrainCircuit className="w-10 h-10 text-[var(--color-brand-cyan)] animate-pulse" />
               </motion.div>
            ) : (
                <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 type="spring"
                 className="w-24 h-24 rounded-full bg-[var(--color-brand-cyan)]/20 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-[var(--color-brand-cyan)]" />
                </motion.div>
            )}
            
          </div>
          
          <h3 className="text-2xl font-bold text-center mb-8 text-white">
            {errorString ? 'Analysis Failed' : currentStep < steps.length ? 'Analyzing Pipeline' : 'Analysis Complete!'}
          </h3>

          {errorString ? (
             <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center text-sm font-mono flex flex-col gap-2">
               <span>{errorString}</span>
               <button onClick={() => window.location.reload()} className="underline underline-offset-4 mt-2">Try Again</button>
             </div>
          ) : (
            <div className="space-y-4">
               {currentStep === 4 && <div className="text-xs text-center text-[var(--color-brand-cyan)] font-mono animate-pulse mb-4">CapNexgen AI Engine is running deep analysis. This may take up to 60s...</div>}
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              const Icon = isPast ? CheckCircle2 : step.icon;

              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: isPast || isActive ? 1 : 0.3, 
                    x: 0,
                  }}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-800 border border-slate-700' : ''
                  }`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isPast ? 'bg-green-500/20 text-green-400' : isActive ? 'bg-[var(--color-brand-cyan)]/20 text-[var(--color-brand-cyan)]' : 'bg-slate-800 text-slate-500'}
                  `}>
                    <Icon className={`w-4 h-4 ${isActive && !isPast ? 'animate-bounce' : ''}`} />
                  </div>
                  <span className={`font-medium ${isPast ? 'text-slate-300' : isActive ? 'text-white' : 'text-slate-500'}`}>
                    {step.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
