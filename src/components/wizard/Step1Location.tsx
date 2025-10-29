import { useState, useEffect } from 'react'
import { Info, Loader } from 'lucide-react'
import { usePlanWizard } from '../../contexts/PlanWizardContext'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'
import GoogleMapComponent from '../GoogleMapComponent'
import { geocodeAddress, getRoadData, calculatePathLength, reverseGeocode } from '../../services/roadsAPI'

interface Step1LocationProps {
  onNext: () => void
  onBack?: () => void
}

const Step1Location = ({ onNext, onBack }: Step1LocationProps) => {
  const { planData, updateRoadData } = usePlanWizard()
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }) // Default to NYC
  const [workZonePath, setWorkZonePath] = useState<google.maps.LatLngLiteral[]>([])
  const [loadingRoadData, setLoadingRoadData] = useState(false)
  const [searchAddress, setSearchAddress] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)

  // Initialize map with existing data if editing
  useEffect(() => {
    if (planData.roadData.startAddress) {
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

  const handleDrawComplete = async (path: google.maps.LatLngLiteral[]) => {
    setWorkZonePath(path)
    setLoadingRoadData(true)

    try {
      // Get start and end addresses
      const startAddress = await reverseGeocode(path[0].lat, path[0].lng)
      const endAddress = await reverseGeocode(path[path.length - 1].lat, path[path.length - 1].lng)

      // Get road data from start point
      const roadData = await getRoadData(path[0].lat, path[0].lng)

      // Calculate work zone length from path
      const workZoneLengthFeet = calculatePathLength(path)

      if (roadData) {
        updateRoadData({
          roadName: roadData.roadName,
          startAddress: startAddress || 'Unknown',
          endAddress: endAddress || 'Unknown',
          speedLimit: roadData.speedLimit,
          laneCount: roadData.laneCount,
          laneCountSource: roadData.laneCountSource,
          laneCountConfidence: roadData.confidence,
          userModified: false,
          direction: 'bidirectional',
          selectedLanes: [],
          workZoneLengthFeet,
        })
      }
    } catch (error) {
      console.error('Error fetching road data:', error)
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

  const hasDrawnLine = workZonePath.length > 1 || (planData.roadData.roadName && planData.roadData.roadName !== '')
  const canProceed = hasDrawnLine &&
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
        Search for a location or draw a line on the map to indicate your work zone.
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

      {/* Google Maps Component */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.xl,
          boxShadow: shadows.md,
        }}
      >
        <GoogleMapComponent
          center={mapCenter}
          zoom={15}
          onDrawComplete={handleDrawComplete}
          workZonePath={workZonePath}
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

        {hasDrawnLine && !loadingRoadData && (
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
              Work zone drawn! Road data loaded below.
            </span>
          </div>
        )}
      </div>

      {/* Road Data Form (only shows after line is drawn) */}
      {hasDrawnLine && (
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

          {/* Road Name */}
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
              Auto-calculated from drawn line: {planData.roadData.workZoneLengthFeet || 0} feet
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
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: spacing.md }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              backgroundColor: colors.surface,
              color: colors.primary,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              border: `2px solid ${colors.primary}`,
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              boxShadow: shadows.md,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              target.style.backgroundColor = colors.primary
              target.style.color = colors.textLight
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement
              target.style.backgroundColor = colors.surface
              target.style.color = colors.primary
            }}
          >
            ← Back to Categories
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            marginLeft: 'auto',
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
