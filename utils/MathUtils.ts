import { Coordinate, CalculationMethod } from '../types';

/**
 * Performs statistical analysis on GPS samples based on the selected method.
 */
export function calculateResult(
  samples: Coordinate[],
  method: CalculationMethod,
  accuracyLimit: number,
  gnssOnly: boolean = false
): { result: Coordinate; usedIndices: number[] } {
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

  switch (method) {
    case 'ARITHMETIC_MEAN':
      finalSamples = sourceData;
      resultData = calculateAverage(sourceData);
      break;
    case 'LEAST_SQUARES':
      const ls = weightedLeastSquares(sourceData);
      resultData = ls.result;
      finalCalculatedUsedIndices = ls.usedIndices;
      break;
    case 'ROBUST':
      const robust = robustEstimation(sourceData);
      resultData = robust.result;
      finalCalculatedUsedIndices = robust.usedIndices;
      break;
    case 'BAARDA':
      finalSamples = applyBaardaFilter(sourceData);
      resultData = calculateAverage(finalSamples);
      break;
    case 'L1_HUBER':
      const l1 = applyL1HuberEstimation(sourceData);
      resultData = l1.result;
      finalCalculatedUsedIndices = l1.usedIndices;
      break;
    case 'DBSCAN':
      finalSamples = applyDBSCANFilter(sourceData);
      resultData = calculateAverage(finalSamples);
      break;
    case 'RANSAC':
      finalSamples = applyRANSACFilter(sourceData);
      resultData = calculateAverage(finalSamples);
      break;
    case 'KDE':
      const kde = applyKDEEstimation(sourceData);
      resultData = kde.result;
      finalCalculatedUsedIndices = kde.usedIndices;
      break;
    default:
      finalSamples = sourceData;
      resultData = calculateAverage(sourceData);
  }

  // Determine which indices were used if not already determined by the method
  if (finalCalculatedUsedIndices === null) {
    usedIndices = samples
      .map((s, idx) => finalSamples.includes(s) ? idx : -1)
      .filter(idx => idx !== -1);
  } else {
    usedIndices = finalCalculatedUsedIndices;
  }

  // CRITICAL: Calculate max distance between any two points in the filtered source data
  // (As per user request: "en uzak 2 nokta arası mesafe")
  // We use sourceData (which filters by accuracy limit) to analyze the spread of reliable observations.
  let maxDistance = 0;
  if (sourceData.length > 1) {
    const meanLat = sourceData.reduce((a, b) => a + b.lat, 0) / sourceData.length;
    for (let i = 0; i < sourceData.length; i++) {
      for (let j = i + 1; j < sourceData.length; j++) {
        const dLat = (sourceData[i].lat - sourceData[j].lat) * 111320;
        const dLng = (sourceData[i].lng - sourceData[j].lng) * 111320 * Math.cos(meanLat * Math.PI / 180);
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist > maxDistance) maxDistance = dist;
      }
    }
  }

  // Final Accuracy formula: Max(Statistical Estimation, Max Distance observed in source data)
  resultData.accuracy = Math.max(resultData.accuracy, maxDistance);
  
  // Ensure it doesn't drop below a realistic threshold (0.1m)
  resultData.accuracy = Math.max(0.1, resultData.accuracy);

  return { result: resultData, usedIndices };
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
 * Standard Sigma Filter (Outlier Removal)
 */
function applySigmaFilter(samples: Coordinate[], sigma: number): Coordinate[] {
  if (samples.length < 4) return samples;

  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);

  const meanLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const meanLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

  const stdLat = Math.sqrt(lats.reduce((a, b) => a + Math.pow(b - meanLat, 2), 0) / lats.length);
  const stdLng = Math.sqrt(lngs.reduce((a, b) => a + Math.pow(b - meanLng, 2), 0) / lngs.length);

  // Avoid division by zero or extremely tight clusters
  if (stdLat === 0 || stdLng === 0) return samples;

  const filtered = samples.filter(s => 
    Math.abs(s.lat - meanLat) <= sigma * stdLat && 
    Math.abs(s.lng - meanLng) <= sigma * stdLng
  );

  return filtered.length > 0 ? filtered : samples;
}

/**
 * Weighted Least Squares
 * Weights are 1/(accuracy^2)
 */
function weightedLeastSquares(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  const weights = samples.map(s => 1 / Math.pow(s.accuracy || 0.1, 2));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const result: Coordinate = {
    lat: samples.reduce((a, b, i) => a + b.lat * weights[i], 0) / totalWeight,
    lng: samples.reduce((a, b, i) => a + b.lng * weights[i], 0) / totalWeight,
    accuracy: samples.reduce((a, b, i) => a + b.accuracy * weights[i], 0) / totalWeight,
    altitude: samples.some(s => s.altitude !== null)
      ? samples.reduce((a, b, i) => a + (b.altitude || 0) * weights[i], 0) / totalWeight
      : null,
    altitudeAccuracy: samples.some(s => s.altitudeAccuracy !== null)
      ? samples.reduce((a, b, i) => a + (b.altitudeAccuracy || 0) * weights[i], 0) / totalWeight
      : null,
    timestamp: Date.now()
  };

  return { result, usedIndices: samples.map((_, i) => i) };
}

/**
 * Robust Estimation (Huber-style weights)
 */
function robustEstimation(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  // First get a simple median or mean as starting point
  let currentLat = samples.reduce((a, b) => a + b.lat, 0) / samples.length;
  let currentLng = samples.reduce((a, b) => a + b.lng, 0) / samples.length;

  // Iterate a few times to adjust weights
  for (let iter = 0; iter < 3; iter++) {
    const residuals = samples.map(s => Math.sqrt(Math.pow(s.lat - currentLat, 2) + Math.pow(s.lng - currentLng, 2)));
    const medianResidual = residuals.sort((a, b) => a - b)[Math.floor(residuals.length / 2)];
    const scale = 1.4826 * (medianResidual || 1e-9);

    const weights = residuals.map(r => {
      const u = r / scale;
      return u <= 1.345 ? 1 : 1.345 / u; // Huber weight function
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    currentLat = samples.reduce((a, b, i) => a + b.lat * weights[i], 0) / totalWeight;
    currentLng = samples.reduce((a, b, i) => a + b.lng * weights[i], 0) / totalWeight;
  }

  const finalAvg = calculateAverage(samples); // For other fields
  const result = {
    ...finalAvg,
    lat: currentLat,
    lng: currentLng
  };

  return { result, usedIndices: samples.map((_, i) => i) };
}

/**
 * Baarda's Data Snooping (Standardized Residuals)
 * Recursive process to remove one outlier at a time until no kaba hata exists.
 */
function applyBaardaFilter(samples: Coordinate[]): Coordinate[] {
  if (samples.length < 5) return samples;

  let currentSamples = [...samples];
  const alpha = 0.001; // Significance level
  const criticalValue = 3.29; // Approximately for 0.1% significance

  while (currentSamples.length > 4) {
    // 1. Calculate weighted mean (L2)
    const weights = currentSamples.map(s => 1 / Math.pow(s.accuracy || 0.1, 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;

    // 2. Calculate residuals (v = l_cap - l)
    // We treat Lat and Lng separately or as a vector. For simplicity in geodetic work, we check distance.
    const residuals = currentSamples.map(s => {
      const dLat = (s.lat - meanLat) * 111320;
      const dLng = (s.lng - meanLng) * 111320 * Math.cos(meanLat * Math.PI / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng);
    });

    // 3. Sigma0 estimate (Standard deviation of unit weight)
    const vTPv = residuals.reduce((a, v, i) => a + v * v * weights[i], 0);
    const sigma0 = Math.sqrt(vTPv / (currentSamples.length - 1));

    // 4. Standardized residuals (w_i = v_i / (sigma0 * sqrt(q_vv)))
    // Simplified q_vv (cofactor of residual) for a simple mean: q_ii = (1 - p_i / [sum P])
    const standardizedResiduals = currentSamples.map((s, i) => {
      const p_i = weights[i];
      const q_ii = (1 - p_i / sumW); // Cofactor of residual for mean
      return residuals[i] / (sigma0 * Math.sqrt(q_ii) || 1e-9);
    });

    // 5. Find the worst offender
    let maxW = -1;
    let worstIdx = -1;
    for (let i = 0; i < standardizedResiduals.length; i++) {
      if (standardizedResiduals[i] > maxW) {
        maxW = standardizedResiduals[i];
        worstIdx = i;
      }
    }

    // 6. Test
    if (maxW > criticalValue) {
      currentSamples.splice(worstIdx, 1);
    } else {
      break; // No more outliers detected
    }
  }

  return currentSamples;
}

/**
 * L1-Norm / Huber M-Estimation
 * Iteratively Reweighted Least Squares (IRLS) using Huber weights.
 */
function applyL1HuberEstimation(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) return { result: samples[0], usedIndices: [0] };

  // Starting point: Median
  const getMedian = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  let currentLat = getMedian(samples.map(s => s.lat));
  let currentLng = getMedian(samples.map(s => s.lng));

  const k = 1.345; // Huber tuning constant

  for (let iter = 0; iter < 10; iter++) {
    const residuals = samples.map(s => {
      const dLat = (s.lat - currentLat) * 111320;
      const dLng = (s.lng - currentLng) * 111320 * Math.cos(currentLat * Math.PI / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng);
    });

    // Estimate scale (sigma) using MAD for robustness
    const medianRes = getMedian(residuals);
    const sigma = 1.4826 * (medianRes || 1e-9);

    const weights = residuals.map((r, i) => {
      const p_obs = 1 / Math.pow(samples[i].accuracy || 0.1, 2);
      const u = r / sigma;
      const w_huber = u <= k ? 1 : k / u;
      return p_obs * w_huber;
    });

    const sumW = weights.reduce((a, b) => a + b, 0);
    const nextLat = samples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const nextLng = samples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;

    // Convergence check
    const diff = Math.sqrt(Math.pow(nextLat - currentLat, 2) + Math.pow(nextLng - currentLng, 2)) * 111320;
    currentLat = nextLat;
    currentLng = nextLng;
    if (diff < 0.001) break;
  }

  const result = {
    ...calculateAverage(samples),
    lat: currentLat,
    lng: currentLng,
    timestamp: Date.now()
  };

  return { result, usedIndices: samples.map((_, i) => i) };
}

/**
 * DBSCAN (Density-Based Spatial Clustering)
 */
function applyDBSCANFilter(samples: Coordinate[]): Coordinate[] {
  if (samples.length < 3) return samples;

  // Simple DBSCAN implementation
  // Eps is set based on average accuracy
  const avgAcc = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  const eps = (avgAcc / 111320) * 2; // Convert meters to roughly degrees (very approx)
  const minPts = Math.max(2, Math.floor(samples.length * 0.3));

  const clusters: number[][] = [];
  const visited = new Set<number>();
  const noise = new Set<number>();

  for (let i = 0; i < samples.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);

    const neighbors = getNeighbors(i, samples, eps);
    if (neighbors.length < minPts) {
      noise.add(i);
    } else {
      const cluster: number[] = [];
      expandCluster(i, neighbors, cluster, samples, eps, minPts, visited, noise);
      clusters.push(cluster);
    }
  }

  if (clusters.length === 0) return samples;

  // Pick the largest cluster
  const largestClusterIdxs = clusters.sort((a, b) => b.length - a.length)[0];
  return largestClusterIdxs.map(i => samples[i]);
}

function getNeighbors(idx: number, samples: Coordinate[], eps: number): number[] {
  const neighbors: number[] = [];
  const p1 = samples[idx];
  for (let i = 0; i < samples.length; i++) {
    const p2 = samples[i];
    const dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
    if (dist <= eps) neighbors.push(i);
  }
  return neighbors;
}

function expandCluster(
  idx: number,
  neighbors: number[],
  cluster: number[],
  samples: Coordinate[],
  eps: number,
  minPts: number,
  visited: Set<number>,
  noise: Set<number>
) {
  cluster.push(idx);
  for (let i = 0; i < neighbors.length; i++) {
    const nIdx = neighbors[i];
    if (!visited.has(nIdx)) {
      visited.add(nIdx);
      const nNeighbors = getNeighbors(nIdx, samples, eps);
      if (nNeighbors.length >= minPts) {
        neighbors.push(...nNeighbors.filter(ni => !neighbors.includes(ni)));
      }
    }
    if (!cluster.includes(nIdx)) {
      cluster.push(nIdx);
      noise.delete(nIdx);
    }
  }
}

/**
 * RANSAC (Random Sample Consensus)
 * Finds the largest subset of points that agree within a threshold
 */
function applyRANSACFilter(samples: Coordinate[]): Coordinate[] {
  if (samples.length < 3) return samples;

  let bestInliers: number[] = [];
  const iterations = Math.min(50, samples.length * 5);
  // Threshold based on accuracy or typical GPS drift (e.g., 5-10 meters)
  const avgAcc = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  const threshold = (avgAcc / 111320); // in degrees

  for (let i = 0; i < iterations; i++) {
    // Pick a random sample point as a candidate center
    const randomIndex = Math.floor(Math.random() * samples.length);
    const candidate = samples[randomIndex];
    
    const inliers: number[] = [];
    for (let j = 0; j < samples.length; j++) {
      const dist = Math.sqrt(
        Math.pow(candidate.lat - samples[j].lat, 2) + 
        Math.pow(candidate.lng - samples[j].lng, 2)
      );
      if (dist <= threshold) {
        inliers.push(j);
      }
    }

    if (inliers.length > bestInliers.length) {
      bestInliers = inliers;
    }

    // Early exit if we found a very high consensus
    if (bestInliers.length > samples.length * 0.8) break;
  }

  return bestInliers.map(idx => samples[idx]);
}

/**
 * KDE (Kernel Density Estimation)
 * Finds the point with the highest local density using a Gaussian kernel
 */
function applyKDEEstimation(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) return { result: samples[0], usedIndices: [0] };
  if (samples.length === 1) return { result: samples[0], usedIndices: [0] };

  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);
  
  // Silverman's Rule for Bandwidth
  const stdLat = Math.sqrt(lats.reduce((a, b) => a + Math.pow(b - (lats.reduce((x, y) => x + y) / lats.length), 2), 0) / lats.length) || 1e-7;
  const stdLng = Math.sqrt(lngs.reduce((a, b) => a + Math.pow(b - (lngs.reduce((x, y) => x + y) / lngs.length), 2), 0) / lngs.length) || 1e-7;
  
  const hLat = 1.06 * stdLat * Math.pow(samples.length, -0.2);
  const hLng = 1.06 * stdLng * Math.pow(samples.length, -0.2);

  let maxDensity = -1;
  let bestPointIdx = 0;

  // Calculate density for each point based on all others
  for (let i = 0; i < samples.length; i++) {
    let density = 0;
    for (let j = 0; j < samples.length; j++) {
      const dLat = (samples[i].lat - samples[j].lat) / hLat;
      const dLng = (samples[i].lng - samples[j].lng) / hLng;
      
      // Gaussian kernel: (1/sqrt(2pi)) * exp(-0.5 * u^2)
      // We can skip the constant factor as we only care about the max
      density += Math.exp(-0.5 * (dLat * dLat + dLng * dLng));
    }
    
    if (density > maxDensity) {
      maxDensity = density;
      bestPointIdx = i;
    }
  }

  // The result is the point with the highest density
  // But to be more "smooth", let's take a weighted average around that peak
  const peak = samples[bestPointIdx];
  const threshold = Math.sqrt(hLat * hLat + hLng * hLng) * 2;
  const inliers: Coordinate[] = samples.filter(s => 
    Math.sqrt(Math.pow(s.lat - peak.lat, 2) + Math.pow(s.lng - peak.lng, 2)) <= threshold
  );

  const usedIndices = samples
    .map((s, idx) => inliers.includes(s) ? idx : -1)
    .filter(idx => idx !== -1);

  return { result: calculateAverage(inliers), usedIndices };
}


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

