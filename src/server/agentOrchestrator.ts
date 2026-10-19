import { GoogleGenAI, Type } from '@google/genai';
import type {
  IncidentData,
  RecipientOrg,
  OrchestrationResult,
  VisionAgentOutput,
  SafetyGateAgentOutput,
  MatchingAgentOutput,
  LogisticsAgentOutput,
  ImpactAgentOutput,
  AgentExecutionState,
} from '../types/rescue.ts';
import {
  calculateEnvironmentalImpact,
  validateSafetyClearance,
  matchAndRankRecipients,
  allocateClearedFood,
} from '../utils/rescueLogic.ts';

// Server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini call timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Runs the 5 connected agents sequentially, passing verified structured outputs down the pipeline.
 */
export async function orchestrateRescueAgents(
  incident: IncidentData,
  recipients: RecipientOrg[]
): Promise<OrchestrationResult> {
  const startTime = Date.now();
  const ai = getGeminiClient();
  let isFallback = !ai;

  // Track execution states for UI timeline
  const executionStates: Record<string, AgentExecutionState> = {
    vision: {
      stage: 'vision',
      agentName: 'Vision Agent',
      roleDescription: 'Visual & inventory food classification, portion bounds, and uncertainty disclosure',
      status: 'running',
      startedAt: new Date().toISOString(),
      findingsSummary: 'Analyzing food manifest and visual assets...',
      blockers: [],
      outputData: null,
    },
    safety: {
      stage: 'safety',
      agentName: 'Safety Gate Agent',
      roleDescription: 'HACCP temperature monitoring, holding logs, allergen checks, and venue clearance',
      status: 'idle',
      findingsSummary: 'Awaiting vision outputs and procedural safety logs...',
      blockers: [],
      outputData: null,
    },
    matching: {
      stage: 'matching',
      agentName: 'Recipient Matching Agent',
      roleDescription: 'Multi-criteria ranking of community partners by capacity, distance, and dietary tags',
      status: 'idle',
      findingsSummary: 'Awaiting safety clearance for candidate distribution...',
      blockers: [],
      outputData: null,
    },
    logistics: {
      stage: 'logistics',
      agentName: 'Logistics Agent',
      roleDescription: 'Balanced portion allocation, vehicle container requirements, and route proposal',
      status: 'idle',
      findingsSummary: 'Awaiting matched recipient ranking...',
      blockers: [],
      outputData: null,
    },
    impact: {
      stage: 'impact',
      agentName: 'Impact Agent',
      roleDescription: 'Environmental accounting (CO2e, water footprint) with transparent methodology',
      status: 'idle',
      findingsSummary: 'Awaiting confirmed logistics allocation balance...',
      blockers: [],
      outputData: null,
    },
  };

  // -------------------------------------------------------------
  // STAGE 1: Vision Agent
  // -------------------------------------------------------------
  let visionOutput: VisionAgentOutput;
  try {
    if (ai) {
      const prompt = `You are RescueLoop AI's Vision Agent. Analyze the following surplus food inventory report:
Title: ${incident.title}
Venue Type: ${incident.venueType}
Description: ${incident.rawDescription}
Reported Portions: ${incident.reportedPortions}
Storage Method: ${incident.storageMethod} (${incident.storageTempC}°C)
Declared Allergens: ${incident.declaredAllergens.join(', ') || 'None declared'}

Instructions:
1. Parse the food items into specific categories (protein, carbs, veg, bakery, etc.).
2. State an estimated portion range [min, max].
3. STRICT RULE: State explicitly in uncertaintyStatement that visual estimates are NOT verified physical weights or counts and require on-site verification.
4. List any missing information (e.g., exact container tare weights, cooling log timestamps, cross-contact disclosures).
5. Output valid JSON matching the schema.`;

      const parts: any[] = [{ text: prompt }];

      // If a valid base64 image (not SVG data-uri) is attached, pass inlineData
      if (incident.imageUrl && incident.imageUrl.startsWith('data:image/') && !incident.imageUrl.includes('image/svg+xml')) {
        const matches = incident.imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches[2]) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      const visionRes = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                identifiedItems: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      estimatedPortions: { type: Type.NUMBER },
                      confidence: { type: Type.NUMBER },
                      packaging: { type: Type.STRING },
                      allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['name', 'category', 'estimatedPortions', 'confidence', 'packaging', 'allergens'],
                  },
                },
                estimatedTotalPortions: { type: Type.NUMBER },
                confidenceScore: { type: Type.NUMBER },
                portionUncertaintyRange: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                uncertaintyStatement: { type: Type.STRING },
                missingInformationRequests: { type: Type.ARRAY, items: { type: Type.STRING } },
                visualObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                'identifiedItems',
                'estimatedTotalPortions',
                'confidenceScore',
                'portionUncertaintyRange',
                'uncertaintyStatement',
                'missingInformationRequests',
                'visualObservations',
              ],
            },
          },
        }),
        7000
      );

      const parsed = JSON.parse(visionRes.text || '{}');
      visionOutput = {
        identifiedItems: parsed.identifiedItems || [],
        estimatedTotalPortions: parsed.estimatedTotalPortions || incident.reportedPortions,
        confidenceScore: parsed.confidenceScore || 85,
        portionUncertaintyRange: (parsed.portionUncertaintyRange?.length === 2
          ? parsed.portionUncertaintyRange
          : [Math.round(incident.reportedPortions * 0.9), Math.round(incident.reportedPortions * 1.15)]) as [number, number],
        uncertaintyStatement:
          parsed.uncertaintyStatement ||
          'Visual and catalog estimate based on standard gastro pan volumes. Not a verified certified weight.',
        missingInformationRequests: parsed.missingInformationRequests || [
          'Confirm tare weight of stainless pans prior to packaging.',
        ],
        visualObservations: parsed.visualObservations || [
          'Buffet containers appear properly covered with stainless lids.',
        ],
      };
    } else {
      throw new Error('Gemini API key not configured');
    }
  } catch (err) {
    isFallback = true;
    visionOutput = {
      identifiedItems: [
        {
          name: 'Herb Roasted Chicken Breast & Potatoes',
          category: 'protein',
          estimatedPortions: Math.round(incident.reportedPortions * 0.5),
          confidence: 0.88,
          packaging: 'Full-size stainless steel gastro pan with thermal lid',
          allergens: ['Dairy'],
        },
        {
          name: 'Mediterranean Quinoa Salad',
          category: 'carbohydrate',
          estimatedPortions: Math.round(incident.reportedPortions * 0.3),
          confidence: 0.82,
          packaging: 'Half-size deep steam table pan',
          allergens: [],
        },
        {
          name: 'Steamed Garden Vegetables',
          category: 'vegetable',
          estimatedPortions: Math.round(incident.reportedPortions * 0.2),
          confidence: 0.9,
          packaging: 'Half-size steam table pan with vented lid',
          allergens: [],
        },
      ],
      estimatedTotalPortions: incident.reportedPortions,
      confidenceScore: 84,
      portionUncertaintyRange: [
        Math.round(incident.reportedPortions * 0.88),
        Math.round(incident.reportedPortions * 1.12),
      ],
      uncertaintyStatement:
        'DISCLOSURE: Visual and manifest estimate based on standard gastro-pan capacity. Never treat a visual estimate as a certified physical count.',
      missingInformationRequests: [
        'Confirm precise container tare weights upon vehicle loading.',
        'Verify cross-contact declaration for kitchen prep surfaces.',
      ],
      visualObservations: [
        'Hot-hold steam pans verified covered in insulated Cambro carriers.',
        'Distinct separate pans allow selective redistribution if specific items are flagged.',
      ],
    };
  }

  executionStates.vision = {
    ...executionStates.vision,
    status: 'completed',
    completedAt: new Date().toISOString(),
    findingsSummary: `Identified ${visionOutput.identifiedItems.length} food categories (~${visionOutput.estimatedTotalPortions} portions, uncertainty range ${visionOutput.portionUncertaintyRange[0]}-${visionOutput.portionUncertaintyRange[1]}).`,
    outputData: visionOutput,
  };

  // -------------------------------------------------------------
  // STAGE 2: Safety Gate Agent
  // -------------------------------------------------------------
  executionStates.safety.status = 'running';
  executionStates.safety.startedAt = new Date().toISOString();

  // Evaluate deterministic safety rules
  const baseSafety = validateSafetyClearance(incident);
  let safetyOutput: SafetyGateAgentOutput = baseSafety;

  if (ai && !isFallback) {
    try {
      const safetyPrompt = `You are RescueLoop's Safety Gate Agent. Evaluate food redistribution clearance for:
Incident: ${incident.title}
Storage Method: ${incident.storageMethod}
Storage Temp: ${incident.storageTempC}°C (Verified: ${incident.temperatureVerified})
Prep Time: ${incident.preparationTime}
Pickup Deadline: ${incident.pickupDeadline}
Venue Safety Signoff: ${incident.venueSafetyClearanceGranted} by ${incident.venueSafetyOfficerName}
Allergens Disclosed: ${incident.declaredAllergens.join(', ')}
Vision Items: ${JSON.stringify(visionOutput.identifiedItems.map((i) => i.name))}

MANDATE:
- Never independently certify food as safe; evaluate procedural adherence.
- If storage temp is in danger zone (5°C to 60°C) for hot food, or > 4.5°C for chilled food, you MUST BLOCK or FLAG.
- If venue coordinator sign-off is missing, you MUST BLOCK.
- State safety disclaimer clearly.`;

      const safetyRes = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: safetyPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['cleared', 'flagged_for_human_review', 'blocked'] },
                clearedQuantityPortions: { type: Type.NUMBER },
                temperatureNotes: { type: Type.STRING },
                timeComplianceNotes: { type: Type.STRING },
                allergenNotes: { type: Type.STRING },
                safetyDisclaimer: { type: Type.STRING },
                blockers: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['status', 'clearedQuantityPortions', 'safetyDisclaimer', 'blockers', 'recommendations'],
            },
          },
        }),
        7000
      );

      const parsedSafety = JSON.parse(safetyRes.text || '{}');
      // Always enforce the strict deterministic gate as an inviolable baseline
      if (baseSafety.status === 'blocked') {
        safetyOutput = {
          ...baseSafety,
          safetyDisclaimer: parsedSafety.safetyDisclaimer || baseSafety.safetyDisclaimer,
        };
      } else {
        safetyOutput = {
          ...baseSafety,
          status: parsedSafety.status || baseSafety.status,
          clearedQuantityPortions:
            parsedSafety.status === 'blocked' ? 0 : baseSafety.clearedQuantityPortions,
          safetyDisclaimer: parsedSafety.safetyDisclaimer || baseSafety.safetyDisclaimer,
          blockers: [...new Set([...baseSafety.blockers, ...(parsedSafety.blockers || [])])],
          recommendations: [...new Set([...baseSafety.recommendations, ...(parsedSafety.recommendations || [])])],
        };
      }
    } catch {
      safetyOutput = baseSafety;
    }
  }

  const safetyAgentStatus =
    safetyOutput.status === 'blocked'
      ? 'blocked'
      : safetyOutput.status === 'flagged_for_human_review'
      ? 'flagged'
      : 'completed';

  executionStates.safety = {
    ...executionStates.safety,
    status: safetyAgentStatus,
    completedAt: new Date().toISOString(),
    findingsSummary:
      safetyOutput.status === 'cleared'
        ? `Safety clearance granted for ${safetyOutput.clearedQuantityPortions} portions. Temperature (${safetyOutput.temperatureCompliance.actualValue}) and venue signoff valid.`
        : safetyOutput.status === 'flagged_for_human_review'
        ? `Flagged for human review. ${safetyOutput.recommendations.join('; ')}`
        : `BLOCKED FROM REDISTRIBUTION. ${safetyOutput.blockers.join('; ')}`,
    blockers: safetyOutput.blockers,
    outputData: safetyOutput,
  };

  // -------------------------------------------------------------
  // STAGE 3: Recipient Matching Agent
  // -------------------------------------------------------------
  executionStates.matching.status = 'running';
  executionStates.matching.startedAt = new Date().toISOString();

  const matchingOutput = matchAndRankRecipients(
    recipients,
    incident,
    safetyOutput.clearedQuantityPortions
  );

  executionStates.matching = {
    ...executionStates.matching,
    status: 'completed',
    completedAt: new Date().toISOString(),
    findingsSummary: `Ranked ${matchingOutput.rankedRecipients.length} candidate recipient facilities. Top match: ${
      matchingOutput.rankedRecipients[0]?.recipientName || 'None'
    } (${matchingOutput.rankedRecipients[0]?.score || 0} pts).`,
    outputData: matchingOutput,
  };

  // -------------------------------------------------------------
  // STAGE 4: Logistics Agent
  // -------------------------------------------------------------
  executionStates.logistics.status = 'running';
  executionStates.logistics.startedAt = new Date().toISOString();

  // Allocates ONLY cleared portions
  const logisticsOutput = allocateClearedFood(
    safetyOutput.clearedQuantityPortions,
    matchingOutput.rankedRecipients,
    recipients
  );

  executionStates.logistics = {
    ...executionStates.logistics,
    status: safetyOutput.status === 'blocked' ? 'blocked' : 'completed',
    completedAt: new Date().toISOString(),
    findingsSummary:
      logisticsOutput.totalAllocatedPortions > 0
        ? `Allocated ${logisticsOutput.totalAllocatedPortions} portions across ${logisticsOutput.allocations.length} stops. Status: ${logisticsOutput.status}.`
        : 'Zero portions allocated due to safety restrictions or zero capacity.',
    outputData: logisticsOutput,
  };

  // -------------------------------------------------------------
  // STAGE 5: Impact Agent
  // -------------------------------------------------------------
  executionStates.impact.status = 'running';
  executionStates.impact.startedAt = new Date().toISOString();

  const impactOutput = calculateEnvironmentalImpact(
    incident.reportedPortions,
    safetyOutput.clearedQuantityPortions,
    logisticsOutput.totalAllocatedPortions,
    0, // not collected yet
    incident.reportedWeightKg
  );

  executionStates.impact = {
    ...executionStates.impact,
    status: 'completed',
    completedAt: new Date().toISOString(),
    findingsSummary: `Modelled impact: ~${impactOutput.estimatedWeightKg} kg diverted, ${impactOutput.environmentalEstimates.co2eAvoidedKg} kg CO2e avoided, ${impactOutput.environmentalEstimates.waterSavedLiters.toLocaleString()} L water saved.`,
    outputData: impactOutput,
  };

  const finalStatus =
    safetyOutput.status === 'blocked'
      ? 'blocked'
      : safetyOutput.status === 'flagged_for_human_review'
      ? 'flagged'
      : 'success';

  return {
    incidentId: incident.id,
    completedAt: new Date().toISOString(),
    status: finalStatus,
    agents: {
      vision: visionOutput,
      safety: safetyOutput,
      matching: matchingOutput,
      logistics: logisticsOutput,
      impact: impactOutput,
    },
    executionStates: executionStates as Record<any, AgentExecutionState>,
    isFallback,
  };
}
