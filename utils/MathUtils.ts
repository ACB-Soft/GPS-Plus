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

  // Step 2: Filter by accuracy limit (pre-requisite for all methods)
  const accuracyFiltered = baseData.filter(s => s.accuracy <= accuracyLimit);
  const sourceData = accuracyFiltered.length > 0 ? accuracyFiltered : baseData;

  if (sourceData.length === 0) {
    return { result: samples[0], usedIndices: [0] };
  }

  let finalSamples = sourceData;
  let usedIndices: number[] = [];

  let resultData: Coordinate;
  let finalCalculatedUsedIndices: number[] | null = null;
  let clusters: number[][] | undefined = undefined;

  // Let's implement the constraint checks for professional mathematical models:
  // - HUBER requires en az 30 epok.
  // - HAMPEL, HODGES_LEHMANN, TUKEYS_TRIMEAN, OPTIMAL_S, MM_ESTIMATOR require geodetic minimum of 4 epok.
  const requires30 = method === 'HUBER';
  const requires4 = method === 'HAMPEL' || method === 'HODGES_LEHMANN' || method === 'TUKEYS_TRIMEAN' || method === 'OPTIMAL_S' || method === 'MM_ESTIMATOR';
  
  let finalMethod = method;
  let fallbackApplied = false;

  if (requires30 && samples.length < 30) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  } else if (requires4 && samples.length < 4) {
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
    case 'MM_ESTIMATOR':
      const mmeRes = calculateMMEstimatorPure(sourceData);
      resultData = mmeRes.result;
      finalCalculatedUsedIndices = mmeRes.usedIndices;
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
  // (As per user request: "en uzak 2 nokta arası mesafe" over all samples)
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
    actualMethodUsed: finalMethod 
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
  // 1.4826 is the scaling factor for consistency with standard deviation
  return 1.4826 * medianDist;
}

export function calculateAverage(samples: Coordinate[]): Coordinate {
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const validAltAccuracies = samples.filter(s => s.altitudeAccuracy !== null);

  const meanLat = samples.reduce((a, b) => a + b.lat, 0) / samples.length;
  const meanLng = samples.reduce((a, b) => a + b.lng, 0) / samples.length;

  // Calculate Yatay Hassasiyet (Horizontal Precision)
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

/**
 * K-Means + Baarda Algorithm with Adaptive Dynamic Scaling
 * 1. Calculate metric standard deviation (sigma_metrik) of the entire dataset
 * 2. Dynamically decide the number of clusters (k) based on sigma_metrik
 * 3. Segment raw dataset with K-Means (k)
 * 4. Critical Limit Control & Cluster Merging (Merge clusters with < 4 elements into their nearest strong cluster)
 * 5. Intra-cluster Baarda outlier detection
 * 6. Cluster Density Analysis (Champion Cluster Selection)
 * 7. Final Weighted Least Squares (WLS) Solution
 */
function calculateKMeansBaarda(samples: Coordinate[]): { result: Coordinate; usedIndices: number[]; clusters?: number[][] } {
  if (samples.length < 5) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };

  // 1. Calculate metric Standard Deviation
  const average = calculateAverage(samples);
  const variance = calculateVariance(samples, average);
  const sigma = Math.sqrt(variance);

  // 2. Fixed Number of Clusters (k) = 4 as requested
  const k = 4;

  // 3. K-Means clustering on the whole raw dataset
  const clusterAssignments = runKMeans(samples, k);
  
  // Group index allocations into clusters
  const clusters: number[][] = Array.from({ length: k }, () => []);
  clusterAssignments.forEach((cIdx, i) => {
    clusters[cIdx].push(i);
  });

  // 1. Kol (Uzaysal Kol): Find the "Champion Cluster" (largest cluster by element count)
  let bestClusterIdx = 0;
  let maxCount = -1;
  for (let i = 0; i < k; i++) {
    if (clusters[i].length > maxCount) {
      maxCount = clusters[i].length;
      bestClusterIdx = i;
    }
  }

  const championIndices = clusters[bestClusterIdx];
  const championPoints = championIndices.map(idx => samples[idx]);

  // 2. Kol (Jeodezik Kol): Run Baarda Test on the entire raw dataset without partitioning
  const baardaPureRes = calculateBaardaPure(samples);
  const baardaCleanIndices = baardaPureRes.usedIndices;

  // 3. Intersection & Final Selection:
  // K-Means Şampiyon Kümedeki noktalar ile Baarda testinden temiz çıkan noktaların doğrudan kesin indeks kesişimi
  const finalCleanIndices = baardaCleanIndices.filter(idx => championIndices.includes(idx));
  const finalCleanPoints = finalCleanIndices.map(idx => samples[idx]);

  // Graceful fallback if strict intersection is empty (Option C: local Baarda on Champion Cluster points to filter outliers)
  let finalPointsToUse = finalCleanPoints;
  let finalIndicesToUse = finalCleanIndices;

  if (finalPointsToUse.length === 0) {
    const localBaardaRes = calculateBaardaPure(championPoints);
    finalIndicesToUse = localBaardaRes.usedIndices.map(localIdx => championIndices[localIdx]);
    finalPointsToUse = finalIndicesToUse.map(idx => samples[idx]);
  }

  if (finalPointsToUse.length === 0) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };
  }

  // Final Weighted Least Squares (WLS) Solution on selected intersection points
  const lseResult = calculateWeightedLSE(finalPointsToUse);
  const finalResult = { ...lseResult.result };

  // Calculate altitude and altitudeAccuracy on selected points
  const validAlts = finalPointsToUse.filter(s => s.altitude !== null);
  finalResult.altitude = validAlts.length > 0
    ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length
    : null;

  const validAltAccs = finalPointsToUse.filter(s => s.altitudeAccuracy !== null);
  finalResult.altitudeAccuracy = validAltAccs.length > 0
    ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length
    : null;

  return { 
    result: finalResult, 
    usedIndices: finalIndicesToUse, 
    clusters: clusters.filter(c => c.length > 0)
  };
}

/**
 * Simple K-Means algorithm for 2D points (lat/lng)
 */
function runKMeans(samples: Coordinate[], k: number): number[] {
  // Initialization: Forgy method (random samples as centroids)
  let centroids = samples.slice(0, k).map(s => ({ lat: s.lat, lng: s.lng }));
  if (samples.length > k) {
    const step = Math.floor(samples.length / k);
    centroids = Array.from({ length: k }, (_, i) => ({ 
      lat: samples[i * step].lat, 
      lng: samples[i * step].lng 
    }));
  }

  // Add microscopic random jitter (approx 1cm) to prevent starting centroids from collapsing
  centroids = centroids.map((c, idx) => ({
    lat: c.lat + (idx - k/2) * 1e-7,
    lng: c.lng + (idx - k/2) * 1e-7
  }));

  let assignments = new Array(samples.length).fill(-1);
  let changed = true;
  let iterations = 0;
  const maxIterations = 20;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Assignment step
    for (let i = 0; i < samples.length; i++) {
        let minDist = Infinity;
        let bestK = 0;
        for (let j = 0; j < k; j++) {
            const dist = calculateSquaredDistance(samples[i].lat, samples[i].lng, centroids[j].lat, centroids[j].lng, samples[i].lat);
            if (dist < minDist) {
                minDist = dist;
                bestK = j;
            }
        }
        if (assignments[i] !== bestK) {
            assignments[i] = bestK;
            changed = true;
        }
    }

    // Update step
    for (let j = 0; j < k; j++) {
        const clusterPoints = samples.filter((_, i) => assignments[i] === j);
        if (clusterPoints.length > 0) {
            centroids[j] = {
                lat: clusterPoints.reduce((a, b) => a + b.lat, 0) / clusterPoints.length,
                lng: clusterPoints.reduce((a, b) => a + b.lng, 0) / clusterPoints.length
            };
        }
    }
  }

  return assignments;
}



function calculateBaardaInternal(samples: any[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i) };

  let currentSamples = samples.map((s, idx) => ({
    ...s,
    _originalIdx: s._originalIdx !== undefined ? s._originalIdx : idx
  }));
  const criticalValue = 3.29; // Critical limit for 99.9% confidence interval

  while (currentSamples.length > 4) {
    // Kalan verinin saçılım genişliği 0.50m'nin altına düştüğünde veri elemesini durdur
    const currentSpread = calculateMaxDistance(currentSamples);
    if (currentSpread < 0.50) {
      break;
    }

    const avgLat0 = currentSamples.reduce((sum, s) => sum + s.lat, 0) / currentSamples.length;
    const { latCoeff, lngCoeff } = getWGS84Coefficients(avgLat0);

    const weights = currentSamples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;

    const localPts = currentSamples.map((s, i) => {
      const dx = (s.lng - meanLng) * lngCoeff;
      const dy = (s.lat - meanLat) * latCoeff;
      return { dx, dy, w: weights[i] };
    });

    let vTPv = 0;
    for (const pt of localPts) {
      vTPv += (pt.dx * pt.dx + pt.dy * pt.dy) * pt.w;
    }

    const N = currentSamples.length;
    const f = 2 * N - 2; // Degrees of freedom: 2N - 2 parameters (meanLat, meanLng)
    const sigma0_sq = vTPv / (f > 0 ? f : 1);
    const sigma0 = Math.sqrt(sigma0_sq > 1e-10 ? sigma0_sq : 1e-10);

    const standardizedResiduals = currentSamples.map((s, i) => {
      const pt = localPts[i];
      const p_i = weights[i];
      const q_ii = Math.max(1e-4, 1.0 - (p_i / sumW)); // Redundancy component r_i or cofactor q_vv
      const dist_v = Math.sqrt(pt.dx * pt.dx + pt.dy * pt.dy); // actual residual in meters
      
      // Standart geodezik Baarda w-testi formülü: w_i = (v_i * sqrt(p_i)) / (sigma0 * sqrt(1 - h_i))
      return (dist_v * Math.sqrt(p_i)) / (sigma0 * Math.sqrt(q_ii));
    });

    let maxW = -1;
    let worstIdx = -1;
    for (let i = 0; i < standardizedResiduals.length; i++) {
        if (standardizedResiduals[i] > maxW) {
            maxW = standardizedResiduals[i];
            worstIdx = i;
        }
    }

    if (maxW > criticalValue) {
        currentSamples.splice(worstIdx, 1);
    } else {
        break; 
    }
  }

  // Geodetically sound: use weighted least squares (CalculateWeightedLSE) for final estimate of clean samples instead of arithmetic mean
  const lseResult = calculateWeightedLSE(currentSamples);
  return { result: lseResult.result, usedIndices: currentSamples.map(s => s._originalIdx) };
}



function calculateKMeans(samples: Coordinate[]): { result: Coordinate; usedIndices: number[]; clusters?: number[][] } {
  // 1. Minimum örnek sayısı kontrolü (Kümeleme için en az 2 örnek gereklidir)
  if (samples.length < 2) {
    return {
      result: samples[0] || { lat: 0, lng: 0, accuracy: 0, timestamp: Date.now(), altitude: null, altitudeAccuracy: null },
      usedIndices: samples.map((_, i) => i),
      clusters: []
    };
  }

  // G-Means (Gaussian Means) ile dinamik küme keşfi
  const validClusters = getGMeansClusters(samples);

  // 4. Şampiyon Küme Seçimi (En çok eleman barındıran baskın küme)
  let bestClusterIdx = 0;
  let maxCount = -1;
  for (let i = 0; i < validClusters.length; i++) {
    if (validClusters[i].length > maxCount) {
      maxCount = validClusters[i].length;
      bestClusterIdx = i;
    }
  }

  const championIndices = validClusters[bestClusterIdx] || [];
  const championPoints = championIndices.map(idx => samples[idx]);

  // 5. Şampiyon Küme Elemanları ile Ağırlıklı En Küçük Kareler (WLS) Çözümü
  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of championPoints) {
    const wHardware = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    finalSumW += wHardware;
    finalLatW += p.lat * wHardware;
    finalLngW += p.lng * wHardware;
    totalAccuracy += p.accuracy;
  }

  const validAlts = championPoints.filter(s => s.altitude !== null && s.altitude !== undefined);
  const finalAlt = validAlts.length > 0 ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length : null;

  const validAltAccs = championPoints.filter(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined);
  const finalAltAcc = validAltAccs.length > 0 ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length : null;

  return {
    result: {
      lat: finalLatW / (finalSumW || 1.0),
      lng: finalLngW / (finalSumW || 1.0),
      accuracy: totalAccuracy / (championIndices.length || 1),
      altitude: finalAlt,
      altitudeAccuracy: finalAltAcc,
      timestamp: Date.now()
    },
    usedIndices: championIndices,
    clusters: validClusters
  };
}

/**
 * Reusable dynamic G-Means (Gaussian Means) clustering helper.
 * Recursively splits clusters that reject the 1D Gaussian distribution hypothesis via Anderson-Darling tests.
 */
function getGMeansClusters(samples: Coordinate[]): number[][] {
  if (samples.length < 2) {
    return [samples.map((_, i) => i)];
  }

  const finalClusters: number[][] = [];
  const queue: number[][] = [Array.from({ length: samples.length }, (_, i) => i)];

  const centerLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
  const centerLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(centerLat);

  const toLocal = (p: Coordinate) => ({
    x: (p.lng - centerLng) * lngCoeff,
    y: (p.lat - centerLat) * latCoeff
  });

  function erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return sign * y;
  }

  function normalCDF(val: number): number {
    return 0.5 * (1 + erf(val / Math.sqrt(2)));
  }

  while (queue.length > 0) {
    const C = queue.shift()!;

    if (C.length < 8) {
      finalClusters.push(C);
      continue;
    }

    const subSamples = C.map(idx => samples[idx]);
    const subAssignments = runKMeans(subSamples, 2);

    const C0: number[] = [];
    const C1: number[] = [];
    for (let i = 0; i < subAssignments.length; i++) {
      if (subAssignments[i] === 0) {
        C0.push(C[i]);
      } else {
        C1.push(C[i]);
      }
    }

    if (C0.length === 0 || C1.length === 0) {
      finalClusters.push(C);
      continue;
    }

    const pSub0 = C0.map(idx => toLocal(samples[idx]));
    const pSub1 = C1.map(idx => toLocal(samples[idx]));

    const c0 = {
      x: pSub0.reduce((sum, p) => sum + p.x, 0) / pSub0.length,
      y: pSub0.reduce((sum, p) => sum + p.y, 0) / pSub0.length
    };
    const c1 = {
      x: pSub1.reduce((sum, p) => sum + p.x, 0) / pSub1.length,
      y: pSub1.reduce((sum, p) => sum + p.y, 0) / pSub1.length
    };

    const vx = c0.x - c1.x;
    const vy = c0.y - c1.y;
    const len = Math.sqrt(vx * vx + vy * vy);

    if (len < 1e-6) {
      finalClusters.push(C);
      continue;
    }

    const ux = vx / len;
    const uy = vy / len;

    const projected: number[] = [];
    for (const idx of C) {
      const localPt = toLocal(samples[idx]);
      const proj = localPt.x * ux + localPt.y * uy;
      projected.push(proj);
    }

    const N = projected.length;
    const m = projected.reduce((sum, val) => sum + val, 0) / N;
    const variance = projected.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / N;

    if (variance < 1e-9) {
      finalClusters.push(C);
      continue;
    }

    const std = Math.sqrt(variance);
    const z = projected.map(val => (val - m) / std);

    const sortedZ = [...z].sort((a, b) => a - b);

    let sum = 0;
    for (let i = 0; i < N; i++) {
      const pVal = normalCDF(sortedZ[i]);
      const pValComplement = normalCDF(sortedZ[N - 1 - i]);

      const logP = Math.log(Math.max(1e-15, pVal));
      const log1P = Math.log(Math.max(1e-15, 1 - pValComplement));

      sum += (2 * (i + 1) - 1) * (logP + log1P);
    }
    const A2 = -N - sum / N;

    const A2Star = A2 * (1 + 4 / N - 25 / (N * N));

    const criticalValueGMeans = 1.869;

    if (A2Star > criticalValueGMeans) {
      queue.push(C0);
      queue.push(C1);
    } else {
      finalClusters.push(C);
    }
  }

  return finalClusters.filter(c => c.length > 0);
}

function calculateBaardaPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i) };
  }
  const baardaInput = samples.map((s, idx) => ({ ...s, _originalIdx: idx }));
  const baardaRes = calculateBaardaInternal(baardaInput);
  return {
    result: baardaRes.result,
    usedIndices: baardaRes.usedIndices
  };
}

function calculateBaardaInternalAcademic(samples: any[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const lseResult = calculateWeightedLSE(samples);
    return { result: lseResult.result, usedIndices: samples.map((_, i) => i) };
  }

  let currentSamples = samples.map((s, idx) => ({
    ...s,
    _originalIdx: s._originalIdx !== undefined ? s._originalIdx : idx
  }));
  const criticalValue = 3.29; // Critical limit for 99.9% confidence interval

  while (currentSamples.length > 4) {
    const avgLat0 = currentSamples.reduce((sum, s) => sum + s.lat, 0) / currentSamples.length;
    const { latCoeff, lngCoeff } = getWGS84Coefficients(avgLat0);

    const weights = currentSamples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;

    const localPts = currentSamples.map((s, i) => {
      const dx = (s.lng - meanLng) * lngCoeff;
      const dy = (s.lat - meanLat) * latCoeff;
      return { dx, dy, w: weights[i] };
    });

    let vTPv = 0;
    for (const pt of localPts) {
      vTPv += (pt.dx * pt.dx + pt.dy * pt.dy) * pt.w;
    }

    const N = currentSamples.length;
    const f = 2 * N - 2; // Degrees of freedom: 2N - 2 parameters (meanLat, meanLng)
    const sigma0_sq = vTPv / (f > 0 ? f : 1);
    const sigma0 = Math.sqrt(sigma0_sq > 1e-10 ? sigma0_sq : 1e-10);

    const standardizedResiduals = currentSamples.map((s, i) => {
      const pt = localPts[i];
      const p_i = weights[i];
      const q_ii = Math.max(1e-4, 1.0 - (p_i / sumW));
      const dist_v = Math.sqrt(pt.dx * pt.dx + pt.dy * pt.dy);
      // Standart geodezik Baarda w-testi formülü: w_i = (v_i * sqrt(p_i)) / (sigma0 * sqrt(1 - h_i))
      return (dist_v * Math.sqrt(p_i)) / (sigma0 * Math.sqrt(q_ii));
    });

    let maxW = -1;
    let worstIdx = -1;
    for (let i = 0; i < standardizedResiduals.length; i++) {
        if (standardizedResiduals[i] > maxW) {
            maxW = standardizedResiduals[i];
            worstIdx = i;
        }
    }

    if (maxW > criticalValue) {
        currentSamples.splice(worstIdx, 1);
    } else {
        break; 
    }
  }

  // Geodetically sound Weighted Least Squares solution of cleaned sample set
  const lseResult = calculateWeightedLSE(currentSamples);
  return { result: lseResult.result, usedIndices: currentSamples.map(s => s._originalIdx) };
}

function calculateBaardaPureAcademic(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i) };
  }
  const baardaInput = samples.map((s, idx) => ({ ...s, _originalIdx: idx }));
  const baardaRes = calculateBaardaInternalAcademic(baardaInput);
  return {
    result: baardaRes.result,
    usedIndices: baardaRes.usedIndices
  };
}

/**
 * HYBRID_v1 Model
 * 1. Speed filtering: dynamic limit of speed < 1.0 m/s
 * 2. Hodges-Lehmann robust estimation on the surviving epochs
 * 3. G-Means spatial clustering on the HL-surviving epochs
 * 4. Cluster density weight determination (cluster epoch count / total surviving epoch count)
 * 5. Joint WLS solver using cluster density weights and hardware accuracy (p_i = wCluster * (1 / accuracy^2))
 */
export function calculateHybridV1(samples: Coordinate[]): {
  result: Coordinate;
  usedIndices: number[];
  clusters?: number[][];
  fallbackApplied?: boolean;
  actualMethodUsed?: CalculationMethod;
} {
  if (samples.length < 4) {
    return {
      result: calculateWeightedLSE(samples).result,
      usedIndices: samples.map((_, i) => i),
      clusters: [],
      fallbackApplied: true,
      actualMethodUsed: 'WEIGHTED_LSE'
    };
  }

  // 1. First Phase: Speed Filtering (epok hızı < 1.0 m/s)
  const checkIsMoving = (s: Coordinate) => {
    if (s.speed !== null && s.speed !== undefined) {
      const speedNum = typeof s.speed === 'string' ? parseFloat(s.speed) : Number(s.speed);
      if (!isNaN(speedNum) && speedNum >= 1.0) {
        return true; // Moving, exclude
      }
    }
    return false;
  };

  let speedFiltered = samples
    .map((s, idx) => ({ s, idx }))
    .filter(item => !checkIsMoving(item.s));

  // Safeguard: if speed filtering leaves us with fewer than 4 points, get the 4 points with the lowest speed
  if (speedFiltered.length < 4) {
    const sortedBySpeed = samples
      .map((s, idx) => {
        const speedVal = s.speed !== null && s.speed !== undefined ? (typeof s.speed === 'string' ? parseFloat(s.speed) : Number(s.speed)) : 0;
        return { s, idx, speedVal: isNaN(speedVal) ? 0 : speedVal };
      })
      .sort((a, b) => a.speedVal - b.speedVal);
    speedFiltered = sortedBySpeed.slice(0, 4).map(item => ({ s: item.s, idx: item.idx }));
  }

  // 2. Second Phase: Hodges-Lehmann Filter
  // Run Hodges-Lehmann on speed-filtered epochs to eliminate outliers
  const hlInput = speedFiltered.map(x => x.s);
  const hlRes = calculateHodgesLehmannPure(hlInput);

  // Map HL used indices (local to speed-filtered array) back to the original index positions of the samples array
  const hlFilteredIndices = hlRes.usedIndices.map(localIdx => speedFiltered[localIdx].idx);
  const hlFilteredSamples = hlFilteredIndices.map(idx => samples[idx]);

  if (hlFilteredSamples.length < 2) {
    // Highly unlikely fallback, run WLS on speedFiltered
    const fallbackLse = calculateWeightedLSE(speedFiltered.map(x => x.s));
    return {
      result: fallbackLse.result,
      usedIndices: speedFiltered.map(x => x.idx),
      clusters: [],
      fallbackApplied: true,
      actualMethodUsed: 'WEIGHTED_LSE'
    };
  }

  // 3. Third Phase: G-Means Adaptive spatial clustering on the Hodges-Lehmann surviving epochs
  const validClustersLocal = getGMeansClusters(hlFilteredSamples);

  // Map local cluster assignments to original indices for reporting/plotting
  const finalClusters = validClustersLocal.map(cluster => cluster.map(localIdx => hlFilteredIndices[localIdx]));

  // 4. Fourth Phase: Cluster Weights & Joint Weighted Least Squares
  const finalWeights = hlFilteredSamples.map((s, index) => {
    // Cluster Density weight: cluster size / total remaining epochs
    const clusterIdx = validClustersLocal.findIndex(c => c.includes(index));
    const clusterSize = clusterIdx !== -1 ? validClustersLocal[clusterIdx].length : 1.0;
    const wCluster = clusterSize / hlFilteredSamples.length;

    // Hardware weight: 1.0 / (accuracy * accuracy)
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, s.accuracy), 2);

    // Joint Combined Weight
    return wCluster * hardwareWeight;
  });

  const sumW = finalWeights.reduce((a, b) => a + b, 0) || 1.0;
  const finalLat = hlFilteredSamples.reduce((sum, p, i) => sum + p.lat * finalWeights[i], 0) / sumW;
  const finalLng = hlFilteredSamples.reduce((sum, p, i) => sum + p.lng * finalWeights[i], 0) / sumW;

  const avgCoords = calculateAverage(hlFilteredSamples);

  const finalResult: Coordinate = {
    ...hlFilteredSamples[0],
    lat: finalLat,
    lng: finalLng,
    accuracy: avgCoords.accuracy,
    timestamp: Date.now()
  };

  const validAlts = hlFilteredSamples.filter(s => s.altitude !== null && s.altitude !== undefined);
  finalResult.altitude = validAlts.length > 0
    ? validAlts.reduce((sum, s) => sum + (s.altitude || 0), 0) / validAlts.length
    : null;

  const validAltAccs = hlFilteredSamples.filter(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined);
  finalResult.altitudeAccuracy = validAltAccs.length > 0
    ? validAltAccs.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / validAltAccs.length
    : null;

  return {
    result: finalResult,
    usedIndices: hlFilteredIndices,
    clusters: finalClusters,
    fallbackApplied: false,
    actualMethodUsed: 'WEIGHTED_LSE'
  };
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

  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

  const maxIterations = 15;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
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
  const finalPseudoSigma = finalMAD * 1.4826;
  // Pure 1.345-sigma Huber outlier threshold boundary (95% asymptotic efficiency academic gate)
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = 1.345 * stableFinalPseudoSigma;

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

  const subMAD = calculateMADHuber(cleanSamples, currentLat, currentLng);
  const subPseudoSigma = subMAD * 1.4826;
  const stableSubPseudoSigma = subPseudoSigma > 1e-7 ? subPseudoSigma : 1e-7;
  const finalHuberLimit = 1.345 * stableSubPseudoSigma;

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    const huberWeight = dist <= finalHuberLimit ? 1.0 : finalHuberLimit / Math.max(0.001, dist);
    const combinedWeight = hardwareWeight * huberWeight;

    finalSumW += combinedWeight;
    finalLatW += p.lat * combinedWeight;
    finalLngW += p.lng * combinedWeight;
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

  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

  const maxIterations = 20;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
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
  const finalPseudoSigma = finalMAD * 1.4826;
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

export function calculateMMEstimatorPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  // Stage 1: Robust initial estimate using Optimal S-Estimator (First Stage)
  const sEstimatorResult = calculateOptimalSPure(samples);
  let currentLat = sEstimatorResult.result.lat;
  let currentLng = sEstimatorResult.result.lng;

  // Stage 2: Refinement using Huber M-Estimator starting from S-Estimator's location (Second Stage)
  const maxIterations = 15;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
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
  const finalPseudoSigma = finalMAD * 1.4826;
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = 1.345 * stableFinalPseudoSigma;

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
 * Helper function for Inverse Normal CDF (using the Beasley-Springer-Moro rational approximation)
 */
function inverseNormalCDF(p: number): number {
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  
  if (p <= 0 || p >= 1) return 1.96;
  const t = Math.sqrt(-2.0 * Math.log(p < 0.5 ? p : 1.0 - p));
  const z = t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0);
  return p < 0.5 ? -z : z;
}

/**
 * Calculates academic Student's t distribution critical values using Hill's asymptotic approximation for df >= 3
 */
function getStudentTCriticalValue(alpha: number, df: number): number {
  const p = alpha / 2;
  const z = Math.abs(inverseNormalCDF(p));
  if (df <= 1) return 12.706; // extremely low df fallback
  if (df === 2) return 4.303;
  if (df === 3) return 3.182;
  if (df === 4) return 2.776;
  if (df === 5) return 2.571;
  
  const zSq = z * z;
  const g1 = (zSq + 1) / 4;
  const g2 = (5 * zSq * zSq + 16 * zSq + 3) / 96;
  const g3 = (3 * zSq * zSq * zSq + 19 * zSq * zSq + 17 * zSq - 15) / 384;
  
  const val = z + (z * g1) / df + (z * g2) / (df * df) + (z * g3) / (df * df * df);
  return val;
}

/**
 * Derives critical values for Pope's Tau distribution using its exact geometric relationship with Student's t:
 * Tau_crit = (t * sqrt(f)) / sqrt(f - 1 + t^2) where f is degrees of freedom.
 */
function getPopeTauCriticalValue(alpha: number, f: number): number {
  const df_t = f - 1;
  if (df_t < 1) return 1.5;
  const t = getStudentTCriticalValue(alpha, df_t);
  const denom = df_t + t * t;
  if (denom <= 0) return 1.5;
  return (t * Math.sqrt(f)) / Math.sqrt(denom);
}

/**
 * Computes the robust Median Absolute Deviation (MAD) of residuals as a scale estimator.
 * MAD = 1.4826 * median(|v_i - median(v_j)|)
 */
function calculateRobustSigmaMAD(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianVal = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  
  const absDevs = values.map(v => Math.abs(v - medianVal));
  const sortedDevs = absDevs.sort((a, b) => a - b);
  const medianDev = sortedDevs.length % 2 !== 0 
    ? sortedDevs[mid] 
    : (sortedDevs[mid - 1] + sortedDevs[mid]) / 2;
    
  return 1.4826 * medianDev;
}

/**
 * Pope's Tau Test (Pope's L1/L2 Data Snooping) Outlier Detection
 * Specially designed and adapted for geodetic 2D coordinate network adjustment:
 * - Computes localized 2D coordinate-wise residuals.
 * - Identifies studentized/standardized observational residuals incorporating real leverage factors (h_i) from the parameter design matrix.
 * - Compares the maximum standardized residual iteratively against Pope's Tau critical value with degrees of freedom (f = 2N - 2).
 * - Implements Bonferroni significance correction alpha_adj = 0.05 / N to robustly screen multipath anomalies.
 */
export function calculatePopeTauAcademic(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  let currentSamples = samples.map((s, idx) => ({ ...s, _originalIdx: idx }));
  const avgLat0 = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
  const avgLng0 = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(avgLat0);

  while (currentSamples.length >= 4) {
    const N = currentSamples.length;
    const weights = currentSamples.map(s => 1.0 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, s, i) => a + s.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, s, i) => a + s.lng * weights[i], 0) / sumW;

    const localPts = currentSamples.map((s, i) => {
      const dx = (s.lng - meanLng) * lngCoeff;
      const dy = (s.lat - meanLat) * latCoeff;
      return { dx, dy, w: weights[i] };
    });

    let vTPv = 0;
    for (const pt of localPts) {
      vTPv += (pt.dx * pt.dx + pt.dy * pt.dy) * pt.w;
    }

    const f = 2 * N - 2;
    const sigma0_sq = vTPv / f;
    const sigma0 = Math.sqrt(sigma0_sq > 1e-10 ? sigma0_sq : 1e-10);

    let maxTau = -1;
    let worstLocalIdx = -1;

    for (let i = 0; i < N; i++) {
      const pt = localPts[i];
      const h_i = pt.w / sumW;
      const q_vv = Math.max(0.001, 1.0 - h_i);
      
      const dist_v = Math.sqrt(pt.dx * pt.dx + pt.dy * pt.dy);
      const tau_i = (dist_v * Math.sqrt(pt.w)) / (sigma0 * Math.sqrt(q_vv));

      if (tau_i > maxTau) {
        maxTau = tau_i;
        worstLocalIdx = i;
      }
    }

    const alpha = 0.05;
    const alpha_adj = alpha / N;
    const tau_crit = getPopeTauCriticalValue(alpha_adj, f);

    if (maxTau > tau_crit) {
      currentSamples.splice(worstLocalIdx, 1);
    } else {
      break;
    }
  }

  const finalResult = calculateWeightedLSE(currentSamples);
  return {
    result: finalResult.result,
    usedIndices: currentSamples.map(s => s._originalIdx)
  };
}

/**
 * Hampel Identifier for Outlier Detection
 * Pure academic implementation for 2D spatial coordinate datasets:
 * - Computes the spatial median center (median of Latitudes and Longitudes separately).
 * - Identifies the Euclidean distance of each sample from this median point in meters.
 * - Computes the Median Absolute Deviation (MAD) of these distances.
 * - Scales the MAD with the standard consistency factor (1.4826) to obtain the robust estimate of scale (sigma).
 * - Discards samples whose absolute distance from the median distance exceeds 3.0 * sigma.
 * - Guarantees a minimum of 2 samples are kept (falling back to those with minimum deviations) to avoid rank deficiency.
 */
export function calculateHampelAcademic(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  const N = samples.length;
  // Spatial median coordinates
  const sortedLats = samples.map(s => s.lat).sort((a, b) => a - b);
  const sortedLngs = samples.map(s => s.lng).sort((a, b) => a - b);
  const mid = Math.floor(N / 2);
  const medianLat = N % 2 !== 0 ? sortedLats[mid] : (sortedLats[mid - 1] + sortedLats[mid]) / 2;
  const medianLng = N % 2 !== 0 ? sortedLngs[mid] : (sortedLngs[mid - 1] + sortedLngs[mid]) / 2;

  // Distances to spatial median in meters
  const dists = samples.map(s => calculateDistanceMeter(s.lat, s.lng, medianLat, medianLng, medianLat));
  
  // Median distance
  const sortedDists = [...dists].sort((a, b) => a - b);
  const medianDist = N % 2 !== 0 ? sortedDists[mid] : (sortedDists[mid - 1] + sortedDists[mid]) / 2;

  // Absolute deviations from the median distance
  const absDevs = dists.map(d => Math.abs(d - medianDist));
  const sortedDevs = [...absDevs].sort((a, b) => a - b);
  const medianDev = N % 2 !== 0 ? sortedDevs[mid] : (sortedDevs[mid - 1] + sortedDevs[mid]) / 2;

  const mad = medianDev;
  const scaleSigma = 1.4826 * mad;

  // If robust scale is virtually zero, all points are extremely clustered. No outliers should be removed.
  const minSigmaBoundary = 1e-6; // 1 micrometer

  const inlierIndices: number[] = [];
  
  if (scaleSigma < minSigmaBoundary) {
    // Keep all
    return {
      result: calculateWeightedLSE(samples).result,
      usedIndices: samples.map((_, i) => i)
    };
  }

  for (let i = 0; i < N; i++) {
    if (absDevs[i] <= 3.0 * scaleSigma) {
      inlierIndices.push(i);
    }
  }

  // Fallback protection: ensure we keep at least 2 samples with the lowest deviations
  let finalUsedIndices = inlierIndices;
  if (finalUsedIndices.length < 2) {
    const sortedSampleIndices = samples
      .map((_, idx) => ({ idx, dev: absDevs[idx] }))
      .sort((a, b) => a.dev - b.dev);
    finalUsedIndices = [sortedSampleIndices[0].idx, sortedSampleIndices[1].idx];
  }

  const filteredSamples = finalUsedIndices.map(idx => samples[idx]);
  const finalResult = calculateWeightedLSE(filteredSamples);

  return {
    result: finalResult.result,
    usedIndices: finalUsedIndices
  };
}

export function calculateAndrewsWavePure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

  const maxIterations = 15;
  const toleranceMeter = 0.001;
  const c = 1.339; // Andrews Wave constant

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
    const stablePseudoSigma = pseudoSigma > 1e-7 ? pseudoSigma : 1e-7;
    const limit = c * stablePseudoSigma;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);

      const u = dist / stablePseudoSigma;
      let andrewsWeight = 0;
      if (dist <= limit * Math.PI) {
        if (dist > 1e-5) {
          const u_scaled = u / c;
          andrewsWeight = Math.sin(u_scaled) / u_scaled;
        } else {
          andrewsWeight = 1.0;
        }
      } else {
        andrewsWeight = 0;
      }

      const combinedWeight = hardwareWeight * andrewsWeight;

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
  const finalPseudoSigma = finalMAD * 1.4826;
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = c * Math.PI * stableFinalPseudoSigma;

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

  const subMAD = calculateMADHuber(cleanSamples, currentLat, currentLng);
  const subPseudoSigma = subMAD * 1.4826;
  const stableSubPseudoSigma = subPseudoSigma > 1e-7 ? subPseudoSigma : 1e-7;
  const finalLimit = c * stableSubPseudoSigma;

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    
    const u = dist / stableSubPseudoSigma;
    let andrewsWeight = 0;
    if (dist <= finalLimit * Math.PI) {
      if (dist > 1e-5) {
        const u_scaled = u / c;
        andrewsWeight = Math.sin(u_scaled) / u_scaled;
      } else {
        andrewsWeight = 1.0;
      }
    } else {
      andrewsWeight = 0;
    }

    const combinedWeight = hardwareWeight * andrewsWeight;

    finalSumW += combinedWeight;
    finalLatW += p.lat * combinedWeight;
    finalLngW += p.lng * combinedWeight;
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

export function calculateTukeysBiweightPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

  const maxIterations = 15;
  const toleranceMeter = 0.001;
  const c = 4.685; // Tukey's constant for 95% efficiency

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
    const stablePseudoSigma = pseudoSigma > 1e-7 ? pseudoSigma : 1e-7;
    const limit = c * stablePseudoSigma;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);

      const u = dist / stablePseudoSigma;
      let tukeyWeight = 0;
      if (dist <= limit) {
        tukeyWeight = Math.pow(1.0 - Math.pow(u / c, 2), 2);
      } else {
        tukeyWeight = 0;
      }

      const combinedWeight = hardwareWeight * tukeyWeight;

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
  const finalPseudoSigma = finalMAD * 1.4826;
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = c * stableFinalPseudoSigma;

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

  const subMAD = calculateMADHuber(cleanSamples, currentLat, currentLng);
  const subPseudoSigma = subMAD * 1.4826;
  const stableSubPseudoSigma = subPseudoSigma > 1e-7 ? subPseudoSigma : 1e-7;
  const finalLimit = c * stableSubPseudoSigma;

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    
    const u = dist / stableSubPseudoSigma;
    let tukeyWeight = 0;
    if (dist <= finalLimit) {
      tukeyWeight = Math.pow(1.0 - Math.pow(u / c, 2), 2);
    } else {
      tukeyWeight = 0;
    }

    const combinedWeight = hardwareWeight * tukeyWeight;

    finalSumW += combinedWeight;
    finalLatW += p.lat * combinedWeight;
    finalLngW += p.lng * combinedWeight;
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

export function calculateDanishPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

  const maxIterations = 15;
  const toleranceMeter = 0.001;
  const c = 2.0; // Danish threshold parameter
  const a = 1.0; // decay factor

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
    const stablePseudoSigma = pseudoSigma > 1e-7 ? pseudoSigma : 1e-7;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);

      const u = dist / stablePseudoSigma;
      let danishWeight = 1.0;
      if (u > c) {
        danishWeight = Math.exp(-a * (u - c));
      }

      const combinedWeight = hardwareWeight * danishWeight;

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
  const finalPseudoSigma = finalMAD * 1.4826;
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  
  // Under Danish, outliers are gently downweighted but we filter them using a standard 3-sigma gate for final representation
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

  const subMAD = calculateMADHuber(cleanSamples, currentLat, currentLng);
  const subPseudoSigma = subMAD * 1.4826;
  const stableSubPseudoSigma = subPseudoSigma > 1e-7 ? subPseudoSigma : 1e-7;

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    
    const u = dist / stableSubPseudoSigma;
    let danishWeight = 1.0;
    if (u > c) {
      danishWeight = Math.exp(-a * (u - c));
    }

    const combinedWeight = hardwareWeight * danishWeight;

    finalSumW += combinedWeight;
    finalLatW += p.lat * combinedWeight;
    finalLngW += p.lng * combinedWeight;
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
  const scaleSigma = 1.4826 * mad;

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
  const scaleSigma = 1.4826 * mad;
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











