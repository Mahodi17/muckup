
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import { analyzeProductImage, generateProductVision } from './services/geminiService';
import { AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    productImages: [],
    referenceImages: [],
    aspectRatio: "1:1",
    customInstructions: "",
    isAnalyzing: false,
    isGeneratingImage: false,
    analysis: null,
    generatedImage: null,
    error: null,
  });

  const productInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'ref') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
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
          [type === 'product' ? 'productImages' : 'referenceImages']: [...prev[type === 'product' ? 'productImages' : 'referenceImages'], ...results].slice(0, 3),
          analysis: null, 
          generatedImage: null, 
          error: null 
        }));
      });
    }
  };

  const removeImage = (index: number, type: 'product' | 'ref') => {
    setState(prev => ({
      ...prev,
      [type === 'product' ? 'productImages' : 'referenceImages']: prev[type === 'product' ? 'productImages' : 'referenceImages'].filter((_, i) => i !== index),
      analysis: null,
      generatedImage: null
    }));
  };

  const handleProcess = async () => {
    if (state.productImages.length === 0) {
      setState(prev => ({ ...prev, error: "অনুগ্রহ করে অন্তত একটি প্রোডাক্টের ছবি আপলোড করুন।" }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null, analysis: null, generatedImage: null }));
    
    try {
      const analysisResult = await analyzeProductImage(state.productImages, state.referenceImages, state.customInstructions);
      setState(prev => ({ ...prev, analysis: analysisResult, isAnalyzing: false, isGeneratingImage: true }));
      
      const visionResult = await generateProductVision(analysisResult.imagePrompt, state.productImages, state.referenceImages, state.aspectRatio);
      setState(prev => ({ ...prev, generatedImage: visionResult, isGeneratingImage: false }));
      
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        isGeneratingImage: false, 
        error: "প্রসেস করার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।" 
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("প্রম্পট কপি করা হয়েছে!");
  };

  const aspectRatios = [
    { id: "1:1", label: "স্কয়ার", icon: "M4 4h16v16H4V4z" },
    { id: "16:9", label: "ওয়াইড", icon: "M2 6h20v12H2V6z" },
    { id: "9:16", label: "পোর্ট্রেট", icon: "M6 2h12v20H6V2z" },
    { id: "4:3", label: "স্ট্যান্ডার্ড", icon: "M3 5h18v14H3V5z" },
    { id: "3:4", label: "ভার্টিক্যাল", icon: "M5 3h14v18H5V3z" },
  ];

  return (
    <div className="min-h-screen pb-20 bg-[#070b14] text-slate-200">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 mt-12">
        <section className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">
            ব্রেক-থ্রু <span className="text-indigo-500">প্রোডাক্ট</span> ডিজাইন
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
            আপনার প্রোডাক্ট এবং স্টাইল রেফারেন্স দিন, AI বাকিটা বুঝে নেবে।
          </p>
          {state.error && <p className="mt-4 text-red-400 font-bold bg-red-400/10 py-2 px-4 rounded-xl inline-block">{state.error}</p>}
        </section>

        {!state.analysis && !state.isAnalyzing && !state.isGeneratingImage && (
          <div className="max-w-5xl mx-auto glass rounded-[2.5rem] p-8 md:p-12 border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Image Uploads */}
              <div className="space-y-8">
                {/* Product Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">১</span>
                     প্রোডাক্টের ছবি (আবশ্যক)
                  </h3>
                  <div 
                    className="w-full min-h-[160px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all p-4"
                    onClick={() => productInputRef.current?.click()}
                  >
                    {state.productImages.length === 0 ? (
                      <div className="text-center">
                        <svg className="w-8 h-8 text-indigo-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-xs font-bold text-slate-400">মেইন প্রোডাক্ট ছবি দিন</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 w-full">
                        {state.productImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={(e) => { e.stopPropagation(); removeImage(idx, 'product'); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input type="file" ref={productInputRef} onChange={(e) => handleFileChange(e, 'product')} className="hidden" accept="image/*" multiple />
                  </div>
                </div>

                {/* Reference Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <span className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">২</span>
                     স্টাইল রেফারেন্স (ঐচ্ছিক)
                  </h3>
                  <div 
                    className="w-full min-h-[160px] border-2 border-dashed border-emerald-500/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition-all p-4"
                    onClick={() => refInputRef.current?.click()}
                  >
                    {state.referenceImages.length === 0 ? (
                      <div className="text-center">
                        <svg className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <p className="text-xs font-bold text-slate-400 italic">পছন্দের স্টাইল বা এনভায়রনমেন্ট দিন</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 w-full">
                        {state.referenceImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={(e) => { e.stopPropagation(); removeImage(idx, 'ref'); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input type="file" ref={refInputRef} onChange={(e) => handleFileChange(e, 'ref')} className="hidden" accept="image/*" multiple />
                  </div>
                </div>
              </div>

              {/* Right Column: Text & Ratios */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                     <span className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">৩</span>
                     আপনার চাহিদা লিখে দিন
                  </h3>
                  <textarea 
                    value={state.customInstructions}
                    onChange={(e) => setState(prev => ({ ...prev, customInstructions: e.target.value }))}
                    placeholder="যেমন: 'ব্যাকগ্রাউন্ডে সমুদ্রের পাহাড় দিন' বা 'প্রোডাক্টটি আরো লাক্সারি স্টাইলে দেখান।'"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 focus:border-indigo-500 transition-all outline-none text-sm resize-none"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">ছবির সাইজ সিলেক্ট করুন</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setState(prev => ({ ...prev, aspectRatio: ratio.id }))}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                          state.aspectRatio === ratio.id 
                          ? "bg-indigo-600/20 border-indigo-500 text-white" 
                          : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d={ratio.icon} />
                        </svg>
                        <span className="text-[8px] font-bold tracking-tighter">{ratio.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleProcess}
              className="mt-12 w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 group"
            >
              ডিজাইন জেনারেট করুন
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        )}

        {(state.isAnalyzing || state.isGeneratingImage) && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-t-4 border-cyan-400 rounded-full animate-spin-slow"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
              {state.isAnalyzing ? "অ্যানালাইসিস চলছে..." : `${state.aspectRatio} সাইজে ভিশন রেন্ডার হচ্ছে...`}
            </h3>
            <p className="text-slate-400 italic">"রেফারেন্স এবং চাহিদা অনুযায়ী সেরা ডিজাইন তৈরি হচ্ছে..."</p>
          </div>
        )}

        {state.analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in zoom-in duration-1000">
            {/* Sidebar with Analysis */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass p-8 rounded-[2rem] border-white/5 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white leading-tight">{state.analysis.productTitle}</h3>
                    <p className="text-indigo-400 font-bold tracking-widest uppercase text-[10px] mt-2">{state.analysis.category}</p>
                  </div>
                  <div className="bg-indigo-600/10 p-3 rounded-xl border border-indigo-500/20 text-center min-w-[110px]">
                    <p className="text-[9px] text-indigo-300 uppercase font-black tracking-tighter">টার্গেট অডিয়েন্স</p>
                    <p className="text-xs font-bold text-indigo-100">{state.analysis.targetAudience}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black text-indigo-300 mb-2 uppercase tracking-widest">মুড ও ইফেক্ট</h4>
                    <p className="text-sm leading-relaxed text-slate-300">{state.analysis.psychologicalProfile.mood}</p>
                  </div>
                  <div className="p-5 bg-slate-900/50 rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black text-emerald-300 mb-3 uppercase tracking-widest">ডিজাইন এলিমেন্টস</h4>
                    <ul className="text-xs space-y-2 text-slate-400">
                      <li>• <strong>লাইট:</strong> {state.analysis.designStrategy.lighting}</li>
                      <li>• <strong>এনভায়রনমেন্ট:</strong> {state.analysis.designStrategy.background}</li>
                      <li>• <strong>অ্যাঙ্গেল:</strong> {state.analysis.designStrategy.composition}</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-indigo-900/20 rounded-2xl border border-indigo-500/20">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Prompt Logic</h4>
                    <button onClick={() => copyToClipboard(state.analysis?.imagePrompt || '')} className="text-[10px] font-bold text-indigo-300 hover:text-white transition-colors">কপি করুন</button>
                  </div>
                  <p className="text-[11px] italic font-mono text-indigo-200/60 leading-relaxed">"{state.analysis.imagePrompt}"</p>
                </div>
              </div>
              
              <button onClick={() => setState(prev => ({ ...prev, analysis: null, generatedImage: null, productImages: [], referenceImages: [], customInstructions: "" }))} className="w-full py-4 rounded-2xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition-all font-bold">নতুন ডিজাইন শুরু করুন</button>
            </div>

            {/* Generated Image Preview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass rounded-[2rem] overflow-hidden border-white/10 relative">
                <div className="absolute top-6 left-6 z-10 flex gap-2">
                   <span className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/30 uppercase tracking-widest shadow-2xl">Custom Vision</span>
                   <span className="px-4 py-2 bg-indigo-600/60 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-indigo-500/30 uppercase tracking-widest shadow-2xl">{state.aspectRatio}</span>
                </div>
                
                {state.generatedImage ? (
                  <div className="w-full bg-slate-950 flex items-center justify-center p-4">
                    <img src={state.generatedImage} alt="AI Vision" className="max-w-full max-h-[85vh] shadow-2xl rounded-xl object-contain" />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-slate-900 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 animate-pulse font-bold tracking-widest text-xs uppercase">Rendering Visuals...</p>
                  </div>
                )}

                <div className="p-8 bg-black/60 backdrop-blur-2xl border-t border-white/5">
                   <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl font-bold text-white mb-2 tracking-tight">পেশাদার মকআপ প্রিভিউ</h4>
                        <p className="text-sm text-slate-400">এই ভিশনটি আপনার প্রোডাক্ট এবং রেফারেন্স স্টাইল অনুসরণ করে তৈরি হয়েছে।</p>
                      </div>
                      {state.generatedImage && (
                        <a href={state.generatedImage} download="mockup-vision.png" className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-3 font-bold text-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          ডাউনলোড করুন
                        </a>
                      )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
