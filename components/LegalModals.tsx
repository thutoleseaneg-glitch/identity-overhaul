
import React, { useState, useMemo } from 'react';

export type PolicyType = 'terms' | 'privacy' | 'system' | 'data-protection' | 'cookies';

interface Props {
  type: PolicyType;
  onClose: () => void;
  onAccept?: (type: PolicyType) => void;
}

export const LegalModals: React.FC<Props> = ({ type, onClose, onAccept }) => {
  const [lang, setLang] = useState<'EN' | 'TN'>('EN');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['intro', 'rights', 'specs']);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const lastUpdated = "OCTOBER 24, 2025";

  const renderSection = (id: string, title: string, titleTN: string, content: React.ReactNode) => {
    const isExpanded = expandedSections.includes(id);
    const displayTitle = lang === 'EN' ? title : titleTN;
    
    // Simple search filter
    if (searchQuery && !displayTitle.toLowerCase().includes(searchQuery.toLowerCase())) return null;

    return (
      <div key={id} className="border-b border-white/10 last:border-0 py-6">
        <button 
          onClick={() => toggleSection(id)}
          className="w-full flex justify-between items-center group"
        >
          <h3 className="text-xl font-black uppercase tracking-tight text-left group-hover:pl-2 transition-all">
            {displayTitle}
          </h3>
          <i className={`fas ${isExpanded ? 'fa-minus' : 'fa-plus'} text-xs opacity-30`}></i>
        </button>
        {isExpanded && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderTerms = () => (
    <div className="space-y-2">
      {renderSection('intro', '1. Acceptance of Terms', '1. Kamogelo ya Melawana', (
        <p>This is a binding legal agreement between the Operator ("User") and Identity Overhaul (Pty) Ltd, Gaborone, Botswana. By accessing the Protocol, you acknowledge that you are at least 18 years of age or have attained the age of majority in Botswana.</p>
      ))}
      {renderSection('service', '2. Service Description', '2. Tlhaloso ya Ditirelo', (
        <p>Identity Overhaul provides a high-fidelity data logging environment for professional monitoring of commercial, physical, and relational metrics. We reserve the right to modify or discontinue features of the Protocol at any time without prior notice.</p>
      ))}
      {renderSection('accounts', '3. User Accounts', '3. Di-account tsa Badirisi', (
        <p>Accounts require valid identity verification. Users are solely responsible for the security of their Secret Keys. Prohibited activities include reverse engineering the monochrome engine or unauthorized data scraping.</p>
      ))}
      {renderSection('payments', '4. Subscriptions and Payments', '4. Tuelo le Ditirelo tsa Moralo', (
        <p>Premium features are billed in Botswana Pula (BWP). We support local payment methods including <strong>Orange Money</strong>, BTC Smega, and Mascom MyZaka, alongside standard international credit/debit facilities via DPO Group.</p>
      ))}
      {renderSection('liability', '5. Limitation of Liability', '5. Tekanyetso ya Maikarabelo', (
        <p>The Protocol is provided "AS IS". Identity Overhaul does not guarantee specific commercial or physical outcomes. Our liability is capped at the total amount paid by the user in the 3 months preceding any claim.</p>
      ))}
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-2">
      <div className="p-4 border border-white/20 bg-zinc-900/50 mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest">BOTSWANA DPA COMPLIANT LOGS (ACT NO. 4 OF 2018)</p>
      </div>
      {renderSection('collection', '1. Information We Collect', '1. Tshedimosetso e re e Kokoanyang', (
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Personal:</strong> Name, Email, Profile Metadata.</li>
          <li><strong>Usage:</strong> App interaction telemetry, device fingerprinting.</li>
          <li><strong>Content:</strong> Calendar logs, BWP revenue metrics, Fitness biometrics.</li>
        </ul>
      ))}
      {renderSection('usage', '2. How We Use Information', '2. Tiriso ya Tshedimosetso', (
        <p>Primary use is the generation of Strategic Insights via the Gemini Protocol. We do not sell PII (Personally Identifiable Information) to third-party data brokers in Botswana or abroad.</p>
      ))}
      {renderSection('rights', '3. User Rights (DPA)', '3. Ditshwanelo tsa Badirisi', (
        <p>Under the Botswana Data Protection Act, you have the right to access, rectify, or delete your data records. Response time for data access requests is strictly 14 business days.</p>
      ))}
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 border border-white bg-zinc-900">
          <h4 className="font-black mb-4 uppercase text-xs tracking-widest border-b border-white pb-2">MINIMUM SPECS</h4>
          <ul className="text-[11px] space-y-2 uppercase">
            <li>Chrome 80+ / Safari 13+</li>
            <li>Windows 10 / iOS 13+</li>
            <li>512 Kbps Connection</li>
            <li>50MB Local Storage</li>
          </ul>
        </div>
        <div className="p-6 border border-white bg-white text-black">
          <h4 className="font-black mb-4 uppercase text-xs tracking-widest border-b border-black pb-2">RECOMMENDED</h4>
          <ul className="text-[11px] space-y-2 uppercase">
            <li>Latest Edge / Chrome</li>
            <li>Fibre/4G Connectivity</li>
            <li>1920x1080 Resolution</li>
            <li>500MB Available Space</li>
          </ul>
        </div>
      </div>
      {renderSection('specs', 'Network Compatibility', 'Kamogelo ya Maranyane', (
        <p>Identity Overhaul is optimized for <strong>Orange, BTC, and Mascom</strong> mobile networks. The protocol includes low-bandwidth modes for intermittent connectivity in rural regions of Botswana.</p>
      ))}
    </div>
  );

  const renderDPA = () => (
    <div className="space-y-6">
      {renderSection('dpa-legal', 'DPA 2018 Compliance', 'Boikarabele jwa DPA 2018', (
        <p>We are fully aligned with the <strong>Botswana Data Protection Act of 2018</strong>. This includes the appointment of a local Data Protection Officer (DPO) and adherence to the eight fundamental principles of data processing.</p>
      ))}
      <div className="p-6 border border-white bg-zinc-900 space-y-4">
        <h4 className="font-black uppercase text-xs tracking-widest">DPO CONTACT (GABORONE)</h4>
        <p className="text-[11px] opacity-70 uppercase tracking-widest">
          ATTN: DATA PROTECTION OFFICER<br />
          IDENTITY OVERHAUL PTY LTD<br />
          PLOT 54367, CBD, GABORONE<br />
          EMAIL: DPO@IDENTITYOVERHAUL.CO.BW
        </p>
      </div>
      {renderSection('rights-proc', 'Data Subject Rights Procedure', 'Tsamaiso ya Ditshwanelo', (
        <ol className="list-decimal pl-5 space-y-2">
          <li>Submit request via app or email</li>
          <li>Identity verification (Botswana ID or passport)</li>
          <li>Process within 30 calendar days</li>
          <li>Provide data in accessible format</li>
        </ol>
      ))}
    </div>
  );

  const renderCookies = () => (
    <div className="space-y-10 font-medium text-sm leading-relaxed">
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tight">MANAGE PREFERENCES</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-white bg-zinc-900">
            <div>
              <p className="font-black uppercase text-xs tracking-widest">ESSENTIAL COOKIES</p>
              <p className="text-[10px] opacity-50 uppercase">Session, Security, Login State</p>
            </div>
            <div className="px-3 py-1 bg-white text-black text-[9px] font-black uppercase">REQUIRED</div>
          </div>
          {/* Cookie toggles... */}
        </div>
      </div>
    </div>
  );

  const titles: Record<PolicyType, string> = {
    'terms': 'TERMS OF SERVICE',
    'privacy': 'PRIVACY POLICY',
    'system': 'SYSTEM REQUIREMENTS',
    'data-protection': 'DATA PROTECTION (BW)',
    'cookies': 'COOKIE POLICY'
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-black border border-white max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shrink-0">
          <div>
            <h2 className="text-3xl font-syne font-black uppercase tracking-tighter leading-none mb-2">
              {titles[type]}
            </h2>
            <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.3em]">LAST UPDATED: {lastUpdated}</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <div className="flex border border-white">
                <button onClick={() => setLang('EN')} className={`px-4 py-2 text-[9px] font-black transition-all ${lang === 'EN' ? 'bg-white text-black' : 'hover:bg-zinc-900'}`}>EN</button>
                <button onClick={() => setLang('TN')} className={`px-4 py-2 text-[9px] font-black transition-all ${lang === 'TN' ? 'bg-white text-black' : 'hover:bg-zinc-900'}`}>TN</button>
             </div>
             <button 
                onClick={onClose}
                className="w-12 h-12 border border-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
             >
                <i className="fas fa-times text-xl"></i>
             </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-8 py-4 border-b border-white/10 flex items-center gap-4 bg-zinc-950/50">
          <i className="fas fa-search opacity-30 text-xs"></i>
          <input 
            type="text" 
            placeholder="SEARCH DOCUMENT..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest placeholder:opacity-20"
          />
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-10 lg:p-16 custom-scrollbar bg-black">
          {type === 'terms' && renderTerms()}
          {type === 'privacy' && renderPrivacy()}
          {type === 'system' && renderSystem()}
          {type === 'data-protection' && renderDPA()}
          {type === 'cookies' && renderCookies()}
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-white flex flex-col sm:flex-row gap-4 shrink-0 bg-zinc-950">
          <button 
            onClick={() => { window.print(); }}
            className="px-6 py-4 border border-white text-white font-black text-[10px] tracking-widest hover:bg-white hover:text-black transition-all uppercase flex items-center justify-center gap-2"
          >
            <i className="fas fa-print"></i> PRINT DOCUMENT
          </button>
          <div className="flex-1"></div>
          {onAccept && (
            <button 
              onClick={() => onAccept(type)}
              className="px-10 py-4 bg-white text-black font-black text-[10px] tracking-[0.3em] hover:bg-zinc-200 transition-all uppercase"
            >
              I ACCEPT & ACKNOWLEDGE
            </button>
          )}
          {!onAccept && (
            <button 
              onClick={onClose}
              className="px-10 py-4 bg-white text-black font-black text-[10px] tracking-[0.3em] hover:bg-zinc-200 transition-all uppercase"
            >
              CLOSE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
