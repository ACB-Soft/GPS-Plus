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
}

export type CalculationMethod = 
  | 'ARITHMETIC_MEAN'
  | 'WEIGHTED_LSE' 
  | 'HUBER'
  | 'KMEANS_4' 
  | 'BAARDA'
  | 'KMEANS_BAARDA_HUBER'
  | 'POPE_TAU'
  | 'HAMPEL'
  | 'ANDREWS_WAVE'
  | 'TUKEYS_BIWEIGHT'
  | 'DANISH'
  | 'GNSS_IMU_STATIONARY';

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
