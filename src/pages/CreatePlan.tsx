import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WizardLayout, { WizardStep } from '../components/WizardLayout'
import { PlanWizardProvider, usePlanWizard } from '../contexts/PlanWizardContext'
import Step1Location from '../components/wizard/Step1Location'
import Step2Timing from '../components/wizard/Step2Timing'
import Step3Details from '../components/wizard/Step3Details'
import Step4Equipment from '../components/wizard/Step4Equipment'
import Step5Results from '../components/wizard/Step5Results'
import { colors } from '../styles/theme'
import type { WorkType } from '../lib/mutcd-calculation-engine'

const wizardSteps: WizardStep[] = [
  { id: 1, title: 'Location', description: 'Road characteristics' },
  { id: 2, title: 'Timing', description: 'Work schedule' },
  { id: 3, title: 'Details', description: 'Work zone info' },
  { id: 4, title: 'Equipment', description: 'Select equipment' },
  { id: 5, title: 'Results', description: 'Your safety plan' },
]

const CreatePlanContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { setWorkType } = usePlanWizard()
  const [currentStep, setCurrentStep] = useState(1)

  // Initialize work type from location state if provided
  useEffect(() => {
    const workType = (location.state as { workType?: WorkType } | null)?.workType
    if (workType) {
      setWorkType(workType)
    }
  }, [location.state, setWorkType])

  const handleNext = () => {
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1)
      globalThis.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      globalThis.scrollTo(0, 0)
    } else if (currentStep === 1) {
      // Go back to work type selection
      navigate('/plans/new')
    }
  }

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId)
      globalThis.scrollTo(0, 0)
    }
  }

  const handleEdit = () => {
    setCurrentStep(1)
    globalThis.scrollTo(0, 0)
  }

  const handleStartNew = () => {
    // Reset wizard and go back to step 1
    globalThis.location.reload()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Location onNext={handleNext} onBack={handleBack} />
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
          />
        )
      default:
        return <Step1Location onNext={handleNext} />
    }
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

const CreatePlan = () => {
  return (
    <PlanWizardProvider>
      <CreatePlanContent />
    </PlanWizardProvider>
  )
}

export default CreatePlan