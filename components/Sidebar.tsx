
import React from 'react';
import { CATEGORIES } from '../constants';
import { UserState } from '../types';

interface Props {
  user: UserState;
  insights: string[];
  isInsightLoading: boolean;
  onRefreshInsights: () => void;
}

export const Sidebar: React.FC<Props> = ({ user, insights, isInsightLoading, onRefreshInsights }) => {
  const totalNetWorth = user.contacts.reduce((acc, c) => acc + (c.estimatedNetWorth || 0), 0);
  
  // Fix: Use lastTrustScore instead of non-existent properties (integrityScore, competenceScore, etc)
  const networkHealth = user.contacts.length > 0 
    ? Math.round(user.contacts.reduce((acc, c) => acc + (c.lastTrustScore || 0), 0) / user.contacts.length)
    : 0;

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-80 h-[calc(100vh-120px)] sticky top-24">
      {/* Domains */}
      <div className="bg-black border border-white p-6">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-white pb-2">
          DOMAINS
        </h3>
        <div className="space-y-4">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white text-black flex items-center justify-center transition-transform group-hover:scale-110">
                    <i className={`fas ${cat.icon} text-xs`}></i>
                  </div>
                  <span className="font-bold uppercase text-[11px] tracking-wider">{cat.label}</span>
                </div>
              </div>
              <div className="w-full h-[1px] bg-zinc-800">
                <div className="h-full bg-white" style={{ width: cat.id === 'network' ? `${Math.min(100, (user.contacts.length / 50) * 100)}%` : '65%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Intelligence */}
      <div className="bg-black border border-white p-6">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 border-b border-white pb-2">NETWORK INTEL</h3>
        <div className="grid grid-cols-2 gap-0 border border-white">
          <div className="p-3 text-center border-r border-b border-white">
            <div className="text-lg font-bold text-white">{user.contacts.length}</div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-60">CONNECTIONS</div>
          </div>
          <div className="p-3 text-center border-b border-white">
            <div className="text-lg font-bold text-white">{networkHealth}%</div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-60">HEALTH INDEX</div>
          </div>
          <div className="p-3 text-center border-r border-white">
            <div className="text-lg font-bold text-white">{(totalNetWorth / 1000000).toFixed(1)}M</div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-60">VALUE (BWP)</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-lg font-bold text-white">{user.contacts.filter(c => c.tier === 'strategic').length}</div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-60">STRATEGIC</div>
          </div>
        </div>
      </div>

      {/* AI Intelligence */}
      <div className="bg-white text-black p-6 border border-white flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <i className="fas fa-robot text-xs"></i>
            <h3 className="text-[11px] font-black uppercase tracking-widest">INTELLIGENCE</h3>
          </div>
          <button 
            onClick={onRefreshInsights}
            disabled={isInsightLoading}
            className="w-7 h-7 flex items-center justify-center bg-black text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <i className={`fas fa-sync-alt text-[10px] ${isInsightLoading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
          {isInsightLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-4 bg-black/10 w-full"></div>)}
            </div>
          ) : insights.length > 0 ? insights.map((insight, idx) => (
            <div key={idx} className="pb-4 border-b border-black/10">
              <p className="text-[11px] leading-relaxed font-bold italic uppercase tracking-tight text-black">
                // {insight}
              </p>
            </div>
          )) : (
            <div className="text-center py-4">
              <p className="text-[10px] font-black uppercase opacity-60">NO DATA ANALYZED</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
