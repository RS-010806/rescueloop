import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEnvironmentalImpact,
  validateSafetyClearance,
  matchAndRankRecipients,
  allocateClearedFood,
} from './rescueLogic.ts';
import type { IncidentData, RecipientOrg } from '../types/rescue.ts';

const mockIncident: IncidentData = {
  id: 'inc-test-01',
  title: 'Annual Gala Surplus Dinner',
  venueType: 'college_event',
  locationAddress: 'Campus Student Union - Banquet Hall 3B',
  isSimulatedData: true,
  contactName: 'Chef Marcus Vance',
  contactPhone: '+1 (555) 234-5678',
  reportedPortions: 120,
  reportedWeightKg: 50.4,
  preparationTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  pickupDeadline: new Date(Date.now() + 1000 * 60 * 90).toISOString(), // in 90 mins
  storageMethod: 'hot_hold',
  storageTempC: 63.5,
  temperatureVerified: true,
  venueSafetyClearanceGranted: true,
  venueSafetyOfficerName: 'Elena Rostova (Campus EHS)',
  declaredAllergens: ['Dairy', 'Gluten'],
  dietaryTags: ['halal', 'vegetarian'],
  rawDescription: '120 portions of grilled chicken breast with herb roasted potatoes, and steamed seasonal vegetables.',
};

const mockRecipients: RecipientOrg[] = [
  {
    id: 'rec-1',
    name: 'Hope Community Kitchen',
    type: 'community_kitchen',
    address: '412 Elm Street (Simulated)',
    distanceKm: 2.3,
    declaredCapacityPortions: 70,
    allocatedPortions: 0,
    operatingHours: 'Open until 10:00 PM',
    acceptsHotFood: true,
    acceptsChilledFood: true,
    dietaryRequirements: ['halal'],
    contactPerson: 'David Miller',
    contactPhone: '+1 (555) 301-8899',
    isSimulatedData: true,
  },
  {
    id: 'rec-2',
    name: 'Valley Family Shelter',
    type: 'homeless_shelter',
    address: '880 Pine Ave (Simulated)',
    distanceKm: 4.8,
    declaredCapacityPortions: 50,
    allocatedPortions: 0,
    operatingHours: '24/7 Intake',
    acceptsHotFood: true,
    acceptsChilledFood: true,
    dietaryRequirements: [],
    contactPerson: 'Sarah Jenkins',
    contactPhone: '+1 (555) 744-1234',
    isSimulatedData: true,
  },
  {
    id: 'rec-3',
    name: 'Westside Youth Meals',
    type: 'youth_center',
    address: '150 River Road (Simulated)',
    distanceKm: 8.5,
    declaredCapacityPortions: 40,
    allocatedPortions: 0,
    operatingHours: 'Open until 8:30 PM',
    acceptsHotFood: false,
    acceptsChilledFood: true,
    dietaryRequirements: ['nut-free'],
    contactPerson: 'Jordan Lee',
    contactPhone: '+1 (555) 902-5511',
    isSimulatedData: true,
  },
];

test('calculateEnvironmentalImpact: computes realistic CO2 and water footprints correctly', () => {
  const result = calculateEnvironmentalImpact(120, 120, 120, 0, 50.4);
  assert.equal(result.portionsReported, 120);
  assert.equal(result.portionsAllocated, 120);
  assert.equal(result.estimatedWeightKg, 50.4);
  // 50.4 kg * 2.5 kg CO2e = 126 kg CO2e
  assert.equal(result.environmentalEstimates.co2eAvoidedKg, 126);
  // 120 servings * 720 L = 86,400 L water
  assert.equal(result.environmentalEstimates.waterSavedLiters, 86400);
});

test('validateSafetyClearance: clears food when temperature, time, and authorized officer pass', () => {
  const result = validateSafetyClearance(mockIncident);
  assert.equal(result.status, 'cleared');
  assert.equal(result.clearedQuantityPortions, 120);
  assert.equal(result.temperatureCompliance.passed, true);
  assert.equal(result.venueAuthorization.passed, true);
  assert.equal(result.blockers.length, 0);
});

test('validateSafetyClearance: blocks allocation when temperature violates safe threshold', () => {
  const unsafeIncident = { ...mockIncident, storageTempC: 48.0 }; // Unsafe warm hold < 60C
  const result = validateSafetyClearance(unsafeIncident);
  assert.equal(result.status, 'blocked');
  assert.equal(result.clearedQuantityPortions, 0);
  assert.ok(result.blockers.some((b) => b.includes('Hot-hold temperature')));
});

test('validateSafetyClearance: blocks allocation when venue authorization is missing', () => {
  const unauthorizedIncident = {
    ...mockIncident,
    venueSafetyClearanceGranted: false,
    venueSafetyOfficerName: '',
  };
  const result = validateSafetyClearance(unauthorizedIncident);
  assert.equal(result.status, 'blocked');
  assert.equal(result.clearedQuantityPortions, 0);
  assert.ok(result.blockers.some((b) => b.includes('sign-off is missing')));
});

test('matchAndRankRecipients: prioritizes closer recipient with hot food intake hardware', () => {
  const matching = matchAndRankRecipients(mockRecipients, mockIncident, 120);
  assert.equal(matching.rankedRecipients.length, 3);
  // Hope Community Kitchen is closest (2.3km) and accepts hot food and matches dietary
  assert.equal(matching.rankedRecipients[0].recipientId, 'rec-1');
  assert.ok(matching.rankedRecipients[0].score > matching.rankedRecipients[2].score);
});

test('allocateClearedFood: balances 120 portions across multiple recipients within their capacity limits', () => {
  const matching = matchAndRankRecipients(mockRecipients, mockIncident, 120);
  const logistics = allocateClearedFood(120, matching.rankedRecipients, mockRecipients);

  assert.equal(logistics.status, 'balanced');
  assert.equal(logistics.totalClearedPortions, 120);
  assert.equal(logistics.totalAllocatedPortions, 120);
  assert.equal(logistics.unallocatedPortions, 0);
  assert.equal(logistics.allocations.length, 2);

  // Stop 1: Hope Community Kitchen takes 70 (its cap)
  assert.equal(logistics.allocations[0].recipientId, 'rec-1');
  assert.equal(logistics.allocations[0].allocatedPortions, 70);

  // Stop 2: Valley Family Shelter takes remaining 50 (its cap is 50)
  assert.equal(logistics.allocations[1].recipientId, 'rec-2');
  assert.equal(logistics.allocations[1].allocatedPortions, 50);

  // Total allocated = 70 + 50 = 120
  const total = logistics.allocations.reduce((sum, a) => sum + a.allocatedPortions, 0);
  assert.equal(total, 120);
});

test('allocateClearedFood: handles zero cleared portions without dispatch', () => {
  const matching = matchAndRankRecipients(mockRecipients, mockIncident, 0);
  const logistics = allocateClearedFood(0, matching.rankedRecipients, mockRecipients);

  assert.equal(logistics.status, 'unbalanced');
  assert.equal(logistics.totalAllocatedPortions, 0);
  assert.equal(logistics.allocations.length, 0);
});
