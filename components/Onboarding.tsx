import React from 'react';
import { BRAND_NAME } from '../version';
import { useLanguage } from '../utils/LanguageContext';

interface Props {
  onFinish: () => void;
}

const Onboarding: React.FC<Props> = ({ onFinish }) => {
  const { t } = useLanguage();
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  const handlePermissionAndStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('show_onboarding_every_time', 'false');
    } else {
      localStorage.removeItem('show_onboarding_every_time');
    }
    onFinish();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-200 h-full animate-in overflow-y-auto no-scrollbar px-8 pt-12 pb-6">
      {/* Üst Kısım: Logo ve Başlık */}
      <div className="flex flex-col items-center text-center shrink-0 mb-6 font-sans">
        <div className="relative mb-3 md:mb-4">
          <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full"></div>
          <div className="relative flex items-center justify-center transform rotate-2">
            <img src="favicon.svg" alt="Logo" className="w-28 h-28 md:w-36 md:h-36 transform -rotate-2" referrerPolicy="no-referrer" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-slate-900 font-black text-[12px] md:text-[14px] uppercase tracking-[0.18em] leading-tight max-w-[260px] md:max-w-xs mx-auto opacity-80 whitespace-pre-line">
            {t("Mobil Cihazlarınız için\nKonum Belirleme Uygulaması")}
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-blue-600 tracking-tighter leading-none">
            {BRAND_NAME}
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-sm mx-auto space-y-2 md:space-y-2.5 mb-6">
        <div className="w-full flex gap-3 text-left items-center py-2 px-3.5 md:py-2.5 md:px-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <i className="fas fa-location-crosshairs text-sm md:text-base"></i>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("Konum Erişimi")}</h4>
            <p className="text-[10px] md:text-[11px] text-slate-500 font-bold leading-tight">
              {t("GPS verilerini kullanarak konum bilgisi üretmek için gereklidir.")}
            </p>
          </div>
        </div>

        <div className="w-full flex gap-3 text-left items-center py-2 px-3.5 md:py-2.5 md:px-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <i className="fas fa-database text-sm md:text-base"></i>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("Dosya Erişimi")}</h4>
            <p className="text-[10px] md:text-[11px] text-slate-500 font-bold leading-tight">
              {t("Uygulama verilerini aktarmak için gereklidir. Verileriniz sadece yerel cihazınızda depolanır.")}
            </p>
          </div>
        </div>

        <div className="w-full flex gap-3 text-left items-center py-2 px-3.5 md:py-2.5 md:px-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-amber-50 rounded-lg md:rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <i className="fas fa-earth-americas text-sm md:text-base"></i>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-widest">{t("İnternet Erişimi")}</h4>
            <p className="text-[10px] md:text-[11px] text-slate-500 font-bold leading-tight">
              {t("Uydu görüntüsü altlıklarının yüklenebilmesi için gereklidir.")}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto shrink-0 mt-auto">
        <button 
          onClick={handlePermissionAndStart}
          className="w-full py-4 md:py-5 px-5 bg-blue-600 text-white rounded-[1.5rem] md:rounded-[1.8rem] font-black text-[13px] md:text-[14px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-[0.97] transition-all flex items-center justify-center gap-4 cursor-pointer"
        >
          {t("Uygulamaya Başla")}
          <i className="fas fa-arrow-right text-white/50 text-[11px]"></i>
        </button>

        <div className="flex items-center justify-center mt-4">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
              dontShowAgain 
                ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200' 
                : 'border-slate-300 bg-white group-hover:border-slate-400'
            }`}>
              {dontShowAgain && (
                <svg className="w-2.5 h-2.5 text-white stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" strokeWidth="3" />
                </svg>
              )}
            </div>
            <span className="text-[11px] md:text-[12px] text-slate-500 font-bold tracking-widest uppercase group-hover:text-slate-700 transition-colors">
              {t("Açılışta bu ekranı atla")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;