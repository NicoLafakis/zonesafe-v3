import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { colors, spacing, typography, borderRadius } from '../styles/theme'

export interface WizardStep {
  id: number
  title: string
  description?: string
}

interface WizardLayoutProps {
  steps: WizardStep[]
  currentStep: number
  children: ReactNode
  onStepClick?: (stepId: number) => void
}

const WizardLayout = ({ steps, currentStep, children, onStepClick }: WizardLayoutProps) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      {/* Stepper */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.neutralLight}`,
          padding: `${spacing.xl} ${spacing.lg}`,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
          }}
        >
          {/* Back to Categories */}
          <div style={{ marginBottom: spacing.md }}>
            <Link
              to="/work-types"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.xs,
                color: colors.textPrimary,
                textDecoration: 'none',
                fontWeight: typography.fontWeight.semibold,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: borderRadius.sm,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <ArrowLeft size={18} /> Back to Categories
            </Link>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: spacing.md,
              position: 'relative',
            }}
          >
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              const isClickable = isCompleted && onStepClick

              return (
                <div
                  key={step.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: isClickable ? 'pointer' : 'default',
                  }}
                  onClick={() => isClickable && onStepClick(step.id)}
                >
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '20px',
                        left: 'calc(50% + 20px)',
                        right: 'calc(-50% + 20px)',
                        height: '2px',
                        backgroundColor: isCompleted ? colors.primary : colors.neutralLight,
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Step Circle */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: borderRadius.full,
                      backgroundColor: isCompleted
                        ? colors.primary
                        : isCurrent
                        ? colors.accent
                        : colors.surface,
                      border: `2px solid ${
                        isCompleted || isCurrent ? 'transparent' : colors.neutralLight
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      color: isCompleted
                        ? colors.textLight
                        : isCurrent
                        ? colors.textPrimary
                        : colors.neutralLight,
                      marginBottom: spacing.sm,
                      zIndex: 1,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isCompleted ? <Check size={20} /> : step.id}
                  </div>

                  {/* Step Title */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: typography.fontSize.sm,
                      fontWeight: isCurrent ? typography.fontWeight.semibold : typography.fontWeight.regular,
                      color: isCurrent ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    {step.title}
                  </div>

                  {/* Step Description (optional) */}
                  {step.description && (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: typography.fontSize.xs,
                        color: colors.textSecondary,
                        marginTop: spacing.xs,
                      }}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: spacing.xl,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default WizardLayout
