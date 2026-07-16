import { Coordinate, CalculationMethod } from '../types';
import { getWGS84Coefficients } from './CoordinateUtils';

export function calculateDistanceMeter(lat1: number, lng1: number, lat2: number, lng2: number, baseLat: number): number {
  const { latCoeff, lngCoeff } = getWGS84Coefficients(baseLat);
  const dLat = (lat1 - lat2) * latCoeff;
  const dLng = (lng1 - lng2) * lngCoeff;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function calculateSquaredDistance(lat1: number, lng1: number, lat2: number, lng2: number, baseLat: number): number {
  const { latCoeff, lngCoeff } = getWGS84Coefficients(baseLat);
  const dLat = (lat1 - lat2) * latCoeff;
  const dLng = (lng1 - lng2) * lngCoeff;
  return dLat * dLat + dLng * dLng;
}

/**
 * Performs statistical analysis on GPS samples based on the selected method.
 */
export function calculateResult(
  samples: Coordinate[],
  method: CalculationMethod,
  accuracyLimit: number,
  gnssOnly: boolean = false
): { 
  result: Coordinate; 
  usedIndices: number[]; 
  clusters?: number[][]; 
  fallbackApplied?: boolean; 
  actualMethodUsed?: CalculationMethod;
  preFilteredCount?: number;
} {
  // Step 1: Filter by GNSS metadata if requested
  // GNSS usually provides altitude, while Wi-Fi/Network often doesn't in browsers
  let baseData = samples;
  if (gnssOnly) {
    const gnssData = samples.filter(s => s.altitude !== null && s.altitude !== 0);
    if (gnssData.length > 0) {
      baseData = gnssData;
    }
  }

  let preFilteredData = baseData;

  // Step 2: Filter by accuracy limit (pre-requisite for all methods)
  const accuracyFiltered = preFilteredData.filter(s => s.accuracy <= accuracyLimit);
  const sourceData = accuracyFiltered.length > 0 ? accuracyFiltered : preFilteredData;

  if (sourceData.length === 0) {
    return { result: samples[0], usedIndices: [0], preFilteredCount: 0 };
  }

  let finalSamples = sourceData;
  let usedIndices: number[] = [];

  let resultData: Coordinate;
  let finalCalculatedUsedIndices: number[] | null = null;
  let clusters: number[][] | undefined = undefined;

  // The minimum epoch requirement for all advanced/professional methods is 5 epochs.
  const requires5 = method !== 'WEIGHTED_LSE';
  
  let finalMethod = method;
  let fallbackApplied = false;

  if (requires5 && samples.length < 5) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  }

  switch (finalMethod) {
    case 'WEIGHTED_LSE':
      const lseResult = calculateWeightedLSE(sourceData);
      resultData = lseResult.result;
      finalCalculatedUsedIndices = lseResult.usedIndices;
      break;
    case 'HUBER':
      const pureHuberRes = calculateHuberPure(sourceData);
      resultData = pureHuberRes.result;
      finalCalculatedUsedIndices = pureHuberRes.usedIndices;
      break;
    case 'HAMPEL':
      const hampelRes = calculateHampelAcademic(sourceData);
      resultData = hampelRes.result;
      finalCalculatedUsedIndices = hampelRes.usedIndices;
      break;
    case 'HODGES_LEHMANN':
      const hlRes = calculateHodgesLehmannPure(sourceData);
      resultData = hlRes.result;
      finalCalculatedUsedIndices = hlRes.usedIndices;
      break;
    case 'TUKEYS_TRIMEAN':
      const trimeanRes = calculateTukeysTrimeanPure(sourceData);
      resultData = trimeanRes.result;
      finalCalculatedUsedIndices = trimeanRes.usedIndices;
      break;
    case 'OPTIMAL_S':
      const optimalSRes = calculateOptimalSPure(sourceData);
      resultData = optimalSRes.result;
      finalCalculatedUsedIndices = optimalSRes.usedIndices;
      break;
    default:
      const defaultLse = calculateWeightedLSE(sourceData);
      resultData = defaultLse.result;
      finalCalculatedUsedIndices = defaultLse.usedIndices;
  }

  // Determine which indices were used if not already determined by the method
  if (finalCalculatedUsedIndices === null) {
    usedIndices = samples
      .map((s, idx) => finalSamples.includes(s) ? idx : -1)
      .filter(idx => idx !== -1);
  } else {
    // CRITICAL: Map local indices of sourceData back to original indices of samples array
    usedIndices = finalCalculatedUsedIndices.map(localIdx => {
      const matchSample = sourceData[localIdx];
      const parentIdx = samples.indexOf(matchSample);
      return parentIdx !== -1 ? parentIdx : localIdx;
    });
  }

  // CRITICAL: Calculate max distance between any two points in the unfiltered samples
  // (As per user request: "maximum distance between any 2 points" over all samples)
  const maxDistance = calculateMaxDistance(samples);

  // Final Accuracy formula: Max(Sample Spread, Hardware Reported Accuracy)
  const avgSensorAccuracy = sourceData.reduce((a, b) => a + b.accuracy, 0) / sourceData.length;
  resultData.accuracy = Math.max(maxDistance, avgSensorAccuracy);
  
  // Ensure it doesn't drop below a realistic threshold (0.1m)
  resultData.accuracy = Math.max(0.1, resultData.accuracy);

  // Set altitude and altitudeAccuracy to the arithmetic average of all valid active samples
  const validAltitudes = sourceData.filter(s => s.altitude !== null && s.altitude !== undefined);
  resultData.altitude = validAltitudes.length > 0 
    ? validAltitudes.reduce((sum, s) => sum + (s.altitude || 0), 0) / validAltitudes.length 
    : null;

  const validAltAccuracies = sourceData.filter(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined);
  resultData.altitudeAccuracy = validAltAccuracies.length > 0
    ? validAltAccuracies.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / validAltAccuracies.length
    : null;

  return { 
    result: resultData, 
    usedIndices, 
    clusters, 
    fallbackApplied, 
    actualMethodUsed: finalMethod,
    preFilteredCount: sourceData.length
  };
}
export function calculateMaxDistance(samples: Coordinate[]): number {
  if (samples.length <= 1) return 0;
  
  let maxDist = 0;
  const meanLat = samples.reduce((a, b) => a + b.lat, 0) / samples.length;
  
  for (let i = 0; i < samples.length; i++) {
    for (let j = i + 1; j < samples.length; j++) {
      const dist = calculateDistanceMeter(samples[i].lat, samples[i].lng, samples[j].lat, samples[j].lng, meanLat);
      if (dist > maxDist) maxDist = dist;
    }
  }
  return maxDist;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[half];
  }
  return (sorted[half - 1] + sorted[half]) / 2.0;
}

export function calculateMAD(samples: Coordinate[], center: { lat: number; lng: number }): number {
  if (samples.length === 0) return 0;
  const distances = samples.map(s => {
    return calculateDistanceMeter(s.lat, s.lng, center.lat, center.lng, center.lat);
  });
  const medianDist = calculateMedian(distances);
  // 0.8493 is the robust scaling factor derived from the Rayleigh distribution for 2D spatial distances
  return 0.8493 * medianDist;
}

/**
 * Calculates the Spatial L1 Median (Geometric Median) using Weiszfeld's Algorithm.
 * This is rotation-invariant, which provides excellent geodetic consistency.
 * It is optimized for performance, limiting the iterations to 10 for mobile/browser execution.
 */
export function calculateSpatialL1Median(samples: Coordinate[]): { lat: number; lng: number } {
  if (samples.length === 0) return { lat: 0, lng: 0 };
  if (samples.length === 1) return { lat: samples[0].lat, lng: samples[0].lng };
  if (samples.length === 2) {
    return {
      lat: (samples[0].lat + samples[1].lat) / 2,
      lng: (samples[0].lng + samples[1].lng) / 2
    };
  }

  // Use marginal median as reference and starting point
  const refLat = calculateMedian(samples.map(s => s.lat));
  const refLng = calculateMedian(samples.map(s => s.lng));

  const { latCoeff, lngCoeff } = getWGS84Coefficients(refLat);

  // Convert all points to 2D local meter coordinates relative to (refLat, refLng)
  const points = samples.map(s => ({
    x: (s.lng - refLng) * lngCoeff,
    y: (s.lat - refLat) * latCoeff
  }));

  // Initial guess (0, 0)
  let currX = 0;
  let currY = 0;

  const maxIter = 10;
  const tol = 0.001; // 1 mm

  for (let iter = 0; iter < maxIter; iter++) {
    let numX = 0;
    let numY = 0;
    let den = 0;
    let hitsPoint = false;
    let hitIdx = -1;

    for (let i = 0; i < points.length; i++) {
      const dx = currX - points[i].x;
      const dy = currY - points[i].y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < 1e-6) {
        hitsPoint = true;
        hitIdx = i;
        break;
      }

      const invD = 1.0 / d;
      numX += points[i].x * invD;
      numY += points[i].y * invD;
      den += invD;
    }

    if (hitsPoint) {
      currX = points[hitIdx].x + 1e-5;
      currY = points[hitIdx].y + 1e-5;
      continue;
    }

    if (den === 0) break;

    const nextX = numX / den;
    const nextY = numY / den;

    const change = Math.sqrt((nextX - currX) * (nextX - currX) + (nextY - currY) * (nextY - currY));
    currX = nextX;
    currY = nextY;

    if (change < tol) break;
  }

  return {
    lat: refLat + currY / latCoeff,
    lng: refLng + currX / lngCoeff
  };
}

export function calculateAverage(samples: Coordinate[]): Coordinate {
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const validAltAccuracies = samples.filter(s => s.altitudeAccuracy !== null);

  const meanLat = samples.reduce((a, b) => a + b.lat, 0) / samples.length;
  const meanLng = samples.reduce((a, b) => a + b.lng, 0) / samples.length;

  // Calculate Horizontal Precision
  // We use the root-mean-square of residuals plus the standard error of reported accuracies
  const residualsInMeters = samples.map(s => {
    const dist = calculateDistanceMeter(s.lat, s.lng, meanLat, meanLng, meanLat);
    return dist * dist;
  });
  
  const hVariance = residualsInMeters.reduce((a, b) => a + b, 0) / Math.max(1, samples.length - 1);
  const hStdDev = Math.sqrt(hVariance);
  
  const avgSensorAccuracy = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  
  // Statistical accuracy estimate: Combine spatial dispersion with reported sensor uncertainty
  // For n > 1, we use a combined uncertainty model
  let finalAccuracy = avgSensorAccuracy;
  if (samples.length > 1) {
    // SEM (Standard Error of Mean) concept: Dispersion divided by sqrt(n)
    // plus the mean reported accuracy weighted by the number of samples
    const standardError = hStdDev / Math.sqrt(samples.length);
    finalAccuracy = Math.sqrt(Math.pow(standardError, 2) + Math.pow(avgSensorAccuracy / Math.sqrt(samples.length), 2));
  }

  return {
    lat: meanLat,
    lng: meanLng,
    accuracy: finalAccuracy,
    altitude: validAltitudes.length > 0 
      ? validAltitudes.reduce((a, b) => a + (b.altitude || 0), 0) / validAltitudes.length 
      : null,
    altitudeAccuracy: validAltAccuracies.length > 0
      ? validAltAccuracies.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccuracies.length
      : null,
    timestamp: Date.now()
  };
}

/**
 * Weighted Least Squares (WLS)
 * Uses 1/accuracy^2 as weights for balancing.
 */
function calculateWeightedLSE(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) return { result: samples[0], usedIndices: [0] };
  
  const weights = samples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
  const sumW = weights.reduce((a, b) => a + b, 0);
  
  const meanLat = samples.reduce((a, s, i) => a + s.lat * weights[i], 0) / sumW;
  const meanLng = samples.reduce((a, s, i) => a + s.lng * weights[i], 0) / sumW;
  
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const meanAlt = validAltitudes.length > 0
    ? validAltitudes.reduce((a, s) => a + (s.altitude || 0), 0) / validAltitudes.length
    : null;
    
  const result: Coordinate = {
    ...samples[0],
    lat: meanLat,
    lng: meanLng,
    altitude: meanAlt,
    timestamp: Date.now()
  };
  
  // For weighted mean, we effectively use all samples but treat them with weights
  // For reporting used indices, we return all
  return { result, usedIndices: samples.map((_, i) => i) };
}

/**
 * Calculates variance of coordinates in meters
 */

/**
 * Calculates variance of coordinates in meters
 */
export function calculateVariance(samples: Coordinate[], mean: Coordinate): number {
  if (samples.length < 2) return 0;
  
  // Convert degrees to meters roughly (1 deg ~ 111320m)
  const residuals = samples.map(s => {
    const dist = calculateDistanceMeter(s.lat, s.lng, mean.lat, mean.lng, mean.lat);
    return dist * dist;
  });
  
  return residuals.reduce((a, b) => a + b, 0) / (samples.length - 1);
}

function calculateMADHuber(samples: Coordinate[], centerLat: number, centerLng: number): number {
  const distances = samples.map(p => calculateDistanceMeter(p.lat, p.lng, centerLat, centerLng, centerLat));
  return calculateMedian(distances);
}

export function calculateHuberPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  const spatialMedian = calculateSpatialL1Median(samples);
  let currentLat = spatialMedian.lat;
  let currentLng = spatialMedian.lng;

  const maxIterations = 15;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    // 0.8493 is the robust scale factor based on 2D spatial Rayleigh distribution
    const pseudoSigma = currentMAD * 0.8493;
    // Numerical stability guard (machine-epsilon) instead of arbitrary spatial minimum
    const stablePseudoSigma = pseudoSigma > 1e-7 ? pseudoSigma : 1e-7;
    const huberLimit = 1.345 * stablePseudoSigma;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
      const huberWeight = dist <= huberLimit ? 1.0 : huberLimit / Math.max(0.001, dist);
      const combinedWeight = hardwareWeight * huberWeight;

      sumW += combinedWeight;
      sumLatW += p.lat * combinedWeight;
      sumLngW += p.lng * combinedWeight;
    }

    if (sumW === 0) break;

    const nextLat = sumLatW / sumW;
    const nextLng = sumLngW / sumW;

    const changeInMeter = calculateDistanceMeter(nextLat, nextLng, currentLat, currentLng, currentLat);

    currentLat = nextLat;
    currentLng = nextLng;

    if (changeInMeter < toleranceMeter) break;
  }

  const finalMAD = calculateMADHuber(samples, currentLat, currentLng);
  const finalPseudoSigma = finalMAD * 0.8493;
  // Pure 1.345-sigma Huber outlier threshold boundary (95% asymptotic efficiency academic gate)
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const huberLimit = 1.345 * stableFinalPseudoSigma;

  const usedIndices: number[] = [];

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

    if (dist <= huberLimit) {
      usedIndices.push(i);
    }
  }

  if (usedIndices.length === 0) {
    for (let i = 0; i < samples.length; i++) {
      usedIndices.push(i);
    }
  }

  const avgSensorAccuracy = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;

  return {
    result: {
      lat: currentLat,
      lng: currentLng,
      accuracy: avgSensorAccuracy,
      altitude: null,
      altitudeAccuracy: null,
      timestamp: Date.now()
    },
    usedIndices
  };
}

export function calculateOptimalSPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  const spatialMedian = calculateSpatialL1Median(samples);
  let currentLat = spatialMedian.lat;
  let currentLng = spatialMedian.lng;

  const maxIterations = 20;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    // 0.8493 is the robust scale factor based on 2D spatial Rayleigh distribution
    const pseudoSigma = currentMAD * 0.8493;
    const stablePseudoSigma = pseudoSigma > 1e-7 ? pseudoSigma : 1e-7;
    
    // Tukey's Biweight tuning constant c = 3.0 for highly robust location estimation.
    const c = 3.0;
    const cutoff = c * stablePseudoSigma;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
      
      let biweightWeight = 0;
      if (dist <= cutoff) {
        const u = dist / cutoff;
        biweightWeight = Math.pow(1.0 - u * u, 2);
      }
      
      const combinedWeight = hardwareWeight * biweightWeight;

      sumW += combinedWeight;
      sumLatW += p.lat * combinedWeight;
      sumLngW += p.lng * combinedWeight;
    }

    if (sumW === 0) {
      // Fall back if all weights elements are 0 due to being outliers
      for (let i = 0; i < samples.length; i++) {
        const p = samples[i];
        const combinedWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
        sumW += combinedWeight;
        sumLatW += p.lat * combinedWeight;
        sumLngW += p.lng * combinedWeight;
      }
    }

    const nextLat = sumLatW / sumW;
    const nextLng = sumLngW / sumW;

    const changeInMeter = calculateDistanceMeter(nextLat, nextLng, currentLat, currentLng, currentLat);

    currentLat = nextLat;
    currentLng = nextLng;

    if (changeInMeter < toleranceMeter) break;
  }

  const finalMAD = calculateMADHuber(samples, currentLat, currentLng);
  const finalPseudoSigma = finalMAD * 0.8493;
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = 3.0 * stableFinalPseudoSigma;

  const usedIndices: number[] = [];
  const cleanSamples: Coordinate[] = [];

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

    if (dist <= outlierThreshold) {
      usedIndices.push(i);
      cleanSamples.push(p);
    }
  }

  if (cleanSamples.length === 0) {
    return {
      result: { lat: currentLat, lng: currentLng, accuracy: 3.0, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    finalSumW += hardwareWeight;
    finalLatW += p.lat * hardwareWeight;
    finalLngW += p.lng * hardwareWeight;
    totalAccuracy += p.accuracy;
  }

  return {
    result: {
      lat: finalLatW / finalSumW,
      lng: finalLngW / finalSumW,
      accuracy: totalAccuracy / cleanSamples.length,
      altitude: null,
      altitudeAccuracy: null,
      timestamp: Date.now()
    },
    usedIndices
  };
}

/**
 * Hodges-Lehmann Estimator (HL-Estimator)
 * 
 * For a 1D dataset, the one-sample Hodges-Lehmann estimator is defined as the median
 * of all pairwise (Walsh) averages: (X_i + X_j) / 2 for 1 <= i <= j <= N.
 *
 * For 2D geodetic coordinates:
 * - We calculate the Hodges-Lehmann estimate of latitude (hlLat) and longitude (hlLng) independently
 *   using pure Walsh averages.
 * - To determine outliers (for visualization and consistency under usedIndices), we:
 *   a. Find the Euclidean distance of all raw epochs to this HL center estimator in meters.
 *   b. Obtain the Median Absolute Deviation (MAD) of those spatial distances.
 *   c. Use a 3.0 * scaleSigma (where scaleSigma = 1.4826 * MAD) rejection threshold to identify inliers.
 *   d. Guarantee at least 2 inliers (safeguard) to avoid rank deficiency.
 * - Return the exact HL coordinates {lat: hlLat, lng: hlLng, accuracy: avgAccuracy, ...} and the inlier indices.
 */
export function calculateHodgesLehmannPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  // If we have extremely few samples, fallback directly to weighted LSE
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  const N = samples.length;

  // Step A: Calculate all pairwise (Walsh) averages for Latitude
  const walshLats: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i; j < N; j++) {
      walshLats.push((samples[i].lat + samples[j].lat) / 2);
    }
  }
  // Compute median of walshLats
  walshLats.sort((a, b) => a - b);
  const midLat = Math.floor(walshLats.length / 2);
  const hlLat = walshLats.length % 2 !== 0 
    ? walshLats[midLat] 
    : (walshLats[midLat - 1] + walshLats[midLat]) / 2;

  // Step B: Calculate all pairwise (Walsh) averages for Longitude
  const walshLngs: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i; j < N; j++) {
      walshLngs.push((samples[i].lng + samples[j].lng) / 2);
    }
  }
  // Compute median of walshLngs
  walshLngs.sort((a, b) => a - b);
  const midLng = Math.floor(walshLngs.length / 2);
  const hlLng = walshLngs.length % 2 !== 0 
    ? walshLngs[midLng] 
    : (walshLngs[midLng - 1] + walshLngs[midLng]) / 2;

  // Step C: Identify Outliers relative to the Hodges-Lehmann Center (for usedIndices mapping)
  // Distance of each raw coordinate point to the HL center in meters
  const dists = samples.map(s => calculateDistanceMeter(s.lat, s.lng, hlLat, hlLng, hlLat));

  // Compute Median of distances
  const sortedDists = [...dists].sort((a, b) => a - b);
  const midD = Math.floor(N / 2);
  const medianDist = N % 2 !== 0 ? sortedDists[midD] : (sortedDists[midD - 1] + sortedDists[midD]) / 2;

  // Absolute deviations of each distance from the median distance
  const absDevs = dists.map(d => Math.abs(d - medianDist));
  const sortedDevs = [...absDevs].sort((a, b) => a - b);
  const medianDev = N % 2 !== 0 ? sortedDevs[midD] : (sortedDevs[midD - 1] + sortedDevs[midD]) / 2;

  const mad = medianDev;
  const scaleSigma = 0.8493 * mad;

  // Rejection threshold boundaries (consistency safeguard)
  const minSigmaBoundary = 1e-6; // 1 micrometer

  const inlierIndices: number[] = [];

  if (scaleSigma < minSigmaBoundary) {
    // Standard output: all are close
    return {
      result: {
        lat: hlLat,
        lng: hlLng,
        accuracy: samples.reduce((sum, s) => sum + s.accuracy, 0) / N,
        altitude: samples.some(s => s.altitude !== null && s.altitude !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitude || 0), 0) / N
          : null,
        altitudeAccuracy: samples.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / N
          : null,
        timestamp: Date.now()
      },
      usedIndices: samples.map((_, i) => i)
    };
  }

  for (let i = 0; i < N; i++) {
    if (absDevs[i] <= 3.0 * scaleSigma) {
      inlierIndices.push(i);
    }
  }

  // Fallback protection: keep at least 2 samples with the lowest dev
  let finalUsedIndices = inlierIndices;
  if (finalUsedIndices.length < 2) {
    const sortedSampleIndices = samples
      .map((_, idx) => ({ idx, dev: absDevs[idx] }))
      .sort((a, b) => a.dev - b.dev);
    finalUsedIndices = [sortedSampleIndices[0].idx, sortedSampleIndices[1].idx];
  }

  // Average accuracy of the raw filtered elements
  const activeInliers = finalUsedIndices.map(idx => samples[idx]);
  const avgAccuracy = activeInliers.reduce((sum, s) => sum + s.accuracy, 0) / activeInliers.length;
  const avgAltitude = activeInliers.some(s => s.altitude !== null && s.altitude !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitude || 0), 0) / activeInliers.length
    : null;
  const avgAltAccuracy = activeInliers.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / activeInliers.length
    : null;

  return {
    result: {
      lat: hlLat,
      lng: hlLng,
      accuracy: avgAccuracy,
      altitude: avgAltitude,
      altitudeAccuracy: avgAltAccuracy,
      timestamp: Date.now()
    },
    usedIndices: finalUsedIndices
  };
}

/**
 * Tukey's Trimean L-Estimation Method
 *
 * Tukey's Trimean is an L-estimator of location that is highly robust to outliers and contamination.
 * It is defined as a weighted average of the first quartile (25th percentile), the median (50th percentile),
 * and the third quartile (75th percentile):
 *   Trimean = (Q1 + 2*Q2 + Q3) / 4
 *
 * For geodetic 2D coordinates:
 * - We calculate the Tukey's Trimean of latitude (triLat) and longitude (triLng) independently.
 * - To determine outlier status (for usedIndices visual tracking), we:
 *   a. Find the Euclidean distance of all raw epochs to this Trimean center.
 *   b. Obtain the Median Absolute Deviation (MAD) of those spatial distances.
 *   c. Use a 3.0 * scaleSigma (scaleSigma = 1.4826 * MAD) boundary as the academic gate for inliers.
 * - Return the Trimean coordinate and the valid, high-reliability inliers.
 */
export function calculateTukeysTrimeanPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  // If we have extremely few samples, fallback directly to weighted LSE
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  const N = samples.length;

  // Helper to compute percentile/quartile of a sorted list of numbers
  const getPercentileValue = (sorted: number[], p: number): number => {
    const idx = (sorted.length - 1) * p;
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    if (low === high) return sorted[low];
    return sorted[low] + (sorted[high] - sorted[low]) * (idx - low);
  };

  // Step A: Tukey's Trimean for Latitude
  const sortedLats = samples.map(s => s.lat).sort((a, b) => a - b);
  const q1Lat = getPercentileValue(sortedLats, 0.25);
  const q2Lat = getPercentileValue(sortedLats, 0.50);
  const q3Lat = getPercentileValue(sortedLats, 0.75);
  const triLat = (q1Lat + 2 * q2Lat + q3Lat) / 4;

  // Step B: Tukey's Trimean for Longitude
  const sortedLngs = samples.map(s => s.lng).sort((a, b) => a - b);
  const q1Lng = getPercentileValue(sortedLngs, 0.25);
  const q2Lng = getPercentileValue(sortedLngs, 0.50);
  const q3Lng = getPercentileValue(sortedLngs, 0.75);
  const triLng = (q1Lng + 2 * q2Lng + q3Lng) / 4;

  // Step C: Identify Outliers relative to the Trimean Center
  const dists = samples.map(s => calculateDistanceMeter(s.lat, s.lng, triLat, triLng, triLat));

  // Compute Median of distances
  const sortedDists = [...dists].sort((a, b) => a - b);
  const midD = Math.floor(N / 2);
  const medianDist = N % 2 !== 0 ? sortedDists[midD] : (sortedDists[midD - 1] + sortedDists[midD]) / 2;

  // Absolute deviations from median distance
  const absDevs = dists.map(d => Math.abs(d - medianDist));
  const sortedDevs = [...absDevs].sort((a, b) => a - b);
  const medianDev = N % 2 !== 0 ? sortedDevs[midD] : (sortedDevs[midD - 1] + sortedDevs[midD]) / 2;

  const mad = medianDev;
  const scaleSigma = 0.8493 * mad;
  const minSigmaBoundary = 1e-6; // 1 micrometer

  if (scaleSigma < minSigmaBoundary) {
    return {
      result: {
        lat: triLat,
        lng: triLng,
        accuracy: samples.reduce((sum, s) => sum + s.accuracy, 0) / N,
        altitude: samples.some(s => s.altitude !== null && s.altitude !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitude || 0), 0) / N
          : null,
        altitudeAccuracy: samples.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / N
          : null,
        timestamp: Date.now()
      },
      usedIndices: samples.map((_, i) => i)
    };
  }

  const inlierIndices: number[] = [];
  for (let i = 0; i < N; i++) {
    if (absDevs[i] <= 3.0 * scaleSigma) {
      inlierIndices.push(i);
    }
  }

  // Fallback protection: keep at least 2 samples with the lowest dev
  let finalUsedIndices = inlierIndices;
  if (finalUsedIndices.length < 2) {
    const sortedSampleIndices = samples
      .map((_, idx) => ({ idx, dev: absDevs[idx] }))
      .sort((a, b) => a.dev - b.dev);
    finalUsedIndices = [sortedSampleIndices[0].idx, sortedSampleIndices[1].idx];
  }

  // Calculate average accuracy and altitude metadata
  const activeInliers = finalUsedIndices.map(idx => samples[idx]);
  const avgAccuracy = activeInliers.reduce((sum, s) => sum + s.accuracy, 0) / activeInliers.length;
  const avgAltitude = activeInliers.some(s => s.altitude !== null && s.altitude !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitude || 0), 0) / activeInliers.length
    : null;
  const avgAltAccuracy = activeInliers.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / activeInliers.length
    : null;

  return {
    result: {
      lat: triLat,
      lng: triLng,
      accuracy: avgAccuracy,
      altitude: avgAltitude,
      altitudeAccuracy: avgAltAccuracy,
      timestamp: Date.now()
    },
    usedIndices: finalUsedIndices
  };
}














export function calculateHampelAcademic(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  const N = samples.length;
  // Spatial median coordinates computed using Weiszfeld's algorithm for true Spatial L1 Median
  const spatialMedian = calculateSpatialL1Median(samples);
  const medianLat = spatialMedian.lat;
  const medianLng = spatialMedian.lng;

  const absDevs: number[] = [];
  for (let i = 0; i < N; i++) {
    absDevs.push(calculateDistanceMeter(samples[i].lat, samples[i].lng, medianLat, medianLng, medianLat));
  }
  
  const mad = calculateMedian(absDevs);
  const scaleSigma = 0.8493 * mad;
  const inlierIndices: number[] = [];

  for (let i = 0; i < N; i++) {
    if (absDevs[i] <= 3.0 * scaleSigma) { // 3-sigma Hampel rejection rule
      inlierIndices.push(i); // Keep only inliers (2D distance check)
    }
  }

  if (inlierIndices.length < 2) {
    return calculateWeightedLSE(samples);
  }

  const filteredSamples = inlierIndices.map(idx => samples[idx]);
  const lseResult = calculateWeightedLSE(filteredSamples);
  
  return {
    result: lseResult.result,
    usedIndices: inlierIndices
  };
}
