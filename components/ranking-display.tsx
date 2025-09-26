"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trophy, Users, Target, Award } from "lucide-react"

interface Player {
  id: string
  name: string
  avatar_url?: string
  total_battles: number
  wins: number
  losses: number
  draws: number
  points: number
  win_rate: number
  goals_scored: number
  goals_conceded: number
  favorite_position: string
}

interface RankingDisplayProps {
  onBack: () => void
}

export default function RankingDisplay({ onBack }: RankingDisplayProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("geral")
  const [selectedPeriod, setSelectedPeriod] = useState("all")

  const supabase = createClient()

  useEffect(() => {
    fetchRanking()
  }, [selectedCategory, selectedPeriod])

  const fetchRanking = async () => {
    try {
      console.log("[v0] Fetching ranking...")

      // This would be a more complex query in a real app
      // For now, we'll simulate the data
      const mockPlayers: Player[] = [
        {
          id: "1",
          name: "João Silva",
          total_battles: 25,
          wins: 18,
          losses: 5,
          draws: 2,
          points: 120,
          win_rate: 72,
          goals_scored: 45,
          goals_conceded: 23,
          favorite_position: "Atacante",
        },
        {
          id: "2",
          name: "Maria Santos",
          total_battles: 22,
          wins: 15,
          losses: 6,
          draws: 1,
          points: 95,
          win_rate: 68,
          goals_scored: 38,
          goals_conceded: 28,
          favorite_position: "Meio-campo",
        },
        {
          id: "3",
          name: "Pedro Costa",
          total_battles: 20,
          wins: 12,
          losses: 7,
          draws: 1,
          points: 78,
          win_rate: 60,
          goals_scored: 32,
          goals_conceded: 25,
          favorite_position: "Defesa",
        },
        {
          id: "4",
          name: "Ana Oliveira",
          total_battles: 18,
          wins: 11,
          losses: 6,
          draws: 1,
          points: 72,
          win_rate: 61,
          goals_scored: 29,
          goals_conceded: 22,
          favorite_position: "Goleiro",
        },
        {
          id: "5",
          name: "Carlos Lima",
          total_battles: 16,
          wins: 9,
          losses: 6,
          draws: 1,
          points: 65,
          win_rate: 56,
          goals_scored: 24,
          goals_conceded: 28,
          favorite_position: "Atacante",
        },
      ]

      setPlayers(mockPlayers)
    } catch (error) {
      console.error("[v0] Error fetching ranking:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { id: "geral", name: "Geral", icon: Trophy },
    { id: "society", name: "Society", icon: Users },
    { id: "futvolei", name: "Futvôlei", icon: Target },
    { id: "tenis", name: "Tênis", icon: Award },
  ]

  const periods = [
    { id: "all", name: "Todos os tempos" },
    { id: "month", name: "Este mês" },
    { id: "week", name: "Esta semana" },
  ]

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <span className="text-2xl">🥇</span>
      case 2:
        return <span className="text-2xl">🥈</span>
      case 3:
        return <span className="text-2xl">🥉</span>
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">{position}</span>
          </div>
        )
    }
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600"
      default:
        return "bg-gray-50"
    }
  }

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
        <h1 className="text-lg font-medium">🏆 Ranking</h1>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <span className="text-sm">Competições</span>
        </div>
      </div>

      <div className="p-4">
        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedPeriod === period.id ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>

        {/* Podium */}
        {players.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mb-2 flex items-center justify-center">
                <span className="text-2xl">🥈</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 min-h-[80px] flex flex-col justify-center">
                <p className="text-sm font-medium">{players[1].name}</p>
                <p className="text-xs text-gray-500">{players[1].points} pts</p>
                <p className="text-xs text-gray-500">{players[1].win_rate}% vitórias</p>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-2 flex items-center justify-center">
                <span className="text-3xl">🥇</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 min-h-[80px] flex flex-col justify-center">
                <p className="text-sm font-medium">{players[0].name}</p>
                <p className="text-xs text-yellow-700">{players[0].points} pts</p>
                <p className="text-xs text-yellow-700">{players[0].win_rate}% vitórias</p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-2 flex items-center justify-center">
                <span className="text-2xl">🥉</span>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 min-h-[80px] flex flex-col justify-center">
                <p className="text-sm font-medium">{players[2].name}</p>
                <p className="text-xs text-orange-700">{players[2].points} pts</p>
                <p className="text-xs text-orange-700">{players[2].win_rate}% vitórias</p>
              </div>
            </div>
          </div>
        )}

        {/* Ranking List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-black uppercase mb-4">Classificação Completa</h3>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p>Carregando ranking...</p>
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  index < 3 ? getPositionColor(index + 1) : "bg-gray-50 border-gray-200"
                } ${index < 3 ? "text-white" : "text-black"}`}
              >
                <div className="flex items-center gap-4">
                  {getRankIcon(index + 1)}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {player.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className={`text-xs ${index < 3 ? "text-white opacity-80" : "text-gray-500"}`}>
                        {player.total_battles} batalhas • {player.favorite_position}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">{player.points}</p>
                  <p className={`text-xs ${index < 3 ? "text-white opacity-80" : "text-gray-500"}`}>
                    {player.wins}V-{player.losses}D-{player.draws}E
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-4 text-black">Estatísticas Gerais</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-xl text-blue-600">{players.length}</span>
              </div>
              <p className="text-sm text-gray-600">Jogadores Ativos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-bold text-xl text-green-600">
                  {players.reduce((sum, p) => sum + p.total_battles, 0)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Batalhas Realizadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
