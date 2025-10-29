import { useState } from 'react'
import { usePlanWizard } from '../../contexts/PlanWizardContext'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'
import { Users, Ruler, AlertCircle } from 'lucide-react'

interface Step3DetailsProps {
  onNext: () => void
  onBack: () => void
}

const Step3Details = ({ onNext, onBack }: Step3DetailsProps) => {
  const { planData, updateWorkZoneDetails } = usePlanWizard()
  const [customLength, setCustomLength] = useState(false)

  // Auto-calculated from drawn line, but can be overridden
  const autoCalculatedLength = planData.roadData.workZoneLengthFeet || 0

  const handleWorkerCountChange = (count: number) => {
    updateWorkZoneDetails({
      ...planData.workZoneDetails,
      workerCount: count,
    })
  }

  const handleWorkZoneLengthChange = (length: number) => {
    updateWorkZoneDetails({
      ...planData.workZoneDetails,
      workZoneLengthFeet: length,
    })
  }

  const handleFlaggerChange = (hasFlagger: boolean) => {
    updateWorkZoneDetails({
      ...planData.workZoneDetails,
      hasFlagger,
      flaggerCount: hasFlagger ? 2 : undefined,
    })
  }

  const handleFlaggerCountChange = (count: number) => {
    updateWorkZoneDetails({
      ...planData.workZoneDetails,
      flaggerCount: count,
    })
  }

  const canProceed =
    (planData.workZoneDetails.workerCount || 0) >= 1 &&
    (!planData.workZoneDetails.hasFlagger ||
      (planData.workZoneDetails.flaggerCount || 0) >= 2)

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
        Work Zone Details
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          marginBottom: spacing.xl,
        }}
      >
        Provide information about your work crew and work zone size.
      </p>

      {/* Number of Workers */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Users size={24} color={colors.primary} />
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
            }}
          >
            Number of Workers
          </h3>
        </div>

        <input
          type="number"
          min={1}
          max={50}
          value={planData.workZoneDetails.workerCount || ''}
          onChange={(e) => handleWorkerCountChange(parseInt(e.target.value))}
          placeholder="Enter number of workers"
          style={{
            width: '100%',
            padding: spacing.md,
            fontSize: typography.fontSize.base,
            border: `1px solid ${colors.neutralLight}`,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surface,
          }}
        />
        <p
          style={{
            marginTop: spacing.sm,
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}
        >
          Include all personnel who will be in the work zone
        </p>
      </div>

      {/* Work Zone Length */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Ruler size={24} color={colors.primary} />
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
            }}
          >
            Work Zone Length
          </h3>
        </div>

        {!customLength ? (
          <div>
            <div
              style={{
                padding: spacing.lg,
                backgroundColor: `${colors.accent}30`,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
              }}
            >
              <p
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                }}
              >
                Auto-calculated: {autoCalculatedLength} feet
              </p>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.textSecondary,
                  marginTop: spacing.xs,
                }}
              >
                Based on the line you drew on the map
              </p>
            </div>
            <button
              onClick={() => {
                setCustomLength(true)
                handleWorkZoneLengthChange(autoCalculatedLength)
              }}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                fontSize: typography.fontSize.sm,
                color: colors.primary,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Manually override length
            </button>
          </div>
        ) : (
          <div>
            <input
              type="number"
              min={50}
              value={planData.workZoneDetails.workZoneLengthFeet || autoCalculatedLength}
              onChange={(e) => handleWorkZoneLengthChange(parseInt(e.target.value))}
              placeholder="Enter length in feet"
              style={{
                width: '100%',
                padding: spacing.md,
                fontSize: typography.fontSize.base,
                border: `1px solid ${colors.neutralLight}`,
                borderRadius: borderRadius.md,
                backgroundColor: colors.surface,
              }}
            />
            <button
              onClick={() => {
                setCustomLength(false)
                updateWorkZoneDetails({
                  ...planData.workZoneDetails,
                  workZoneLengthFeet: undefined,
                })
              }}
              style={{
                marginTop: spacing.sm,
                padding: `${spacing.sm} ${spacing.md}`,
                fontSize: typography.fontSize.sm,
                color: colors.primary,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Use auto-calculated length
            </button>
          </div>
        )}
      </div>

      {/* Traffic Control Personnel */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <AlertCircle size={24} color={colors.primary} />
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
            }}
          >
            Traffic Control Personnel
          </h3>
        </div>

        <div style={{ marginBottom: spacing.lg }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Will flaggers be required?
          </label>
          <div style={{ display: 'flex', gap: spacing.md }}>
            <button
              onClick={() => handleFlaggerChange(true)}
              style={{
                flex: 1,
                padding: spacing.lg,
                border: `2px solid ${
                  planData.workZoneDetails.hasFlagger ? colors.primary : colors.neutralLight
                }`,
                borderRadius: borderRadius.md,
                backgroundColor: planData.workZoneDetails.hasFlagger
                  ? `${colors.primary}15`
                  : colors.surface,
                cursor: 'pointer',
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: planData.workZoneDetails.hasFlagger ? colors.primary : colors.textPrimary,
                transition: 'all 0.2s ease',
              }}
            >
              Yes
            </button>
            <button
              onClick={() => handleFlaggerChange(false)}
              style={{
                flex: 1,
                padding: spacing.lg,
                border: `2px solid ${
                  planData.workZoneDetails.hasFlagger === false
                    ? colors.primary
                    : colors.neutralLight
                }`,
                borderRadius: borderRadius.md,
                backgroundColor:
                  planData.workZoneDetails.hasFlagger === false
                    ? `${colors.primary}15`
                    : colors.surface,
                cursor: 'pointer',
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color:
                  planData.workZoneDetails.hasFlagger === false ? colors.primary : colors.textPrimary,
                transition: 'all 0.2s ease',
              }}
            >
              No
            </button>
          </div>
        </div>

        {planData.workZoneDetails.hasFlagger && (
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
              Number of Flaggers (minimum 2 required)
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={planData.workZoneDetails.flaggerCount || 2}
              onChange={(e) => handleFlaggerCountChange(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: spacing.md,
                fontSize: typography.fontSize.base,
                border: `1px solid ${colors.neutralLight}`,
                borderRadius: borderRadius.md,
                backgroundColor: colors.surface,
              }}
            />
            <div
              style={{
                marginTop: spacing.md,
                padding: spacing.md,
                backgroundColor: '#fef3c7',
                borderLeft: `4px solid #fbbf24`,
                borderRadius: borderRadius.sm,
              }}
            >
              <p style={{ fontSize: typography.fontSize.sm, color: colors.textPrimary }}>
                <strong>MUTCD Requirement:</strong> Flaggers must work in pairs for safety and
                effective traffic control.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: spacing.xl,
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            backgroundColor: colors.neutral,
            color: colors.textLight,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
            borderRadius: borderRadius.md,
            cursor: 'pointer',
            boxShadow: shadows.md,
          }}
        >
          ← Back
        </button>
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
          Next: Equipment Selection →
        </button>
      </div>
    </div>
  )
}

export default Step3Details
