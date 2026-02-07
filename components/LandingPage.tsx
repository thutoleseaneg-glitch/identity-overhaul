import React, { useState, useEffect, useMemo } from 'react';
import { LegalModals, PolicyType } from './LegalModals';
import { DeviceDetector } from '../utils/deviceDetection';

interface Props {
  onLogin: (name: string, email: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Simulated Password Hashing
const hashPassword = (password: string) => btoa(password + '_salt_protocol');

export const LandingPage: React.FC<Props> = ({ onLogin, theme, toggleTheme }) => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Device Detection Instance
  const detector = useMemo(() => new DeviceDetector(), []);

  useEffect(() => {
    // Initial detection is done in constructor
    const summary = detector.getSummary();
    console.log('Device Detection Initialize:', summary);
    (window as any).deviceInfo = summary;

    // Layout adjustments as per specification
    const adjustLayoutForDevice = () => {
      const { device, screen } = detector.getSummary();
      
      // Touch-friendly targets
      if (device === 'mobile' || device === 'tablet') {
        const buttons = document.querySelectorAll('button, input[type="submit"]');
        buttons.forEach(btn => {
          const b = btn as HTMLElement;
          if (!b.style.minHeight) {
            b.style.minHeight = '44px';
          }
        });
      }
      
      // Small screen font scaling
      if (screen.size === 'xs') {
        const html = document.documentElement;
        const currentFontSize = parseFloat(getComputedStyle(html).fontSize);
        if (currentFontSize < 14) {
          html.style.fontSize = '14px';
        }
      }
    };

    adjustLayoutForDevice();

    const handleResize = () => {
      detector.detectAll();
      adjustLayoutForDevice();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Connection change listener
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleResize);
      }
    };
  }, [detector]);

  // Validation Logic
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pw: string) => pw.length >= 8;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulated Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const usersJson = localStorage.getItem('identity_users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      if (authView === 'signup') {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error("ALL FIELDS ARE MANDATORY.");
        }
        if (!validateEmail(formData.email)) {
          throw new Error("INVALID EMAIL FORMAT.");
        }
        if (!validatePassword(formData.password)) {
          throw new Error("PASSWORD MUST BE AT LEAST 8 CHARACTERS.");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("PASSWORDS DO NOT MATCH.");
        }
        if (users.find((u: any) => u.email === formData.email)) {
          throw new Error("EMAIL ALREADY REGISTERED IN PROTOCOL.");
        }

        const newUser = {
          name: formData.name,
          email: formData.email,
          passwordHash: hashPassword(formData.password),
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('identity_users', JSON.stringify(users));
        setSuccess("ACCOUNT PROVISIONED. INITIALIZING SESSION...");
        
        setTimeout(() => {
          onLogin(newUser.name, newUser.email);
        }, 1000);

      } else if (authView === 'login') {
        const user = users.find((u: any) => u.email === formData.email);
        if (!user || user.passwordHash !== hashPassword(formData.password)) {
          throw new Error("INVALID CREDENTIALS. ACCESS DENIED.");
        }

        if (rememberMe) {
          localStorage.setItem('id_session_token', btoa(user.email + ':' + Date.now()));
        }

        setSuccess("AUTHORIZATION GRANTED.");
        setTimeout(() => {
          onLogin(user.name, user.email);
        }, 800);

      } else if (authView === 'forgot') {
        const user = users.find((u: any) => u.email === formData.email);
        if (!user) throw new Error("EMAIL NOT FOUND IN DATABASE.");
        setSuccess("RESET KEY SENT TO REGISTERED EMAIL.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const consent = window.confirm(
      "GOOGLE AUTHENTICATION SIMULATION\n\nIdentity Overhaul requests access to your profile.\nProceed with demo account?"
    );

    if (consent) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin("Google User", "user@gmail.com");
    } else {
      setIsLoading(false);
    }
  };

  const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="p-8 border border-white hover:bg-white hover:text-black transition-all group bg-black relative z-20 text-center flex flex-col items-center">
      <div className="w-14 h-14 bg-white text-black flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="text-xl font-syne font-bold mb-3 uppercase tracking-tighter">{title}</h3>
      <p className="text-zinc-400 group-hover:text-black leading-relaxed text-sm font-medium">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative">
      <nav className="sticky top-0 z-[100] bg-black/80 backdrop-blur-md border-b border-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white flex items-center justify-center text-black">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <h1 className="text-2xl font-syne font-black tracking-tighter">
              IDENTITY<span className="opacity-30">OVERHAUL</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setAuthView('login'); document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' }); }} 
              className="hidden sm:block font-black text-xs tracking-widest hover:underline uppercase"
            >
              LOGIN
            </button>
            <button 
              onClick={() => { setAuthView('signup'); document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="px-6 py-2 bg-white text-black font-black text-xs tracking-widest hover:bg-zinc-200 transition-all uppercase min-h-[44px]"
            >
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-48 border-b border-white px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-7xl lg:text-9xl font-syne font-black leading-[0.9] mb-12 uppercase tracking-tighter">
              DATA<br />
              <span className="opacity-20">DISCIPLINE.</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed italic">
              Professional-grade tracking for sales, strength, and strategy. Zero color. Zero distraction. Pure monochrome performance.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-16 py-5 bg-white text-black font-black text-sm tracking-[0.2em] hover:bg-zinc-200 transition-all uppercase shadow-[0_0_40px_rgba(255,255,255,0.15)] min-h-[44px]"
              >
                INITIATE PROTOCOL
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="auth" className="py-32 bg-black px-6 scroll-mt-20 relative z-20">
        <div className="max-w-xl mx-auto border border-white p-10 lg:p-16 relative bg-black/40 backdrop-blur-sm">
          
          {error && (
            <div className="absolute top-0 left-0 right-0 -translate-y-full p-4 bg-white text-black text-center font-black text-[10px] uppercase tracking-widest border-x border-t border-white animate-in slide-in-from-bottom-2">
              <i className="fas fa-exclamation-triangle mr-2"></i> {error}
            </div>
          )}
          
          {success && (
            <div className="absolute top-0 left-0 right-0 -translate-y-full p-4 bg-zinc-800 text-white text-center font-black text-[10px] uppercase tracking-widest border-x border-t border-white animate-in slide-in-from-bottom-2">
              <i className="fas fa-check-circle mr-2"></i> {success}
            </div>
          )}

          <h2 className="text-4xl font-syne font-black mb-12 text-center uppercase tracking-tighter">
            {authView === 'signup' ? 'REGISTER' : authView === 'login' ? 'AUTHORIZE' : 'RECOVER'}
          </h2>

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            {authView === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">FULL NAME</label>
                <input 
                  type="text" 
                  required
                  placeholder="NAME"
                  disabled={isLoading}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  className="w-full px-6 py-4 bg-black border border-white text-white focus:bg-white focus:text-black outline-none transition-all uppercase font-bold text-sm min-h-[44px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">EMAIL ADDRESS</label>
              <input 
                type="email" 
                required
                placeholder="EMAIL"
                disabled={isLoading}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-6 py-4 bg-black border border-white text-white focus:bg-white focus:text-black outline-none transition-all font-bold text-sm min-h-[44px]"
              />
            </div>

            {authView !== 'forgot' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">SECRET KEY</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-6 py-4 bg-black border border-white text-white focus:bg-white focus:text-black outline-none transition-all font-bold text-sm min-h-[44px]"
                />
              </div>
            )}

            {authView === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-50">CONFIRM KEY</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-6 py-4 bg-black border border-white text-white focus:bg-white focus:text-black outline-none transition-all font-bold text-sm min-h-[44px]"
                />
              </div>
            )}

            {authView === 'login' && (
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 border border-white flex items-center justify-center transition-all ${rememberMe ? 'bg-white' : 'bg-black'}`}>
                    {rememberMe && <i className="fas fa-check text-[10px] text-black"></i>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)} 
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100">REMEMBER ME</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setAuthView('forgot')}
                  className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:underline"
                >
                  FORGOT KEY?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-white text-black font-black text-sm tracking-[0.3em] hover:bg-zinc-200 transition-all uppercase flex items-center justify-center gap-3 min-h-[44px]"
            >
              {isLoading && <i className="fas fa-circle-notch animate-spin"></i>}
              {isLoading ? 'PROCESSING...' : authView === 'signup' ? 'START OVERHAUL' : authView === 'login' ? 'AUTHORIZE' : 'RECOVER ACCOUNT'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-4 text-zinc-500 font-black tracking-widest">OR</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-4 border border-white text-white font-black text-[10px] tracking-[0.2em] hover:bg-white hover:text-black transition-all uppercase flex items-center justify-center gap-3 min-h-[44px]"
          >
            <i className="fab fa-google"></i> CONTINUE WITH GOOGLE
          </button>

          <button 
            onClick={() => { setAuthView(authView === 'signup' ? 'login' : 'signup'); setError(null); }}
            className="mt-10 w-full text-center text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:underline"
          >
            {authView === 'signup' ? 'ALREADY REGISTERED? LOG IN' : 'NEW PROTOCOL? REGISTER'}
          </button>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6 grid md:grid-cols-3 border-t border-white relative z-20 bg-black/60 backdrop-blur-sm">
        <FeatureCard 
          icon="fa-bullhorn" 
          title="SALES CALENDAR" 
          desc="Advanced leads tracking with cold-call metrics and BWP revenue summaries."
        />
        <FeatureCard 
          icon="fa-dumbbell" 
          title="PHYSICAL INTEL" 
          desc="Strict gym logging with AI analysis linking strength to sales performance."
        />
        <FeatureCard 
          icon="fa-sticky-note" 
          title="STRATEGY PAD" 
          desc="Daily notepad for future planning and high-level thought logging."
        />
      </section>

      <footer className="py-12 border-t border-white px-6 relative z-20 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
           <div className="text-[10px] font-black uppercase tracking-widest">© 2025 IDENTITY OVERHAUL PROTOCOL</div>
           <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => setActivePolicy('terms')}
                className="text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                TERMS
              </button>
              <button 
                onClick={() => setActivePolicy('privacy')}
                className="text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                PRIVACY
              </button>
              <button 
                onClick={() => setActivePolicy('system')}
                className="text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                SYSTEMS
              </button>
              <button 
                onClick={() => setActivePolicy('data-protection')}
                className="text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                DATA PROTECTION
              </button>
              <button 
                onClick={() => setActivePolicy('cookies')}
                className="text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                COOKIES
              </button>
           </div>
        </div>
      </footer>

      {activePolicy && (
        <LegalModals 
          type={activePolicy} 
          onClose={() => setActivePolicy(null)} 
          onAccept={(p) => { 
            console.log(`CONSENT RECORDED FOR: ${p}`);
            setActivePolicy(null);
          }}
        />
      )}
    </div>
  );
};