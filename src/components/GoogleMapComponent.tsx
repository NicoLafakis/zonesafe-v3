import { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api'
import { colors } from '../styles/theme'

const libraries: ("drawing" | "places" | "geometry")[] = ["drawing", "places", "geometry"]

interface GoogleMapComponentProps {
  center: { lat: number; lng: number }
  zoom?: number
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void
  onDrawComplete?: (path: google.maps.LatLngLiteral[]) => void
  workZonePath?: google.maps.LatLngLiteral[]
  markerPosition?: google.maps.LatLngLiteral
  height?: string
}

const GoogleMapComponent = ({
  center,
  zoom = 15,
  onLocationSelect,
  onDrawComplete,
  workZonePath = [],
  markerPosition,
  height = '400px',
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

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const position = { lat: e.latLng.lat(), lng: e.latLng.lng() }

      if (isDrawing) {
        // Add point to current path
        const newPath = [...currentPath, position]
        setCurrentPath(newPath)
      } else if (onLocationSelect) {
        // Select location for marker
        onLocationSelect(position)
      }
    }
  }, [isDrawing, currentPath, onLocationSelect])

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
      </GoogleMap>

      {/* Drawing controls */}
      {onDrawComplete && (
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
    </div>
  )
}

export default GoogleMapComponent
