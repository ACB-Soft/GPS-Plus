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
    case 'WEIGHTED_LSE':
      const lseResult = calculateWeightedLSE(sourceData);
      resultData = lseResult.result;
      finalCalculatedUsedIndices = lseResult.usedIndices;
      break;
    case 'MID_DBSCAN_BAARDA':
      const hybridRes = calculateMidDbscanBaarda(sourceData);
      resultData = hybridRes.result;
      finalCalculatedUsedIndices = hybridRes.usedIndices;
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

  // Final Accuracy formula: Max(Statistical Estimation, Max Distance, Average Sensor Accuracy)
  // This ensures we don't report better precision than the sensor actually reports during measurement.
  const avgSensorAccuracy = sourceData.reduce((a, b) => a + b.accuracy, 0) / sourceData.length;
  resultData.accuracy = Math.max(resultData.accuracy, maxDistance, avgSensorAccuracy);
  
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
 * Hybrid (Mid-DBSCAN + Baarda) Estimation
 * 1. Step: Mid-Range center calculation.
 * 2. Step: Reference-oriented DBSCAN (Eps = avg accuracy, MinPts = 4).
 * 3. Step: Summarize clusters and refine with Baarda test.
 */
function calculateMidDbscanBaarda(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 5) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i) };

  // Step 1: Mid-Range
  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);
  const rLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const rLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  // Step 2: DBSCAN
  const avgAcc = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  const eps = avgAcc; 
  const minPts = 4;

  const clusters: number[][] = [];
  const visited = new Set<number>();
  
  for (let i = 0; i < samples.length; i++) {
    if (visited.has(i)) continue;
    
    const neighbors = samples.map((s, idx) => {
      const dLat = (s.lat - samples[i].lat) * 111320;
      const dLng = (s.lng - samples[i].lng) * 111320 * Math.cos(samples[i].lat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return dist <= eps ? idx : -1;
    }).filter(idx => idx !== -1);
    
    if (neighbors.length >= minPts) {
      const cluster: number[] = [];
      const q = [i];
      visited.add(i);
      
      while (q.length > 0) {
        const next = q.shift()!;
        cluster.push(next);
        
        const nextNeighbors = samples.map((s, idx) => {
          const dLat = (s.lat - samples[next].lat) * 111320;
          const dLng = (s.lng - samples[next].lng) * 111320 * Math.cos(samples[next].lat * Math.PI / 180);
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          return dist <= eps ? idx : -1;
        }).filter(idx => idx !== -1);
        
        if (nextNeighbors.length >= minPts) {
          for (const n of nextNeighbors) {
            if (!visited.has(n)) {
              visited.add(n);
              q.push(n);
            }
          }
        }
      }
      clusters.push(cluster);
    }
  }

  // Filter clusters that are "near" R (at least one point within EPS of R)
  const validClusters = clusters.filter(cluster => {
    return cluster.some(idx => {
      const s = samples[idx];
      const dLat = (s.lat - rLat) * 111320;
      const dLng = (s.lng - rLng) * 111320 * Math.cos(rLat * Math.PI / 180);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return dist <= eps;
    });
  });

  // Summarize clusters
  const clusterSummaries = validClusters.map(cluster => {
    const clusterPoints = cluster.map(idx => samples[idx]);
    const weights = clusterPoints.map(p => 1 / Math.pow(Math.max(0.1, p.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    
    const cLat = clusterPoints.reduce((a, p, i) => a + p.lat * weights[i], 0) / sumW;
    const cLng = clusterPoints.reduce((a, p, i) => a + p.lng * weights[i], 0) / sumW;
    const cAcc = clusterPoints.reduce((a, p, i) => a + p.accuracy * weights[i], 0) / sumW;
    
    return {
      lat: cLat,
      lng: cLng,
      accuracy: cAcc,
      altitude: null,
      altitudeAccuracy: null,
      timestamp: Date.now(),
      _originalIndices: cluster
    };
  });

  if (clusterSummaries.length === 0) {
    const fallback = calculateAverage(samples);
    return { result: fallback, usedIndices: samples.map((_, i) => i) };
  }

  // Step 3: Baarda on summaries
  const baardaInput = clusterSummaries.map((s, idx) => ({ ...s, _originalIdx: idx }));
  const baardaRes = calculateBaardaInternal(baardaInput as any);
  
  const finalResult = { ...baardaRes.result };
  
  // Z calculation: Arithmetic mean of ALL samples (per user request)
  const validAlts = samples.filter(s => s.altitude !== null);
  finalResult.altitude = validAlts.length > 0
    ? validAlts.reduce((a, b) => a + (b.altitude || 0), 0) / validAlts.length
    : null;

  const finalUsedIndices = baardaRes.usedIndices.flatMap(i => (clusterSummaries[i] as any)._originalIndices);
  
  return { result: finalResult, usedIndices: [...new Set(finalUsedIndices)] };
}

function calculateBaardaInternal(samples: any[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i) };

  let currentSamples = [...samples];
  const criticalValue = 3.29; 

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
    const sigma0 = Math.sqrt(vTPv / (currentSamples.length - 1));

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

  return { result: calculateAverage(currentSamples), usedIndices: currentSamples.map(s => s._originalIdx) };
}

/**
 * Applies a static Kalman Filter to coordinates.
 * Assumes the object is non-moving (static measurement).
 */
function applyStaticKalmanFilter(samples: Coordinate[]): Coordinate[] {
  if (samples.length === 0) return [];

  // Initial State: First measurement
  let x_lat = samples[0].lat;
  let x_lng = samples[0].lng;
  let x_alt = samples[0].altitude || 0;

  // Initial Uncertainty: High
  let p_lat = 1.0;
  let p_lng = 1.0;
  let p_alt = 1.0;

  // Measurement Noise (Q): Very small for static target
  const Q = 1e-9; 

  const smoothed: Coordinate[] = [];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    
    // Prediction Step (Static model: x_k = x_{k-1})
    p_lat = p_lat + Q;
    p_lng = p_lng + Q;
    p_alt = p_alt + Q;

    // Measurement Noise (R): Actual sensor reported accuracy
    // Convert meters back to proportional degree variance roughly
    const R_h = Math.pow(s.accuracy / 111320, 2);
    const R_v = Math.pow((s.altitudeAccuracy || s.accuracy) / 111320, 2);

    // Update Step - Latitude
    const k_lat = p_lat / (p_lat + R_h);
    x_lat = x_lat + k_lat * (s.lat - x_lat);
    p_lat = (1 - k_lat) * p_lat;

    // Update Step - Longitude
    const k_lng = p_lng / (p_lng + R_h);
    x_lng = x_lng + k_lng * (s.lng - x_lng);
    p_lng = (1 - k_lng) * p_lng;

    // Update Step - Altitude
    if (s.altitude !== null) {
      const k_alt = p_alt / (p_alt + R_v);
      x_alt = x_alt + k_alt * (s.altitude - x_alt);
      p_alt = (1 - k_alt) * p_alt;
    }

    smoothed.push({
      ...s,
      lat: x_lat,
      lng: x_lng,
      altitude: s.altitude !== null ? x_alt : null
    });
  }

  return smoothed;
}




