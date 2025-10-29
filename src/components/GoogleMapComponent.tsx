import { useCallback, useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { colors } from '../styles/theme'

const libraries: ("drawing" | "places" | "geometry")[] = ["places", "geometry"]

interface GoogleMapComponentProps {
  center: { lat: number; lng: number }
  zoom?: number
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void
  onPinsPlaced?: (pins: { start: google.maps.LatLngLiteral; end?: google.maps.LatLngLiteral }) => void
  pinMode?: 'single' | 'dual' // single for intersection/roadside, dual for roadway/shoulder/bridge
  startPin?: google.maps.LatLngLiteral
  endPin?: google.maps.LatLngLiteral
  height?: string
  showPinControls?: boolean
}

const GoogleMapComponent = ({
  center,
  zoom = 15,
  onLocationSelect,
  onPinsPlaced,
  pinMode = 'dual',
  startPin,
  endPin,
  height = '400px',
  showPinControls = true,
}: GoogleMapComponentProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_ROADS_API_KEY || '',
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [localStartPin, setLocalStartPin] = useState<google.maps.LatLngLiteral | undefined>(startPin)
  const [localEndPin, setLocalEndPin] = useState<google.maps.LatLngLiteral | undefined>(endPin)
  const [isPlacingPin, setIsPlacingPin] = useState(false)
  const [isDraggingStart, setIsDraggingStart] = useState(false)
  const [isDraggingEnd, setIsDraggingEnd] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Center map to user's GPS location
  const handleCenterToUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setMapCenter(userLocation)
        if (map) {
          map.panTo(userLocation)
          map.setZoom(16)
        }
        setLocatingUser(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please check your browser permissions.')
        setLocatingUser(false)
      }
    )
  }

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng && isPlacingPin && !isDraggingStart && !isDraggingEnd) {
      const clickedPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() }

      // Snap to nearest road
      const snappedPosition = await snapToRoad(clickedPosition)
      const position = snappedPosition || clickedPosition

      if (!localStartPin) {
        // Place start pin
        setLocalStartPin(position)
      } else if (pinMode === 'dual' && !localEndPin) {
        // Place end pin (dual mode only)
        setLocalEndPin(position)
      }
    }
  }, [isPlacingPin, localStartPin, localEndPin, pinMode, isDraggingStart, isDraggingEnd])

  // Snap point to nearest road using Google Roads API
  const snapToRoad = async (point: google.maps.LatLngLiteral): Promise<google.maps.LatLngLiteral | null> => {
    try {
      const response = await fetch(
        `https://roads.googleapis.com/v1/snapToRoads?path=${point.lat},${point.lng}&key=${import.meta.env.VITE_GOOGLE_ROADS_API_KEY}`
      )
      
      if (!response.ok) return null
      
      const data = await response.json()
      
      if (data.snappedPoints && data.snappedPoints.length > 0) {
        const snapped = data.snappedPoints[0]
        return {
          lat: snapped.location.latitude,
          lng: snapped.location.longitude,
        }
      }
      
      return null
    } catch (error) {
      console.warn('Road snapping failed:', error)
      return null
    }
  }

  const handleStartPlacingPins = () => {
    setIsPlacingPin(true)
    setLocalStartPin(undefined)
    setLocalEndPin(undefined)
  }

  const handleClearPins = () => {
    setLocalStartPin(undefined)
    setLocalEndPin(undefined)
  }

  const handleConfirmPins = () => {
    if (localStartPin && onPinsPlaced) {
      onPinsPlaced({ 
        start: localStartPin, 
        end: pinMode === 'dual' ? localEndPin : undefined 
      })
      setIsPlacingPin(false)
    }
  }

  // Handle marker drag for start pin
  const handleStartPinDrag = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLocalStartPin({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
    // Reset dragging state after a short delay
    setTimeout(() => setIsDraggingStart(false), 100)
  }

  // Handle marker drag for end pin
  const handleEndPinDrag = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLocalEndPin({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
    // Reset dragging state after a short delay
    setTimeout(() => setIsDraggingEnd(false), 100)
  }

  // Calculate distance between pins for display
  const calculateDistance = () => {
    if (localStartPin && localEndPin && window.google?.maps?.geometry) {
      const start = new window.google.maps.LatLng(localStartPin.lat, localStartPin.lng)
      const end = new window.google.maps.LatLng(localEndPin.lat, localEndPin.lng)
      const meters = window.google.maps.geometry.spherical.computeDistanceBetween(start, end)
      const feet = Math.round(meters * 3.28084)
      return feet
    }
    return 0
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
        color: colors.textPrimary,
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
        color: colors.textPrimary,
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

  const pinsPlaced = pinMode === 'single' ? !!localStartPin : !!(localStartPin && localEndPin)
  const distance = calculateDistance()

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* Start Pin */}
        {localStartPin && (
          <Marker
            position={localStartPin}
            draggable={isPlacingPin}
            onDragEnd={handleStartPinDrag}
            onDragStart={() => setIsDraggingStart(true)}
            onDrag={() => setIsDraggingStart(true)}
            label={{
              text: pinMode === 'single' ? '📍' : 'START',
              color: colors.textLight,
              fontWeight: 'bold',
              fontSize: '12px',
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: pinMode === 'single' ? 10 : 12,
              fillColor: colors.primary,
              fillOpacity: 1,
              strokeColor: colors.surface,
              strokeWeight: 3,
            }}
          />
        )}

        {/* End Pin (dual mode only) */}
        {pinMode === 'dual' && localEndPin && (
          <Marker
            position={localEndPin}
            draggable={isPlacingPin}
            onDragEnd={handleEndPinDrag}
            onDragStart={() => setIsDraggingEnd(true)}
            onDrag={() => setIsDraggingEnd(true)}
            label={{
              text: 'END',
              color: colors.textLight,
              fontWeight: 'bold',
              fontSize: '12px',
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: colors.error,
              fillOpacity: 1,
              strokeColor: colors.surface,
              strokeWeight: 3,
            }}
          />
        )}
      </GoogleMap>

      {/* Pin Controls */}
      {showPinControls && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Center to User Location Button - always visible */}
          <button
            onClick={handleCenterToUser}
            disabled={locatingUser}
            style={{
              padding: '10px 20px',
              backgroundColor: locatingUser ? colors.neutralLight : colors.neutral,
              color: colors.textLight,
              border: 'none',
              borderRadius: '8px',
              cursor: locatingUser ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              opacity: locatingUser ? 0.6 : 1,
            }}
          >
            {locatingUser ? '📍 Locating...' : '📍 My Location'}
          </button>

          {!isPlacingPin && !pinsPlaced && (
            <button
              onClick={handleStartPlacingPins}
              style={{
                padding: '10px 20px',
                backgroundColor: colors.primary,
                color: colors.textLight,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              📍 {pinMode === 'single' ? 'Place Pin on Map' : 'Place Start & End Pins'}
            </button>
          )}

          {isPlacingPin && (
            <>
              <div style={{
                padding: '10px 16px',
                backgroundColor: colors.accent,
                color: colors.textPrimary,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {!localStartPin && `Click to place ${pinMode === 'single' ? 'pin' : 'START pin'}`}
                {localStartPin && !localEndPin && pinMode === 'dual' && 'Click to place END pin'}
                {((pinMode === 'single' && localStartPin) || (pinMode === 'dual' && localStartPin && localEndPin)) && 
                  '✓ Drag pins to adjust position'}
              </div>

              {/* Clear Pins while placing */}
              {localStartPin && (
                <button
                  onClick={handleClearPins}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: colors.neutral,
                    color: colors.textLight,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Clear Pins
                </button>
              )}

              {/* Set Zone Position button - confirm placement */}
              {((pinMode === 'single' && localStartPin) || (pinMode === 'dual' && localStartPin && localEndPin)) && (
                <button
                  onClick={handleConfirmPins}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: colors.success,
                    color: colors.textLight,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  ✓ Set Zone Position
                </button>
              )}
            </>
          )}

          {pinsPlaced && !isPlacingPin && (
            <>
              <button
                onClick={() => setIsPlacingPin(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: colors.neutral,
                  color: colors.textLight,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Adjust Pins
              </button>
              {pinMode === 'dual' && distance > 0 && (
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: colors.success,
                  color: colors.textLight,
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}>
                  ✓ Distance: {distance.toLocaleString()} feet
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default GoogleMapComponent
