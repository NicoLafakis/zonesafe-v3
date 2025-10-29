import { useState } from 'react'
import { MapPin, Info } from 'lucide-react'
import { usePlanWizard } from '../../contexts/PlanWizardContext'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'

interface Step1LocationProps {
  onNext: () => void
}

const Step1Location = ({ onNext }: Step1LocationProps) => {
  const { planData, updateRoadData } = usePlanWizard()
  const [hasDrawnLine, setHasDrawnLine] = useState(false)

  // Simulate drawing a line on the map (mock functionality)
  const handleSimulateMapDrawing = () => {
    setHasDrawnLine(true)
    // Simulate API data retrieval
    updateRoadData({
      roadName: 'Main Street',
      startAddress: '100 Main St',
      endAddress: '500 Main St',
      speedLimit: 35,
      laneCount: 2,
      laneCountSource: 'google',
      laneCountConfidence: 100,
      userModified: false,
      direction: 'bidirectional',
      selectedLanes: [],
      workZoneLengthFeet: 400,
    })
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
        Draw a line on the map to indicate your work zone location.
      </p>

      {/* Map Placeholder */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          marginBottom: spacing.xl,
          boxShadow: shadows.md,
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px dashed ${colors.neutralLight}`,
        }}
      >
        <MapPin size={64} color={colors.neutral} style={{ marginBottom: spacing.lg }} />
        <h3
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}
        >
          Interactive Map (Coming Soon)
        </h3>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          In production, you'll draw a line segment to mark your work zone. For now, click below to
          simulate.
        </p>
        {!hasDrawnLine && (
          <button
            onClick={handleSimulateMapDrawing}
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              backgroundColor: colors.primary,
              color: colors.textLight,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              boxShadow: shadows.md,
            }}
          >
            Simulate Map Drawing
          </button>
        )}
        {hasDrawnLine && (
          <div
            style={{
              padding: spacing.lg,
              backgroundColor: colors.accent,
              borderRadius: borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            <Info size={20} />
            <span style={{ fontWeight: typography.fontWeight.semibold }}>
              Line drawn! Road data loaded below.
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
                  confidence={100}
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
                Lane Count
                <ConfidenceBadge
                  source={planData.roadData.laneCountSource || 'google'}
                  confidence={planData.roadData.laneCountConfidence || 100}
                />
              </label>
              <input
                type="number"
                value={planData.roadData.laneCount || ''}
                onChange={(e) => handleFieldChange('laneCount', parseInt(e.target.value))}
                min={1}
                max={8}
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

          {/* Lane Selection */}
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
              Select Closed Lanes
            </label>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
                marginBottom: spacing.md,
              }}
            >
              Click on lanes to mark them as closed (orange = closed, white = open)
            </p>
            <div
              style={{
                display: 'flex',
                gap: spacing.md,
                flexWrap: 'wrap',
              }}
            >
              {Array.from({ length: planData.roadData.laneCount || 0 }, (_, i) => {
                const isSelected = planData.roadData.selectedLanes?.includes(i) || false
                return (
                  <button
                    key={i}
                    onClick={() => handleLaneToggle(i)}
                    style={{
                      width: '80px',
                      height: '120px',
                      border: `2px solid ${isSelected ? colors.primary : colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      color: isSelected ? colors.textLight : colors.textPrimary,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Lane {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: spacing.xl,
        }}
      >
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            backgroundColor: canProceed ? colors.primary : colors.neutralLight,
            color: colors.textLight,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
            borderRadius: borderRadius.md,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            boxShadow: canProceed ? shadows.md : 'none',
            opacity: canProceed ? 1 : 0.6,
          }}
        >
          Next: Work Timing →
        </button>
      </div>
    </div>
  )
}

// Confidence Badge Component
const ConfidenceBadge = ({
  source,
  confidence,
}: {
  source: string
  confidence: number
}) => {
  const getSourceLabel = (src: string) => {
    switch (src) {
      case 'google':
        return 'Google Roads'
      case 'here':
        return 'HERE Maps'
      case 'osm':
        return 'OpenStreetMap'
      case 'ai-gov':
        return 'AI + Gov Data'
      case 'ai-web':
        return 'AI + Web'
      case 'user':
        return 'User Verified'
      default:
        return 'Unknown'
    }
  }

  return (
    <span
      style={{
        marginLeft: spacing.sm,
        padding: `${spacing.xs} ${spacing.sm}`,
        fontSize: typography.fontSize.xs,
        backgroundColor: confidence >= 95 ? colors.accent : '#fbbf24',
        color: colors.textPrimary,
        borderRadius: borderRadius.sm,
        fontWeight: typography.fontWeight.semibold,
      }}
    >
      {getSourceLabel(source)} ({confidence}%)
    </span>
  )
}

export default Step1Location
