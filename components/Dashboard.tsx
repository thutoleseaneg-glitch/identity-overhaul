import React, { useState, useMemo } from 'react';
import { UserState, DailyData, Contact, NetworkTier, IndustrySector } from '../types';
import { Sidebar } from './Sidebar';
import { Calendar } from './Calendar';
import { DayModal } from './DayModal';

interface Props {
  user: UserState;
  insights: string[];
  isInsightLoading: boolean;
  viewDate: Date;
  setViewDate: (d: Date) => void;
  onDaySave: (data: Partial<DailyData>, date: Date) => void;
  onLogout: () => void;
  onRefreshInsights: () => void;
  onThemeToggle: () => void;
  onExport: (format: 'csv' | 'json') => void;
}

export const Dashboard: React.FC<Props> = ({ 
  user, insights, isInsightLoading, viewDate, setViewDate, onDaySave, onLogout, onRefreshInsights, onThemeToggle, onExport 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [networkSearch, setNetworkSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<NetworkTier | 'all'>('all');

  // Stats calculation
  const stats = useMemo(() => {
    const entries: DailyData[] = Object.values(user.entries);
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalLeads = 0;
    let totalDeals = 0;
    let totalFocusHrs = 0;
    let networkSize = user.contacts.length;
    let totalTrustValue = 0;
    let relEventCount = 0;

    entries.forEach(e => {
      if (e.sales) {
        totalRevenue += e.sales.revenue || 0;
        totalLeads += e.sales.leads || 0;
        totalDeals += e.sales.dealsClosed || 0;
      }
      if (e.finance) {
        totalExpenses += e.finance.operatingExpenses || 0;
      }
      if (e.productivity) {
        totalFocusHrs += e.productivity.focusHours || 0;
      }
      if (e.relationships) {
        e.relationships.forEach(r => {
          totalTrustValue += r.trustMatrix.integrity + r.trustMatrix.competence + r.trustMatrix.communication + r.trustMatrix.alignment + r.trustMatrix.reciprocity;
          relEventCount++;
        });
      }
    });

    return {
      revenue: totalRevenue.toLocaleString(),
      profit: (totalRevenue - totalExpenses).toLocaleString(),
      leads: totalLeads,
      conversion: totalLeads > 0 ? Math.round((totalDeals / totalLeads) * 100) : 0,
      avgTrust: relEventCount > 0 ? Math.round(totalTrustValue / relEventCount) : 0,
      networkSize,
      focus: totalFocusHrs
    };
  }, [user.entries, user.contacts]);

  const filteredContacts = useMemo(() => {
    return user.contacts.filter(c => {
      const matchesSearch = c.fullName.toLowerCase().includes(networkSearch.toLowerCase()) || 
                           c.company.toLowerCase().includes(networkSearch.toLowerCase()) ||
                           c.industry.toLowerCase().includes(networkSearch.toLowerCase());
      const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
      return matchesSearch && matchesTier;
    }).sort((a, b) => (b.lastTrustScore || 0) - (a.lastTrustScore || 0));
  }, [user.contacts, networkSearch, tierFilter]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pb-24 lg:pb-12">
      <header className="sticky top-0 z-50 bg-black border-b border-white py-4 px-6">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center text-black">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <h1 className="text-xl sm:text-2xl font-syne font-black tracking-tighter uppercase">
              IDENTITY<span className="opacity-40">OVERHAUL</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-white text-black font-black border border-white hover:bg-zinc-200 transition-all text-xs tracking-widest uppercase"
            >
              <i className="fas fa-plus"></i>
              NEW LOG
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-10 h-10 bg-black border border-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <i className="fas fa-file-export"></i>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-black border border-white py-2 z-[60] shadow-2xl">
                   <button onClick={() => { onExport('json'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-white hover:text-black flex items-center gap-3 transition-colors font-black uppercase text-[10px] tracking-widest">JSON EXPORT</button>
                   <button onClick={() => { onExport('csv'); setShowExportMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-white hover:text-black flex items-center gap-3 transition-colors font-black uppercase text-[10px] tracking-widest">CSV EXPORT</button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 ml-4 border-l border-white pl-6">
              <div className="hidden xs:flex flex-col items-end">
                <span className="text-xs font-black uppercase tracking-widest">{user.profile?.name || 'OPERATOR'}</span>
                <button onClick={onLogout} className="text-[9px] font-black text-zinc-400 uppercase hover:text-white transition-colors">DISCONNECT</button>
              </div>
              <div className="w-10 h-10 bg-white border border-white flex items-center justify-center">
                <span className="text-black font-black text-sm">{user.profile?.name?.[0] || 'O'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12">
        <Sidebar user={user} insights={insights} isInsightLoading={isInsightLoading} onRefreshInsights={onRefreshInsights} />
        
        <div className="flex-1 space-y-12">
          <div className="border border-white bg-black">
            <Calendar 
              viewDate={viewDate} 
              setViewDate={setViewDate} 
              entries={user.entries}
              onDayClick={setSelectedDate}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-white">
            <StatCard icon="fa-bullhorn" title="SALES LEADS" value={stats.leads} sub="UNITS" border="border-r border-b lg:border-b-0" />
            <StatCard icon="fa-money-bill-wave" title="NET PROFIT" value={stats.profit} sub="BWP" border="border-r border-b lg:border-b-0" />
            <StatCard icon="fa-users" title="NETWORK SIZE" value={stats.networkSize} sub="PEOPLE" border="border-r border-b sm:border-b-0" />
            <StatCard icon="fa-tasks" title="FOCUS HRS" value={stats.focus} sub="HOURS" />
          </div>

          {/* NEW: PEOPLE NETWORK MODULE SECTION */}
          <section id="network_module" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white pb-4 gap-4">
              <div>
                <h3 className="text-2xl font-syne font-black uppercase tracking-tighter">NETWORK ASSET DIRECTORY</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic mt-1">Growth & Trust Intelligence Visualization</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="SEARCH NAME / COMPANY / INDUSTRY..." 
                  value={networkSearch}
                  onChange={e => setNetworkSearch(e.target.value)}
                  className="bg-black border border-white px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:text-black transition-all flex-1 sm:w-64"
                />
                <select 
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value as any)}
                  className="bg-black border border-white px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:text-black transition-all"
                >
                  <option value="all">ALL TIERS</option>
                  <option value="strategic">STRATEGIC</option>
                  <option value="key">KEY</option>
                  <option value="regular">REGULAR</option>
                  <option value="casual">CASUAL</option>
                </select>
              </div>
            </div>

            <div className="border border-white overflow-hidden bg-black">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] font-black uppercase tracking-widest">
                  <thead>
                    <tr className="bg-white text-black">
                      <th className="py-4 px-6 border-r border-black">CONTACT ASSET</th>
                      <th className="py-4 px-6 border-r border-black">DOMAIN / INDUSTRY</th>
                      <th className="py-4 px-6 border-r border-black">EST. VALUE (BWP)</th>
                      <th className="py-4 px-6">TRUST INDEX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center opacity-30 italic">NO NETWORK DATA MATCHES THE CURRENT CRITERIA</td>
                      </tr>
                    ) : filteredContacts.map(contact => (
                      <tr key={contact.id} className="hover:bg-zinc-900 transition-colors group">
                        <td className="py-6 px-6 border-r border-white/10">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center text-[10px] border ${
                              contact.tier === 'strategic' ? 'bg-white text-black border-white' : 'border-white/40 text-white'
                            }`}>
                              {contact.tier[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-syne text-sm group-hover:pl-1 transition-all">{contact.fullName}</div>
                              <div className="text-[8px] opacity-40">{contact.title} @ {contact.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6 border-r border-white/10">
                          <span className="px-2 py-1 bg-zinc-800 text-white border border-white/20">{contact.industry}</span>
                        </td>
                        <td className="py-6 px-6 border-r border-white/10">
                          <div className="font-syne">P {contact.estimatedNetWorth?.toLocaleString() || '0'}</div>
                          <div className="text-[8px] opacity-40">CONFIDENCE: {contact.wealthConfidence}%</div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-1 bg-zinc-800 overflow-hidden">
                              <div 
                                className="h-full bg-white transition-all duration-1000" 
                                style={{ width: `${contact.lastTrustScore}%` }}
                              ></div>
                            </div>
                            <span className="w-8 text-right">{contact.lastTrustScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden xl:flex flex-col gap-8 w-80">
          <div className="border border-white p-8 bg-black">
            <h3 className="text-[10px] font-black text-white mb-8 uppercase tracking-[0.4em] border-b border-white pb-3">PROTOCOL BOARD</h3>
            <div className="space-y-6">
              <FocusItem checked={true} text="Daily Reflection" />
              <FocusItem checked={false} text="Trust Assessment" />
              <FocusItem checked={false} text="Revenue Audit" />
              <FocusItem checked={false} text="Deep Work Block" />
            </div>
          </div>
          
          <div className="bg-white p-8 text-black">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic">SYSTEM ADVISORY</h4>
             <p className="text-xs font-bold leading-relaxed uppercase tracking-tighter">Your network expansion is currently outperforming your sales conversion. Suggest re-prioritizing Proposal stages.</p>
          </div>
        </aside>
      </main>

      <div className="lg:hidden fixed bottom-8 right-8 z-[100]">
        <button 
          onClick={() => setSelectedDate(new Date())}
          className="w-16 h-16 bg-white text-black rounded-none border border-black shadow-2xl flex items-center justify-center text-3xl hover:bg-zinc-200 transition-all active:scale-90"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {selectedDate && (
        <DayModal 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)}
          onSave={(data) => onDaySave(data, selectedDate)}
          initialData={user.entries[selectedDate.toISOString().split('T')[0]]}
          contacts={user.contacts}
        />
      )}
    </div>
  );
};

const FocusItem = ({ checked, text }: { checked: boolean, text: string }) => (
  <div className={`flex items-center gap-4 p-4 border border-white transition-all ${checked ? 'opacity-30' : 'opacity-100 hover:bg-white hover:text-black cursor-pointer'}`}>
    <div className={`w-5 h-5 border border-white flex items-center justify-center ${checked ? 'bg-white text-black' : 'bg-black'}`}>
      {checked && <i className="fas fa-check text-[10px]"></i>}
    </div>
    <span className={`text-[11px] font-black uppercase tracking-widest ${checked ? 'line-through' : ''}`}>{text}</span>
  </div>
);

const StatCard = ({ icon, title, value, sub, border = "" }: any) => (
  <div className={`bg-black p-8 hover:bg-white hover:text-black transition-all border-white ${border}`}>
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 border border-current flex items-center justify-center">
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest border border-current px-2 py-0.5">{sub}</span>
    </div>
    <h3 className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2">{title}</h3>
    <p className="text-3xl font-syne font-black tracking-tighter">{value}</p>
  </div>
);