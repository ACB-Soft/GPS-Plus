import React from 'react';
import GlobalFooter from './GlobalFooter';
import { APP_VERSION } from '../version';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onBack: () => void;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdateSettings, onBack }) => {
  const handleUpdate = (key: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-[#F8FAFC]">
      <header className="px-8 pt-6 pb-6 flex items-center gap-5 shrink-0 bg-white shadow-sm">
        <button 
          onClick={onBack} 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800 active:scale-90 transition-all"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Ayarlar</h2>
        </div>
      </header>

      <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-4">
        <div className="max-w-sm mx-auto w-full space-y-6">
          
          {/* Uygulama Bilgisi - EN ÜSTE TAŞINDI */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <i className="fas fa-info-circle text-sm"></i>
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Uygulama Bilgisi</h3>
            </div>

            <div className="soft-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mevcut Sürüm</p>
                <p className="text-xs font-black text-blue-600">{APP_VERSION}</p>
              </div>
              
              <button 
                onClick={() => {
                  const btn = document.getElementById('settings-update-check-btn');
                  if (btn) {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Denetleniyor...';
                    setTimeout(() => {
                      btn.innerHTML = '<i class="fas fa-check mr-2"></i> Uygulama Güncel';
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                      }, 2000);
                    }, 1500);
                  }
                }}
                id="settings-update-check-btn"
                className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-sync-alt text-[9px]"></i>
                Güncelleştirmeleri Denetle
              </button>
            </div>
          </section>

          {/* Ölçüm Ayarları */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <i className="fas fa-sliders text-sm"></i>
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Ölçüm Ayarları</h3>
            </div>

            <div className="soft-card p-5 space-y-5">
              {/* Varsayılan Koordinat Sistemi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Varsayılan Koordinat Sistemi</label>
                <select 
                  value={settings.defaultCoordinateSystem} 
                  onChange={e => handleUpdate('defaultCoordinateSystem', e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none text-sm"
                >
                  <option value="WGS84">WGS84 (Enlem-Boylam)</option>
                  <option value="ITRF96_3">ITRF96 - 3°</option>
                  <option value="ED50_3">ED50 - 3°</option>
                  <option value="ED50_6">ED50 - 6°</option>
                </select>
              </div>

              {/* Varsayılan Hassasiyet Limiti */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Varsayılan Hassasiyet Limiti (Metre)</label>
                <select 
                  value={settings.defaultAccuracyLimit} 
                  onChange={e => handleUpdate('defaultAccuracyLimit', parseFloat(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none text-sm"
                >
                  {[2, 3, 5, 10, 20, 50, 100].map(v => <option key={v} value={v}>{v} Metre</option>)}
                </select>
              </div>

              {/* Varsayılan Ölçüm Süresi */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Varsayılan Ölçüm Süresi (Saniye)</label>
                <select 
                  value={settings.defaultMeasurementDuration} 
                  onChange={e => handleUpdate('defaultMeasurementDuration', parseInt(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none text-sm"
                >
                  {[5, 10, 15, 20, 30].map(v => <option key={v} value={v}>{v} Saniye</option>)}
                </select>
              </div>

              <div className="h-[1px] bg-slate-100 w-full"></div>

              {/* Ekran Her Zaman Açık - BURAYA TAŞINDI */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-black text-slate-900 text-xs uppercase tracking-tight">Ekran Her Zaman Açık</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ölçüm sırasında kapanmasın</p>
                </div>
                <button 
                  onClick={() => handleUpdate('screenAlwaysOn', !settings.screenAlwaysOn)}
                  className={`w-12 h-7 rounded-full relative transition-all duration-300 ${settings.screenAlwaysOn ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${settings.screenAlwaysOn ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
};

export default SettingsView;
