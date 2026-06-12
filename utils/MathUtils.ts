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
  const requires55 = method === 'KMEANS_BAARDA_HUBER';
  const requires30 = method === 'HUBER' || method === 'KMEANS_4';
  const requires4 = method === 'BAARDA';
  
  let finalMethod = method;
  let fallbackApplied = false;

  if (requires55 && samples.length < 55) {
    finalMethod = 'WEIGHTED_LSE';
    fallbackApplied = true;
  } else if (requires30 && samples.length < 30) {
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

  // 2. Dinamik K (Küme Sayısı) Seçimi - Bayes Bilgi Kriteri (BIC) ile X-Means
  let bestK = 2;
  let bestBIC = Infinity;
  let bestAssignments: number[] = [];
  const maxK = Math.min(6, samples.length);

  for (let k = 2; k <= maxK; k++) {
    const currentAssignments = runKMeans(samples, k);
    
    // Merkezleri hesapla
    const centroids = Array.from({ length: k }, (_, j) => {
      const cPoints = samples.filter((_, i) => currentAssignments[i] === j);
      if (cPoints.length === 0) {
        return { lat: samples[j % samples.length].lat, lng: samples[j % samples.length].lng };
      }
      return {
        lat: cPoints.reduce((a, b) => a + b.lat, 0) / cPoints.length,
        lng: cPoints.reduce((a, b) => a + b.lng, 0) / cPoints.length
      };
    });

    let totalSquaredDist = 0;
    for (let i = 0; i < samples.length; i++) {
      const cIdx = currentAssignments[i];
      totalSquaredDist += calculateSquaredDistance(samples[i].lat, samples[i].lng, centroids[cIdx].lat, centroids[cIdx].lng, samples[i].lat);
    }
    
    const varianceR = totalSquaredDist / Math.max(1, samples.length - k);
    const numParameters = k * 3; // d=2 boyutlu uzayda her küme için (centroid enlem/boylam + varyans) parametreleri
    const bicScore = samples.length * Math.log(Math.max(1e-9, varianceR)) + numParameters * Math.log(samples.length);

    if (bicScore < bestBIC) {
      bestBIC = bicScore;
      bestK = k;
      bestAssignments = currentAssignments;
    }
  }

  // 3. Optimum Kümelerin Oluşturulması
  const clusters: number[][] = Array.from({ length: bestK }, () => []);
  bestAssignments.forEach((cIdx, i) => {
    clusters[cIdx].push(i);
  });

  const validClusters = clusters.filter(c => c.length > 0);

  // 4. Şampiyon Küme Seçimi (En çok eleman barındıran baskın küme)
  let bestClusterIdx = 0;
  let maxCount = -1;
  for (let i = 0; i < validClusters.length; i++) {
    if (validClusters[i].length > maxCount) {
      maxCount = validClusters[i].length;
      bestClusterIdx = i;
    }
  }

  const championIndices = validClusters[bestClusterIdx];
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
 * KMeans + Baarda + Huber + WLS Hybrid Model
 * Processes raw coordinates concurrently through 3 analytical branches:
 * 1. Global Baarda Test (Geodetic Branch)
 * 2. Adaptive KMeans (Spatial Density Branch, k=2..6)
 * 3. Huber M-Estimation (Robust Scoring Branch)
 * Intersects all three branches. If >= 4 points remain, runs WLS Adjustment.
 * Otherwise, falls back to standard K-Means + Baarda + WLS (calculateKMeansBaarda) method.
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

  // 2. Column B (Spatial Branch): Spatial Dynamic KMeans Clustering (Best K via X-Means / BIC)
  let bestK = 2;
  let bestBIC = Infinity;
  let bestAssignments: number[] = [];
  const maxK = Math.min(6, samples.length);

  for (let k = 2; k <= maxK; k++) {
    const currentAssignments = runKMeans(samples, k);
    
    // Calculate centroids
    const centroids = Array.from({ length: k }, (_, j) => {
      const cPoints = samples.filter((_, i) => currentAssignments[i] === j);
      if (cPoints.length === 0) {
        return { lat: samples[j % samples.length].lat, lng: samples[j % samples.length].lng };
      }
      return {
        lat: cPoints.reduce((a, b) => a + b.lat, 0) / cPoints.length,
        lng: cPoints.reduce((a, b) => a + b.lng, 0) / cPoints.length
      };
    });

    let totalSquaredDist = 0;
    for (let i = 0; i < samples.length; i++) {
      const cIdx = currentAssignments[i];
      totalSquaredDist += calculateSquaredDistance(samples[i].lat, samples[i].lng, centroids[cIdx].lat, centroids[cIdx].lng, samples[i].lat);
    }
    
    const varianceR = totalSquaredDist / Math.max(1, samples.length - k);
    const numParameters = k * 3; // d=2 dimensions per cluster
    const bicScore = samples.length * Math.log(Math.max(1e-9, varianceR)) + numParameters * Math.log(samples.length);

    if (bicScore < bestBIC) {
      bestBIC = bicScore;
      bestK = k;
      bestAssignments = currentAssignments;
    }
  }

  const clusters: number[][] = Array.from({ length: bestK }, () => []);
  bestAssignments.forEach((cIdx, i) => {
    clusters[cIdx].push(i);
  });

  const validClusters = clusters.filter(c => c.length > 0);

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








