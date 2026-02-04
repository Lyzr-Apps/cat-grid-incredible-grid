import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, AlertCircle, MapPin, CheckCircle, XCircle, Clock, Stethoscope } from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'

// Agent IDs
const MEDICAL_TRIAGE_AGENT_ID = "69830c8b29c2f18838004b05"
const SUPPLY_MATCHING_AGENT_ID = "69830ca651b9f371d4d6a6c2"

// TypeScript interfaces from test responses
interface DoctorNotified {
  doctor_id: string
  name: string
  distance_km: number
  specialization: string
}

interface MedicalCase {
  case_id: string
  urgency: string
  injury_type: string
  symptoms: string[]
  analysis: string
  doctors_notified: DoctorNotified[]
  expected_response_time: string
  admin_flagged: boolean
  recommendations: string[]
  location?: string
  photo?: string
  status?: 'pending' | 'accepted' | 'in-progress' | 'completed'
}

interface MatchedOffer {
  offer_id: string
  vendor_name: string
  offer_type: string
  service_category: string
  discount_value: string
  distance_km: number
  expiry_date: string
  redemption_code: string
}

interface SupplyResult {
  matched_offers: MatchedOffer[]
  recommended_clinics: any[]
  notification_sent: boolean
  relevance_score: number
}

export default function DoctorPortal() {
  const navigate = useNavigate()
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null)
  const [offers, setOffers] = useState<MatchedOffer[]>([])
  const [loadingOffers, setLoadingOffers] = useState(false)

  // Mock cases - in real app, this would come from backend/state
  const [cases, setCases] = useState<MedicalCase[]>([
    {
      case_id: "MC-19.0760-72.8777-001",
      urgency: "HIGH",
      injury_type: "wound",
      symptoms: ["open leg wound", "limping", "pain"],
      analysis: "The cat has an open wound on its leg, is limping, and is visibly in pain. This requires urgent medical attention to prevent infection and alleviate the pain.",
      doctors_notified: [
        { doctor_id: "D001", name: "Dr. Anita Rao", distance_km: 3.2, specialization: "Veterinarian" }
      ],
      expected_response_time: "120 minutes",
      admin_flagged: false,
      recommendations: ["Immediate wound cleaning", "Pain management", "Medical evaluation"],
      location: "Zone C, 19.0760, 72.8777",
      status: "pending"
    },
    {
      case_id: "MC-19.0850-72.8850-002",
      urgency: "CRITICAL",
      injury_type: "trauma",
      symptoms: ["bleeding", "unconscious", "broken limb"],
      analysis: "Cat found unconscious with severe bleeding and possible broken leg. Requires immediate emergency intervention.",
      doctors_notified: [
        { doctor_id: "D002", name: "Dr. Sameer Khan", distance_km: 2.1, specialization: "Animal Surgeon" }
      ],
      expected_response_time: "60 minutes",
      admin_flagged: true,
      recommendations: ["Emergency stabilization", "Immediate surgery evaluation", "Blood transfusion may be needed"],
      location: "Zone A, Near Park",
      status: "pending"
    },
    {
      case_id: "MC-19.0920-72.8920-003",
      urgency: "MEDIUM",
      injury_type: "infection",
      symptoms: ["eye infection", "discharge", "squinting"],
      analysis: "Cat showing signs of eye infection with discharge. Needs antibiotic treatment.",
      doctors_notified: [
        { doctor_id: "D003", name: "Dr. Priya Mehta", distance_km: 4.5, specialization: "Veterinarian" }
      ],
      expected_response_time: "180 minutes",
      admin_flagged: false,
      recommendations: ["Eye examination", "Antibiotic prescription", "Follow-up visit"],
      location: "Zone B, Market Area",
      status: "pending"
    }
  ])

  const loadSupplyOffers = async (caseData: MedicalCase) => {
    setLoadingOffers(true)
    try {
      const message = `A medical case for ${caseData.injury_type} treatment has been created at location ${caseData.location}. Match with relevant vendor offers.`
      const result = await callAIAgent(message, SUPPLY_MATCHING_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const supplyData = result.response.result as SupplyResult
        setOffers(supplyData.matched_offers)
      }
    } catch (error) {
      console.error('Error loading offers:', error)
    } finally {
      setLoadingOffers(false)
    }
  }

  const handleCaseSelect = (caseData: MedicalCase) => {
    setSelectedCase(caseData)
    loadSupplyOffers(caseData)
  }

  const handleAcceptCase = (caseId: string) => {
    setCases(cases.map(c =>
      c.case_id === caseId ? { ...c, status: 'accepted' as const } : c
    ))
    if (selectedCase?.case_id === caseId) {
      setSelectedCase({ ...selectedCase, status: 'accepted' })
    }
  }

  const handleRejectCase = (caseId: string) => {
    setCases(cases.filter(c => c.case_id !== caseId))
    if (selectedCase?.case_id === caseId) {
      setSelectedCase(null)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      case 'MEDIUM':
        return 'bg-amber-500'
      case 'LOW':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const pendingCases = cases.filter(c => c.status === 'pending')
  const acceptedCases = cases.filter(c => c.status === 'accepted')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-2">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
              <p className="text-xs text-gray-500">Manage Medical Cases</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending">
              Pending ({pendingCases.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({acceptedCases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Case List */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Cases</CardTitle>
                  <CardDescription>Medical emergencies awaiting response</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-3">
                      {pendingCases.map((caseData) => (
                        <div
                          key={caseData.case_id}
                          onClick={() => handleCaseSelect(caseData)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedCase?.case_id === caseData.case_id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getUrgencyColor(caseData.urgency)} text-white`}>
                                {caseData.urgency}
                              </Badge>
                              {caseData.admin_flagged && (
                                <Badge variant="destructive">Admin Flagged</Badge>
                              )}
                            </div>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-1">
                            {caseData.injury_type.charAt(0).toUpperCase() + caseData.injury_type.slice(1)}
                          </h3>

                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {caseData.analysis}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {caseData.doctors_notified[0]?.distance_km} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {caseData.expected_response_time}
                            </span>
                          </div>
                        </div>
                      ))}

                      {pendingCases.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                          <p>No pending cases</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Case Details */}
              {selectedCase ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Case Details</CardTitle>
                          <CardDescription className="mt-1">
                            Case ID: {selectedCase.case_id}
                          </CardDescription>
                        </div>
                        <Badge className={`${getUrgencyColor(selectedCase.urgency)} text-white`}>
                          {selectedCase.urgency}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Injury Type</h3>
                        <p className="text-gray-900">{selectedCase.injury_type}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Symptoms</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCase.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="secondary">{symptom}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Analysis</h3>
                        <p className="text-gray-900">{selectedCase.analysis}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
                        <p className="text-gray-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {selectedCase.location}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h3>
                        <ul className="space-y-1">
                          {selectedCase.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {selectedCase.status === 'pending' && (
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => handleAcceptCase(selectedCase.case_id)}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Case
                          </Button>
                          <Button
                            onClick={() => handleRejectCase(selectedCase.case_id)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Supply Offers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Suggested Offers</CardTitle>
                      <CardDescription>Available discounts and services</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingOffers ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Loading offers...</p>
                        </div>
                      ) : offers.length > 0 ? (
                        <div className="space-y-3">
                          {offers.map((offer) => (
                            <div key={offer.offer_id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{offer.vendor_name}</h3>
                                  <p className="text-sm text-gray-600">{offer.service_category}</p>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {offer.discount_value} OFF
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                <span>{offer.distance_km} km away</span>
                                <span>Code: {offer.redemption_code}</span>
                                <span>Expires: {offer.expiry_date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No offers available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-[600px]">
                    <div className="text-center text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Select a case to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="accepted">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Cases</CardTitle>
                <CardDescription>Cases you are currently handling</CardDescription>
              </CardHeader>
              <CardContent>
                {acceptedCases.length > 0 ? (
                  <div className="space-y-3">
                    {acceptedCases.map((caseData) => (
                      <div key={caseData.case_id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getUrgencyColor(caseData.urgency)} text-white`}>
                                {caseData.urgency}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                In Progress
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900">{caseData.injury_type}</h3>
                            <p className="text-sm text-gray-600 mt-1">{caseData.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No accepted cases yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
