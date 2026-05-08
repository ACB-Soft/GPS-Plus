import { useState, useEffect } from 'react';
import { getGeoidInfo, GeoidInfo, getEllipsoidalHeight } from '../components/GeoidUtils';

export const useHeightInfo = (altitude: number | null, lat: number, lng: number) => {
  const [info, setInfo] = useState<{ 
    orthometricHeight: number | null, 
    ellipsoidalHeight: number | null,
    undulation: number,
    model: string,
    isSmartCorrectionApplied: boolean
  }>({ 
    orthometricHeight: null, 
    ellipsoidalHeight: null,
    undulation: 0, 
    model: 'None', 
    isSmartCorrectionApplied: false
  });

  useEffect(() => {
    const geoid = getGeoidInfo(lat, lng, altitude);
    const ellip = getEllipsoidalHeight(lat, lng, altitude);
    setInfo({
      orthometricHeight: geoid.orthometricHeight,
      ellipsoidalHeight: ellip,
      undulation: geoid.undulation,
      model: geoid.model,
      isSmartCorrectionApplied: geoid.isSmartCorrectionApplied
    });
  }, [altitude, lat, lng]);

  return info;
};

export const useOrthometricHeight = (ellipsoidalHeight: number | null, lat: number, lng: number) => {
  return useHeightInfo(ellipsoidalHeight, lat, lng);
};
