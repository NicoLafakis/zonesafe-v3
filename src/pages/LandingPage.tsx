import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Settings, CheckCircle, Play } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme'

const LandingPage = () => {
  const navigate = useNavigate()
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleStartNewPlan = () => {
    navigate('/plans/new')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background,
      }}
    >
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            padding: `${spacing['3xl']} ${spacing.lg}`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            <h1
              style={{
                fontSize: typography.fontSize['4xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                marginBottom: spacing.lg,
                lineHeight: typography.lineHeight.tight,
              }}
            >
              Create Your Safety Plan in Minutes
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.textSecondary,
                marginBottom: spacing['2xl'],
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              Professional MUTCD-compliant traffic control plans without the complexity.
              No training required.
            </p>
            <StartNewPlanButton onClick={handleStartNewPlan} />
          </div>
        </section>

        {/* Most Recent Plan Card (Conditional) */}
        <section
          style={{
            padding: `0 ${spacing.lg} ${spacing['3xl']}`,
          }}
        >
          <div
            style={{
              maxWidth: '336px',
              margin: '0 auto',
            }}
          >
            <RecentPlanCard />
          </div>
        </section>

        {/* How It Works Section */}
        <section
          style={{
            padding: `${spacing['3xl']} ${spacing.lg}`,
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                textAlign: 'center',
                marginBottom: spacing['2xl'],
              }}
            >
              How It Works
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: spacing['2xl'],
                backgroundColor: colors.surface,
                padding: spacing['2xl'],
                borderRadius: borderRadius.lg,
                boxShadow: shadows.md,
              }}
            >
              <HowItWorksStep
                icon={<MapPin size={32} />}
                stepNumber={1}
                title="Tell Us About Your Location"
                description="Simple questions about where you're working"
              />
              <HowItWorksStep
                icon={<Settings size={32} />}
                stepNumber={2}
                title="We Handle the Regulations"
                description="Our system applies all federal requirements automatically"
              />
              <HowItWorksStep
                icon={<CheckCircle size={32} />}
                stepNumber={3}
                title="Get Your Plan"
                description="Print, save, or email your inspection-ready plan"
              />
            </div>

            <p
              style={{
                textAlign: 'center',
                color: colors.textSecondary,
                marginTop: spacing['2xl'],
                fontSize: typography.fontSize.base,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              We'll ask simple questions about your work location. Our system handles all federal
              regulations automatically.
            </p>
          </div>
        </section>

        {/* Tutorial Section */}
        <section
          style={{
            padding: `${spacing['3xl']} ${spacing.lg}`,
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              backgroundColor: colors.surface,
              padding: spacing['2xl'],
              borderRadius: borderRadius.lg,
              boxShadow: shadows.md,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <Play size={32} color={colors.primary} />
              <h3
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.textPrimary,
                }}
              >
                Need Help Getting Started?
              </h3>
            </div>
            <button
              style={{
                padding: `${spacing.md} ${spacing.xl}`,
                backgroundColor: colors.primary,
                color: colors.textLight,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.bold,
                borderRadius: borderRadius.md,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.sm,
                transition: 'all 0.2s ease',
                boxShadow: shadows.md,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryHover
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = shadows.lg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = shadows.md
              }}
            >
              <Play size={20} />
              Watch Tutorial Video
            </button>
            <p
              style={{
                marginTop: spacing.md,
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
              }}
            >
              3 minute overview
            </p>
          </div>
        </section>
      </main>

      <Footer />

      {/* Save Modal (Guest Mode) */}
      {showSaveModal && <SaveModal onClose={() => setShowSaveModal(false)} />}
    </div>
  )
}

// Start New Plan Button Component
const StartNewPlanButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `${spacing.lg} ${spacing['2xl']}`,
        backgroundColor: colors.primary,
        color: colors.textLight,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        borderRadius: borderRadius.md,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: shadows.lg,
        display: 'inline-block',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.primaryHover
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = shadows.xl
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = shadows.lg
      }}
    >
      + Start New Safety Plan
    </button>
  )
}

// Recent Plan Card Component
const RecentPlanCard = () => {
  // This would be populated from state/API in the future
  const recentPlan = null

  if (!recentPlan) return null

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        boxShadow: shadows.md,
      }}
    >
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          color: colors.textPrimary,
          marginBottom: spacing.lg,
        }}
      >
        Your Most Recent Plan
      </h3>

      <div style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <span style={{ fontSize: typography.fontSize['2xl'] }}>🚧</span>
          <div>
            <p
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.textPrimary,
              }}
            >
              Main St Bridge Repair
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
              }}
            >
              📍 Main St & 5th Ave
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.textSecondary,
              }}
            >
              📅 Created: Oct 25, 2025
            </p>
          </div>
        </div>
      </div>

      <button
        style={{
          width: '100%',
          padding: `${spacing.md} ${spacing.lg}`,
          backgroundColor: colors.neutral,
          color: colors.textLight,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          borderRadius: borderRadius.md,
          cursor: 'pointer',
          marginBottom: spacing.md,
        }}
      >
        View Plan →
      </button>

      <a
        href="/plans"
        style={{
          display: 'block',
          textAlign: 'center',
          color: colors.primary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        View All Plans →
      </a>
    </div>
  )
}

// How It Works Step Component
interface HowItWorksStepProps {
  icon: React.ReactNode
  stepNumber: number
  title: string
  description: string
}

const HowItWorksStep = ({ icon, stepNumber, title, description }: HowItWorksStepProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: spacing.md,
      }}
    >
      {/* Icon Circle */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: borderRadius.full,
          backgroundColor: colors.primary,
          color: colors.textLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>

      {/* Step Number */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: borderRadius.full,
          backgroundColor: colors.accent,
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
        }}
      >
        {stepNumber}
      </div>

      {/* Title */}
      <h4
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          color: colors.textPrimary,
        }}
      >
        {title}
      </h4>

      {/* Description */}
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
        }}
      >
        {description}
      </p>
    </div>
  )
}

// Save Modal Component
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

export default LandingPage
