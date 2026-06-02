
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ArrowRight, 
  ChevronUp, 
  Trash2,
  Maximize,
  Smartphone,
  Monitor,
  Square,
  Layout
} from 'lucide-react';
import Header from './components/Header';
import { analyzeProductImage, generateProductVision, generateProductPoster } from './services/geminiService';
import { AppState, PosterTheme } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    productImages: [],
    referenceImages: [],
    aspectRatio: "1:1",
    customInstructions: "",
    posterInstructions: "",
    posterTheme: "Streetwear",
    isAnalyzing: false,
    isGeneratingImage: false,
    isGeneratingPoster: false,
    analysis: null,
    generatedImage: null,
    generatedPoster: null,
    error: null,
  });

  const [copied, setCopied] = useState(false);

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
          generatedPoster: null,
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
      generatedImage: null,
      generatedPoster: null
    }));
  };

  const handleProcess = async () => {
    if (state.productImages.length === 0) {
      setState(prev => ({ ...prev, error: "অনুগ্রহ করে অন্তত একটি প্রোডাক্টের ছবি আপলোড করুন।" }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null, analysis: null, generatedImage: null, generatedPoster: null }));
    
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

  const handleCreatePoster = async () => {
    if (!state.generatedImage || !state.analysis) return;
    
    setState(prev => ({ ...prev, isGeneratingPoster: true, error: null }));
    
    try {
      const posterResult = await generateProductPoster(
        state.generatedImage, 
        state.analysis, 
        state.posterInstructions,
        state.posterTheme,
        "9:16"
      );
      setState(prev => ({ ...prev, generatedPoster: posterResult, isGeneratingPoster: false }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isGeneratingPoster: false, 
        error: "পোস্টার তৈরি করতে সমস্যা হয়েছে।" 
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aspectRatios = [
    { id: "1:1", label: "Square", icon: Square },
    { id: "16:9", label: "Wide", icon: Monitor },
    { id: "9:16", label: "Portrait", icon: Smartphone },
    { id: "4:3", label: "Standard", icon: Layout },
    { id: "3:4", label: "Vertical", icon: Smartphone },
  ];

  const posterThemes: { id: PosterTheme; label: string; desc: string }[] = [
    { id: 'Streetwear', label: 'ফিউচারিস্টিক টেক', desc: 'গ্লাস-মর্ফিজম ও টেকনিক্যাল ডাটা কার্ডস' },
    { id: 'Editorial', label: 'এডিটরিয়াল মিনিমাল', desc: 'ক্লিন টাইপোগ্রাফি ও লাক্সারি হোয়াইট স্পেস' },
    { id: 'Magazine', label: 'ম্যাগাজিন কাভার', desc: 'বোল্ড হেডার ও প্রিমিয়াম লেআউট' },
    { id: 'Urban', label: 'আরবান রিবেল', desc: 'বোল্ড টাইপোগ্রাফি ও আরবান টেক্সচার' },
  ];

  return (
    <div className="min-h-screen pb-20 bg-[#070b14] text-slate-200">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 mt-12">
        <section className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-white leading-tight"
          >
            ব্র্যান্ড <span className="text-indigo-500">আর্কিটেক্ট</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto font-light"
          >
            আপনার প্রোডাক্টকে দিন বিশ্বের সেরা ব্র্যান্ডগুলোর মতো প্রফেশনাল এবং সাইকোলজিক্যাল লুক।
          </motion.p>
          {state.error && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 text-red-400 font-bold bg-red-400/10 py-2 px-4 rounded-xl inline-block"
            >
              {state.error}
            </motion.p>
          )}
        </section>

        <AnimatePresence mode="wait">
          {!state.analysis && !state.isAnalyzing && !state.isGeneratingImage && !state.isGeneratingPoster && (
            <motion.div 
              key="upload-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto glass rounded-[3rem] p-10 md:p-14 border-indigo-500/10 shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">১</span>
                       প্রোডাক্টের ছবি আপলোড করুন
                    </h3>
                    <div 
                      className="w-full min-h-[180px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/30 hover:bg-white/5 transition-all p-6"
                      onClick={() => productInputRef.current?.click()}
                    >
                      {state.productImages.length === 0 ? (
                        <div className="text-center opacity-40">
                          <Camera className="w-10 h-10 mx-auto mb-3" />
                          <p className="text-sm font-bold uppercase tracking-widest">Main Product Photos</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 w-full">
                          {state.productImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button onClick={(e) => { e.stopPropagation(); removeImage(idx, 'product'); }} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Trash2 className="w-6 h-6 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input type="file" ref={productInputRef} onChange={(e) => handleFileChange(e, 'product')} className="hidden" accept="image/*" multiple />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-black">২</span>
                       স্টাইল রেফারেন্স (যদি থাকে)
                    </h3>
                    <div 
                      className="w-full min-h-[180px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/30 hover:bg-white/5 transition-all p-6"
                      onClick={() => refInputRef.current?.click()}
                    >
                      {state.referenceImages.length === 0 ? (
                        <div className="text-center opacity-40">
                          <ImageIcon className="w-10 h-10 mx-auto mb-3" />
                          <p className="text-sm font-bold uppercase tracking-widest">Style References</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 w-full">
                          {state.referenceImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                              <img src={img} className="w-full h-full object-cover" />
                              <button onClick={(e) => { e.stopPropagation(); removeImage(idx, 'ref'); }} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Trash2 className="w-6 h-6 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input type="file" ref={refInputRef} onChange={(e) => handleFileChange(e, 'ref')} className="hidden" accept="image/*" multiple />
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3 mb-6">
                       <span className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-black">৩</span>
                       স্পেশাল রিকোয়ারমেন্টস ও সাইজ
                    </h3>
                    
                    <div className="mb-8">
                      <label className="text-[10px] text-slate-500 uppercase font-black mb-3 block tracking-widest">ছবির সাইজ বেছে নিন</label>
                      <div className="grid grid-cols-5 gap-2">
                        {aspectRatios.map((ratio) => (
                          <button
                            key={ratio.id}
                            onClick={() => setState(prev => ({ ...prev, aspectRatio: ratio.id }))}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                              state.aspectRatio === ratio.id 
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                              : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                            }`}
                          >
                            <ratio.icon className="w-5 h-5" />
                            <span className="text-[9px] font-black">{ratio.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea 
                      value={state.customInstructions}
                      onChange={(e) => setState(prev => ({ ...prev, customInstructions: e.target.value }))}
                      placeholder="যেমন: 'প্রোডাক্টটিকে প্রিমিয়াম স্টুডিও লাইটিং-এ দেখান' বা 'ব্যাকগ্রাউন্ডে ফিউচারিস্টিক সিটিস্কেপ দিন।'"
                      className="w-full h-40 bg-white/5 border border-white/5 rounded-3xl p-6 text-slate-200 focus:border-indigo-500/50 transition-all outline-none text-md resize-none font-medium"
                    />
                  </div>

                  <button 
                    onClick={handleProcess}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-2xl shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-4 group"
                  >
                    ডিজাইন জেনারেট করুন
                    <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {(state.isAnalyzing || state.isGeneratingImage || state.isGeneratingPoster) && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-md mx-auto text-center py-24"
            >
              <div className="relative w-32 h-32 mx-auto mb-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-b-4 border-indigo-500 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border-t-4 border-cyan-400 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 border-r-4 border-emerald-400 rounded-full"
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">
                {state.isAnalyzing ? "Deep Analysis..." : state.isGeneratingPoster ? "Elite Rendering..." : `Rendering ${state.aspectRatio} Vision...`}
              </h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Agency-Grade Production in progress</p>
            </motion.div>
          )}

          {state.analysis && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            >
              {/* Sidebar: Creative Controls */}
              <div className="lg:col-span-4 space-y-8">
                <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl">
                  <div className="mb-10">
                    <h3 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter mb-2">{state.analysis.productTitle}</h3>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-[10px] font-black inline-block uppercase tracking-widest">{state.analysis.category}</div>
                      <button 
                        onClick={() => copyToClipboard(state.analysis?.imagePrompt || "")}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-400 rounded-full text-[9px] font-black inline-flex items-center gap-1 uppercase tracking-widest transition-all"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied!" : "Copy Prompt"}
                      </button>
                    </div>
                  </div>

                  {state.generatedImage && !state.generatedPoster && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div className="p-6 bg-indigo-900/10 rounded-[2rem] border border-indigo-500/10">
                        <h4 className="text-[10px] font-black text-indigo-300 mb-4 uppercase tracking-widest">ফাইনাল পোস্টার কনফিগারেশন</h4>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="text-[9px] text-slate-500 uppercase font-black mb-3 block tracking-widest">১. পোস্টারের তথ্য দিন (দাম, ফোন, ইত্যাদি)</label>
                            <textarea 
                              value={state.posterInstructions}
                              onChange={(e) => setState(prev => ({ ...prev, posterInstructions: e.target.value }))}
                              placeholder="যেমন: Price $149, Call: 017..., Limited Drop"
                              className="w-full h-28 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-indigo-500/50 resize-none font-medium"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-slate-500 uppercase font-black mb-3 block tracking-widest">২. ডিজাইন স্টাইল</label>
                            <div className="grid grid-cols-1 gap-2">
                              {posterThemes.map(theme => (
                                <button 
                                  key={theme.id}
                                  onClick={() => setState(prev => ({ ...prev, posterTheme: theme.id }))}
                                  className={`p-4 rounded-2xl border text-left transition-all ${
                                    state.posterTheme === theme.id 
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20" 
                                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                  }`}
                                >
                                  <p className="text-xs font-black mb-1">{theme.label}</p>
                                  <p className="text-[9px] opacity-60 leading-tight">{theme.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <button 
                            onClick={handleCreatePoster}
                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-md transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-600/20 group"
                          >
                            পোস্টার জেনারেট করুন
                            <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-8 space-y-4">
                    <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5">
                      <h4 className="text-[9px] font-black text-indigo-400 mb-2 uppercase tracking-widest">সাইকোলজিক্যাল মুড</h4>
                      <p className="text-sm leading-relaxed text-slate-300 font-medium">{state.analysis.psychologicalProfile.mood}</p>
                    </div>

                    <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5">
                      <h4 className="text-[9px] font-black text-emerald-400 mb-2 uppercase tracking-widest">ডিজাইন স্ট্র্যাটেজি</h4>
                      <p className="text-xs leading-relaxed text-slate-400 italic">"{state.analysis.designStrategy.materialTextureFocus}"</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setState(prev => ({ ...prev, analysis: null, generatedImage: null, generatedPoster: null, productImages: [], referenceImages: [], customInstructions: "", posterInstructions: "" }))} 
                    className="w-full mt-10 py-5 rounded-3xl border border-white/5 text-slate-500 hover:text-white hover:bg-white/5 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Start New Campaign
                  </button>
                </div>
              </div>

              {/* Main Preview Area */}
              <div className="lg:col-span-8 space-y-8">
                <div className="glass rounded-[4rem] overflow-hidden border-white/5 relative shadow-2xl">
                  <div className="absolute top-10 left-10 z-10 flex gap-3">
                     <div className="px-6 py-3 bg-black/60 backdrop-blur-xl rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/30 uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                       <Layers className="w-3 h-3" />
                       {state.generatedPoster ? `${state.posterTheme} ASSET` : "BASE VISION"}
                     </div>
                     {state.generatedPoster && (
                       <button 
                         onClick={() => setState(prev => ({ ...prev, generatedPoster: null }))}
                         className="px-6 py-3 bg-indigo-600/60 backdrop-blur-xl rounded-full text-[10px] font-black text-white border border-indigo-500/30 uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all"
                       >
                         VIEW SOURCE IMAGE
                       </button>
                     )}
                  </div>
                  
                  <div className="w-full bg-[#05080f] flex flex-col items-center justify-center p-6 min-h-[700px]">
                    {state.generatedPoster ? (
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={state.generatedPoster} 
                        alt="Poster" 
                        className="max-w-full max-h-[90vh] shadow-2xl rounded-[3rem] object-contain" 
                      />
                    ) : state.generatedImage ? (
                      <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={state.generatedImage} 
                        alt="Vision" 
                        className="max-w-full max-h-[90vh] shadow-2xl rounded-[3rem] object-contain" 
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.3em]">Processing High-Fidelity Render...</p>
                      </div>
                    )}
                  </div>

                  <div className="p-12 bg-black/40 backdrop-blur-3xl border-t border-white/5">
                     <div className="flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase leading-none">
                            {state.generatedPoster ? "Campaign Asset Ready" : "Visual Concept Completed"}
                          </h4>
                          <p className="text-md text-slate-500 leading-relaxed max-w-xl font-medium">
                            {state.generatedPoster ? "আপনার ব্র্যান্ডের জন্য একটি কমার্শিয়াল পোস্টার তৈরি হয়েছে। এটি সরাসরি সোশ্যাল মিডিয়া বিজ্ঞাপনে ব্যবহার করা যাবে।" : "আপনার প্রোডাক্টের সাইকোলজিক্যাল ভিশন তৈরি হয়েছে। এখন বামদিকের সেটিংস থেকে আপনার প্রিয় ডিজাইনে এটি কনভার্ট করুন।"}
                          </p>
                        </div>
                        {(state.generatedImage || state.generatedPoster) && (
                          <a 
                            href={state.generatedPoster || state.generatedImage!} 
                            download="premium-brand-asset.png" 
                            className="p-6 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-[2rem] shadow-2xl transition-all flex items-center gap-4 font-black text-sm uppercase tracking-tighter"
                          >
                            <Download className="w-6 h-6" />
                            Download Asset
                          </a>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        .animate-spin-fast { animation: spin 1.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
