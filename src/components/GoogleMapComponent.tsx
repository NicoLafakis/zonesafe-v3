import { useCallback, useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api'
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

  const [, setMap] = useState<google.maps.Map | null>(null)
  const [localStartPin, setLocalStartPin] = useState<google.maps.LatLngLiteral | undefined>(startPin)
  const [localEndPin, setLocalEndPin] = useState<google.maps.LatLngLiteral | undefined>(endPin)
  const [isPlacingPin, setIsPlacingPin] = useState(false)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && isPlacingPin) {
      const position = { lat: e.latLng.lat(), lng: e.latLng.lng() }

      if (!localStartPin) {
        // Place start pin
        setLocalStartPin(position)
        
        // If single pin mode, notify parent immediately
        if (pinMode === 'single' && onPinsPlaced) {
          onPinsPlaced({ start: position })
          setIsPlacingPin(false)
        }
      } else if (pinMode === 'dual' && !localEndPin) {
        // Place end pin
        setLocalEndPin(position)
        
        // Notify parent with both pins
        if (onPinsPlaced) {
          onPinsPlaced({ start: localStartPin, end: position })
        }
        setIsPlacingPin(false)
      }
      
      // Legacy single location select support
      if (onLocationSelect && pinMode === 'single') {
        onLocationSelect(position)
      }
    }
  }, [isPlacingPin, localStartPin, localEndPin, pinMode, onPinsPlaced, onLocationSelect])

  const handleStartPlacingPins = () => {
    setIsPlacingPin(true)
    setLocalStartPin(undefined)
    setLocalEndPin(undefined)
  }

  const handleClearPins = () => {
    setLocalStartPin(undefined)
    setLocalEndPin(undefined)
    setIsPlacingPin(false)
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

  // Polyline connecting two pins (for dual mode)
  const lineOptions: google.maps.PolylineOptions = {
    strokeColor: colors.primary,
    strokeOpacity: 0.8,
    strokeWeight: 4,
    clickable: false,
  }

  const pinsPlaced = pinMode === 'single' ? !!localStartPin : !!(localStartPin && localEndPin)
  const distance = calculateDistance()

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          ...mapOptions,
          cursor: isPlacingPin ? 'crosshair' : 'default',
        }}
      >
        {/* Start Pin */}
        {localStartPin && (
          <Marker
            position={localStartPin}
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

        {/* Line connecting pins (dual mode only) */}
        {pinMode === 'dual' && localStartPin && localEndPin && (
          <Polyline
            path={[localStartPin, localEndPin]}
            options={lineOptions}
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
            <div style={{
              padding: '10px 16px',
              backgroundColor: colors.accent,
              color: colors.textPrimary,
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
            }}>
              {!localStartPin && `Click on map to place ${pinMode === 'single' ? 'pin' : 'START pin'}`}
              {localStartPin && !localEndPin && pinMode === 'dual' && 'Click on map to place END pin'}
            </div>
          )}

          {pinsPlaced && (
            <>
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
