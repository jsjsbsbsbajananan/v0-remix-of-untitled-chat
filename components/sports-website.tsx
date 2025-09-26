"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Star,
  User,
  Trophy,
  Search,
  MapPin,
  Heart,
  Copy,
  Target,
  Users,
  Clock,
  Swords,
  Medal,
  Crown,
  TrendingUp,
} from "lucide-react"

interface SportsWebsiteProps {
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
  category: string
  price_per_hour: number
  status: string
}

interface Battle {
  id: string
  name: string
  modality: string
  format: string
  rules: string
  court_id?: string
  scheduled_time?: string
  status: "waiting" | "in_progress" | "completed" | "cancelled"
  max_players: number
  created_at: string
  court?: Court
}

interface UserStats {
  id: string
  user_id: string
  total_battles: number
  wins: number
  losses: number
  draws: number
  goals_for: number
  goals_against: number
  win_rate: number
  ranking_points: number
  user_email?: string
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
}

export default function SportsWebsite({ userConfig, subdomain }: SportsWebsiteProps) {
  const [currentView, setCurrentView] = useState("home") // home, battles, ranking, profile, battle-details, join-battle
  const [activeTab, setActiveTab] = useState("BATALHAS")
  const [copyFeedback, setCopyFeedback] = useState("")
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null)
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    preferredModality: "society",
  })

  const [courts, setCourts] = useState<Court[]>([])
  const [battles, setBattles] = useState<Battle[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [establishmentSettings, setEstablishmentSettings] = useState<EstablishmentSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch courts
      const { data: courtsData, error: courtsError } = await supabase
        .from("courts")
        .select("*")
        .eq("status", "available")

      if (courtsError) throw courtsError
      setCourts(courtsData || [])

      // Fetch battles with court info
      const { data: battlesData, error: battlesError } = await supabase
        .from("battles")
        .select(`
          *,
          court:courts(id, name, category, price_per_hour)
        `)
        .order("created_at", { ascending: false })

      if (battlesError) throw battlesError
      setBattles(battlesData || [])

      // Fetch user stats for ranking
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .order("ranking_points", { ascending: false })
        .limit(10)

      if (statsError) throw statsError
      setUserStats(statsData || [])

      // Fetch establishment settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("establishment_settings")
        .select("*")
        .limit(1)
        .single()

      if (settingsError) throw settingsError
      setEstablishmentSettings(settingsData)
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(`${type} copiado!`)
      setTimeout(() => setCopyFeedback(""), 2000)
    })
  }

  const businessInfo = {
    name: establishmentSettings?.name || userConfig.companyName || "Arena Sports",
    rating: 4.8,
    reviewCount: 156,
    address: establishmentSettings?.address || "Configure o endereço no painel administrativo",
    status: "Aberto • Fecha às 22:00",
    image: establishmentSettings?.banner_url || "/sports-arena.jpg",
    description:
      establishmentSettings?.description ||
      "Arena esportiva completa com quadras de society, futvôlei, tênis e muito mais. Participe de batalhas emocionantes e suba no ranking!",
    logo: establishmentSettings?.logo_url || userConfig.logo || "/placeholder.svg",
  }

  const modalityOptions = [
    { value: "society", label: "Society", icon: "⚽" },
    { value: "futvolei", label: "Futvôlei", icon: "🏐" },
    { value: "tenis", label: "Tênis", icon: "🎾" },
    { value: "basquete", label: "Basquete", icon: "🏀" },
    { value: "volei", label: "Vôlei", icon: "🏐" },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting: { label: "Aguardando", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      in_progress: { label: "Em Andamento", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
      completed: { label: "Finalizada", color: "bg-green-500/10 text-green-600 border-green-500/20" },
      cancelled: { label: "Cancelada", color: "bg-red-500/10 text-red-600 border-red-500/20" },
    }[status]

    return <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
  }

  const getRankBadge = (position: number) => {
    if (position === 1) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <Crown className="h-3 w-3 mr-1" />
          1º
        </Badge>
      )
    } else if (position === 2) {
      return (
        <Badge className="bg-gray-400/10 text-gray-600 border-gray-400/20">
          <Medal className="h-3 w-3 mr-1" />
          2º
        </Badge>
      )
    } else if (position === 3) {
      return (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
          <Medal className="h-3 w-3 mr-1" />
          3º
        </Badge>
      )
    } else {
      return <Badge variant="outline">{position}º</Badge>
    }
  }

  const StickyFooter = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => setCurrentView("home")}
          className={`flex flex-col items-center gap-1 p-2 ${
            currentView === "home" ? "text-primary" : "text-gray-600 hover:text-black"
          }`}
        >
          <Target className="h-5 w-5" />
          <span className="text-xs">Batalhas</span>
        </button>
        <button
          onClick={() => setCurrentView("ranking")}
          className={`flex flex-col items-center gap-1 p-2 ${
            currentView === "ranking" ? "text-primary" : "text-gray-600 hover:text-black"
          }`}
        >
          <Trophy className="h-5 w-5" />
          <span className="text-xs">Ranking</span>
        </button>
        <button
          onClick={() => setCurrentView("profile")}
          className={`flex flex-col items-center gap-1 p-2 ${
            currentView === "profile" ? "text-primary" : "text-gray-600 hover:text-black"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Perfil</span>
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
    <div className="min-h-screen bg-background text-foreground pb-20">
      <CopyFeedback />

      {/* Header with back button and actions */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <ArrowLeft className="h-6 w-6 text-muted-foreground" />
        <div className="flex gap-2">
          <button
            onClick={() =>
              window.open(`https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`, "_blank")
            }
            className="p-2 bg-primary rounded-full"
          >
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </button>
          <div className="p-2 bg-primary rounded-full">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Business Banner with Logo */}
      <div className="relative bg-card text-card-foreground p-6 text-center border-b">
        <div className="mb-4">
          <div className="w-24 h-24 mx-auto mb-4 bg-background rounded-full p-2">
            <img src={businessInfo.logo || "/placeholder.svg"} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "serif" }}>
            {businessInfo.name}
          </h1>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
            ))}
            <span className="ml-2 text-yellow-400 font-bold">{businessInfo.rating}</span>
          </div>
          <p className="text-sm opacity-90">{businessInfo.reviewCount} avaliações</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm opacity-75">
            <MapPin className="h-4 w-4" />
            <span>{businessInfo.address}</span>
          </div>
          <p className="text-sm text-green-600 mt-1">{businessInfo.status}</p>
        </div>
      </div>

      {/* Fixed Navigation Tabs */}
      <div className="bg-card sticky top-0 z-40 border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "BATALHAS", label: "BATALHAS" },
            { id: "QUADRAS", label: "QUADRAS" },
            { id: "RANKING", label: "RANKING" },
            { id: "DETALHES", label: "DETALHES" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "BATALHAS" && (
          <div>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar batalhas..."
                className="pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Battles List */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-foreground uppercase">Batalhas Disponíveis</h3>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Carregando batalhas...</p>
                </div>
              ) : battles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4" />
                  <p className="mb-2">Nenhuma batalha disponível no momento.</p>
                  <p className="text-sm">Novas batalhas são criadas regularmente!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {battles
                    .filter((battle) => battle.status === "waiting")
                    .map((battle) => (
                      <Card
                        key={battle.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedBattle(battle)
                          setCurrentView("battle-details")
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="text-2xl">
                                {modalityOptions.find((m) => m.value === battle.modality)?.icon || "⚽"}
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{battle.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {modalityOptions.find((m) => m.value === battle.modality)?.label || battle.modality}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(battle.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-primary" />
                              <span>{battle.format}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-primary" />
                              <span>{battle.rules.replace("_", " ")}</span>
                            </div>
                            {battle.court && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{battle.court.name}</span>
                              </div>
                            )}
                            {battle.scheduled_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{new Date(battle.scheduled_time).toLocaleString("pt-BR")}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Máximo {battle.max_players} jogadores
                              </span>
                              <Button size="sm" className="bg-primary text-primary-foreground">
                                <Swords className="h-4 w-4 mr-1" />
                                Participar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "QUADRAS" && (
          <div>
            <h3 className="font-semibold mb-4 text-foreground uppercase">Nossas Quadras</h3>
            <div className="space-y-4">
              {courts.map((court) => (
                <Card key={court.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{court.name}</h4>
                        <p className="text-sm text-muted-foreground">{court.category}</p>
                        <p className="text-sm text-primary font-medium mt-1">
                          R$ {court.price_per_hour.toFixed(2)}/hora
                        </p>
                      </div>
                      <Badge
                        className={
                          court.status === "available"
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {court.status === "available" ? "Disponível" : "Ocupada"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "RANKING" && (
          <div>
            <h3 className="font-semibold mb-4 text-foreground uppercase">Top 10 Jogadores</h3>
            <div className="space-y-3">
              {userStats.map((stats, index) => (
                <Card key={stats.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRankBadge(index + 1)}
                        <div>
                          <h4 className="font-medium text-foreground">
                            {stats.user_email || `Jogador ${stats.user_id.slice(0, 8)}`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{stats.total_battles} batalhas</span>
                            <span className="text-green-600">{stats.wins}V</span>
                            <span className="text-red-600">{stats.losses}D</span>
                            <span className="text-yellow-600">{stats.draws}E</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="font-bold text-lg">{stats.ranking_points}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">{stats.win_rate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "DETALHES" && (
          <div className="space-y-6">
            {/* About Section */}
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Sobre</h3>
              <p className="text-muted-foreground leading-relaxed">{businessInfo.description}</p>
              <button
                onClick={() => copyToClipboard(businessInfo.description, "Descrição")}
                className="mt-2 flex items-center gap-2 text-primary text-sm hover:text-primary/80"
              >
                <Copy className="h-4 w-4" />
                Copiar descrição
              </button>
            </div>

            {/* Modalidades */}
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Modalidades Disponíveis</h3>
              <div className="grid grid-cols-2 gap-4">
                {modalityOptions.map((modality) => (
                  <Card key={modality.value}>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{modality.icon}</div>
                      <span className="text-sm font-medium">{modality.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Nosso Endereço</h3>
              <p className="text-foreground">{businessInfo.address}</p>
              <button
                onClick={() => copyToClipboard(businessInfo.address, "Endereço")}
                className="mt-2 flex items-center gap-2 text-primary text-sm hover:text-primary/80"
              >
                <Copy className="h-4 w-4" />
                Copiar endereço
              </button>
            </div>
          </div>
        )}
      </div>

      <StickyFooter />
    </div>
  )

  const renderBattleDetails = () => {
    if (!selectedBattle) return null

    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <CopyFeedback />

        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-card border-b">
          <ArrowLeft className="h-6 w-6 cursor-pointer" onClick={() => setCurrentView("home")} />
          <h1 className="text-lg font-medium">Detalhes da Batalha</h1>
          <div></div>
        </div>

        <div className="p-4">
          {/* Battle Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {modalityOptions.find((m) => m.value === selectedBattle.modality)?.icon || "⚽"}
                  </div>
                  <div>
                    <CardTitle>{selectedBattle.name}</CardTitle>
                    <p className="text-muted-foreground">
                      {modalityOptions.find((m) => m.value === selectedBattle.modality)?.label ||
                        selectedBattle.modality}
                    </p>
                  </div>
                </div>
                {getStatusBadge(selectedBattle.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Formato</p>
                  <p className="font-medium">{selectedBattle.format}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Regras</p>
                  <p className="font-medium">{selectedBattle.rules.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Máximo de Jogadores</p>
                  <p className="font-medium">{selectedBattle.max_players}</p>
                </div>
                {selectedBattle.court && (
                  <div>
                    <p className="text-sm text-muted-foreground">Quadra</p>
                    <p className="font-medium">{selectedBattle.court.name}</p>
                  </div>
                )}
              </div>

              {selectedBattle.scheduled_time && (
                <div>
                  <p className="text-sm text-muted-foreground">Data e Horário</p>
                  <p className="font-medium">{new Date(selectedBattle.scheduled_time).toLocaleString("pt-BR")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Join Battle Form */}
          {selectedBattle.status === "waiting" && (
            <Card>
              <CardHeader>
                <CardTitle>Participar da Batalha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <Input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telefone/WhatsApp</label>
                  <Input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    // Here you would typically send the join request to your backend
                    alert("Solicitação de participação enviada! Você receberá uma confirmação em breve.")
                    setCurrentView("home")
                  }}
                >
                  <Swords className="h-4 w-4 mr-2" />
                  Confirmar Participação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <StickyFooter />
      </div>
    )
  }

  const renderRanking = () => (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <CopyFeedback />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <ArrowLeft className="h-6 w-6 cursor-pointer" onClick={() => setCurrentView("home")} />
        <h1 className="text-lg font-medium">Ranking Geral</h1>
        <div></div>
      </div>

      <div className="p-4">
        {/* Top 3 Podium */}
        {userStats.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-4 mb-6">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-400/10 rounded-full flex items-center justify-center mb-2">
                  <Medal className="h-8 w-8 text-gray-600" />
                </div>
                <p className="font-medium text-sm">
                  {userStats[1]?.user_email?.split("@")[0] || `Jogador ${userStats[1]?.user_id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-muted-foreground">{userStats[1]?.ranking_points} pts</p>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-2">
                  <Crown className="h-10 w-10 text-yellow-600" />
                </div>
                <p className="font-medium">
                  {userStats[0]?.user_email?.split("@")[0] || `Jogador ${userStats[0]?.user_id.slice(0, 8)}`}
                </p>
                <p className="text-sm text-yellow-600 font-bold">{userStats[0]?.ranking_points} pts</p>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-2">
                  <Medal className="h-8 w-8 text-orange-600" />
                </div>
                <p className="font-medium text-sm">
                  {userStats[2]?.user_email?.split("@")[0] || `Jogador ${userStats[2]?.user_id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-muted-foreground">{userStats[2]?.ranking_points} pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Classificação Completa</h3>
          {userStats.map((stats, index) => (
            <Card key={stats.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankBadge(index + 1)}
                    <div>
                      <h4 className="font-medium text-foreground">
                        {stats.user_email?.split("@")[0] || `Jogador ${stats.user_id.slice(0, 8)}`}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{stats.total_battles} batalhas</span>
                        <span className="text-green-600">{stats.wins}V</span>
                        <span className="text-red-600">{stats.losses}D</span>
                        <span className="text-yellow-600">{stats.draws}E</span>
                        <span>Saldo: {stats.goals_for - stats.goals_against}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">{stats.ranking_points}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">{stats.win_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <StickyFooter />
    </div>
  )

  const renderProfile = () => (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <CopyFeedback />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <ArrowLeft className="h-6 w-6 cursor-pointer" onClick={() => setCurrentView("home")} />
        <h1 className="text-lg font-medium">Meu Perfil</h1>
        <div></div>
      </div>

      <div className="p-4">
        {/* Profile Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo</label>
              <Input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefone/WhatsApp</label>
              <Input
                type="tel"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Modalidade Preferida</label>
              <select
                value={userProfile.preferredModality}
                onChange={(e) => setUserProfile({ ...userProfile, preferredModality: e.target.value })}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {modalityOptions.map((modality) => (
                  <option key={modality.value} value={modality.value}>
                    {modality.icon} {modality.label}
                  </option>
                ))}
              </select>
            </div>

            <Button className="w-full">Salvar Perfil</Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground">Batalhas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-muted-foreground">Vitórias</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">1000</p>
                <p className="text-sm text-muted-foreground">Pontos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">-</p>
                <p className="text-sm text-muted-foreground">Posição</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StickyFooter />
    </div>
  )

  // Main render logic
  switch (currentView) {
    case "battle-details":
      return renderBattleDetails()
    case "ranking":
      return renderRanking()
    case "profile":
      return renderProfile()
    default:
      return renderHomeView()
  }
}
