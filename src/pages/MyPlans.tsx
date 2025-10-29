import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { plansAPI, Plan } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme'
import { FileText, Trash2, Loader, AlertCircle, Plus } from 'lucide-react'

const MyPlans = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/')
        return
      }
      loadPlans()
    }
  }, [isAuthenticated, authLoading, navigate])

  const loadPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await plansAPI.getAll()
      setPlans(response.plans)
    } catch (err: any) {
      setError(err.message || 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return
    }

    try {
      setDeletingId(planId)
      await plansAPI.delete(planId)
      setPlans(plans.filter(p => p.id !== planId))
    } catch (err: any) {
      alert('Failed to delete plan: ' + (err.message || 'Unknown error'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewPlan = (planId: number) => {
    navigate(`/plans/${planId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getWorkTypeLabel = (workType: string) => {
    const labels: Record<string, string> = {
      roadway_pavement: 'Roadway/Pavement',
      shoulder: 'Shoulder Work',
      intersection: 'Intersection',
      bridge: 'Bridge Work',
      roadside_utility: 'Roadside/Utility',
      mobile: 'Mobile Operations'
    }
    return labels[workType] || workType
  }

  if (authLoading || loading) {
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
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader
            size={48}
            color={colors.primary}
            style={{ animation: 'spin 1s linear infinite' }}
          />
        </main>
        <Footer />
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background,
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          padding: spacing['2xl'],
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xl,
          }}
        >
          <h1
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
            }}
          >
            My Plans
          </h1>
          <button
            onClick={() => navigate('/plans/new')}
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              backgroundColor: colors.primary,
              color: colors.textLight,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              boxShadow: shadows.md,
            }}
          >
            <Plus size={20} />
            New Plan
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: '#fee2e2',
              borderLeft: `4px solid #ef4444`,
              borderRadius: borderRadius.sm,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            <AlertCircle size={20} color="#ef4444" />
            <p style={{ fontSize: typography.fontSize.sm, color: '#991b1b' }}>
              {error}
            </p>
          </div>
        )}

        {/* Plans List */}
        {plans.length === 0 ? (
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              padding: spacing['3xl'],
              textAlign: 'center',
              boxShadow: shadows.md,
            }}
          >
            <FileText
              size={64}
              color={colors.neutralLight}
              style={{ margin: '0 auto', marginBottom: spacing.lg }}
            />
            <h2
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.textPrimary,
                marginBottom: spacing.md,
              }}
            >
              No Plans Yet
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.textSecondary,
                marginBottom: spacing.xl,
              }}
            >
              Create your first MUTCD-compliant safety plan in minutes.
            </p>
            <button
              onClick={() => navigate('/plans/new')}
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
              + Start New Safety Plan
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: spacing.lg,
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing.xl,
                  boxShadow: shadows.md,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => handleViewPlan(plan.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = shadows.lg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = shadows.md
                }}
              >
                {/* Plan Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: spacing.md,
                    marginBottom: spacing.lg,
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: borderRadius.full,
                      backgroundColor: `${colors.primary}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} color={colors.primary} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.textPrimary,
                        marginBottom: spacing.xs,
                        lineHeight: typography.lineHeight.tight,
                      }}
                    >
                      {plan.title}
                    </h3>
                    <span
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textLight,
                        backgroundColor: colors.primary,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      {getWorkTypeLabel(plan.work_type)}
                    </span>
                  </div>
                </div>

                {/* Plan Details */}
                <div style={{ marginBottom: spacing.lg }}>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.textSecondary,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <strong>Location:</strong> {plan.road_name || 'N/A'}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.textSecondary,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <strong>Address:</strong> {plan.start_address || 'N/A'}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.textSecondary,
                    }}
                  >
                    <strong>Created:</strong> {formatDate(plan.created_at)}
                  </p>
                </div>

                {/* Confidence Score */}
                <div
                  style={{
                    marginBottom: spacing.lg,
                    padding: spacing.sm,
                    backgroundColor: `${colors.accent}20`,
                    borderRadius: borderRadius.sm,
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.textPrimary,
                    }}
                  >
                    Confidence: {plan.confidence_score}%
                  </span>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: spacing.sm,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleViewPlan(plan.id)}
                    style={{
                      flex: 1,
                      padding: spacing.md,
                      backgroundColor: colors.primary,
                      color: colors.textLight,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                    }}
                  >
                    View Plan
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    disabled={deletingId === plan.id}
                    style={{
                      padding: spacing.md,
                      backgroundColor: '#ef4444',
                      color: colors.textLight,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      borderRadius: borderRadius.md,
                      cursor: deletingId === plan.id ? 'not-allowed' : 'pointer',
                      opacity: deletingId === plan.id ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs,
                    }}
                  >
                    {deletingId === plan.id ? (
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default MyPlans
