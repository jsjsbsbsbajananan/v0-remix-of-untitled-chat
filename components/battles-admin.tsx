"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createBrowserClient } from "@supabase/ssr"
import { Trophy, Plus, Edit, Trash2, Users, Clock, Target, Swords } from "lucide-react"

interface Court {
  id: string
  name: string
  category: string
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

const modalityOptions = [
  { value: "society", label: "Society" },
  { value: "futvolei", label: "Futvôlei" },
  { value: "tenis", label: "Tênis" },
  { value: "basquete", label: "Basquete" },
  { value: "volei", label: "Vôlei" },
]

const formatOptions = [
  { value: "1x1", label: "1 vs 1", maxPlayers: 2 },
  { value: "2x2", label: "2 vs 2", maxPlayers: 4 },
  { value: "3x3", label: "3 vs 3", maxPlayers: 6 },
  { value: "5x5", label: "5 vs 5", maxPlayers: 10 },
]

const rulesOptions = [
  { value: "best_of_1", label: "Melhor de 1" },
  { value: "best_of_3", label: "Melhor de 3" },
  { value: "best_of_5", label: "Melhor de 5" },
]

const statusOptions = [
  { value: "waiting", label: "Aguardando", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "in_progress", label: "Em Andamento", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { value: "completed", label: "Finalizada", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "cancelled", label: "Cancelada", color: "bg-red-500/10 text-red-600 border-red-500/20" },
]

export default function BattlesAdmin() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBattle, setEditingBattle] = useState<Battle | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    modality: "society",
    format: "2x2",
    rules: "best_of_1",
    court_id: "none", // Updated default value to 'none'
    scheduled_time: "",
    status: "waiting" as const,
    max_players: 4,
  })

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
        .select("id, name, category")
        .eq("status", "available")

      if (courtsError) throw courtsError
      setCourts(courtsData || [])

      // Fetch battles with court info
      const { data: battlesData, error: battlesError } = await supabase
        .from("battles")
        .select(`
          *,
          court:courts(id, name, category)
        `)
        .order("created_at", { ascending: false })

      if (battlesError) throw battlesError
      setBattles(battlesData || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const battleData = {
        ...formData,
        court_id: formData.court_id === "none" ? null : formData.court_id, // Updated condition to handle 'none'
        scheduled_time: formData.scheduled_time || null,
      }

      if (editingBattle) {
        const { error } = await supabase.from("battles").update(battleData).eq("id", editingBattle.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("battles").insert([battleData])

        if (error) throw error
      }

      await fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving battle:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta batalha?")) return

    try {
      const { error } = await supabase.from("battles").delete().eq("id", id)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("[v0] Error deleting battle:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      modality: "society",
      format: "2x2",
      rules: "best_of_1",
      court_id: "none", // Updated default value to 'none'
      scheduled_time: "",
      status: "waiting",
      max_players: 4,
    })
    setEditingBattle(null)
  }

  const openEditDialog = (battle: Battle) => {
    setEditingBattle(battle)
    setFormData({
      name: battle.name,
      modality: battle.modality,
      format: battle.format,
      rules: battle.rules,
      court_id: battle.court_id || "none", // Updated default value to 'none'
      scheduled_time: battle.scheduled_time || "",
      status: battle.status,
      max_players: battle.max_players,
    })
    setDialogOpen(true)
  }

  const handleFormatChange = (format: string) => {
    const formatOption = formatOptions.find((f) => f.value === format)
    setFormData((prev) => ({
      ...prev,
      format,
      max_players: formatOption?.maxPlayers || 2,
    }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status)
    return <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
  }

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando batalhas...</p>
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
                Gerenciar Batalhas
              </CardTitle>
              <CardDescription>Crie e gerencie batalhas esportivas para seus clientes</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Batalha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingBattle ? "Editar Batalha" : "Nova Batalha"}</DialogTitle>
                  <DialogDescription>
                    {editingBattle ? "Atualize as informações da batalha" : "Crie uma nova batalha esportiva"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Batalha</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Torneio Society Semanal"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="modality">Modalidade</Label>
                      <Select
                        value={formData.modality}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, modality: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {modalityOptions.map((modality) => (
                            <SelectItem key={modality.value} value={modality.value}>
                              {modality.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="format">Formato</Label>
                      <Select value={formData.format} onValueChange={handleFormatChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formatOptions.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rules">Regras</Label>
                      <Select
                        value={formData.rules}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, rules: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rulesOptions.map((rule) => (
                            <SelectItem key={rule.value} value={rule.value}>
                              {rule.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="court">Quadra (Opcional)</Label>
                    <Select
                      value={formData.court_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, court_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma quadra" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma quadra específica</SelectItem> {/* Updated value to 'none' */}
                        {courts.map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name} ({court.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled_time">Data e Hora Agendada (Opcional)</Label>
                    <Input
                      id="scheduled_time"
                      type="datetime-local"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_time: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingBattle ? "Atualizar" : "Criar"} Batalha</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {battles.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma batalha criada</h3>
              <p className="text-muted-foreground mb-4">
                Crie batalhas para engajar seus clientes e promover competições
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Batalha
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Quadra</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {battles.map((battle) => (
                  <TableRow key={battle.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{battle.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {rulesOptions.find((r) => r.value === battle.rules)?.label}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {modalityOptions.find((m) => m.value === battle.modality)?.label || battle.modality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{battle.format}</span>
                        <span className="text-sm text-muted-foreground">(max {battle.max_players})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {battle.court ? (
                        <div>
                          <div className="font-medium text-sm">{battle.court.name}</div>
                          <div className="text-xs text-muted-foreground">{battle.court.category}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não definida</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(battle.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(battle)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(battle.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                <p className="text-sm text-muted-foreground">Total de Batalhas</p>
                <p className="text-2xl font-bold text-foreground">{battles.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando</p>
                <p className="text-2xl font-bold text-blue-600">
                  {battles.filter((b) => b.status === "waiting").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {battles.filter((b) => b.status === "in_progress").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Swords className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finalizadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {battles.filter((b) => b.status === "completed").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
