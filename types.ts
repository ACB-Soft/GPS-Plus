// Shared interfaces for GPS coordinates and saved location data
export interface Coordinate {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  timestamp: number;
}

export type CalculationMethod = 'ARITHMETIC_MEAN' | 'WEIGHTED_LSE' | 'HUBER_M' | 'KDE' | 'RANSAC';

export interface SavedLocation extends Coordinate {
  id: string;
  name: string;
  folderName: string;
  description?: string;
  coordinateSystem?: string;
  measurementDuration?: number;
  calculationMethod?: CalculationMethod;
  samples?: Coordinate[];
  usedSampleIndices?: number[];
  accuracyLimit?: number;
  gnssOnlyMode?: boolean;
}

export interface StakeoutPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude?: number;
  coordinateSystem?: string;
  originalX?: number;
  originalY?: number;
  color?: string;
  iconUrl?: string;
}

export interface StakeoutGeometry {
  id: string;
  name: string;
  type: 'LineString' | 'Polygon';
  coordinates: { lat: number; lng: number; altitude?: number }[];
  color?: string;
}

export interface AppSettings {
  defaultCoordinateSystem: string;
  defaultAccuracyLimit: number;
  defaultMeasurementDuration: number;
  calculationMethod: CalculationMethod;
  alertsEnabled: boolean;
  vibrationEnabled: boolean;
  screenAlwaysOn: boolean;
  mapProvider: string;
  locationPrecision: number;
  heightPrecision: number;
  heightType: 'orthometric' | 'ellipsoidal';
  gnssOnlyMode: boolean;
  showOnboarding: boolean;
}
