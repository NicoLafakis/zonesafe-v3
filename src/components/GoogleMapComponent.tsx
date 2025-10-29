import { useCallback, useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api'
import { colors } from '../styles/theme'
import {
  snapToNearestRoad,
  getRoutedPathAndDistance,
  formatDistance,
  type LatLng,
} from '../services/roadsAPI'
import type { MeasurementMode } from './MeasurementToolSelector'

const libraries: ("drawing" | "places" | "geometry")[] = ["drawing", "places", "geometry"]

interface GoogleMapComponentProps {
  center: { lat: number; lng: number }
  zoom?: number
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void
  onDrawComplete?: (path: google.maps.LatLngLiteral[]) => void
  workZonePath?: google.maps.LatLngLiteral[]
  markerPosition?: google.maps.LatLngLiteral
  height?: string
  measurementMode?: MeasurementMode
  onPinsMeasurementComplete?: (data: {
    startPin: LatLng
    endPin: LatLng
    distanceMeters: number
    routePath: LatLng[]
  }) => void
}

const GoogleMapComponent = ({
  center,
  zoom = 15,
  onLocationSelect,
  onDrawComplete,
  workZonePath = [],
  markerPosition,
  height = '400px',
  measurementMode = 'none',
  onPinsMeasurementComplete,
}: GoogleMapComponentProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_ROADS_API_KEY || '',
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<google.maps.LatLngLiteral[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)

  // Pins mode state
  const [startPin, setStartPin] = useState<LatLng | null>(null)
  const [endPin, setEndPin] = useState<LatLng | null>(null)
  const [routePath, setRoutePath] = useState<LatLng[] | null>(null)
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null)
  const [pinsPrompt, setPinsPrompt] = useState<string>('Place a Start Pin')
  const [isPinsLoading, setIsPinsLoading] = useState(false)
  const [pinsError, setPinsError] = useState<string | null>(null)

  // Reset state when measurement mode changes
  useEffect(() => {
    if (measurementMode === 'draw') {
      // Clear pins state when switching to draw mode
      setStartPin(null)
      setEndPin(null)
      setRoutePath(null)
      setDistanceMeters(null)
      setPinsPrompt('Place a Start Pin')
      setPinsError(null)
    } else if (measurementMode === 'pins') {
      // Clear drawing state when switching to pins mode
      setIsDrawing(false)
      setCurrentPath([])
    }
  }, [measurementMode])

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleCenterToGPS = useCallback(() => {
    if (!map) return

    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const userLocation = { lat: latitude, lng: longitude }
        map.panTo(userLocation)
        map.setZoom(17)
      },
      (error) => {
        let errorMessage = 'Unable to get your location'
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.'
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.'
        }
        setLocationError(errorMessage)
      }
    )
  }, [map])

  const handlePinClick = useCallback(async (position: LatLng) => {
    setPinsError(null)
    setIsPinsLoading(true)

    try {
      if (!startPin) {
        // Place start pin
        const snapped = await snapToNearestRoad(position)
        if (!snapped) {
          setPinsError('No nearby road. Try tapping closer to a roadway.')
          setIsPinsLoading(false)
          return
        }
        setStartPin(snapped)
        setPinsPrompt('Place an End Pin')
      } else if (!endPin) {
        // Place end pin
        const snapped = await snapToNearestRoad(position)
        if (!snapped) {
          setPinsError('No nearby road. Try tapping closer to a roadway.')
          setIsPinsLoading(false)
          return
        }
        setEndPin(snapped)

        // Get routed path and distance
        const routeResult = await getRoutedPathAndDistance(startPin, snapped)
        if (!routeResult) {
          setPinsError('No route found. Try moving the pins to a nearby road.')
          setEndPin(null)
          setIsPinsLoading(false)
          return
        }

        setRoutePath(routeResult.path)
        setDistanceMeters(routeResult.distanceMeters)
        setPinsPrompt('')

        // Notify parent component
        if (onPinsMeasurementComplete) {
          onPinsMeasurementComplete({
            startPin,
            endPin: snapped,
            distanceMeters: routeResult.distanceMeters,
            routePath: routeResult.path,
          })
        }
      }
    } catch (error) {
      console.error('Pin placement error:', error)
      setPinsError('Routing temporarily unavailable. Please try again.')
    } finally {
      setIsPinsLoading(false)
    }
  }, [startPin, endPin, onPinsMeasurementComplete])

  const handleClearPins = useCallback(() => {
    setStartPin(null)
    setEndPin(null)
    setRoutePath(null)
    setDistanceMeters(null)
    setPinsPrompt('Place a Start Pin')
    setPinsError(null)
  }, [])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const position = { lat: e.latLng.lat(), lng: e.latLng.lng() }

      if (measurementMode === 'pins') {
        // Handle pins mode
        handlePinClick(position)
      } else if (isDrawing) {
        // Add point to current path
        const newPath = [...currentPath, position]
        setCurrentPath(newPath)
      } else if (onLocationSelect) {
        // Select location for marker
        onLocationSelect(position)
      }
    }
  }, [measurementMode, isDrawing, currentPath, onLocationSelect, handlePinClick])

  const handleStartDrawing = () => {
    setIsDrawing(true)
    setCurrentPath([])
  }

  const handleFinishDrawing = () => {
    if (currentPath.length > 1 && onDrawComplete) {
      onDrawComplete(currentPath)
    }
    setIsDrawing(false)
    setCurrentPath([])
  }

  const handleCancelDrawing = () => {
    setIsDrawing(false)
    setCurrentPath([])
  }

  if (loadError) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutralLight,
        borderRadius: '8px',
        color: colors.textLight,
      }}>
        Error loading Google Maps. Please check your API key.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutralLight,
        borderRadius: '8px',
        color: colors.textLight,
      }}>
        Loading map...
      </div>
    )
  }

  const mapContainerStyle = {
    width: '100%',
    height,
    borderRadius: '8px',
  }

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    clickableIcons: false,
  }

  // Polyline options for work zone
  const workZoneOptions: google.maps.PolylineOptions = {
    strokeColor: colors.primary,
    strokeOpacity: 0.8,
    strokeWeight: 4,
    clickable: false,
  }

  // Polyline options for drawing
  const drawingOptions: google.maps.PolylineOptions = {
    strokeColor: colors.accent,
    strokeOpacity: 0.6,
    strokeWeight: 3,
    clickable: false,
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* Marker for selected location */}
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: colors.primary,
              fillOpacity: 1,
              strokeColor: colors.surface,
              strokeWeight: 2,
            }}
          />
        )}

        {/* Work zone path (saved) */}
        {workZonePath.length > 1 && (
          <Polyline
            path={workZonePath}
            options={workZoneOptions}
          />
        )}

        {/* Current drawing path */}
        {isDrawing && currentPath.length > 0 && (
          <Polyline
            path={currentPath}
            options={drawingOptions}
          />
        )}

        {/* Drawing points */}
        {isDrawing && currentPath.map((point) => (
          <Marker
            key={`${point.lat}-${point.lng}`}
            position={point}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 5,
              fillColor: colors.accent,
              fillOpacity: 1,
              strokeColor: colors.surface,
              strokeWeight: 1,
            }}
          />
        ))}

        {/* Pins mode: Start pin */}
        {measurementMode === 'pins' && startPin && (
          <Marker
            position={startPin}
            label={{
              text: 'A',
              color: colors.surface,
              fontWeight: 'bold',
              fontSize: '14px',
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: colors.success,
              fillOpacity: 1,
              strokeColor: colors.surface,
              strokeWeight: 2,
            }}
          />
        )}

        {/* Pins mode: End pin */}
        {measurementMode === 'pins' && endPin && (
          <Marker
            position={endPin}
            label={{
              text: 'B',
              color: colors.surface,
              fontWeight: 'bold',
              fontSize: '14px',
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: colors.error,
              fillOpacity: 1,
              strokeColor: colors.surface,
              strokeWeight: 2,
            }}
          />
        )}

        {/* Pins mode: Route polyline */}
        {measurementMode === 'pins' && routePath && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: colors.primary,
              strokeOpacity: 0.8,
              strokeWeight: 4,
              clickable: false,
            }}
          />
        )}
      </GoogleMap>

      {/* Drawing controls */}
      {onDrawComplete && measurementMode === 'draw' && (
        <>
          {locationError && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: colors.warning,
              color: colors.textPrimary,
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '8px',
            }}>
              {locationError}
            </div>
          )}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {/* GPS Center Button */}
            <button
              onClick={handleCenterToGPS}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.neutral,
                color: colors.textLight,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
              title="Center map on your current location"
            >
              📍 Center to GPS
            </button>

            {isDrawing ? (
              <>
                <button
                  onClick={handleFinishDrawing}
                  disabled={currentPath.length < 2}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentPath.length < 2 ? colors.neutralLight : colors.success,
                    color: colors.textLight,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentPath.length < 2 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    opacity: currentPath.length < 2 ? 0.5 : 1,
                  }}
                >
                  Finish Drawing ({currentPath.length} points)
                </button>
                <button
                  onClick={handleCancelDrawing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.neutral,
                    color: colors.textLight,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleStartDrawing}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.primary,
                  color: colors.textLight,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Draw Work Zone
              </button>
            )}
          </div>
        </>
      )}

      {/* Pins mode controls */}
      {measurementMode === 'pins' && (
        <>
          {/* Prompt */}
          {pinsPrompt && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: colors.primary,
              color: colors.textLight,
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: 600,
            }}>
              {isPinsLoading ? 'Processing...' : pinsPrompt}
            </div>
          )}

          {/* Error message */}
          {pinsError && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: colors.error,
              color: colors.textLight,
              borderRadius: '8px',
              fontSize: '14px',
            }}>
              {pinsError}
            </div>
          )}

          {/* Distance display */}
          {distanceMeters !== null && (
            <div style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: colors.success,
              color: colors.textLight,
              borderRadius: '8px',
              fontSize: '16px',
              textAlign: 'center',
              fontWeight: 700,
            }}>
              Distance: {formatDistance(distanceMeters)}
            </div>
          )}

          {/* Controls */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {/* GPS Center Button */}
            <button
              onClick={handleCenterToGPS}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.neutral,
                color: colors.textLight,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
              title="Center map on your current location"
            >
              📍 Center to GPS
            </button>

            {/* Clear button */}
            {(startPin || endPin) && (
              <button
                onClick={handleClearPins}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.neutral,
                  color: colors.textLight,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            )}
          </div>

          {locationError && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: colors.warning,
              color: colors.textPrimary,
              borderRadius: '8px',
              fontSize: '14px',
            }}>
              {locationError}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GoogleMapComponent
