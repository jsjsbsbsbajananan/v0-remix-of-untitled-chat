"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Calendar,
  Users,
  Camera,
  Swords,
  MapPin,
  Star,
  Play,
  ChevronRight,
  Menu,
  Bell,
  Search,
} from "lucide-react"
import Image from "next/image"

interface Player {
  id: string
  name: string
  avatar: string
  rank: number
  points: number
  sport: string
}

interface Court {
  id: string
  name: string
  type: string
  image: string
  available: boolean
  rating: number
}

interface Battle {
  id: string
  title: string
  date: string
  participants: number
  maxParticipants: number
  prize: string
  image: string
}

export default function SportsApp() {
  const [activeTab, setActiveTab] = useState("home")

  // Mock data
  const topPlayers: Player[] = [
    { id: "1", name: "Carlos Silva", avatar: "/car-logo.png", rank: 1, points: 2850, sport: "Futebol" },
    { id: "2", name: "Ana Santos", avatar: "/car-logo.png", rank: 2, points: 2720, sport: "Vôlei" },
    { id: "3", name: "João Costa", avatar: "/car-logo.png", rank: 3, points: 2650, sport: "Tênis" },
  ]

  const courts: Court[] = [
    { id: "1", name: "Quadra Central", type: "Futebol", image: "/soccer-field.png", available: true, rating: 4.8 },
    {
      id: "2",
      name: "Arena Beach",
      type: "Vôlei de Praia",
      image: "/beach-volleyball-court.png",
      available: false,
      rating: 4.9,
    },
    { id: "3", name: "Court Premium", type: "Tênis", image: "/outdoor-tennis-court.png", available: true, rating: 4.7 },
  ]

  const battles: Battle[] = [
    {
      id: "1",
      title: "Torneio de Verão",
      date: "2025-01-15",
      participants: 12,
      maxParticipants: 16,
      prize: "R$ 1.000",
      image: "/sports-center-banner.jpg",
    },
    {
      id: "2",
      title: "Liga dos Campeões",
      date: "2025-01-20",
      participants: 8,
      maxParticipants: 12,
      prize: "R$ 2.500",
      image: "/sports-center-banner.jpg",
    },
  ]

  const renderHome = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative h-64 rounded-2xl overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <Image src="/sports-center-banner.jpg" alt="Sports Center" fill className="object-cover mix-blend-overlay" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao <span className="text-gradient">SportCenter</span>
          </h1>
          <p className="text-white/80 mb-4">Sua plataforma completa para esportes</p>
          <Button className="w-fit bg-primary hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Começar Agora
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Jogadores</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Quadras</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <Swords className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Batalhas</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <Camera className="w-8 h-8 text-chart-4 mx-auto mb-2" />
            <p className="text-2xl font-bold">342</p>
            <p className="text-sm text-muted-foreground">Fotos</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Players Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Top Jogadores
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("ranking")}>
            Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPlayers.slice(0, 3).map((player) => (
            <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {player.rank}
                </Badge>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={player.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {player.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-muted-foreground">{player.sport}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{player.points}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const renderRanking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ranking de Jogadores</h2>
        <Button variant="outline" size="sm">
          <Trophy className="w-4 h-4 mr-2" />
          Filtrar por Esporte
        </Button>
      </div>

      <div className="space-y-3">
        {topPlayers.map((player, index) => (
          <Card key={player.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge
                    variant={index === 0 ? "default" : "secondary"}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-primary" : index === 1 ? "bg-secondary" : "bg-accent"
                    }`}
                  >
                    {player.rank}
                  </Badge>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={player.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {player.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.sport}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{player.points}</p>
                  <p className="text-sm text-muted-foreground">pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderCourts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quadras Disponíveis</h2>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Agendar
        </Button>
      </div>

      <div className="grid gap-4">
        {courts.map((court) => (
          <Card key={court.id} className="card-hover overflow-hidden">
            <div className="relative h-48">
              <Image src={court.image || "/placeholder.svg"} alt={court.name} fill className="object-cover" />
              <div className="absolute top-4 right-4">
                <Badge variant={court.available ? "default" : "destructive"}>
                  {court.available ? "Disponível" : "Ocupada"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{court.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{court.rating}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{court.type}</p>
              <Button className="w-full" disabled={!court.available}>
                {court.available ? "Reservar Agora" : "Indisponível"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderBattles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Batalhas e Torneios</h2>
        <Button>
          <Swords className="w-4 h-4 mr-2" />
          Criar Batalha
        </Button>
      </div>

      <div className="space-y-4">
        {battles.map((battle) => (
          <Card key={battle.id} className="card-hover overflow-hidden">
            <div className="relative h-32">
              <Image src={battle.image || "/placeholder.svg"} alt={battle.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Badge className="bg-primary">{battle.prize}</Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{battle.title}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span>📅 {new Date(battle.date).toLocaleDateString("pt-BR")}</span>
                <span>
                  👥 {battle.participants}/{battle.maxParticipants}
                </span>
              </div>
              <Button className="w-full">Participar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderGallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Galeria de Fotos</h2>
        <Button>
          <Camera className="w-4 h-4 mr-2" />
          Adicionar Foto
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="card-hover overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={i % 2 === 0 ? "/soccer-field.png" : "/beach-volleyball-court.png"}
                alt={`Foto ${i}`}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium">Jogo do dia {i}</p>
              <p className="text-xs text-muted-foreground">Há 2 horas</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "ranking":
        return renderRanking()
      case "courts":
        return renderCourts()
      case "battles":
        return renderBattles()
      case "gallery":
        return renderGallery()
      default:
        return renderHome()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/car-logo.png" alt="SportCenter Logo" width={40} height={40} className="rounded-lg" />
              <h1 className="text-xl font-bold text-gradient">SportCenter</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {[
              { id: "home", icon: Trophy, label: "Início" },
              { id: "ranking", icon: Users, label: "Ranking" },
              { id: "courts", icon: MapPin, label: "Quadras" },
              { id: "battles", icon: Swords, label: "Batalhas" },
              { id: "gallery", icon: Camera, label: "Galeria" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20" />
    </div>
  )
}
