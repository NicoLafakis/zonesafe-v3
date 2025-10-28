import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { colors, spacing, typography } from '../styles/theme'

const ViewPlan = () => {
  const { planId } = useParams()

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
        <h1
          style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
            marginBottom: spacing.xl,
          }}
        >
          View Plan
        </h1>

        <p style={{ color: colors.textSecondary }}>
          Plan ID: {planId}
        </p>

        <p style={{ color: colors.textSecondary, marginTop: spacing.md }}>
          Plan viewer will be implemented here.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default ViewPlan
