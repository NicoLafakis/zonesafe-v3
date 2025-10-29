import { usePlanWizard } from '../../contexts/PlanWizardContext'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'
import { Clock, Sun, Moon, Calendar } from 'lucide-react'

interface Step2TimingProps {
  onNext: () => void
  onBack: () => void
}

const Step2Timing = ({ onNext, onBack }: Step2TimingProps) => {
  const { planData, updateWorkTiming } = usePlanWizard()

  const handleDurationChange = (value: number, unit: 'hours' | 'days' | 'weeks') => {
    updateWorkTiming({
      ...planData.workTiming,
      duration: { value, unit },
    })
  }

  const handleTimeOfDayChange = (timeOfDay: 'daytime' | 'nighttime' | '24hour') => {
    updateWorkTiming({
      ...planData.workTiming,
      timeOfDay,
    })
  }

  const handleDaysOfWeekChange = (daysOfWeek: 'weekdays' | 'weekends' | 'all') => {
    updateWorkTiming({
      ...planData.workTiming,
      daysOfWeek,
    })
  }

  const canProceed =
    planData.workTiming.duration &&
    planData.workTiming.timeOfDay &&
    planData.workTiming.daysOfWeek

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
        Work Timing & Duration
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          marginBottom: spacing.xl,
        }}
      >
        Tell us when and how long you'll be working.
      </p>

      {/* Work Duration */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.xl,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
          <Clock size={24} color={colors.primary} />
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
            }}
          >
            Work Duration
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: spacing.md }}>
          <input
            type="number"
            min={1}
            max={365}
            value={planData.workTiming.duration?.value || ''}
            onChange={(e) =>
              handleDurationChange(
                parseInt(e.target.value),
                planData.workTiming.duration?.unit || 'hours'
              )
            }
            placeholder="Enter duration"
            style={{
              padding: spacing.md,
              fontSize: typography.fontSize.base,
              border: `1px solid ${colors.neutralLight}`,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
            }}
          />
          <select
            value={planData.workTiming.duration?.unit || 'hours'}
            onChange={(e) =>
              handleDurationChange(
                planData.workTiming.duration?.value || 1,
                e.target.value as 'hours' | 'days' | 'weeks'
              )
            }
            style={{
              padding: spacing.md,
              fontSize: typography.fontSize.base,
              border: `1px solid ${colors.neutralLight}`,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
              cursor: 'pointer',
            }}
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>
      </div>

      {/* Time of Day */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.xl,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
          <Sun size={24} color={colors.primary} />
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
            }}
          >
            Time of Day
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md }}>
          <OptionCard
            title="Daytime Only"
            icon={<Sun size={32} />}
            selected={planData.workTiming.timeOfDay === 'daytime'}
            onClick={() => handleTimeOfDayChange('daytime')}
          />
          <OptionCard
            title="Nighttime Only"
            icon={<Moon size={32} />}
            selected={planData.workTiming.timeOfDay === 'nighttime'}
            onClick={() => handleTimeOfDayChange('nighttime')}
          />
          <OptionCard
            title="24-Hour Operation"
            icon={<Clock size={32} />}
            selected={planData.workTiming.timeOfDay === '24hour'}
            onClick={() => handleTimeOfDayChange('24hour')}
          />
        </div>

        {planData.workTiming.timeOfDay === 'nighttime' && (
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
              <strong>Note:</strong> Nighttime work requires additional lighting and
              reflectorization per MUTCD standards.
            </p>
          </div>
        )}
      </div>

      {/* Days of Week */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.xl,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
          <Calendar size={24} color={colors.primary} />
          <h3
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
            }}
          >
            Days of Week
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md }}>
          <OptionCard
            title="Weekdays Only"
            description="Mon-Fri"
            selected={planData.workTiming.daysOfWeek === 'weekdays'}
            onClick={() => handleDaysOfWeekChange('weekdays')}
          />
          <OptionCard
            title="Weekends Only"
            description="Sat-Sun"
            selected={planData.workTiming.daysOfWeek === 'weekends'}
            onClick={() => handleDaysOfWeekChange('weekends')}
          />
          <OptionCard
            title="All Days"
            description="Mon-Sun"
            selected={planData.workTiming.daysOfWeek === 'all'}
            onClick={() => handleDaysOfWeekChange('all')}
          />
        </div>
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
          Next: Work Zone Details →
        </button>
      </div>
    </div>
  )
}

// Option Card Component
interface OptionCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  selected: boolean
  onClick: () => void
}

const OptionCard = ({ title, description, icon, selected, onClick }: OptionCardProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: spacing.lg,
        border: `2px solid ${selected ? colors.primary : colors.neutralLight}`,
        borderRadius: borderRadius.md,
        backgroundColor: selected ? `${colors.primary}15` : colors.surface,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: spacing.md,
            color: selected ? colors.primary : colors.neutral,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: selected ? colors.primary : colors.textPrimary,
          marginBottom: description ? spacing.xs : 0,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}
        >
          {description}
        </div>
      )}
    </button>
  )
}

export default Step2Timing
