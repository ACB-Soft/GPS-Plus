import React, { useState, useEffect } from 'react';
import { SavedLocation, AppSettings } from '../types';
import { geoidService } from '../services/GeoidService';
import { convertCoordinate } from '../utils/CoordinateUtils';

interface Props {
  location: SavedLocation;
  settings: AppSettings;
  onClose: () => void;
}

const DataAnalysisView: React.FC<Props> = ({ location, settings, onClose }) => {
  const [preciseLat, setPreciseLat] = useState<string>('');
  const [preciseLng, setPreciseLng] = useState<string>('');
  const [preciseAlt, setPreciseAlt] = useState<string>('');
  
  const [preciseX, setPreciseX] = useState<string>('');
  const [preciseY, setPreciseY] = useState<string>('');
  const [preciseZ, setPreciseZ] = useState<string>('');

  const [errorStats, setErrorStats] = useState<{
    dx: number;
    dy: number;
    dz: number;
    dhz: number;
    d3d: number;
  } | null>(null);

  const [useLocal, setUseLocal] = useState(location.coordinateSystem !== 'WGS84');

  const calculateErrors = () => {
    const sys = location.coordinateSystem || 'ITRF96_3';
    
    if (useLocal) {
      const px = parseFloat(preciseX);
      const py = parseFloat(preciseY);
      const pz = parseFloat(preciseZ);

      if (isNaN(px) || isNaN(py) || isNaN(pz)) return;

      // Measured values in local system
      const { x: mx, y: my } = convertCoordinate(location.lat, location.lng, sys);
      const mz = settings.heightType === 'orthometric' 
        ? getCorrectedHeight(location.lat, location.lng, location.altitude)
        : location.altitude;

      // X is Easting (Sağa), Y is Northing (Yukarı) in our convertCoordinate output
      // Note: order might be swapped in labels but x is easting, y is northing in prosj4 result array
      const dx = px - mx;
      const dy = py - my;
      const dz = pz - mz;
      const dhz = Math.sqrt(dx*dx + dy*dy);
      const d3d = Math.sqrt(dx*dx + dy*dy + dz*dz);

      setErrorStats({ dx, dy, dz, dhz, d3d });
    } else {
      const plat = parseFloat(preciseLat);
      const plng = parseFloat(preciseLng);
      const palt = parseFloat(preciseAlt);

      if (isNaN(plat) || isNaN(plng) || isNaN(palt)) return;

      // Use a consistent comparison system (ITRF96_3 or similar) for meter errors
      const testSys = sys === 'WGS84' ? 'ITRF96_3' : sys;
      
      const { x: mx, y: my } = convertCoordinate(location.lat, location.lng, testSys);
      const { x: px, y: py } = convertCoordinate(plat, plng, testSys);
      
      const dx = px - mx;
      const dy = py - my;
      const dz = palt - location.altitude; // WGS84 comparison usually means Ellipsoidal
      const dhz = Math.sqrt(dx*dx + dy*dy);
      const d3d = Math.sqrt(dx*dx + dy*dy + dz*dz);

      setErrorStats({ dx, dy, dz, dhz, d3d });
    }
  };

  const getCorrectedHeight = (lat: number, lng: number, alt: number) => {
    const undulation = geoidService.getUndulation(lat, lng);
    return alt - undulation;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest leading-none">Hassas Analiz</h2>
              <p className="text-blue-400 text-[10px] font-bold mt-2 uppercase tracking-widest">Nokta: {location.name}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          
          <div className="flex gap-2">
            <button 
              onClick={() => setUseLocal(false)}
              className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${!useLocal ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}
            >
              WGS84 (Global)
            </button>
            <button 
              onClick={() => setUseLocal(true)}
              className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${useLocal ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}
            >
              Lokal (X,Y,Z)
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Kesin Değerleri Giriniz</h3>
            
            {useLocal ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">X (Sağa)</label>
                  <input 
                    type="number" 
                    value={preciseX} 
                    onChange={e => setPreciseX(e.target.value)} 
                    placeholder="Easting"
                    className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Y (Yukarı)</label>
                  <input 
                    type="number" 
                    value={preciseY} 
                    onChange={e => setPreciseY(e.target.value)} 
                    placeholder="Northing"
                    className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Z (Kot)</label>
                  <input 
                    type="number" 
                    value={preciseZ} 
                    onChange={e => setPreciseZ(e.target.value)} 
                    placeholder="Elevation"
                    className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Enlem (Lat)</label>
                  <input 
                    type="number" 
                    value={preciseLat} 
                    onChange={e => setPreciseLat(e.target.value)} 
                    placeholder="Latitude"
                    className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Boylam (Lng)</label>
                  <input 
                    type="number" 
                    value={preciseLng} 
                    onChange={e => setPreciseLng(e.target.value)} 
                    placeholder="Longitude"
                    className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alt (Elip. H)</label>
                  <input 
                    type="number" 
                    value={preciseAlt} 
                    onChange={e => setPreciseAlt(e.target.value)} 
                    placeholder="Altitude"
                    className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={calculateErrors}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Hataları Hesapla
            </button>
          </div>

          {errorStats && (
            <div className="bg-slate-100 rounded-[2rem] p-6 space-y-4 animate-in zoom-in-95 duration-300">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-center">Sapma Sonuçları</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ΔX / ΔE</p>
                  <p className="text-lg font-black text-red-600">{errorStats.dx.toFixed(3)} m</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ΔY / ΔN</p>
                  <p className="text-lg font-black text-red-600">{errorStats.dy.toFixed(3)} m</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ΔZ / ΔH</p>
                  <p className="text-lg font-black text-red-600">{errorStats.dz.toFixed(3)} m</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ΔYatay</p>
                  <p className="text-lg font-black text-blue-600">{errorStats.dhz.toFixed(3)} m</p>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Toplam 3D Vektör Hatası</p>
                <p className="text-3xl font-black text-white">{errorStats.d3d.toFixed(3)} m</p>
              </div>

              <p className="text-[10px] text-slate-400 font-bold text-center italic">
                * Pozitif değerler ölçülen değerin kesin değerden büyük olduğu, negatif değerler küçük olduğunu gösterir.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default DataAnalysisView;
