import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Bell, User, Menu, AlertCircle, CheckCircle, TrendingUp, Flame } from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'

// Agent IDs
const COVERAGE_AGENT_ID = "69830c5851b9f371d4d6a6c1"
const ORCHESTRATOR_AGENT_ID = "69830ce5710a251ef6c8a621"

// TypeScript interfaces based on ACTUAL test response data
interface UncoveredZone {
  zone_id: string
  last_fed: string
  urgency: string
}

interface NearbyVolunteer {
  user_id: string
  distance_km: number
  availability: string
}

interface AlertCreated {
  alert_id: string
  zone_id: string
  volunteers_notified: number
}

interface CoverageResult {
  zone_status: string
  uncovered_zones: UncoveredZone[]
  nearby_volunteers: NearbyVolunteer[]
  alerts_created: AlertCreated[]
  escalations: any[]
}

// Header component
function Header() {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-2">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CatCare City</h1>
            <p className="text-xs text-gray-500">Community Feeder</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)}>
              <Menu className="h-5 w-5" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 space-y-1">
                <button
                  onClick={() => { navigate('/'); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  Feeder Dashboard
                </button>
                <button
                  onClick={() => { navigate('/doctor'); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  Doctor Portal
                </button>
                <button
                  onClick={() => { navigate('/vendor'); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  Vendor Portal
                </button>
                <button
                  onClick={() => { navigate('/admin'); setShowMenu(false) }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  Admin Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Stats card component
function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [coverageData, setCoverageData] = useState<CoverageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkInLocation, setCheckInLocation] = useState('')
  const [checkInSuccess, setCheckInSuccess] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)

  // Load coverage data on mount
  useEffect(() => {
    loadCoverageData()
  }, [])

  const loadCoverageData = async () => {
    setLoading(true)
    try {
      const result = await callAIAgent(
        "Scan all zones and identify any that haven't been fed in the last 24 hours",
        COVERAGE_AGENT_ID
      )

      if (result.success && result.response.status === 'success') {
        setCoverageData(result.response.result as CoverageResult)
      }
    } catch (error) {
      console.error('Error loading coverage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!checkInLocation.trim()) return

    setCheckInLoading(true)
    setCheckInSuccess(false)
    try {
      const result = await callAIAgent(
        `Volunteer check-in for ${checkInLocation} at ${new Date().toLocaleTimeString()}`,
        ORCHESTRATOR_AGENT_ID
      )

      if (result.success && result.response.status === 'success') {
        setCheckInSuccess(true)
        setCheckInLocation('')
        // Reload coverage data
        setTimeout(() => {
          loadCoverageData()
        }, 1000)
      }
    } catch (error) {
      console.error('Error submitting check-in:', error)
    } finally {
      setCheckInLoading(false)
    }
  }

  const handleVolunteer = async (zoneId: string) => {
    try {
      await callAIAgent(
        `Volunteer accepting coverage for ${zoneId}`,
        ORCHESTRATOR_AGENT_ID
      )
      loadCoverageData()
    } catch (error) {
      console.error('Error volunteering:', error)
    }
  }

  // Calculate stats
  const zonesFedToday = coverageData ?
    (coverageData.uncovered_zones.length > 0 ? 5 - coverageData.uncovered_zones.length : 5) : 0
  const currentStreak = 14
  const nearbyAlertsCount = coverageData?.alerts_created.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Top Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Zones Fed Today"
            value={zonesFedToday}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-400 to-emerald-500"
          />
          <StatCard
            title="Current Streak"
            value={`${currentStreak} days`}
            icon={TrendingUp}
            color="bg-gradient-to-br from-blue-400 to-blue-500"
          />
          <StatCard
            title="Nearby Alerts"
            value={nearbyAlertsCount}
            icon={AlertCircle}
            color="bg-gradient-to-br from-amber-400 to-orange-500"
          />
        </div>

        {/* Map View with Zone Markers */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Coverage Map</CardTitle>
            <CardDescription>Color-coded based on feeding status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">Loading coverage data...</p>
              </div>
            ) : (
              <div className="relative h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6">
                <div className="absolute top-4 right-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">Well Covered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-gray-700">Needs Attention</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-700">Critical</span>
                  </div>
                </div>

                {/* Mock zone markers */}
                <div className="grid grid-cols-3 gap-4 h-full">
                  {coverageData?.uncovered_zones.map((zone, index) => (
                    <div
                      key={zone.zone_id}
                      className={`flex items-center justify-center rounded-lg border-2 ${
                        zone.urgency === 'high' ? 'bg-red-100 border-red-500' : 'bg-amber-100 border-amber-500'
                      }`}
                    >
                      <div className="text-center">
                        <MapPin className={`h-6 w-6 mx-auto ${
                          zone.urgency === 'high' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <p className="text-xs font-semibold mt-1">{zone.zone_id}</p>
                        <p className="text-xs text-gray-600">{zone.last_fed}</p>
                      </div>
                    </div>
                  ))}

                  {/* Show covered zones */}
                  {['Zone B', 'Zone F', 'Zone G'].map(zone => (
                    <div
                      key={zone}
                      className="flex items-center justify-center rounded-lg border-2 bg-green-100 border-green-500"
                    >
                      <div className="text-center">
                        <MapPin className="h-6 w-6 mx-auto text-green-600" />
                        <p className="text-xs font-semibold mt-1">{zone}</p>
                        <p className="text-xs text-gray-600">2h ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Check-in Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Quick Check-in
              </CardTitle>
              <CardDescription>Report that you've fed a zone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={checkInLocation}
                  onChange={(e) => setCheckInLocation(e.target.value)}
                  placeholder="e.g., Zone A, Park Street"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <Button
                onClick={handleCheckIn}
                disabled={!checkInLocation.trim() || checkInLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {checkInLoading ? 'Submitting...' : 'I Fed Here'}
              </Button>

              {checkInSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800">Check-in successful! Thank you for feeding the cats!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nearby Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Nearby Alerts
              </CardTitle>
              <CardDescription>Zones that need your help</CardDescription>
            </CardHeader>
            <CardContent>
              {coverageData?.uncovered_zones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p>All zones covered! Great work!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {coverageData?.uncovered_zones.map((zone) => (
                    <div
                      key={zone.zone_id}
                      className="p-4 border rounded-lg hover:border-green-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{zone.zone_id}</h3>
                            <Badge variant={zone.urgency === 'high' ? 'destructive' : 'secondary'}>
                              {zone.urgency}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Last fed: {zone.last_fed}</p>
                        </div>
                        <Button
                          onClick={() => handleVolunteer(zone.zone_id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Volunteer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button for Emergency */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => navigate('/report-emergency')}
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 h-14 w-14 p-0"
          >
            <Flame className="h-6 w-6" />
          </Button>
        </div>
      </main>
    </div>
  )
}
