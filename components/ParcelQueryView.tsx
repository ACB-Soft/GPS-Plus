import React, { useState, useEffect, useMemo } from 'react';
import { ParcelAdminItem, ParcelQueryResult } from '../types';
import {
  fetchProvinces,
  fetchDistricts,
  fetchNeighborhoods,
  queryParcelByAdmin,
} from '../services/parcelService';
import { useLanguage } from '../utils/LanguageContext';

interface ParcelQueryViewProps {
  onConfirmParcel: (parcel: ParcelQueryResult) => void;
}

type ActivePicker = 'IL' | 'ILCE' | 'MAHALLE' | null;

export const ParcelQueryView: React.FC<ParcelQueryViewProps> = ({
  onConfirmParcel,
}) => {
  const { t } = useLanguage();

  // Administrative hierarchy state
  const [provinces, setProvinces] = useState<ParcelAdminItem[]>([]);
  const [districts, setDistricts] = useState<ParcelAdminItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<ParcelAdminItem[]>([]);

  const [selectedIl, setSelectedIl] = useState<ParcelAdminItem | null>(null);
  const [selectedIlce, setSelectedIlce] = useState<ParcelAdminItem | null>(null);
  const [selectedMahalle, setSelectedMahalle] = useState<ParcelAdminItem | null>(null);
  const [adaInput, setAdaInput] = useState('');
  const [parselInput, setParselInput] = useState('');

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Searchable picker sheet state
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  // Query execution state
  const [isQuerying, setIsQuerying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    let active = true;
    setLoadingProvinces(true);
    fetchProvinces()
      .then((items) => {
        if (active) setProvinces(items);
      })
      .catch((err) => {
        if (active) setErrorMessage(err?.message || t('İl listesi yüklenemedi.'));
      })
      .finally(() => {
        if (active) setLoadingProvinces(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelectIl = async (item: ParcelAdminItem) => {
    setSelectedIl(item);
    setSelectedIlce(null);
    setSelectedMahalle(null);
    setDistricts([]);
    setNeighborhoods([]);
    setErrorMessage(null);
    setActivePicker(null);
    setPickerSearch('');

    setLoadingDistricts(true);
    try {
      const list = await fetchDistricts(item.id);
      setDistricts(list);
    } catch (err: any) {
      setErrorMessage(err?.message || t('İlçe listesi yüklenemedi.'));
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleSelectIlce = async (item: ParcelAdminItem) => {
    setSelectedIlce(item);
    setSelectedMahalle(null);
    setNeighborhoods([]);
    setErrorMessage(null);
    setActivePicker(null);
    setPickerSearch('');

    setLoadingNeighborhoods(true);
    try {
      const list = await fetchNeighborhoods(item.id);
      setNeighborhoods(list);
    } catch (err: any) {
      setErrorMessage(err?.message || t('Mahalle listesi yüklenemedi.'));
    } finally {
      setLoadingNeighborhoods(false);
    }
  };

  const handleSelectMahalle = (item: ParcelAdminItem) => {
    setSelectedMahalle(item);
    setErrorMessage(null);
    setActivePicker(null);
    setPickerSearch('');
  };

  const handleAdminQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!selectedIl || !selectedIlce || !selectedMahalle) {
      setErrorMessage(t('Lütfen İl, İlçe ve Mahalle / Köy seçimini tamamlayın.'));
      return;
    }

    const cleanParsel = parselInput.trim();
    const cleanAda = adaInput.trim() === '' ? '0' : adaInput.trim();

    if (!cleanParsel || !/^\d{1,10}$/.test(cleanParsel)) {
      setErrorMessage(t('Lütfen geçerli bir parsel numarası girin.'));
      return;
    }

    if (!/^\d{1,10}$/.test(cleanAda)) {
      setErrorMessage(t('Ada numarası yalnızca rakamlardan oluşmalıdır.'));
      return;
    }

    setIsQuerying(true);
    try {
      const result = await queryParcelByAdmin(selectedMahalle.id, cleanAda, cleanParsel);
      onConfirmParcel(result);
    } catch (err: any) {
      setErrorMessage(err?.message || t('Parsel sorgulanırken bir hata oluştu.'));
    } finally {
      setIsQuerying(false);
    }
  };

  const pickerConfig = useMemo(() => {
    if (activePicker === 'IL') {
      return {
        title: t('İl Seçin'),
        items: provinces,
        selectedId: selectedIl?.id,
        onSelect: handleSelectIl,
      };
    }
    if (activePicker === 'ILCE') {
      return {
        title: t('İlçe Seçin'),
        items: districts,
        selectedId: selectedIlce?.id,
        onSelect: handleSelectIlce,
      };
    }
    if (activePicker === 'MAHALLE') {
      return {
        title: t('Mahalle / Köy Seçin'),
        items: neighborhoods,
        selectedId: selectedMahalle?.id,
        onSelect: handleSelectMahalle,
      };
    }
    return null;
  }, [activePicker, provinces, districts, neighborhoods, selectedIl, selectedIlce, selectedMahalle]);

  const filteredPickerItems = useMemo(() => {
    if (!pickerConfig) return [];
    const q = pickerSearch.trim().toLocaleLowerCase('tr');
    if (!q) return pickerConfig.items;
    return pickerConfig.items.filter((item) => item.text.toLocaleLowerCase('tr').includes(q));
  }, [pickerConfig, pickerSearch]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8">
        <div className="py-5 pt-4 pb-8 mx-auto max-w-md w-full">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
            <form onSubmit={handleAdminQuery} className="space-y-4">
              {/* İl Seçimi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block px-1">
                  {t('İl')}
                </label>
                <button
                  type="button"
                  disabled={loadingProvinces}
                  onClick={() => {
                    setPickerSearch('');
                    setActivePicker('IL');
                  }}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center justify-between gap-2 text-left transition-colors cursor-pointer disabled:opacity-60"
                >
                  <span className={`text-sm font-semibold truncate ${selectedIl ? 'text-slate-900' : 'text-slate-400'}`}>
                    {loadingProvinces
                      ? t('İller yükleniyor...')
                      : selectedIl
                      ? selectedIl.text
                      : t('İl seçiniz')}
                  </span>
                  <i className={`fas ${loadingProvinces ? 'fa-spinner fa-spin' : 'fa-chevron-down'} text-xs text-slate-400 shrink-0`}></i>
                </button>
              </div>

              {/* İlçe Seçimi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block px-1">
                  {t('İlçe')}
                </label>
                <button
                  type="button"
                  disabled={!selectedIl || loadingDistricts}
                  onClick={() => {
                    setPickerSearch('');
                    setActivePicker('ILCE');
                  }}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center justify-between gap-2 text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`text-sm font-semibold truncate ${selectedIlce ? 'text-slate-900' : 'text-slate-400'}`}>
                    {loadingDistricts
                      ? t('İlçeler yükleniyor...')
                      : selectedIlce
                      ? selectedIlce.text
                      : selectedIl
                      ? t('İlçe seçiniz')
                      : t('Önce il seçiniz')}
                  </span>
                  <i className={`fas ${loadingDistricts ? 'fa-spinner fa-spin' : 'fa-chevron-down'} text-xs text-slate-400 shrink-0`}></i>
                </button>
              </div>

              {/* Mahalle / Köy Seçimi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block px-1">
                  {t('Mahalle / Köy')}
                </label>
                <button
                  type="button"
                  disabled={!selectedIlce || loadingNeighborhoods}
                  onClick={() => {
                    setPickerSearch('');
                    setActivePicker('MAHALLE');
                  }}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center justify-between gap-2 text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={`text-sm font-semibold truncate ${selectedMahalle ? 'text-slate-900' : 'text-slate-400'}`}>
                    {loadingNeighborhoods
                      ? t('Mahalleler yükleniyor...')
                      : selectedMahalle
                      ? selectedMahalle.text
                      : selectedIlce
                      ? t('Mahalle veya köy seçiniz')
                      : t('Önce ilçe seçiniz')}
                  </span>
                  <i className={`fas ${loadingNeighborhoods ? 'fa-spinner fa-spin' : 'fa-chevron-down'} text-xs text-slate-400 shrink-0`}></i>
                </button>
              </div>

              {/* Ada ve Parsel Numaraları */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label htmlFor="parcel-ada-input" className="text-xs font-bold text-slate-600 block px-1">
                    {t('Ada No')}
                  </label>
                  <input
                    id="parcel-ada-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={adaInput}
                    onChange={(e) => setAdaInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="w-full min-h-[46px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono tabular-nums font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="parcel-no-input" className="text-xs font-bold text-slate-600 block px-1">
                    {t('Parsel No')}
                  </label>
                  <input
                    id="parcel-no-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={parselInput}
                    onChange={(e) => setParselInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={t('Örn: 43')}
                    className="w-full min-h-[46px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono tabular-nums font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 px-1 leading-relaxed">
                {t('Köy veya ada numarası bulunmayan taşınmazlar için Ada alanını boş bırakabilir veya 0 yazabilirsiniz.')}
              </p>

              <button
                type="submit"
                disabled={isQuerying || !selectedMahalle || !parselInput.trim()}
                className="w-full min-h-[48px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-2xl font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isQuerying ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>{t('Parsel Sorgulanıyor...')}</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-map-location-dot"></i>
                    <span>{t('Parseli Haritada Aç')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Hata Mesajı */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 leading-relaxed"
              >
                <i className="fas fa-circle-exclamation text-rose-600 mt-0.5 shrink-0"></i>
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Arama Destekli Alt Seçim Paneli (Bottom Sheet / Modal) */}
      {pickerConfig && (
        <div
          className="fixed inset-0 z-[1200] bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setActivePicker(null)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[82vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-slate-300"></div>
            </div>

            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-slate-900">{pickerConfig.title}</h3>
              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="min-w-[44px] min-h-[44px] rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label={t('Kapat')}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <i className="fas fa-search text-slate-400 text-xs absolute left-3.5 top-1/2 -translate-y-1/2"></i>
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder={t('Listede ara...')}
                  className="w-full min-h-[44px] pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-600"
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch('')}
                    className="min-w-[40px] min-h-[40px] absolute right-0.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                    aria-label={t('Temizle')}
                  >
                    <i className="fas fa-times-circle text-sm"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredPickerItems.length === 0 ? (
                <div className="py-10 px-6 text-center text-xs text-slate-500">
                  {t('Eşleşen kayıt bulunamadı.')}
                </div>
              ) : (
                filteredPickerItems.map((item) => {
                  const isSelected = pickerConfig.selectedId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => pickerConfig.onSelect(item)}
                      className={`w-full min-h-[48px] px-5 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 text-blue-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-800 font-medium'
                      }`}
                    >
                      <span className="text-sm truncate">{item.text}</span>
                      {isSelected && <i className="fas fa-check text-blue-600 text-xs shrink-0"></i>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelQueryView;
