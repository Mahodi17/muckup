
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 border-b border-white/10 glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
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
