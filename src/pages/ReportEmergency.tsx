import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Upload, MapPin, CheckCircle, AlertCircle, Camera } from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'

// Agent ID
const MEDICAL_TRIAGE_AGENT_ID = "69830c8b29c2f18838004b05"

// TypeScript interfaces from ACTUAL test response
interface DoctorNotified {
  doctor_id: string
  name: string
  distance_km: number
  specialization: string
}

interface MedicalResult {
  case_id: string
  urgency: string
  injury_type: string
  symptoms: string[]
  analysis: string
  doctors_notified: DoctorNotified[]
  expected_response_time: string
  admin_flagged: boolean
  recommendations: string[]
}

export default function ReportEmergency() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MedicalResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!description.trim() || !location.trim()) {
      setError('Please provide both description and location')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const message = `A cat was found with ${description}. Location: ${location}. Classify urgency, create case ticket, and notify nearest available doctors.`

      const response = await callAIAgent(message, MEDICAL_TRIAGE_AGENT_ID)

      if (response.success && response.response.status === 'success') {
        setResult(response.response.result as MedicalResult)
      } else {
        setError('Failed to submit emergency report')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Report Medical Emergency</h1>
            <p className="text-xs text-gray-500">Submit injured cat report</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                Emergency Report Form
              </CardTitle>
              <CardDescription>
                Provide details about the injured cat. Our team will respond immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photo of Injured Cat
                </label>

                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-2 right-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload photo</p>
                    <p className="text-xs text-gray-500 mt-1">Camera or Gallery</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Injury Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the injury: e.g., open leg wound, limping badly, showing visible signs of pain"
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Zone C, 19.0760, 72.8777"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500">Location will be auto-detected</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !description.trim() || !location.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 h-12"
              >
                {loading ? 'Submitting Emergency Report...' : 'Submit Emergency Report'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="border-green-500">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Emergency Report Submitted Successfully
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Case ID: <span className="font-mono font-semibold">{result.case_id}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Urgency Level:</span>
                      <Badge className={`${getUrgencyColor(result.urgency)} text-white`}>
                        {result.urgency}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Injury Type</h3>
                  <p className="text-gray-900">{result.injury_type}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary">{symptom}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Analysis</h3>
                  <p className="text-gray-900">{result.analysis}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Expected Response Time</h3>
                  <p className="text-gray-900">{result.expected_response_time}</p>
                </div>
              </CardContent>
            </Card>

            {/* Doctors Notified */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Doctors Notified ({result.doctors_notified.length})
                </CardTitle>
                <CardDescription>
                  Nearby veterinarians have been alerted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.doctors_notified.map((doctor) => (
                    <div
                      key={doctor.doctor_id}
                      className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {doctor.specialization}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {doctor.distance_km} km away
                          </p>
                        </div>
                        <Badge variant="outline">Notified</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setResult(null)
                  setDescription('')
                  setLocation('')
                  setPhotoPreview(null)
                }}
                variant="outline"
                className="flex-1"
              >
                Report Another Emergency
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
