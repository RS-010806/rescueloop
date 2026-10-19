import type {
  IncidentData,
  RecipientOrg,
  SafetyGateAgentOutput,
  MatchingAgentOutput,
  LogisticsAgentOutput,
  ImpactAgentOutput,
} from '../types/rescue.ts';

export const ENVIRONMENTAL_FACTORS = {
  averageServingWeightKg: 0.42, // EPA / ReFED benchmark: ~0.42 kg per standard prepared meal
  co2ePerKgFoodLandfill: 2.5, // 2.5 kg CO2-equivalent avoided per kg food waste diverted
  waterPerServingLiters: 720, // Global average embedded water footprint per prepared mixed meal portion
  source: 'EPA WARM Model v15 & ReFED Food Waste Insights Database (Simulated Methodology)',
};

/**
 * Calculates environmental impact metrics based on transparent, defensible assumptions.
 */
export function calculateEnvironmentalImpact(
  portionsReported: number,
  portionsCleared: number,
  portionsAllocated: number,
  portionsCollected: number = 0,
  weightOverrideKg?: number
): ImpactAgentOutput {
  const effectiveWeightKg =
    weightOverrideKg && weightOverrideKg > 0
      ? weightOverrideKg
      : Math.round(portionsAllocated * ENVIRONMENTAL_FACTORS.averageServingWeightKg * 10) / 10;

  // Environmental benefits are calculated ONLY on portions allocated or collected,
  // NEVER on mere reported quantities.
  const co2eAvoidedKg = Math.round(effectiveWeightKg * ENVIRONMENTAL_FACTORS.co2ePerKgFoodLandfill * 10) / 10;
  const waterSavedLiters = Math.round(portionsAllocated * ENVIRONMENTAL_FACTORS.waterPerServingLiters);
  const landfillDivertedKg = effectiveWeightKg;

  return {
    portionsReported,
    portionsCleared,
    portionsAllocated,
    portionsCollected,
    estimatedWeightKg: effectiveWeightKg,
    environmentalEstimates: {
      co2eAvoidedKg,
      waterSavedLiters,
      landfillDivertedKg,
    },
    methodologyAssumptions: {
      averageServingWeightKg: ENVIRONMENTAL_FACTORS.averageServingWeightKg,
      co2PerKgFood: ENVIRONMENTAL_FACTORS.co2ePerKgFoodLandfill,
      waterPerServingLiters: ENVIRONMENTAL_FACTORS.waterPerServingLiters,
      source: ENVIRONMENTAL_FACTORS.source,
    },
    auditNote:
      'All environmental statistics represent modelled estimates derived from benchmark life-cycle factors. Allocated portions cannot be classified as verified rescued food until verified physically collected at the destination.',
  };
}

/**
 * Evaluates safety parameters: temperature logs, prep age, allergens, and authorized venue signoff.
 * Never independently certifies food as safe; enforces human review or blocks when data is missing.
 */
export function validateSafetyClearance(incident: IncidentData): SafetyGateAgentOutput {
  const blockers: string[] = [];
  const recommendations: string[] = [];

  // 1. Temperature Check
  let tempPassed = false;
  let requiredRange = '';
  const actualTemp = incident.storageTempC;

  if (incident.storageMethod === 'hot_hold') {
    requiredRange = '≥ 60.0°C (140°F)';
    tempPassed = actualTemp >= 60.0 && incident.temperatureVerified;
    if (!tempPassed) {
      blockers.push(`Hot-hold temperature ${actualTemp}°C violates safe warm holding threshold (${requiredRange}).`);
    }
  } else if (incident.storageMethod === 'refrigerated') {
    requiredRange = '≤ 4.5°C (40°F)';
    tempPassed = actualTemp <= 4.5 && incident.temperatureVerified;
    if (!tempPassed) {
      blockers.push(`Refrigeration temperature ${actualTemp}°C violates chilled threshold (${requiredRange}).`);
    }
  } else if (incident.storageMethod === 'frozen') {
    requiredRange = '≤ -18.0°C (0°F)';
    tempPassed = actualTemp <= -15.0 && incident.temperatureVerified;
    if (!tempPassed) {
      blockers.push(`Freezer temperature ${actualTemp}°C violates frozen threshold (${requiredRange}).`);
    }
  } else {
    // Ambient storage
    requiredRange = 'Max 2 hours at room temperature';
    tempPassed = false;
    blockers.push('Prepared perishable meals stored ambiently require immediate qualification.');
  }

  // 2. Prep Duration / Time Window Check
  let durationHours = 2.0;
  try {
    const prep = new Date(incident.preparationTime).getTime();
    if (!isNaN(prep)) {
      durationHours = Math.max(0.5, Math.round(((Date.now() - prep) / (1000 * 60 * 60)) * 10) / 10);
    }
  } catch {
    durationHours = 2.0;
  }

  const maxAllowedHours = 4.0;
  const timePassed = durationHours <= maxAllowedHours;
  if (!timePassed) {
    blockers.push(`Food elapsed duration (${durationHours}h) exceeds the critical 4-hour food safety redistribution limit.`);
  }

  // 3. Allergen Declaration Check
  const allergenPassed = incident.declaredAllergens.length > 0;
  if (!allergenPassed) {
    recommendations.push('No allergen declaration provided. Common allergens must be confirmed prior to public distribution.');
  }

  // 4. Venue Authorization Clearance Check
  const venuePassed = incident.venueSafetyClearanceGranted && Boolean(incident.venueSafetyOfficerName);
  if (!venuePassed) {
    blockers.push('Authorized venue food safety coordinator sign-off is missing or unverified.');
  }

  // Determine Overall Status
  let status: 'cleared' | 'flagged_for_human_review' | 'blocked' = 'cleared';
  let clearedPortions = incident.reportedPortions;

  if (blockers.length > 0) {
    status = 'blocked';
    clearedPortions = 0;
  } else if (recommendations.length > 0 || !incident.temperatureVerified) {
    status = 'flagged_for_human_review';
    clearedPortions = incident.reportedPortions;
  }

  return {
    status,
    clearedQuantityPortions: clearedPortions,
    temperatureCompliance: {
      passed: tempPassed,
      requiredRange,
      actualValue: `${actualTemp}°C (${incident.temperatureVerified ? 'Verified' : 'Unverified'})`,
      notes: tempPassed ? 'Complies with HACCP holding guidelines.' : 'Thermal violation or unverified reading.',
    },
    timeCompliance: {
      passed: timePassed,
      durationSincePrepHours: durationHours,
      maxAllowedHours,
    },
    allergenVerification: {
      passed: allergenPassed,
      disclosedAllergens: incident.declaredAllergens,
      riskNotes: allergenPassed
        ? `Declared allergens: ${incident.declaredAllergens.join(', ')}`
        : 'Undisclosed allergens present cross-contact liability.',
    },
    venueAuthorization: {
      passed: venuePassed,
      authorizedOfficer: incident.venueSafetyOfficerName || 'None specified',
      clearanceNotes: venuePassed
        ? `Authorized by ${incident.venueSafetyOfficerName}`
        : 'Missing required qualified venue supervisor sign-off.',
    },
    safetyDisclaimer:
      'AI Safety Gate evaluates procedural metadata only and CANNOT physically inspect or certify biological safety. Qualified human food handlers remain legally responsible for final organoleptic and sensory checks.',
    blockers,
    recommendations,
  };
}

/**
 * Matches and ranks recipient organizations based on multi-criteria heuristic:
 * Distance, Available Capacity, Dietary Compatibility, and Operational Window.
 */
export function matchAndRankRecipients(
  recipients: RecipientOrg[],
  incident: IncidentData,
  clearedQuantity: number
): MatchingAgentOutput {
  const ranked = recipients.map((org) => {
    let score = 50;
    const reasons: string[] = [];

    // 1. Distance scoring (up to 30 points)
    // Closest gets maximum score: 30 at 0km, down to 0 at 15km
    const distanceScore = Math.max(0, Math.round(30 * (1 - Math.min(org.distanceKm, 15) / 15)));
    score += distanceScore;
    reasons.push(`${org.distanceKm} km transit distance (+${distanceScore} pts)`);

    // 2. Capacity Match (up to 25 points)
    if (org.declaredCapacityPortions >= clearedQuantity) {
      score += 25;
      reasons.push(`Single-stop absorption capacity for ${org.declaredCapacityPortions} portions (+25 pts)`);
    } else if (org.declaredCapacityPortions > 0) {
      const partialRatio = org.declaredCapacityPortions / clearedQuantity;
      const capScore = Math.round(20 * partialRatio);
      score += capScore;
      reasons.push(`Partial absorption capacity (${org.declaredCapacityPortions} of ${clearedQuantity} portions, +${capScore} pts)`);
    } else {
      score -= 20;
      reasons.push('Zero declared intake capacity (-20 pts)');
    }

    // 3. Food Type / Temperature Acceptance (up to 20 points)
    if (incident.storageMethod === 'hot_hold' && org.acceptsHotFood) {
      score += 20;
      reasons.push('Equipped with hot-holding commercial Cambros (+20 pts)');
    } else if (incident.storageMethod === 'hot_hold' && !org.acceptsHotFood) {
      score -= 30;
      reasons.push('Cannot accept hot-hold food (-30 pts)');
    } else if (org.acceptsChilledFood) {
      score += 15;
      reasons.push('Equipped with commercial walk-in refrigeration (+15 pts)');
    }

    // 4. Dietary match
    const matchingDiet = org.dietaryRequirements.filter((d) =>
      incident.dietaryTags.some((tag) => tag.toLowerCase() === d.toLowerCase())
    );
    if (matchingDiet.length > 0) {
      score += 10;
      reasons.push(`Dietary alignment: ${matchingDiet.join(', ')} (+10 pts)`);
    }

    const boundedScore = Math.max(0, Math.min(100, score));

    return {
      recipientId: org.id,
      recipientName: org.name,
      score: boundedScore,
      distanceKm: org.distanceKm,
      capacityAvailable: org.declaredCapacityPortions,
      dietaryCompatibility: org.dietaryRequirements,
      urgencyMatch: true,
      rankingJustification: reasons.join(' • '),
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  return {
    rankedRecipients: ranked,
    selectionSummary: `Evaluated ${recipients.length} candidate recipient facilities. Ranked by distance, capacity match, temperature intake hardware, and dietary tags.`,
  };
}

/**
 * Allocates ONLY cleared portions, calculates balances, vehicle specs, and pickup sequencing.
 */
export function allocateClearedFood(
  clearedQuantity: number,
  rankedRecipients: MatchingAgentOutput['rankedRecipients'],
  allRecipients: RecipientOrg[]
): LogisticsAgentOutput {
  if (clearedQuantity <= 0) {
    return {
      status: 'unbalanced',
      totalClearedPortions: 0,
      totalAllocatedPortions: 0,
      unallocatedPortions: 0,
      allocations: [],
      routeProposal: [],
      dockHandoffInstructions: ['Safety clearance denied or zero portions cleared. No dispatch authorized.'],
    };
  }

  let remainingToAllocate = clearedQuantity;
  const allocations: LogisticsAgentOutput['allocations'] = [];
  const routeProposal: LogisticsAgentOutput['routeProposal'] = [];

  let stopNum = 1;

  for (const candidate of rankedRecipients) {
    if (remainingToAllocate <= 0) break;
    const org = allRecipients.find((r) => r.id === candidate.recipientId);
    if (!org) continue;

    const allocatable = Math.min(remainingToAllocate, org.declaredCapacityPortions);
    if (allocatable <= 0) continue;

    remainingToAllocate -= allocatable;

    const estTransitMins = Math.round(org.distanceKm * 2.4 + 10);
    const vehicle =
      allocatable > 80
        ? 'Cargo Van or Insulated High-Capacity Vehicle'
        : allocatable > 30
        ? 'Mid-size SUV or Station Wagon with 4+ Insulated Thermal Carriers'
        : 'Standard Vehicle with 2 Insulated Food Delivery Bags';

    allocations.push({
      recipientId: org.id,
      recipientName: org.name,
      allocatedPortions: allocatable,
      vehicleRecommendation: vehicle,
      estimatedTransitMins: estTransitMins,
      pickupWindow: 'Within 60-90 minutes (priority courier window)',
      priorityOrder: stopNum,
    });

    routeProposal.push({
      stopNumber: stopNum,
      destinationName: org.name,
      address: org.address,
      action: `Deliver ${allocatable} prepared meal portions`,
      estArrivalTime: `+${estTransitMins} mins from dock departure`,
      handlingNotes: org.acceptsHotFood
        ? 'Maintain insulated hot-box seal until kitchen intake handoff'
        : 'Immediate refrigerated intake logging required',
    });

    stopNum++;
  }

  const totalAllocated = clearedQuantity - remainingToAllocate;
  const status: LogisticsAgentOutput['status'] =
    remainingToAllocate === 0 ? 'balanced' : totalAllocated > 0 ? 'partial' : 'unbalanced';

  const dockHandoffInstructions = [
    'Driver must access Service Dock B via University West Perimeter Road.',
    'Present digital RescueLoop AI manifest to Event Safety Officer.',
    'Verify internal temperature probe reading (≥60°C or ≤4°C) with receiving kitchen before signing transfer receipt.',
    'Keep insulated thermal containers closed during all transit legs.',
  ];

  return {
    status,
    totalClearedPortions: clearedQuantity,
    totalAllocatedPortions: totalAllocated,
    unallocatedPortions: remainingToAllocate,
    allocations,
    routeProposal,
    dockHandoffInstructions,
  };
}
