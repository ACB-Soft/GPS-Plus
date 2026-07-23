import React, { useState } from 'react';
import { useLanguage } from '../utils/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstall: () => void;
  isStandalone?: boolean;
}

const PWAInstallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstall,
  isStandalone = false
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-blue-50/80 to-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
              <i className="fas fa-download text-xl"></i>
            </div>
            <div>
              <h3 className="text-slate-900 font-extrabold text-lg leading-tight">
                {t("Uygulamayı Yükle")}
              </h3>
              <p className="text-slate-500 text-xs font-semibold">
                {t("Ana Ekrana Ekle & Hızlı Erişim")}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <i className="fas fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-5">
          
          {isStandalone ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
              <i className="fas fa-circle-check text-2xl text-emerald-600 shrink-0"></i>
              <p className="text-xs font-bold leading-relaxed">
                {t("Uygulama zaten ana ekranınızda bir PWA olarak yüklü durumda!")}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {t("GPS Plus'ı tarayıcı kullanmadan, tam ekran ve çevrimdışı performansla bir mobil uygulama gibi kullanabilirsiniz.")}
            </p>
          )}

          {/* Prompt Var ise Doğrudan Yükle Butonu */}
          {deferredPrompt && !isStandalone && (
            <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-blue-700 tracking-wider">
                  {t("Otomatik Yükleme")}
                </span>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase">
                  {t("Önerilen")}
                </span>
              </div>
              <button
                onClick={onInstall}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <i className="fas fa-download text-sm"></i>
                {t("Doğrudan Yükle")}
              </button>
            </div>
          )}

          {/* Manuel Rehber Sekmeleri */}
          {!isStandalone && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  {t("Manuel Yükleme Rehberi")}
                </h4>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/60">
                <button
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'android'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <i className="fab fa-android text-emerald-600 text-sm"></i>
                  <span>Android</span>
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'ios'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <i className="fab fa-apple text-slate-800 text-sm"></i>
                  <span>iOS (Safari)</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'android' ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 text-emerald-700 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="leading-snug">
                      {t("Tarayıcınızın sağ üstündeki")} <strong className="font-extrabold text-slate-900">{t("üç nokta (⋮)")}</strong> {t("menü simgesine dokunun.")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 text-emerald-700 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="leading-snug">
                      <strong className="font-extrabold text-slate-900">{t("\"Uygulamayı Yükle\"")}</strong> {t("veya")} <strong className="font-extrabold text-slate-900">{t("\"Ana Ekrana Ekle\"")}</strong> {t("seçeneğini belirleyin.")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-100 text-emerald-700 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="leading-snug">
                      {t("Açılan pencerede")} <strong className="font-extrabold text-slate-900">{t("\"Yükle\"")}</strong> {t("butonuna basarak onaylayın.")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 text-blue-700 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="leading-snug">
                      {t("Safari alt menüsündeki")} <strong className="font-extrabold text-slate-900">{t("Paylaş (⎘ / [↑])")}</strong> {t("simgesine dokunun.")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 text-blue-700 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="leading-snug">
                      {t("Menüyü kaydırıp")} <strong className="font-extrabold text-slate-900">{t("\"Ana Ekrana Ekle (+)\"")}</strong> {t("seçeneğine dokunun.")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 text-blue-700 font-black rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="leading-snug">
                      {t("Sağ üstteki")} <strong className="font-extrabold text-slate-900">{t("\"Ekle\"")}</strong> {t("butonuna basarak tamamlayın.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}


        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {t("Kapat")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PWAInstallModal;
