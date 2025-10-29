import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WizardLayout, { WizardStep } from '../components/WizardLayout'
import { PlanWizardProvider, usePlanWizard, PlanWizardData, Equipment } from '../contexts/PlanWizardContext'
import { useAuth } from '../contexts/AuthContext'
import Step1Location from '../components/wizard/Step1Location'
import Step2Timing from '../components/wizard/Step2Timing'
import Step3Details from '../components/wizard/Step3Details'
import Step4Equipment from '../components/wizard/Step4Equipment'
import Step5Results from '../components/wizard/Step5Results'
import { plansAPI, PlanDetail } from '../services/api'
import { colors, spacing, typography, borderRadius } from '../styles/theme'

const wizardSteps: WizardStep[] = [
  { id: 1, title: 'Location', description: 'Road characteristics' },
  { id: 2, title: 'Timing', description: 'Work schedule' },
  { id: 3, title: 'Details', description: 'Work zone info' },
  { id: 4, title: 'Equipment', description: 'Select equipment' },
  { id: 5, title: 'Results', description: 'Your safety plan' },
]

const transformPlanToWizardData = (plan: PlanDetail): PlanWizardData => {
  const selectedLanes = typeof plan.selected_lanes === 'string'
    ? JSON.parse(plan.selected_lanes)
    : plan.selected_lanes
  const equipment = plan.equipment || []

  return {
    workType: plan.work_type as any,
    roadData: {
      roadName: plan.road_name,
      startAddress: plan.start_address,
      endAddress: plan.end_address || '',
      speedLimit: plan.speed_limit,
      laneCount: plan.lane_count,
      laneCountSource: 'user',
      laneCountConfidence: 100,
      userModified: true,
      direction: 'bidirectional',
      selectedLanes: selectedLanes,
      workZoneLengthFeet: plan.work_zone_length_feet,
    },
    workTiming: {
      duration: {
        value: plan.duration_value,
        unit: plan.duration_unit as 'hours' | 'days' | 'weeks',
      },
      timeOfDay: plan.time_of_day as 'daytime' | 'nighttime' | '24hour',
      daysOfWeek: plan.days_of_week as 'weekdays' | 'weekends' | 'all',
    },
    workZoneDetails: {
      workerCount: plan.worker_count,
      workZoneLengthFeet: plan.work_zone_length_feet,
      hasFlagger: plan.has_flagger,
      flaggerCount: plan.flagger_count || undefined,
    },
    equipment: equipment.map((item: any) => ({
      category: item.category || 'handtools',
      name: item.name,
      selected: true,
    })) as Equipment[],
  }
}

const EditPlanContent = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { loadPlan } = usePlanWizard()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/settings')
      return
    }
    loadExistingPlan()
  }, [planId, isAuthenticated])

  const loadExistingPlan = async () => {
    if (!planId) return

    setLoading(true)
    setError(null)

    try {
      const response = await plansAPI.getById(parseInt(planId))
      const wizardData = transformPlanToWizardData(response.plan)
      loadPlan(wizardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId)
      window.scrollTo(0, 0)
    }
  }

  const handleEdit = () => {
    setCurrentStep(1)
    window.scrollTo(0, 0)
  }

  const handleStartNew = () => {
    navigate('/plans/new')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Location onNext={handleNext} />
      case 2:
        return <Step2Timing onNext={handleNext} onBack={handleBack} />
      case 3:
        return <Step3Details onNext={handleNext} onBack={handleBack} />
      case 4:
        return <Step4Equipment onNext={handleNext} onBack={handleBack} />
      case 5:
        return (
          <Step5Results
            onEdit={handleEdit}
            onStartNew={handleStartNew}
            editMode={true}
            planId={parseInt(planId!)}
          />
        )
      default:
        return <Step1Location onNext={handleNext} />
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
        <Header />
        <main style={{ flex: 1, padding: spacing['2xl'], maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', padding: spacing['3xl'] }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: `4px solid ${colors.neutralLight}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: borderRadius.full,
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ color: colors.textSecondary, marginTop: spacing.lg }}>Loading plan...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
        <Header />
        <main style={{ flex: 1, padding: spacing['2xl'], maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', padding: spacing['3xl'] }}>
            <AlertTriangle size={48} style={{ color: colors.error, margin: '0 auto' }} />
            <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing.lg }}>
              {error}
            </h2>
            <button
              onClick={() => navigate('/plans')}
              style={{
                marginTop: spacing.xl,
                padding: `${spacing.md} ${spacing.xl}`,
                backgroundColor: colors.primary,
                color: colors.textLight,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
              }}
            >
              Back to My Plans
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      <Header />

      <WizardLayout
        steps={wizardSteps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      >
        {renderStep()}
      </WizardLayout>

      <Footer />
    </div>
  )
}

const EditPlan = () => {
  return (
    <PlanWizardProvider>
      <EditPlanContent />
    </PlanWizardProvider>
  )
}

export default EditPlan
