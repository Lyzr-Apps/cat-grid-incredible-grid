import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, BarChart, Users, AlertCircle, Activity, MapPin, TrendingUp, Shield } from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'

// Agent IDs
const COVERAGE_AGENT_ID = "69830c5851b9f371d4d6a6c1"
const PATTERN_FORECASTING_AGENT_ID = "69830cc229c2f18838004b09"

// TypeScript interfaces from test responses
interface ChronicNeglectZone {
  zone_id: string
  missed_days_last_month: number
  pattern: string
}

interface RiskForecast {
  zone_id: string
  risk_level: string
  confidence: number
  recommended_action: string
}

interface OverburdendVolunteer {
  user_id: string
  zones_assigned: number
  burnout_risk: number
}

interface WeeklyInsights {
  coverage_percentage: number
  total_check_ins: number
  medical_cases: number
  volunteer_count: number
  recommendations: string[]
}

interface Trends {
  volunteer_growth: string
  medical_hotspots: string[]
  offer_redemption_rate: number
}

interface PatternResult {
  chronic_neglect_zones: ChronicNeglectZone[]
  risk_forecast_tomorrow: RiskForecast[]
  overburdened_volunteers: OverburdendVolunteer[]
  weekly_insights: WeeklyInsights
  trends: Trends
}

interface UncoveredZone {
  zone_id: string
  last_fed: string
  urgency: string
}

interface CoverageResult {
  zone_status: string
  uncovered_zones: UncoveredZone[]
  escalations: any[]
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [coverageData, setCoverageData] = useState<CoverageResult | null>(null)
  const [patternData, setPatternData] = useState<PatternResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load coverage data
      const coverageResult = await callAIAgent(
        "Scan all zones and provide current coverage status",
        COVERAGE_AGENT_ID
      )

      if (coverageResult.success && coverageResult.response.status === 'success') {
        setCoverageData(coverageResult.response.result as CoverageResult)
      }

      // Load pattern & forecasting data
      const patternResult = await callAIAgent(
        "Analyze the last 30 days of zone coverage data and predict risk areas",
        PATTERN_FORECASTING_AGENT_ID
      )

      if (patternResult.success && patternResult.response.status === 'success') {
        setPatternData(patternResult.response.result as PatternResult)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-amber-500'
      case 'low':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getZoneStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'green':
        return 'bg-green-500'
      case 'amber':
        return 'bg-amber-500'
      case 'red':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">City-wide monitoring & analytics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Metrics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Feeders</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {patternData?.weekly_insights.volunteer_count || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Coverage %</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {patternData?.weekly_insights.coverage_percentage || 0}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Medical Cases</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {patternData?.weekly_insights.medical_cases || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-400 to-orange-500">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Check-ins</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {patternData?.weekly_insights.total_check_ins || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                      <BarChart className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coverage Heatmap */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Coverage Heatmap</CardTitle>
                  <CardDescription>Zone status visualization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 p-6">
                    <div className="absolute top-4 right-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">Well Covered</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-gray-700">At Risk</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">Critical</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 h-full">
                      {/* Display zones based on coverage data */}
                      {coverageData?.uncovered_zones.map((zone) => (
                        <div
                          key={zone.zone_id}
                          className={`flex flex-col items-center justify-center rounded-lg border-2 ${
                            zone.urgency === 'high' ? 'bg-red-100 border-red-500' : 'bg-amber-100 border-amber-500'
                          }`}
                        >
                          <MapPin className={`h-5 w-5 ${
                            zone.urgency === 'high' ? 'text-red-600' : 'text-amber-600'
                          }`} />
                          <p className="text-xs font-semibold mt-1">{zone.zone_id}</p>
                        </div>
                      ))}

                      {/* Show some covered zones */}
                      {['Z1', 'Z2', 'Z4', 'Z5', 'Z6', 'Z7'].map(zone => (
                        <div
                          key={zone}
                          className="flex flex-col items-center justify-center rounded-lg border-2 bg-green-100 border-green-500"
                        >
                          <MapPin className="h-5 w-5 text-green-600" />
                          <p className="text-xs font-semibold mt-1">{zone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Weekly Insights
                  </CardTitle>
                  <CardDescription>Key recommendations and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Coverage Rate</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {patternData?.weekly_insights.coverage_percentage}%
                        </span>
                      </div>
                      <Progress value={patternData?.weekly_insights.coverage_percentage || 0} />
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h3>
                      <ul className="space-y-2">
                        {patternData?.weekly_insights.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Trends</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Volunteer Growth</span>
                          <Badge variant="outline">
                            {patternData?.trends.volunteer_growth}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Offer Redemption</span>
                          <Badge variant="outline">
                            {((patternData?.trends.offer_redemption_rate || 0) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-600">Medical Hotspots</span>
                          <div className="flex gap-1 mt-1">
                            {patternData?.trends.medical_hotspots.map((spot, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spot}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alert Queue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Alert Queue
                  </CardTitle>
                  <CardDescription>Escalations and critical zones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {coverageData?.uncovered_zones.map((zone) => (
                        <div key={zone.zone_id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{zone.zone_id}</h3>
                                <Badge variant={zone.urgency === 'high' ? 'destructive' : 'secondary'}>
                                  {zone.urgency}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">Last fed: {zone.last_fed}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!coverageData?.uncovered_zones || coverageData.uncovered_zones.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No active alerts</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Chronic Neglect Zones & Risk Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chronic Neglect Zones</CardTitle>
                  <CardDescription>Zones with recurring coverage issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patternData?.chronic_neglect_zones.map((zone) => (
                      <div key={zone.zone_id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">Zone {zone.zone_id}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Missed {zone.missed_days_last_month} days last month
                            </p>
                            <p className="text-sm text-amber-600 mt-1">
                              Pattern: {zone.pattern}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!patternData?.chronic_neglect_zones || patternData.chronic_neglect_zones.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No chronic neglect zones</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tomorrow's Risk Forecast</CardTitle>
                  <CardDescription>Predicted high-risk areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patternData?.risk_forecast_tomorrow.map((forecast) => (
                      <div key={forecast.zone_id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">Zone {forecast.zone_id}</h3>
                              <Badge className={`${getRiskColor(forecast.risk_level)} text-white`}>
                                {forecast.risk_level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Confidence: {(forecast.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          {forecast.recommended_action}
                        </p>
                      </div>
                    ))}

                    {(!patternData?.risk_forecast_tomorrow || patternData.risk_forecast_tomorrow.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No high-risk zones forecasted</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overburdened Volunteers */}
            {patternData?.overburdened_volunteers && patternData.overburdened_volunteers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Overburdened Volunteers</CardTitle>
                  <CardDescription>Volunteers at risk of burnout</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patternData.overburdened_volunteers.map((volunteer) => (
                      <div key={volunteer.user_id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{volunteer.user_id}</h3>
                          <Badge variant="destructive">At Risk</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Zones Assigned</span>
                            <span className="font-semibold text-gray-900">{volunteer.zones_assigned}</span>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600">Burnout Risk</span>
                              <span className="font-semibold text-gray-900">
                                {(volunteer.burnout_risk * 100).toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={volunteer.burnout_risk * 100} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
