"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Users, Clock, Trophy, Zap, Search } from "lucide-react"
import BattleRoom from "./battle-room"

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
  created_at: string
}

interface BattleListProps {
  onBack: () => void
}

export default function BattleList({ onBack }: BattleListProps) {
  const [battles, setBattles] = useState<Battle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBattle, setSelectedBattle] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchBattles()

    // Set up real-time subscription for battles
    const subscription = supabase
      .channel("battles")
      .on("postgres_changes", { event: "*", schema: "public", table: "battles" }, (payload) => {
        console.log("[v0] Battles updated:", payload)
        fetchBattles()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchBattles = async () => {
    try {
      console.log("[v0] Fetching battles...")
      const { data, error } = await supabase
        .from("battles")
        .select("*")
        .in("status", ["open", "in_progress"])
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
      setIsLoading(false)
    }
  }

  const filteredBattles = battles.filter(
    (battle) =>
      battle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      battle.format.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (selectedBattle) {
    return <BattleRoom battleId={selectedBattle} onBack={() => setSelectedBattle(null)} />
  }

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-orange-600 text-white">
        <h1 className="text-lg font-medium">⚔️ Batalhas</h1>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <span className="text-sm">Competições</span>
        </div>
      </div>

      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar batalhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Battle Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["Todas", "1x1", "2x2", "5x5", "Society", "Futvôlei"].map((category) => (
            <button
              key={category}
              className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-orange-100 hover:text-orange-600"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Battles List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-black uppercase mb-4">Batalhas Disponíveis</h3>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p>Carregando batalhas...</p>
            </div>
          ) : filteredBattles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="mb-2">
                {searchTerm ? "Nenhuma batalha encontrada" : "Nenhuma batalha disponível no momento"}
              </p>
              <p className="text-sm">
                {searchTerm ? "Tente pesquisar por outros termos" : "Aguarde novas batalhas serem criadas"}
              </p>
            </div>
          ) : (
            filteredBattles.map((battle) => (
              <div
                key={battle.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-black">{battle.name}</h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        battle.status === "open" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {battle.status === "open" ? "Aberta" : "Em andamento"}
                    </span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{battle.format}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{battle.rules}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {battle.current_participants}/{battle.max_participants}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(battle.scheduled_time).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(battle.current_participants / battle.max_participants) * 100}%` }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                    onClick={() => setSelectedBattle(battle.id)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {battle.status === "open" ? "Entrar na Batalha" : "Ver Batalha"}
                  </Button>
                  {battle.current_participants === 0 && (
                    <Button
                      variant="outline"
                      className="px-4 bg-transparent"
                      onClick={() => {
                        // Add to favorites functionality
                        console.log("Added to favorites:", battle.id)
                      }}
                    >
                      ⭐
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3 text-black">Ações Rápidas</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => {
                // Filter by user's preferred format
                console.log("Filter by preferred format")
              }}
            >
              <Trophy className="h-4 w-4" />
              Minhas Modalidades
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => {
                // Show battle history
                console.log("Show battle history")
              }}
            >
              <Clock className="h-4 w-4" />
              Histórico
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
