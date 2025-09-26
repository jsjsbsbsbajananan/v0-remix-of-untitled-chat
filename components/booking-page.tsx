"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, MessageSquare, Check, MapPin, Phone, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

interface Court {
  id: number
  name: string
  description: string
  category: string
  price_per_hour: number
  status: "available" | "closed" | "maintenance"
  photos?: string[]
}

interface EstablishmentSettings {
  id: number
  name: string
  logo?: string
  banner?: string
  address?: string
  phone?: string
  operating_hours?: string
  status: "open" | "closed"
}

interface BookingPageProps {
  businessData?: any
  userConfig?: {
    companyName: string
    logo: string
    primaryColor: string
    modules: string[]
  }
  subdomain?: string
}

export default function BookingPage({ businessData, userConfig, subdomain }: BookingPageProps) {
  const router = useRouter()
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [clientData, setClientData] = useState({
    name: "",
    phone: "",
    notes: "",
  })
  const [courts, setCourts] = useState<Court[]>([])
  const [settings, setSettings] = useState<EstablishmentSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isPreviewMode = !!userConfig && subdomain === "preview"

  const createSupabaseClient = () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.log("[v0] Supabase environment variables not found, using preview mode")
        return null
      }

      return createBrowserClient(supabaseUrl, supabaseKey)
    } catch (error) {
      console.error("[v0] Error creating Supabase client:", error)
      return null
    }
  }

  const supabase = createSupabaseClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading courts and settings...")

        if (!supabase) {
          console.log("[v0] No Supabase client available, using demo data")
          setSettings({
            id: 1,
            name: userConfig?.companyName || "Centro Esportivo",
            logo: "/car-logo.png",
            banner: "/sports-center-banner.jpg",
            address: "Rua dos Esportes, 123",
            phone: "(11) 99999-9999",
            operating_hours: "06:00 - 22:00",
            status: "open",
          })
          setCourts(demoCourts)
          setLoading(false)
          return
        }

        // Load courts
        const { data: courtsData, error: courtsError } = await supabase
          .from("courts")
          .select("*")
          .eq("status", "available")

        if (courtsError) {
          console.error("[v0] Error loading courts:", courtsError)
          setCourts(demoCourts) // Use demo data as fallback
        } else {
          console.log("[v0] Courts loaded:", courtsData)
          setCourts(courtsData || demoCourts)
        }

        // Load establishment settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("establishment_settings")
          .select("*")
          .limit(1)
          .single()

        if (settingsError) {
          console.error("[v0] Error loading settings:", settingsError)
          // Use default settings if none found
          setSettings({
            id: 1,
            name: userConfig?.companyName || "Centro Esportivo",
            logo: "/car-logo.png",
            banner: "/sports-center-banner.jpg",
            address: "Rua dos Esportes, 123",
            phone: "(11) 99999-9999",
            operating_hours: "06:00 - 22:00",
            status: "open",
          })
        } else {
          console.log("[v0] Settings loaded:", settingsData)
          setSettings(settingsData)
        }
      } catch (error) {
        console.error("[v0] Error in loadData:", error)
        setError("Erro ao carregar dados. Usando dados de demonstração.")
        // Use demo data as fallback
        setSettings({
          id: 1,
          name: userConfig?.companyName || "Centro Esportivo",
          logo: "/car-logo.png",
          banner: "/sports-center-banner.jpg",
          address: "Rua dos Esportes, 123",
          phone: "(11) 99999-9999",
          operating_hours: "06:00 - 22:00",
          status: "open",
        })
        setCourts(demoCourts)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase, userConfig])

  // Demo courts for preview mode or fallback
  const demoCourts: Court[] = [
    {
      id: 1,
      name: "Quadra Society 1",
      description: "Quadra de futebol society com grama sintética",
      category: "society",
      price_per_hour: 80,
      status: "available",
      photos: ["/soccer-field.png"],
    },
    {
      id: 2,
      name: "Quadra de Futvôlei",
      description: "Quadra de areia para futvôlei",
      category: "futvolei",
      price_per_hour: 60,
      status: "available",
      photos: ["/beach-volleyball-court.png"],
    },
    {
      id: 3,
      name: "Quadra de Tênis",
      description: "Quadra oficial de tênis com piso sintético",
      category: "tenis",
      price_per_hour: 100,
      status: "available",
      photos: ["/outdoor-tennis-court.png"],
    },
  ]

  const currentCourts = isPreviewMode ? demoCourts : courts
  const currentSettings = isPreviewMode
    ? {
        id: 1,
        name: userConfig?.companyName || "Centro Esportivo",
        logo: "/car-logo.png",
        banner: "/sports-center-banner.jpg",
        address: "Rua dos Esportes, 123",
        phone: "(11) 99999-9999",
        operating_hours: "06:00 - 22:00",
        status: "open" as const,
      }
    : settings

  // Available times (6 AM to 10 PM)
  const availableTimes = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ]

  // Next 30 days
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates
  }

  const handleBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (isPreviewMode || !supabase) {
      alert("Esta é uma demonstração. Em um ambiente real, a reserva seria confirmada.")
      return
    }

    try {
      const { data, error } = await supabase.from("reservations").insert([
        {
          court_id: selectedCourt.id,
          client_name: clientData.name,
          client_phone: clientData.phone,
          reservation_date: selectedDate,
          reservation_time: selectedTime,
          notes: clientData.notes,
          status: "confirmed",
          total_price: selectedCourt.price_per_hour,
        },
      ])

      if (error) {
        console.error("[v0] Error creating reservation:", error)
        alert("Erro ao criar reserva. Tente novamente.")
        return
      }

      alert("Reserva confirmada com sucesso!")

      // Reset form
      setSelectedCourt(null)
      setSelectedDate("")
      setSelectedTime("")
      setClientData({ name: "", phone: "", notes: "" })
    } catch (error) {
      console.error("[v0] Error in handleBooking:", error)
      alert("Erro ao processar reserva. Tente novamente.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log("[v0] Displaying error state:", error)
  }

  return (
    <div className="min-h-screen bg-white">
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={currentSettings?.logo || "/car-logo.png"}
                alt={`Logo ${currentSettings?.name}`}
                className="h-12 w-12 object-contain rounded-lg"
                onError={(e) => {
                  console.log("[v0] Logo failed to load, using fallback")
                  e.currentTarget.src = "/generic-sports-logo.png"
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentSettings?.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span
                    className={`flex items-center gap-1 ${currentSettings?.status === "open" ? "text-green-600" : "text-red-600"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${currentSettings?.status === "open" ? "bg-green-600" : "bg-red-600"}`}
                    ></div>
                    {currentSettings?.status === "open" ? "Aberto" : "Fechado"}
                  </span>
                  {currentSettings?.operating_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {currentSettings.operating_hours}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              {currentSettings?.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {currentSettings.phone}
                </div>
              )}
              {currentSettings?.address && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {currentSettings.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-green-600 to-green-800">
        <img
          src={currentSettings?.banner || "/placeholder.svg?height=300&width=800&query=sports+center+banner"}
          alt="Banner"
          className="w-full h-full object-cover opacity-30"
          onError={(e) => {
            console.log("[v0] Banner failed to load, using fallback")
            e.currentTarget.src = "/sports-center-banner.jpg"
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-2">Reserve sua Quadra</h2>
            <p className="text-xl opacity-90">Fácil, rápido e seguro</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Court Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <User className="h-5 w-5" />
                  Escolha a Quadra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentCourts.map((court) => (
                  <div
                    key={court.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourt?.id === court.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCourt(court)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{court.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{court.description}</p>
                        <p className="text-sm text-gray-500 mt-2 capitalize">
                          <Star className="h-4 w-4 inline mr-1" />
                          {court.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">R$ {court.price_per_hour}/h</p>
                        {selectedCourt?.id === court.id && <Check className="h-5 w-5 text-green-600 mt-1 ml-auto" />}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Date and Time Selection */}
            {selectedCourt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Calendar className="h-5 w-5" />
                    Escolha Data e Horário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                    >
                      <option value="">Selecione uma data</option>
                      {getAvailableDates().map((date) => (
                        <option key={date} value={date}>
                          {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimes.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 text-sm border rounded-lg transition-all ${
                              selectedTime === time
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-gray-300 hover:border-green-300 text-black"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Client Form */}
          <div className="space-y-6">
            {selectedCourt && selectedDate && selectedTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <MessageSquare className="h-5 w-5" />
                    Seus Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <Input
                      type="text"
                      value={clientData.name}
                      onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                      placeholder="Digite seu nome completo"
                      className="w-full text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone/WhatsApp *</label>
                    <Input
                      type="tel"
                      value={clientData.phone}
                      onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações (opcional)</label>
                    <Textarea
                      value={clientData.notes}
                      onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                      placeholder="Alguma observação especial?"
                      rows={3}
                      className="w-full text-black"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Summary */}
            {selectedCourt && selectedDate && selectedTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Resumo da Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quadra:</span>
                    <span className="font-medium text-black">{selectedCourt.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium text-black capitalize">{selectedCourt.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium text-black">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horário:</span>
                    <span className="font-medium text-black">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span className="text-black">Total (1 hora):</span>
                    <span className="text-green-600">R$ {selectedCourt.price_per_hour}</span>
                  </div>

                  <Button onClick={handleBooking} className="w-full mt-4 bg-green-600 hover:bg-green-700" size="lg">
                    Confirmar Reserva
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
