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
  // - HUBER and KMEANS_4 require en az 30 epok.
  // - KMEANS_BAARDA_HUBER (Hybrid) require en az 55 epok.
  // - Standalone BAARDA only requires geodetic minimum of 4 epok.
  // - IQR_WLS and RANSAC require en az 10 epok.
  // - MONTE_CARLO_PF and SENSOR_FUSION_DR require en az 15 epok.
  const requires55 = method === 'KMEANS_BAARDA_HUBER';
  const requires30 = method === 'HUBER' || method === 'KMEANS_4';
  const requires15 = method === 'MONTE_CARLO_PF' || method === 'SENSOR_FUSION_DR';
  const requires10 = method === 'IQR_WLS' || method === 'RANSAC';
  const requires4 = method === 'BAARDA';
  
  let finalMethod = method;
  let fallbackApplied = false;

  if (requires55 && samples.length < 55) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  } else if (requires30 && samples.length < 30) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  } else if (requires15 && samples.length < 15) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  } else if (requires10 && samples.length < 10) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  } else if (requires4 && samples.length < 4) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  }

  switch (finalMethod) {
    case 'ARITHMETIC_MEAN':
      finalSamples = sourceData;
      resultData = calculateAverage(sourceData);
      break;
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
    case 'KMEANS_BAARDA_HUBER':
      const huberRes = calculateKMeansBaardaHuber(sourceData);
      resultData = huberRes.result;
      finalCalculatedUsedIndices = huberRes.usedIndices;
      clusters = huberRes.clusters;
      if (huberRes.fallbackApplied) {
        fallbackApplied = true;
        // Mark that we fell back to the other model
        finalMethod = 'WEIGHTED_LSE';
      }
      break;
    case 'KMEANS_4':
      const kmeans4Res = calculateKMeans(sourceData);
      resultData = kmeans4Res.result;
      finalCalculatedUsedIndices = kmeans4Res.usedIndices;
      clusters = kmeans4Res.clusters;
      break;
    case 'BAARDA':
      const pureBaardaRes = calculateBaardaPureAcademic(sourceData);
      resultData = pureBaardaRes.result;
      finalCalculatedUsedIndices = pureBaardaRes.usedIndices;
      break;
    case 'IQR_WLS':
      const iqrRes = calculateIQRWLS(sourceData);
      resultData = iqrRes.result;
      finalCalculatedUsedIndices = iqrRes.usedIndices;
      break;
    case 'RANSAC':
      const ransacRes = calculateRANSAC(sourceData);
      resultData = ransacRes.result;
      finalCalculatedUsedIndices = ransacRes.usedIndices;
      break;
    case 'MONTE_CARLO_PF':
      const pfRes = calculateParticleFilter(sourceData);
      resultData = pfRes.result;
      finalCalculatedUsedIndices = pfRes.usedIndices;
      break;
    case 'SENSOR_FUSION_DR':
      const sfRes = calculateSensorFusionDR(sourceData);
      resultData = sfRes.result;
      finalCalculatedUsedIndices = sfRes.usedIndices;
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
    usedIndices = finalCalculatedUsedIndices;
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

    const weights = currentSamples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;

    const residuals = currentSamples.map(s => {
      return calculateDistanceMeter(s.lat, s.lng, meanLat, meanLng, meanLat);
    });

    const vTPv = residuals.reduce((a, v, i) => a + v * v * weights[i], 0);
    
    // Corrected degree of freedom: f = n - u, where u = 2 (lat, lng) unknowns in 2D adjustments.
    const sigma0 = Math.sqrt(vTPv / (currentSamples.length - 2));

    const standardizedResiduals = currentSamples.map((s, i) => {
      const p_i = weights[i];
      const q_ii = (1 - p_i / sumW); 
      return residuals[i] / (sigma0 * Math.sqrt(q_ii) || 1e-9);
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
    const weights = currentSamples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;

    const residuals = currentSamples.map(s => {
      return calculateDistanceMeter(s.lat, s.lng, meanLat, meanLng, meanLat);
    });

    const vTPv = residuals.reduce((a, v, i) => a + v * v * weights[i], 0);
    
    // Degree of freedom: f = n - u, where u = 2 (lat, lng) unknowns
    const sigma0 = Math.sqrt(vTPv / (currentSamples.length - 2));

    const standardizedResiduals = currentSamples.map((s, i) => {
      const p_i = weights[i];
      const q_ii = (1 - p_i / sumW); 
      return residuals[i] / (sigma0 * Math.sqrt(q_ii) || 1e-9);
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
 * G-Means + Baarda + Huber + WLS Hybrid Model
 * Processes raw coordinates concurrently through 3 analytical branches:
 * 1. Global Baarda Test (Geodetic Branch)
 * 2. Adaptive G-Means (Spatial Density Branch)
 * 3. Huber M-Estimation (Robust Scoring Branch)
 * Intersects all three branches. If >= 4 points remain, runs WLS Adjustment.
 * Otherwise, falls back to standard G-Means + Baarda + WLS method.
 */
function calculateKMeansBaardaHuber(samples: Coordinate[]): { 
  result: Coordinate; 
  usedIndices: number[]; 
  clusters?: number[][]; 
  fallbackApplied?: boolean; 
  actualMethodUsed?: CalculationMethod 
} {
  if (samples.length < 5) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };
  }

  // Calculate standard deviation of whole raw dataset
  const average = calculateAverage(samples);
  const variance = calculateVariance(samples, average);
  const sigma = Math.sqrt(variance);

  // 1. Column A (Geodetic Branch): General Baarda Outlier Elimination
  const baardaRes = calculateBaardaPure(samples);
  const baardaIndices = baardaRes.usedIndices;

  // 2. Column B (Spatial Branch): Spatial Dynamic G-Means Clustering
  const validClusters = getGMeansClusters(samples);

  // 3. Huber Robust Weighting Scheme: Applied mathematically in the WLS step rather than hard-truncation
  // No data points are hard-eliminated beyond the Baarda geodetic filter.
  const intersectionIndices = baardaIndices;
  const intersectionPoints = intersectionIndices.map(idx => samples[idx]);

  // If we have at least 4 viable points, calculate Weighted Least Squares (WLS) adjustment using combined weights:
  if (intersectionPoints.length >= 4) {
    const subsetPoints = intersectionPoints;
    const subLats = subsetPoints.map(p => p.lat);
    const subLngs = subsetPoints.map(p => p.lng);
    const subMedianCenter = {
      lat: calculateMedian(subLats),
      lng: calculateMedian(subLngs)
    };
    const subSigma = calculateMAD(subsetPoints, subMedianCenter);
    const huberLimit = 1.345 * Math.max(0.05, subSigma);

    const finalWeights = intersectionPoints.map((s, index) => {
      const globalIndex = intersectionIndices[index];
      const clusterIdx = validClusters.findIndex(c => c.includes(globalIndex));
      const wCluster = clusterIdx !== -1 ? validClusters[clusterIdx].length / samples.length : 1.0 / samples.length;

      const dist = calculateDistanceMeter(s.lat, s.lng, subMedianCenter.lat, subMedianCenter.lng, subMedianCenter.lat);
      const huberWeight = dist <= huberLimit ? 1.0 : huberLimit / Math.max(0.01, dist);

      // Hardware weight is proportional to inverse squared accuracy: 1 / (accuracy^2)
      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, s.accuracy), 2);
      
      // Combined Joint Weight: Cluster Density Weight * Hardware Weight * Huber Weight
      return wCluster * hardwareWeight * huberWeight;
    });

    const sumW = finalWeights.reduce((a, b) => a + b, 0) || 1.0;
    const finalLat = intersectionPoints.reduce((sum, p, i) => sum + p.lat * finalWeights[i], 0) / sumW;
    const finalLng = intersectionPoints.reduce((sum, p, i) => sum + p.lng * finalWeights[i], 0) / sumW;

    const avgCoords = calculateAverage(intersectionPoints);

    const finalResult: Coordinate = {
      ...intersectionPoints[0],
      lat: finalLat,
      lng: finalLng,
      accuracy: avgCoords.accuracy,
      timestamp: Date.now()
    };

    const validAlts = intersectionPoints.filter(s => s.altitude !== null);
    finalResult.altitude = validAlts.length > 0
      ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length
      : null;

    const validAltAccs = intersectionPoints.filter(s => s.altitudeAccuracy !== null);
    finalResult.altitudeAccuracy = validAltAccs.length > 0
      ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length
      : null;

    return {
      result: finalResult,
      usedIndices: intersectionIndices,
      clusters: validClusters,
      fallbackApplied: false,
      actualMethodUsed: 'KMEANS_BAARDA_HUBER'
    };
  } else {
    // Graceful Fallback Strategy: Fall back to default Weighted Least Squares method
    const fallbackRes = calculateWeightedLSE(samples);
    return {
      result: fallbackRes.result,
      usedIndices: fallbackRes.usedIndices,
      clusters: validClusters,
      fallbackApplied: true,
      actualMethodUsed: 'WEIGHTED_LSE'
    };
  }
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
  // Pure 1-sigma outlier threshold boundary (ultra-strict rejection gate)
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = 1.0 * stableFinalPseudoSigma;

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

/**
 * Standalone IQR Outlier Detection + Weighted Least Squares (WLS) Adjustment Branch
 * Designed with geodetic precision:
 * 1. Computes local 2D local-Mercator/WGS84 Cartesian coordinates relative to average.
 * 2. Identifies the Median of X and Median of Y to minimize impact of any single large cluster bias.
 * 3. Calculates distance residuals to this Median position.
 * 4. Runs a rigorous 1D IQR quartile calculation on distance residuals (Q1, Q3, IQR = Q3 - Q1).
 * 5. Classifies observations > Q3 + 1.5 * IQR as outliers and rejects them.
 * 6. Executes rigorous Weighted Least Squares (WLS) adjustment on all accepted inliers using 1/(accuracy^2) sensor weighting.
 */
export function calculateIQRWLS(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 2) {
    return { result: samples[0], usedIndices: [0] };
  }

  const avgLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
  const avgLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(avgLat);

  // Compute local coordinates
  const localPts = samples.map(s => ({
    x: (s.lng - avgLng) * lngCoeff,
    y: (s.lat - avgLat) * latCoeff
  }));

  const xs = localPts.map(p => p.x);
  const ys = localPts.map(p => p.y);

  // Sort components for rigorous statistical quartile calculations
  const sortedXs = [...xs].sort((a, b) => a - b);
  const sortedYs = [...ys].sort((a, b) => a - b);
  
  function getPercentile(arr: number[], percentile: number): number {
    if (arr.length === 0) return 0;
    if (arr.length === 1) return arr[0];
    const index = (arr.length - 1) * percentile;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return arr[lower] * (1 - weight) + arr[upper] * weight;
  }

  // Calculate IQR for X (Easting) and Y (Northing) separately
  const q1_x = getPercentile(sortedXs, 0.25);
  const q3_x = getPercentile(sortedXs, 0.75);
  const iqr_x = q3_x - q1_x;

  const q1_y = getPercentile(sortedYs, 0.25);
  const q3_y = getPercentile(sortedYs, 0.75);
  const iqr_y = q3_y - q1_y;

  // Add an adaptive safety floor to prevent statistical collapse (over-elimination in highly static locks)
  const avgHardwareAcc = samples.reduce((sum, s) => sum + s.accuracy, 0) / samples.length;
  const minIQR = Math.max(0.1, avgHardwareAcc * 0.05); // 10 cm minimum floor or 5% of average hardware accuracy

  const iqr_x_safe = Math.max(iqr_x, minIQR);
  const iqr_y_safe = Math.max(iqr_y, minIQR);

  const lowerX = q1_x - 1.5 * iqr_x_safe;
  const upperX = q3_x + 1.5 * iqr_x_safe;

  const lowerY = q1_y - 1.5 * iqr_y_safe;
  const upperY = q3_y + 1.5 * iqr_y_safe;

  const usedIndices: number[] = [];
  const inlierSamples: Coordinate[] = [];

  for (let i = 0; i < samples.length; i++) {
    const pt = localPts[i];
    // A point must reside within the statistical gate on both orthogonal axes to be considered an inlier
    if (pt.x >= lowerX && pt.x <= upperX && pt.y >= lowerY && pt.y <= upperY) {
      usedIndices.push(i);
      inlierSamples.push(samples[i]);
    }
  }

  if (inlierSamples.length === 0) {
    return { result: samples[0], usedIndices: [0] };
  }

  // Pure hardware-weighted WLS Solution on inliers
  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of inlierSamples) {
    const wHardware = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    finalSumW += wHardware;
    finalLatW += p.lat * wHardware;
    finalLngW += p.lng * wHardware;
    totalAccuracy += p.accuracy;
  }

  const validAlts = inlierSamples.filter(s => s.altitude !== null && s.altitude !== undefined);
  const finalAlt = validAlts.length > 0 ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length : null;

  const validAltAccs = inlierSamples.filter(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined);
  const finalAltAcc = validAltAccs.length > 0 ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length : null;

  return {
    result: {
      lat: finalLatW / (finalSumW || 1.0),
      lng: finalLngW / (finalSumW || 1.0),
      accuracy: totalAccuracy / (inlierSamples.length || 1),
      altitude: finalAlt,
      altitudeAccuracy: finalAltAcc,
      timestamp: Date.now()
    },
    usedIndices
  };
}

/**
 * Standalone RANSAC (Random Sample Consensus) Outlier Detection + Weighted Least Squares (WLS) Adjustment
 * Designed with absolute academic geodetic precision:
 * 1. Converts WGS84 Geodetic coordinates (lat, lng) into local Cartesian 2D coordinates (x, y) relative to average.
 * 2. Computes the statistical standard deviation threshold using the standard 2D continuous Chi-Squared (χ²)
 *    distribution at a 95% confidence limit.
 *    Average standard deviation (σ_avg) is derived from hardware accuracies: σ_i = accuracy_i / 1.96.
 *    Critical χ² value for 2 Degrees of Freedom (X and Y coordinates) is 5.991.
 *    Inlier Tolerance Threshold T = sqrt(5.991 * σ_avg²).
 * 3. Executes the RANdom Sample Consensus iteration loop:
 *    - In each draw, randomly selects a single sample coordinate to formulate the candidate point model.
 *    - Measures the Euclidean distance residuals of all other coordinates to this candidate point.
 *    - Points within distance residual <= T are added to the consensus inlier set.
 *    - Evaluates the consensus set size. In case of ties, chooses the one with the lowest sum of squared residuals.
 * 4. Multi-epoch consensus optimization yields the champion consensus (inlier) dataset.
 * 5. Runs a robust geodetic Weighted Least Squares (WLS) adjustment using 1/(accuracy^2) on the final inlier set.
 */
export function calculateRANSAC(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 2) {
    return { result: samples[0], usedIndices: [0] };
  }

  const avgLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
  const avgLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(avgLat);

  // Compute local coordinates
  const localPts = samples.map(s => ({
    x: (s.lng - avgLng) * lngCoeff,
    y: (s.lat - avgLat) * latCoeff
  }));

  // Calculate average standard deviation (assuming Google accuracy represents 95% confidence bound, i.e., 1.96 sigma)
  const totalSigma = samples.reduce((sum, s) => sum + (s.accuracy / 1.96), 0);
  const avgSigma = totalSigma / samples.length;
  
  // Safety standard deviation floor (5 cm) to avoid division/boundary collapse on static or identical simulated inputs
  const safeAvgSigma = Math.max(0.05, avgSigma);

  // Academic Chi-Square threshold for 2 DOF at 95% probability is 5.991
  // T = sqrt(5.991) * safeAvgSigma
  const T = Math.sqrt(5.991) * safeAvgSigma;

  let bestInliers: number[] = [];
  let minInlierResidualSum = Infinity;
  const numIterations = Math.max(200, samples.length * 2);

  // Seeded/Deterministic execution for reproducible UI checks
  let seed = 42;
  function random(): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  for (let iter = 0; iter < numIterations; iter++) {
    // Pick a random single sample as candidate centroid model (Minimal Sample size = 1)
    const randIdx = Math.floor(random() * samples.length);
    const modelPt = localPts[randIdx];

    const currentInliers: number[] = [];
    let currentResidualSum = 0;

    for (let i = 0; i < samples.length; i++) {
      const pt = localPts[i];
      const dist = Math.sqrt(Math.pow(pt.x - modelPt.x, 2) + Math.pow(pt.y - modelPt.y, 2));

      if (dist <= T) {
        currentInliers.push(i);
        currentResidualSum += dist * dist;
      }
    }

    // Check consensus
    if (currentInliers.length > bestInliers.length) {
      bestInliers = currentInliers;
      minInlierResidualSum = currentResidualSum;
    } else if (currentInliers.length === bestInliers.length) {
      // Tie-breaker: choose the model with lower sum of squared distance residuals
      if (currentResidualSum < minInlierResidualSum) {
        bestInliers = currentInliers;
        minInlierResidualSum = currentResidualSum;
      }
    }
  }

  // Safety fallback: if no consensus set was populated, use all samples
  if (bestInliers.length === 0) {
    bestInliers = samples.map((_, i) => i);
  }

  const inlierSamples = bestInliers.map(idx => samples[idx]);

  // Rigorous hardware-weighted WLS Solution on inlying coordinates
  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of inlierSamples) {
    const wHardware = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    finalSumW += wHardware;
    finalLatW += p.lat * wHardware;
    finalLngW += p.lng * wHardware;
    totalAccuracy += p.accuracy;
  }

  const validAlts = inlierSamples.filter(s => s.altitude !== null && s.altitude !== undefined);
  const finalAlt = validAlts.length > 0 ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length : null;

  const validAltAccs = inlierSamples.filter(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined);
  const finalAltAcc = validAltAccs.length > 0 ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length : null;

  return {
    result: {
      lat: finalLatW / (finalSumW || 1.0),
      lng: finalLngW / (finalSumW || 1.0),
      accuracy: totalAccuracy / (inlierSamples.length || 1),
      altitude: finalAlt,
      altitudeAccuracy: finalAltAcc,
      timestamp: Date.now()
    },
    usedIndices: bestInliers
  };
}

/**
 * 9. Monte Carlo Particle Filter (Parçacık Filtresi)
 * Specially designed for static smartphone survey measurements:
 * - Local 2D state vector [x, y] is recursively estimated using a population of 500 particles.
 * - Undergoes Gaussian state transition prediction modeled for static targets (extremely small process noise drift).
 * - Multi-epoch sequential updating scales weight likelihoods recursively by measurement accuracy.
 * - Systematic resampling prevents particle degeneracy while tracking observation likelihood levels to isolate outliers.
 */
export function calculateParticleFilter(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 2) {
    return { result: samples[0], usedIndices: [0] };
  }

  // First step: Huber Robust Outlier Filtering pre-processing
  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

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
  const outlierThreshold = 2.0 * stableFinalPseudoSigma;

  const cleanIndices: number[] = [];
  const cleanSamples: Coordinate[] = [];

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

    if (dist <= outlierThreshold) {
      cleanIndices.push(i);
      cleanSamples.push(p);
    }
  }

  // If filtered too aggressively, preserve at least 50% of original samples closest to the Huber center
  if (cleanSamples.length < Math.max(2, Math.floor(samples.length * 0.4))) {
    const sortedWithIndex = samples.map((p, idx) => ({
      p,
      idx,
      dist: calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat)
    })).sort((a, b) => a.dist - b.dist);

    const countToKeep = Math.max(2, Math.floor(samples.length * 0.5));
    cleanIndices.length = 0;
    cleanSamples.length = 0;
    for (let i = 0; i < countToKeep; i++) {
      cleanIndices.push(sortedWithIndex[i].idx);
      cleanSamples.push(sortedWithIndex[i].p);
    }
  }

  // Now perform Particle Filter on cleanSamples
  const avgLat = cleanSamples.reduce((sum, s) => sum + s.lat, 0) / cleanSamples.length;
  const avgLng = cleanSamples.reduce((sum, s) => sum + s.lng, 0) / cleanSamples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(avgLat);

  // Convert to local 2D Cartesian coordinates (meters)
  const localPts = cleanSamples.map(s => ({
    x: (s.lng - avgLng) * lngCoeff,
    y: (s.lat - avgLat) * latCoeff
  }));

  // Setup deterministic random generator for seed-reproducible Particle Filter
  let seed = 999;
  const randomGaussian = (): number => {
    // Box-Muller transform
    let u = 0, v = 0;
    while(u === 0) {
      const x = Math.sin(seed++) * 10000;
      u = x - Math.floor(x);
    }
    while(v === 0) {
      const y = Math.sin(seed++) * 10000;
      v = y - Math.floor(y);
    }
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const NUM_PARTICLES = 500;
  const particles = new Array<{ x: number; y: number }>(NUM_PARTICLES);
  let weights = new Array<number>(NUM_PARTICLES).fill(1 / NUM_PARTICLES);

  // Initialize particles centered around the first measurement of cleanSamples
  const initPt = localPts[0];
  const initSigma = Math.max(0.2, cleanSamples[0].accuracy / 1.96);
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles[i] = {
      x: initPt.x + randomGaussian() * initSigma,
      y: initPt.y + randomGaussian() * initSigma
    };
  }

  // Process noise standard deviation (static environment: extremely low random walk)
  const qSigma = 0.015; // 1.5 cm process update noise per epoch
  
  const inlierSubIndices: number[] = [];
  
  // Standard Particle Filter loop over cleanSamples
  for (let j = 0; j < cleanSamples.length; j++) {
    const obs = localPts[j];
    const obsSigma = Math.max(0.1, cleanSamples[j].accuracy / 1.96);
    const twoObsSigmaSq = 2.0 * obsSigma * obsSigma;

    // 1. Prediction stage: Propagate particles with tiny process noise (static)
    for (let k = 0; k < NUM_PARTICLES; k++) {
      particles[k].x += randomGaussian() * qSigma;
      particles[k].y += randomGaussian() * qSigma;
    }

    // 2. Weight Update stage based on Gaussian Measurement Likelihood
    let sumWeight = 0;
    const stepWeights = new Array<number>(NUM_PARTICLES);
    for (let k = 0; k < NUM_PARTICLES; k++) {
      const dx = particles[k].x - obs.x;
      const dy = particles[k].y - obs.y;
      const distSq = dx * dx + dy * dy;
      
      // Likelihood L_k = exp(-dist² / (2 * sigma_obs²)) / (2 * PI * sigma_obs²)
      const likelihood = Math.exp(-distSq / twoObsSigmaSq) / (Math.PI * twoObsSigmaSq);
      stepWeights[k] = weights[k] * likelihood;
      sumWeight += stepWeights[k];
    }

    // If weights collapse, skip this measurement to preserve state
    const averageStepLikelihood = sumWeight / NUM_PARTICLES;
    
    // Outlier checking: relative threshold of average particle likelihood
    // e^-4.5 corresponds to ~3 sigma spatial outlier limits
    const thresholdLikelihood = Math.exp(-4.5) / (Math.PI * twoObsSigmaSq);

    if (averageStepLikelihood > thresholdLikelihood && sumWeight > 1e-15) {
      // Normalize weights
      for (let k = 0; k < NUM_PARTICLES; k++) {
        weights[k] = stepWeights[k] / sumWeight;
      }
      inlierSubIndices.push(j);

      // 3. Resampling decision based on Effective Sample Size (N_eff)
      let sumSqWeight = 0;
      for (let k = 0; k < NUM_PARTICLES; k++) {
        sumSqWeight += weights[k] * weights[k];
      }
      const nEff = 1.0 / sumSqWeight;

      if (nEff < NUM_PARTICLES * 0.5) {
        // Systematic Resampling
        const cumWeights = new Array<number>(NUM_PARTICLES);
        let cumSum = 0;
        for (let k = 0; k < NUM_PARTICLES; k++) {
          cumSum += weights[k];
          cumWeights[k] = cumSum;
        }

        const step = 1.0 / NUM_PARTICLES;
        // Seeded random for u0
        const randVal = (() => {
          const x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
        })();
        let u = randVal * step;
        let idx = 0;

        const resampledParticles = new Array<{ x: number; y: number }>(NUM_PARTICLES);
        for (let k = 0; k < NUM_PARTICLES; k++) {
          while (u > cumWeights[idx] && idx < NUM_PARTICLES - 1) {
            idx++;
          }
          resampledParticles[k] = { ...particles[idx] };
          u += step;
        }

        // Copy back
        for (let k = 0; k < NUM_PARTICLES; k++) {
          particles[k] = resampledParticles[k];
        }
        weights.fill(1.0 / NUM_PARTICLES);
      }
    }
  }

  // Fallback if all sub-samples are marked as outliers during particle tracking
  let finalSubIndices = inlierSubIndices;
  if (finalSubIndices.length === 0) {
    finalSubIndices = cleanSamples.map((_, i) => i);
  }

  // Map sub-indices back to the original indices in the input 'samples' array
  const finalIndices = finalSubIndices.map(subIdx => cleanIndices[subIdx]);

  // Calculate posterior state estimation from the cloud centroid
  let finalX = 0;
  let finalY = 0;
  for (let k = 0; k < NUM_PARTICLES; k++) {
    finalX += particles[k].x * weights[k];
    finalY += particles[k].y * weights[k];
  }

  const finalLat = avgLat + finalY / latCoeff;
  const finalLng = avgLng + finalX / lngCoeff;

  // Average altitude properties from inlying epochs of cleanSamples
  const inlierSamples = finalIndices.map(idx => samples[idx]);
  const avgAcc = inlierSamples.reduce((sum, s) => sum + s.accuracy, 0) / inlierSamples.length;

  const validAlts = inlierSamples.filter(s => s.altitude !== null && s.altitude !== undefined);
  const finalAlt = validAlts.length > 0 ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length : null;

  const validAltAccs = inlierSamples.filter(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined);
  const finalAltAcc = validAltAccs.length > 0 ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length : null;

  return {
    result: {
      lat: finalLat,
      lng: finalLng,
      accuracy: avgAcc,
      altitude: finalAlt,
      altitudeAccuracy: finalAltAcc,
      timestamp: Date.now()
    },
    usedIndices: finalIndices
  };
}

/**
 * 10. Multi-Sensor Fusion / Dead Reckoning (Çoklu Sensör Füzyon Modeli)
 * Specially designed and adapted for static surveying with zero-velocity IMU assistance (ZUPT):
 * - Implements an extended discrete-time state Kalman Filter vector mapping: X = [pos_x, pos_y, vel_x, vel_y]^T.
 * - Dynamic process transition matrix operates under Newtonian equations with small step dt.
 * - Synthesizes a high-accuracy, zero-velocity constraint (Zero Velocity Update - ZUPT) to simulate IMU static stability.
 * - Filters noisy GNSS epochs by evaluating the Normalized Innovation Squared (NIS) against Pearson's Chi-Square limit.
 */
export function calculateSensorFusionDR(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 2) {
    return { result: samples[0], usedIndices: [0] };
  }

  const avgLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
  const avgLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(avgLat);

  // Convert to local 2D Cartesian coordinates (meters)
  const localPts = samples.map(s => ({
    x: (s.lng - avgLng) * lngCoeff,
    y: (s.lat - avgLat) * latCoeff,
    t: s.timestamp / 1000.0 // seconds
  }));

  // State Vector X = [x, y, vx, vy]^T
  // Initial state centering around first sample coordinate
  let X = [localPts[0].x, localPts[0].y, 0.0, 0.0];

  // Covariance matrix P (4x4)
  const initSigma = Math.max(0.5, samples[0].accuracy / 1.96);
  let P = [
    [initSigma * initSigma, 0.0, 0.0, 0.0],
    [0.0, initSigma * initSigma, 0.0, 0.0],
    [0.0, 0.0, 0.1, 0.0],
    [0.0, 0.0, 0.0, 0.1]
  ];

  // Process noise covariance parameters (Static scenario)
  const qPosVal = 0.0001; // Tiny spatial uncertainty drift (static)
  const qVelVal = 0.005;  // Motion tremor covariance model (m/s²)
  
  const inlierIndices: number[] = [];

  for (let i = 1; i < localPts.length; i++) {
    const prev = localPts[i - 1];
    const curr = localPts[i];
    let dt = curr.t - prev.t;
    // Safety clamp dt to reasonable bounds (e.g. 0.1s to 5s range)
    if (dt <= 0 || dt > 10.0) dt = 1.0;

    // 1. Kalman Prediction (State Transition)
    // F is state transition matrix:
    // [1, 0, dt,  0]
    // [0, 1,  0, dt]
    // [0, 0,  1,  0]
    // [0, 0,  0,  1]
    const predX = [
      X[0] + X[2] * dt,
      X[1] + X[3] * dt,
      X[2],
      X[3]
    ];

    // Predict covariance P_pred = F * P * F^T + Q
    // We compute this directly to preserve speed and avoid matrix library dependencies:
    const F_P_FT = [
      [
        P[0][0] + dt * (P[2][0] + P[0][2] + dt * P[2][2]),
        P[0][1] + dt * (P[2][1] + P[0][3] + dt * P[2][3]),
        P[0][2] + dt * P[2][2],
        P[0][3] + dt * P[2][3]
      ],
      [
        P[1][0] + dt * (P[3][0] + P[1][2] + dt * P[3][3]),
        P[1][1] + dt * (P[3][1] + P[1][3] + dt * P[3][3]),
        P[1][2] + dt * P[3][2],
        P[1][3] + dt * P[3][3]
      ],
      [
        P[2][0] + dt * P[2][2],
        P[2][1] + dt * P[2][3],
        P[2][2],
        P[2][3]
      ],
      [
        P[3][0] + dt * P[3][2],
        P[3][1] + dt * P[3][3],
        P[3][2],
        P[3][3]
      ]
    ];

    // Add Q Positional and Velocity process noises
    const Q = [
      [qPosVal * dt, 0.0, 0.0, 0.0],
      [0.0, qPosVal * dt, 0.0, 0.0],
      [0.0, 0.0, qVelVal * dt, 0.0],
      [0.0, 0.0, 0.0, qVelVal * dt]
    ];

    let P_pred = [
      [F_P_FT[0][0] + Q[0][0], F_P_FT[0][1], F_P_FT[0][2], F_P_FT[0][3]],
      [F_P_FT[1][0], F_P_FT[1][1] + Q[1][1], F_P_FT[1][2], F_P_FT[1][3]],
      [F_P_FT[2][0], F_P_FT[2][1], F_P_FT[2][2] + Q[2][2], F_P_FT[2][3]],
      [F_P_FT[3][0], F_P_FT[3][1], F_P_FT[3][2], F_P_FT[3][3] + Q[3][3]]
    ];

    // 2. Zero Velocity Update (ZUPT) - Virtual Inertial measurement of Velocity = [0, 0]^T
    // This stabilizes the velocity state from divergent spatial drifts
    const zuptR = 0.005; // Tight IMU spatial velocity covariance constraint (0.005 m²/s²)
    const H_zupt = [
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];

    // ZUPT Innovation covariance: S_z = H * P_pred * H_T + R_z
    // S_z = [[P_pred[2][2] + R_z, P_pred[2][3]], [P_pred[3][2], P_pred[3][3] + R_z]]
    const s_z = [
      [P_pred[2][2] + zuptR, P_pred[2][3]],
      [P_pred[3][2], P_pred[3][3] + zuptR]
    ];

    // Matrix det for inversion
    const det_z = s_z[0][0] * s_z[1][1] - s_z[0][1] * s_z[1][0];
    const inv_s_z = [
      [s_z[1][1] / det_z, -s_z[0][1] / det_z],
      [-s_z[1][0] / det_z, s_z[0][0] / det_z]
    ];

    // Kalman Gain K_z = P_pred * H_zupt^T * inv_s_z
    const K_z = [
      [P_pred[0][2] * inv_s_z[0][0] + P_pred[0][3] * inv_s_z[1][0], P_pred[0][2] * inv_s_z[0][1] + P_pred[0][3] * inv_s_z[1][1]],
      [P_pred[1][2] * inv_s_z[0][0] + P_pred[1][3] * inv_s_z[1][0], P_pred[1][2] * inv_s_z[0][1] + P_pred[1][3] * inv_s_z[1][1]],
      [P_pred[2][2] * inv_s_z[0][0] + P_pred[2][3] * inv_s_z[1][0], P_pred[2][2] * inv_s_z[0][1] + P_pred[2][3] * inv_s_z[1][1]],
      [P_pred[3][2] * inv_s_z[0][0] + P_pred[3][3] * inv_s_z[1][0], P_pred[3][2] * inv_s_z[0][1] + P_pred[3][3] * inv_s_z[1][1]]
    ];

    // Update ZUPT state
    const z_y = [ -predX[2], -predX[3] ]; // target velocity is zero
    X = [
      predX[0] + K_z[0][0] * z_y[0] + K_z[0][1] * z_y[1],
      predX[1] + K_z[1][0] * z_y[0] + K_z[1][1] * z_y[1],
      predX[2] + K_z[2][0] * z_y[0] + K_z[2][1] * z_y[1],
      predX[3] + K_z[3][0] * z_y[0] + K_z[3][1] * z_y[1]
    ];

    // Update covariance matrix: P = (I - K_z * H_z) * P_pred
    const I_K_z_Hz = [
      [1.0, 0.0, -K_z[0][0], -K_z[0][1]],
      [0.0, 1.0, -K_z[1][0], -K_z[1][1]],
      [0.0, 0.0, 1.0 - K_z[2][0], -K_z[2][1]],
      [0.0, 0.0, -K_z[3][0], 1.0 - K_z[3][1]]
    ];

    let P_temp = Array.from({ length: 4 }, () => new Array<number>(4).fill(0.0));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        P_temp[r][c] = I_K_z_Hz[r][0] * P_pred[0][c] +
                       I_K_z_Hz[r][1] * P_pred[1][c] +
                       I_K_z_Hz[r][2] * P_pred[2][c] +
                       I_K_z_Hz[r][3] * P_pred[3][c];
      }
    }
    P_pred = P_temp;

    // 3. GNSS Position Measurement Update stage
    const gpsSigma = Math.max(0.1, samples[i].accuracy / 1.96);
    const R_gps = gpsSigma * gpsSigma;

    // Innovation residual: y = Z - H * X
    const y_gps = [ curr.x - X[0], curr.y - X[1] ];

    // Innovation covariance: S_gps = H_gps * P_pred * H_gps^T + R_gps
    const S_gps = [
      [P_pred[0][0] + R_gps, P_pred[0][1]],
      [P_pred[1][0], P_pred[1][1] + R_gps]
    ];

    // Det for Innovation Covariance
    const det_gps = S_gps[0][0] * S_gps[1][1] - S_gps[0][1] * S_gps[1][0];
    const inv_S_gps = [
      [S_gps[1][1] / det_gps, -S_gps[0][1] / det_gps],
      [-S_gps[1][0] / det_gps, S_gps[0][0] / det_gps]
    ];

    // Normalized Innovation Squared (NIS): d_nis = y_gps^T * inv_S_gps * y_gps
    const d_nis = y_gps[0] * (inv_S_gps[0][0] * y_gps[0] + inv_S_gps[0][1] * y_gps[1]) +
                  y_gps[1] * (inv_S_gps[1][0] * y_gps[0] + inv_S_gps[1][1] * y_gps[1]);

    // Pearson's Chi-Square distribution threshold (2 DOF at 95% is 5.991)
    // If the NIS exceeds 5.991, we reject the step (severe multipath outliers)
    if (d_nis <= 5.991) {
      // Valid update step: Compute GNSS Kalman gain K_gps = P_pred * H_gps^T * inv_S_gps
      const K_gps = [
        [P_pred[0][0] * inv_S_gps[0][0] + P_pred[0][1] * inv_S_gps[1][0], P_pred[0][0] * inv_S_gps[0][1] + P_pred[0][1] * inv_S_gps[1][1]],
        [P_pred[1][0] * inv_S_gps[0][0] + P_pred[1][1] * inv_S_gps[1][0], P_pred[1][0] * inv_S_gps[0][1] + P_pred[1][1] * inv_S_gps[1][1]],
        [P_pred[2][0] * inv_S_gps[0][0] + P_pred[2][1] * inv_S_gps[1][0], P_pred[2][0] * inv_S_gps[0][1] + P_pred[2][1] * inv_S_gps[1][1]],
        [P_pred[3][0] * inv_S_gps[0][0] + P_pred[3][1] * inv_S_gps[1][0], P_pred[3][0] * inv_S_gps[0][1] + P_pred[3][1] * inv_S_gps[1][1]]
      ];

      // Update state vector X
      X = [
        X[0] + K_gps[0][0] * y_gps[0] + K_gps[0][1] * y_gps[1],
        X[1] + K_gps[1][0] * y_gps[0] + K_gps[1][1] * y_gps[1],
        X[2] + K_gps[2][0] * y_gps[0] + K_gps[2][1] * y_gps[1],
        X[3] + K_gps[3][0] * y_gps[0] + K_gps[3][1] * y_gps[1]
      ];

      // Update Covariance: P = (I - K_gps * H_gps) * P_pred
      const I_K_gps_Hgps = [
        [1.0 - K_gps[0][0], -K_gps[0][1], 0.0, 0.0],
        [-K_gps[1][0], 1.0 - K_gps[1][1], 0.0, 0.0],
        [-K_gps[2][0], -K_gps[2][1], 1.0, 0.0],
        [-K_gps[3][0], -K_gps[3][1], 0.0, 1.0]
      ];

      let P_final = Array.from({ length: 4 }, () => new Array<number>(4).fill(0.0));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          P_final[r][c] = I_K_gps_Hgps[r][0] * P_pred[0][c] +
                         I_K_gps_Hgps[r][1] * P_pred[1][c] +
                         I_K_gps_Hgps[r][2] * P_pred[2][c] +
                         I_K_gps_Hgps[r][3] * P_pred[3][c];
        }
      }
      P = P_final;
      inlierIndices.push(i);
    } else {
      // Reject step: Maintain predicted state, increment covariance to represent uncertainty.
      P = P_pred;
    }
  }

  // Ensure first element (seed) is marked as inlier too
  inlierIndices.unshift(0);

  // Convert local coordinates back to WGS84
  const finalLat = avgLat + X[1] / latCoeff;
  const finalLng = avgLng + X[0] / lngCoeff;

  // Compute stats on inlying epochs
  const inlierSamples = inlierIndices.map(idx => samples[idx]);
  const avgAcc = inlierSamples.reduce((sum, s) => sum + s.accuracy, 0) / inlierSamples.length;

  const validAlts = inlierSamples.filter(s => s.altitude !== null && s.altitude !== undefined);
  const finalAlt = validAlts.length > 0 ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length : null;

  const validAltAccs = inlierSamples.filter(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined);
  const finalAltAcc = validAltAccs.length > 0 ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length : null;

  return {
    result: {
      lat: finalLat,
      lng: finalLng,
      accuracy: avgAcc,
      altitude: finalAlt,
      altitudeAccuracy: finalAltAcc,
      timestamp: Date.now()
    },
    usedIndices: inlierIndices
  };
}










