
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import { analyzeProductImage, generateProductVision } from './services/geminiService';
import { AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    images: [],
    isAnalyzing: false,
    isGeneratingImage: false,
    analysis: null,
    generatedImage: null,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Explicitly cast to any or File to fix potential unknown type inference issues with Array.from(FileList)
      const readers = files.map((file: any) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        setState(prev => ({ 
          ...prev, 
          images: [...prev.images, ...results].slice(0, 5), // Limit to 5 images
          analysis: null, 
          generatedImage: null, 
          error: null 
        }));
      });
    }
  };

  const removeImage = (index: number) => {
    setState(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      analysis: null,
      generatedImage: null
    }));
  };

  const handleProcess = async () => {
    if (state.images.length === 0) return;

    setState(prev => ({ ...prev, isAnalyzing: true, error: null, analysis: null, generatedImage: null }));
    
    try {
      // Step 1: Psychological & Design Analysis using multiple refs
      const analysisResult = await analyzeProductImage(state.images);
      setState(prev => ({ ...prev, analysis: analysisResult, isAnalyzing: false, isGeneratingImage: true }));
      
      // Step 2: Image Generation (Vision) using multiple refs
      const visionResult = await generateProductVision(analysisResult.imagePrompt, state.images);
      setState(prev => ({ ...prev, generatedImage: visionResult, isGeneratingImage: false }));
      
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        isGeneratingImage: false, 
        error: "প্রসেস করার সময় সমস্যা হয়েছে। আপনার ইন্টারনেট চেক করে আবার চেষ্টা করুন।" 
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("প্রম্পট কপি করা হয়েছে!");
  };

  return (
    <div className="min-h-screen pb-20 bg-[#070b14] text-slate-200">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 mt-12">
        <section className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">
            ব্রেক-থ্রু <span className="text-indigo-500">প্রোডাক্ট</span> ডিজাইন
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
            আপনার প্রোডাক্টের এক বা একাধিক রেফারেন্স ছবি আপলোড করুন। AI সব ছবি মিলিয়ে সেরা ডিজাইন মকআপ তৈরি করবে।
          </p>
        </section>

        {/* Action Center */}
        {!state.analysis && !state.isAnalyzing && !state.isGeneratingImage && (
          <div className="max-w-2xl mx-auto glass rounded-[2.5rem] p-10 text-center border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
            <div 
              className="w-full min-h-[200px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all group p-6"
              onClick={() => fileInputRef.current?.click()}
            >
              {state.images.length === 0 ? (
                <>
                  <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <p className="font-bold text-lg mb-1">প্রোডাক্টের ছবিগুলো আপলোড করুন</p>
                  <p className="text-slate-500 text-sm">আপনি চাইলে অনেকগুলো অ্যাঙ্গেলের ছবি দিতে পারেন</p>
                </>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                  {state.images.map((img, idx) => (
                    <div key={idx} className="relative group/img aspect-square rounded-xl overflow-hidden border border-white/10">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  {state.images.length < 5 && (
                    <div className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center hover:border-indigo-500/50">
                       <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </div>
                  )}
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
            </div>
            
            {state.images.length > 0 && (
              <button 
                onClick={handleProcess}
                className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                {state.images.length} টি ছবি দিয়ে ডিজাইন শুরু করুন
              </button>
            )}
          </div>
        )}

        {/* Loading States */}
        {(state.isAnalyzing || state.isGeneratingImage) && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-t-4 border-cyan-400 rounded-full animate-spin-slow"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {state.isAnalyzing ? "মাল্টি-রেফারেন্স অ্যানালাইসিস চলছে..." : "কম্পোজিট ভিশন রেন্ডার হচ্ছে..."}
            </h3>
            <p className="text-slate-400 italic">
              "সবগুলো রেফারেন্স ছবি মিলিয়ে আপনার ব্র্যান্ডের জন্য সেরা ভিশন তৈরি হচ্ছে..."
            </p>
          </div>
        )}

        {/* Professional Result Display */}
        {state.analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in duration-1000">
            
            {/* Left: Strategic Brief */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass p-8 rounded-[2rem] border-white/5 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white">{state.analysis.productTitle}</h3>
                    <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs mt-1">{state.analysis.category}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center min-w-[100px]">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">টার্গেট</p>
                    <p className="text-xs font-bold text-slate-300">{state.analysis.targetAudience}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wide">মুড ও ইফেক্ট</h4>
                    <p className="text-sm leading-relaxed">{state.analysis.psychologicalProfile.mood} - {state.analysis.psychologicalProfile.emotionalImpact}</p>
                  </div>

                  <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-bold text-cyan-300 mb-4 uppercase tracking-wide">কালার সাইকোলজি</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {state.analysis.psychologicalProfile.colorPalette.map((color, i) => (
                        <div key={i} className="group relative shrink-0">
                          <div className="w-12 h-12 rounded-xl border border-white/10 shadow-lg" style={{ backgroundColor: color }}></div>
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-bold text-emerald-300 mb-3 uppercase tracking-wide">ডিজাইন স্ট্র্যাটেজি</h4>
                    <ul className="text-xs space-y-2 text-slate-400">
                      <li>• <strong>লাইট:</strong> {state.analysis.designStrategy.lighting}</li>
                      <li>• <strong>সেটিং:</strong> {state.analysis.designStrategy.background}</li>
                      <li>• <strong>অ্যাঙ্গেল:</strong> {state.analysis.designStrategy.composition}</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-indigo-900/20 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
                  <h4 className="text-xs font-black text-indigo-400 uppercase mb-3 tracking-widest">Client-Ready Prompt</h4>
                  <p className="text-xs italic font-mono text-indigo-200/80 leading-relaxed mb-4">"{state.analysis.imagePrompt}"</p>
                  <button 
                    onClick={() => copyToClipboard(state.analysis?.imagePrompt || '')}
                    className="w-full py-2 bg-indigo-600/50 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-all"
                  >
                    কপি করে ব্যবহার করুন
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setState(prev => ({ ...prev, analysis: null, generatedImage: null, images: [] }))}
                className="w-full py-4 rounded-2xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition-all font-bold"
              >
                নতুন প্রোডাক্ট অ্যানালাইসিস
              </button>
            </div>

            {/* Right: Vision Display */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass rounded-[2rem] overflow-hidden border-white/10 relative">
                <div className="absolute top-6 left-6 z-10">
                   <span className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs font-black text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                     Composite AI Vision
                   </span>
                </div>
                
                {state.generatedImage ? (
                  <img src={state.generatedImage} alt="AI Vision" className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-slate-900 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 animate-pulse">মাল্টি-রেফারেন্স ভিশন জেনারেট হচ্ছে...</p>
                  </div>
                )}

                <div className="p-8 bg-black/40 backdrop-blur-xl border-t border-white/5">
                   <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">এই ডিজাইনটি আপনার ক্লায়েন্টকে দেখান</h4>
                        <p className="text-sm text-slate-400">এই প্রিভিউটি সব রেফারেন্স ছবি মিলিয়ে {state.analysis.designStrategy.style} স্টাইলে তৈরি করা হয়েছে।</p>
                      </div>
                      <div className="flex gap-4">
                         {state.generatedImage && (
                           <a 
                             href={state.generatedImage} 
                             download="product-vision.png"
                             className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
                           >
                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           </a>
                         )}
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="glass p-6 rounded-[2rem] border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest">Reference Context (Multi-Angle)</p>
                <div className="grid grid-cols-5 gap-3">
                   {state.images.map((img, i) => (
                     <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                        <img src={img} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
      
      {/* Custom Styles */}
      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
