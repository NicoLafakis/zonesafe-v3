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
 */
export const getRoadData = async (latitude: number, longitude: number): Promise<RoadData | null> => {
  try {
    // Snap point to nearest road
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

    // Get place details including road name
    const placeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,types,address_components&key=${GOOGLE_ROADS_API_KEY}`
    )

    if (!placeResponse.ok) {
      return getRoadDataFromGeocode(latitude, longitude)
    }

    const placeData = await placeResponse.json()

    if (placeData.status !== 'OK') {
      return getRoadDataFromGeocode(latitude, longitude)
    }

    // Extract road name from place data or address components
    let roadName = ''
    
    if (placeData.result?.name && !placeData.result.name.includes('+')) {
      // Use the place name if it looks like a road name (not coordinates)
      roadName = placeData.result.name
    } else if (placeData.result?.address_components) {
      // Try to extract from address components
      const routeComponent = placeData.result.address_components.find(
        (comp: any) => comp.types.includes('route')
      )
      if (routeComponent) {
        roadName = routeComponent.long_name
      }
    }

    // Estimate lane count based on road type
    const roadTypes = placeData.result?.types || []
    const laneCount = estimateLaneCount(roadTypes)

    // Get speed limit (Google Roads API doesn't provide this directly, so we'll use defaults)
    const speedLimit = estimateSpeedLimit(roadTypes)

    return {
      speedLimit,
      speedLimitSource: 'default',
      laneCount,
      laneCountSource: 'ai-gov',
      roadName: roadName || '', // Return empty string if no road name found
      roadType: roadTypes[0] || 'street',
      confidence: roadName ? 85 : 60,
    }
  } catch (error) {
    console.error('Road data fetch error:', error)
    return getRoadDataFromGeocode(latitude, longitude)
  }
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
