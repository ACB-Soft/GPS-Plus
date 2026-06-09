import { Coordinate, CalculationMethod } from '../types';

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

  // Let's implement the 30-epoch constraint check for professional mathematical models:
  // KMEANS_4, BAARDA, MIDRANGE_KMEANS_BAARDA
  const isProfessional = 
    method === 'KMEANS_4' || 
    method === 'BAARDA' || 
    method === 'MIDRANGE_KMEANS_BAARDA';
  
  let finalMethod = method;
  let fallbackApplied = false;

  if (isProfessional && samples.length < 30) {
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
    case 'MIDRANGE_KMEANS_BAARDA':
      const kmeansRes = calculateKMeansBaarda(sourceData);
      resultData = kmeansRes.result;
      finalCalculatedUsedIndices = kmeansRes.usedIndices;
      clusters = kmeansRes.clusters;
      break;
    case 'KMEANS_4':
      const kmeans4Res = calculateKMeans4(sourceData);
      resultData = kmeans4Res.result;
      finalCalculatedUsedIndices = kmeans4Res.usedIndices;
      clusters = kmeans4Res.clusters;
      break;
    case 'BAARDA':
      const pureBaardaRes = calculateBaardaPure(sourceData);
      resultData = pureBaardaRes.result;
      finalCalculatedUsedIndices = pureBaardaRes.usedIndices;
      break;
    case 'MIDRANGE':
      const midRangeRes = calculateMidRange(sourceData);
      resultData = midRangeRes.result;
      finalCalculatedUsedIndices = midRangeRes.usedIndices;
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
      const dLat = (samples[i].lat - samples[j].lat) * 111320;
      const dLng = (samples[i].lng - samples[j].lng) * 111320 * Math.cos(meanLat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist > maxDist) maxDist = dist;
    }
  }
  return maxDist;
}

export function calculateAverage(samples: Coordinate[]): Coordinate {
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const validAltAccuracies = samples.filter(s => s.altitudeAccuracy !== null);

  const meanLat = samples.reduce((a, b) => a + b.lat, 0) / samples.length;
  const meanLng = samples.reduce((a, b) => a + b.lng, 0) / samples.length;

  // Calculate Yatay Hassasiyet (Horizontal Precision)
  // We use the root-mean-square of residuals plus the standard error of reported accuracies
  const residualsInMeters = samples.map(s => {
    const dLat = (s.lat - meanLat) * 111320;
    const dLng = (s.lng - meanLng) * 111320 * Math.cos(meanLat * Math.PI / 180);
    return dLat * dLat + dLng * dLng;
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
    const dLat = (s.lat - mean.lat) * 111320;
    const dLng = (s.lng - mean.lng) * 111320 * Math.cos(mean.lat * Math.PI / 180);
    return dLat * dLat + dLng * dLng;
  });
  
  return residuals.reduce((a, b) => a + b, 0) / (samples.length - 1);
}

/**
 * MidRange + K-Means + Baarda Algorithm
 * 1. Mid-Range Reference
 * 2. 1.0 * Eps Filtering (Strict)
 * 3. K-Means (k=4)
 * 4. Cluster Summaries (Weighted)
 * 5. Baarda Final Refinement
 */
function calculateKMeansBaarda(samples: Coordinate[]): { result: Coordinate; usedIndices: number[]; clusters?: number[][] } {
  if (samples.length < 5) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };

  // 1. Reference Point (Mid-Range)
  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);
  const rLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const rLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  // 2. 1.0 * Eps Filtering (Strict)
  const avgAcc = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  const epsLimit = avgAcc * 1.0;

  const filteredWithIndices = samples.map((s, idx) => ({ s, idx })).filter(item => {
    const dLat = (item.s.lat - rLat) * 111320;
    const dLng = (item.s.lng - rLng) * 111320 * Math.cos(rLat * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist <= epsLimit;
  });

  if (filteredWithIndices.length < 5) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };

  const filteredSamples = filteredWithIndices.map(f => f.s);
  const filteredIndices = filteredWithIndices.map(f => f.idx);

  // 3. K-Means (k=4) on filtered samples
  const k = 4;
  const clusterAssignments = runKMeans(filteredSamples, k);
  
  // Group into clusters of indices referencing original 'samples' array
  const rawClusters: number[][] = Array.from({ length: k }, () => []);
  clusterAssignments.forEach((cIdx, i) => {
    rawClusters[cIdx].push(filteredIndices[i]);
  });

  // 4. Intra-Cluster Baarda Test
  const cleanClustersIndices: number[][] = [];
  const cleanClustersPoints: Coordinate[][] = [];

  for (let c = 0; c < k; c++) {
    const origIndices = rawClusters[c];
    if (origIndices.length === 0) {
      cleanClustersIndices.push([]);
      cleanClustersPoints.push([]);
      continue;
    }

    const clusterPoints = origIndices.map(idx => samples[idx]);

    // Use Baarda's outlier detection inside each individual cluster
    const baardaInput = clusterPoints.map((p, localIdx) => ({
      ...p,
      _originalIdx: localIdx
    }));

    const baardaRes = calculateBaardaInternal(baardaInput as any);
    
    // Map clean points back to original indices
    const cleanOrigIndices = baardaRes.usedIndices.map(localIdx => origIndices[localIdx]);
    const cleanPoints = cleanOrigIndices.map(idx => samples[idx]);

    cleanClustersIndices.push(cleanOrigIndices);
    cleanClustersPoints.push(cleanPoints);
  }

  // 5. Cluster Density Analysis
  let bestClusterIdx = 0;
  let maxCount = -1;
  for (let c = 0; c < k; c++) {
    const count = cleanClustersIndices[c].length;
    if (count > maxCount) {
      maxCount = count;
      bestClusterIdx = c;
    }
  }

  const championIndices = cleanClustersIndices[bestClusterIdx];
  const championPoints = cleanClustersPoints[bestClusterIdx];

  // Fallback if champion is empty (which should be rare with our checks)
  if (championIndices.length === 0) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };
  }

  // 6. Final Weighted Least Squares (WLS) Solution
  const lseResult = calculateWeightedLSE(championPoints);
  const finalResult = { ...lseResult.result };

  // Calculate altitude and altitudeAccuracy on champion points
  const validAlts = championPoints.filter(s => s.altitude !== null);
  finalResult.altitude = validAlts.length > 0
    ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length
    : null;

  const validAltAccs = championPoints.filter(s => s.altitudeAccuracy !== null);
  finalResult.altitudeAccuracy = validAltAccs.length > 0
    ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length
    : null;

  return { 
    result: finalResult, 
    usedIndices: championIndices, 
    clusters: rawClusters.filter(c => c.length > 0)
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
            const dLat = (samples[i].lat - centroids[j].lat) * 111320;
            const dLng = (samples[i].lng - centroids[j].lng) * 111320 * Math.cos(samples[i].lat * Math.PI / 180);
            const dist = dLat * dLat + dLng * dLng;
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
    const weights = currentSamples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;

    const residuals = currentSamples.map(s => {
      const dLat = (s.lat - meanLat) * 111320;
      const dLng = (s.lng - meanLng) * 111320 * Math.cos(meanLat * Math.PI / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng);
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



function calculateKMeans4(samples: Coordinate[]): { result: Coordinate; usedIndices: number[]; clusters?: number[][] } {
  if (samples.length < 4) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };
  }
  const k = 4;
  const assignments = runKMeans(samples, k);
  
  const clusters: number[][] = Array.from({ length: k }, () => []);
  assignments.forEach((cIdx, i) => {
    clusters[cIdx].push(i);
  });
  
  let bestClusterIdx = 0;
  let maxCount = -1;
  for (let i = 0; i < k; i++) {
    if (clusters[i].length > maxCount) {
      maxCount = clusters[i].length;
      bestClusterIdx = i;
    }
  }
  
  const bestClusterPoints = clusters[bestClusterIdx].map(idx => samples[idx]);
  const lseRes = calculateWeightedLSE(bestClusterPoints);
  const originalUsedIndices = lseRes.usedIndices.map(i => clusters[bestClusterIdx][i]);
  
  return {
    result: lseRes.result,
    usedIndices: originalUsedIndices,
    clusters: clusters.filter(c => c.length > 0)
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

export function calculateMidRange(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) {
    return { result: samples[0], usedIndices: [0] };
  }
  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  
  const validAlts = samples.map(s => s.altitude).filter((alt): alt is number => alt !== null && alt !== undefined);
  let midAlt: number | null = null;
  if (validAlts.length > 0) {
    midAlt = (Math.min(...validAlts) + Math.max(...validAlts)) / 2;
  }
  
  const validAltAccs = samples.map(s => s.altitudeAccuracy).filter((acc): acc is number => acc !== null && acc !== undefined);
  let midAltAcc: number | null = null;
  if (validAltAccs.length > 0) {
    midAltAcc = (Math.min(...validAltAccs) + Math.max(...validAltAccs)) / 2;
  }

  const avgAcc = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;

  return {
    result: {
      lat: midLat,
      lng: midLng,
      accuracy: avgAcc,
      altitude: midAlt,
      altitudeAccuracy: midAltAcc,
      timestamp: Date.now()
    },
    usedIndices: samples.map((_, i) => i)
  };
}






