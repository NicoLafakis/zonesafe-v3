import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { colors, spacing, shadows, typography, borderRadius } from '../styles/theme'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMenu = () => setMenuOpen(!menuOpen)

  const handleNavigation = (path: string) => {
    navigate(path)
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
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

          {/* Profile Icon or User Avatar */}
          {isAuthenticated && user ? (
            <div
              onClick={toggleMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                cursor: 'pointer',
                padding: spacing.sm,
              }}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.full,
                    border: `2px solid ${colors.primary}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textLight,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.bold,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ) : (
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
          )}
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
            {/* User Info Section */}
            {isAuthenticated && user && (
              <div
                style={{
                  marginBottom: spacing.xl,
                  paddingBottom: spacing.lg,
                  borderBottom: `1px solid ${colors.neutralLight}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: borderRadius.full,
                        border: `2px solid ${colors.primary}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.textLight,
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.bold,
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.textPrimary,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {user.name || 'User'}
                    </div>
                    <div
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary,
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logo */}
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

            {/* Menu Items */}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <MenuItem label="Home" onClick={() => handleNavigation('/')} active={false} />
              {isAuthenticated && (
                <MenuItem label="My Plans" onClick={() => handleNavigation('/plans')} active={false} />
              )}
              <MenuItem label="Help & Support" onClick={() => handleNavigation('/help')} active={false} />
              {isAuthenticated && (
                <MenuItem label="Settings" onClick={() => handleNavigation('/settings')} active={false} />
              )}
              {isAuthenticated ? (
                <MenuItem
                  label="Sign Out"
                  onClick={handleLogout}
                  active={false}
                  icon={<LogOut size={18} />}
                />
              ) : (
                <MenuItem label="Sign In" onClick={() => handleNavigation('/settings')} active={false} />
              )}
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
  icon?: React.ReactNode
}

const MenuItem = ({ label, onClick, active, icon }: MenuItemProps) => {
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
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        {icon}
        {label}
      </button>
    </li>
  )
}

export default Header
