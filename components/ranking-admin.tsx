"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createBrowserClient } from "@supabase/ssr"
import { Trophy, Target, RotateCcw, Users, TrendingUp, Medal, Crown } from "lucide-react"

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
  user_email?: string
}

export default function RankingAdmin() {
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .order("ranking_points", { ascending: false })

      if (error) throw error
      setUserStats(data || [])
    } catch (error) {
      console.error("[v0] Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetRanking = async () => {
    try {
      const { error } = await supabase
        .from("user_stats")
        .update({
          total_battles: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          goals_for: 0,
          goals_against: 0,
          win_rate: 0,
          ranking_points: 1000,
        })
        .neq("id", "never-match") // Update all records

      if (error) throw error
      await fetchUserStats()
      setResetDialogOpen(false)
    } catch (error) {
      console.error("[v0] Error resetting ranking:", error)
    }
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

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return "text-green-600"
    if (winRate >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando ranking...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking de Jogadores
              </CardTitle>
              <CardDescription>Acompanhe o desempenho e classificação dos jogadores</CardDescription>
            </div>
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar Ranking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">Resetar Ranking</DialogTitle>
                  <DialogDescription>
                    Esta ação irá zerar todas as estatísticas dos jogadores. Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-red-600 mb-2">⚠️ Atenção!</h4>
                    <p className="text-red-600 text-sm">
                      Ao resetar o ranking, todos os jogadores terão suas estatísticas zeradas:
                    </p>
                    <ul className="text-red-600 text-sm mt-2 list-disc list-inside">
                      <li>Batalhas jogadas</li>
                      <li>Vitórias, derrotas e empates</li>
                      <li>Gols marcados e sofridos</li>
                      <li>Pontos de ranking (voltarão para 1000)</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleResetRanking}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Confirmar Reset
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {userStats.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum jogador no ranking</h3>
              <p className="text-muted-foreground mb-4">Os jogadores aparecerão aqui após participarem de batalhas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Batalhas</TableHead>
                  <TableHead>V/D/E</TableHead>
                  <TableHead>Aproveitamento</TableHead>
                  <TableHead>Saldo de Gols</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStats.map((stats, index) => (
                  <TableRow key={stats.id}>
                    <TableCell>{getRankBadge(index + 1)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {stats.user_email || `Jogador ${stats.user_id.slice(0, 8)}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-lg">{stats.ranking_points}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{stats.total_battles}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{stats.wins}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-red-600 font-medium">{stats.losses}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-yellow-600 font-medium">{stats.draws}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`h-4 w-4 ${getWinRateColor(stats.win_rate)}`} />
                        <span className={`font-medium ${getWinRateColor(stats.win_rate)}`}>
                          {stats.win_rate.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span
                          className={stats.goals_for - stats.goals_against >= 0 ? "text-green-600" : "text-red-600"}
                        >
                          {stats.goals_for - stats.goals_against > 0 ? "+" : ""}
                          {stats.goals_for - stats.goals_against}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({stats.goals_for}/{stats.goals_against})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Jogadores</p>
                <p className="text-2xl font-bold text-foreground">{userStats.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Batalhas Totais</p>
                <p className="text-2xl font-bold text-foreground">
                  {userStats.reduce((acc, stats) => acc + stats.total_battles, 0)}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Líder Atual</p>
                <p className="text-xl font-bold text-foreground">
                  {userStats.length > 0
                    ? userStats[0].user_email || `Jogador ${userStats[0].user_id.slice(0, 8)}`
                    : "Nenhum"}
                </p>
                {userStats.length > 0 && (
                  <p className="text-xs text-yellow-600">{userStats[0].ranking_points} pontos</p>
                )}
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aproveitamento Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  {userStats.length > 0
                    ? `${(userStats.reduce((acc, stats) => acc + stats.win_rate, 0) / userStats.length).toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
