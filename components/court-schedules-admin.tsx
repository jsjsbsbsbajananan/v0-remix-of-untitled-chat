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
import { Switch } from "@/components/ui/switch"
import { createBrowserClient } from "@supabase/ssr"
import { Clock, Plus, Edit, Trash2 } from "lucide-react"

interface Court {
  id: string
  name: string
  category: string
}

interface CourtSchedule {
  id: string
  court_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  court?: Court
}

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

export default function CourtSchedulesAdmin() {
  const [schedules, setSchedules] = useState<CourtSchedule[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<CourtSchedule | null>(null)
  const [formData, setFormData] = useState({
    court_id: "",
    day_of_week: 1,
    start_time: "06:00",
    end_time: "22:00",
    is_available: true,
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

      // Fetch schedules with court info
      const { data: schedulesData, error: schedulesError } = await supabase
        .from("court_schedules")
        .select(`
          *,
          court:courts(id, name, category)
        `)
        .order("day_of_week")
        .order("start_time")

      if (schedulesError) throw schedulesError
      setSchedules(schedulesData || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingSchedule) {
        const { error } = await supabase.from("court_schedules").update(formData).eq("id", editingSchedule.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("court_schedules").insert([formData])

        if (error) throw error
      }

      await fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving schedule:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este horário?")) return

    try {
      const { error } = await supabase.from("court_schedules").delete().eq("id", id)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("[v0] Error deleting schedule:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      court_id: "",
      day_of_week: 1,
      start_time: "06:00",
      end_time: "22:00",
      is_available: true,
    })
    setEditingSchedule(null)
  }

  const openEditDialog = (schedule: CourtSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      court_id: schedule.court_id,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      is_available: schedule.is_available,
    })
    setDialogOpen(true)
  }

  const createBulkSchedules = async () => {
    if (!formData.court_id) {
      alert("Selecione uma quadra primeiro")
      return
    }

    try {
      const bulkSchedules = daysOfWeek.map((day) => ({
        court_id: formData.court_id,
        day_of_week: day.value,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available,
      }))

      const { error } = await supabase.from("court_schedules").insert(bulkSchedules)

      if (error) throw error
      await fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error creating bulk schedules:", error)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando horários...</p>
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
                <Clock className="h-5 w-5" />
                Horários das Quadras
              </CardTitle>
              <CardDescription>Configure os horários de funcionamento de cada quadra</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Horário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSchedule ? "Editar Horário" : "Novo Horário"}</DialogTitle>
                  <DialogDescription>
                    {editingSchedule ? "Atualize o horário da quadra" : "Configure um novo horário de funcionamento"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="court">Quadra</Label>
                    <Select
                      value={formData.court_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, court_id: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma quadra" />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name} ({court.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="day">Dia da Semana</Label>
                    <Select
                      value={formData.day_of_week.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, day_of_week: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Horário Início</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">Horário Fim</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={formData.is_available}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_available: checked }))}
                    />
                    <Label htmlFor="available">Disponível para reservas</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    {!editingSchedule && (
                      <Button type="button" variant="secondary" onClick={createBulkSchedules}>
                        Criar para Todos os Dias
                      </Button>
                    )}
                    <Button type="submit">{editingSchedule ? "Atualizar" : "Criar"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum horário configurado</h3>
              <p className="text-muted-foreground mb-4">Configure os horários de funcionamento das suas quadras</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Configurar Horários
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quadra</TableHead>
                  <TableHead>Dia da Semana</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {schedule.court?.name || "Quadra não encontrada"}
                        </div>
                        <div className="text-sm text-muted-foreground">{schedule.court?.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>{daysOfWeek.find((d) => d.value === schedule.day_of_week)?.label}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          schedule.is_available
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {schedule.is_available ? "Disponível" : "Indisponível"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(schedule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
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
    </div>
  )
}
