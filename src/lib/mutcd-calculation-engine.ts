/**
 * MUTCD 11th Edition Calculation Engine
 * Comprehensive calculations for all work categories
 * Reference: MUTCD Part 6 - Temporary Traffic Control (December 2023)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type WorkType = 
  | 'roadway_pavement'
  | 'shoulder'
  | 'intersection'
  | 'bridge'
  | 'roadside_utility'
  | 'mobile';

export type RoadType = 
  | 'urban_low_speed'
  | 'urban_high_speed'
  | 'rural'
  | 'expressway_freeway';

export type WorkDuration = 
  | 'long_term'
  | 'intermediate_term'
  | 'short_term'
  | 'short_duration'
  | 'mobile';

export type TaperType = 
  | 'merging'
  | 'shifting'
  | 'shoulder'
  | 'one_lane_two_way'
  | 'downstream';

export type ArrowBoardType = 'A' | 'B' | 'C' | 'D';

export interface WorkZoneInput {
  // Location & Road Characteristics
  speedLimit: number; // mph
  laneCount: number;
  closedLanes: number[];
  roadType: RoadType;
  workType: WorkType;
  
  // Work Timing & Duration
  duration: WorkDuration;
  isNightWork: boolean;
  isPeakHours: boolean;
  
  // Work Zone Details
  workZoneLengthFeet: number;
  workerCount: number;
  hasFlagger: boolean;
  flaggerCount?: number;
  
  // Equipment
  hasHeavyEquipment: boolean;
  hasMobileEquipment: boolean;
  equipmentWidthFeet?: number;
  
  // Special Conditions
  hasPedestrianFacility: boolean;
  hasBicycleFacility: boolean;
  isIntersection: boolean;
  isBridge: boolean;
  hasShoulderWork: boolean;
  hasMultipleLaneClosure: boolean;
  
  // Traffic Conditions
  averageDailyTraffic?: number;
  hasHeavyTruckTraffic?: boolean;
  
  // Optional overrides
  customLaneWidthFeet?: number;
}

export interface CalculationResults {
  // Taper Calculations
  tapers: {
    mergingTaperLength: number;
    shiftingTaperLength: number;
    shoulderTaperLength: number;
    oneLaneTwoWayTaperLength: number;
    downstreamTaperLength: number;
  };
  
  // Buffer Spaces
  bufferSpaces: {
    longitudinalBufferFeet: number;
    lateralBufferFeet: number;
    stoppingSightDistance: number;
  };
  
  // Sign Placement
  signPlacement: {
    advanceWarningDistances: {
      A: number; // First sign (closest to TTC)
      B: number; // Second sign spacing
      C: number; // Third sign spacing
    };
    minimumSignHeight: number;
    lateralOffset: number;
  };
  
  // Channelizing Devices
  channelizingDevices: {
    taperSpacing: number;
    tangentSpacing: number;
    extensionDistance: number;
    conflictingMarkingsSpacing?: number;
  };
  
  // Arrow Board Requirements
  arrowBoard?: {
    type: ArrowBoardType;
    required: boolean;
    minLegibilityDistance: number;
    mountingHeightFeet: number;
  };
  
  // Flagger Station
  flaggerStation?: {
    locationFeet: number;
    illuminationRequired: boolean;
    stoppingSightDistance: number;
  };
  
  // Lane Width Requirements
  laneWidth: {
    minimumFeet: number;
    measurementPoint: string;
    exception?: string;
  };
  
  // Pedestrian Accommodations
  pedestrian?: {
    pathwayWidthInches: number;
    detectableEdgingRequired: boolean;
    rampSlopePercent: number;
    protrudingObjectMaxInches: number;
  };
  
  // Bicycle Accommodations
  bicycle?: {
    detourRequired: boolean;
    detourLengthFeet?: number;
    shareLaneWidthFeet?: number;
  };
  
  // Warning Lights
  warningLights: {
    typeRequired: string;
    minimumHeightInches: number;
    flashRateFPM?: number;
  };
  
  // High Visibility Apparel
  apparelRequirements: {
    minimumClass: number;
    flaggerClass?: number;
  };
  
  // Special Requirements by Work Type
  specialRequirements: string[];
  
  // Compliance Notes
  complianceNotes: string[];
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate base taper length (L)
 * Reference: Section 6B.08, Tables 6B-3, 6B-4
 */
export function calculateBaseTaperLength(
  speedMPH: number,
  offsetWidthFeet: number
): number {
  const S = speedMPH;
  const W = offsetWidthFeet;
  
  if (S <= 40) {
    // L = (W * S²) / 60
    return (W * S * S) / 60;
  } else {
    // L = W * S
    return W * S;
  }
}

/**
 * Calculate all taper lengths
 * Reference: Section 6B.08, Table 6B-3
 */
export function calculateTapers(
  speedMPH: number,
  offsetWidthFeet: number = 12 // Standard lane width
): CalculationResults['tapers'] {
  const L = calculateBaseTaperLength(speedMPH, offsetWidthFeet);
  
  return {
    mergingTaperLength: Math.ceil(L), // At least L
    shiftingTaperLength: Math.ceil(L * 0.5), // At least 0.5L
    shoulderTaperLength: Math.ceil(L * 0.33), // At least 0.33L
    oneLaneTwoWayTaperLength: 100, // 50-100 ft, using max
    downstreamTaperLength: 100, // 50-100 ft, using max
  };
}

/**
 * Get stopping sight distance based on speed
 * Reference: Table 6B-2
 */
export function getStoppingSightDistance(speedMPH: number): number {
  const ssdTable: Record<number, number> = {
    20: 115,
    25: 155,
    30: 200,
    35: 250,
    40: 305,
    45: 360,
    50: 425,
    55: 495,
    60: 570,
    65: 645,
    70: 730,
    75: 820,
  };
  
  // Find closest speed in table
  const speeds = Object.keys(ssdTable).map(Number);
  const closestSpeed = speeds.reduce((prev, curr) => 
    Math.abs(curr - speedMPH) < Math.abs(prev - speedMPH) ? curr : prev
  );
  
  return ssdTable[closestSpeed];
}

/**
 * Calculate buffer space requirements
 * Reference: Section 6B.06, Table 6B-2
 */
export function calculateBufferSpaces(
  speedMPH: number,
  hasHeavyEquipment: boolean,
  workType: WorkType
): CalculationResults['bufferSpaces'] {
  const ssd = getStoppingSightDistance(speedMPH);
  
  // Longitudinal buffer is typically based on SSD
  let longitudinalBuffer = ssd;
  
  // Lateral buffer depends on equipment and work type
  let lateralBuffer = 0;
  
  if (hasHeavyEquipment) {
    lateralBuffer = 4; // Minimum 4 feet for heavy equipment
  } else {
    lateralBuffer = 2; // Minimum 2 feet for light work
  }
  
  // Increase for bridge work
  if (workType === 'bridge') {
    lateralBuffer += 2;
  }
  
  return {
    longitudinalBufferFeet: longitudinalBuffer,
    lateralBufferFeet: lateralBuffer,
    stoppingSightDistance: ssd,
  };
}

/**
 * Calculate advance warning sign spacing
 * Reference: Section 6B.04, Table 6B-1
 */
export function calculateSignSpacing(
  roadType: RoadType,
  speedMPH: number
): CalculationResults['signPlacement']['advanceWarningDistances'] {
  const spacings: Record<RoadType, { A: number; B: number; C: number }> = {
    urban_low_speed: { A: 100, B: 100, C: 100 },
    urban_high_speed: { A: 350, B: 350, C: 350 },
    rural: { A: 500, B: 500, C: 500 },
    expressway_freeway: { A: 1000, B: 1500, C: 2640 },
  };
  
  let baseSpacing = spacings[roadType];
  
  // For freeways/expressways, can extend up to 0.5 miles (2640 ft) or more
  if (roadType === 'expressway_freeway' && speedMPH >= 60) {
    baseSpacing = { A: 1000, B: 1500, C: 2640 };
  }
  
  return baseSpacing;
}

/**
 * Calculate channelizing device spacing
 * Reference: Section 6K.01
 */
export function calculateChannelizingSpacing(
  speedMPH: number,
  conflictingMarkings: boolean = false
): CalculationResults['channelizingDevices'] {
  const S = speedMPH;
  
  const result: CalculationResults['channelizingDevices'] = {
    taperSpacing: S * 1, // Max spacing = 1 * S
    tangentSpacing: S * 2, // Max spacing = 2 * S
    extensionDistance: S * 2, // Extension = 2 * S
  };
  
  if (conflictingMarkings) {
    result.conflictingMarkingsSpacing = S * 0.5; // Max spacing = 0.5 * S
  }
  
  return result;
}

/**
 * Determine arrow board requirements
 * Reference: Section 6L.06, Figure 6L-3
 */
export function determineArrowBoard(
  roadType: RoadType,
  speedMPH: number,
  workType: WorkType,
  hasMobileEquipment: boolean
): CalculationResults['arrowBoard'] | undefined {
  // Arrow board required for freeway lane closures
  const required = roadType === 'expressway_freeway' || 
                   speedMPH >= 55 || 
                   workType === 'roadway_pavement';
  
  if (!required && !hasMobileEquipment) {
    return undefined;
  }
  
  let type: ArrowBoardType;
  let minLegibilityDistance: number;
  
  if (roadType === 'urban_low_speed' || speedMPH < 35) {
    type = 'A';
    minLegibilityDistance = 0.5; // miles
  } else if (speedMPH >= 55 || roadType === 'expressway_freeway') {
    type = 'C';
    minLegibilityDistance = 1.0; // miles
  } else {
    type = 'B';
    minLegibilityDistance = 0.75; // miles
  }
  
  // Type D for authorized vehicles in mobile operations
  if (hasMobileEquipment) {
    type = 'D';
    minLegibilityDistance = 0.5;
  }
  
  return {
    type,
    required: required || hasMobileEquipment,
    minLegibilityDistance,
    mountingHeightFeet: 7,
  };
}

/**
 * Calculate flagger station location
 * Reference: Chapter 6D, Section 6D.03
 */
export function calculateFlaggerStation(
  speedMPH: number,
  isNightWork: boolean
): CalculationResults['flaggerStation'] {
  const ssd = getStoppingSightDistance(speedMPH);
  
  return {
    locationFeet: ssd, // Must be at least SSD in advance
    illuminationRequired: isNightWork,
    stoppingSightDistance: ssd,
  };
}

/**
 * Determine minimum lane width
 * Reference: Section 6N.07
 */
export function determineLaneWidth(
  duration: WorkDuration,
  hasHeavyTruckTraffic: boolean = false
): CalculationResults['laneWidth'] {
  const isShortTerm = duration === 'short_term' || duration === 'short_duration';
  
  if (isShortTerm && !hasHeavyTruckTraffic) {
    return {
      minimumFeet: 9,
      measurementPoint: 'Measured to near face of channelizing devices',
      exception: 'Short-term work on low-volume, low-speed roadway without heavy commercial vehicles',
    };
  }
  
  return {
    minimumFeet: 10,
    measurementPoint: 'Measured to near face of channelizing devices',
  };
}

/**
 * Calculate pedestrian accommodation requirements
 * Reference: Sections 6C.02, 6C.03, 6K.02, 6M.04, 6K.07
 */
export function calculatePedestrianAccommodations(
  hasPedestrianFacility: boolean,
  _workZoneLengthFeet: number
): CalculationResults['pedestrian'] | undefined {
  if (!hasPedestrianFacility) {
    return undefined;
  }
  
  // Passing space requirement: 60" x 60" every 200 feet if width < 60"
  // const needsPassingSpaces = workZoneLengthFeet > 200; // TODO: Implement passing spaces
  
  return {
    pathwayWidthInches: 60, // Preferred continuous width
    detectableEdgingRequired: true,
    rampSlopePercent: 8.33, // Maximum slope (1:12 ratio)
    protrudingObjectMaxInches: 4, // Max projection for objects below 7 ft
  };
}

/**
 * Calculate bicycle accommodation requirements
 * Reference: Engineering judgment + MUTCD guidance
 */
export function calculateBicycleAccommodations(
  hasBicycleFacility: boolean,
  closedLanes: number[],
  laneCount: number,
  workZoneLengthFeet: number
): CalculationResults['bicycle'] | undefined {
  if (!hasBicycleFacility) {
    return undefined;
  }
  
  const allLanesClosed = closedLanes.length === laneCount;
  
  if (allLanesClosed) {
    return {
      detourRequired: true,
      detourLengthFeet: workZoneLengthFeet * 1.5, // Estimate
    };
  }
  
  return {
    detourRequired: false,
    shareLaneWidthFeet: 14, // Minimum width for shared lane
  };
}

/**
 * Determine warning light requirements
 * Reference: Section 6L.07
 */
export function determineWarningLights(
  isNightWork: boolean,
  duration: WorkDuration,
  workType: WorkType
): CalculationResults['warningLights'] {
  // const isStationary = duration !== 'mobile'; // Reserved for future use

  let typeRequired: string;
  let flashRateFPM: number | undefined;
  
  if (workType === 'mobile' || duration === 'mobile') {
    typeRequired = 'Type B (High-Intensity Flashing)';
    flashRateFPM = 55; // For isolated warning
  } else if (isNightWork) {
    typeRequired = 'Type C (Steady-Burn) or Type D (360-degree)';
  } else {
    typeRequired = 'Type A (Low-Intensity Flashing)';
    flashRateFPM = 55;
  }
  
  return {
    typeRequired,
    minimumHeightInches: 30,
    flashRateFPM,
  };
}

/**
 * Determine high-visibility apparel requirements
 * Reference: Section 6C.05
 */
export function determineApparelRequirements(
  isNightWork: boolean,
  hasFlagger: boolean
): CalculationResults['apparelRequirements'] {
  const requirements: CalculationResults['apparelRequirements'] = {
    minimumClass: 2, // ANSI/ISEA 107-2015 Class 2 minimum
  };
  
  if (hasFlagger && isNightWork) {
    requirements.flaggerClass = 3; // Class 3 required for night flaggers
  } else if (hasFlagger) {
    requirements.flaggerClass = 2;
  }
  
  return requirements;
}

// ============================================================================
// WORK TYPE SPECIFIC CALCULATIONS
// ============================================================================

/**
 * Calculate intersection-specific requirements
 */
function calculateIntersectionRequirements(
  input: WorkZoneInput
): string[] {
  const requirements: string[] = [];
  
  // Turn lane considerations
  if (input.closedLanes.length > 0) {
    requirements.push('Provide advance warning for turn lane closures at least 500 feet before intersection');
  }
  
  // Sight distance triangles
  const ssd = getStoppingSightDistance(input.speedLimit);
  requirements.push(`Maintain sight distance triangle of at least ${ssd} feet for all approaches`);
  
  // Pedestrian crossing accommodations
  if (input.hasPedestrianFacility) {
    requirements.push('Maintain accessible pedestrian crossings or provide clearly marked detours');
    requirements.push('Install pedestrian channelizing devices with detectable edges');
  }
  
  // Signal timing adjustments
  if (input.closedLanes.length > 0) {
    requirements.push('Consider temporary signal timing adjustments for reduced capacity');
  }
  
  return requirements;
}

/**
 * Calculate bridge-specific requirements
 */
function calculateBridgeRequirements(
  input: WorkZoneInput
): string[] {
  const requirements: string[] = [];
  
  // Reduced clearance warnings
  requirements.push('Install vertical clearance signs if overhead work reduces clearance');
  
  // Temporary barrier placement
  requirements.push('Temporary barriers must be crash-tested and properly anchored on bridge deck');
  
  // Width restrictions
  const minWidth = determineLaneWidth(input.duration, input.hasHeavyTruckTraffic);
  requirements.push(`Maintain minimum lane width of ${minWidth.minimumFeet} feet on bridge`);
  
  // Additional lateral buffer
  requirements.push('Increase lateral buffer by 2 feet on bridge structures');
  
  // Load restrictions
  if (input.hasHeavyEquipment) {
    requirements.push('Verify bridge load rating accommodates equipment and materials');
  }
  
  return requirements;
}

/**
 * Calculate mobile operation requirements
 */
function calculateMobileOperationRequirements(
  input: WorkZoneInput
): string[] {
  const requirements: string[] = [];
  
  // Shadow vehicle requirements
  const shadowDistance = input.speedLimit * 4; // 4 seconds at speed
  requirements.push(`Position shadow vehicle ${shadowDistance} feet behind work vehicle`);
  
  // Advance warning vehicle
  if (input.speedLimit >= 45) {
    const advanceDistance = input.speedLimit * 8;
    requirements.push(`Position advance warning vehicle ${advanceDistance} feet ahead of operation`);
  }
  
  // Arrow board on mobile vehicle
  requirements.push('Mount Type B or D arrow board on shadow vehicle');
  
  // Warning lights
  requirements.push('Activate high-intensity warning lights on all vehicles');
  
  // Speed differential
  const maxSpeed = Math.min(input.speedLimit - 10, 45);
  requirements.push(`Maximum operating speed: ${maxSpeed} mph`);
  
  return requirements;
}

/**
 * Calculate shoulder work requirements
 */
function calculateShoulderWorkRequirements(
  input: WorkZoneInput
): string[] {
  const requirements: string[] = [];
  
  // Shoulder closure taper
  const tapers = calculateTapers(input.speedLimit);
  requirements.push(`Use shoulder taper of ${tapers.shoulderTaperLength} feet`);
  
  // Buffer from travel lane
  requirements.push('Maintain minimum 2-foot lateral buffer from edge of travel lane');
  
  // Warning signs
  requirements.push('Install "SHOULDER WORK" (W21-105) sign series');
  
  // Intrusion detection
  if (input.speedLimit >= 45) {
    requirements.push('Consider intrusion alarm system for worker protection');
  }
  
  return requirements;
}

/**
 * Calculate multi-lane closure requirements
 */
function calculateMultiLaneClosureRequirements(
  input: WorkZoneInput
): string[] {
  const requirements: string[] = [];
  
  if (!input.hasMultipleLaneClosure || input.closedLanes.length < 2) {
    return requirements;
  }
  
  // Progressive tapers
  const tapers = calculateTapers(input.speedLimit);
  requirements.push(`Use separate merging taper (${tapers.mergingTaperLength} feet) for each closed lane`);
  
  // Arrow boards
  requirements.push(`Install separate arrow board for each closed lane on freeways`);
  
  // Increased advance warning
  const spacing = calculateSignSpacing(input.roadType, input.speedLimit);
  requirements.push(`Increase advance warning distance to ${spacing.C} feet for first sign`);
  
  // Lane assignment signs
  requirements.push('Install lane assignment signs showing which lanes are open/closed');
  
  return requirements;
}

// ============================================================================
// MAIN CALCULATION ENGINE
// ============================================================================

/**
 * Master calculation function
 * Generates complete MUTCD-compliant requirements for any work zone
 */
export function calculateWorkZoneRequirements(
  input: WorkZoneInput
): CalculationResults {
  // Validate input
  if (input.speedLimit < 15 || input.speedLimit > 75) {
    throw new Error('Speed limit must be between 15 and 75 mph');
  }
  
  if (input.closedLanes.length === 0) {
    throw new Error('At least one lane must be selected as closed');
  }
  
  // Determine lane offset width
  const closedLaneWidth = input.customLaneWidthFeet || 12;
  const offsetWidth = closedLaneWidth * input.closedLanes.length;
  
  // Core calculations
  const tapers = calculateTapers(input.speedLimit, offsetWidth);
  const bufferSpaces = calculateBufferSpaces(
    input.speedLimit,
    input.hasHeavyEquipment,
    input.workType
  );
  const signPlacement = {
    advanceWarningDistances: calculateSignSpacing(input.roadType, input.speedLimit),
    minimumSignHeight: input.roadType === 'urban_low_speed' ? 7 : 5,
    lateralOffset: 6, // 6-12 feet typical
  };
  const channelizingDevices = calculateChannelizingSpacing(input.speedLimit);
  const arrowBoard = determineArrowBoard(
    input.roadType,
    input.speedLimit,
    input.workType,
    input.hasMobileEquipment
  );
  const warningLights = determineWarningLights(
    input.isNightWork,
    input.duration,
    input.workType
  );
  const apparelRequirements = determineApparelRequirements(
    input.isNightWork,
    input.hasFlagger
  );
  
  // Optional calculations
  const flaggerStation = input.hasFlagger
    ? calculateFlaggerStation(input.speedLimit, input.isNightWork)
    : undefined;
  const pedestrian = calculatePedestrianAccommodations(
    input.hasPedestrianFacility,
    input.workZoneLengthFeet
  );
  const bicycle = calculateBicycleAccommodations(
    input.hasBicycleFacility,
    input.closedLanes,
    input.laneCount,
    input.workZoneLengthFeet
  );
  const laneWidth = determineLaneWidth(
    input.duration,
    input.hasHeavyTruckTraffic
  );
  
  // Work-type specific requirements
  const specialRequirements: string[] = [];
  
  if (input.isIntersection) {
    specialRequirements.push(...calculateIntersectionRequirements(input));
  }
  
  if (input.isBridge) {
    specialRequirements.push(...calculateBridgeRequirements(input));
  }
  
  if (input.workType === 'mobile' || input.hasMobileEquipment) {
    specialRequirements.push(...calculateMobileOperationRequirements(input));
  }
  
  if (input.hasShoulderWork) {
    specialRequirements.push(...calculateShoulderWorkRequirements(input));
  }
  
  if (input.hasMultipleLaneClosure) {
    specialRequirements.push(...calculateMultiLaneClosureRequirements(input));
  }
  
  // Generate compliance notes
  const complianceNotes: string[] = [];
  
  // Duration-based requirements
  if (input.duration === 'long_term' || input.duration === 'intermediate_term') {
    complianceNotes.push('All devices must be retroreflective or illuminated');
  }
  
  if (input.isNightWork) {
    complianceNotes.push('Flagger stations must be illuminated');
    complianceNotes.push('All signs must be retroreflective');
    complianceNotes.push('Workers must wear Class 3 high-visibility apparel');
  }
  
  if (input.isPeakHours) {
    complianceNotes.push('Consider additional traffic control measures during peak hours');
    complianceNotes.push('Increase buffer space by 25% during high-traffic periods');
  }
  
  // Equipment-based requirements
  if (input.hasHeavyEquipment) {
    complianceNotes.push('All equipment must remain within designated work space');
    complianceNotes.push('Consider truck-mounted attenuator for worker protection');
  }
  
  // Roadway type requirements
  if (input.roadType === 'expressway_freeway') {
    complianceNotes.push('Arrow board required for all lane closures');
    complianceNotes.push('Extend advance warning up to 0.5 miles');
  }
  
  // Flagger requirements
  if (input.hasFlagger) {
    complianceNotes.push('Flaggers must use STOP/SLOW paddles as primary signaling device');
    complianceNotes.push(`Station flaggers at least ${flaggerStation?.stoppingSightDistance} feet in advance`);
  }
  
  // Assemble final results
  const results: CalculationResults = {
    tapers,
    bufferSpaces,
    signPlacement,
    channelizingDevices,
    arrowBoard,
    flaggerStation,
    laneWidth,
    pedestrian,
    bicycle,
    warningLights,
    apparelRequirements,
    specialRequirements,
    complianceNotes,
  };
  
  return results;
}

// ============================================================================
// HELPER FUNCTIONS FOR SPECIFIC USE CASES
// ============================================================================

/**
 * Calculate total work zone length including all areas
 */
export function calculateTotalWorkZoneLength(
  workSpaceFeet: number,
  advanceWarningArea: number,
  taperLength: number,
  bufferSpaceFeet: number,
  terminationAreaFeet: number = 100
): number {
  return (
    advanceWarningArea +
    taperLength +
    bufferSpaceFeet +
    workSpaceFeet +
    terminationAreaFeet
  );
}

/**
 * Estimate number of signs required
 */
export function estimateSignCount(
  workZoneLengthFeet: number,
  roadType: RoadType,
  workType: WorkType,
  hasMultipleLaneClosure: boolean
): { signType: string; count: number }[] {
  const signs: { signType: string; count: number }[] = [];
  
  // Advance warning signs (minimum 3-sign series for longer zones)
  if (roadType === 'expressway_freeway' || workZoneLengthFeet > 500) {
    signs.push({ signType: 'ROAD WORK AHEAD (W20-1)', count: 3 });
  } else {
    signs.push({ signType: 'ROAD WORK AHEAD (W20-1)', count: 1 });
  }
  
  // Lane closure signs
  if (workType === 'roadway_pavement') {
    signs.push({ signType: 'RIGHT/LEFT LANE CLOSED (W4-2)', count: 2 });
    if (hasMultipleLaneClosure) {
      signs.push({ signType: 'LANES CLOSED (W4-2)', count: 2 });
    }
  }
  
  // End road work signs
  signs.push({ signType: 'END ROAD WORK (G20-2)', count: 1 });
  
  // Supplemental signs
  if (workType === 'mobile') {
    signs.push({ signType: 'MOBILE OPERATION (W21-104)', count: 2 });
  }
  
  return signs;
}

/**
 * Calculate minimum number of channelizing devices needed
 */
export function calculateChannelizingDeviceCount(
  taperLengthFeet: number,
  tangentLengthFeet: number,
  speedMPH: number
): number {
  const taperSpacing = speedMPH * 1; // Max spacing in taper
  const tangentSpacing = speedMPH * 2; // Max spacing on tangent
  
  const taperDevices = Math.ceil(taperLengthFeet / taperSpacing);
  const tangentDevices = Math.ceil(tangentLengthFeet / tangentSpacing);
  
  return taperDevices + tangentDevices;
}

/**
 * Generate equipment placement recommendations
 */
export function generateEquipmentPlacement(
  workSpaceLengthFeet: number,
  equipmentWidthFeet: number,
  lateralBufferFeet: number
): {
  internalWidth: number;
  equipmentZones: { start: number; end: number; purpose: string }[];
} {
  const zones: { start: number; end: number; purpose: string }[] = [];
  
  // Entry zone (10% of work space)
  zones.push({
    start: 0,
    end: workSpaceLengthFeet * 0.1,
    purpose: 'Equipment entry/staging',
  });
  
  // Active work zone (80% of work space)
  zones.push({
    start: workSpaceLengthFeet * 0.1,
    end: workSpaceLengthFeet * 0.9,
    purpose: 'Active work area',
  });
  
  // Exit zone (10% of work space)
  zones.push({
    start: workSpaceLengthFeet * 0.9,
    end: workSpaceLengthFeet,
    purpose: 'Equipment exit/staging',
  });
  
  return {
    internalWidth: equipmentWidthFeet + lateralBufferFeet * 2,
    equipmentZones: zones,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate work zone input before calculation
 */
export function validateWorkZoneInput(input: WorkZoneInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Speed limit validation
  if (input.speedLimit < 15 || input.speedLimit > 75) {
    errors.push('Speed limit must be between 15 and 75 mph');
  }
  
  // Lane validation
  if (input.laneCount < 1 || input.laneCount > 8) {
    errors.push('Lane count must be between 1 and 8');
  }
  
  if (input.closedLanes.length === 0) {
    errors.push('At least one lane must be selected as closed');
  }
  
  if (input.closedLanes.some(lane => lane >= input.laneCount)) {
    errors.push('Closed lane indices must be within lane count');
  }
  
  // Work zone length validation
  if (input.workZoneLengthFeet < 50) {
    errors.push('Work zone length must be at least 50 feet');
  }
  
  // Worker validation
  if (input.workerCount < 1) {
    errors.push('Worker count must be at least 1');
  }
  
  // Flagger validation
  if (input.hasFlagger && (!input.flaggerCount || input.flaggerCount < 2)) {
    errors.push('At least 2 flaggers required when flagging is specified');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for common configuration issues
 */
export function checkConfigurationWarnings(input: WorkZoneInput): string[] {
  const warnings: string[] = [];
  
  // High-speed warnings
  if (input.speedLimit >= 55 && !input.hasFlagger && input.workType === 'roadway_pavement') {
    warnings.push('Consider using flaggers or police control for high-speed lane closures');
  }
  
  // Peak hour warnings
  if (input.isPeakHours && input.closedLanes.length > 1) {
    warnings.push('Multiple lane closures during peak hours may cause significant delays');
  }
  
  // Night work warnings
  if (input.isNightWork && input.workerCount > 10) {
    warnings.push('Ensure adequate lighting for large night work crews');
  }
  
  // Pedestrian facility warnings
  if (input.hasPedestrianFacility && input.duration === 'long_term') {
    warnings.push('Long-term work affecting pedestrian facilities requires comprehensive detour planning');
  }
  
  // Bicycle facility warnings
  if (input.hasBicycleFacility) {
    warnings.push('Verify bicycle facility accommodation or detour is provided');
  }
  
  // Bridge work warnings
  if (input.isBridge && input.hasHeavyEquipment) {
    warnings.push('Verify bridge load capacity for heavy equipment');
  }
  
  return warnings;
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  calculateWorkZoneRequirements,
  calculateBaseTaperLength,
  calculateTapers,
  getStoppingSightDistance,
  calculateBufferSpaces,
  calculateSignSpacing,
  calculateChannelizingSpacing,
  determineArrowBoard,
  calculateFlaggerStation,
  determineLaneWidth,
  calculatePedestrianAccommodations,
  calculateBicycleAccommodations,
  determineWarningLights,
  determineApparelRequirements,
  calculateTotalWorkZoneLength,
  estimateSignCount,
  calculateChannelizingDeviceCount,
  generateEquipmentPlacement,
  validateWorkZoneInput,
  checkConfigurationWarnings,
};
