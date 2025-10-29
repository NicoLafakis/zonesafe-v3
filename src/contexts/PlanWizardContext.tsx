import { createContext, useContext, useState, ReactNode } from 'react'
import type { WorkType } from '../lib/mutcd-calculation-engine'

// Step 1: Location & Road Characteristics
export interface RoadData {
  roadName: string
  startAddress: string
  endAddress: string
  speedLimit: number
  laneCount: number
  laneCountSource: 'google' | 'here' | 'osm' | 'ai-gov' | 'ai-web' | 'user'
  laneCountConfidence: number
  userModified: boolean
  direction: 'northbound' | 'southbound' | 'eastbound' | 'westbound' | 'bidirectional'
  selectedLanes: number[] // Array of lane indices that are closed
  workZoneLengthFeet: number
}

// Step 2: Work Timing & Duration
export interface WorkTiming {
  duration: {
    value: number
    unit: 'hours' | 'days' | 'weeks'
  }
  timeOfDay: 'daytime' | 'nighttime' | '24hour'
  daysOfWeek: 'weekdays' | 'weekends' | 'all'
}

// Step 3: Work Zone Details
export interface WorkZoneDetails {
  workerCount: number
  workZoneLengthFeet: number // Can override auto-calculated value
  hasFlagger: boolean
  flaggerCount?: number
}

// Step 4: Equipment Selection
export type EquipmentCategory = 'heavy' | 'medium' | 'vehicles' | 'mobile' | 'handtools'

export interface Equipment {
  category: EquipmentCategory
  name: string
  selected: boolean
}

// Complete Plan Data
export interface PlanWizardData {
  workType: WorkType
  roadData: Partial<RoadData>
  workTiming: Partial<WorkTiming>
  workZoneDetails: Partial<WorkZoneDetails>
  equipment: Equipment[]
}

interface PlanWizardContextValue {
  planData: PlanWizardData
  updateRoadData: (data: Partial<RoadData>) => void
  updateWorkTiming: (data: Partial<WorkTiming>) => void
  updateWorkZoneDetails: (data: Partial<WorkZoneDetails>) => void
  updateEquipment: (equipment: Equipment[]) => void
  resetPlan: () => void
  loadPlan: (plan: PlanWizardData) => void
}

const PlanWizardContext = createContext<PlanWizardContextValue | undefined>(undefined)

const initialPlanData: PlanWizardData = {
  workType: 'roadway_pavement',
  roadData: {},
  workTiming: {},
  workZoneDetails: {},
  equipment: [],
}

export const PlanWizardProvider = ({ children }: { children: ReactNode }) => {
  const [planData, setPlanData] = useState<PlanWizardData>(initialPlanData)

  const updateRoadData = (data: Partial<RoadData>) => {
    setPlanData((prev) => ({
      ...prev,
      roadData: { ...prev.roadData, ...data },
    }))
  }

  const updateWorkTiming = (data: Partial<WorkTiming>) => {
    setPlanData((prev) => ({
      ...prev,
      workTiming: { ...prev.workTiming, ...data },
    }))
  }

  const updateWorkZoneDetails = (data: Partial<WorkZoneDetails>) => {
    setPlanData((prev) => ({
      ...prev,
      workZoneDetails: { ...prev.workZoneDetails, ...data },
    }))
  }

  const updateEquipment = (equipment: Equipment[]) => {
    setPlanData((prev) => ({
      ...prev,
      equipment,
    }))
  }

  const resetPlan = () => {
    setPlanData(initialPlanData)
  }

  const loadPlan = (plan: PlanWizardData) => {
    setPlanData(plan)
  }

  return (
    <PlanWizardContext.Provider
      value={{
        planData,
        updateRoadData,
        updateWorkTiming,
        updateWorkZoneDetails,
        updateEquipment,
        resetPlan,
        loadPlan,
      }}
    >
      {children}
    </PlanWizardContext.Provider>
  )
}

export const usePlanWizard = () => {
  const context = useContext(PlanWizardContext)
  if (context === undefined) {
    throw new Error('usePlanWizard must be used within a PlanWizardProvider')
  }
  return context
}
