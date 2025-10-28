import Header from '../components/Header'
import Footer from '../components/Footer'
import { colors, spacing, typography } from '../styles/theme'

const MyPlans = () => {
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
          My Plans
        </h1>

        <p style={{ color: colors.textSecondary }}>
          Your saved safety plans will appear here.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default MyPlans
