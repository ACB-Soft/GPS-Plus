import React, { useState, useEffect } from 'react';
import { BRAND_NAME } from '../version';
import { useLanguage } from '../utils/LanguageContext';
import PWAInstallModal from './PWAInstallModal';

interface Props {
  onStartCapture: () => void;
  onStakeout: () => void;
  onShowList: () => void;
  onShowExport: () => void;
  onShowHelp: () => void;
  onShowSettings: () => void;
  onRetryLocation: () => void;
  locationError?: string | null;
}

const Dashboard: React.FC<Props> = ({ onStartCapture, onStakeout, onShowList, onShowExport, onShowHelp, onShowSettings, onRetryLocation, locationError }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => (window as any).__deferredPwaPrompt || null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    if ((window as any).__deferredPwaPrompt) {
      setDeferredPrompt((window as any).__deferredPwaPrompt);
    }

    const handleCaptured = () => {
      if ((window as any).__deferredPwaPrompt) {
        setDeferredPrompt((window as any).__deferredPwaPrompt);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-captured', handleCaptured);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-captured', handleCaptured);
    };
  }, []);

  const handleTriggerInstallPrompt = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          (window as any).__deferredPwaPrompt = null;
          setShowInstallModal(false);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const handleInstallButtonClick = () => {
    if (deferredPrompt) {
      handleTriggerInstallPrompt();
    } else {
      setShowInstallModal(true);
    }
  };

  const handleApplyLanguage = (newLang: any) => {
    setShowLangMenu(false);
    changeLanguage(newLang);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-200 animate-in px-8 pt-20 md:pt-28 justify-start relative">
      {/* Dil / Bayrak - Sol Üst Köşe */}
      <div className="absolute top-6 left-8 z-30">
        <button 
          onClick={() => {
            setTempLanguage(language);
            setShowLangMenu(prev => !prev);
          }}
          className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl border border-slate-300/80 active:scale-90 transition-all hover:bg-slate-200 overflow-hidden cursor-pointer"
          title={t("Dil Değiştir")}
        >
          {language === 'TR' ? (
            <div className="w-8 h-6 rounded-md flex items-center justify-center bg-slate-600 text-[10px] font-black text-slate-100 tracking-widest shadow-sm uppercase leading-none animate-in fade-in duration-300">
              TR
            </div>
          ) : (
            <div className="w-8 h-6 rounded-md flex items-center justify-center bg-slate-600 text-[10px] font-black text-slate-100 tracking-widest shadow-sm uppercase leading-none animate-in fade-in duration-300">
              EN
            </div>
          )}
        </button>

        {/* Dil Seçenekleri Menüsü */}
        {showLangMenu && (
          <div className="absolute left-0 mt-3 w-48 bg-slate-50/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-300 p-4 space-y-3 animate-in slide-in-from-top-2 z-50">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              {t("Dil Seçin")}
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => setTempLanguage('TR')}
                className={`w-full p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-left ${
                  tempLanguage === 'TR' ? 'bg-slate-200 border border-slate-300 text-slate-800' : 'bg-transparent border border-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 rounded overflow-hidden flex items-center justify-center shadow-xs bg-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6750 -25500 76500 51000" className="w-full h-full object-cover" style={{ objectPosition: '35% 50%' }}>
                      <path fill="#e30a17" d="m0-30000h90000v60000H0z"/>
                      <path fill="#fff" d="m41750 0 13568-4408-8386 11541V-7133l8386 11541zm925 8021a15000 15000 0 1 1 0-16042 12000 12000 0 1 0 0 16042z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-black">Türkçe</span>
                </div>
                {tempLanguage === 'TR' && <i className="fas fa-check-circle text-xs text-slate-600"></i>}
              </button>
              
              <button
                onClick={() => setTempLanguage('EN')}
                className={`w-full p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-left ${
                  tempLanguage === 'EN' ? 'bg-slate-200 border border-slate-300 text-slate-800' : 'bg-transparent border border-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 rounded overflow-hidden flex items-center justify-center bg-slate-800 text-[8px] font-black text-slate-100 tracking-wider shadow-sm uppercase leading-none shrink-0">
                    EN
                  </div>
                  <span className="text-xs font-black">English</span>
                </div>
                {tempLanguage === 'EN' && <i className="fas fa-check-circle text-xs text-slate-600"></i>}
              </button>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowLangMenu(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors"
              >
                {t("İptal")}
              </button>
              <button
                onClick={() => handleApplyLanguage(tempLanguage)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors shadow-md shadow-slate-800/10"
              >
                {t("Uygula")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Uygulamayı Yükle, Ayarlar ve Yardım Butonları - Sağ Üst Köşe */}
      <div className="absolute top-6 right-8 z-20 flex gap-3">
        {/* Uygulamayı Yükle Butonu */}
        <button 
          onClick={handleInstallButtonClick}
          className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl border border-blue-200 text-slate-600 active:scale-90 transition-all hover:bg-blue-100 group cursor-pointer relative"
          title={t("Uygulamayı Yükle")}
        >
          <i className="fas fa-download text-xl group-hover:text-blue-600 transition-colors"></i>
          {deferredPrompt && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>

        {/* Ayarlar Butonu */}
        <button 
          onClick={onShowSettings}
          className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl border border-blue-200 text-slate-600 active:scale-90 transition-all hover:bg-blue-100 group cursor-pointer"
          title={t("Ayarlar")}
        >
          <i className="fas fa-cog text-xl group-hover:text-blue-600 transition-colors"></i>
        </button>

        {/* Yardım Butonu (Glow Efektli) */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          <button 
            onClick={onShowHelp}
            className="relative w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl border border-blue-200 text-blue-600 active:scale-90 transition-all hover:bg-blue-100 group cursor-pointer"
            title={t("Yardım")}
          >
            <i className="fas fa-question text-xl font-black group-hover:text-amber-500 transition-colors stroke-current stroke-2" style={{ WebkitTextStroke: '1px' }}></i>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-bounce"></div>
          </button>
        </div>
      </div>

      {/* Header - Logo ve Marka Bilgisi Onboarding ile Aynı */}
      <header className="flex flex-col items-center shrink-0 mb-10 md:mb-16">
        
        <div className="space-y-2 md:space-y-3 text-center">
          <p className="text-slate-900 font-black text-[12px] md:text-[14px] uppercase tracking-[0.18em] leading-tight max-w-[260px] md:max-w-xs mx-auto opacity-80 whitespace-pre-line">
            {t("Mobil Cihazlarınız için\nKonum Belirleme Uygulaması")}
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-blue-600 tracking-tighter leading-none">
            {BRAND_NAME}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-sm mx-auto flex flex-col space-y-2.5 md:space-y-3">
        {/* Ana Menü - Ultra kompakt ve dikey sıralı */}
        
        {/* Ölçüm Yap */}
        <button 
          onClick={onStartCapture}
          className="w-full py-3 md:py-4 px-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10 cursor-pointer"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-plus text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">{t("Ölçüm Yap")}</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>

        {/* Aplikasyon Yap */}
        <button 
          onClick={onStakeout}
          className="w-full py-3 md:py-4 px-5 bg-blue-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10 cursor-pointer"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-location-crosshairs text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">{t("Aplikasyon Yap")}</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>

        {/* Kayıtlı Ölçümler */}
        <button 
          onClick={onShowList}
          className="w-full py-3 md:py-4 px-5 bg-cyan-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-cyan-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10 cursor-pointer"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-folder-open text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">{t("Kayıtlı Ölçümler")}</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>

        {/* Veri Aktar */}
        <button 
          onClick={onShowExport}
          className="w-full py-3 md:py-4 px-5 bg-slate-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-slate-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden border border-white/10 cursor-pointer"
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
              <i className="fas fa-file-export text-base md:text-lg text-white"></i>
            </div>
            <span className="text-sm md:text-base font-black tracking-tight leading-none uppercase">{t("Veri Aktar")}</span>
          </div>
          <i className="fas fa-chevron-right text-white/40 group-hover:translate-x-1 transition-transform text-[10px]"></i>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-xl"></div>
        </button>
      </main>

      {/* PWA Yükleme Rehberi Modalı */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onInstall={handleTriggerInstallPrompt}
        isStandalone={isStandalone}
      />
    </div>
  );
};

export default Dashboard;