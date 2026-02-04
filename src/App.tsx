import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AgentInterceptorProvider } from '@/components/AgentInterceptorProvider'
import ErrorBoundary, { GlobalErrorModal } from '@/components/ErrorBoundary'
import Home from './pages/Home'
import ReportEmergency from './pages/ReportEmergency'
import DoctorPortal from './pages/DoctorPortal'
import AdminDashboard from './pages/AdminDashboard'
import VendorPortal from './pages/VendorPortal'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AgentInterceptorProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report-emergency" element={<ReportEmergency />} />
            <Route path="/doctor" element={<DoctorPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/vendor" element={<VendorPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AgentInterceptorProvider>
        <GlobalErrorModal />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
