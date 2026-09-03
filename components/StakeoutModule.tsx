import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, CircleMarker, Polyline, Polygon, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { StakeoutPoint, Coordinate, StakeoutGeometry, AppSettings } from '../types';
import { getAccuracyColor, getAccuracyBg } from '../utils/StyleUtils';
import { parseKML, cleanProjectName } from '../utils/KmlParser';
import { convertCoordinate, convertToWGS84 } from '../utils/CoordinateUtils';
import { calculatePolylineLength, calculatePolygonArea, calculatePolygonPerimeter } from '../utils/GeometryUtils';
import { isIOS } from '../utils/browser';
import JSZip from 'jszip';
import GlobalFooter from './GlobalFooter';
import Header from './Header';
import { useLanguage } from '../utils/LanguageContext';
import CompactBottomInfoCard, { SelectedMapFeature } from './CompactBottomInfoCard';
import safeStorage from '../utils/safeStorage';


interface Props {
  onBack: () => void;
  initialPoint?: StakeoutPoint | null;
  settings: AppSettings;
  currentStep?: string | null;
  onNavigate: (step: string) => void;
}

// Optimized helper components
const normalizeAngle = (deg: number): number => {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
};

const MapPopupContent = React.memo(({ name, subtitle, onGo, color }: { name: string, subtitle?: string, onGo: () => void, color?: string }) => {
  const { t } = useLanguage();
  return (
    <div className="p-3 min-w-[140px] bg-slate-200 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-2">
      <div className="flex flex-col px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color || '#3b82f6' }}></div>
          <h4 className="font-black text-slate-800 text-[11px] truncate leading-tight">{name}</h4>
        </div>
        {subtitle && (
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 ml-4">{subtitle}</p>
        )}
      </div>
      <button 
        onClick={onGo}
        className="w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all"
      >
        {t("GİT")}
      </button>
    </div>
  );
});

// Optimized Vertex Layer with Spatial Filtering and interactive selection
const LazyVertexLayer = React.memo(({ 
  geometries, 
  zoom, 
  selectedVertexPointId,
  onVertexSelect 
}: { 
  geometries: StakeoutGeometry[], 
  zoom: number, 
  selectedVertexPointId?: string,
  onVertexSelect: (g: StakeoutGeometry, c: {lat: number, lng: number, altitude?: number}, idx: number) => void 
}) => {
  const { t } = useLanguage();
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => setBounds(map.getBounds()),
  });

  if (zoom <= 16) return null;

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  return (
    <>
      {geometries.flatMap(g => {
        return g.coordinates.map((c, idx) => {
          // Simple numerical bounds check is much faster than object creation (L.latLng)
          if (c.lat < sw.lat || c.lat > ne.lat || c.lng < sw.lng || c.lng > ne.lng) return null;

          const vertexId = `snap-${g.id}-${idx}`;
          const isSelected = selectedVertexPointId === vertexId;

          return (
            <CircleMarker
              key={vertexId}
              center={[c.lat, c.lng]}
              radius={isSelected ? 8 : 5}
              pathOptions={{ 
                color: isSelected ? '#1d4ed8' : 'white', 
                fillColor: isSelected ? '#3b82f6' : (g.color || '#3b82f6'), 
                fillOpacity: 1, 
                weight: isSelected ? 3 : 2 
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  onVertexSelect(g, c, idx);
                }
              }}
            />
          );
        });
      })}
    </>
  );
});

// Memoized Marker component with interactive selection
const StakeoutMarker = React.memo(({ 
  p, 
  zoom, 
  isSelected,
  onSelect,
  onGo 
}: { 
  p: StakeoutPoint, 
  zoom: number, 
  isSelected?: boolean,
  onSelect?: (p: StakeoutPoint) => void,
  onGo: (p: StakeoutPoint) => void 
}) => {
  const icon = React.useMemo(() => L.divIcon({
    className: 'custom-marker',
    html: `<div style="width: ${isSelected ? 16 : 12}px; height: ${isSelected ? 16 : 12}px; background: ${p.color || '#3b82f6'}; border: ${isSelected ? '3px solid #1e293b' : '2px solid white'}; border-radius: 50%; box-shadow: ${isSelected ? '0 0 10px rgba(59,130,246,0.8)' : '0 0 5px rgba(0,0,0,0.3)'}; transform: translate(${isSelected ? '-2px' : '0'}, ${isSelected ? '-2px' : '0'});"></div>`,
    iconSize: [isSelected ? 16 : 12, isSelected ? 16 : 12],
    iconAnchor: [isSelected ? 8 : 6, isSelected ? 8 : 6]
  }), [p.color, isSelected]);

  return (
    <Marker 
      position={[p.lat, p.lng]} 
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          if (onSelect) onSelect(p);
        }
      }}
    >
      {zoom >= 14 && (
        <Tooltip permanent direction="top" offset={[0, isSelected ? -12 : -10]} className="custom-tooltip">
          <span 
            className={`font-black uppercase tracking-tighter ${isSelected ? 'text-blue-700 font-extrabold' : ''}`}
            style={{ fontSize: `${Math.min(11, zoom - 8)}px` }}
          >
            {p.name}
          </span>
        </Tooltip>
      )}
    </Marker>
  );
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapCenterer = ({ trigger }: { trigger: { pos: [number, number], time: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger) {
      map.setView(trigger.pos, 17);
    }
  }, [trigger, map]);
  return null;
};

const MapMeasurementHandler = ({
  isMeasuring,
  onMapClick,
  onDeselect,
}: {
  isMeasuring: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onDeselect?: () => void;
}) => {
  useMapEvents({
    click(e) {
      if (isMeasuring) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      } else if (onDeselect) {
        onDeselect();
      }
    },
  });
  return null;
};

const BingTileLayer = () => {
  const map = useMap();
  useEffect(() => {
    const BingLayerClass = L.TileLayer.extend({
      getTileUrl: function (coords: any) {
        let quadkey = '';
        const z = coords.z;
        const x = coords.x;
        const y = coords.y;
        for (let i = z; i > 0; i--) {
          let digit = 0;
          const mask = 1 << (i - 1);
          if ((x & mask) !== 0) {
            digit += 1;
          }
          if ((y & mask) !== 0) {
            digit += 2;
          }
          quadkey += digit;
        }
        return L.Util.template(this._url, {
          quadkey: quadkey,
          s: this._getSubdomain(coords)
        });
      }
    });

    const layer = new (BingLayerClass as any)(
      "https://ecn.t{s}.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587",
      {
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        attribution: 'Tiles &copy; Microsoft (Bing Maps)',
        maxNativeZoom: 19,
        maxZoom: 22
      }
    );

    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
};

const getTileLayer = (provider: string) => {
  switch (provider) {
    case 'Google Hybrid':
      return {
        url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&scale=2",
        attribution: '&copy; Google',
        maxNativeZoom: 20,
        tms: false
      };
    case 'Google Satellite':
      return {
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&scale=2",
        attribution: '&copy; Google',
        maxNativeZoom: 20,
        tms: false
      };
    case 'OpenTopoMap':
      return {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: '&copy; OpenTopoMap contributors',
        maxNativeZoom: 17,
        tms: false
      };
    case 'Esri World Imagery':
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri',
        maxNativeZoom: 19,
        tms: false
      };
    case 'Bing Satellite':
      return {
        url: "",
        attribution: 'Tiles &copy; Microsoft (Bing Maps)',
        maxNativeZoom: 19,
        tms: false
      };
    case 'Google Roadmap':
    default:
      return {
        url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2",
        attribution: '&copy; Google',
        maxNativeZoom: 20,
        tms: false
      };
  }
};

const ZoomTracker = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
};

const BoundsUpdater = ({ points, geometries, trigger }: { points: StakeoutPoint[], geometries: StakeoutGeometry[], trigger?: number }) => {
  const map = useMap();

  useEffect(() => {
    const allCoords: [number, number][] = [];
    points.forEach(p => allCoords.push([p.lat, p.lng]));
    geometries.forEach(g => g.coordinates.forEach(c => allCoords.push([c.lat, c.lng])));

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      const timer = setTimeout(() => {
        map.invalidateSize();
        const tightZoom = map.getBoundsZoom(bounds, false, L.point(60, 60));
        const upperLimitZoom = Math.max(1, Math.min(18, tightZoom - 1));
        map.setView(bounds.getCenter(), upperLimitZoom);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [points, geometries, map, trigger]);

  return null;
};

const ProjectBoundsFitter = ({ target }: { target: { coords: [number, number][], time: number } | null }) => {
  const map = useMap();

  useEffect(() => {
    if (target && target.coords.length > 0) {
      const bounds = L.latLngBounds(target.coords);
      const timer = setTimeout(() => {
        map.invalidateSize();
        const tightZoom = map.getBoundsZoom(bounds, false, L.point(60, 60));
        const upperLimitZoom = Math.max(1, Math.min(18, tightZoom - 1));
        map.setView(bounds.getCenter(), upperLimitZoom);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [target, map]);

  return null;
};

const MapRotationHandler = ({ mapRotation }: { mapRotation: number }) => {
  const map = useMap();

  useEffect(() => {
    (map as any)._customRotation = mapRotation;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 50);
    return () => clearTimeout(timer);
  }, [map, mapRotation]);

  useEffect(() => {
    if (!map) return;

    // 1. Wrap map.panBy
    const originalPanBy = map.panBy;
    map.panBy = function (offset: L.PointExpression, options?: L.PanOptions) {
      const rotation = (map as any)._customRotation || 0;
      if (rotation % 360 === 0) {
        return originalPanBy.call(this, offset, options);
      }
      const p = L.point(offset);
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const localX = p.x * cos + p.y * sin;
      const localY = -p.x * sin + p.y * cos;

      return originalPanBy.call(this, [localX, localY], options);
    };

    // 2. Patch map.dragging._draggable._onMove
    const dragging = (map as any).dragging;
    if (dragging && dragging._draggable) {
      const draggable = dragging._draggable;

      if (!draggable._originalOnMove) {
        draggable._originalOnMove = draggable._onMove;
      }

      draggable._onMove = function (e: any) {
        if (e.touches && e.touches.length > 1) { return; }

        const rotation = (map as any)._customRotation || 0;

        if (rotation % 360 === 0) {
          draggable._originalOnMove.call(this, e);
          return;
        }

        const first = (e.touches && e.touches.length === 1 ? e.touches[0] : e);
        const point = L.DomEvent.getMousePosition(first, this._container);
        const screenOffset = point.subtract(this._startPoint);

        if (!screenOffset.x && !screenOffset.y) { return; }

        L.DomEvent.stop(e);

        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const localX = screenOffset.x * cos + screenOffset.y * sin;
        const localY = -screenOffset.x * sin + screenOffset.y * cos;

        const localOffset = new L.Point(localX, localY);

        this._newPos = this._startPos.add(localOffset);
        this._moving = true;

        L.Util.cancelAnimFrame(this._animRequest);

        this._lastPoint = point;
        this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true);
      };
    }

    return () => {
      map.panBy = originalPanBy;
      if (dragging && dragging._draggable && dragging._draggable._originalOnMove) {
        dragging._draggable._onMove = dragging._draggable._originalOnMove;
      }
    };
  }, [map]);

  return null;
};

const MapTouchWrapper = ({
  children,
  mapRotation,
  setMapRotation,
  isRotationLocked = true,
  className = "w-full h-full relative overflow-hidden"
}: {
  children: React.ReactNode;
  mapRotation: number;
  setMapRotation: React.Dispatch<React.SetStateAction<number>>;
  isRotationLocked?: boolean;
  className?: string;
}) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ initialAngle: number; startRotation: number } | null>(null);
  const mapRotationRef = useRef(mapRotation);
  const isRotationLockedRef = useRef(isRotationLocked);
  const [isGesturing, setIsGesturing] = useState(false);

  useEffect(() => {
    mapRotationRef.current = mapRotation;
  }, [mapRotation]);

  useEffect(() => {
    isRotationLockedRef.current = isRotationLocked;
  }, [isRotationLocked]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isRotationLockedRef.current) return;
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
        touchStartRef.current = {
          initialAngle: angle,
          startRotation: mapRotationRef.current
        };
        setIsGesturing(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isRotationLockedRef.current) return;
      if (e.touches.length === 2 && touchStartRef.current) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
        let diff = currentAngle - touchStartRef.current.initialAngle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        const newRotation = touchStartRef.current.startRotation + diff;
        touchStartRef.current = {
          initialAngle: currentAngle,
          startRotation: newRotation
        };

        setMapRotation(Math.round(newRotation));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartRef.current = null;
        setIsGesturing(false);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [setMapRotation]);

  return (
    <div ref={containerRef} className={className}>
      <div 
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] overflow-hidden"
        style={{
          transform: `translate(-50%, -50%) rotate(${mapRotation}deg)`,
          transformOrigin: 'center center',
          transition: isGesturing ? 'none' : 'transform 300ms ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

const StakeoutModule: React.FC<Props> = ({ onBack, initialPoint, settings, currentStep, onNavigate }) => {
  const { t } = useLanguage();
  const [view, setView] = useState<'MENU' | 'LIST' | 'MANUAL' | 'MAP' | 'ALL_MAP'>((currentStep as any) || (initialPoint ? 'MAP' : 'MENU'));
  const [allMapZoom, setAllMapZoom] = useState(0);
  const [allMapCenterTrigger, setAllMapCenterTrigger] = useState<{ pos: [number, number], time: number } | null>(null);
  const [currentMapProvider, setCurrentMapProvider] = useState(() => safeStorage.getItem('default_map_provider') || 'Google Hybrid');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapRotation, setMapRotation] = useState<number>(0);
  const [isRotationLocked, setIsRotationLocked] = useState<boolean>(true);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);

  useEffect(() => {
    if (currentStep && currentStep !== view) {
      setView(currentStep as any);
    }
  }, [currentStep]);
  const [sourceView, setSourceView] = useState<'LIST' | 'ALL_MAP' | 'MENU'>(initialPoint ? 'LIST' : 'MENU');
  const [points, setPoints] = useState<StakeoutPoint[]>(() => {
    const saved = safeStorage.getItem('stakeout_points_v1');
    const existingPoints: StakeoutPoint[] = saved ? JSON.parse(saved) : [];
    const normalized = existingPoints.map(p => ({
      ...p,
      projectName: p.projectName ? cleanProjectName(p.projectName) : p.projectName
    }));
    if (initialPoint && !normalized.find((p: StakeoutPoint) => p.id === initialPoint.id)) {
      const normalizedInitial = {
        ...initialPoint,
        projectName: initialPoint.projectName ? cleanProjectName(initialPoint.projectName) : initialPoint.projectName
      };
      return [normalizedInitial, ...normalized];
    }
    return normalized;
  });
  const [geometries, setGeometries] = useState<StakeoutGeometry[]>(() => {
    const saved = safeStorage.getItem('stakeout_geometries_v1');
    const existing: StakeoutGeometry[] = saved ? JSON.parse(saved) : [];
    return existing.map(g => ({
      ...g,
      projectName: g.projectName ? cleanProjectName(g.projectName) : g.projectName
    }));
  });

  const [showProjectLayersMenu, setShowProjectLayersMenu] = useState(false);
  const [hiddenProjects, setHiddenProjects] = useState<string[]>(() => {
    const saved = safeStorage.getItem('stakeout_hidden_projects');
    const parsed: string[] = saved ? JSON.parse(saved) : [];
    return parsed.map(p => cleanProjectName(p));
  });
  const [projectBoundsTrigger, setProjectBoundsTrigger] = useState<{ coords: [number, number][], time: number } | null>(null);
  const [deletingLayer, setDeletingLayer] = useState<string | null>(null);

  useEffect(() => {
    if (deletingLayer) {
      const timer = setTimeout(() => setDeletingLayer(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [deletingLayer]);

  useEffect(() => {
    safeStorage.setItem('stakeout_hidden_projects', JSON.stringify(hiddenProjects));
  }, [hiddenProjects]);

  const manualGroupName = t("Manuel Noktalar");

  const projectLayers = React.useMemo(() => {
    const map = new Map<string, { points: StakeoutPoint[], geometries: StakeoutGeometry[] }>();

    points.forEach(p => {
      const pName = cleanProjectName(p.projectName) || manualGroupName;
      if (!map.has(pName)) map.set(pName, { points: [], geometries: [] });
      map.get(pName)!.points.push(p);
    });

    geometries.forEach(g => {
      const pName = cleanProjectName(g.projectName) || manualGroupName;
      if (!map.has(pName)) map.set(pName, { points: [], geometries: [] });
      map.get(pName)!.geometries.push(g);
    });

    const list: {
      name: string;
      isManual: boolean;
      pointCount: number;
      geometryCount: number;
      visible: boolean;
      boundsCoords: [number, number][];
    }[] = [];

    map.forEach((data, name) => {
      const coords: [number, number][] = [];
      data.points.forEach(p => coords.push([p.lat, p.lng]));
      data.geometries.forEach(g => g.coordinates.forEach(c => coords.push([c.lat, c.lng])));

      list.push({
        name,
        isManual: name === manualGroupName,
        pointCount: data.points.length,
        geometryCount: data.geometries.length,
        visible: !hiddenProjects.includes(name),
        boundsCoords: coords
      });
    });

    return list.sort((a, b) => {
      if (a.isManual) return 1;
      if (b.isManual) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [points, geometries, hiddenProjects, manualGroupName]);

  const visiblePoints = React.useMemo(() => {
    return points.filter(p => !hiddenProjects.includes(cleanProjectName(p.projectName) || manualGroupName));
  }, [points, hiddenProjects, manualGroupName]);

  const visibleGeometriesRaw = React.useMemo(() => {
    return geometries.filter(g => !hiddenProjects.includes(cleanProjectName(g.projectName) || manualGroupName));
  }, [geometries, hiddenProjects, manualGroupName]);

  // Pre-processed coordinates for Leaflet components
  const processedGeometries = React.useMemo(() => {
    return geometries.map(g => ({
      ...g,
      leafletCoords: g.coordinates.map(c => [c.lat, c.lng] as [number, number])
    }));
  }, [geometries]);

  const visibleGeometries = React.useMemo(() => {
    return processedGeometries.filter(g => !hiddenProjects.includes(g.projectName || manualGroupName));
  }, [processedGeometries, hiddenProjects, manualGroupName]);
  const [selectedFeature, setSelectedFeature] = useState<SelectedMapFeature | null>(null);
  const [activePoint, setActivePoint] = useState<StakeoutPoint | null>(initialPoint || null);
  const [confirmClear, setConfirmClear] = useState<'NONE' | 'LIST'>('NONE');
  const [keepScreenOn, setKeepScreenOn] = useState(settings.screenAlwaysOn);
  const [targetReached, setTargetReached] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const wakeLockRef = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerAlert = () => {
    if (!settings.alertsEnabled) return;
    
    // Vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300]);
    }
    
    // Sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitch for target
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio alert failed', e);
    }
  };

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Stakeout Wake Lock is active');
      } catch (err: any) {
        // Iframe içinde veya izin politikası kısıtlı olduğunda bu hata normaldir.
        if (err.name === 'NotAllowedError') {
          console.warn('Stakeout Wake Lock disallowed by permissions policy');
        } else {
          console.error(`Stakeout Wake Lock error: ${err.name}, ${err.message}`);
        }
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Stakeout Wake Lock released');
    }
  };

  useEffect(() => {
    if (keepScreenOn) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [keepScreenOn]);

  useEffect(() => {
    if (confirmClear !== 'NONE') {
      const timer = setTimeout(() => setConfirmClear('NONE'), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmClear]);

  useEffect(() => {
    safeStorage.setItem('stakeout_points_v1', JSON.stringify(points));
  }, [points]);

  useEffect(() => {
    safeStorage.setItem('stakeout_geometries_v1', JSON.stringify(geometries));
  }, [geometries]);
  const [userPos, setUserPos] = useState<Coordinate | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [isInvertedDirections, setIsInvertedDirections] = useState<boolean>(() => {
    return safeStorage.getItem('stakeout_invert_directions') === 'true';
  });

  // Distance Measurement State on ALL_MAP
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  const totalMeasureDistance = React.useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      total += L.latLng(measurePoints[i][0], measurePoints[i][1]).distanceTo(
        L.latLng(measurePoints[i + 1][0], measurePoints[i + 1][1])
      );
    }
    return total;
  }, [measurePoints]);

  useEffect(() => {
    safeStorage.setItem('stakeout_invert_directions', String(isInvertedDirections));
  }, [isInvertedDirections]);

  // Manual Entry State
  const [manualName, setManualName] = useState('');
  const [manualX, setManualX] = useState('');
  const [manualY, setManualY] = useState('');
  const [manualSystem, setManualSystem] = useState('WGS84');
  const [manualZone, setManualZone] = useState('33');

  useEffect(() => {
    if (manualSystem.endsWith('_3')) {
      setManualZone('33');
    } else if (manualSystem.endsWith('_6')) {
      setManualZone('36');
    }
  }, [manualSystem]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          timestamp: pos.timestamp
        });
        if (pos.coords.heading !== null) {
          setHeading(pos.coords.heading);
        }
      },
      (err) => {
        console.error(err);
        if (err.code === 1) {
          showToast(t("Konum izni reddedildi. Lütfen cihaz ayarlarınızdan izin verin."), "error");
        } else {
          showToast(`${t("Konum alınamıyor")}: ${err.message}`, "error");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const webkitHeading = (e as any).webkitCompassHeading;
      if (webkitHeading !== undefined && webkitHeading !== null) {
        setHeading(webkitHeading);
      } else if (e.alpha !== null && e.alpha !== undefined) {
        let compassHeading = (360 - e.alpha) % 360;

        if (e.beta !== null && e.beta !== undefined && e.gamma !== null && e.gamma !== undefined) {
          const _x = (e.beta || 0) * Math.PI / 180;
          const _y = (e.gamma || 0) * Math.PI / 180;
          const _z = (e.alpha || 0) * Math.PI / 180;

          const cX = Math.cos(_x);
          const cY = Math.cos(_y);
          const cZ = Math.cos(_z);
          const sX = Math.sin(_x);
          const sY = Math.sin(_y);
          const sZ = Math.sin(_z);

          const Vx = -cZ * sY - sZ * sX * cY;
          const Vy = -sZ * sY + cZ * sX * cY;

          let tiltHeading = Math.atan2(Vx, Vy) * (180 / Math.PI);
          if (tiltHeading < 0) tiltHeading += 360;
          if (!isNaN(tiltHeading) && isFinite(tiltHeading)) {
            compassHeading = tiltHeading;
          }
        }

        setHeading(compassHeading);
      }
    };

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    }
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if ('ondeviceorientationabsolute' in window) {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleKmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isKmz = fileName.endsWith('.kmz') || file.type === 'application/vnd.google-earth.kmz' || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
    
    if (isKmz) {
      try {
        const zip = new JSZip();
        // Using arrayBuffer() is more robust on some mobile browsers
        const arrayBuffer = await file.arrayBuffer();
        const contents = await zip.loadAsync(arrayBuffer);
        const kmlFiles = Object.keys(contents.files).filter(name => name.toLowerCase().endsWith('.kml'));
        
        if (kmlFiles.length > 0) {
          let totalPoints: StakeoutPoint[] = [];
          let totalGeometries: StakeoutGeometry[] = [];
          
          for (const kmlFileName of kmlFiles) {
            const kmlText = await contents.files[kmlFileName].async('string');
            const cleanBase = cleanProjectName(file.name);
            const cleanSub = cleanProjectName(kmlFileName);
            const projectName = kmlFiles.length === 1 ? cleanBase : `${cleanBase} (${cleanSub})`;
            const result = parseKML(kmlText, projectName);
            totalPoints = [...totalPoints, ...result.points];
            totalGeometries = [...totalGeometries, ...result.geometries];
          }
          
          if (totalPoints.length > 0 || totalGeometries.length > 0) {
            setPoints(prev => [...prev, ...totalPoints]);
            setGeometries(prev => [...prev, ...totalGeometries]);
            showToast(`${totalPoints.length} ${t("nokta ve")} ${totalGeometries.length} ${t("geometri yüklendi")}`, "success");
          } else {
            showToast(t("KML dosyaları içerisinde veri bulunamadı."), "info");
          }
        } else {
          showToast(t("KMZ dosyası içerisinde KML bulunamadı."), "error");
        }
      } catch (err) {
        console.error("KMZ okuma hatası:", err);
        showToast(t("KMZ dosyası okunamadı."), "error");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const result = parseKML(text, cleanProjectName(file.name));
        setPoints(prev => [...prev, ...result.points]);
        setGeometries(prev => [...prev, ...result.geometries]);
        showToast(t("KML/KMZ dosya yüklendi"), "success");
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteProjectLayer = (layerName: string) => {
    setPoints(prev => prev.filter(p => (cleanProjectName(p.projectName) || manualGroupName) !== layerName));
    setGeometries(prev => prev.filter(g => (cleanProjectName(g.projectName) || manualGroupName) !== layerName));
    setHiddenProjects(prev => prev.filter(n => n !== layerName));
    if (activePoint && (cleanProjectName(activePoint.projectName) || manualGroupName) === layerName) {
      setActivePoint(null);
    }
    setDeletingLayer(null);
    showToast(`"${layerName}" ${t("katmanı silindi.")}`, "success");
  };

  const handleAddManual = () => {
    if (!manualName || !manualX || !manualY) return;

    let lat = 0, lng = 0;
    if (manualSystem === 'WGS84') {
      lat = parseFloat(manualX);
      lng = parseFloat(manualY);
    } else {
      const zoneVal = parseInt(manualZone);
      const wgs = convertToWGS84(parseFloat(manualX), parseFloat(manualY), manualSystem, zoneVal);
      lat = wgs.lat;
      lng = wgs.lng;
    }

    if (isNaN(lat) || isNaN(lng)) {
      showToast(t("Geçersiz koordinat girişi."), "error");
      return;
    }

    const newPoint: StakeoutPoint = {
      id: `manual-${Date.now()}`,
      name: manualName,
      lat,
      lng,
      coordinateSystem: manualSystem,
      originalX: parseFloat(manualX),
      originalY: parseFloat(manualY),
      projectName: t("Manuel Noktalar")
    };

    setPoints(prev => [...prev, newPoint]);
    setManualName('');
    setManualX('');
    setManualY('');
    onNavigate('LIST');
  };

  const calculateGuidance = () => {
    if (!userPos || !activePoint) return null;

    const R = 6371e3;
    const φ1 = userPos.lat * Math.PI/180;
    const φ2 = activePoint.lat * Math.PI/180;
    const Δφ = (activePoint.lat - userPos.lat) * Math.PI/180;
    const Δλ = (activePoint.lng - userPos.lng) * Math.PI/180;

    // North/South distance (approx)
    const distNS = Δφ * R;
    // East/West distance (approx)
    const distEW = Δλ * R * Math.cos(φ1);

    const totalDist = Math.sqrt(distNS * distNS + distEW * distEW);

    let forward = distNS;
    let right = distEW;

    let effectiveHeading = heading;
    if (effectiveHeading !== null && isInvertedDirections) {
      effectiveHeading = (effectiveHeading + 180) % 360;
    }

    if (effectiveHeading !== null) {
      const rad = effectiveHeading * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      
      // Rotate coordinates based on effective heading (clockwise from North)
      forward = distNS * cos + distEW * sin;
      right = distEW * cos - distNS * sin;
    }

    return {
      totalDist,
      forward,
      right,
      north: distNS,
      east: distEW
    };
  };

  const guidance = calculateGuidance();

  useEffect(() => {
    if (guidance && guidance.totalDist < 2.0 && !targetReached) {
      setTargetReached(true);
      triggerAlert();
    } else if (guidance && guidance.totalDist >= 2.0) {
      setTargetReached(false);
    }
  }, [guidance?.totalDist, targetReached]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-200">
      <style>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
      {view !== 'MAP' && view !== 'ALL_MAP' && (
        <Header 
          title={view === 'MENU' ? t('Aplikasyon Yap') : 
                 view === 'LIST' ? t('Nokta Listesi') : 
                 view === 'MANUAL' ? t('Manuel Ekle') : t('Aplikasyon Ekranı')} 
          onBack={() => {
            window.history.back();
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-in slide-in-from-top-full duration-500">
          <div className={`bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl p-4 flex items-center gap-4 ${toast.type === 'error' ? 'border-rose-200' : toast.type === 'info' ? 'border-blue-200' : 'border-emerald-200'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-rose-100 text-rose-600' : toast.type === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <i className={`fas ${toast.type === 'error' ? 'fa-circle-exclamation' : toast.type === 'info' ? 'fa-circle-info' : 'fa-circle-check'} text-xl`}></i>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {toast.type === 'error' ? t('Hata') : toast.type === 'info' ? t('Bilgi') : t('Başarılı')}
              </h4>
              <p className="text-[11px] text-slate-500 font-bold leading-tight mt-0.5">{toast.message}</p>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${toast.type === 'error' ? 'bg-rose-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {view === 'MENU' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar px-8">
              <div className="py-8 pt-4 space-y-4 max-w-sm mx-auto w-full">
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => onNavigate('MANUAL')} className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-keyboard text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("Manuel Koordinat Ekle")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("El ile Giriş")}</span>
                    </div>
                  </button>
  
                  <label className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-file-import text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("KML / KMZ Yükle")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("Dosyadan Aktar")}</span>
                    </div>
                      <input 
                        type="file" 
                        accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz,application/zip,application/x-zip-compressed,application/octet-stream" 
                        onChange={handleKmlUpload} 
                        className="hidden" 
                      />
                  </label>
  
                  <button onClick={() => onNavigate('LIST')} className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 active:scale-[0.98] transition-all">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-list-ul text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("Nokta Listesini Gör")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{points.length} {t("Nokta Hazır")}</span>
                    </div>
                  </button>
  
                  <button 
                    onClick={() => {
                      if (points.length === 0 && geometries.length === 0) showToast(t("Haritada gösterilecek veri bulunamadı."), "info");
                      else onNavigate('ALL_MAP');
                    }} 
                    className="w-full py-2.5 md:py-3.5 px-5 bg-slate-100 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 active:scale-[0.98] transition-all"
                  >
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                      <i className="fas fa-map-marked-alt text-xl"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-slate-900 block">{t("Harita Üzerinde Gör")}</span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{points.length} {t("Nokta")}, {geometries.length} {t("Geometri")}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {view === 'LIST' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar px-8">
              <div className="py-8 pt-4 space-y-4 max-w-sm mx-auto w-full">
                {points.length === 0 ? (
                  <div className="p-12 text-center bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
                    <i className="fas fa-ghost text-3xl text-slate-200"></i>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t("Liste Boş")}</p>
                  </div>
                ) : (
                  points.map(p => (
                    <div key={p.id} className="soft-card py-3 md:py-4 px-5 flex items-center justify-between group">
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-800">{p.name}</h4>
                            {p.projectName && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 max-w-[120px] truncate">
                                {p.projectName}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            {(() => {
                              const { x, y, labelX, labelY } = convertCoordinate(p.lat, p.lng, p.coordinateSystem || 'WGS84');
                              const isUTM = p.coordinateSystem && p.coordinateSystem !== 'WGS84';
                              const precision = isUTM ? 3 : 8;
                              return (
                                <>
                                  <p className="text-[10px] font-bold text-slate-400 mono-font">
                                    {t(labelX)}: {x.toFixed(precision)}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 mono-font">
                                    {t(labelY)}: {y.toFixed(precision)}
                                  </p>
                                </>
                              );
                            })()}
                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">
                              {p.coordinateSystem?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { 
                            setSourceView('LIST');
                            setActivePoint(p); 
                            onNavigate('MAP'); 
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all"
                        >
                          {t("GİT")}
                        </button>
                        <button 
                          onClick={() => setPoints(prev => prev.filter(pt => pt.id !== p.id))}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button 
                  onClick={() => { 
                    if (confirmClear === 'LIST') {
                      localStorage.removeItem('stakeout_points_v1');
                      localStorage.removeItem('stakeout_geometries_v1');
                      setPoints([]); 
                      setGeometries([]); 
                      setConfirmClear('NONE');
                    } else {
                      setConfirmClear('LIST');
                    }
                  }}
                  className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${confirmClear === 'LIST' ? 'text-red-600 bg-red-100 rounded-2xl' : 'text-slate-400 hover:text-red-500'}`}
                >
                  {confirmClear === 'LIST' ? t('EMİN MİSİNİZ? (TEKRAR TIKLAYIN)') : t('LİSTEYİ TEMİZLE')}
                </button>
              </div>
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {view === 'MANUAL' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar px-8">
              <div className="py-8 pt-4 mx-auto max-w-sm w-full">
                <div className="soft-card p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Nokta Adı")}</label>
                    <input type="text" value={manualName} onChange={e => setManualName(e.target.value)} placeholder={t("Örn: P1")} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("Koordinat Sistemi")}</label>
                    <select value={manualSystem} onChange={e => setManualSystem(e.target.value)} className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none">
                      <option value="WGS84">{t("WGS84 (Enlem-Boylam)")}</option>
                      <option value="ITRF96_3">{t("ITRF96 - 3° - TM")}</option>
                      <option value="ITRF96_6">{t("ITRF96 - 6° - UTM")}</option>
                      <option value="ED50_3">{t("ED50 - 3° - TM")}</option>
                      <option value="ED50_6">{t("ED50 - 6° - UTM")}</option>
                    </select>
                  </div>

                  {manualSystem !== 'WGS84' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {manualSystem.endsWith('_3') ? t('Dilim Orta Meridyeni (DOM)') : t('UTM Zon (6°)')}
                      </label>
                      <select 
                        value={manualZone} 
                        onChange={e => setManualZone(e.target.value)} 
                        className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none appearance-none"
                      >
                        {manualSystem.endsWith('_3') ? (
                           <>
                             <option value="27">27° (DOM)</option>
                             <option value="30">30° (DOM)</option>
                             <option value="33">33° (DOM)</option>
                             <option value="36">36° (DOM)</option>
                             <option value="39">39° (DOM)</option>
                             <option value="42">42° (DOM)</option>
                             <option value="45">45° (DOM)</option>
                           </>
                        ) : (
                           <>
                             <option value="35">35 (Zon)</option>
                             <option value="36">36 (Zon)</option>
                             <option value="37">37 (Zon)</option>
                             <option value="38">38 (Zon)</option>
                           </>
                        )}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {manualSystem === 'WGS84' ? t('Enlem (N/X)') : t('Sağa (E/Y)')}
                      </label>
                      <input type="number" value={manualX} onChange={e => setManualX(e.target.value)} placeholder="0.000" className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                        {manualSystem === 'WGS84' ? t('Boylam (E/Y)') : t('Yukarı (N/X)')}
                      </label>
                      <input type="number" value={manualY} onChange={e => setManualY(e.target.value)} placeholder="0.000" className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all" />
                    </div>
                  </div>
                  <button onClick={handleAddManual} className="w-full py-2.5 md:py-3.5 px-5 bg-blue-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
                    {t("LİSTEYE EKLE")}
                  </button>
                </div>
              </div>
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {view === 'ALL_MAP' && (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 relative z-10">
              {/* Back Button on top-left - aligned with standard Header position (top-4 left-4 sm:left-8) */}
              <div className="absolute top-4 left-4 sm:left-8 z-[10000] flex items-center">
                <button 
                  onClick={() => {
                    window.history.back();
                  }}
                  className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-90 transition-all cursor-pointer border border-slate-100"
                  title={t("Çıkış")}
                >
                  <i className="fas fa-chevron-left text-sm"></i>
                </button>
              </div>

              {/* Symmetrical Controls on the top-right - aligned and vertically centered with the back button */}
              <div className="absolute top-4 right-2 min-[360px]:right-3 min-[400px]:right-4 sm:right-8 z-[10000] flex flex-col items-end gap-1 sm:gap-2">
                <div className="h-12 flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-2">
                  {/* Distance Measurement Button (Kuzey oku kilitleme butonunun solunda) */}
                  <button 
                    onClick={() => {
                      setShowLayerMenu(false);
                      setShowProjectLayersMenu(false);
                      setIsMeasuring(prev => !prev);
                    }}
                    className={`w-8.5 h-8.5 min-[360px]:w-9.5 min-[360px]:h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer border relative ${
                      isMeasuring 
                        ? 'border-amber-500 text-amber-600 bg-amber-50/90 ring-2 ring-amber-500/30' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={isMeasuring ? t("Mesafe Ölçümünü Kapat") : t("Mesafe Ölçümü")}
                  >
                    <i className="fas fa-ruler-combined text-xs min-[360px]:text-sm sm:text-base md:text-lg"></i>
                    {measurePoints.length > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-3 h-3 min-[360px]:min-w-3.5 min-[360px]:h-3.5 sm:min-w-4 sm:h-4 px-0.5 sm:px-1 rounded-full bg-amber-500 text-white text-[6.5px] min-[360px]:text-[7px] sm:text-[8px] font-black flex items-center justify-center shadow border border-white">
                        {measurePoints.length}
                      </div>
                    )}
                  </button>

                  {/* Compass / Rotation Lock Button */}
                  <button 
                    onClick={() => {
                      setShowLayerMenu(false);
                      setShowProjectLayersMenu(false);
                      if (isRotationLocked) {
                        setIsRotationLocked(false);
                      } else {
                        setIsRotationLocked(true);
                        setMapRotation(0);
                      }
                    }}
                    className={`w-8.5 h-8.5 min-[360px]:w-9.5 min-[360px]:h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer border relative ${
                      !isRotationLocked 
                        ? 'border-blue-500 text-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={isRotationLocked ? t("Harita Döndürme Kilitli") : t("Harita Döndürme Serbest")}
                  >
                    <div 
                      className="transition-transform duration-300 ease-out flex items-center justify-center relative w-4.5 h-4.5 min-[360px]:w-5 min-[360px]:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6"
                      style={{ transform: `rotate(${-mapRotation}deg)` }}
                    >
                      <svg className="w-4.5 h-4.5 min-[360px]:w-5 min-[360px]:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 drop-shadow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.5 12H8.5L12 2Z" fill="#EF4444" />
                        <path d="M12 22L8.5 12H15.5L12 22Z" fill="#94A3B8" />
                        <circle cx="12" cy="12" r="1.5" fill="#0F172A" />
                      </svg>
                      <span className="absolute -top-1 sm:-top-1.5 text-[5.5px] min-[360px]:text-[6px] sm:text-[7px] font-black text-red-600 select-none">K</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[6px] min-[360px]:text-[7px] sm:text-[8px] shadow border ${
                      isRotationLocked ? 'bg-red-500 text-white border-white' : 'bg-emerald-500 text-white border-white'
                    }`}>
                      <i className={`fas ${isRotationLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                    </div>
                  </button>

                  {/* Fit to Project Bounds Button */}
                  <button 
                    onClick={() => {
                      setShowLayerMenu(false);
                      setShowProjectLayersMenu(false);
                      setFitBoundsTrigger(prev => prev + 1);
                    }}
                    className="w-8.5 h-8.5 min-[360px]:w-9.5 min-[360px]:h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl text-slate-900 active:scale-90 transition-all cursor-pointer border border-slate-200/80"
                    title={t("Proje Sınırlarına Odaklan")}
                  >
                    <i className="fas fa-expand text-xs min-[360px]:text-sm sm:text-base md:text-lg"></i>
                  </button>

                  {/* Zoom to Current User Location Button */}
                  <button 
                    onClick={() => {
                      setShowLayerMenu(false);
                      setShowProjectLayersMenu(false);
                      if (userPos && userPos.lat && userPos.lng) {
                        setAllMapCenterTrigger({ pos: [userPos.lat, userPos.lng], time: Date.now() });
                      } else {
                        if (navigator.geolocation) {
                          showToast(t("Konum alınıyor..."), "info");
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const newPos = {
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude,
                                accuracy: pos.coords.accuracy,
                                altitude: pos.coords.altitude,
                                altitudeAccuracy: pos.coords.altitudeAccuracy,
                                timestamp: pos.timestamp
                              };
                              setUserPos(newPos);
                              setAllMapCenterTrigger({ pos: [newPos.lat, newPos.lng], time: Date.now() });
                            },
                            (err) => {
                              console.error(err);
                              showToast(t("Konum verisi alınamadı"), "error");
                            },
                            { enableHighAccuracy: true, timeout: 5000 }
                          );
                        } else {
                          showToast(t("Cihazınızda konum desteği bulunmuyor"), "error");
                        }
                      }
                    }}
                    className="w-8.5 h-8.5 min-[360px]:w-9.5 min-[360px]:h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl text-blue-600 hover:text-blue-700 active:scale-90 transition-all cursor-pointer border border-slate-200/80"
                    title={t("Konuma Git")}
                  >
                    <i className="fas fa-crosshairs text-xs min-[360px]:text-sm sm:text-base md:text-lg"></i>
                  </button>

                  {/* Project Layers Button */}
                  <button 
                    onClick={() => {
                      setShowLayerMenu(false);
                      setIsMeasuring(false);
                      setShowProjectLayersMenu(prev => !prev);
                    }}
                    className={`w-8.5 h-8.5 min-[360px]:w-9.5 min-[360px]:h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer border relative ${
                      showProjectLayersMenu
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500/20'
                        : projectLayers.length > 0 && hiddenProjects.length > 0
                        ? 'border-indigo-300 text-indigo-600'
                        : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                    title={t("Proje Katmanları")}
                  >
                    <i className="fas fa-folder-tree text-xs min-[360px]:text-sm sm:text-base md:text-lg"></i>
                    {projectLayers.length > 0 && (
                      <div className={`absolute -top-1 -right-1 min-w-3 h-3 min-[360px]:min-w-3.5 min-[360px]:h-3.5 sm:min-w-4 sm:h-4 px-0.5 sm:px-1 rounded-full text-white text-[6.5px] min-[360px]:text-[7px] sm:text-[8px] font-black flex items-center justify-center shadow border border-white ${
                        hiddenProjects.length > 0 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}>
                        {projectLayers.filter(l => l.visible).length}/{projectLayers.length}
                      </div>
                    )}
                  </button>

                  {/* Layer Selector Button */}
                  <button 
                    onClick={() => {
                      setShowProjectLayersMenu(false);
                      setIsMeasuring(false);
                      setShowLayerMenu(!showLayerMenu);
                    }}
                    className={`w-8.5 h-8.5 min-[360px]:w-9.5 min-[360px]:h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer border ${
                      showLayerMenu
                        ? 'border-blue-500 text-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-900 hover:bg-slate-50'
                    }`}
                    title={t("Harita Kaynağı")}
                  >
                    <i className="fas fa-layer-group text-xs min-[360px]:text-sm sm:text-base md:text-lg"></i>
                  </button>
                </div>

                {/* Project Layers Dropdown Menu */}
                {showProjectLayersMenu && (
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 w-[275px] min-[390px]:w-[290px] sm:w-[310px] max-w-[calc(100vw-6rem)] sm:max-w-[calc(100vw-8rem)] text-slate-900 select-none animate-in fade-in slide-in-from-top-2 duration-150 max-h-[50vh]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">
                          <i className="fas fa-folder-tree"></i>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 leading-none">
                          {t("Proje Katmanları")}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                          {projectLayers.filter(l => l.visible).length}/{projectLayers.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowProjectLayersMenu(false)}
                        className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>

                    {/* Add New Project (KML/KMZ) Button */}
                    <label className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-2xs">
                      <i className="fas fa-plus-circle text-xs"></i>
                      <span>{t("Yeni Proje Ekle (KML/KMZ)")}</span>
                      <input 
                        type="file" 
                        accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz,application/zip,application/x-zip-compressed,application/octet-stream" 
                        onChange={(e) => {
                          handleKmlUpload(e);
                          e.target.value = '';
                        }} 
                        className="hidden" 
                      />
                    </label>

                    {/* Quick Visibility Controls */}
                    {projectLayers.length > 1 && (
                      <div className="flex items-center gap-1.5 px-0.5">
                        <button
                          onClick={() => setHiddenProjects([])}
                          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-[10px] font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <i className="fas fa-eye text-[9px]"></i>
                          {t("Tümünü Göster")}
                        </button>
                        <button
                          onClick={() => setHiddenProjects(projectLayers.map(l => l.name))}
                          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl text-[10px] font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <i className="fas fa-eye-slash text-[9px]"></i>
                          {t("Tümünü Gizle")}
                        </button>
                      </div>
                    )}

                    {/* Project List */}
                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[28vh] pr-0.5 custom-scrollbar">
                      {projectLayers.length === 0 ? (
                        <div className="py-5 text-center text-slate-400">
                          <i className="fas fa-folder-open text-xl mb-1.5 opacity-40"></i>
                          <p className="text-[11px] font-semibold">{t("Henüz yüklenmiş proje veya nokta yok.")}</p>
                        </div>
                      ) : (
                        projectLayers.map((layer) => (
                          <div
                            key={layer.name}
                            className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                              layer.visible 
                                ? 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/90' 
                                : 'bg-slate-50/40 border-slate-100 opacity-60'
                            }`}
                          >
                            <button
                              onClick={() => {
                                setHiddenProjects(prev => 
                                  layer.visible ? [...prev, layer.name] : prev.filter(n => n !== layer.name)
                                );
                              }}
                              className={`w-7.5 h-7.5 min-[390px]:w-8 min-[390px]:h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
                                layer.visible 
                                  ? layer.isManual ? 'bg-emerald-500 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                              title={layer.visible ? t("Katmanı Gizle") : t("Katmanı Göster")}
                            >
                              <i className={`fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                            </button>

                            <div 
                              className="flex-1 min-w-0 cursor-pointer py-0.5"
                              onClick={() => {
                                setHiddenProjects(prev => 
                                  layer.visible ? [...prev, layer.name] : prev.filter(n => n !== layer.name)
                                );
                              }}
                            >
                              <div className="flex items-start gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${layer.isManual ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                                <p className="text-[11px] font-bold text-slate-800 break-words [word-break:break-word] leading-snug" title={layer.name}>
                                  {layer.name}
                                </p>
                              </div>
                              <p className="text-[9.5px] text-slate-400 font-medium ml-3">
                                {layer.pointCount > 0 && `${layer.pointCount} ${t("nokta")}`}
                                {layer.pointCount > 0 && layer.geometryCount > 0 && ' · '}
                                {layer.geometryCount > 0 && `${layer.geometryCount} ${t("geometri")}`}
                              </p>
                            </div>

                            {deletingLayer === layer.name ? (
                              <div className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProjectLayer(layer.name);
                                  }}
                                  className="h-7.5 min-[390px]:h-8 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10.5px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                  title={t("Silmeyi Onayla")}
                                >
                                  <i className="fas fa-trash-alt text-[9.5px]"></i>
                                  <span>{t("Sil")}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingLayer(null);
                                  }}
                                  className="w-7.5 h-7.5 min-[390px]:w-8 min-[390px]:h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                                  title={t("İptal")}
                                >
                                  <i className="fas fa-times text-xs"></i>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                {layer.boundsCoords.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!layer.visible) {
                                        setHiddenProjects(prev => prev.filter(n => n !== layer.name));
                                      }
                                      setProjectBoundsTrigger({ coords: layer.boundsCoords, time: Date.now() });
                                    }}
                                    className="w-7.5 h-7.5 min-[390px]:w-8 min-[390px]:h-8 rounded-lg bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/90 hover:border-indigo-200 shadow-xs flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer"
                                    title={t("Projeye Odaklan")}
                                  >
                                    <i className="fas fa-crosshairs text-xs"></i>
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingLayer(layer.name);
                                  }}
                                  className="w-7.5 h-7.5 min-[390px]:w-8 min-[390px]:h-8 rounded-lg bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200/90 hover:border-red-200 shadow-xs flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer"
                                  title={t("Katmanı Sil")}
                                >
                                  <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Layer Selector Dropdown Menu */}
                {showLayerMenu && (
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1 w-52 max-w-[calc(100vw-6rem)] sm:max-w-[calc(100vw-8rem)] text-slate-900 select-none animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                          <i className="fas fa-layer-group"></i>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 leading-none">
                          {t("Harita Kaynağı")}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowLayerMenu(false)}
                        className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    </div>
                    {[
                      { value: 'Google Hybrid', label: t("1-Google Hibrit") },
                      { value: 'Google Satellite', label: t("2-Google Satellite") },
                      { value: 'OpenTopoMap', label: t("3-Open Topo Map") },
                      { value: 'Esri World Imagery', label: t("4-Esri World Imagery") },
                      { value: 'Bing Satellite', label: t("5-Bing Satellite") },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setCurrentMapProvider(opt.value);
                          safeStorage.setItem('default_map_provider', opt.value);
                          setShowLayerMenu(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight text-left transition-all active:scale-95 cursor-pointer ${
                          currentMapProvider === opt.value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {currentMapProvider === opt.value && (
                          <i className="fas fa-check text-[10px] text-white shrink-0 ml-1.5"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Floating Compact Distance Measurement Pill */}
              {isMeasuring && (
                <div className="absolute top-16 right-2 min-[360px]:right-3 min-[400px]:right-4 sm:right-8 z-[10000] bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-slate-200/90 flex flex-col gap-1.5 w-60 max-w-[calc(100vw-6rem)] sm:max-w-[calc(100vw-8rem)] text-slate-900 select-none animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-[10px]">
                        <i className="fas fa-ruler-combined"></i>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 leading-none">
                        {t("Mesafe Ölçümü")}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMeasuring(false)}
                      className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <i className="fas fa-times text-[10px]"></i>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/60 rounded-xl px-2.5 py-1.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">
                        {t("Toplam Mesafe")}
                      </span>
                      <span className="text-sm font-black text-amber-950 mono-font tracking-tight">
                        {totalMeasureDistance >= 1000
                          ? `${(totalMeasureDistance / 1000).toFixed(2)} km`
                          : `${totalMeasureDistance.toFixed(1)} m`}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-amber-700 bg-white/80 px-2 py-0.5 rounded-full border border-amber-200/80">
                      {measurePoints.length === 0 ? t("Nokta seçin") : `${measurePoints.length} ${t("nokta")}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 pt-0.5">
                    <button
                      disabled={measurePoints.length === 0}
                      onClick={() => setMeasurePoints(prev => prev.slice(0, -1))}
                      className="flex-1 py-1 px-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-[9.5px] font-bold text-slate-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <i className="fas fa-undo text-[8px]"></i>
                      {t("Geri Al")}
                    </button>
                    <button
                      disabled={measurePoints.length === 0}
                      onClick={() => setMeasurePoints([])}
                      className="flex-1 py-1 px-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-[9.5px] font-bold text-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <i className="fas fa-trash-alt text-[8px]"></i>
                      {t("Sıfırla")}
                    </button>
                  </div>
                </div>
              )}

              <MapTouchWrapper
                mapRotation={mapRotation}
                setMapRotation={setMapRotation}
                isRotationLocked={isRotationLocked}
              >
                <MapContainer 
                  center={[userPos?.lat || 39, userPos?.lng || 35]} 
                  zoom={19} 
                  maxZoom={22}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                  preferCanvas={true}
                >
                {currentMapProvider === 'Bing Satellite' ? (
                  <BingTileLayer />
                ) : (
                  <TileLayer
                    url={getTileLayer(currentMapProvider).url}
                    attribution={getTileLayer(currentMapProvider).attribution}
                    maxZoom={22}
                    maxNativeZoom={getTileLayer(currentMapProvider).maxNativeZoom}
                    tms={getTileLayer(currentMapProvider).tms}
                  />
                )}
                
                {visibleGeometries.map(g => {
                  const isSelectedLine = selectedFeature?.type === 'LINE' && selectedFeature.geometry.id === g.id;
                  const isSelectedPolygon = selectedFeature?.type === 'POLYGON' && selectedFeature.geometry.id === g.id;

                  return (
                    <React.Fragment key={g.id}>
                      {g.type === 'LineString' ? (
                        <Polyline 
                          positions={g.leafletCoords} 
                          pathOptions={{ 
                            color: isSelectedLine ? '#06b6d4' : (g.color || '#3b82f6'), 
                            weight: isSelectedLine ? 6 : 3,
                            opacity: isSelectedLine ? 1 : 0.85
                          }} 
                          eventHandlers={{
                            click: (e) => {
                              if (isMeasuring) return;
                              L.DomEvent.stopPropagation(e);
                              const length = calculatePolylineLength(g.coordinates);
                              setSelectedFeature({
                                type: 'LINE',
                                geometry: g,
                                length
                              });
                            }
                          }}
                        />
                      ) : (
                        <Polygon 
                          positions={g.leafletCoords} 
                          pathOptions={{ 
                            color: isSelectedPolygon ? '#059669' : (g.color || '#3b82f6'), 
                            fillColor: isSelectedPolygon ? '#10b981' : (g.color || '#3b82f6'), 
                            fillOpacity: isSelectedPolygon ? 0.4 : 0.12, 
                            weight: isSelectedPolygon ? 3.5 : 2 
                          }} 
                          eventHandlers={{
                            click: (e) => {
                              if (isMeasuring) return;
                              L.DomEvent.stopPropagation(e);
                              const area = calculatePolygonArea(g.coordinates);
                              const perimeter = calculatePolygonPerimeter(g.coordinates);
                              setSelectedFeature({
                                type: 'POLYGON',
                                geometry: g,
                                area,
                                perimeter
                              });
                            }
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}

                <LazyVertexLayer 
                  geometries={visibleGeometriesRaw} 
                  zoom={allMapZoom} 
                  selectedVertexPointId={
                    selectedFeature?.type === 'POINT' && selectedFeature.isVertex
                      ? selectedFeature.point.id
                      : undefined
                  }
                  onVertexSelect={(g, c, idx) => {
                    if (isMeasuring) {
                      setMeasurePoints(prev => [...prev, [c.lat, c.lng]]);
                      return;
                    }
                    const newPt: StakeoutPoint = {
                      id: `snap-${g.id}-${idx}`,
                      name: `${g.name || t("Geometri")} - ${t("Köşe")} ${idx + 1}`,
                      lat: c.lat,
                      lng: c.lng,
                      coordinateSystem: 'WGS84',
                      originalX: c.lat,
                      originalY: c.lng,
                      altitude: c.altitude,
                      projectName: g.projectName || manualGroupName,
                      color: g.color
                    };
                    setSelectedFeature({
                      type: 'POINT',
                      point: newPt,
                      isVertex: true,
                      vertexIndex: idx,
                      parentGeometryName: g.name
                    });
                  }}
                />

                {visiblePoints.map(p => (
                  <StakeoutMarker 
                    key={p.id} 
                    p={p} 
                    zoom={allMapZoom} 
                    isSelected={selectedFeature?.type === 'POINT' && selectedFeature.point.id === p.id}
                    onSelect={(pt) => {
                      if (isMeasuring) {
                        setMeasurePoints(prev => [...prev, [pt.lat, pt.lng]]);
                        return;
                      }
                      setSelectedFeature({
                        type: 'POINT',
                        point: pt
                      });
                    }}
                    onGo={(pt) => {
                      if (isMeasuring) {
                        setMeasurePoints(prev => [...prev, [pt.lat, pt.lng]]);
                        return;
                      }
                      setSourceView('ALL_MAP');
                      setActivePoint(pt); 
                      onNavigate('MAP'); 
                    }}
                  />
                ))}

                {/* Selected Point Highlight Halo */}
                {selectedFeature?.type === 'POINT' && (
                  <CircleMarker
                    center={[selectedFeature.point.lat, selectedFeature.point.lng]}
                    radius={13}
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#60a5fa',
                      fillOpacity: 0.4,
                      weight: 3,
                      dashArray: '3, 4'
                    }}
                  />
                )}

                {/* Measurement Path Polyline */}
                {measurePoints.length > 1 && (
                  <Polyline 
                    positions={measurePoints} 
                    pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '6, 8', opacity: 0.95 }} 
                  />
                )}

                {/* Measurement Point Markers */}
                {measurePoints.map((pt, idx) => (
                  <Marker 
                    key={`measure-pt-${idx}`} 
                    position={pt}
                    icon={L.divIcon({
                      className: 'measure-vertex-marker',
                      html: `<div style="
                        width: 22px;
                        height: 22px;
                        background: ${idx === 0 ? '#10b981' : idx === measurePoints.length - 1 ? '#ef4444' : '#f59e0b'};
                        border: 2px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 900;
                        font-size: 10px;
                        color: white;
                        font-family: monospace;
                      ">${idx + 1}</div>`,
                      iconSize: [22, 22],
                      iconAnchor: [11, 11]
                    })}
                  />
                ))}

                {/* Segment Distance Badges */}
                {measurePoints.length > 1 && measurePoints.slice(0, -1).map((p1, idx) => {
                  const p2 = measurePoints[idx + 1];
                  const segDist = L.latLng(p1[0], p1[1]).distanceTo(L.latLng(p2[0], p2[1]));
                  const midLat = (p1[0] + p2[0]) / 2;
                  const midLng = (p1[1] + p2[1]) / 2;
                  return (
                    <Marker
                      key={`measure-seg-${idx}`}
                      position={[midLat, midLng]}
                      icon={L.divIcon({
                        className: 'measure-seg-label',
                        html: `<div style="
                          background: rgba(15, 23, 42, 0.9);
                          color: #fde047;
                          font-size: 9px;
                          font-weight: 800;
                          padding: 1px 5px;
                          border-radius: 9999px;
                          border: 1px solid rgba(255,255,255,0.3);
                          white-space: nowrap;
                          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                          transform: translate(-50%, -50%);
                          font-family: monospace;
                        ">${segDist >= 1000 ? `${(segDist / 1000).toFixed(2)} km` : `${segDist.toFixed(1)} m`}</div>`,
                        iconSize: [0, 0],
                        iconAnchor: [0, 0]
                      })}
                    />
                  );
                })}

                <MapMeasurementHandler 
                  isMeasuring={isMeasuring} 
                  onMapClick={(lat, lng) => setMeasurePoints(prev => [...prev, [lat, lng]])} 
                  onDeselect={() => setSelectedFeature(null)}
                />

                {userPos && (
                  <>
                    <Circle 
                      center={[userPos.lat, userPos.lng]} 
                      radius={userPos.accuracy} 
                      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.5 }} 
                    />
                    <Marker 
                      position={[userPos.lat, userPos.lng]} 
                      icon={L.divIcon({
                        className: 'user-marker',
                        html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); transform: rotate(${heading || 0}deg);">
                                <div style="position: absolute; top: -10px; left: 5px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 10px solid #3b82f6;"></div>
                               </div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                      })}
                    />
                  </>
                )}
                <MapRotationHandler mapRotation={mapRotation} />
                <BoundsUpdater points={visiblePoints} geometries={visibleGeometriesRaw} trigger={fitBoundsTrigger} />
                <ProjectBoundsFitter target={projectBoundsTrigger} />
                <ZoomTracker onZoomChange={setAllMapZoom} />
                <MapCenterer trigger={allMapCenterTrigger} />
              </MapContainer>
            </MapTouchWrapper>

            {/* Floating Compact Info Card */}
            {selectedFeature && (
              <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-[380px] z-[10000] pointer-events-auto">
                <CompactBottomInfoCard
                  feature={selectedFeature}
                  settings={settings}
                  onClose={() => setSelectedFeature(null)}
                  onStakeout={(pt) => {
                    setSourceView('ALL_MAP');
                    setActivePoint(pt);
                    onNavigate('MAP');
                  }}
                />
              </div>
            )}
            </div>
            <GlobalFooter noPadding={true} />
          </div>
        )}

        {view === 'MAP' && activePoint && (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 relative z-10">
              {/* Back Button on top-left - aligned with standard Header position (top-4 left-4 sm:left-8) */}
              <div className="absolute top-4 left-4 sm:left-8 z-[10000] flex items-center">
                <button 
                  onClick={() => {
                    window.history.back();
                  }}
                  className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl text-slate-900 active:scale-90 transition-all cursor-pointer border border-slate-100"
                  title={t("Çıkış")}
                >
                  <i className="fas fa-chevron-left text-sm"></i>
                </button>
              </div>

              {/* Symmetrical Controls on the top-right - aligned and vertically centered with the back button */}
              <div className="absolute top-4 right-3 min-[400px]:right-4 sm:right-8 z-[10000] flex flex-col items-end gap-1 sm:gap-2">
                <div className="h-12 flex items-center gap-1.5 sm:gap-2">
                  {/* Compass / Rotation Lock Button */}
                  <button 
                    onClick={() => {
                      setShowLayerMenu(false);
                      if (isRotationLocked) {
                        setIsRotationLocked(false);
                      } else {
                        setIsRotationLocked(true);
                        setMapRotation(0);
                      }
                    }}
                    className={`w-9.5 h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex flex-col items-center justify-center shadow-xl active:scale-90 transition-all cursor-pointer border relative ${
                      !isRotationLocked 
                        ? 'border-blue-500 text-blue-600 bg-blue-50/90 ring-2 ring-blue-500/20' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={isRotationLocked ? t("Harita Döndürme Kilitli") : t("Harita Döndürme Serbest")}
                  >
                    <div 
                      className="transition-transform duration-300 ease-out flex items-center justify-center relative w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6"
                      style={{ transform: `rotate(${-mapRotation}deg)` }}
                    >
                      <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 drop-shadow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.5 12H8.5L12 2Z" fill="#EF4444" />
                        <path d="M12 22L8.5 12H15.5L12 22Z" fill="#94A3B8" />
                        <circle cx="12" cy="12" r="1.5" fill="#0F172A" />
                      </svg>
                      <span className="absolute -top-1 sm:-top-1.5 text-[5.5px] min-[360px]:text-[6px] sm:text-[7px] font-black text-red-600 select-none">K</span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[7px] sm:text-[8px] shadow border ${
                      isRotationLocked ? 'bg-red-500 text-white border-white' : 'bg-emerald-500 text-white border-white'
                    }`}>
                      <i className={`fas ${isRotationLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                    </div>
                  </button>

                  {/* Layer Selector Button */}
                  <button 
                    onClick={() => {
                      setShowLayerMenu(!showLayerMenu);
                    }}
                    className="w-9.5 h-9.5 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl text-slate-900 active:scale-90 transition-all cursor-pointer border border-slate-200/80"
                    title={t("Harita Kaynağı")}
                  >
                    <i className="fas fa-layer-group text-sm sm:text-base md:text-lg"></i>
                  </button>
                </div>

                {/* Layer Selector Dropdown Menu */}
                {showLayerMenu && (
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-1 w-52 max-w-[calc(100vw-6rem)] sm:max-w-[calc(100vw-8rem)] text-slate-900 select-none animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                          <i className="fas fa-layer-group"></i>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 leading-none">
                          {t("Harita Kaynağı")}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowLayerMenu(false)}
                        className="w-5 h-5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    </div>
                    {[
                      { value: 'Google Hybrid', label: t("1-Google Hibrit") },
                      { value: 'Google Satellite', label: t("2-Google Satellite") },
                      { value: 'OpenTopoMap', label: t("3-Open Topo Map") },
                      { value: 'Esri World Imagery', label: t("4-Esri World Imagery") },
                      { value: 'Bing Satellite', label: t("5-Bing Satellite") },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setCurrentMapProvider(opt.value);
                          safeStorage.setItem('default_map_provider', opt.value);
                          setShowLayerMenu(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-tight text-left transition-all active:scale-95 cursor-pointer ${
                          currentMapProvider === opt.value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {currentMapProvider === opt.value && (
                          <i className="fas fa-check text-[10px] text-white shrink-0 ml-1.5"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <MapTouchWrapper
                mapRotation={mapRotation}
                setMapRotation={setMapRotation}
                isRotationLocked={isRotationLocked}
              >
                <MapContainer 
                  center={[activePoint.lat, activePoint.lng]} 
                  zoom={getTileLayer(currentMapProvider).maxNativeZoom} 
                  maxZoom={22}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                  preferCanvas={true}
                >
                {currentMapProvider === 'Bing Satellite' ? (
                  <BingTileLayer />
                ) : (
                  <TileLayer
                    url={getTileLayer(currentMapProvider).url}
                    attribution={getTileLayer(currentMapProvider).attribution}
                    maxZoom={22}
                    maxNativeZoom={getTileLayer(currentMapProvider).maxNativeZoom}
                    tms={getTileLayer(currentMapProvider).tms}
                  />
                )}
                
                {processedGeometries.map(g => (
                  <React.Fragment key={g.id}>
                    {g.type === 'LineString' ? (
                      <Polyline 
                        positions={g.leafletCoords} 
                        pathOptions={{ color: g.color || '#3b82f6', weight: 2, opacity: 0.7, dashArray: '5, 10' }} 
                      />
                    ) : (
                      <Polygon 
                        positions={g.leafletCoords} 
                        pathOptions={{ color: g.color || '#3b82f6', fillColor: g.color || '#3b82f6', fillOpacity: 0.2, weight: 1, opacity: 0.6 }} 
                      />
                    )}
                  </React.Fragment>
                ))}

                <Marker 
                  position={[activePoint.lat, activePoint.lng]} 
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="width: 12px; height: 12px; background: ${activePoint.color || '#3b82f6'}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  })}
                />
                {userPos && (
                  <>
                    <Circle 
                      center={[userPos.lat, userPos.lng]} 
                      radius={userPos.accuracy} 
                      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.5 }} 
                    />
                    <Marker 
                      position={[userPos.lat, userPos.lng]} 
                      icon={L.divIcon({
                        className: 'user-marker',
                        html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); transform: rotate(${heading || 0}deg);">
                                <div style="position: absolute; top: -10px; left: 5px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 10px solid #3b82f6;"></div>
                               </div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                      })}
                    />
                  </>
                )}
                <MapRotationHandler mapRotation={mapRotation} />
                <MapUpdater center={[activePoint.lat, activePoint.lng]} />
              </MapContainer>
            </MapTouchWrapper>


            </div>

            <div className="bg-slate-200 p-3 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 rounded-t-[2rem] -mt-6">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-black text-slate-900 truncate leading-tight">{activePoint.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("Seçili Nokta")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${activePoint.lat},${activePoint.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl active:scale-95 transition-all shadow-lg shadow-slate-200"
                  >
                    <i className="fas fa-route text-[10px]"></i>
                    <span className="text-[9px] font-black uppercase tracking-wider">{t("Navigasyon")}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className={`p-2 rounded-2xl border transition-colors duration-500 ${getAccuracyBg(userPos?.accuracy || null)}`}>
                  <div className={`text-xl font-black mono-font leading-none ${getAccuracyColor(userPos?.accuracy || null)}`}>
                    {userPos ? `±${userPos.accuracy.toFixed(1)}` : '---'}
                    <span className="text-[10px] ml-1">m</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t("Hassasiyet")}</p>
                </div>
                <div className="bg-blue-100/50 p-2 rounded-2xl border border-blue-200/50">
                  <div className="text-xl font-black text-blue-600 mono-font leading-none">
                    {guidance ? guidance.totalDist.toFixed(1) : '---'}
                    <span className="text-[10px] ml-1">m</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t("Mesafe")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
                  <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">
                    {heading !== null ? t('İLERİ / GERİ') : t('KUZEY / GÜNEY')}
                  </div>
                  <div className={`text-base font-black mono-font ${guidance && (heading !== null ? guidance.forward : guidance.north) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {guidance ? Math.abs(heading !== null ? guidance.forward : guidance.north).toFixed(1) : '0.0'}
                    <span className="text-[10px] ml-1">m</span>
                    <span className="text-[9px] ml-2 font-bold">
                      {guidance ? ((heading !== null ? guidance.forward : guidance.north) > 0 ? (heading !== null ? t('İLERİ') : t('KUZEY')) : (heading !== null ? t('GERİ') : t('GÜNEY'))) : ''}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
                  <div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">
                    {heading !== null ? t('SAĞ / SOL') : t('DOĞU / BATI')}
                  </div>
                  <div className={`text-base font-black mono-font ${guidance && (heading !== null ? guidance.right : guidance.east) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {guidance ? Math.abs(heading !== null ? guidance.right : guidance.east).toFixed(1) : '0.0'}
                    <span className="text-[10px] ml-1">m</span>
                    <span className="text-[9px] ml-2 font-bold">
                      {guidance ? ((heading !== null ? guidance.right : guidance.east) > 0 ? (heading !== null ? t('SAĞ') : t('DOĞU')) : (heading !== null ? t('SOL') : t('BATI'))) : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  {heading !== null ? t("Pusula Yönü Etkin") : t("K/G/D/B Konum Modu")}
                </span>
                <button
                  onClick={() => setIsInvertedDirections(prev => !prev)}
                  className={`px-2 py-1 rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer text-[9px] uppercase tracking-wider ${
                    isInvertedDirections
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  title={t("Pusula veya Cihaz Yönünü 180 Derece Çevir")}
                >
                  <i className="fas fa-sync-alt text-[8px]"></i>
                  {isInvertedDirections ? t("180° Çevrildi") : t("180° Yön Çevir")}
                </button>
              </div>
              
              {!heading && (
                <p className="mt-1 text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                  {t("Pusula verisi bekleniyor... (K/G/D/B modu)")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeoutModule;
