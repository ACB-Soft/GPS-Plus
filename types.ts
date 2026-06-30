// Shared interfaces for GPS coordinates and saved location data
export interface Coordinate {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  timestamp: number;
  speed?: number | null;
  heading?: number | null;
  accelX?: number | null;
  accelY?: number | null;
  accelZ?: number | null;
  gyroAlpha?: number | null;
  gyroBeta?: number | null;
  gyroGamma?: number | null;
  deviceOS?: 'iOS' | 'Android';
  sessionId?: number;
}

export type CalculationMethod = 
  | 'WEIGHTED_LSE' 
  | 'HUBER'
  | 'HAMPEL'
  | 'HODGES_LEHMANN'
  | 'TUKEYS_TRIMEAN'
  | 'OPTIMAL_S';

export interface SavedLocation extends Coordinate {
  id: string;
  name: string;
  folderName: string;
  description?: string;
  coordinateSystem?: string;
  measurementDuration?: number;
  calculationMethod?: CalculationMethod;
  samples?: Coordinate[];
  rawSamples?: Coordinate[];
  usedSampleIndices?: number[];
  accuracyLimit?: number;
  gnssOnlyMode?: boolean;
  fallbackApplied?: boolean;
  actualMethodUsed?: CalculationMethod;
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
