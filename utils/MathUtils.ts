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
  // HUBER, KMEANS_4, BAARDA, KMEANS_BAARDA_HUBER
  const isProfessional = 
    method === 'HUBER' ||
    method === 'KMEANS_4' || 
    method === 'BAARDA' || 
    method === 'KMEANS_BAARDA_HUBER';
  
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

  // 2. Decide Adaptive Number of Clusters (k) - Max 4 Clusters
  let k = 4;
  if (sigma < 1.0) {
    k = 2; // Clean signal, only micro noise needs separation
  } else if (sigma < 1.5) {
    k = 3;
  } else {
    k = 4; // Moderate/Heavy obstructions (Maximum 4 Clusters)
  }

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

  // 2. Column B (Spatial Branch): Adaptive K-Means Clustering inside dynamic limits (k = 2..6)
  let k = 4;
  if (sigma < 1.0) {
    k = 2;
  } else if (sigma < 1.5) {
    k = 3;
  } else if (sigma < 2.0) {
    k = 4;
  } else if (sigma < 2.5) {
    k = 5;
  } else {
    k = 6;
  }

  const clusterAssignments = runKMeans(samples, k);
  const clusters: number[][] = Array.from({ length: k }, () => []);
  clusterAssignments.forEach((cIdx, i) => {
    clusters[cIdx].push(i);
  });

  // Champion Cluster Discovery (Largest cluster by member count)
  let bestClusterIdx = 0;
  let maxCount = -1;
  for (let i = 0; i < k; i++) {
    if (clusters[i].length > maxCount) {
      maxCount = clusters[i].length;
      bestClusterIdx = i;
    }
  }
  const championIndices = clusters[bestClusterIdx];

  // Perform 2-way Intersection of (K-Means ∩ Baarda) first
  const twoWayIndices = baardaIndices.filter(idx => championIndices.includes(idx));

  // 3. Huber Robust M-Estimation Filter: Apply specifically to the two-way intersection set
  const huberIndices: number[] = [];
  if (twoWayIndices.length > 0) {
    const subsetPoints = twoWayIndices.map(idx => samples[idx]);
    const subAverage = calculateAverage(subsetPoints);
    const subVariance = calculateVariance(subsetPoints, subAverage);
    const subSigma = Math.sqrt(subVariance);

    const huberLimit = 1.345 * Math.max(0.05, subSigma);
    for (const idx of twoWayIndices) {
      const p = samples[idx];
      const dLat = (p.lat - subAverage.lat) * 111320;
      const dLng = (p.lng - subAverage.lng) * 111320 * Math.cos(subAverage.lat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      // Keep only points that are close enough to the subset's own centroid
      if (dist <= huberLimit) {
        huberIndices.push(idx);
      }
    }
  }

  // The final intersected indices are the ones that survive the Huber filter
  const intersectionIndices = huberIndices;
  const intersectionPoints = intersectionIndices.map(idx => samples[idx]);

  // If we have at least 4 viable points, calculate Weighted Least Squares (WLS) adjustment using combined weights:
  // P_final = w_hardware * w_huber = (accuracy_min / accuracy_i) * w_huber,i
  if (intersectionPoints.length >= 4) {
    const subsetPoints = intersectionPoints;
    const subAverage = calculateAverage(subsetPoints);
    const subVariance = calculateVariance(subsetPoints, subAverage);
    const subSigma = Math.sqrt(subVariance);
    const huberLimit = 1.345 * Math.max(0.05, subSigma);

    const accuracyLimit = Math.min(...intersectionPoints.map(s => s.accuracy));

    const finalWeights = intersectionPoints.map(s => {
      const dLat = (s.lat - subAverage.lat) * 111320;
      const dLng = (s.lng - subAverage.lng) * 111320 * Math.cos(subAverage.lat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      const huberWeight = dist <= huberLimit ? 1.0 : huberLimit / Math.max(0.01, dist);

      const hardwareWeight = accuracyLimit / Math.max(0.1, s.accuracy);
      return hardwareWeight * huberWeight;
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
      clusters: clusters.filter(c => c.length > 0),
      fallbackApplied: false,
      actualMethodUsed: 'KMEANS_BAARDA_HUBER'
    };
  } else {
    // Graceful Fallback Strategy: Fall back to default Weighted Least Squares method
    const fallbackRes = calculateWeightedLSE(samples);
    return {
      result: fallbackRes.result,
      usedIndices: fallbackRes.usedIndices,
      clusters: clusters.filter(c => c.length > 0),
      fallbackApplied: true,
      actualMethodUsed: 'WEIGHTED_LSE'
    };
  }
}

export function calculateHuberPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i) };
  }

  // Iterative Huber M-estimation
  let currentCentroid = calculateAverage(samples);
  const maxIterations = 10;
  const tolerance = 1e-6;
  let weights = samples.map(() => 1.0);
  let usedIndices = samples.map((_, i) => i);

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentSigma = Math.sqrt(calculateVariance(samples, currentCentroid));
    const huberLimit = 1.345 * Math.max(0.05, currentSigma);

    let sumW = 0;
    let sumLat = 0;
    let sumLng = 0;
    let sumAlt = 0;
    let sumAltW = 0;
    let hasAlt = false;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dLat = (p.lat - currentCentroid.lat) * 111320;
      const dLng = (p.lng - currentCentroid.lng) * 111320 * Math.cos(currentCentroid.lat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      // Hardware accuracy weight
      const hwWeight = 1 / Math.pow(Math.max(0.1, p.accuracy), 2);
      // Huber dampening weight
      const huberWeight = dist <= huberLimit ? 1.0 : huberLimit / Math.max(0.01, dist);
      
      const combinedWeight = hwWeight * huberWeight;
      weights[i] = combinedWeight;

      sumW += combinedWeight;
      sumLat += p.lat * combinedWeight;
      sumLng += p.lng * combinedWeight;

      if (p.altitude !== null) {
        hasAlt = true;
        sumAlt += p.altitude * combinedWeight;
        sumAltW += combinedWeight;
      }
    }

    if (sumW === 0) break;

    const nextCentroid: Coordinate = {
      lat: sumLat / sumW,
      lng: sumLng / sumW,
      accuracy: currentCentroid.accuracy,
      altitude: hasAlt ? sumAlt / sumAltW : null,
      altitudeAccuracy: currentCentroid.altitudeAccuracy,
      timestamp: currentCentroid.timestamp
    };

    const dLat = (nextCentroid.lat - currentCentroid.lat) * 111320;
    const dLng = (nextCentroid.lng - currentCentroid.lng) * 111320 * Math.cos(currentCentroid.lat * Math.PI / 180);
    const change = Math.sqrt(dLat * dLat + dLng * dLng);

    currentCentroid = nextCentroid;
    if (change < tolerance) {
      break;
    }
  }

  // Filter extreme outliers (beyond 3-sigma) for usedIndices
  const finalSigma = Math.sqrt(calculateVariance(samples, currentCentroid));
  const outlierThreshold = 3.0 * Math.max(0.1, finalSigma);
  
  usedIndices = [];
  const finalSamplesToUse: Coordinate[] = [];
  
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const dLat = (p.lat - currentCentroid.lat) * 111320;
    const dLng = (p.lng - currentCentroid.lng) * 111320 * Math.cos(currentCentroid.lat * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    
    if (dist <= outlierThreshold) {
      usedIndices.push(i);
      finalSamplesToUse.push(p);
    }
  }

  if (finalSamplesToUse.length === 0) {
    return { result: currentCentroid, usedIndices: samples.map((_, i) => i) };
  }

  // Calculate Huber + Hardware weighted centroids just like in the hybrid method
  const subAverage = calculateAverage(finalSamplesToUse);
  const subVariance = calculateVariance(finalSamplesToUse, subAverage);
  const subSigma = Math.sqrt(subVariance);
  const huberLimit = 1.345 * Math.max(0.05, subSigma);

  const accuracyLimit = Math.min(...finalSamplesToUse.map(s => s.accuracy));

  const finalWeights = finalSamplesToUse.map(s => {
    const dLat = (s.lat - subAverage.lat) * 111320;
    const dLng = (s.lng - subAverage.lng) * 111320 * Math.cos(subAverage.lat * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    const huberWeight = dist <= huberLimit ? 1.0 : huberLimit / Math.max(0.01, dist);

    const hardwareWeight = accuracyLimit / Math.max(0.1, s.accuracy);
    return hardwareWeight * huberWeight;
  });

  const sumW = finalWeights.reduce((a, b) => a + b, 0) || 1.0;
  const finalLat = finalSamplesToUse.reduce((sum, p, i) => sum + p.lat * finalWeights[i], 0) / sumW;
  const finalLng = finalSamplesToUse.reduce((sum, p, i) => sum + p.lng * finalWeights[i], 0) / sumW;

  const avgCoords = calculateAverage(finalSamplesToUse);

  const finalResult: Coordinate = {
    ...finalSamplesToUse[0],
    lat: finalLat,
    lng: finalLng,
    accuracy: avgCoords.accuracy,
    timestamp: Date.now()
  };

  const validAlts = finalSamplesToUse.filter(s => s.altitude !== null);
  finalResult.altitude = validAlts.length > 0
    ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length
    : null;

  const validAltAccs = finalSamplesToUse.filter(s => s.altitudeAccuracy !== null);
  finalResult.altitudeAccuracy = validAltAccs.length > 0
    ? validAltAccs.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length
    : null;

  return {
    result: finalResult,
    usedIndices: usedIndices
  };
}








