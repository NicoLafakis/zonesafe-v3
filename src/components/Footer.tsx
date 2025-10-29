import { CheckCircle } from 'lucide-react'
import { colors, spacing, typography } from '../styles/theme'

const Footer = () => {
  const trustIndicators = [
    'FHWA MUTCD Compliant',
    'Meets Federal & State Requirements',
    'Professional-Grade Plans',
  ]

  return (
    <footer
      style={{
        width: '100%',
        backgroundColor: colors.neutral,
        color: colors.textLight,
        padding: `${spacing['2xl']} ${spacing.lg}`,
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg,
        }}
      >
        {/* Trust Indicators */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: spacing.xl,
          }}
        >
          {trustIndicators.map((indicator, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <CheckCircle size={20} color={colors.accent} />
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {indicator}
              </span>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            textAlign: 'center',
            fontSize: typography.fontSize.sm,
            color: colors.neutralLight,
            paddingTop: spacing.lg,
            borderTop: `1px solid ${colors.neutralLight}`,
          }}
        >
          © {new Date().getFullYear()} ZoneSafe. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
