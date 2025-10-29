import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText,
  Download,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Users,
  HardHat,
  Ruler,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { colors, spacing, typography, shadows, borderRadius } from '../styles/theme'
import { plansAPI, PlanDetail } from '../services/api'
import { generatePlanPDF } from '../services/pdfGenerator'

const ViewPlan = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadPlan()
  }, [planId])

  const loadPlan = async () => {
    if (!planId) return

    setLoading(true)
    setError(null)

    try {
      const response = await plansAPI.getById(parseInt(planId))
      setPlan(response.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!plan) return
    try {
      await generatePlanPDF(plan)
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleEdit = () => {
    navigate(`/plans/${planId}/edit`)
  }

  const handleDelete = async () => {
    if (!plan || !confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return

    setDeleting(true)
    try {
      await plansAPI.delete(plan.id)
      navigate('/plans')
    } catch (err) {
      alert('Delete failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
        <Header />
        <main style={{ flex: 1, padding: spacing['2xl'], maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', padding: spacing['3xl'] }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: `4px solid ${colors.neutralLight}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: borderRadius.full,
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ color: colors.textSecondary, marginTop: spacing.lg }}>Loading plan...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
        <Header />
        <main style={{ flex: 1, padding: spacing['2xl'], maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', padding: spacing['3xl'] }}>
            <AlertTriangle size={48} style={{ color: colors.error, margin: '0 auto' }} />
            <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing.lg }}>
              {error || 'Plan not found'}
            </h2>
            <button
              onClick={() => navigate('/plans')}
              style={{
                marginTop: spacing.xl,
                padding: `${spacing.md} ${spacing.xl}`,
                backgroundColor: colors.primary,
                color: colors.textLight,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
              }}
            >
              Back to My Plans
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const calculations = plan.mutcd_calculations
  const equipment = plan.equipment || []
  const selectedLanes = typeof plan.selected_lanes === 'string' ? JSON.parse(plan.selected_lanes) : plan.selected_lanes

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <Header />

      <main style={{ flex: 1, padding: spacing['2xl'], maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* Header Section */}
        <div style={{ marginBottom: spacing['2xl'] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.lg }}>
            <div>
              <h1 style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                marginBottom: spacing.sm,
              }}>
                {plan.title}
              </h1>
              <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  padding: `${spacing.xs} ${spacing.md}`,
                  backgroundColor: plan.status === 'active' ? colors.success : colors.neutralLight,
                  color: plan.status === 'active' ? colors.textLight : colors.textSecondary,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                }}>
                  {plan.status.toUpperCase()}
                </span>
                <span style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                  Work Type: {plan.work_type.replace('_', ' ').toUpperCase()}
                </span>
                <span style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                  Confidence: {plan.confidence_score}%
                </span>
              </div>
              <div style={{ marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                Created: {new Date(plan.created_at).toLocaleString()} • Updated: {new Date(plan.updated_at).toLocaleString()}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
              <ActionButton icon={<Download size={18} />} label="Export PDF" onClick={handleExport} variant="secondary" />
              <ActionButton icon={<Edit2 size={18} />} label="Edit" onClick={handleEdit} variant="secondary" />
              <ActionButton icon={<Trash2 size={18} />} label="Delete" onClick={handleDelete} variant="danger" disabled={deleting} />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
          {/* Road Information */}
          <Section icon={<MapPin size={24} />} title="Road Information">
            <InfoGrid>
              <InfoItem label="Road Name" value={plan.road_name} />
              <InfoItem label="Start Address" value={plan.start_address} />
              <InfoItem label="End Address" value={plan.end_address || 'N/A'} />
              <InfoItem label="Speed Limit" value={`${plan.speed_limit} mph`} />
              <InfoItem label="Lane Count" value={plan.lane_count.toString()} />
              <InfoItem label="Closed Lanes" value={selectedLanes.join(', ')} />
              <InfoItem label="Work Zone Length" value={`${plan.work_zone_length_feet} feet`} />
            </InfoGrid>
          </Section>

          {/* Work Timing */}
          <Section icon={<Clock size={24} />} title="Work Timing">
            <InfoGrid>
              <InfoItem label="Duration" value={`${plan.duration_value} ${plan.duration_unit}`} />
              <InfoItem label="Time of Day" value={plan.time_of_day.replace('_', ' ').toUpperCase()} />
              <InfoItem label="Days of Week" value={plan.days_of_week} />
            </InfoGrid>
          </Section>

          {/* Work Zone Details */}
          <Section icon={<Users size={24} />} title="Work Zone Details">
            <InfoGrid>
              <InfoItem label="Worker Count" value={plan.worker_count.toString()} />
              <InfoItem label="Flagger Required" value={plan.has_flagger ? 'Yes' : 'No'} />
              {plan.has_flagger && <InfoItem label="Flagger Count" value={plan.flagger_count?.toString() || 'N/A'} />}
            </InfoGrid>
          </Section>

          {/* Equipment */}
          <Section icon={<HardHat size={24} />} title="Equipment">
            {equipment.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                {equipment.map((item: any, index: number) => (
                  <span
                    key={index}
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.neutralLight}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      color: colors.textPrimary,
                    }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.textSecondary }}>No equipment specified</p>
            )}
          </Section>

          {/* MUTCD Calculations */}
          {calculations && (
            <>
              <Section icon={<Ruler size={24} />} title="Taper Lengths">
                <InfoGrid>
                  <InfoItem label="Merging Taper" value={`${calculations.tapers?.mergingTaperLength || 0} feet`} />
                  <InfoItem label="Shifting Taper" value={`${calculations.tapers?.shiftingTaperLength || 0} feet`} />
                  <InfoItem label="Shoulder Taper" value={`${calculations.tapers?.shoulderTaperLength || 0} feet`} />
                  <InfoItem label="One Lane Two-Way Taper" value={`${calculations.tapers?.oneLaneTwoWayTaperLength || 0} feet`} />
                  <InfoItem label="Downstream Taper" value={`${calculations.tapers?.downstreamTaperLength || 0} feet`} />
                </InfoGrid>
              </Section>

              <Section icon={<ArrowRight size={24} />} title="Buffer Spaces">
                <InfoGrid>
                  <InfoItem label="Longitudinal Buffer" value={`${calculations.bufferSpaces?.longitudinalBufferFeet || 0} feet`} />
                  <InfoItem label="Lateral Buffer" value={`${calculations.bufferSpaces?.lateralBufferFeet || 0} feet`} />
                  <InfoItem label="Stopping Sight Distance" value={`${calculations.bufferSpaces?.stoppingSightDistance || 0} feet`} />
                </InfoGrid>
              </Section>

              <Section icon={<FileText size={24} />} title="Sign Placement">
                <InfoGrid>
                  <InfoItem label="Distance A (First Sign)" value={`${calculations.signPlacement?.advanceWarningDistances?.A || 0} feet`} />
                  <InfoItem label="Distance B (Second Sign)" value={`${calculations.signPlacement?.advanceWarningDistances?.B || 0} feet`} />
                  <InfoItem label="Distance C (Third Sign)" value={`${calculations.signPlacement?.advanceWarningDistances?.C || 0} feet`} />
                  <InfoItem label="Minimum Sign Height" value={`${calculations.signPlacement?.minimumSignHeight || 0} inches`} />
                  <InfoItem label="Lateral Offset" value={`${calculations.signPlacement?.lateralOffset || 0} feet`} />
                </InfoGrid>
              </Section>

              <Section icon={<AlertTriangle size={24} />} title="Channelizing Devices">
                <InfoGrid>
                  <InfoItem label="Taper Spacing" value={`${calculations.channelizingDevices?.taperSpacing || 0} feet`} />
                  <InfoItem label="Tangent Spacing" value={`${calculations.channelizingDevices?.tangentSpacing || 0} feet`} />
                  <InfoItem label="Extension Distance" value={`${calculations.channelizingDevices?.extensionDistance || 0} feet`} />
                </InfoGrid>
              </Section>

              {calculations.arrowBoard && (
                <Section icon={<AlertTriangle size={24} />} title="Arrow Board Requirements">
                  <InfoGrid>
                    <InfoItem label="Type" value={calculations.arrowBoard.type} />
                    <InfoItem label="Required" value={calculations.arrowBoard.required ? 'Yes' : 'No'} />
                    <InfoItem label="Min Legibility Distance" value={`${calculations.arrowBoard.minLegibilityDistance} feet`} />
                    <InfoItem label="Mounting Height" value={`${calculations.arrowBoard.mountingHeightFeet} feet`} />
                  </InfoGrid>
                </Section>
              )}

              {calculations.flaggerStation && (
                <Section icon={<Users size={24} />} title="Flagger Station">
                  <InfoGrid>
                    <InfoItem label="Location" value={`${calculations.flaggerStation.locationFeet} feet from work zone`} />
                    <InfoItem label="Illumination Required" value={calculations.flaggerStation.illuminationRequired ? 'Yes' : 'No'} />
                    <InfoItem label="Stopping Sight Distance" value={`${calculations.flaggerStation.stoppingSightDistance} feet`} />
                  </InfoGrid>
                </Section>
              )}

              <Section icon={<Ruler size={24} />} title="Lane Width Requirements">
                <InfoGrid>
                  <InfoItem label="Minimum Width" value={`${calculations.laneWidth?.minimumFeet || 0} feet`} />
                  <InfoItem label="Measurement Point" value={calculations.laneWidth?.measurementPoint || 'N/A'} />
                  {calculations.laneWidth?.exception && (
                    <InfoItem label="Exception" value={calculations.laneWidth.exception} fullWidth />
                  )}
                </InfoGrid>
              </Section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Helper Components
interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

const Section = ({ icon, title, children }: SectionProps) => (
  <div style={{
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    boxShadow: shadows.sm,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
      <div style={{ color: colors.primary }}>{icon}</div>
      <h2 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
      }}>
        {title}
      </h2>
    </div>
    {children}
  </div>
)

const InfoGrid = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: spacing.lg,
  }}>
    {children}
  </div>
)

interface InfoItemProps {
  label: string
  value: string
  fullWidth?: boolean
}

const InfoItem = ({ label, value, fullWidth }: InfoItemProps) => (
  <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
    <div style={{
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
    }}>
      {value}
    </div>
  </div>
)

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

const ActionButton = ({ icon, label, onClick, variant = 'primary', disabled }: ActionButtonProps) => {
  const getColors = () => {
    switch (variant) {
      case 'danger':
        return { bg: colors.error, hover: '#c93030' }
      case 'secondary':
        return { bg: colors.surface, hover: colors.neutralLight, text: colors.textPrimary }
      default:
        return { bg: colors.primary, hover: colors.primaryHover }
    }
  }

  const btnColors = getColors()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.md} ${spacing.lg}`,
        backgroundColor: disabled ? colors.neutralLight : (isHovered ? btnColors.hover : btnColors.bg),
        color: variant === 'secondary' ? btnColors.text : colors.textLight,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        border: variant === 'secondary' ? `1px solid ${colors.neutralLight}` : 'none',
        borderRadius: borderRadius.lg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxShadow: variant === 'secondary' ? 'none' : shadows.sm,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

export default ViewPlan
