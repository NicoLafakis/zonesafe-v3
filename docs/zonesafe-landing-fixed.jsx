import React, { useState } from 'react';
import { Menu, X, User, MapPin, Settings, CheckCircle, Play, FileText, LogOut, HelpCircle } from 'lucide-react';

const ZoneSafeLanding = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasRecentPlan, setHasRecentPlan] = useState(true);

  const colors = {
    orange: '#FF4F0F',
    orangeHover: '#e64608',
    white: '#FFFBF1',
    yellow: '#FFDB4C',
    gray: '#4E4B4B'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.white }}>
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        zIndex: 40 
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ 
              padding: '8px', 
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Menu size={24} color={colors.gray} />
          </button>
          
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            <span style={{ color: colors.gray }}>Zone</span>
            <span style={{ color: colors.yellow }}>Safe</span>
          </h1>
          
          <button style={{ 
            padding: '8px', 
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <User size={24} color={colors.gray} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            zIndex: 50 
          }} 
          onClick={() => setMenuOpen(false)}
        >
          <div 
            style={{ 
              width: '288px', 
              height: '100%', 
              backgroundColor: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '24px',
              animation: 'slideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.gray, margin: 0 }}>Menu</h2>
              <button onClick={() => setMenuOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.gray} />
              </button>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                backgroundColor: colors.orange,
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: '500',
                textDecoration: 'none'
              }}>
                <MapPin size={20} />
                Home
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                color: colors.gray,
                borderRadius: '8px',
                textDecoration: 'none'
              }}>
                <FileText size={20} />
                My Plans
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                color: colors.gray,
                borderRadius: '8px',
                textDecoration: 'none'
              }}>
                <HelpCircle size={20} />
                Help & Support
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                color: colors.gray,
                borderRadius: '8px',
                textDecoration: 'none'
              }}>
                <Settings size={20} />
                Settings
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                color: colors.gray,
                borderRadius: '8px',
                textDecoration: 'none'
              }}>
                <LogOut size={20} />
                Sign Out
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: colors.gray,
            lineHeight: '1.2',
            marginBottom: '24px',
            marginTop: 0
          }}>
            Create Your Safety Plan<br />in Minutes
          </h2>
          
          <p style={{ 
            fontSize: '18px', 
            color: colors.gray,
            opacity: 0.8,
            maxWidth: '672px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Get a professional traffic control plan that follows all federal and state safety guidelines.
          </p>
          
          <button 
            onClick={() => setShowSaveModal(true)}
            style={{ 
              backgroundColor: colors.orange,
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '18px',
              padding: '16px 32px',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.orangeHover;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.orange;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
          >
            + Start New Safety Plan
          </button>
        </section>

        {/* Last Plan Card */}
        {hasRecentPlan && (
          <section style={{ maxWidth: '336px', margin: '0 auto 32px' }}>
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.gray, marginTop: 0 }}>
                Your Most Recent Plan
              </h3>
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0' }}></div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '32px', lineHeight: 1 }}>🚧</span>
                  <div>
                    <h4 style={{ fontWeight: 'bold', color: colors.gray, fontSize: '18px', margin: '0 0 8px 0' }}>
                      Main St Bridge Repair
                    </h4>
                    <p style={{ color: colors.gray, opacity: 0.75, display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <MapPin size={16} />
                      Main St & 5th Ave
                    </p>
                    <p style={{ color: colors.gray, opacity: 0.75, fontSize: '14px', margin: '4px 0' }}>
                      📅 Created: Oct 25, 2025
                    </p>
                  </div>
                </div>
                
                <button style={{ 
                  width: '100%',
                  backgroundColor: colors.gray,
                  color: '#ffffff',
                  fontWeight: '600',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3838'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray}
                >
                  View Plan →
                </button>
              </div>
              
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0' }}></div>
              <a href="#" style={{ 
                display: 'block',
                textAlign: 'center',
                color: colors.gray,
                fontWeight: '500',
                textDecoration: 'none'
              }}>
                View All Plans →
              </a>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section style={{ maxWidth: '896px', margin: '0 auto 32px' }}>
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '32px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.gray, textAlign: 'center', marginTop: 0 }}>
              How It Works
            </h3>
            <div style={{ borderTop: '1px solid #e5e7eb', margin: '32px 0' }}></div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px',
              marginBottom: '32px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  backgroundColor: colors.orange,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <MapPin size={32} color="#ffffff" />
                </div>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  backgroundColor: colors.yellow,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontWeight: 'bold',
                  color: colors.gray
                }}>
                  1
                </div>
                <h4 style={{ fontWeight: 'bold', color: colors.gray, margin: 0 }}>
                  Tell us where you're working
                </h4>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  backgroundColor: colors.orange,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Settings size={32} color="#ffffff" />
                </div>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  backgroundColor: colors.yellow,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontWeight: 'bold',
                  color: colors.gray
                }}>
                  2
                </div>
                <h4 style={{ fontWeight: 'bold', color: colors.gray, margin: 0 }}>
                  We calculate everything
                </h4>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '64px',
                  height: '64px',
                  backgroundColor: colors.orange,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle size={32} color="#ffffff" />
                </div>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  backgroundColor: colors.yellow,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontWeight: 'bold',
                  color: colors.gray
                }}>
                  3
                </div>
                <h4 style={{ fontWeight: 'bold', color: colors.gray, margin: 0 }}>
                  Get your complete plan
                </h4>
              </div>
            </div>
            
            <p style={{ textAlign: 'center', color: colors.gray, maxWidth: '576px', margin: '0 auto' }}>
              We'll ask simple questions about your work location. Our system handles all federal regulations automatically.
            </p>
          </div>
        </section>

        {/* Tutorial Section */}
        <section style={{ maxWidth: '672px', margin: '64px auto 64px' }}>
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '24px',
              fontWeight: 'bold',
              color: colors.gray,
              marginBottom: '16px'
            }}>
              <Play size={32} />
              Need Help Getting Started?
            </div>
            
            <button style={{ 
              backgroundColor: colors.orange,
              color: '#ffffff',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.orangeHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.orange}
            >
              <Play size={20} />
              Watch Tutorial Video
            </button>
            
            <p style={{ color: colors.gray, margin: 0 }}>
              Learn how to create your first plan in under 3 minutes
            </p>
          </div>
        </section>
      </main>

      {/* Trust Indicators Footer */}
      <footer style={{ backgroundColor: colors.gray, color: '#ffffff', padding: '32px 16px', marginTop: '64px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color={colors.yellow} />
              <span>FHWA MUTCD Compliant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color={colors.yellow} />
              <span>Meets Federal & State Requirements</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color={colors.yellow} />
              <span>Professional-Grade Plans</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Guest Save Modal */}
      {showSaveModal && (
        <div 
          style={{ 
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50
          }} 
          onClick={() => setShowSaveModal(false)}
        >
          <div 
            style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '448px',
              width: '100%',
              animation: 'scaleIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px' }}>💾</div>
              <button onClick={() => setShowSaveModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={24} color={colors.gray} />
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.gray, marginTop: 0 }}>
                Save Your Plan?
              </h3>
              <p style={{ color: colors.gray, margin: 0 }}>
                Create a free account to save your plan and access it anytime.
              </p>
            </div>
            
            <button style={{ 
              width: '100%',
              backgroundColor: colors.orange,
              color: '#ffffff',
              fontWeight: '600',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.orangeHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.orange}
            >
              Create Free Account
            </button>
            
            <button 
              onClick={() => setShowSaveModal(false)}
              style={{ 
                width: '100%',
                color: colors.gray,
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Continue Without Saving
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneSafeLanding;
