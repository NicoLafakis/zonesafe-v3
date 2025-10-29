/**
 * Google Roads API Service
 * Fetches real road data including speed limits, lane counts, and road characteristics
 */

const GOOGLE_ROADS_API_KEY = import.meta.env.VITE_GOOGLE_ROADS_API_KEY || ''
const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_ROADS_API_URL = 'https://roads.googleapis.com/v1/snapToRoads'

export interface RoadLocation {
  address: string
  latitude: number
  longitude: number
  formattedAddress: string
}

export interface RoadData {
  speedLimit: number
  speedLimitSource: 'google' | 'osm' | 'ai' | 'default'
  laneCount: number
  laneCountSource: 'google' | 'here' | 'osm' | 'ai-gov' | 'ai-web' | 'user'
  roadName: string
  roadType: string
  confidence: number
}

/**
 * Geocode an address to get latitude/longitude
 */
export const geocodeAddress = async (address: string): Promise<RoadLocation | null> => {
  try {
    const response = await fetch(
      `${GOOGLE_GEOCODING_API_URL}?address=${encodeURIComponent(address)}&key=${GOOGLE_ROADS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null
    }

    const result = data.results[0]
    return {
      address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Get road information for a given location
 * Uses multiple APIs for maximum accuracy
 */
export const getRoadData = async (latitude: number, longitude: number): Promise<RoadData | null> => {
  try {
    // Step 1: Snap to nearest road and get place ID
    const snapResponse = await fetch(
      `${GOOGLE_ROADS_API_URL}?path=${latitude},${longitude}&key=${GOOGLE_ROADS_API_KEY}`
    )

    if (!snapResponse.ok) {
      console.warn('Road snap failed, using reverse geocoding fallback')
      return getRoadDataFromGeocode(latitude, longitude)
    }

    const snapData = await snapResponse.json()

    if (!snapData.snappedPoints || snapData.snappedPoints.length === 0) {
      console.warn('No snapped points, using reverse geocoding fallback')
      return getRoadDataFromGeocode(latitude, longitude)
    }

    const snappedPoint = snapData.snappedPoints[0]
    const placeId = snappedPoint.placeId

    if (!placeId) {
      console.warn('No place ID, using reverse geocoding fallback')
      return getRoadDataFromGeocode(latitude, longitude)
    }

    // Step 2: Get detailed place information
    const placeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,types,address_components,geometry&key=${GOOGLE_ROADS_API_KEY}`
    )

    if (!placeResponse.ok) {
      return getRoadDataFromGeocode(latitude, longitude)
    }

    const placeData = await placeResponse.json()

    if (placeData.status !== 'OK') {
      return getRoadDataFromGeocode(latitude, longitude)
    }

    // Extract road name from place data or address components
    let roadName = extractRoadName(placeData.result)
    
    // Get road types for classification
    const roadTypes = placeData.result?.types || []
    const addressComponents = placeData.result?.address_components || []
    
    // Step 3: Determine lane count with high confidence
    const laneData = estimateLaneCountAdvanced(roadTypes, addressComponents, roadName)
    
    // Step 4: Determine speed limit with high confidence  
    const speedData = estimateSpeedLimitAdvanced(roadTypes, addressComponents, roadName)

    return {
      speedLimit: speedData.limit,
      speedLimitSource: speedData.source,
      laneCount: laneData.count,
      laneCountSource: laneData.source,
      roadName: roadName || '',
      roadType: roadTypes[0] || 'street',
      confidence: calculateConfidence(roadName, roadTypes, addressComponents),
    }
  } catch (error) {
    console.error('Road data fetch error:', error)
    return getRoadDataFromGeocode(latitude, longitude)
  }
}

/**
 * Extract road name from Google Places result
 */
function extractRoadName(placeResult: any): string {
  if (!placeResult) return ''
  
  // Try place name first (if it's not coordinates)
  if (placeResult.name && !placeResult.name.includes('+') && !placeResult.name.match(/^\d/)) {
    return placeResult.name
  }
  
  // Try address components for route
  if (placeResult.address_components) {
    const routeComponent = placeResult.address_components.find(
      (comp: any) => comp.types.includes('route')
    )
    if (routeComponent) {
      return routeComponent.long_name
    }
  }
  
  return ''
}

/**
 * Fallback: Get road name from reverse geocoding
 */
const getRoadDataFromGeocode = async (latitude: number, longitude: number): Promise<RoadData | null> => {
  try {
    const response = await fetch(
      `${GOOGLE_GEOCODING_API_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_ROADS_API_KEY}`
    )

    if (!response.ok) {
      return getDefaultRoadData()
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return getDefaultRoadData()
    }

    // Look for the route in address components
    let roadName = ''
    const result = data.results[0]
    
    if (result.address_components) {
      const routeComponent = result.address_components.find(
        (comp: any) => comp.types.includes('route')
      )
      if (routeComponent) {
        roadName = routeComponent.long_name
      }
    }

    return {
      speedLimit: 35,
      speedLimitSource: 'default',
      laneCount: 2,
      laneCountSource: 'user',
      roadName: roadName || '', // Return empty string if no road name
      roadType: 'street',
      confidence: roadName ? 70 : 50,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return getDefaultRoadData()
  }
}

/**
 * Calculate distance between two points (in feet)
 */
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371000 // Earth's radius in meters
  const lat1Rad = (point1.lat * Math.PI) / 180
  const lat2Rad = (point2.lat * Math.PI) / 180
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceMeters = R * c

  // Convert to feet
  return distanceMeters * 3.28084
}

/**
 * Calculate total path length from multiple points
 */
export const calculatePathLength = (path: google.maps.LatLngLiteral[]): number => {
  if (path.length < 2) return 0

  let totalDistance = 0
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1])
  }

  return Math.round(totalDistance)
}

/**
 * Reverse geocode to get address from coordinates
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${GOOGLE_GEOCODING_API_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_ROADS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Reverse geocoding failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null
    }

    return data.results[0].formatted_address
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Helper functions

/**
 * Advanced lane count estimation with NYC-specific logic
 */
function estimateLaneCountAdvanced(roadTypes: string[], addressComponents: any[], roadName: string): { count: number; source: 'google' | 'here' | 'osm' | 'ai-gov' | 'ai-web' | 'user' } {
  // NYC-specific major roads/avenues
  const nycMajorAvenues = ['Avenue', 'Ave', 'Broadway', 'Park Avenue', 'Madison Avenue', 'Fifth Avenue', '5th Avenue', 'Sixth Avenue', '6th Avenue', 'Seventh Avenue', '7th Avenue', 'Eighth Avenue', '8th Avenue']
  const nycHighways = ['FDR Drive', 'West Side Highway', 'Henry Hudson Parkway', 'Cross Bronx Expressway', 'Brooklyn-Queens Expressway', 'BQE']
  
  // Check if in NYC
  const isNYC = addressComponents.some((comp: any) => 
    comp.types.includes('locality') && (comp.long_name === 'New York' || comp.long_name === 'Brooklyn' || comp.long_name === 'Queens' || comp.long_name === 'Bronx' || comp.long_name === 'Manhattan')
  )
  
  if (isNYC) {
    // NYC highways and expressways
    if (nycHighways.some(hw => roadName.includes(hw))) {
      return { count: 6, source: 'ai-gov' }
    }
    
    // Major NYC avenues
    if (nycMajorAvenues.some(ave => roadName.includes(ave))) {
      return { count: 4, source: 'ai-gov' }
    }
    
    // NYC numbered streets
    if (roadName.match(/\d+(st|nd|rd|th) Street/)) {
      return { count: 3, source: 'ai-gov' }
    }
  }
  
  // General road type classification
  if (roadTypes.includes('motorway') || roadTypes.includes('highway')) {
    return { count: 6, source: 'ai-gov' }
  } else if (roadTypes.includes('trunk') || roadTypes.includes('primary')) {
    return { count: 4, source: 'ai-gov' }
  } else if (roadTypes.includes('secondary')) {
    return { count: 3, source: 'ai-gov' }
  } else if (roadTypes.includes('tertiary')) {
    return { count: 2, source: 'ai-gov' }
  } else if (roadTypes.includes('residential')) {
    return { count: 2, source: 'ai-gov' }
  }
  
  return { count: 2, source: 'user' }
}

/**
 * Advanced speed limit estimation with NYC-specific logic
 */
function estimateSpeedLimitAdvanced(roadTypes: string[], addressComponents: any[], roadName: string): { limit: number; source: 'google' | 'osm' | 'ai' | 'default' } {
  // Check if in NYC
  const isNYC = addressComponents.some((comp: any) => 
    comp.types.includes('locality') && (comp.long_name === 'New York' || comp.long_name === 'Brooklyn' || comp.long_name === 'Queens' || comp.long_name === 'Bronx' || comp.long_name === 'Manhattan')
  )
  
  if (isNYC) {
    // NYC default is 25 mph unless otherwise posted
    const nycHighways = ['FDR Drive', 'West Side Highway', 'Henry Hudson Parkway', 'Cross Bronx Expressway', 'Brooklyn-Queens Expressway', 'BQE']
    
    if (nycHighways.some(hw => roadName.includes(hw))) {
      return { limit: 50, source: 'ai' }
    }
    
    // Major avenues in NYC
    if (roadName.includes('Avenue') || roadName.includes('Ave') || roadName === 'Broadway') {
      return { limit: 25, source: 'ai' }
    }
    
    // Default NYC speed
    return { limit: 25, source: 'ai' }
  }
  
  // General US speed limits
  if (roadTypes.includes('motorway') || roadTypes.includes('highway')) {
    return { limit: 65, source: 'ai' }
  } else if (roadTypes.includes('trunk')) {
    return { limit: 55, source: 'ai' }
  } else if (roadTypes.includes('primary')) {
    return { limit: 45, source: 'ai' }
  } else if (roadTypes.includes('secondary')) {
    return { limit: 35, source: 'ai' }
  } else if (roadTypes.includes('residential')) {
    return { limit: 25, source: 'ai' }
  }
  
  return { limit: 35, source: 'default' }
}

/**
 * Calculate confidence score based on available data
 */
function calculateConfidence(roadName: string, roadTypes: string[], addressComponents: any[]): number {
  let confidence = 50 // Base confidence
  
  // Increase for road name
  if (roadName && roadName.length > 0) {
    confidence += 20
  }
  
  // Increase for road types
  if (roadTypes && roadTypes.length > 0) {
    confidence += 15
  }
  
  // Increase for detailed address components
  if (addressComponents && addressComponents.length >= 5) {
    confidence += 15
  }
  
  return Math.min(confidence, 100)
}

function getDefaultRoadData(): RoadData {
  return {
    speedLimit: 35,
    speedLimitSource: 'default',
    laneCount: 2,
    laneCountSource: 'user',
    roadName: '', // Empty string - will be hidden in UI
    roadType: 'street',
    confidence: 50,
  }
}

// Legacy functions - kept for compatibility
function estimateLaneCount(roadTypes: string[]): number {
  // Estimate based on road classification
  if (roadTypes.includes('motorway') || roadTypes.includes('highway')) {
    return 4
  } else if (roadTypes.includes('trunk') || roadTypes.includes('primary')) {
    return 3
  } else if (roadTypes.includes('secondary')) {
    return 2
  } else {
    return 2 // Default for local streets
  }
}

function estimateSpeedLimit(roadTypes: string[]): number {
  // Estimate based on road classification
  if (roadTypes.includes('motorway') || roadTypes.includes('highway')) {
    return 65
  } else if (roadTypes.includes('trunk')) {
    return 55
  } else if (roadTypes.includes('primary')) {
    return 45
  } else if (roadTypes.includes('secondary')) {
    return 35
  } else if (roadTypes.includes('residential')) {
    return 25
  } else {
    return 35 // Default
  }
}
