import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MyPlans from './pages/MyPlans'
import WorkTypeSelection from './pages/WorkTypeSelection'
import CreatePlan from './pages/CreatePlan'
import ViewPlan from './pages/ViewPlan'
import EditPlan from './pages/EditPlan'
import HelpSupport from './pages/HelpSupport'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/plans" element={<MyPlans />} />
      <Route path="/plans/new" element={<WorkTypeSelection />} />
      <Route path="/plans/create" element={<CreatePlan />} />
      <Route path="/plans/:planId" element={<ViewPlan />} />
      <Route path="/plans/:planId/edit" element={<EditPlan />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App
