/**
 * Google Roads API Service
 * Fetches real road data including speed limits, lane counts, and road characteristics
 */

const GOOGLE_ROADS_API_KEY = import.meta.env.VITE_GOOGLE_ROADS_API_KEY || ''
const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_ROADS_API_URL = 'https://roads.googleapis.com/v1/snapToRoads'
const GOOGLE_NEAREST_ROADS_API_URL = 'https://roads.googleapis.com/v1/nearestRoads'
const GOOGLE_DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json'

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

export interface LatLng {
  lat: number
  lng: number
}

export interface RoutedPathResult {
  distanceMeters: number
  path: LatLng[]
  encodedPolyline: string
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
      throw new Error('Road snap failed')
    }

    const snapData = await snapResponse.json()

    if (!snapData.snappedPoints || snapData.snappedPoints.length === 0) {
      return getDefaultRoadData()
    }

    const snappedPoint = snapData.snappedPoints[0]
    const placeId = snappedPoint.placeId

    // Get place details including road name
    const placeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,types&key=${GOOGLE_ROADS_API_KEY}`
    )

    if (!placeResponse.ok) {
      return getDefaultRoadData()
    }

    const placeData = await placeResponse.json()

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
      roadName: placeData.result?.name || 'Unknown Road',
      roadType: roadTypes[0] || 'street',
      confidence: 75,
    }
  } catch (error) {
    console.error('Road data fetch error:', error)
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

/**
 * Snap a point to the nearest road
 * @param point - The point to snap
 * @param maxMeters - Maximum distance in meters to search for a road (default: 30)
 * @returns The snapped point or null if no road found within threshold
 */
export const snapToNearestRoad = async (
  point: LatLng,
  maxMeters: number = 30
): Promise<LatLng | null> => {
  try {
    const url = `${GOOGLE_NEAREST_ROADS_API_URL}?points=${point.lat},${point.lng}&key=${GOOGLE_ROADS_API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Nearest roads API request failed')
    }

    const data = await response.json()
    const snappedPoint = data.snappedPoints?.[0]

    if (!snappedPoint?.location) {
      return null
    }

    const snappedLatLng: LatLng = {
      lat: snappedPoint.location.latitude,
      lng: snappedPoint.location.longitude,
    }

    // Calculate distance between original and snapped point
    const distanceMeters = calculateDistance(point, snappedLatLng) / 3.28084 // Convert feet back to meters

    // Only return snapped point if within threshold
    return distanceMeters <= maxMeters ? snappedLatLng : null
  } catch (error) {
    console.error('Snap to nearest road error:', error)
    return null
  }
}

/**
 * Get routed path and distance between two points using Google Directions API
 * @param origin - Starting point
 * @param destination - Ending point
 * @returns Route information including distance and path
 */
export const getRoutedPathAndDistance = async (
  origin: LatLng,
  destination: LatLng
): Promise<RoutedPathResult | null> => {
  try {
    const url = `${GOOGLE_DIRECTIONS_API_URL}?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${GOOGLE_ROADS_API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Directions API request failed')
    }

    const data = await response.json()

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      return null
    }

    const route = data.routes[0]
    const leg = route.legs[0]
    const distanceMeters = leg.distance.value
    const encodedPolyline = route.overview_polyline.points

    // Decode the polyline to get the path
    const path = decodePolyline(encodedPolyline)

    return {
      distanceMeters,
      path,
      encodedPolyline,
    }
  } catch (error) {
    console.error('Get routed path error:', error)
    return null
  }
}

/**
 * Decode a Google Maps encoded polyline string into an array of LatLng points
 * @param encoded - The encoded polyline string
 * @returns Array of LatLng points
 */
export const decodePolyline = (encoded: string): LatLng[] => {
  const points: LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b: number
    let shift = 0
    let result = 0

    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0

    // Decode longitude
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    })
  }

  return points
}

/**
 * Format distance for display in both metric and imperial units
 * @param meters - Distance in meters
 * @returns Formatted string with both units
 */
export const formatDistance = (meters: number): string => {
  const feet = meters * 3.28084
  const miles = feet / 5280

  // Metric formatting
  let metricStr: string
  if (meters < 1000) {
    metricStr = `${Math.round(meters)} m`
  } else {
    const km = meters / 1000
    metricStr = `${km.toFixed(2)} km`
  }

  // Imperial formatting
  let imperialStr: string
  if (feet < 1000) {
    imperialStr = `${Math.round(feet)} ft`
  } else {
    imperialStr = `${miles.toFixed(2)} mi`
  }

  return `${metricStr} (${imperialStr})`
}

// Helper functions

function getDefaultRoadData(): RoadData {
  return {
    speedLimit: 35,
    speedLimitSource: 'default',
    laneCount: 2,
    laneCountSource: 'user',
    roadName: 'Unknown Road',
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
