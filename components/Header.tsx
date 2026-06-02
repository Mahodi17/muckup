
import React from 'react';
import { Lightbulb } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 border-b border-white/10 glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              AI Product Designer
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Professional Analysis</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-indigo-400 transition-colors">হোম</a>
          <a href="#" className="text-sm font-medium hover:text-indigo-400 transition-colors">ফিচার</a>
          <a href="#" className="text-sm font-medium hover:text-indigo-400 transition-colors">প্রাইসিং</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
