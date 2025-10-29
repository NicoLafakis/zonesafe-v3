import { useEffect } from 'react'
import { usePlanWizard, type Equipment, type EquipmentCategory } from '../../contexts/PlanWizardContext'
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme'
import { Truck, Wrench, HardHat, Construction } from 'lucide-react'

interface Step4EquipmentProps {
  onNext: () => void
  onBack: () => void
}

const Step4Equipment = ({ onNext, onBack }: Step4EquipmentProps) => {
  const { planData, updateEquipment } = usePlanWizard()

  // Initialize equipment list if empty
  useEffect(() => {
    if (planData.equipment.length === 0) {
      updateEquipment(initialEquipment)
    }
  }, [])

  const handleEquipmentToggle = (index: number) => {
    const newEquipment = [...planData.equipment]

    // If toggling "hand tools only", deselect all others
    if (newEquipment[index].name === 'Light/Hand Tools Only') {
      newEquipment.forEach((item, i) => {
        if (i === index) {
          item.selected = !item.selected
        } else {
          item.selected = false
        }
      })
    } else {
      // If selecting any other equipment, deselect "hand tools only"
      newEquipment.forEach((item, i) => {
        if (item.name === 'Light/Hand Tools Only') {
          item.selected = false
        }
        if (i === index) {
          item.selected = !item.selected
        }
      })
    }

    updateEquipment(newEquipment)
  }

  const canProceed = planData.equipment.some((item) => item.selected)

  const getCategoryIcon = (category: EquipmentCategory) => {
    switch (category) {
      case 'heavy':
        return <Construction size={32} />
      case 'medium':
        return <HardHat size={32} />
      case 'vehicles':
        return <Truck size={32} />
      case 'mobile':
        return <Truck size={32} />
      case 'handtools':
        return <Wrench size={32} />
      default:
        return <Construction size={32} />
    }
  }

  const equipmentByCategory = {
    heavy: planData.equipment.filter((e) => e.category === 'heavy'),
    medium: planData.equipment.filter((e) => e.category === 'medium'),
    vehicles: planData.equipment.filter((e) => e.category === 'vehicles'),
    mobile: planData.equipment.filter((e) => e.category === 'mobile'),
    handtools: planData.equipment.filter((e) => e.category === 'handtools'),
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h2
        style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        }}
      >
        Equipment Selection
      </h2>
      <p
        style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          marginBottom: spacing.xl,
        }}
      >
        Select all equipment that will be used in the work zone. This helps us calculate proper
        buffer spaces.
      </p>

      {/* Heavy Machinery */}
      <EquipmentCategory
        title="Heavy Machinery"
        icon={getCategoryIcon('heavy')}
        equipment={equipmentByCategory.heavy}
        onToggle={handleEquipmentToggle}
        allEquipment={planData.equipment}
      />

      {/* Medium Equipment */}
      <EquipmentCategory
        title="Medium Equipment"
        icon={getCategoryIcon('medium')}
        equipment={equipmentByCategory.medium}
        onToggle={handleEquipmentToggle}
        allEquipment={planData.equipment}
      />

      {/* Vehicles */}
      <EquipmentCategory
        title="Vehicles"
        icon={getCategoryIcon('vehicles')}
        equipment={equipmentByCategory.vehicles}
        onToggle={handleEquipmentToggle}
        allEquipment={planData.equipment}
      />

      {/* Mobile Equipment */}
      <EquipmentCategory
        title="Mobile Equipment"
        icon={getCategoryIcon('mobile')}
        equipment={equipmentByCategory.mobile}
        onToggle={handleEquipmentToggle}
        allEquipment={planData.equipment}
      />

      {/* Light/Hand Tools Only */}
      <EquipmentCategory
        title="Light/Hand Tools"
        icon={getCategoryIcon('handtools')}
        equipment={equipmentByCategory.handtools}
        onToggle={handleEquipmentToggle}
        allEquipment={planData.equipment}
      />

      {/* Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: spacing.xl,
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            backgroundColor: colors.neutral,
            color: colors.textLight,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
            borderRadius: borderRadius.md,
            cursor: 'pointer',
            boxShadow: shadows.md,
          }}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            backgroundColor: canProceed ? colors.primary : colors.neutralLight,
            color: colors.textLight,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
            borderRadius: borderRadius.md,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            boxShadow: canProceed ? shadows.md : 'none',
            opacity: canProceed ? 1 : 0.6,
          }}
        >
          Next: Generate Plan →
        </button>
      </div>
    </div>
  )
}

// Equipment Category Component
interface EquipmentCategoryProps {
  title: string
  icon: React.ReactNode
  equipment: Equipment[]
  onToggle: (index: number) => void
  allEquipment: Equipment[]
}

const EquipmentCategory = ({
  title,
  icon,
  equipment,
  onToggle,
  allEquipment,
}: EquipmentCategoryProps) => {
  if (equipment.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        boxShadow: shadows.md,
        marginBottom: spacing.xl,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <div style={{ color: colors.primary }}>{icon}</div>
        <h3
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
          }}
        >
          {title}
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: spacing.md,
        }}
      >
        {equipment.map((item) => {
          const globalIndex = allEquipment.findIndex((e) => e.name === item.name)
          return (
            <button
              key={item.name}
              onClick={() => onToggle(globalIndex)}
              style={{
                padding: spacing.lg,
                border: `2px solid ${item.selected ? colors.primary : colors.neutralLight}`,
                borderRadius: borderRadius.md,
                backgroundColor: item.selected ? `${colors.primary}15` : colors.surface,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: item.selected ? colors.primary : colors.textPrimary,
                }}
              >
                {item.selected && '✓ '}
                {item.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Initial Equipment List
const initialEquipment: Equipment[] = [
  // Heavy Machinery
  { category: 'heavy', name: 'Excavators', selected: false },
  { category: 'heavy', name: 'Pavers', selected: false },
  { category: 'heavy', name: 'Graders', selected: false },
  { category: 'heavy', name: 'Rollers/Compactors (large)', selected: false },
  { category: 'heavy', name: 'Milling machines', selected: false },

  // Medium Equipment
  { category: 'medium', name: 'Skid steers', selected: false },
  { category: 'medium', name: 'Small compactors', selected: false },
  { category: 'medium', name: 'Concrete saws', selected: false },
  { category: 'medium', name: 'Jackhammers', selected: false },

  // Vehicles
  { category: 'vehicles', name: 'Dump trucks', selected: false },
  { category: 'vehicles', name: 'Pickup trucks', selected: false },
  { category: 'vehicles', name: 'Utility trucks', selected: false },
  { category: 'vehicles', name: 'Traffic attenuators', selected: false },
  { category: 'vehicles', name: 'Arrow boards', selected: false },

  // Mobile Equipment
  { category: 'mobile', name: 'Striping trucks', selected: false },
  { category: 'mobile', name: 'Street sweepers', selected: false },
  { category: 'mobile', name: 'Crack sealing equipment', selected: false },

  // Light/Hand Tools
  { category: 'handtools', name: 'Light/Hand Tools Only', selected: false },
]

export default Step4Equipment
