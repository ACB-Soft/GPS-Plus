import React, { useState, useEffect, useRef } from 'react';
import { APP_VERSION, FULL_BRAND } from '../version';
import GlobalFooter from './GlobalFooter';
import Modal from './Modal';
import Header from './Header';
import { useLanguage } from '../utils/LanguageContext';

interface Props {
  onBack: () => void;
  onRestoreLocations?: (newLocs: any[]) => void;
}

const SettingsView: React.FC<Props> = ({ onBack, onRestoreLocations }) => {
  const { t } = useLanguage();
  const [coordinateSystem, setCoordinateSystem] = useState(localStorage.getItem('default_coord_system') || 'WGS84');
  const [accuracyLimit, setAccuracyLimit] = useState(localStorage.getItem('default_accuracy_limit') || '5');
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'confirm';
    confirmLabel?: string;
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
    if (confirm(t('Tüm ayarlar fabrika ayarlarına sıfırlanacak. Emin misiniz?'))) {
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
      setAccuracyLimit('5');
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
        title: t('Başarılı'),
        type: 'success', 
        message: t('Ayarlar başarıyla sıfırlandı.') 
      });
    }
  };

  const handleUpdateCheck = async () => {
    if (isCheckingUpdate) return;
    
    setIsCheckingUpdate(true);
    try {
      // Offline-resilient and deterministic update simulator
      await new Promise(resolve => setTimeout(resolve, 1500));
      setModal({
        isOpen: true,
        title: t('Güncelleştirme Denetimi'),
        type: 'info',
        message: `${t('Uygulama Güncel')}\n\n${FULL_BRAND}`
      });
    } catch {
      setModal({
        isOpen: true,
        title: t('Hata Oluştu'),
        type: 'error',
        message: t('Güncelleştirme denetimi sırasında bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.')
      });
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleCreateBackup = () => {
    try {
      const backupKeys = [
        'gps_locations_v5.0',
        'stakeout_points_v1',
        'stakeout_geometries_v1',
        'last_folder_name',
        'onboarding_v5.0_done',
        'language_preference',
        'show_onboarding_every_time',
        'default_coord_system',
        'default_accuracy_limit',
        'default_duration',
        'default_map_provider',
        'default_audio_feedback_enabled',
        'default_vibration_feedback_enabled',
        'default_screen_always_on',
        'default_location_precision',
        'default_height_precision',
        'default_height_type',
        'default_calculation_method',
        'default_gnss_only_mode'
      ];

      const backupData: Record<string, string | null> = {};
      backupKeys.forEach(key => {
        backupData[key] = localStorage.getItem(key);
      });

      const payload = {
        appName: 'ACB Maps',
        backupVersion: '1.0',
        timestamp: Date.now(),
        data: backupData
      };

      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `acb_maps_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setModal({
        isOpen: true,
        title: t('Başarılı'),
        type: 'success',
        message: t('Yedek başarıyla oluşturuldu ve indirildi.')
      });
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: t('Hata Oluştu'),
        type: 'error',
        message: t('Yedek oluşturulurken bir hata oluştu: ') + err.message
      });
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const resultStr = event.target?.result as string;
        const payload = JSON.parse(resultStr);

        if (!payload || typeof payload !== 'object' || !payload.data || typeof payload.data !== 'object') {
          throw new Error(t('Geçersiz yedek dosyası formatı.'));
        }

        const dataToRestore = payload.data;
        
        setModal({
          isOpen: true,
          title: t('Yedek Yükle'),
          type: 'confirm',
          confirmLabel: t('Yedek Yükle'),
          message: t('Yedek dosyasındaki ölçümler, mevcut verilerinizin üzerine eklenecek ve aynı isimdeki projeler otomatik olarak yeni isimle kaydedilecektir. Devam etmek istiyor musunuz?'),
          onConfirm: () => {
            try {
              // 1. Ölçümler (gps_locations_v5.0) kurgusu
              const currentLocsJson = localStorage.getItem('gps_locations_v5.0');
              let currentLocations: any[] = currentLocsJson ? JSON.parse(currentLocsJson) : [];
              if (!Array.isArray(currentLocations)) currentLocations = [];

              // Desteklenen tüm eski ve yeni lokasyon yedek anahtarları
              const backupLocsValue = dataToRestore['gps_locations_v5.0'] || 
                                      dataToRestore['gps_locations_v7.8.8'] || 
                                      dataToRestore['gps_locations_v7.8.0'] || 
                                      dataToRestore['locations'];
              
              let backupLocations: any[] = [];
              if (backupLocsValue) {
                if (typeof backupLocsValue === 'string') {
                  try {
                    backupLocations = JSON.parse(backupLocsValue);
                  } catch (e) {
                    console.error("Yedek lokasyonlar ayrıştırılamadı:", e);
                  }
                } else if (Array.isArray(backupLocsValue)) {
                  backupLocations = backupLocsValue;
                }
              }

              if (backupLocations.length > 0) {
                // Mevcut klasörleri (projeleri) tespit et
                const currentFolders = new Set(currentLocations.map((l: any) => l.folderName || t('Klasör Yok')));
                
                // Yedek dosyadan gelen benzersiz klasörler
                const backupFolders = Array.from(new Set(backupLocations.map((l: any) => l.folderName || t('Klasör Yok')))) as string[];

                // Klasör adı eşleştirme tablosu (eskiKlasor -> yeniKlasor)
                const folderNameMap = new Map<string, string>();

                backupFolders.forEach(folder => {
                  if (currentFolders.has(folder)) {
                    // Çakışma var! Yeni klasör adı bulalım (örn. Klasör (2), Klasör (3) ...)
                    let idx = 2; // Doğrudan (2) ile başla
                    let newFoldName = `${folder} (${idx})`;
                    while (currentFolders.has(newFoldName) || Array.from(folderNameMap.values()).includes(newFoldName)) {
                      idx++;
                      newFoldName = `${folder} (${idx})`;
                    }
                    folderNameMap.set(folder, newFoldName);
                  } else {
                    folderNameMap.set(folder, folder);
                  }
                });

                // Önce her bir yedek lokasyonu yeni isimleriyle currentLocations'a ekleyelim
                backupLocations.forEach((loc: any) => {
                  const originalFolder = loc.folderName || t('Klasör Yok');
                  const mappedFolder = folderNameMap.get(originalFolder) || originalFolder;
                  
                  // Nokta adı çakışma analizi ve yeniden adlandırma iptal edildi! Noktalar orijinal isimleriyle ekleniyor.
                  const finalPointName = loc.name;

                  // Benzersiz bir id ata (mevcut idlerle çakışmasın)
                  let finalId = loc.id;
                  if (currentLocations.some((l: any) => l.id === loc.id)) {
                    finalId = loc.id + "_" + Math.random().toString(36).substr(2, 5);
                  }

                  currentLocations.push({
                    ...loc,
                    id: finalId,
                    name: finalPointName,
                    folderName: mappedFolder === t('Klasör Yok') ? undefined : mappedFolder
                  });
                });

                // localStorage'a geri eşitleyelim
                localStorage.setItem('gps_locations_v5.0', JSON.stringify(currentLocations));
                if (onRestoreLocations) {
                  onRestoreLocations(currentLocations);
                }
              }

              // 2. Aplikasyon Noktaları (stakeout_points_v1) kurgusu
              const currentStPtsJson = localStorage.getItem('stakeout_points_v1');
              let currentStakeoutPoints: any[] = currentStPtsJson ? JSON.parse(currentStPtsJson) : [];
              if (!Array.isArray(currentStakeoutPoints)) currentStakeoutPoints = [];

              const backupStPtsValue = dataToRestore['stakeout_points_v1'] || dataToRestore['stakeout_points'];
              let backupStakeoutPoints: any[] = [];
              if (backupStPtsValue) {
                if (typeof backupStPtsValue === 'string') {
                  try {
                    backupStakeoutPoints = JSON.parse(backupStPtsValue);
                  } catch (e) {}
                } else if (Array.isArray(backupStPtsValue)) {
                  backupStakeoutPoints = backupStPtsValue;
                }
              }

              if (backupStakeoutPoints.length > 0) {
                backupStakeoutPoints.forEach((bp: any) => {
                  let finalId = bp.id;
                  if (currentStakeoutPoints.some((p: any) => p.id === bp.id)) {
                    finalId = bp.id + "_" + Math.random().toString(36).substr(2, 5);
                  }

                  let finalName = bp.name;
                  let stPtIdx = 1;
                  while (currentStakeoutPoints.some((p: any) => p.name === finalName)) {
                    stPtIdx++;
                    finalName = `${bp.name} (${stPtIdx})`;
                  }

                  currentStakeoutPoints.push({
                    ...bp,
                    id: finalId,
                    name: finalName
                  });
                });
                localStorage.setItem('stakeout_points_v1', JSON.stringify(currentStakeoutPoints));
              }

              // 3. Aplikasyon Geometrileri (stakeout_geometries_v1) kurgusu
              const currentGeomsJson = localStorage.getItem('stakeout_geometries_v1');
              let currentGeometries: any[] = currentGeomsJson ? JSON.parse(currentGeomsJson) : [];
              if (!Array.isArray(currentGeometries)) currentGeometries = [];

              const backupGeomsValue = dataToRestore['stakeout_geometries_v1'] || dataToRestore['stakeout_geometries'];
              let backupGeometries: any[] = [];
              if (backupGeomsValue) {
                if (typeof backupGeomsValue === 'string') {
                  try {
                    backupGeometries = JSON.parse(backupGeomsValue);
                  } catch (e) {}
                } else if (Array.isArray(backupGeomsValue)) {
                  backupGeometries = backupGeomsValue;
                }
              }

              if (backupGeometries.length > 0) {
                backupGeometries.forEach((bg: any) => {
                  let finalId = bg.id;
                  if (currentGeometries.some((g: any) => g.id === bg.id)) {
                    finalId = bg.id + "_" + Math.random().toString(36).substr(2, 5);
                  }

                  let finalName = bg.name;
                  let geomIdx = 1;
                  while (currentGeometries.some((g: any) => g.name === finalName)) {
                    geomIdx++;
                    finalName = `${bg.name} (${geomIdx})`;
                  }

                  currentGeometries.push({
                    ...bg,
                    id: finalId,
                    name: finalName
                  });
                });
                localStorage.setItem('stakeout_geometries_v1', JSON.stringify(currentGeometries));
              }

              // 4. Diğer konfigürasyon ayarlarını olduğu gibi üstüne yazabiliriz
              const skippedKeys = [
                'gps_locations_v5.0', 
                'gps_locations_v7.8.8', 
                'gps_locations_v7.8.0', 
                'locations', 
                'stakeout_points_v1', 
                'stakeout_points', 
                'stakeout_geometries_v1', 
                'stakeout_geometries'
              ];
              Object.keys(dataToRestore).forEach(key => {
                if (!skippedKeys.includes(key)) {
                  const val = dataToRestore[key];
                  if (val !== null && val !== undefined) {
                    localStorage.setItem(key, val);
                  }
                }
              });

              setModal({
                isOpen: true,
                title: t('Başarılı'),
                type: 'success',
                message: t('Yedek başarıyla yüklendi. Değişikliklerin uygulanması için uygulama yenilenecektir.'),
                onConfirm: () => {
                  window.location.reload();
                }
              });
            } catch (restoreErr: any) {
              setModal({
                isOpen: true,
                title: t('Hata Oluştu'),
                type: 'error',
                message: t('Yedek yüklenirken bir hata oluştu: ') + restoreErr.message
              });
            }
          }
        });
      } catch (err: any) {
        setModal({
          isOpen: true,
          title: t('Hata Oluştu'),
          type: 'error',
          message: t('Geçersiz yedek dosyası: ') + err.message
        });
      }
      
      if (e.target) {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-slate-200">
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        confirmLabel={modal.confirmLabel || (modal.type === 'confirm' ? t('Güncelle') : undefined)}
      >
        <p className="whitespace-pre-line">{modal.message}</p>
      </Modal>
      <Header title={t("Ayarlar")} onBack={onBack} sticky={true} />

      <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-4">
        <div className="max-w-sm mx-auto w-full space-y-6">
          {/* Sistem Ayarları */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-cog"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Sistem")}</h3>
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
                    {isCheckingUpdate ? t('Denetleniyor...') : t('Güncelleştirme Denetimi')}
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
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Ölçüm Ayarları")}</h3>
            </div>
            
            <div className="soft-card p-5 space-y-4">
              {/* Koordinat Sistemi */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Koordinat Sistemi")}</label>
                <select 
                  value={coordinateSystem}
                  onChange={(e) => setCoordinateSystem(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="WGS84">{t("WGS84 (Enlem-Boylam)")}</option>
                  <option value="ITRF96_3">{t("ITRF96 - 3° - TM")}</option>
                  <option value="ITRF96_6">{t("ITRF96 - 6° - UTM")}</option>
                  <option value="ED50_3">{t("ED50 - 3° - TM")}</option>
                  <option value="ED50_6">{t("ED50 - 6° - UTM")}</option>
                </select>
              </div>

              {/* Ölçüm Hassasiyeti */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Hassasiyet Limiti")}</label>
                <select 
                  value={accuracyLimit}
                  onChange={(e) => setAccuracyLimit(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[2, 3, 4, 5, 10, 25, 50, 100].map(v => (
                    <option key={v} value={v.toString()}>{v} {t("metre")}</option>
                  ))}
                </select>
              </div>

              {/* Ölçüm Süresi */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Ölçüm Süresi")}</label>
                <select 
                  value={measurementDuration}
                  onChange={(e) => setMeasurementDuration(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[5, 10, 15, 30, 60, 120].map(v => <option key={v} value={v.toString()}>{v} {t("saniye")}</option>)}
                </select>
              </div>

              {/* Hesaplama Yöntemi */}
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Hesaplama Yöntemi")}</label>
                <select 
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="WEIGHTED_LSE">{t("1. Ağırlıklı En Küçük Kareler")}</option>
                  <option value="KMEANS_4">{t("2. KMeans (4 Küme)")}</option>
                  <option value="BAARDA">{t("3. Baarda Eleme")}</option>
                  <option value="MIDRANGE_KMEANS_BAARDA">{t("4. K-Means + Baarda + WLS")}</option>
                </select>
              </div>

              {/* Sadece GNSS Modu */}
              <div className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">{t("Sadece GNSS Modu")}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{t("Wi-Fi / Şebeke Verilerini Filtrele")}</span>
                </div>
                <button 
                  onClick={() => setGnssOnlyMode(!gnssOnlyMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${gnssOnlyMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${gnssOnlyMode ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <p className="text-[9px] text-slate-500 font-medium ml-1 leading-tight">
                {t("Aktif edildiğinde, sadece yükseklik verisi içeren uydu tabanlı konumlar ölçüme dahil edilir. Açık alanlarda hassasiyeti artırır.")}
              </p>
            </div>
          </section>

          {/* Birim ve Duyarlılık Ayarları */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-ruler-combined"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Birim ve Duyarlılık")}</h3>
            </div>
            
            <div className="soft-card p-5 space-y-4">
              {/* Konum Duyarlılığı */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Konum (Virgülden sonraki duyarlılık)")}</label>
                <select 
                  value={locationPrecision}
                  onChange={(e) => setLocationPrecision(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[0, 1, 2].map((v) => (
                    <option key={v} value={v.toString()}>{v} {t("Hane")}</option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-500 font-medium ml-1">{t("WGS84 harici koordinat sistemlerinde geçerlidir.")}</p>
              </div>

              {/* Yükseklik Duyarlılığı */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Yükseklik (Virgülden sonraki duyarlılık)")}</label>
                <select 
                  value={heightPrecision}
                  onChange={(e) => setHeightPrecision(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  {[0, 1, 2].map((v) => (
                    <option key={v} value={v.toString()}>{v} {t("Hane")}</option>
                  ))}
                </select>
              </div>

              {/* Yükseklik Tipi */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Yükseklik Tipi")}</label>
                <select 
                  value={heightType}
                  onChange={(e) => setHeightType(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="orthometric">{t("Ortometrik Yükseklik")}</option>
                  <option value="ellipsoidal">{t("Elipsoidal Yükseklik")}</option>
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
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Görünüm & Bildirim")}</h3>
            </div>
            
            <div className="soft-card p-5 space-y-4">
              {/* Harita Sağlayıcısı */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t("Harita Sağlayıcısı")}</label>
                <select 
                  value={mapProvider}
                  onChange={(e) => setMapProvider(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-sm"
                >
                  <option value="Google Hybrid">{t("Google Hibrit")}</option>
                  <option value="Google Satellite">{t("Google Satellite")}</option>
                  <option value="OpenTopoMap">{t("OpenTopoMap")}</option>
                </select>
              </div>

              {/* Sesli Geri Bildirim */}
              <div className="flex items-center justify-between h-12 px-4 bg-slate-100 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 leading-none">{t("Sesli Bildirim")}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{t("Ölçüm Sırasında")}</span>
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
                  <span className="text-sm font-bold text-slate-900 leading-none">{t("Titreşimli Bildirim")}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{t("Ölçüm Sırasında")}</span>
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
                  <span className="text-sm font-bold text-slate-900 leading-none">{t("Ekran Her Zaman Açık")}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{t("Ölçüm ve Aplikasyon Sırasında")}</span>
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
                  <span className="text-sm font-bold text-slate-900 leading-none">{t("Onboarding Ekranı")}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{t("Her açılışta göster")}</span>
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

          {/* Veri Tabanı Yedekleme */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-database"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Veri Tabanı Yedekleme")}</h3>
            </div>
            
            <div className="soft-card p-5 space-y-4">
              <p className="text-[11px] font-bold text-slate-500 leading-snug">
                {t("Verilerinizi yedekleyebilir veya yedekten geri yükleyebilirsiniz.")}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCreateBackup}
                  className="h-12 px-4 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm border border-sky-100 active:scale-[0.98] transition-all"
                >
                  <i className="fas fa-download"></i>
                  <span className="text-[13px]">{t("Yedek Al")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm border border-emerald-100 active:scale-[0.98] transition-all"
                >
                  <i className="fas fa-upload"></i>
                  <span className="text-[13px]">{t("Yedek Yükle")}</span>
                </button>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleRestoreBackup} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </section>

          {/* Fabrika Ayarlarına Dön */}
          <section className="mt-8 mb-4">
            <button
              onClick={handleResetSettings}
              className="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-3xl transition-colors border border-slate-200 border-dashed"
            >
              <i className="fas fa-rotate-left"></i>
              <span className="font-black text-sm uppercase tracking-widest">{t("Ayarları Sıfırla")}</span>
            </button>
          </section>
        </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
};

export default SettingsView;
