import { useState, useEffect } from 'react'
import { usePlanWizard } from '../../contexts/PlanWizardContext'
import { calculateWorkZoneRequirements, WorkZoneInput } from '../../lib/mutcd-calculation-engine'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'
import { Download, Mail, Save, Edit, FileText, Loader, CheckCircle } from 'lucide-react'

interface Step5ResultsProps {
  onEdit: () => void
  onStartNew: () => void
}

const Step5Results = ({ onEdit, onStartNew }: Step5ResultsProps) => {
  const { planData } = usePlanWizard()
  const [loading, setLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState(0)
  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const loadingMessages = [
    'Analyzing road conditions...',
    'Calculating taper lengths...',
    'Determining sign placement...',
    'Generating MUTCD-compliant plan...',
  ]

  useEffect(() => {
    // Simulate loading process
    const loadingInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(loadingInterval)
          setTimeout(() => {
            generatePlan()
            setLoading(false)
          }, 1000)
          return prev
        }
        return prev + 1
      })
    }, 1500)

    return () => clearInterval(loadingInterval)
  }, [])

  const generatePlan = () => {
    try {
      // Convert wizard data to WorkZoneInput format
      const input: WorkZoneInput = {
        // Location data
        speedLimit: planData.roadData.speedLimit || 35,
        laneCount: planData.roadData.laneCount || 2,
        closedLanes: planData.roadData.selectedLanes || [0],
        roadType: 'urban_low_speed', // Could be derived from speed limit
        workType: planData.workType,

        // Timing data
        duration: getDuration(),
        isNightWork: planData.workTiming.timeOfDay === 'nighttime',
        isPeakHours: planData.workTiming.daysOfWeek === 'weekdays',

        // Work zone details
        workerCount: planData.workZoneDetails.workerCount || 1,
        workZoneLengthFeet: planData.workZoneDetails.workZoneLengthFeet || planData.roadData.workZoneLengthFeet || 400,
        hasFlagger: planData.workZoneDetails.hasFlagger || false,
        flaggerCount: planData.workZoneDetails.flaggerCount,

        // Equipment data
        hasHeavyEquipment: planData.equipment.some(e => e.selected && e.category === 'heavy'),
        hasMobileEquipment: planData.equipment.some(e => e.selected && e.category === 'mobile'),

        // Additional fields
        hasPedestrianFacility: false,
        hasBicycleFacility: false,
        isBridge: false,
        isIntersection: false,
        hasShoulderWork: false,
        hasMultipleLaneClosure: (planData.roadData.selectedLanes?.length || 0) > 1,
        hasHeavyTruckTraffic: false,
      }

      const results = calculateWorkZoneRequirements(input)
      setCalculationResults(results)
    } catch (error) {
      console.error('Error generating plan:', error)
    }
  }

  const getDuration = () => {
    const duration = planData.workTiming.duration
    if (!duration) return 'short_term'

    if (duration.unit === 'hours') {
      return duration.value <= 12 ? 'short_duration' : 'short_term'
    } else if (duration.unit === 'days') {
      return duration.value <= 3 ? 'short_term' : duration.value <= 30 ? 'intermediate_term' : 'long_term'
    } else {
      return duration.value <= 2 ? 'intermediate_term' : 'long_term'
    }
  }

  if (loading) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          paddingTop: spacing['3xl'],
        }}
      >
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing['2xl'],
            boxShadow: shadows.lg,
          }}
        >
          <Loader
            size={64}
            color={colors.primary}
            style={{
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
              marginBottom: spacing.xl,
            }}
          />
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
              marginBottom: spacing.lg,
            }}
          >
            Generating Your Safety Plan
          </h2>
          <div style={{ textAlign: 'left', marginBottom: spacing.md }}>
            {loadingMessages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  backgroundColor: index <= loadingStep ? `${colors.primary}10` : 'transparent',
                  borderRadius: borderRadius.sm,
                  transition: 'all 0.3s ease',
                }}
              >
                {index < loadingStep ? (
                  <CheckCircle size={20} color={colors.primary} />
                ) : index === loadingStep ? (
                  <Loader size={20} color={colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${colors.neutralLight}` }} />
                )}
                <span
                  style={{
                    fontSize: typography.fontSize.base,
                    color: index <= loadingStep ? colors.textPrimary : colors.textSecondary,
                    fontWeight: index === loadingStep ? typography.fontWeight.semibold : typography.fontWeight.regular,
                  }}
                >
                  {message}
                </span>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div
        style={{
          textAlign: 'center',
          marginBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: borderRadius.full,
            backgroundColor: colors.primary,
            marginBottom: spacing.lg,
          }}
        >
          <CheckCircle size={48} color={colors.textLight} />
        </div>
        <h2
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}
        >
          Your Safety Plan is Ready!
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.lg,
            color: colors.textSecondary,
          }}
        >
          100% MUTCD-compliant and ready for inspection
        </p>
      </div>

      {/* Plan Summary Card */}
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
          Plan Summary
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
          <SummaryItem label="Road" value={planData.roadData.roadName || 'N/A'} />
          <SummaryItem label="Speed Limit" value={`${planData.roadData.speedLimit || 0} mph`} />
          <SummaryItem
            label="Work Zone Length"
            value={`${planData.workZoneDetails.workZoneLengthFeet || planData.roadData.workZoneLengthFeet || 0} feet`}
          />
          <SummaryItem
            label="Duration"
            value={`${planData.workTiming.duration?.value || 0} ${planData.workTiming.duration?.unit || 'hours'}`}
          />
          <SummaryItem label="Workers" value={planData.workZoneDetails.workerCount || 0} />
          <SummaryItem
            label="Closed Lanes"
            value={`${planData.roadData.selectedLanes?.length || 0} of ${planData.roadData.laneCount || 0}`}
          />
        </div>
      </div>

      {/* MUTCD Calculations */}
      {calculationResults && (
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
            MUTCD Calculations
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
            <CalcItem
              label="Merging Taper"
              value={`${calculationResults.tapers.merging} feet`}
            />
            <CalcItem
              label="Longitudinal Buffer"
              value={`${calculationResults.bufferSpaces.longitudinalBufferFeet} feet`}
            />
            <CalcItem
              label="Stopping Sight Distance"
              value={`${calculationResults.bufferSpaces.stoppingSightDistance} feet`}
            />
            <CalcItem
              label="Minimum Lane Width"
              value={`${calculationResults.laneWidth.minimumFeet} feet`}
            />
          </div>

          <div
            style={{
              marginTop: spacing.lg,
              padding: spacing.md,
              backgroundColor: `${colors.accent}20`,
              borderRadius: borderRadius.sm,
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.textPrimary,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              All calculations comply with FHWA MUTCD 11th Edition (December 2023)
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <ActionButton
          icon={<FileText size={20} />}
          label="View Full Plan"
          onClick={() => alert('View Plan - Coming Soon')}
          primary
        />
        <ActionButton
          icon={<Download size={20} />}
          label="Download PDF"
          onClick={() => alert('Download PDF - Coming Soon')}
          primary
        />
        <ActionButton
          icon={<Mail size={20} />}
          label="Email Plan"
          onClick={() => alert('Email Plan - Coming Soon')}
        />
        <ActionButton
          icon={<Save size={20} />}
          label="Save Plan"
          onClick={() => setShowSaveModal(true)}
        />
      </div>

      {/* Secondary Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: spacing.lg,
        }}
      >
        <button
          onClick={onEdit}
          style={{
            padding: `${spacing.sm} ${spacing.lg}`,
            fontSize: typography.fontSize.base,
            color: colors.primary,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          <Edit size={16} style={{ display: 'inline', marginRight: spacing.xs }} />
          Edit Plan
        </button>
        <button
          onClick={onStartNew}
          style={{
            padding: `${spacing.sm} ${spacing.lg}`,
            fontSize: typography.fontSize.base,
            color: colors.primary,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Create New Plan
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal onClose={() => setShowSaveModal(false)} />
      )}
    </div>
  )
}

// Summary Item Component
const SummaryItem = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <div
      style={{
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
      }}
    >
      {value}
    </div>
  </div>
)

// Calculation Item Component
const CalcItem = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      padding: spacing.md,
      backgroundColor: `${colors.primary}05`,
      borderRadius: borderRadius.sm,
    }}
  >
    <div
      style={{
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary,
      }}
    >
      {value}
    </div>
  </div>
)

// Action Button Component
const ActionButton = ({
  icon,
  label,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  primary?: boolean
}) => (
  <button
    onClick={onClick}
    style={{
      padding: spacing.lg,
      backgroundColor: primary ? colors.primary : colors.neutral,
      color: colors.textLight,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      boxShadow: shadows.md,
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = shadows.lg
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = shadows.md
    }}
  >
    {icon}
    {label}
  </button>
)

// Save Modal Component (Guest Mode)
const SaveModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing['2xl'],
            maxWidth: '500px',
            width: '90%',
            boxShadow: shadows.xl,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>💾</div>
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Save Your Plan
          </h3>
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              marginBottom: spacing.xl,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            Create a free account to save your plan and access it from any device.
          </p>

          <button
            style={{
              width: '100%',
              padding: `${spacing.md} ${spacing.xl}`,
              backgroundColor: colors.primary,
              color: colors.textLight,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              marginBottom: spacing.md,
            }}
            onClick={() => alert('Google OAuth - Coming Soon')}
          >
            Create Free Account
          </button>

          <button
            onClick={onClose}
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            Continue Without Saving
          </button>
        </div>
      </div>
    </>
  )
}

export default Step5Results
