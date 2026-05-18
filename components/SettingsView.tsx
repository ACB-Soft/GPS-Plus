import React, { useState, useEffect } from 'react';
import { APP_VERSION, FULL_BRAND } from '../version';
import GlobalFooter from './GlobalFooter';
import Modal from './Modal';
import Header from './Header';

interface Props {
  onBack: () => void;
}

const SettingsView: React.FC<Props> = ({ onBack }) => {
  const [coordinateSystem, setCoordinateSystem] = useState(localStorage.getItem('default_coord_system') || 'WGS84');
  const [accuracyLimit, setAccuracyLimit] = useState(localStorage.getItem('default_accuracy_limit') || '5.0');
  const [measurementDuration, setMeasurementDuration] = useState(localStorage.getItem('default_duration') || '15');
  const [mapProvider, setMapProvider] = useState(localStorage.getItem('default_map_provider') || 'Google Hybrid');
  const [audioEnabled, setAudioEnabled] = useState(localStorage.getItem('default_audio_feedback_enabled') !== 'false');
  const [vibrationEnabled, setVibrationEnabled] = useState(localStorage.getItem('default_vibration_feedback_enabled') === 'true');
  const [screenAlwaysOn, setScreenAlwaysOn] = useState(localStorage.getItem('default_screen_always_on') !== 'false');
  const [locationPrecision, setLocationPrecision] = useState(localStorage.getItem('default_location_precision') || '2');
  const [heightPrecision, setHeightPrecision] = useState(localStorage.getItem('default_height_precision') || '1');
  const [heightType, setHeightType] = useState(localStorage.getItem('default_height_type') || 'orthometric');
  const [calculationMethod, setCalculationMethod] = useState(localStorage.getItem('default_calculation_method') || 'WEIGHTED_LSE');
  const [gnssOnlyMode, setGnssOnlyMode] = useState(localStorage.getItem('default_gnss_only_mode') === 'true');
  const [showOnboarding, setShowOnboarding] = useState(localStorage.getItem('show_onboarding_every_time') !== 'false');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'confirm';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    localStorage.setItem('default_coord_system', coordinateSystem);
    localStorage.setItem('default_accuracy_limit', accuracyLimit);
    localStorage.setItem('default_duration', measurementDuration);
    localStorage.setItem('default_map_provider', mapProvider);
    localStorage.setItem('default_audio_feedback_enabled', audioEnabled.toString());
    localStorage.setItem('default_vibration_feedback_enabled', vibrationEnabled.toString());
    localStorage.setItem('default_screen_always_on', screenAlwaysOn.toString());
    localStorage.setItem('default_location_precision', locationPrecision);
    localStorage.setItem('default_height_precision', heightPrecision);
    localStorage.setItem('default_height_type', heightType);
    localStorage.setItem('default_calculation_method', calculationMethod);
    localStorage.setItem('default_gnss_only_mode', gnssOnlyMode.toString());
    localStorage.setItem('show_onboarding_every_time', showOnboarding.toString());
  }, [coordinateSystem, accuracyLimit, measurementDuration, mapProvider, audioEnabled, vibrationEnabled, screenAlwaysOn, locationPrecision, heightPrecision, heightType, calculationMethod, gnssOnlyMode, showOnboarding]);

  const handleResetSettings = () => {
    if (confirm('Tüm ayarlar fabrika ayarlarına sıfırlanacak. Emin misiniz?')) {
      // Clear localStorage defaults
      localStorage.removeItem('default_coord_system');
      localStorage.removeItem('default_accuracy_limit');
      localStorage.removeItem('default_duration');
      localStorage.removeItem('default_map_provider');
      localStorage.removeItem('default_audio_feedback_enabled');
      localStorage.removeItem('default_vibration_feedback_enabled');
      localStorage.removeItem('default_screen_always_on');
      localStorage.removeItem('default_location_precision');
      localStorage.removeItem('default_height_precision');
      localStorage.removeItem('default_height_type');
      localStorage.removeItem('default_calculation_method');
      localStorage.removeItem('default_gnss_only_mode');
      localStorage.removeItem('show_onboarding_every_time');

      // Reset state to synchronized defaults
      setCoordinateSystem('WGS84');
      setAccuracyLimit('5.0');
      setMeasurementDuration('15');
      setMapProvider('Google Hybrid');
      setAudioEnabled(true);
      setVibrationEnabled(false);
      setScreenAlwaysOn(true);
      setLocationPrecision('2');
      setHeightPrecision('1');
      setHeightType('orthometric');
      setCalculationMethod('WEIGHTED_LSE');
      setGnssOnlyMode(false);
      setShowOnboarding(true);

      setModal({ 
        isOpen: true, 
        title: 'Başarılı',
        type: 'success', 
        message: 'Ayarlar başarıyla sıfırlandı.' 
      });
    }
  };

  const handleUpdateCheck = async () => {
    if (isCheckingUpdate) return;
    
    setIsCheckingUpdate(true);
    
    try {
      // Cache-busting query parameter to ensure we get the latest version from the server
      const response = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('Sunucuya erişilemedi');
      
      const data = await response.json();
      const serverVersion = data.version;
      
      // Simüle edilmiş bir ağ gecikmesi (kullanıcıya işlemin yapıldığını hissettirmek için)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsCheckingUpdate(false);
      
      if (serverVersion !== APP_VERSION) {
        setModal({
          isOpen: true,
          title: 'Yeni Sürüm Mevcut',
          message: `Yeni bir sürüm mevcut (${serverVersion}).\n\nMevcut Sürüm: ${APP_VERSION}\n\nSayfayı yenileyerek güncellemek ister misiniz?`,
          type: 'confirm',
          onConfirm: () => window.location.reload()
        });
      } else {
        setModal({
          isOpen: true,
          title: 'Uygulama Güncel',
          message: `Güncelleştirmeler denetlendi.\n\nMevcut Sürüm: ${APP_VERSION}\nDurum: Uygulamanız güncel.`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Güncelleme kontrolü hatası:', error);
      setIsCheckingUpdate(false);
      setModal({
        isOpen: true,
        title: 'Hata Oluştu',
        message: 'Güncelleştirme denetimi sırasında bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.',
        type: 'error'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-slate-200">
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmLabel={modal.type === 'confirm' ? 'Güncelle' : undefined}
      >
        <p className="whitespace-pre-line">{modal.message}</p>
      </Modal>
      <Header title="Ayarlar" onBack={onBack} sticky={true} />

      <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-4">
        <div className="max-w-sm mx-auto w-full space-y-6">
          {/* Sistem Ayarları */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-cog"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sistem</h3>
            </div>
            
            <div className="soft-card p-5">
              <button 
                onClick={handleUpdateCheck}
                disabled={isCheckingUpdate}
                className={`w-full h-12 px-5 bg-slate-100 text-blue-600 rounded-2xl font-bold flex items-center justify-between shadow-sm border border-slate-100 active:scale-[0.98] transition-all ${isCheckingUpdate ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fas ${isCheckingUpdate ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                  <span className="text-[13px] whitespace-nowrap">
                    {isCheckingUpdate ? 'Denetleniyor...' : 'Güncelleştirme Denetimi'}
                  </span>
                </div>
                {!isCheckingUpdate && <i className="fas fa-chevron-right text-blue-300 text-xs"></i>}
              </button>
            </div>
          </section>

          {/* Ölçüm Ayarları */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-satellite-dish"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Ölçüm Ayarları</h3>
            </div>
            
            <div className="soft-card p-5 space-y-4">
              {/* Koordinat Sistemi */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Koordinat Sistemi</label>
                <select 
                  value={coordinateSystem}
                  onChange={(e) => setCoordinateSystem(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="WGS84">WGS84 (Enlem-Boylam)</option>
                  <option value="ITRF96_3">ITRF96 - 3° - TM</option>
                  <option value="ITRF96_6">ITRF96 - 6° - UTM</option>
                  <option value="ED50_3">ED50 - 3° - TM</option>
                  <option value="ED50_6">ED50 - 6° - UTM</option>
                </select>
              </div>

              {/* Ölçüm Hassasiyeti */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hassasiyet Limiti</label>
                <select 
                  value={accuracyLimit}
                  onChange={(e) => setAccuracyLimit(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[2, 3, 4, 5, 10, 25, 50, 100].map(v => (
                    <option key={v} value={v.toFixed(1)}>{v.toFixed(1)} metre</option>
                  ))}
                </select>
              </div>

              {/* Ölçüm Süresi */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ölçüm Süresi</label>
                <select 
                  value={measurementDuration}
                  onChange={(e) => setMeasurementDuration(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[5, 10, 15, 30, 60].map(v => <option key={v} value={v.toString()}>{v} saniye</option>)}
                </select>
              </div>

              {/* Hesaplama Yöntemi */}
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hesaplama Yöntemi</label>
                <select 
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="ARITHMETIC_MEAN">1. Yöntem: Aritmetik Ortalama</option>
                  <option value="WEIGHTED_LSE">2. Yöntem: Ağırlıklı Dengeleme (Varsayılan)</option>
                  <option value="KMEANS_HYBRID">3. Yöntem: Hibrit (K-Means)</option>
                </select>
              </div>

              {/* Sadece GNSS Modu */}
              <div className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">Sadece GNSS Modu</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Wi-Fi / Şebeke Verilerini Filtrele</span>
                </div>
                <button 
                  onClick={() => setGnssOnlyMode(!gnssOnlyMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${gnssOnlyMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${gnssOnlyMode ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <p className="text-[9px] text-slate-500 font-medium ml-1 leading-tight">
                Aktif edildiğinde, sadece yükseklik verisi içeren uydu tabanlı konumlar ölçüme dahil edilir. Açık alanlarda hassasiyeti artırır.
              </p>
            </div>
          </section>

          {/* Birim ve Duyarlılık Ayarları */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-ruler-combined"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Birim ve Duyarlılık</h3>
            </div>
            
            <div className="soft-card p-5 space-y-4">
              {/* Konum Duyarlılığı */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konum (Virgülden sonraki duyarlılık)</label>
                <select 
                  value={locationPrecision}
                  onChange={(e) => setLocationPrecision(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[0, 1, 2].map((v) => (
                    <option key={v} value={v.toString()}>{v} Hane</option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-500 font-medium ml-1">WGS84 harici koordinat sistemlerinde geçerlidir.</p>
              </div>

              {/* Yükseklik Duyarlılığı */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yükseklik (Virgülden sonraki duyarlılık)</label>
                <select 
                  value={heightPrecision}
                  onChange={(e) => setHeightPrecision(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[0, 1, 2].map((v) => (
                    <option key={v} value={v.toString()}>{v} Hane</option>
                  ))}
                </select>
              </div>

              {/* Yükseklik Tipi */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yükseklik Tipi</label>
                <select 
                  value={heightType}
                  onChange={(e) => setHeightType(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="orthometric">Ortometrik Yükseklik</option>
                  <option value="ellipsoidal">Elipsoidal Yükseklik</option>
                </select>
              </div>
            </div>
          </section>

          {/* Görünüm ve Bildirim Ayarları */}
          <section className="space-y-3 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-bell"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Görünüm & Bildirim</h3>
            </div>
            
            <div className="soft-card p-5 space-y-4">
              {/* Harita Sağlayıcısı */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harita Sağlayıcısı</label>
                <select 
                  value={mapProvider}
                  onChange={(e) => setMapProvider(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="Google Hybrid">Google Hibrit</option>
                  <option value="Google Satellite">Google Satellite</option>
                  <option value="OpenTopoMap">OpenTopoMap</option>
                </select>
              </div>

              {/* Sesli Geri Bildirim */}
              <div className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">Sesli Bildirim</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ölçüm Sırasında</span>
                </div>
                <button 
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${audioEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${audioEnabled ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Titreşimli Geri Bildirim */}
              <div className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">Titreşimli Bildirim</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ölçüm Sırasında</span>
                </div>
                <button 
                  onClick={() => setVibrationEnabled(!vibrationEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${vibrationEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${vibrationEnabled ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Ekran Her Zaman Açık */}
              <div className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">Ekran Her Zaman Açık</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Ölçüm ve Aplikasyon Sırasında</span>
                </div>
                <button 
                  onClick={() => setScreenAlwaysOn(!screenAlwaysOn)}
                  className={`w-12 h-6 rounded-full transition-all relative ${screenAlwaysOn ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${screenAlwaysOn ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {/* Onboarding Ekranı */}
              <div className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">Onboarding Ekranı</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Her açılışta göster</span>
                </div>
                <button 
                  onClick={() => setShowOnboarding(!showOnboarding)}
                  className={`w-12 h-6 rounded-full transition-all relative ${showOnboarding ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showOnboarding ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </section>

          {/* Fabrika Ayarlarına Dön */}
          <section className="mt-8 mb-4">
            <button
              onClick={handleResetSettings}
              className="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-3xl transition-colors border border-slate-200 border-dashed"
            >
              <i className="fas fa-rotate-left"></i>
              <span className="font-black text-sm uppercase tracking-widest">Ayarları Sıfırla</span>
            </button>
          </section>
        </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
};

export default SettingsView;
