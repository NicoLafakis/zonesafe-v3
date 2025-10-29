import { useState, useEffect } from 'react'
import { Info, Loader, AlertCircle } from 'lucide-react'
import { usePlanWizard } from '../../contexts/PlanWizardContext'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'
import GoogleMapComponent from '../GoogleMapComponent'
import { geocodeAddress, getRoadData, reverseGeocode } from '../../services/roadsAPI'

interface Step1LocationProps {
  onNext: () => void
}

const Step1Location = ({ onNext }: Step1LocationProps) => {
  const { planData, updateRoadData } = usePlanWizard()
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }) // Default to NYC
  const [loadingRoadData, setLoadingRoadData] = useState(false)
  const [searchAddress, setSearchAddress] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showManualFallback, setShowManualFallback] = useState(false)
  
  // Manual fallback fields
  const [manualStartAddress, setManualStartAddress] = useState('')
  const [manualEndAddress, setManualEndAddress] = useState('')
  const [manualCrossStreet1, setManualCrossStreet1] = useState('')
  const [manualCrossStreet2, setManualCrossStreet2] = useState('')
  const [manualCity, setManualCity] = useState('')
  const [manualState, setManualState] = useState('')
  const [manualZip, setManualZip] = useState('')

  // Determine pin mode based on work type
  const pinMode = ['intersection', 'roadside_utility'].includes(planData.workType) ? 'single' : 'dual'
  const isIntersection = planData.workType === 'intersection'

  // Initialize map with existing data if editing
  useEffect(() => {
    if (planData.roadData.startPin) {
      setMapCenter(planData.roadData.startPin)
    } else if (planData.roadData.startAddress) {
      geocodeAddress(planData.roadData.startAddress).then((location) => {
        if (location) {
          setMapCenter({ lat: location.latitude, lng: location.longitude })
        }
      })
    }
  }, [])

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      setSearchError('Please enter an address')
      return
    }

    setLoadingRoadData(true)
    setSearchError(null)

    const location = await geocodeAddress(searchAddress)
    if (location) {
      setMapCenter({ lat: location.latitude, lng: location.longitude })
      setSearchError(null)
    } else {
      setSearchError('Address not found. Please try again.')
    }

    setLoadingRoadData(false)
  }

  const handlePinsPlaced = async (pins: { start: google.maps.LatLngLiteral; end?: google.maps.LatLngLiteral }) => {
    setLoadingRoadData(true)
    setShowManualFallback(false)

    try {
      // Get start address
      const startAddress = await reverseGeocode(pins.start.lat, pins.start.lng)
      
      // Get end address if dual mode
      let endAddress = ''
      let workZoneLengthFeet = 0
      
      if (pins.end && pinMode === 'dual') {
        endAddress = await reverseGeocode(pins.end.lat, pins.end.lng)
        
        // Calculate distance between pins
        if (window.google?.maps?.geometry) {
          const start = new window.google.maps.LatLng(pins.start.lat, pins.start.lng)
          const end = new window.google.maps.LatLng(pins.end.lat, pins.end.lng)
          const meters = window.google.maps.geometry.spherical.computeDistanceBetween(start, end)
          workZoneLengthFeet = Math.round(meters * 3.28084)
        }
      }

      // Get road data from start point
      const roadData = await getRoadData(pins.start.lat, pins.start.lng)

      if (roadData) {
        updateRoadData({
          roadName: roadData.roadName,
          startAddress: startAddress || 'Unknown',
          endAddress: endAddress || startAddress || 'Unknown',
          speedLimit: roadData.speedLimit,
          laneCount: roadData.laneCount,
          laneCountSource: roadData.laneCountSource,
          laneCountConfidence: roadData.confidence,
          userModified: false,
          direction: 'bidirectional',
          selectedLanes: [],
          workZoneLengthFeet,
          startPin: pins.start,
          endPin: pins.end,
        })
      }
    } catch (error) {
      console.error('Error fetching road data:', error)
      setSearchError('Failed to fetch road data. Please try manual entry.')
      setShowManualFallback(true)
    } finally {
      setLoadingRoadData(false)
    }
  }

  const handleManualSubmit = async () => {
    setLoadingRoadData(true)
    setSearchError(null)

    try {
      if (isIntersection) {
        // Intersection fallback: cross streets + city + state + zip
        const intersectionAddress = `${manualCrossStreet1} and ${manualCrossStreet2}, ${manualCity}, ${manualState} ${manualZip}`
        const location = await geocodeAddress(intersectionAddress)
        
        if (location) {
          const roadData = await getRoadData(location.latitude, location.longitude)
          
          updateRoadData({
            roadName: `${manualCrossStreet1} & ${manualCrossStreet2}`,
            startAddress: intersectionAddress,
            endAddress: intersectionAddress,
            crossStreet: manualCrossStreet2,
            city: manualCity,
            state: manualState,
            zipCode: manualZip,
            speedLimit: roadData?.speedLimit || 25,
            laneCount: roadData?.laneCount || 2,
            laneCountSource: roadData?.laneCountSource || 'user',
            laneCountConfidence: roadData?.confidence || 50,
            userModified: true,
            direction: 'bidirectional',
            selectedLanes: [],
            workZoneLengthFeet: 0,
          })
          setShowManualFallback(false)
        } else {
          setSearchError('Could not find intersection. Please verify address.')
        }
      } else if (pinMode === 'dual') {
        // Linear work fallback: start + end addresses
        const startLocation = await geocodeAddress(manualStartAddress)
        const endLocation = await geocodeAddress(manualEndAddress)
        
        if (startLocation && endLocation) {
          const roadData = await getRoadData(startLocation.latitude, startLocation.longitude)
          
          // Calculate distance
          let workZoneLengthFeet = 0
          if (window.google?.maps?.geometry) {
            const start = new window.google.maps.LatLng(startLocation.latitude, startLocation.longitude)
            const end = new window.google.maps.LatLng(endLocation.latitude, endLocation.longitude)
            const meters = window.google.maps.geometry.spherical.computeDistanceBetween(start, end)
            workZoneLengthFeet = Math.round(meters * 3.28084)
          }
          
          updateRoadData({
            roadName: roadData?.roadName || 'Unknown Road',
            startAddress: manualStartAddress,
            endAddress: manualEndAddress,
            speedLimit: roadData?.speedLimit || 25,
            laneCount: roadData?.laneCount || 2,
            laneCountSource: roadData?.laneCountSource || 'user',
            laneCountConfidence: roadData?.confidence || 50,
            userModified: true,
            direction: 'bidirectional',
            selectedLanes: [],
            workZoneLengthFeet,
            startPin: { lat: startLocation.latitude, lng: startLocation.longitude },
            endPin: { lat: endLocation.latitude, lng: endLocation.longitude },
          })
          setShowManualFallback(false)
        } else {
          setSearchError('Could not find one or both addresses. Please verify.')
        }
      } else {
        // Single location fallback
        const location = await geocodeAddress(manualStartAddress)
        
        if (location) {
          const roadData = await getRoadData(location.latitude, location.longitude)
          
          updateRoadData({
            roadName: roadData?.roadName || 'Unknown Road',
            startAddress: manualStartAddress,
            endAddress: manualStartAddress,
            speedLimit: roadData?.speedLimit || 25,
            laneCount: roadData?.laneCount || 2,
            laneCountSource: roadData?.laneCountSource || 'user',
            laneCountConfidence: roadData?.confidence || 50,
            userModified: true,
            direction: 'bidirectional',
            selectedLanes: [],
            workZoneLengthFeet: 0,
            startPin: { lat: location.latitude, lng: location.longitude },
          })
          setShowManualFallback(false)
        } else {
          setSearchError('Could not find address. Please verify.')
        }
      }
    } catch (error) {
      console.error('Error with manual entry:', error)
      setSearchError('Failed to process manual entry. Please try again.')
    } finally {
      setLoadingRoadData(false)
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    updateRoadData({
      ...planData.roadData,
      [field]: value,
      userModified: true,
    })
  }

  const handleLaneToggle = (laneIndex: number) => {
    const currentLanes = planData.roadData.selectedLanes || []
    const newLanes = currentLanes.includes(laneIndex)
      ? currentLanes.filter((l) => l !== laneIndex)
      : [...currentLanes, laneIndex]

    updateRoadData({
      ...planData.roadData,
      selectedLanes: newLanes,
    })
  }

  const hasPinsPlaced = !!(planData.roadData.startPin && (pinMode === 'single' || planData.roadData.endPin))
  const hasRoadData = !!(planData.roadData.roadName && planData.roadData.roadName !== '')
  const canProceed = hasRoadData &&
    planData.roadData.selectedLanes &&
    planData.roadData.selectedLanes.length > 0

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        }}
      >
        Location & Road Characteristics
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          marginBottom: spacing.xl,
        }}
      >
        {pinMode === 'single' 
          ? 'Place a pin on the map to indicate your work location, or search for an address.'
          : 'Place start and end pins on the map to define your work zone, or search for a location.'}
      </p>

      {/* Address Search */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.lg,
          boxShadow: shadows.sm,
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.sm,
          }}
        >
          Search Location
        </label>
        <div style={{ display: 'flex', gap: spacing.md }}>
          <input
            type="text"
            placeholder="Enter address or intersection..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
            style={{
              flex: 1,
              padding: spacing.md,
              fontSize: typography.fontSize.base,
              border: `1px solid ${colors.neutralLight}`,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
            }}
          />
          <button
            onClick={handleSearchAddress}
            disabled={loadingRoadData}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: loadingRoadData ? colors.neutralLight : colors.primary,
              color: colors.textLight,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: loadingRoadData ? 'not-allowed' : 'pointer',
              minWidth: '100px',
            }}
          >
            {loadingRoadData ? 'Loading...' : 'Search'}
          </button>
        </div>
        {searchError && (
          <p style={{ color: colors.error, fontSize: typography.fontSize.sm, marginTop: spacing.sm }}>
            {searchError}
          </p>
        )}
      </div>

      {/* Google Maps Component with Pin Placement */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.lg,
          boxShadow: shadows.md,
        }}
      >
        <GoogleMapComponent
          center={mapCenter}
          zoom={15}
          onPinsPlaced={handlePinsPlaced}
          pinMode={pinMode}
          startPin={planData.roadData.startPin}
          endPin={planData.roadData.endPin}
          height="500px"
        />

        {loadingRoadData && (
          <div
            style={{
              marginTop: spacing.md,
              padding: spacing.md,
              backgroundColor: colors.accent,
              borderRadius: borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: typography.fontWeight.semibold }}>
              Fetching road data...
            </span>
          </div>
        )}

        {hasPinsPlaced && !loadingRoadData && hasRoadData && (
          <div
            style={{
              marginTop: spacing.md,
              padding: spacing.md,
              backgroundColor: colors.success,
              color: colors.textLight,
              borderRadius: borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            <Info size={20} />
            <span style={{ fontWeight: typography.fontWeight.semibold }}>
              ✓ {pinMode === 'single' ? 'Location marked' : 'Work zone marked'}! Road data loaded below.
            </span>
          </div>
        )}
      </div>

      {/* Manual Fallback Toggle */}
      {!hasRoadData && (
        <div style={{ marginBottom: spacing.lg, textAlign: 'center' }}>
          <button
            onClick={() => setShowManualFallback(!showManualFallback)}
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              backgroundColor: 'transparent',
              color: colors.primary,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              border: `2px solid ${colors.primary}`,
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              margin: '0 auto',
            }}
          >
            <AlertCircle size={20} />
            {showManualFallback ? 'Hide Manual Entry' : 'Can\'t find location? Enter manually'}
          </button>
        </div>
      )}

      {/* Manual Fallback Form */}
      {showManualFallback && (
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            boxShadow: shadows.md,
            marginBottom: spacing.xl,
            border: `2px solid ${colors.accent}`,
          }}
        >
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Manual Address Entry
          </h3>
          <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg }}>
            Enter location details manually as a fallback
          </p>

          {isIntersection ? (
            // Intersection fallback: cross streets + city + state + zip
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                    Cross Street 1 *
                  </label>
                  <input
                    type="text"
                    value={manualCrossStreet1}
                    onChange={(e) => setManualCrossStreet1(e.target.value)}
                    placeholder="Main St"
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      fontSize: typography.fontSize.base,
                      border: `1px solid ${colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                    Cross Street 2 *
                  </label>
                  <input
                    type="text"
                    value={manualCrossStreet2}
                    onChange={(e) => setManualCrossStreet2(e.target.value)}
                    placeholder="5th Ave"
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      fontSize: typography.fontSize.base,
                      border: `1px solid ${colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: spacing.md, marginBottom: spacing.lg }}>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="Springfield"
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      fontSize: typography.fontSize.base,
                      border: `1px solid ${colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                    State *
                  </label>
                  <input
                    type="text"
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    placeholder="IL"
                    maxLength={2}
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      fontSize: typography.fontSize.base,
                      border: `1px solid ${colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                    Zip *
                  </label>
                  <input
                    type="text"
                    value={manualZip}
                    onChange={(e) => setManualZip(e.target.value)}
                    placeholder="62701"
                    maxLength={5}
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      fontSize: typography.fontSize.base,
                      border: `1px solid ${colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                    }}
                  />
                </div>
              </div>
            </>
          ) : pinMode === 'dual' ? (
            // Linear work fallback: start + end addresses
            <>
              <div style={{ marginBottom: spacing.md }}>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                  Start Address *
                </label>
                <input
                  type="text"
                  value={manualStartAddress}
                  onChange={(e) => setManualStartAddress(e.target.value)}
                  placeholder="123 Main St, Springfield, IL 62701"
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    fontSize: typography.fontSize.base,
                    border: `1px solid ${colors.neutralLight}`,
                    borderRadius: borderRadius.md,
                  }}
                />
              </div>
              <div style={{ marginBottom: spacing.lg }}>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                  End Address *
                </label>
                <input
                  type="text"
                  value={manualEndAddress}
                  onChange={(e) => setManualEndAddress(e.target.value)}
                  placeholder="456 Main St, Springfield, IL 62701"
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    fontSize: typography.fontSize.base,
                    border: `1px solid ${colors.neutralLight}`,
                    borderRadius: borderRadius.md,
                  }}
                />
              </div>
            </>
          ) : (
            // Single location fallback
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                Address *
              </label>
              <input
                type="text"
                value={manualStartAddress}
                onChange={(e) => setManualStartAddress(e.target.value)}
                placeholder="123 Main St, Springfield, IL 62701"
                style={{
                  width: '100%',
                  padding: spacing.md,
                  fontSize: typography.fontSize.base,
                  border: `1px solid ${colors.neutralLight}`,
                  borderRadius: borderRadius.md,
                }}
              />
            </div>
          )}

          <button
            onClick={handleManualSubmit}
            disabled={loadingRoadData || (isIntersection 
              ? !manualCrossStreet1 || !manualCrossStreet2 || !manualCity || !manualState || !manualZip
              : pinMode === 'dual'
                ? !manualStartAddress || !manualEndAddress
                : !manualStartAddress
            )}
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              backgroundColor: loadingRoadData ? colors.neutralLight : colors.primary,
              color: colors.textLight,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              border: 'none',
              borderRadius: borderRadius.md,
              cursor: loadingRoadData ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: loadingRoadData ? 0.5 : 1,
            }}
          >
            {loadingRoadData ? 'Processing...' : 'Submit Manual Entry'}
          </button>
        </div>
      )}

      {/* Road Data Form (only shows after pins placed and data loaded) */}
      {hasRoadData && (
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            boxShadow: shadows.md,
            marginBottom: spacing.xl,
          }}
        >
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
              marginBottom: spacing.lg,
            }}
          >
            Road Information
          </h3>

          {/* Road Name - Only show if we have a valid road name */}
          {planData.roadData.roadName && planData.roadData.roadName !== 'Unknown Road' && (
            <div style={{ marginBottom: spacing.lg }}>
              <label
                style={{
                  display: 'block',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  marginBottom: spacing.sm,
                }}
              >
                Road Name
              </label>
              <input
                type="text"
                value={planData.roadData.roadName || ''}
                onChange={(e) => handleFieldChange('roadName', e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  fontSize: typography.fontSize.base,
                  border: `1px solid ${colors.neutralLight}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.surface,
                }}
              />
            </div>
          )}

          {/* Start and End Addresses */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  marginBottom: spacing.sm,
                }}
              >
                Start Address
              </label>
              <input
                type="text"
                value={planData.roadData.startAddress || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: spacing.md,
                  fontSize: typography.fontSize.base,
                  border: `1px solid ${colors.neutralLight}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: '#f5f5f5',
                  color: colors.textSecondary,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  marginBottom: spacing.sm,
                }}
              >
                End Address
              </label>
              <input
                type="text"
                value={planData.roadData.endAddress || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: spacing.md,
                  fontSize: typography.fontSize.base,
                  border: `1px solid ${colors.neutralLight}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: '#f5f5f5',
                  color: colors.textSecondary,
                }}
              />
            </div>
          </div>

          {/* Speed Limit and Lane Count */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  marginBottom: spacing.sm,
                }}
              >
                Speed Limit (mph)
                <ConfidenceBadge
                  source={planData.roadData.laneCountSource || 'google'}
                  confidence={planData.roadData.laneCountConfidence || 100}
                />
              </label>
              <input
                type="number"
                value={planData.roadData.speedLimit || ''}
                onChange={(e) => handleFieldChange('speedLimit', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  fontSize: typography.fontSize.base,
                  border: `1px solid ${colors.neutralLight}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.surface,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  marginBottom: spacing.sm,
                }}
              >
                Total Lanes
                <ConfidenceBadge
                  source={planData.roadData.laneCountSource || 'google'}
                  confidence={planData.roadData.laneCountConfidence || 100}
                />
              </label>
              <input
                type="number"
                value={planData.roadData.laneCount || ''}
                onChange={(e) => handleFieldChange('laneCount', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  fontSize: typography.fontSize.base,
                  border: `1px solid ${colors.neutralLight}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.surface,
                }}
              />
            </div>
          </div>

          {/* Lane Selector */}
          <div style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.textPrimary,
                marginBottom: spacing.sm,
              }}
            >
              Select Lanes to Close
            </label>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md }}>
              Click on lanes to toggle closure (at least one lane must be closed)
            </p>
            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
              {Array.from({ length: planData.roadData.laneCount || 2 }, (_, i) => {
                const isSelected = planData.roadData.selectedLanes?.includes(i) || false
                return (
                  <button
                    key={i}
                    onClick={() => handleLaneToggle(i)}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      backgroundColor: isSelected ? colors.error : colors.surface,
                      color: isSelected ? colors.textLight : colors.textPrimary,
                      border: `2px solid ${isSelected ? colors.error : colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      minWidth: '80px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Lane {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Work Zone Length */}
          <div style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.textPrimary,
                marginBottom: spacing.sm,
              }}
            >
              Work Zone Length (feet)
            </label>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }}>
              {pinMode === 'dual' 
                ? `Auto-calculated from pins: ${planData.roadData.workZoneLengthFeet || 0} feet`
                : 'Enter work area length in feet'}
            </p>
            <input
              type="number"
              value={planData.roadData.workZoneLengthFeet || ''}
              onChange={(e) => handleFieldChange('workZoneLengthFeet', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: spacing.md,
                fontSize: typography.fontSize.base,
                border: `1px solid ${colors.neutralLight}`,
                borderRadius: borderRadius.md,
                backgroundColor: colors.surface,
              }}
            />
          </div>
        </div>
      )}

      {/* Next Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            backgroundColor: canProceed ? colors.primary : colors.neutralLight,
            color: colors.textLight,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
            border: 'none',
            borderRadius: borderRadius.md,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            opacity: canProceed ? 1 : 0.5,
            boxShadow: canProceed ? shadows.md : 'none',
          }}
        >
          Next: Work Timing
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Confidence Badge Component
interface ConfidenceBadgeProps {
  source: string
  confidence: number
}

const ConfidenceBadge = ({ source, confidence }: ConfidenceBadgeProps) => {
  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      google: 'Google',
      here: 'HERE Maps',
      osm: 'OpenStreetMap',
      'ai-gov': 'AI (Gov Data)',
      'ai-web': 'AI (Web)',
      user: 'User Input',
      default: 'Default',
    }
    return labels[source] || source
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return colors.success
    if (confidence >= 70) return colors.accent
    return colors.warning
  }

  return (
    <span
      style={{
        marginLeft: spacing.sm,
        padding: `${spacing.xs} ${spacing.sm}`,
        backgroundColor: getConfidenceColor(confidence),
        color: confidence >= 90 ? colors.textLight : colors.textPrimary,
        borderRadius: borderRadius.sm,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
      }}
    >
      {getSourceLabel(source)} ({confidence}%)
    </span>
  )
}

export default Step1Location
