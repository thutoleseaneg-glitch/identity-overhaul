
import React from 'react';

interface Props {
  onAccept: () => void;
}

export const ConsentModal: React.FC<Props> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-black border border-white max-w-xl w-full p-10 lg:p-16 shadow-2xl transform animate-in slide-in-from-bottom-12 duration-700">
        <div className="w-16 h-16 bg-white flex items-center justify-center text-black mb-10">
          <i className="fas fa-shield-alt text-3xl"></i>
        </div>
        
        <h2 className="text-4xl font-syne font-black text-white mb-8 uppercase tracking-tighter leading-none">
          PROTOCOL<br />
          <span className="opacity-30">AUTHORIZATION</span>
        </h2>
        
        <div className="space-y-6 text-zinc-300 mb-12 leading-relaxed font-medium">
          <p className="border-l-2 border-white pl-4 italic">
            "Your data is the fuel for your discipline. We merely provide the engine."
          </p>
          <p className="text-sm uppercase tracking-tight">
            Identity Overhaul processes physical performance, commercial intelligence, and relationship metrics. This data is stored locally and used solely to generate AI-driven strategic insights.
          </p>
          <div className="p-4 border border-white/20 bg-zinc-900/50">
             <p className="text-[10px] font-black uppercase tracking-widest text-white">PRIVACY STATUS: ENCRYPTED & LOCAL</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            className="flex-1 px-6 py-4 border border-white text-white font-black text-xs tracking-widest hover:bg-white hover:text-black transition-all uppercase"
            onClick={() => alert("ACCESS DENIED: PROTOCOL REQUIRES AUTHORIZATION.")}
          >
            DECLINE
          </button>
          <button 
            className="flex-[2] px-8 py-4 bg-white text-black font-black text-xs tracking-[0.3em] hover:bg-zinc-200 transition-all uppercase shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            onClick={onAccept}
          >
            I CONSENT
          </button>
        </div>
      </div>
    </div>
  );
};
