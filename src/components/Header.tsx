import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'
import { colors, spacing, shadows, typography } from '../styles/theme'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => setMenuOpen(!menuOpen)

  const handleNavigation = (path: string) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          backgroundColor: colors.surface,
          boxShadow: shadows.sm,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: `${spacing.md} ${spacing.lg}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Hamburger Menu */}
          <button
            onClick={toggleMenu}
            style={{
              padding: spacing.sm,
              color: colors.neutral,
              cursor: 'pointer',
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              cursor: 'pointer',
            }}
          >
            <span style={{ color: colors.neutral }}>Zone</span>
            <span style={{ color: colors.accent }}>Safe</span>
          </Link>

          {/* Profile Icon */}
          <button
            onClick={() => navigate('/settings')}
            style={{
              padding: spacing.sm,
              color: colors.neutral,
              cursor: 'pointer',
            }}
            aria-label="User profile"
          >
            <User size={24} />
          </button>
        </div>
      </header>

      {/* Slide-in Navigation Menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={toggleMenu}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1001,
              animation: 'fadeIn 0.3s ease-out',
            }}
          />

          {/* Menu Drawer */}
          <nav
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '280px',
              height: '100%',
              backgroundColor: colors.surface,
              boxShadow: shadows.xl,
              zIndex: 1002,
              padding: spacing.xl,
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ marginBottom: spacing['2xl'] }}>
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral,
                }}
              >
                <span style={{ color: colors.neutral }}>Zone</span>
                <span style={{ color: colors.accent }}>Safe</span>
              </h2>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <MenuItem label="Home" onClick={() => handleNavigation('/')} active={false} />
              <MenuItem label="My Plans" onClick={() => handleNavigation('/plans')} active={false} />
              <MenuItem label="Help & Support" onClick={() => handleNavigation('/help')} active={false} />
              <MenuItem label="Settings" onClick={() => handleNavigation('/settings')} active={false} />
              <MenuItem label="Sign Out" onClick={() => console.log('Sign out')} active={false} />
            </ul>
          </nav>

          {/* CSS Animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  )
}

interface MenuItemProps {
  label: string
  onClick: () => void
  active: boolean
}

const MenuItem = ({ label, onClick, active }: MenuItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <li>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          padding: `${spacing.md} ${spacing.lg}`,
          textAlign: 'left',
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          backgroundColor: active ? colors.primary : isHovered ? '#f5f5f5' : 'transparent',
          color: active ? colors.textLight : colors.neutral,
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    </li>
  )
}

export default Header
