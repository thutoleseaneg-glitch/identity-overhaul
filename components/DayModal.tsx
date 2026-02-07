import React, { useState, useMemo, useEffect } from 'react';
import { 
  Category, DailyData, SalesEntry, Contact, 
  SalesSource, RevenueSource, NetworkEntry, RelationshipEntry, GymEntry, FinanceEntry, ProductivityEntry,
  CallRecord, CallType, IndustrySector
} from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  date: Date;
  onClose: () => void;
  onSave: (data: Partial<DailyData>) => void;
  initialData?: DailyData;
  contacts?: Contact[];
}

const DEFAULT_SOURCES: SalesSource[] = [
  { name: 'Cold Calls', count: 0, active: false },
  { name: 'Email Campaigns', count: 0, active: false },
  { name: 'Social Media', count: 0, active: false },
  { name: 'Referrals', count: 0, active: false },
  { name: 'Website/SEO', count: 0, active: false },
  { name: 'Events', count: 0, active: false },
];

const DEFAULT_REVENUE: RevenueSource[] = [
  { name: 'Product A', amount: 0 },
  { name: 'Product B', amount: 0 },
  { name: 'Services', amount: 0 },
];

const OUTCOMES = [
  { id: 'voicemail', label: '📱 Voicemail' },
  { id: 'not-interested', label: '❌ Not Interested' },
  { id: 'callback', label: '📞 Call Back' },
  { id: 'qualified', label: '✅ Qualified' },
  { id: 'meeting', label: '📅 Meeting Set' },
];

const OBJECTIONS = [
  { id: 'price', label: 'Too Expensive' },
  { id: 'timing', label: 'Bad Timing' },
  { id: 'decision', label: 'Not Decision Maker' },
  { id: 'competitor', label: 'Happy with Competitor' },
  { id: 'budget', label: 'No Budget' },
];

const INDUSTRIES: IndustrySector[] = ['Mining', 'Tourism', 'Finance', 'Agriculture', 'Tech', 'Government', 'Manufacturing', 'Other'];

export const DayModal: React.FC<Props & { contacts: Contact[] }> = ({ date, onClose, onSave, initialData, contacts }) => {
  const [activeTab, setActiveTab] = useState<Category>('sales');
  const [formData, setFormData] = useState<DailyData>(initialData || { categories: [] });
  
  // Call Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Call Log Form State
  const [callFormData, setCallFormData] = useState<Partial<CallRecord>>({
    contact: '',
    company: '',
    type: 'cold',
    outcome: '',
    objections: [],
    notes: '',
  });

  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [newContact, setNewContact] = useState<Partial<Contact>>({ 
    fullName: '', 
    tier: 'regular', 
    industry: 'Tech', 
    company: '', 
    title: '', 
    estimatedNetWorth: 0,
    wealthConfidence: 50,
    tags: []
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const isFuture = date > now;
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && !isTimerPaused) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerPaused]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const updateSection = (category: Category, data: any) => {
    setFormData(prev => {
      const next = { ...prev };
      if (category === 'notes') {
        next.notes = data;
      } else {
        (next as any)[category] = { ...((next as any)[category] || {}), ...data };
      }
      if (!next.categories.includes(category)) next.categories.push(category);
      return next;
    });
  };

  // Sales Module Components
  const renderSales = () => {
    const s = (formData.sales || { 
      leads: 0, 
      sources: [...DEFAULT_SOURCES], 
      leadQuality: 5, 
      coldCalls: 0, 
      meetings: 0, 
      dealsClosed: 0, 
      revenue: 0, 
      revenueBreakdown: [...DEFAULT_REVENUE],
      dealStage: 'Prospecting', 
      callLog: [],
      notes: '' 
    }) as SalesEntry;

    const avgDealSize = s.dealsClosed > 0 ? Math.round(s.revenue / s.dealsClosed) : 0;
    const todayCalls = s.callLog || [];
    const totalTalkTime = todayCalls.reduce((acc, c) => acc + c.durationSeconds, 0);
    const avgDuration = todayCalls.length > 0 ? Math.round(totalTalkTime / todayCalls.length) : 0;
    const connectionRate = todayCalls.length > 0 
      ? Math.round((todayCalls.filter(c => c.outcome !== 'voicemail').length / todayCalls.length) * 100) 
      : 0;

    const outcomesCount = useMemo(() => {
      const counts: Record<string, number> = {};
      todayCalls.forEach(c => {
        counts[c.outcome] = (counts[c.outcome] || 0) + 1;
      });
      return counts;
    }, [todayCalls]);

    const objectionsCount = useMemo(() => {
      const counts: Record<string, number> = {};
      todayCalls.forEach(c => {
        c.objections?.forEach(obj => {
          counts[obj] = (counts[obj] || 0) + 1;
        });
      });
      return counts;
    }, [todayCalls]);

    const handleSaveCall = () => {
      if (!callFormData.contact) return;
      
      const duration = timerSeconds > 0 ? formatTimer(timerSeconds).split(':').slice(1).join(':') : '00:00';
      const durationSeconds = timerSeconds;

      const newCall: CallRecord = {
        id: `call_${Date.now()}`,
        timestamp: new Date().toISOString(),
        contact: callFormData.contact || 'Unknown',
        company: callFormData.company || '',
        type: callFormData.type as CallType,
        duration,
        durationSeconds,
        outcome: callFormData.outcome || 'voicemail',
        objections: callFormData.objections || [],
        notes: callFormData.notes || '',
        success: callFormData.outcome === 'qualified' || callFormData.outcome === 'meeting',
      };

      const updatedLog = [...(s.callLog || []), newCall];
      updateSection('sales', { 
        callLog: updatedLog,
        coldCalls: updatedLog.length,
        leads: updatedLog.filter(c => c.success).length
      });

      setCallFormData({ contact: '', company: '', type: 'cold', outcome: '', objections: [], notes: '' });
      setTimerSeconds(0);
      setIsTimerRunning(false);
      setIsTimerPaused(false);
    };

    return (
      <div className="space-y-16 animate-in slide-in-from-right-4 duration-300">
        <div id="sales_leadSourcesSection" className="p-8 border border-white bg-black">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 border-b border-white pb-3 flex items-center gap-2">
            <i className="fas fa-bullseye text-xs"></i> LEAD SOURCES
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {(s.sources || DEFAULT_SOURCES).map((source, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 group">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={source.active} 
                    onChange={e => {
                      const newSources = [...s.sources];
                      newSources[idx].active = e.target.checked;
                      updateSection('sales', { sources: newSources });
                    }}
                    className="w-4 h-4 bg-black border border-white accent-white"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                    {source.name}
                  </span>
                </label>
                <input 
                  type="number" 
                  value={source.count || ''} 
                  placeholder="0"
                  onChange={e => {
                    const newSources = [...s.sources];
                    newSources[idx].count = Number(e.target.value);
                    updateSection('sales', { sources: newSources });
                  }}
                  className="w-12 bg-transparent border-none text-right text-xs font-black outline-none focus:text-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div id="sales_callActivitiesSection" className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 border border-white bg-black flex flex-col justify-center items-center">
              <h4 className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em] mb-4">ACTIVE CALL TIMER</h4>
              <div className={`text-6xl font-syne font-black mb-8 tabular-nums ${isTimerRunning ? 'animate-pulse' : ''}`} id="sales_timerDisplay">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex gap-4">
                {!isTimerRunning ? (
                  <button 
                    onClick={() => { setIsTimerRunning(true); setIsTimerPaused(false); }}
                    className="px-8 py-3 bg-white text-black font-black text-[10px] tracking-widest uppercase hover:bg-zinc-200 transition-all"
                  >
                    ▶ START CALL
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsTimerPaused(!isTimerPaused)}
                      className="px-6 py-3 border border-white text-white font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                    >
                      {isTimerPaused ? '▶ RESUME' : '⏸ PAUSE'}
                    </button>
                    <button 
                      onClick={() => { setIsTimerRunning(false); setIsTimerPaused(false); }}
                      className="px-6 py-3 border border-white text-white font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all"
                    >
                      ⏹ END CALL
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 border border-white bg-black flex flex-col items-center justify-center">
                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1">TODAY'S CALLS</span>
                <span className="text-3xl font-black">{todayCalls.length}</span>
              </div>
              <div className="p-6 border border-white bg-black flex flex-col items-center justify-center">
                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1">TOTAL TALK TIME</span>
                <span className="text-3xl font-black">{Math.floor(totalTalkTime / 60)}m</span>
              </div>
            </div>
          </div>

          <div className="p-8 border border-white bg-black">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 border-b border-white pb-3">LOG A CALL</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormInput label="CONTACT NAME" value={callFormData.contact} onChange={(v: string) => setCallFormData({ ...callFormData, contact: v })} placeholder="JOHN DOE" />
                <FormInput label="COMPANY" value={callFormData.company} onChange={(v: string) => setCallFormData({ ...callFormData, company: v })} placeholder="ABC CORP" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-70 uppercase tracking-widest ml-1">CALL TYPE</label>
                  <select 
                    value={callFormData.type} 
                    onChange={e => setCallFormData({ ...callFormData, type: e.target.value as any })}
                    className="w-full bg-black border border-white p-4 text-xs font-black uppercase outline-none focus:bg-white focus:text-black transition-all"
                  >
                    <option value="cold">COLD CALL</option>
                    <option value="warm">WARM CALL</option>
                    <option value="followup">FOLLOW-UP</option>
                    <option value="client">CLIENT CHECK-IN</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-70 uppercase tracking-widest ml-1">OUTCOME</label>
                  <div className="grid grid-cols-2 gap-2">
                    {OUTCOMES.map(out => (
                      <button 
                        key={out.id}
                        onClick={() => setCallFormData({ ...callFormData, outcome: out.id })}
                        className={`py-3 text-[10px] font-black uppercase tracking-widest transition-all border ${
                          callFormData.outcome === out.id ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:border-white'
                        }`}
                      >
                        {out.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <FormTextArea label="NOTES" value={callFormData.notes} onChange={(v: string) => setCallFormData({ ...callFormData, notes: v })} placeholder="KEY POINTS DISCUSSED, NEXT STEPS..." />
                <div className="flex gap-4">
                  <button onClick={handleSaveCall} className="flex-1 py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-200 transition-all border border-white">💾 SAVE CALL</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNetwork = () => {
    const n = (formData.network || { newContacts: [], reconnections: 0, introductionsGiven: 0, introductionsReceived: 0, notes: '' }) as NetworkEntry;
    
    return (
      <div className="space-y-12 animate-in slide-in-from-right-4 duration-300">
        
        {/* GROWTH PROTOCOL: CONTACT ACQUISITION */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <div className="p-8 border border-white bg-black space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] border-b border-white pb-3 flex items-center gap-2">
              <i className="fas fa-user-plus text-xs"></i> GROWTH PROTOCOL: ACQUISITION
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="FULL NAME" value={newContact.fullName} onChange={(v: string) => setNewContact({...newContact, fullName: v})} placeholder="NAME" />
              <FormInput label="TITLE / POSITION" value={newContact.title} onChange={(v: string) => setNewContact({...newContact, title: v})} placeholder="CEO, FOUNDER..." />
              <FormInput label="COMPANY / ORG" value={newContact.company} onChange={(v: string) => setNewContact({...newContact, company: v})} placeholder="COMPANY NAME" />
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-70 uppercase tracking-widest ml-1">INDUSTRY</label>
                <select value={newContact.industry} onChange={e => setNewContact({...newContact, industry: e.target.value as any})} className="w-full bg-black border border-white p-4 text-xs font-black uppercase outline-none focus:bg-white focus:text-black transition-all">
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-70 uppercase tracking-widest ml-1">TIER</label>
                <select value={newContact.tier} onChange={e => setNewContact({...newContact, tier: e.target.value as any})} className="w-full bg-black border border-white p-4 text-xs font-black uppercase outline-none focus:bg-white focus:text-black transition-all">
                  <option value="strategic">STRATEGIC</option>
                  <option value="key">KEY</option>
                  <option value="regular">REGULAR</option>
                  <option value="casual">CASUAL</option>
                </select>
              </div>
              <FormInput label="EST. NET WORTH (BWP)" type="number" value={newContact.estimatedNetWorth} onChange={(v: string) => setNewContact({...newContact, estimatedNetWorth: Number(v)})} />
            </div>
            <button 
              onClick={() => {
                if(!newContact.fullName) return;
                const contact: Contact = { 
                  ...newContact, 
                  id: `contact_${Date.now()}`, 
                  lastTrustScore: 50, 
                  interactionCount: 1,
                  tags: newContact.tags || [],
                  notes: ''
                } as Contact;
                updateSection('network', { newContacts: [...(n.newContacts || []), contact] });
                setNewContact({ fullName: '', tier: 'regular', industry: 'Tech', company: '', title: '', estimatedNetWorth: 0 });
              }} 
              className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-200 transition-all border border-white"
            >
              ACQUIRE TARGET
            </button>
          </div>

          <div className="p-8 border border-white bg-black space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] border-b border-white pb-3">BATCH ACQUISITIONS</h4>
            <div className="overflow-y-auto max-h-[350px] space-y-4 pr-2 custom-scrollbar">
              {n.newContacts?.length === 0 ? (
                <div className="h-40 border border-white/10 border-dashed flex items-center justify-center opacity-40 uppercase text-[10px] font-black">NO ACQUISITIONS RECORDED TODAY</div>
              ) : n.newContacts.map((contact, idx) => (
                <div key={idx} className="p-4 border border-white bg-zinc-900 group hover:bg-white hover:text-black transition-all flex justify-between items-center">
                  <div>
                    <div className="font-syne font-black text-sm">{contact.fullName}</div>
                    <div className="text-[8px] opacity-40 uppercase tracking-widest">{contact.tier} | {contact.industry}</div>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = n.newContacts.filter((_, i) => i !== idx);
                      updateSection('network', { newContacts: updated });
                    }}
                    className="opacity-0 group-hover:opacity-100 text-black hover:scale-110 transition-all"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ENGAGEMENT PROTOCOL: INTROS & RECONNECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-8 border border-white bg-black space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] border-b border-white pb-3 flex items-center gap-2">
              <i className="fas fa-hand-holding-heart text-xs"></i> INTRO PROTOCOL
            </h4>
            <div className="grid grid-cols-2 gap-8">
               <FormInput label="INTROS GIVEN" type="number" value={n.introductionsGiven} onChange={(v: string) => updateSection('network', { introductionsGiven: Number(v) })} />
               <FormInput label="INTROS RECEIVED" type="number" value={n.introductionsReceived} onChange={(v: string) => updateSection('network', { introductionsReceived: Number(v) })} />
            </div>
            <FormInput label="RECONNECTIONS" type="number" value={n.reconnections} onChange={(v: string) => updateSection('network', { reconnections: Number(v) })} />
          </div>

          <div className="p-8 border border-white bg-black space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] border-b border-white pb-3 flex items-center gap-2">
              <i className="fas fa-expand-arrows-alt text-xs"></i> EXPANSION JOURNAL
            </h4>
            <textarea 
              value={n.notes} 
              onChange={e => updateSection('network', { notes: e.target.value })}
              placeholder="STRATEGIC NOTES ON NETWORK EXPANSION..."
              className="w-full px-6 py-6 bg-black border border-white text-white outline-none focus:bg-white focus:text-black transition-all font-bold leading-relaxed uppercase text-[11px] resize-none h-40 scrollbar-hide"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderRelationships = () => {
    const activeRel = formData.relationships || [];
    return (
      <div className="space-y-12 animate-in slide-in-from-right-4 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-white pb-3">TRUST LOG</h4>
            <select value={selectedContactId} onChange={e => setSelectedContactId(e.target.value)} className="w-full bg-black border border-white p-4 text-xs font-black uppercase outline-none focus:bg-white focus:text-black transition-all">
              <option value="">-- SELECT TARGET --</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.fullName.toUpperCase()}</option>)}
            </select>
            {selectedContactId && (
              <button 
                onClick={() => {
                  const log: RelationshipEntry = {
                      contactId: selectedContactId,
                      trustMatrix: { integrity: 15, competence: 15, communication: 10, alignment: 10, reciprocity: 10 },
                      temperature: 50, mood: 'Neutral', weather: 'Clear', strategicNotes: '',
                      valueExchange: { timeInvested: 60, resourcesSpent: 0, valueReceived: 'Medium', notes: '' },
                      conflictLogged: false
                  };
                  updateSection('relationships', [...activeRel, log]);
                  setSelectedContactId('');
                }}
                className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all border border-white"
              >
                INITIATE RELATIONSHIP LOG
              </button>
            )}
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-white pb-3">DAILY EVENTS</h4>
            {activeRel.length === 0 ? (
               <div className="h-40 border border-white border-dashed flex items-center justify-center opacity-40 uppercase text-[10px] font-black">NO EVENTS RECORDED</div>
            ) : activeRel.map((r, i) => (
                <div key={i} className="p-4 border border-white bg-zinc-900 flex justify-between items-center group hover:bg-white hover:text-black transition-all">
                    <span className="text-[11px] font-black uppercase">{contacts.find(c => c.id === r.contactId)?.fullName || 'UNKNOWN'}</span>
                    <span className="text-[10px] font-black border border-current px-2 py-0.5">{r.weather}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFinance = () => {
    const f = (formData.finance || { revenue: 0, operatingExpenses: 0, mrr: 0, churn: 0, taxReserve: 0, cashPosition: 0, notes: '' }) as FinanceEntry;
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-white pb-3">P&L SUMMARY (BWP)</h4>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="DAILY REVENUE" type="number" value={f.revenue} onChange={(v: string) => updateSection('finance', { revenue: Number(v) })} />
                    <FormInput label="OP. EXPENSES" type="number" value={f.operatingExpenses} onChange={(v: string) => updateSection('finance', { operatingExpenses: Number(v) })} />
                </div>
                <div className="p-10 border border-white bg-zinc-900/50 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">DAILY NET PROFIT</p>
                    <p className="text-4xl font-syne font-black">P {(f.revenue - f.operatingExpenses).toLocaleString()}</p>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderGym = () => {
    const g = (formData.gym || { type: '', sets: 0, reps: 0, weight: 0, completed: false, notes: '' }) as GymEntry;
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <FormInput label="WORKOUT CATEGORY" type="text" value={g.type} onChange={(v: string) => updateSection('gym', { type: v })} placeholder="LEGS, PUSH, PULL, CARDIO..." />
        <div className="grid grid-cols-3 gap-4">
          <FormInput label="SETS" type="number" value={g.sets} onChange={(v: string) => updateSection('gym', { sets: Number(v) })} />
          <FormInput label="REPS" type="number" value={g.reps} onChange={(v: string) => updateSection('gym', { reps: Number(v) })} />
          <FormInput label="KG" type="number" value={g.weight} onChange={(v: string) => updateSection('gym', { weight: Number(v) })} />
        </div>
      </div>
    );
  };

  const renderNotepad = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <textarea 
        value={formData.notes || ''} 
        onChange={e => updateSection('notes', e.target.value)}
        placeholder="STRATEGY NOTES..."
        rows={18}
        className="w-full px-8 py-8 bg-black border border-white text-white outline-none focus:bg-white focus:text-black transition-all font-bold leading-relaxed uppercase text-sm resize-none scrollbar-hide placeholder:text-zinc-800"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-4">
      <div className="bg-black border border-white w-full max-w-6xl h-[94vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all">
        <div className="p-8 bg-white text-black flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl lg:text-4xl font-syne font-black uppercase tracking-tighter leading-none">
                {isFuture ? 'FUTURE PLAN' : 'OVERHAUL PROTOCOL'}
              </h2>
            </div>
            <p className="font-black text-[11px] opacity-70 tracking-[0.4em]">{formatDate(date)}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-black text-white hover:bg-zinc-900 transition-all flex items-center justify-center shrink-0">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex overflow-x-auto bg-black border-b border-white shrink-0 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-3 px-8 py-5 font-black text-[11px] whitespace-nowrap border-r border-white transition-all uppercase tracking-[0.2em] ${
                activeTab === cat.id 
                ? 'bg-white text-black' 
                : 'text-white hover:bg-zinc-900'
              }`}
            >
              <i className={`fas ${cat.icon}`}></i>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-black custom-scrollbar">
          {activeTab === 'sales' && renderSales()}
          {activeTab === 'network' && renderNetwork()}
          {activeTab === 'relationships' && renderRelationships()}
          {activeTab === 'finance' && renderFinance()}
          {activeTab === 'gym' && renderGym()}
          {activeTab === 'notes' && renderNotepad()}
        </div>

        <div className="p-8 border-t border-white flex flex-col sm:flex-row gap-0 shrink-0">
          <button onClick={onClose} className="flex-1 py-5 border-r border-white font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-900 transition-all text-white">
            ABORT
          </button>
          <button onClick={handleSave} className="flex-[2] py-5 bg-white text-black font-black uppercase text-xs tracking-[0.5em] hover:bg-zinc-200 transition-all">
            COMMIT CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};

// UI Sub-components
const FormInput = ({ label, type = "text", value, onChange, className = "", id, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] ml-1 opacity-70">{label}</label>
    <input 
      id={id}
      type={type} 
      value={value === 0 ? '' : value || ''} 
      onChange={e => onChange(e.target.value)}
      className={`w-full px-6 py-4 rounded-none bg-black border border-white focus:bg-white focus:text-black outline-none transition-all uppercase text-sm font-bold placeholder:text-zinc-700 ${className}`}
      {...props}
    />
  </div>
);

const FormTextArea = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] ml-1 opacity-70">{label}</label>
    <textarea 
      value={value || ''} 
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full px-6 py-5 bg-black border border-white focus:bg-white focus:text-black outline-none transition-all uppercase text-sm font-bold resize-none placeholder:text-zinc-700"
    />
  </div>
);