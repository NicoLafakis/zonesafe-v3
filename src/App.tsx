import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MyPlans from './pages/MyPlans'
import CreatePlan from './pages/CreatePlan'
import ViewPlan from './pages/ViewPlan'
import HelpSupport from './pages/HelpSupport'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/plans" element={<MyPlans />} />
      <Route path="/plans/new" element={<CreatePlan />} />
      <Route path="/plans/:planId" element={<ViewPlan />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App
