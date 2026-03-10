import React, { useState, useEffect } from 'react';
import { BRAND_NAME } from '../version';

interface Props {
  onStartCapture: () => void;
  onStakeout: () => void;
  onShowList: () => void;
  onShowExport: () => void;
  onShowHelp: () => void;
}

const Dashboard: React.FC<Props> = ({ onStartCapture, onStakeout, onShowList, onShowExport, onShowHelp }) => {
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosInstallPrompt, setShowIosInstallPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIosDevice && !isStandalone) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstallPrompt(true);
      return;
    }

    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] animate-in px-8 pt-20 md:pt-28 justify-start relative">
      {/* Install App Button */}
      {!isInIframe && isInstallable && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 h-12 flex items-center animate-in fade-in zoom-in duration-1000">
          <button 
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <i className="fas fa-download text-xs"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Uygulamayı İndir</span>
          </button>
        </div>
      )}

      {/* iOS Install Prompt Modal */}
      {showIosInstallPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowIosInstallPrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <i className="fab fa-apple text-3xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Uygulamayı Yükle</h3>
              <p className="text-slate-600 text-sm">
                iOS cihazınızda uygulamayı ana ekrana eklemek için aşağıdaki adımları izleyin:
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-blue-600 border border-slate-200">
                  <span className="font-bold text-sm">1</span>
                </div>
                <p className="text-sm text-slate-700 pt-1.5">
                  Tarayıcının alt menüsündeki <i className="fas fa-share-square mx-1 text-blue-500"></i> <strong>Paylaş</strong> butonuna dokunun.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-blue-600 border border-slate-200">
                  <span className="font-bold text-sm">2</span>
                </div>
                <p className="text-sm text-slate-700 pt-1.5">
                  Açılan menüden <i className="far fa-plus-square mx-1 text-slate-500"></i> <strong>Ana Ekrana Ekle</strong> seçeneğini seçin.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowIosInstallPrompt(false)}
              className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}

      {/* Dil / Bayrak - Sol Üst Köşe */}
      <div className="absolute top-6 left-8 z-20">
        <button 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-blue-100 active:scale-90 transition-all hover:bg-blue-50 overflow-hidden"
          title="Dil Değiştir"
        >
          <div className="w-8 h-6 rounded-md overflow-hidden flex items-center justify-center shadow-sm">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg" 
              alt="Türk Bayrağı" 
              className="w-full h-full object-cover"
              style={{ objectPosition: '35% 50%' }}
              referrerPolicy="no-referrer"
            />
          </div>
        </button>
      </div>

      {/* Yardım Butonu - Sağ Üst Köşe (Glow Efektli) */}
      <div className="absolute top-6 right-8 z-20">
        <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
        <button 
          onClick={onShowHelp}
          className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-blue-100 text-blue-600 active:scale-90 transition-all hover:bg-blue-50 group"
        >
          <i className="fas fa-question text-xl font-black group-hover:text-amber-500 transition-colors stroke-current stroke-2" style={{ WebkitTextStroke: '1px' }}></i>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-bounce"></div>
        </button>
      </div>

      {/* Header - Logo kaldırıldı, metinler merkezlendi ve üst girinti artırıldı */}
      <header className="flex flex-col items-center shrink-0 mb-10 md:mb-16">
        {/* Açıklama Metni - Siyah Renk, Merkezlenmiş */}
        <p className="text-sm md:text-base font-black text-slate-900 uppercase tracking-[0.2em] mb-4 leading-tight text-center w-full max-w-sm">
          Mobil cihazlarınız için <br /> Konum Belirleme Uygulaması
        </p>
        
        {/* Ana Başlık - #2563eb Mavi Renk */}
        <h1 className="text-5xl md:text-6xl font-black text-[#2563eb] tracking-tighter leading-none text-center">
          {BRAND_NAME}
        </h1>
      </header>

      <main className="w-full max-w-sm mx-auto flex flex-col space-y-2.5 md:space-y-3">
        {/* Ana Menü - Ultra kompakt ve dikey sıralı */}
        
        {/* Yeni Ölçüm Yap */}
        <button 
          onClick={onStartCapture}
          className="w-full py-3 md:py-4 px-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-plus text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">Yeni Ölçüm Yap</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>

        {/* Aplikasyon Yap */}
        <button 
          onClick={onStakeout}
          className="w-full py-3 md:py-4 px-5 bg-blue-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-location-crosshairs text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">Aplikasyon Yap</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>

        {/* Kayıtlı Projeler */}
        <button 
          onClick={onShowList}
          className="w-full py-3 md:py-4 px-5 bg-amber-500 text-white rounded-xl md:rounded-2xl shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-folder-open text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">Kayıtlı Projeler</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>

        {/* Veri Aktar */}
        <button 
          onClick={onShowExport}
          className="w-full py-3 md:py-4 px-5 bg-slate-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-slate-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-file-export text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">Veri Aktar</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>
      </main>
    </div>
  );
};

export default Dashboard;