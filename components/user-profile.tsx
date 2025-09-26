"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, TrendingUp, Medal, Crown, Swords, Users, Edit, Save, Camera } from "lucide-react"

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
  created_at: string
  updated_at: string
}

interface Battle {
  id: string
  name: string
  modality: string
  format: string
  status: "waiting" | "in_progress" | "completed" | "cancelled"
  scheduled_time?: string
  created_at: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  bio?: string
  preferred_modality?: string
  avatar_url?: string
  created_at: string
}

export default function UserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userBattles, setUserBattles] = useState<Battle[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    bio: "",
    preferred_modality: "society",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // In a real app, you would get the user ID from authentication
      const mockUserId = "user-123"

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", mockUserId)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("[v0] Error fetching user profile:", profileError)
      } else if (profileData) {
        setUserProfile(profileData)
        setEditForm({
          name: profileData.name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          preferred_modality: profileData.preferred_modality || "society",
        })
      }

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", mockUserId)
        .single()

      if (statsError && statsError.code !== "PGRST116") {
        console.error("[v0] Error fetching user stats:", statsError)
      } else if (statsData) {
        setUserStats(statsData)
      }

      // Fetch user battles
      const { data: battlesData, error: battlesError } = await supabase
        .from("battle_participants")
        .select(`
          battle_id,
          battles(*)
        `)
        .eq("user_id", mockUserId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (battlesError) {
        console.error("[v0] Error fetching user battles:", battlesError)
      } else if (battlesData) {
        setUserBattles(battlesData.map((item: any) => item.battles).filter(Boolean))
      }
    } catch (error) {
      console.error("[v0] Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const mockUserId = "user-123"

      const { error } = await supabase.from("user_profiles").upsert({
        id: mockUserId,
        ...editForm,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      await fetchUserData()
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
    }
  }

  const getRankPosition = () => {
    // This would typically come from a ranking query
    return userStats ? Math.floor(Math.random() * 50) + 1 : null
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting: { label: "Aguardando", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      in_progress: { label: "Em Andamento", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
      completed: { label: "Finalizada", color: "bg-green-500/10 text-green-600 border-green-500/20" },
      cancelled: { label: "Cancelada", color: "bg-red-500/10 text-red-600 border-red-500/20" },
    }[status]

    return <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
  }

  const modalityOptions = [
    { value: "society", label: "Society", icon: "⚽" },
    { value: "futvolei", label: "Futvôlei", icon: "🏐" },
    { value: "tenis", label: "Tênis", icon: "🎾" },
    { value: "basquete", label: "Basquete", icon: "🏀" },
    { value: "volei", label: "Vôlei", icon: "🏐" },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {userProfile?.name?.charAt(0) || editForm.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 rounded-full p-2 bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nome completo"
                    className="text-lg font-semibold"
                  />
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Telefone"
                  />
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                  <select
                    value={editForm.preferred_modality}
                    onChange={(e) => setEditForm({ ...editForm, preferred_modality: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background"
                  >
                    {modalityOptions.map((modality) => (
                      <option key={modality.value} value={modality.value}>
                        {modality.icon} {modality.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold">{userProfile?.name || editForm.name || "Usuário"}</h1>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                  <p className="text-muted-foreground mb-2">{userProfile?.email}</p>
                  {userProfile?.phone && <p className="text-muted-foreground mb-2">{userProfile.phone}</p>}
                  {userProfile?.bio && <p className="text-foreground mb-4">{userProfile.bio}</p>}
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {modalityOptions.find((m) => m.value === userProfile?.preferred_modality)?.icon}{" "}
                      {modalityOptions.find((m) => m.value === userProfile?.preferred_modality)?.label || "Society"}
                    </Badge>
                    {getRankPosition() && (
                      <Badge className="bg-primary/10 text-primary">
                        <Trophy className="h-3 w-3 mr-1" />#{getRankPosition()}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats and Content Tabs */}
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="battles">Batalhas</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Swords className="h-8 w-8 text-primary" />
                </div>
                <p className="text-2xl font-bold">{userStats?.total_battles || 0}</p>
                <p className="text-sm text-muted-foreground">Batalhas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{userStats?.wins || 0}</p>
                <p className="text-sm text-muted-foreground">Vitórias</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <p className="text-2xl font-bold">{userStats?.ranking_points || 1000}</p>
                <p className="text-sm text-muted-foreground">Pontos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{userStats?.win_rate.toFixed(1) || "0.0"}%</p>
                <p className="text-sm text-muted-foreground">Aproveitamento</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vitórias</span>
                  <span className="font-medium text-green-600">{userStats?.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Derrotas</span>
                  <span className="font-medium text-red-600">{userStats?.losses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empates</span>
                  <span className="font-medium text-yellow-600">{userStats?.draws || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Aproveitamento</span>
                  <span className="font-medium">{userStats?.win_rate.toFixed(1) || "0.0"}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gols</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gols Marcados</span>
                  <span className="font-medium text-green-600">{userStats?.goals_for || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gols Sofridos</span>
                  <span className="font-medium text-red-600">{userStats?.goals_against || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Saldo de Gols</span>
                  <span
                    className={`font-medium ${
                      (userStats?.goals_for || 0) - (userStats?.goals_against || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(userStats?.goals_for || 0) - (userStats?.goals_against || 0) > 0 ? "+" : ""}
                    {(userStats?.goals_for || 0) - (userStats?.goals_against || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="battles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Batalhas</CardTitle>
              <CardDescription>Suas últimas participações em batalhas</CardDescription>
            </CardHeader>
            <CardContent>
              {userBattles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Swords className="h-12 w-12 mx-auto mb-4" />
                  <p className="mb-2">Nenhuma batalha encontrada</p>
                  <p className="text-sm">Participe de batalhas para ver seu histórico aqui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBattles.map((battle) => (
                    <div key={battle.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{battle.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {modalityOptions.find((m) => m.value === battle.modality)?.label || battle.modality} •{" "}
                          {battle.format}
                        </p>
                        {battle.scheduled_time && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(battle.scheduled_time).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(battle.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas</CardTitle>
              <CardDescription>Suas medalhas e marcos alcançados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Sample achievements */}
                <div className="text-center p-4 border rounded-lg opacity-50">
                  <Medal className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Primeira Vitória</p>
                  <p className="text-xs text-muted-foreground">Ganhe sua primeira batalha</p>
                </div>

                <div className="text-center p-4 border rounded-lg opacity-50">
                  <Crown className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Rei da Arena</p>
                  <p className="text-xs text-muted-foreground">Alcance o 1º lugar no ranking</p>
                </div>

                <div className="text-center p-4 border rounded-lg opacity-50">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Veterano</p>
                  <p className="text-xs text-muted-foreground">Participe de 50 batalhas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
