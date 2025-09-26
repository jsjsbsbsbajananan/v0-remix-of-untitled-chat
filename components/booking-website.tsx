"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, User, Gift, Trophy, Search, MapPin, Heart, Copy, CheckCircle, Calendar } from "lucide-react"
import BattleList from "./battle-list"
import RankingDisplay from "./ranking-display"

interface BookingWebsiteProps {
  userConfig: {
    companyName: string
    logo: string
    primaryColor: string
  }
  subdomain: string
}

interface Court {
  id: string
  name: string
  description: string | null
  category: string
  price_per_hour: number
  photos: string[]
  status: string
  is_active: boolean
}

interface Battle {
  id: string
  name: string
  format: string
  rules: string
  court_id: string
  max_participants: number
  current_participants: number
  status: string
  scheduled_time: string
}

interface Reservation {
  id: string
  court_id: string
  date: string
  time: string
  duration_hours: number
  total_price: number
  status: string
  extras: any[]
}

interface EstablishmentSettings {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  banner_url: string | null
  operating_hours: string | null
  payment_methods: string[]
}

export default function BookingWebsite({ userConfig, subdomain }: BookingWebsiteProps) {
  const [currentView, setCurrentView] = useState("home") // home, reservations, battles, ranking, promotions, about, profile
  const [selectedCourt, setSelectedCourt] = useState("")
  const [selectedDate, setSelectedDate] = useState("22")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("QUADRAS")
  const [copyFeedback, setCopyFeedback] = useState("")
  const [bookingStep, setBookingStep] = useState(1) // 1: court, 2: date/time, 3: extras, 4: confirmation
  const [reservationNotes, setReservationNotes] = useState("")

  const [courts, setCourts] = useState<Court[]>([])
  const [isLoadingCourts, setIsLoadingCourts] = useState(true)
  const [battles, setBattles] = useState<Battle[]>([])
  const [isLoadingBattles, setIsLoadingBattles] = useState(true)
  const [establishmentSettings, setEstablishmentSettings] = useState<EstablishmentSettings | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchCourts()
    fetchBattles()
    fetchEstablishmentSettings()
  }, [])

  const fetchCourts = async () => {
    try {
      console.log("[v0] Fetching courts...")
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching courts:", error)
        return
      }

      console.log("[v0] Courts fetched:", data)
      setCourts(data || [])
    } catch (error) {
      console.error("[v0] Error fetching courts:", error)
    } finally {
      setIsLoadingCourts(false)
    }
  }

  const fetchBattles = async () => {
    try {
      console.log("[v0] Fetching battles...")
      const { data, error } = await supabase
        .from("battles")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching battles:", error)
        return
      }

      console.log("[v0] Battles fetched:", data)
      setBattles(data || [])
    } catch (error) {
      console.error("[v0] Error fetching battles:", error)
    } finally {
      setIsLoadingBattles(false)
    }
  }

  const fetchEstablishmentSettings = async () => {
    try {
      console.log("[v0] Fetching establishment settings...")
      const { data, error } = await supabase.from("establishment_settings").select("*").limit(1).single()

      if (error) {
        console.error("[v0] Error fetching establishment settings:", error)
        return
      }

      console.log("[v0] Establishment settings fetched:", data)
      setEstablishmentSettings(data)
    } catch (error) {
      console.error("[v0] Error fetching establishment settings:", error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(`${type} copiado!`)
      setTimeout(() => setCopyFeedback(""), 2000)
    })
  }

  const businessInfo = {
    name: establishmentSettings?.name || userConfig.companyName || "Centro Esportivo",
    rating: 4.8,
    reviewCount: 127,
    address: establishmentSettings?.address || "Endereço do centro esportivo - Configure no painel administrativo",
    status: "Aberto", // This should be calculated based on operating hours
    image: establishmentSettings?.banner_url || "/sports-center-banner.jpg",
    description:
      establishmentSettings?.description ||
      "Centro esportivo completo com quadras de society, futvôlei, tênis e vôlei. Configure a descrição no painel administrativo.",
    hours: establishmentSettings?.operating_hours
      ? JSON.parse(establishmentSettings.operating_hours)
      : {
          "segunda-feira": "06:00 - 22:00",
          "terça-feira": "06:00 - 22:00",
          "quarta-feira": "06:00 - 22:00",
          "quinta-feira": "06:00 - 22:00",
          "sexta-feira": "06:00 - 22:00",
          sábado: "07:00 - 20:00",
          domingo: "08:00 - 18:00",
        },
    logo: establishmentSettings?.logo_url || userConfig.logo || "/sports-logo.svg",
    paymentMethods: establishmentSettings?.payment_methods || [
      "Dinheiro",
      "Cartão de Crédito",
      "Cartão de Débito",
      "PIX",
    ],
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const timeSlots = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
  ]

  const extras = [
    { id: "colete", name: "Colete", price: 5.0, icon: "🥅" },
    { id: "bola", name: "Bola", price: 10.0, icon: "⚽" },
    { id: "agua", name: "Água", price: 3.0, icon: "💧" },
    { id: "toalha", name: "Toalha", price: 8.0, icon: "🏃" },
  ]

  const StickyFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => setCurrentView("home")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "home" ? "text-green-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <MapPin className="h-5 w-5" />
          <span className="text-xs font-medium">Início</span>
        </button>
        <button
          onClick={() => setCurrentView("profile")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "profile" ? "text-green-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">Perfil</span>
        </button>
        <button
          onClick={() => setCurrentView("ranking")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "ranking" ? "text-green-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Trophy className="h-5 w-5" />
          <span className="text-xs font-medium">Ranking</span>
        </button>
        <button
          onClick={() => setCurrentView("promotions")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "promotions" ? "text-green-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Gift className="h-5 w-5" />
          <span className="text-xs font-medium">Promoções</span>
        </button>
      </div>
    </div>
  )

  const CopyFeedback = () =>
    copyFeedback && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg z-50">
        {copyFeedback}
      </div>
    )

  const renderHomeView = () => (
    <div className="min-h-screen bg-white text-black pb-20">
      <CopyFeedback />

      {/* Header with back button and actions */}
      <div className="flex items-center justify-between p-4 bg-green-600 text-white">
        <ArrowLeft className="h-6 w-6 text-white" />
        <div className="flex gap-2">
          <button
            onClick={() =>
              window.open(`https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`, "_blank")
            }
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <MapPin className="h-5 w-5 text-green-600" />
          </button>
          <div className="p-2 bg-white rounded-full">
            <Heart className="h-5 w-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Business Banner with Logo - improved responsive design and contrast */}
      <div className="relative bg-green-600 text-white p-6 text-center">
        <div className="mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-white rounded-full p-2 shadow-lg">
            <img src={businessInfo.logo || "/placeholder.svg"} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-balance">{businessInfo.name}</h1>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
            ))}
            <span className="ml-2 text-yellow-400 font-bold">{businessInfo.rating}</span>
          </div>
          <p className="text-sm opacity-90 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-700 rounded-full">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              {businessInfo.status}
            </span>
          </p>
          <div className="flex items-center justify-center gap-1 text-sm opacity-75 max-w-md mx-auto">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-pretty">{businessInfo.address}</span>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Tabs - improved mobile scrolling and contrast */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: "QUADRAS", label: "🏟️ QUADRAS" },
            { id: "RESERVAS", label: "📅 RESERVAS" },
            { id: "BATALHAS", label: "⚔️ BATALHAS" },
            { id: "RANKING", label: "🏆 RANKING" },
            { id: "PROMOCOES", label: "🎉 PROMOÇÕES" },
            { id: "SOBRE", label: "ℹ️ SOBRE" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "BATALHAS") {
                  setCurrentView("battles")
                } else if (tab.id === "RANKING") {
                  setCurrentView("ranking")
                } else {
                  setActiveTab(tab.id)
                }
              }}
              className={`flex-shrink-0 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-green-600 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - improved spacing and responsive grid */}
      <div className="p-4 space-y-6">
        {activeTab === "QUADRAS" && (
          <div>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar quadra..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-black placeholder-gray-500"
              />
            </div>

            {/* Courts List */}
            <div className="space-y-6">
              <h3 className="font-semibold text-black uppercase tracking-wide">Quadras Disponíveis</h3>

              {isLoadingCourts ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando quadras...</p>
                </div>
              ) : courts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mb-2 font-medium text-gray-700">Nenhuma quadra configurada ainda</p>
                  <p className="text-sm text-gray-500">Configure suas quadras no painel administrativo</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {courts.map((court) => (
                    <div
                      key={court.id}
                      className={`border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedCourt === court.id
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => setSelectedCourt(court.id)}
                    >
                      {/* Court Image */}
                      <div className="h-48 sm:h-56 bg-gray-200 relative overflow-hidden">
                        <img
                          src={court.photos?.[0] || "/placeholder.svg?height=200&width=400&query=sports court"}
                          alt={court.name}
                          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                        />
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                              court.status === "available"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : court.status === "maintenance"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {court.status === "available"
                              ? "Disponível"
                              : court.status === "maintenance"
                                ? "Manutenção"
                                : "Fechada"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-black text-lg">{court.name}</h4>
                          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {court.category}
                          </span>
                        </div>
                        {court.description && (
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{court.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-bold text-green-600 text-xl">
                              {formatPrice(court.price_per_hour)}
                            </span>
                            <span className="text-sm text-gray-500">por hora</span>
                          </div>
                          <Button
                            className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCourt(court.id)
                              setCurrentView("booking-flow")
                              setBookingStep(2)
                            }}
                          >
                            Reservar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "RESERVAS" && (
          <div>
            <h3 className="font-semibold text-black uppercase tracking-wide mb-6">Minhas Reservas</h3>
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="mb-2 font-medium text-gray-700">Nenhuma reserva encontrada</p>
              <p className="text-sm text-gray-500">Suas reservas aparecerão aqui após o agendamento</p>
            </div>
          </div>
        )}

        {activeTab === "PROMOCOES" && (
          <div>
            <h3 className="font-semibold text-black uppercase tracking-wide mb-6">Promoções Ativas</h3>
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="mb-2 font-medium text-gray-700">Nenhuma promoção ativa</p>
              <p className="text-sm text-gray-500">Fique atento às nossas ofertas especiais</p>
            </div>
          </div>
        )}

        {activeTab === "SOBRE" && (
          <div className="space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg">
              <h3 className="font-semibold mb-4 text-black text-lg">Sobre o Centro Esportivo</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{businessInfo.description}</p>
              <button
                onClick={() => copyToClipboard(businessInfo.description, "Descrição")}
                className="inline-flex items-center gap-2 text-green-600 text-sm hover:text-green-800 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copiar descrição
              </button>
            </div>

            {/* Sports Available */}
            <div>
              <h3 className="font-semibold mb-4 text-black text-lg">Modalidades Disponíveis</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: "⚽", name: "Society" },
                  { icon: "🏐", name: "Futvôlei" },
                  { icon: "🎾", name: "Tênis" },
                  { icon: "🏐", name: "Vôlei" },
                ].map((sport) => (
                  <div
                    key={sport.name}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                  >
                    <div className="text-3xl mb-2">{sport.icon}</div>
                    <span className="text-sm font-medium text-center text-gray-700">{sport.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <h3 className="font-semibold mb-4 text-black text-lg">Horário de Funcionamento</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {Object.entries(businessInfo.hours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="text-black capitalize font-medium">{day}</span>
                      <span className="text-sm text-gray-600 font-mono">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-semibold mb-4 text-black text-lg">Endereço</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-black mb-3 leading-relaxed">{businessInfo.address}</p>
                <button
                  onClick={() => copyToClipboard(businessInfo.address, "Endereço")}
                  className="inline-flex items-center gap-2 text-green-600 text-sm hover:text-green-800 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copiar endereço
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-semibold mb-4 text-black text-lg">Formas de Pagamento</h3>
              <div className="grid grid-cols-2 gap-3">
                {businessInfo.paymentMethods.map((method) => (
                  <div
                    key={method}
                    className="p-3 bg-gray-100 rounded-lg text-center text-sm font-medium text-gray-700"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <StickyFooter />
    </div>
  )

  const renderBookingFlow = () => (
    <div className="min-h-screen bg-white text-black pb-20">
      <CopyFeedback />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-green-600 text-white">
        <ArrowLeft
          className="h-6 w-6 text-white cursor-pointer"
          onClick={() => {
            if (bookingStep > 1) {
              setBookingStep(bookingStep - 1)
            } else {
              setCurrentView("home")
            }
          }}
        />
        <h1 className="text-lg font-medium">
          {bookingStep === 2 && "Escolher Data e Horário"}
          {bookingStep === 3 && "Extras"}
          {bookingStep === 4 && "Confirmar Reserva"}
        </h1>
        <div></div>
      </div>

      <div className="p-4">
        {/* Step 2: Choose Date and Time */}
        {bookingStep === 2 && (
          <div>
            {/* Calendar */}
            <div className="mb-6">
              <h3 className="font-medium mb-4 text-black">Escolha a data</h3>
              <div className="grid grid-cols-7 gap-1 mb-4 text-center text-sm text-gray-500">
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[
                  { date: "22", active: true },
                  { date: "23" },
                  { date: "24" },
                  { date: "25" },
                  { date: "26" },
                  { date: "27" },
                  { date: "28" },
                ].map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`aspect-square flex items-center justify-center rounded-full text-lg font-medium ${
                      selectedDate === day.date ? "bg-green-600 text-white" : "text-black hover:bg-gray-100"
                    }`}
                  >
                    {day.date}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-4 text-black">Escolha o horário</h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-4 text-center border rounded-lg hover:bg-gray-50 ${
                      selectedTime === time
                        ? "border-green-600 bg-green-50 text-green-600"
                        : "border-gray-200 text-black"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-green-600 text-white hover:bg-green-700"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setBookingStep(3)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 3: Extras */}
        {bookingStep === 3 && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium mb-4 text-black">Adicionais</h3>
              <div className="space-y-4">
                {extras.map((extra) => (
                  <div
                    key={extra.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                      selectedExtras.includes(extra.id) ? "border-green-500 bg-green-50" : "border-gray-200"
                    }`}
                    onClick={() => {
                      if (selectedExtras.includes(extra.id)) {
                        setSelectedExtras(selectedExtras.filter((id) => id !== extra.id))
                      } else {
                        setSelectedExtras([...selectedExtras, extra.id])
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{extra.icon}</span>
                      <div>
                        <h4 className="font-medium text-black">{extra.name}</h4>
                        <p className="text-sm text-gray-500">{formatPrice(extra.price)}</p>
                      </div>
                    </div>
                    {selectedExtras.includes(extra.id) && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-black">Observações (opcional)</h3>
              <textarea
                value={reservationNotes}
                onChange={(e) => setReservationNotes(e.target.value)}
                placeholder="Alguma observação especial para sua reserva..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>

            <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={() => setBookingStep(4)}>
              Continuar
            </Button>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {bookingStep === 4 && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium mb-4 text-black">Confirme sua reserva</h3>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quadra:</span>
                  <span className="text-black font-medium">{courts.find((c) => c.id === selectedCourt)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="text-black font-medium">{selectedDate}/09/2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horário:</span>
                  <span className="text-black font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="text-black font-medium">1 hora</span> {/* Assuming 1 hour for now */}
                </div>
                {selectedExtras.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extras:</span>
                    <div className="text-right">
                      {selectedExtras.map((extraId) => {
                        const extra = extras.find((e) => e.id === extraId)
                        return extra ? (
                          <div key={extraId} className="text-black font-medium">
                            {extra.name} - {formatPrice(extra.price)}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Preço Total:</span>
                  <span className="text-green-600 font-bold">
                    {formatPrice(
                      (courts.find((c) => c.id === selectedCourt)?.price_per_hour || 0) +
                        selectedExtras.reduce((total, extraId) => {
                          const extra = extras.find((e) => e.id === extraId)
                          return total + (extra?.price || 0)
                        }, 0),
                    )}
                  </span>
                </div>
                {reservationNotes && (
                  <div className="border-t pt-3">
                    <span className="text-gray-600">Observações:</span>
                    <p className="text-black mt-1">{reservationNotes}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const courtName = courts.find((c) => c.id === selectedCourt)?.name || "Quadra não especificada"
                  const extraDetails = selectedExtras
                    .map((extraId) => {
                      const extra = extras.find((e) => e.id === extraId)
                      return extra ? `${extra.name} (${formatPrice(extra.price)})` : ""
                    })
                    .filter(Boolean)
                    .join("\n")

                  const totalPrice =
                    (courts.find((c) => c.id === selectedCourt)?.price_per_hour || 0) +
                    selectedExtras.reduce((total, extraId) => {
                      const extra = extras.find((e) => e.id === extraId)
                      return total + (extra?.price || 0)
                    }, 0)

                  const reservationDetails = `
Reserva Confirmada!
Quadra: ${courtName}
Data: ${selectedDate}/09/2025
Horário: ${selectedTime}
Preço Total: ${formatPrice(totalPrice)}
${extraDetails ? `Extras:\n${extraDetails}` : ""}
${reservationNotes ? `Observações: ${reservationNotes}` : ""}
                  `.trim()
                  copyToClipboard(reservationDetails, "Detalhes da reserva")
                }}
                className="mt-4 flex items-center gap-2 text-green-600 text-sm hover:text-green-800"
              >
                <Copy className="h-4 w-4" />
                Copiar detalhes da reserva
              </button>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  setCurrentView("confirmation")
                  // Here you would typically send the reservation to your backend
                }}
              >
                Confirmar Reserva
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setBookingStep(3)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>

      <StickyFooter />
    </div>
  )

  const renderConfirmation = () => (
    <div className="min-h-screen bg-white text-black pb-20 flex items-center justify-center">
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-black mb-2">Reserva Confirmada!</h2>
        <p className="text-gray-600 mb-6">
          Sua reserva foi realizada com sucesso. Você receberá uma confirmação em breve.
        </p>
        <Button
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={() => {
            setCurrentView("home")
            setBookingStep(1)
            setSelectedCourt("")
            setSelectedDate("")
            setSelectedTime("")
            setSelectedExtras([])
            setReservationNotes("")
          }}
        >
          Voltar ao Início
        </Button>
      </div>
      <StickyFooter />
    </div>
  )

  // Main render logic - added battle and ranking views
  switch (currentView) {
    case "battles":
      return <BattleList onBack={() => setCurrentView("home")} />
    case "ranking":
      return <RankingDisplay onBack={() => setCurrentView("home")} />
    case "booking-flow":
      return renderBookingFlow()
    case "confirmation":
      return renderConfirmation()
    default:
      return renderHomeView()
  }
}
