"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Trophy, Clock, Plus, Minus, CheckCircle, User } from "lucide-react"

interface BattleRoomProps {
  battleId: string
  onBack: () => void
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
  team1_score: number
  team2_score: number
  team1_players: string[]
  team2_players: string[]
  best_of: number
  current_set: number
}

interface BattleParticipant {
  id: string
  battle_id: string
  user_id: string
  team: number
  player_name: string
  joined_at: string
}

export default function BattleRoom({ battleId, onBack }: BattleRoomProps) {
  const [battle, setBattle] = useState<Battle | null>(null)
  const [participants, setParticipants] = useState<BattleParticipant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string>("user123") // This should come from auth
  const [userTeam, setUserTeam] = useState<number | null>(null)
  const [battlePhase, setBattlePhase] = useState<"waiting" | "playing" | "scoring" | "finished">("waiting")
  const [team1Score, setTeam1Score] = useState(0)
  const [team2Score, setTeam2Score] = useState(0)
  const [pendingScore, setPendingScore] = useState<{ team1: number; team2: number } | null>(null)
  const [scoreConfirmations, setScoreConfirmations] = useState<{ team1: boolean; team2: boolean }>({
    team1: false,
    team2: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchBattleData()
    fetchParticipants()

    // Set up real-time subscriptions
    const battleSubscription = supabase
      .channel(`battle-${battleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battles", filter: `id=eq.${battleId}` },
        (payload) => {
          console.log("[v0] Battle updated:", payload)
          fetchBattleData()
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battle_participants", filter: `battle_id=eq.${battleId}` },
        (payload) => {
          console.log("[v0] Participants updated:", payload)
          fetchParticipants()
        },
      )
      .subscribe()

    return () => {
      battleSubscription.unsubscribe()
    }
  }, [battleId])

  const fetchBattleData = async () => {
    try {
      const { data, error } = await supabase.from("battles").select("*").eq("id", battleId).single()

      if (error) {
        console.error("[v0] Error fetching battle:", error)
        return
      }

      setBattle(data)
      setTeam1Score(data.team1_score || 0)
      setTeam2Score(data.team2_score || 0)

      // Determine battle phase based on status and participants
      if (data.status === "finished") {
        setBattlePhase("finished")
      } else if (data.status === "in_progress") {
        setBattlePhase("playing")
      } else {
        setBattlePhase("waiting")
      }
    } catch (error) {
      console.error("[v0] Error fetching battle:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("battle_participants")
        .select("*")
        .eq("battle_id", battleId)
        .order("joined_at", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching participants:", error)
        return
      }

      setParticipants(data || [])

      // Check if current user is participating and in which team
      const userParticipation = data?.find((p) => p.user_id === currentUser)
      if (userParticipation) {
        setUserTeam(userParticipation.team)
      }
    } catch (error) {
      console.error("[v0] Error fetching participants:", error)
    }
  }

  const joinBattle = async (team: number) => {
    try {
      const { error } = await supabase.from("battle_participants").insert({
        battle_id: battleId,
        user_id: currentUser,
        team: team,
        player_name: `Jogador ${currentUser.slice(-3)}`, // This should come from user profile
        joined_at: new Date().toISOString(),
      })

      if (error) {
        console.error("[v0] Error joining battle:", error)
        return
      }

      // Update battle participant count
      if (battle) {
        const { error: updateError } = await supabase
          .from("battles")
          .update({
            current_participants: battle.current_participants + 1,
            status: battle.current_participants + 1 >= battle.max_participants ? "in_progress" : "open",
          })
          .eq("id", battleId)

        if (updateError) {
          console.error("[v0] Error updating battle:", updateError)
        }
      }
    } catch (error) {
      console.error("[v0] Error joining battle:", error)
    }
  }

  const leaveBattle = async () => {
    try {
      const { error } = await supabase
        .from("battle_participants")
        .delete()
        .eq("battle_id", battleId)
        .eq("user_id", currentUser)

      if (error) {
        console.error("[v0] Error leaving battle:", error)
        return
      }

      // Update battle participant count
      if (battle) {
        const { error: updateError } = await supabase
          .from("battles")
          .update({
            current_participants: Math.max(0, battle.current_participants - 1),
            status: "open",
          })
          .eq("id", battleId)

        if (updateError) {
          console.error("[v0] Error updating battle:", updateError)
        }
      }

      setUserTeam(null)
    } catch (error) {
      console.error("[v0] Error leaving battle:", error)
    }
  }

  const submitScore = async (team1: number, team2: number) => {
    if (!userTeam) return

    setPendingScore({ team1, team2 })

    // Mark this team as having confirmed the score
    const newConfirmations = { ...scoreConfirmations }
    newConfirmations[userTeam === 1 ? "team1" : "team2"] = true
    setScoreConfirmations(newConfirmations)

    // If both teams have confirmed the same score, update the battle
    if (newConfirmations.team1 && newConfirmations.team2) {
      try {
        const { error } = await supabase
          .from("battles")
          .update({
            team1_score: team1,
            team2_score: team2,
            current_set: (battle?.current_set || 1) + 1,
            status: determineWinner(team1, team2, battle?.best_of || 1) ? "finished" : "in_progress",
          })
          .eq("id", battleId)

        if (error) {
          console.error("[v0] Error updating score:", error)
          return
        }

        // Reset confirmations for next set
        setScoreConfirmations({ team1: false, team2: false })
        setPendingScore(null)
      } catch (error) {
        console.error("[v0] Error updating score:", error)
      }
    }
  }

  const determineWinner = (team1Score: number, team2Score: number, bestOf: number): string | null => {
    const setsToWin = Math.ceil(bestOf / 2)
    if (team1Score >= setsToWin) return "team1"
    if (team2Score >= setsToWin) return "team2"
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando batalha...</p>
        </div>
      </div>
    )
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Batalha não encontrada</p>
          <Button onClick={onBack} className="bg-orange-600 text-white hover:bg-orange-700">
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  const team1Participants = participants.filter((p) => p.team === 1)
  const team2Participants = participants.filter((p) => p.team === 2)

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-orange-600 text-white">
        <ArrowLeft className="h-6 w-6 text-white cursor-pointer" onClick={onBack} />
        <h1 className="text-lg font-medium">{battle.name}</h1>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="text-sm">
            {battle.current_participants}/{battle.max_participants}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Battle Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Formato:</span>
            <span className="font-medium">{battle.format}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Regras:</span>
            <span className="font-medium">{battle.rules}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Horário:</span>
            <span className="font-medium">
              {new Date(battle.scheduled_time).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                battle.status === "open"
                  ? "bg-green-100 text-green-800"
                  : battle.status === "in_progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {battle.status === "open"
                ? "Aguardando jogadores"
                : battle.status === "in_progress"
                  ? "Em andamento"
                  : "Finalizada"}
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Team 1 */}
          <div className="border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-600">Time 1</h3>
              <span className="text-2xl font-bold text-blue-600">{team1Score}</span>
            </div>
            <div className="space-y-2 mb-3">
              {team1Participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm">{participant.player_name}</span>
                </div>
              ))}
            </div>
            {battlePhase === "waiting" && team1Participants.length < battle.max_participants / 2 && userTeam !== 2 && (
              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
                onClick={() => (userTeam === 1 ? leaveBattle() : joinBattle(1))}
              >
                {userTeam === 1 ? "Sair do Time" : "Entrar no Time 1"}
              </Button>
            )}
          </div>

          {/* Team 2 */}
          <div className="border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-red-600">Time 2</h3>
              <span className="text-2xl font-bold text-red-600">{team2Score}</span>
            </div>
            <div className="space-y-2 mb-3">
              {team2Participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-red-600" />
                  </div>
                  <span className="text-sm">{participant.player_name}</span>
                </div>
              ))}
            </div>
            {battlePhase === "waiting" && team2Participants.length < battle.max_participants / 2 && userTeam !== 1 && (
              <Button
                className="w-full bg-red-600 text-white hover:bg-red-700 text-sm"
                onClick={() => (userTeam === 2 ? leaveBattle() : joinBattle(2))}
              >
                {userTeam === 2 ? "Sair do Time" : "Entrar no Time 2"}
              </Button>
            )}
          </div>
        </div>

        {/* Battle Controls */}
        {battlePhase === "playing" && userTeam && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-4 text-center">Registrar Placar - Set {battle.current_set}</h3>

            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Time 1</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setTeam1Score(Math.max(0, team1Score - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{team1Score}</span>
                  <Button size="sm" variant="outline" onClick={() => setTeam1Score(team1Score + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-4xl font-bold text-gray-400">×</div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Time 2</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setTeam2Score(Math.max(0, team2Score - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{team2Score}</span>
                  <Button size="sm" variant="outline" onClick={() => setTeam2Score(team2Score + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Score Confirmation Status */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div
                className={`flex items-center gap-2 ${scoreConfirmations.team1 ? "text-green-600" : "text-gray-400"}`}
              >
                {scoreConfirmations.team1 ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                <span className="text-sm">Time 1 {scoreConfirmations.team1 ? "confirmou" : "aguardando"}</span>
              </div>
              <div
                className={`flex items-center gap-2 ${scoreConfirmations.team2 ? "text-green-600" : "text-gray-400"}`}
              >
                {scoreConfirmations.team2 ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                <span className="text-sm">Time 2 {scoreConfirmations.team2 ? "confirmou" : "aguardando"}</span>
              </div>
            </div>

            <Button
              className="w-full bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => submitScore(team1Score, team2Score)}
              disabled={scoreConfirmations[userTeam === 1 ? "team1" : "team2"]}
            >
              {scoreConfirmations[userTeam === 1 ? "team1" : "team2"] ? "Placar Confirmado" : "Confirmar Placar"}
            </Button>
          </div>
        )}

        {/* Battle Finished */}
        {battlePhase === "finished" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <h3 className="font-bold text-green-800 mb-2">Batalha Finalizada!</h3>
            <p className="text-green-700">
              {team1Score > team2Score ? "Time 1 venceu!" : "Time 2 venceu!"}
              <br />
              Placar final: {team1Score} × {team2Score}
            </p>
          </div>
        )}

        {/* Waiting for Players */}
        {battlePhase === "waiting" && battle.current_participants < battle.max_participants && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-bold text-yellow-800 mb-2">Aguardando Jogadores</h3>
            <p className="text-yellow-700">
              Precisamos de mais {battle.max_participants - battle.current_participants} jogador(es) para iniciar a
              batalha.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
