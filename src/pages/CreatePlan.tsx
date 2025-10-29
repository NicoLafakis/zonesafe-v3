import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WizardLayout, { WizardStep } from '../components/WizardLayout'
import { PlanWizardProvider } from '../contexts/PlanWizardContext'
import Step1Location from '../components/wizard/Step1Location'
import Step2Timing from '../components/wizard/Step2Timing'
import Step3Details from '../components/wizard/Step3Details'
import Step4Equipment from '../components/wizard/Step4Equipment'
import Step5Results from '../components/wizard/Step5Results'
import { colors } from '../styles/theme'

const wizardSteps: WizardStep[] = [
  { id: 1, title: 'Location', description: 'Road characteristics' },
  { id: 2, title: 'Timing', description: 'Work schedule' },
  { id: 3, title: 'Details', description: 'Work zone info' },
  { id: 4, title: 'Equipment', description: 'Select equipment' },
  { id: 5, title: 'Results', description: 'Your safety plan' },
]

const CreatePlanContent = () => {
  const [currentStep, setCurrentStep] = useState(1)

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
    // Reset wizard and go back to step 1
    window.location.reload()
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
