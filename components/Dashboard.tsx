import React, { useState } from 'react';
import { BRAND_NAME } from '../version';

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
  return (
    <div className="flex-1 flex flex-col bg-slate-200 animate-in px-8 pt-20 md:pt-28 justify-start relative">
      {locationError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                  <i className="fas fa-triangle-exclamation text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-red-900 font-black uppercase tracking-tight text-lg leading-tight">
                    {locationError === "NOT_SUPPORTED" ? "Desteklenmiyor" : (
                      <>Konum İzni<br/>Gerekli</>
                    )}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-4 text-[13px] font-bold text-slate-600 leading-snug">
                {locationError === "NOT_SUPPORTED" ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    Tarayıcınız konum servisini desteklemiyor. Lütfen farklı bir tarayıcı deneyin veya cihaz ayarlarınızı kontrol edin.
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-red-600 block mb-1 uppercase text-[10px] tracking-widest font-black">1. Android Kullanıcıları</span>
                      Üst bildiri panelinden konum servislerini aktif hale getirin.
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-red-600 block mb-1 uppercase text-[10px] tracking-widest font-black">2. iOS Kullanıcıları</span>
                      Ayarlar-Konum-Safari Siteleri-Konum iznini aktif hale getirin.
                    </div>
                  </>
                )}
                
                <div className="pt-2">
                  <button 
                    onClick={onRetryLocation}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-rotate-right"></i>
                    {locationError === "NOT_SUPPORTED" ? "Tekrar Dene" : "İzni Tekrar Kontrol Et"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Dil / Bayrak - Sol Üst Köşe */}
      <div className="absolute top-6 left-8 z-20">
        <button 
          className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl border border-blue-200 active:scale-90 transition-all hover:bg-blue-100 overflow-hidden"
          title="Dil Değiştir"
        >
          <div className="w-8 h-6 rounded-md overflow-hidden flex items-center justify-center shadow-sm bg-white">
            <img 
              src={`${import.meta.env.BASE_URL}Flag_of_Turkey.svg`} 
              alt="Türk Bayrağı" 
              className="w-full h-full object-cover"
              style={{ objectPosition: '35% 50%' }}
              referrerPolicy="no-referrer"
            />
          </div>
        </button>
      </div>

      {/* Ayarlar ve Yardım Butonları - Sağ Üst Köşe */}
      <div className="absolute top-6 right-8 z-20 flex gap-3">
        {/* Ayarlar Butonu */}
        <button 
          onClick={onShowSettings}
          className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl border border-blue-200 text-slate-600 active:scale-90 transition-all hover:bg-blue-100 group"
          title="Ayarlar"
        >
          <i className="fas fa-cog text-xl group-hover:text-blue-600 transition-colors"></i>
        </button>

        {/* Yardım Butonu (Glow Efektli) */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          <button 
            onClick={onShowHelp}
            className="relative w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl border border-blue-200 text-blue-600 active:scale-90 transition-all hover:bg-blue-100 group"
            title="Yardım"
          >
            <i className="fas fa-question text-xl font-black group-hover:text-amber-500 transition-colors stroke-current stroke-2" style={{ WebkitTextStroke: '1px' }}></i>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-bounce"></div>
          </button>
        </div>
      </div>

      {/* Header - Logo ve Marka Bilgisi Onboarding ile Aynı */}
      <header className="flex flex-col items-center shrink-0 mb-10 md:mb-16">
        
        <div className="space-y-2 md:space-y-3 text-center">
          <p className="text-slate-900 font-black text-[12px] md:text-[14px] uppercase tracking-[0.18em] leading-tight max-w-[260px] mx-auto opacity-80">
            Mobil Cihazlarınız için<br/>Konum Belirleme Uygulaması
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-blue-600 tracking-tighter leading-none">
            {BRAND_NAME}
          </h1>
        </div>
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