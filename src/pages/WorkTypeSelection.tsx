import { useNavigate } from 'react-router-dom'
import { Wrench, Hammer, AlertCircle, TrendingUp, Truck, Radio } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme'
import type { WorkType } from '../lib/mutcd-calculation-engine'

interface WorkTypeOption {
  id: WorkType
  title: string
  description: string
  icon: React.ReactNode
  details: string[]
}

const workTypeOptions: WorkTypeOption[] = [
  {
    id: 'roadway_pavement',
    title: 'Roadway/Pavement Work',
    description: 'Work within traveled lanes',
    icon: <Wrench size={48} color="white" />,
    details: ['Lane closures', 'Paving operations', 'Milling work'],
  },
  {
    id: 'shoulder',
    title: 'Shoulder Work',
    description: 'Work on paved shoulder areas',
    icon: <Hammer size={48} color="white" />,
    details: ['Shoulder maintenance', 'Edge line work', 'Shoulder widening'],
  },
  {
    id: 'intersection',
    title: 'Intersection Work',
    description: 'Work at or through intersections',
    icon: <AlertCircle size={48} color="white" />,
    details: ['Signal work', 'Pavement marking', 'Traffic control'],
  },
  {
    id: 'bridge',
    title: 'Bridge Work',
    description: 'Work on bridge structures',
    icon: <TrendingUp size={48} color="white" />,
    details: ['Bridge maintenance', 'Deck work', 'Structural work'],
  },
  {
    id: 'roadside_utility',
    title: 'Roadside/Utility Work',
    description: 'Work beyond the shoulder',
    icon: <Radio size={48} color="white" />,
    details: ['Utility line work', 'Ditch work', 'Sign installation'],
  },
  {
    id: 'mobile',
    title: 'Mobile Operations',
    description: 'Moving work along the roadway',
    icon: <Truck size={48} color="white" />,
    details: ['Striping operations', 'Mowing', 'Patching'],
  },
]

const WorkTypeSelection = () => {
  const navigate = useNavigate()

  const handleSelectWorkType = (workType: WorkType) => {
    // Navigate to create plan with work type in the URL or state
    navigate('/plans/create', { state: { workType } })
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

      <main style={{ flex: 1, padding: `${spacing['3xl']} ${spacing.lg}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: spacing['3xl'] }}>
            <h1
              style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                marginBottom: spacing.md,
              }}
            >
              Select Your Work Type
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.lg,
                color: colors.textSecondary,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Choose the category that best describes your road work project. Each has specific
              requirements and will guide you through the appropriate steps.
            </p>
          </div>

          {/* Work Type Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: spacing.lg,
              marginBottom: spacing['3xl'],
            }}
          >
            {workTypeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectWorkType(option.id)}
                style={{
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.neutralLight}`,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  boxShadow: shadows.md,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.borderColor = colors.primary
                  target.style.boxShadow = shadows.lg
                  target.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.borderColor = colors.neutralLight
                  target.style.boxShadow = shadows.md
                  target.style.transform = 'translateY(0)'
                }}
              >
                {/* Icon Container */}
                <div
                  style={{
                    backgroundColor: colors.primary,
                    width: '80px',
                    height: '80px',
                    borderRadius: borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.md,
                  }}
                >
                  {option.icon}
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.textPrimary,
                    marginBottom: spacing.sm,
                  }}
                >
                  {option.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: typography.fontSize.base,
                    color: colors.textSecondary,
                    marginBottom: spacing.md,
                  }}
                >
                  {option.description}
                </p>

                {/* Details List */}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {option.details.map((detail) => (
                    <li
                      key={detail}
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary,
                        marginBottom: spacing.xs,
                        paddingLeft: spacing.md,
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          color: colors.primary,
                        }}
                      >
                        •
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* CTA Text */}
                <div
                  style={{
                    marginTop: spacing.lg,
                    paddingTop: spacing.md,
                    borderTop: `1px solid ${colors.neutralLight}`,
                    color: colors.primary,
                    fontWeight: typography.fontWeight.semibold,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  Select Work Type →
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default WorkTypeSelection
