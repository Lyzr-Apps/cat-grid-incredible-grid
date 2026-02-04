import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Store, MapPin, Calendar, Tag, CheckCircle } from 'lucide-react'

// TypeScript interface from ACTUAL test response
interface ActiveOffer {
  offer_id: string
  vendor_name: string
  offer_type: string
  service_category: string
  discount_value: string
  distance_km: number
  expiry_date: string
  redemption_code: string
  redemptions?: number
}

export default function VendorPortal() {
  const navigate = useNavigate()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [serviceCat, setServiceCat] = useState('')
  const [offerType, setOfferType] = useState('')
  const [discountValue, setDiscountValue] = useState('')
  const [coverageArea, setCoverageArea] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [vendorName, setVendorName] = useState('')

  // Mock active offers based on test response structure
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([
    {
      offer_id: "offer123",
      vendor_name: "Healthy Paws Veterinary",
      offer_type: "discount",
      service_category: "veterinary",
      discount_value: "15%",
      distance_km: 4.5,
      expiry_date: "2023-12-31",
      redemption_code: "HEALTHYPAWS15",
      redemptions: 12
    },
    {
      offer_id: "offer456",
      vendor_name: "PetCare Plus",
      offer_type: "discount",
      service_category: "medical supplies",
      discount_value: "20%",
      distance_km: 3.2,
      expiry_date: "2024-01-15",
      redemption_code: "PETCARE20",
      redemptions: 8
    },
    {
      offer_id: "offer789",
      vendor_name: "Animal Wellness Center",
      offer_type: "free service",
      service_category: "veterinary",
      discount_value: "Free checkup",
      distance_km: 5.1,
      expiry_date: "2023-11-30",
      redemption_code: "WELLNESS2023",
      redemptions: 24
    }
  ])

  const handlePublishOffer = () => {
    if (!serviceCat || !offerType || !discountValue || !coverageArea || !expiryDate || !vendorName) {
      return
    }

    const newOffer: ActiveOffer = {
      offer_id: `offer${Date.now()}`,
      vendor_name: vendorName,
      offer_type: offerType,
      service_category: serviceCat,
      discount_value: discountValue,
      distance_km: parseFloat(coverageArea),
      expiry_date: expiryDate,
      redemption_code: `${vendorName.slice(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
      redemptions: 0
    }

    setActiveOffers([newOffer, ...activeOffers])
    setSuccess(true)

    // Reset form
    setTimeout(() => {
      setShowCreateForm(false)
      setSuccess(false)
      setServiceCat('')
      setOfferType('')
      setDiscountValue('')
      setCoverageArea('')
      setExpiryDate('')
      setVendorName('')
    }, 2000)
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
            <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl p-2">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vendor Portal</h1>
              <p className="text-xs text-gray-500">Manage offers and services</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Offers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{activeOffers.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Redemptions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activeOffers.reduce((sum, offer) => sum + (offer.redemptions || 0), 0)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Coverage</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(activeOffers.reduce((sum, offer) => sum + offer.distance_km, 0) / activeOffers.length).toFixed(1)} km
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Offer Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Create New Offer</CardTitle>
                  <CardDescription>Post discounts and services for the community</CardDescription>
                </div>
                {!showCreateForm && (
                  <Button onClick={() => setShowCreateForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Offer
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!showCreateForm ? (
                <div className="text-center py-12 text-gray-500">
                  <Store className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p>Click "New Offer" to create your first offer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-800">Offer published successfully!</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name</Label>
                    <Input
                      id="vendorName"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="e.g., Healthy Paws Veterinary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceCategory">Service Category</Label>
                    <Select value={serviceCat} onValueChange={setServiceCat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veterinary">Veterinary Services</SelectItem>
                        <SelectItem value="medical supplies">Medical Supplies</SelectItem>
                        <SelectItem value="food">Cat Food & Supplies</SelectItem>
                        <SelectItem value="shelter">Shelter & Housing</SelectItem>
                        <SelectItem value="grooming">Grooming Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="offerType">Offer Type</Label>
                    <Select value={offerType} onValueChange={setOfferType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="free service">Free Service</SelectItem>
                        <SelectItem value="package deal">Package Deal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountValue">Discount Value</Label>
                    <Input
                      id="discountValue"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="e.g., 20%, Free checkup"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverageArea">Coverage Area (km radius)</Label>
                    <Input
                      id="coverageArea"
                      type="number"
                      value={coverageArea}
                      onChange={(e) => setCoverageArea(e.target.value)}
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button
                      onClick={handlePublishOffer}
                      disabled={!serviceCat || !offerType || !discountValue || !coverageArea || !expiryDate || !vendorName || success}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      {success ? 'Published!' : 'Publish Offer'}
                    </Button>
                    <Button
                      onClick={() => setShowCreateForm(false)}
                      variant="outline"
                      disabled={success}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Offers List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Offers</CardTitle>
              <CardDescription>Your current offers and redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {activeOffers.map((offer) => (
                    <div
                      key={offer.offer_id}
                      className="p-4 border rounded-lg hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{offer.vendor_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{offer.service_category}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {offer.discount_value}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Tag className="h-4 w-4" />
                          <span>Code: <span className="font-mono font-semibold">{offer.redemption_code}</span></span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{offer.distance_km} km coverage</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Expires: {offer.expiry_date}</span>
                        </div>

                        <Separator className="my-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Redemptions</span>
                          <Badge variant="secondary">
                            {offer.redemptions || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeOffers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No active offers yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
