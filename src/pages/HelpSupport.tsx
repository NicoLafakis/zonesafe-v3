import Header from '../components/Header'
import Footer from '../components/Footer'
import { colors, spacing, typography } from '../styles/theme'

const HelpSupport = () => {
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
          Help & Support
        </h1>

        <p style={{ color: colors.textSecondary }}>
          Help documentation and support resources will be available here.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default HelpSupport
