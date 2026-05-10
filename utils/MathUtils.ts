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

  switch (method) {
    case 'ARITHMETIC_MEAN':
      finalSamples = sourceData;
      break;
    case 'LEAST_SQUARES':
      // Weighted Least Squares based on accuracy
      return weightedLeastSquares(sourceData);
    case 'ROBUST':
      // Robust estimation using M-estimators (simplified Huber weights)
      return robustEstimation(sourceData);
    case 'MAHALANOBIS':
      // Anomaly detection using Mahalanobis distance
      finalSamples = applyMahalanobisFilter(sourceData);
      break;
    case 'DBSCAN':
      // Clustering to find the main core of points
      finalSamples = applyDBSCANFilter(sourceData);
      break;
    case 'RANSAC':
      // Robust estimation by finding maximum consensus
      finalSamples = applyRANSACFilter(sourceData);
      break;
    case 'KDE':
      // Kernel Density Estimation to find the densest area
      return applyKDEEstimation(sourceData);
    case 'MEDIAN_MAD':
      // Median Absolute Deviation for extreme outlier resistance
      finalSamples = applyMedianMADFilter(sourceData);
      break;
    default:
      finalSamples = sourceData;
  }

  // Determine which indices were used
  usedIndices = samples
    .map((s, idx) => finalSamples.includes(s) ? idx : -1)
    .filter(idx => idx !== -1);

  // Calculate average of final samples
  const result = calculateAverage(finalSamples);

  return { result, usedIndices };
}

function calculateAverage(samples: Coordinate[]): Coordinate {
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const validAltAccuracies = samples.filter(s => s.altitudeAccuracy !== null);

  return {
    lat: samples.reduce((a, b) => a + b.lat, 0) / samples.length,
    lng: samples.reduce((a, b) => a + b.lng, 0) / samples.length,
    accuracy: samples.reduce((a, b) => a + b.accuracy, 0) / samples.length,
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
 * Mahalanobis Distance Filter
 */
function applyMahalanobisFilter(samples: Coordinate[]): Coordinate[] {
  if (samples.length < 5) return samples;

  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);

  const meanLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const meanLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

  // Simple covariance estimation
  let covXX = 0, covYY = 0, covXY = 0;
  for (let i = 0; i < samples.length; i++) {
    const dX = samples[i].lat - meanLat;
    const dY = samples[i].lng - meanLng;
    covXX += dX * dX;
    covYY += dY * dY;
    covXY += dX * dY;
  }
  covXX /= samples.length;
  covYY /= samples.length;
  covXY /= samples.length;

  // Determinant
  const det = covXX * covYY - covXY * covXY;
  if (det <= 0) return applySigmaFilter(samples, 2);

  // Inverse matrix
  const invXX = covYY / det;
  const invYY = covXX / det;
  const invXY = -covXY / det;

  const mahalanobisDistances = samples.map(s => {
    const dX = s.lat - meanLat;
    const dY = s.lng - meanLng;
    return dX * dX * invXX + dY * dY * invYY + 2 * dX * dY * invXY;
  });

  // Threshold for 2 degrees of freedom at 95% confidence is approx 5.99
  const threshold = 5.99;
  const filtered = samples.filter((_, i) => mahalanobisDistances[i] <= threshold);

  return filtered.length > 0 ? filtered : samples;
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
 * Median Absolute Deviation (MAD) Filter
 * A robust alternative to standard deviation for outlier detection
 */
function applyMedianMADFilter(samples: Coordinate[]): Coordinate[] {
  if (samples.length < 3) return samples;

  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);

  const getMedian = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const medLat = getMedian(lats);
  const medLng = getMedian(lngs);

  const absDevLat = lats.map(x => Math.abs(x - medLat));
  const absDevLng = lngs.map(x => Math.abs(x - medLng));

  const madLat = getMedian(absDevLat) || 1e-9;
  const madLng = getMedian(absDevLng) || 1e-9;

  // Scale factor 1.4826 makes MAD comparable to standard deviation for normal data
  const threshold = 3.0; // Typical threshold for outliers (3 sigma equivalent)
  
  const filtered = samples.filter(s => 
    Math.abs(s.lat - medLat) <= threshold * 1.4826 * madLat &&
    Math.abs(s.lng - medLng) <= threshold * 1.4826 * madLng
  );

  return filtered.length > 0 ? filtered : samples;
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

