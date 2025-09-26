"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Plus, Trash2, Edit, Ban } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Professional {
  id: string
  name: string
  is_active: boolean
}

interface ProfessionalSchedule {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  lunch_start_time: string | null
  lunch_end_time: string | null
  is_active: boolean
  professional: { name: string }
}

interface ScheduleBlock {
  id: string
  professional_id: string
  blocked_date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  is_full_day: boolean
  professional: { name: string }
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

export default function SchedulesAdmin() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([])
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"schedules" | "blocks">("schedules")

  // Schedule Dialog States
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ProfessionalSchedule | null>(null)
  const [scheduleFormData, setScheduleFormData] = useState({
    professional_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    lunch_start_time: "",
    lunch_end_time: "",
    is_active: true,
  })

  // Block Dialog States
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null)
  const [blockFormData, setBlockFormData] = useState({
    professional_id: "",
    blocked_date: "",
    start_time: "",
    end_time: "",
    reason: "",
    is_full_day: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch professionals
      const { data: professionalsData, error: profError } = await supabase
        .from("professionals")
        .select("id, name, is_active")
        .eq("is_active", true)
        .order("name")

      if (profError) throw profError
      setProfessionals(professionalsData || [])

      // Fetch schedules
      const { data: schedulesData, error: schedError } = await supabase
        .from("professional_schedules")
        .select(`
          *,
          professional:professionals(name)
        `)
        .order("day_of_week")

      if (schedError) throw schedError
      setSchedules(schedulesData || [])

      // Fetch blocks
      const { data: blocksData, error: blockError } = await supabase
        .from("schedule_blocks")
        .select(`
          *,
          professional:professionals(name)
        `)
        .order("blocked_date", { ascending: false })

      if (blockError) throw blockError
      setBlocks(blocksData || [])
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !scheduleFormData.professional_id ||
      !scheduleFormData.day_of_week ||
      !scheduleFormData.start_time ||
      !scheduleFormData.end_time
    ) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      const scheduleData = {
        professional_id: scheduleFormData.professional_id,
        day_of_week: Number.parseInt(scheduleFormData.day_of_week),
        start_time: scheduleFormData.start_time,
        end_time: scheduleFormData.end_time,
        lunch_start_time: scheduleFormData.lunch_start_time || null,
        lunch_end_time: scheduleFormData.lunch_end_time || null,
        is_active: scheduleFormData.is_active,
      }

      if (editingSchedule) {
        const { error } = await supabase
          .from("professional_schedules")
          .update(scheduleData)
          .eq("id", editingSchedule.id)

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Horário atualizado com sucesso!",
        })
      } else {
        const { error } = await supabase.from("professional_schedules").insert([scheduleData])

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Horário criado com sucesso!",
        })
      }

      setIsScheduleDialogOpen(false)
      resetScheduleForm()
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar horário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o horário",
        variant: "destructive",
      })
    }
  }

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!blockFormData.professional_id || !blockFormData.blocked_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      const blockData = {
        professional_id: blockFormData.professional_id,
        blocked_date: blockFormData.blocked_date,
        start_time: blockFormData.is_full_day ? null : blockFormData.start_time || null,
        end_time: blockFormData.is_full_day ? null : blockFormData.end_time || null,
        reason: blockFormData.reason || null,
        is_full_day: blockFormData.is_full_day,
      }

      if (editingBlock) {
        const { error } = await supabase.from("schedule_blocks").update(blockData).eq("id", editingBlock.id)

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Bloqueio atualizado com sucesso!",
        })
      } else {
        const { error } = await supabase.from("schedule_blocks").insert([blockData])

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Bloqueio criado com sucesso!",
        })
      }

      setIsBlockDialogOpen(false)
      resetBlockForm()
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar bloqueio:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o bloqueio",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este horário?")) return

    try {
      const { error } = await supabase.from("professional_schedules").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Horário excluído com sucesso!",
      })
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir horário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o horário",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este bloqueio?")) return

    try {
      const { error } = await supabase.from("schedule_blocks").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Bloqueio excluído com sucesso!",
      })
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir bloqueio:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o bloqueio",
        variant: "destructive",
      })
    }
  }

  const resetScheduleForm = () => {
    setScheduleFormData({
      professional_id: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      lunch_start_time: "",
      lunch_end_time: "",
      is_active: true,
    })
    setEditingSchedule(null)
  }

  const resetBlockForm = () => {
    setBlockFormData({
      professional_id: "",
      blocked_date: "",
      start_time: "",
      end_time: "",
      reason: "",
      is_full_day: false,
    })
    setEditingBlock(null)
  }

  const openEditScheduleDialog = (schedule: ProfessionalSchedule) => {
    setEditingSchedule(schedule)
    setScheduleFormData({
      professional_id: schedule.professional_id,
      day_of_week: schedule.day_of_week.toString(),
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      lunch_start_time: schedule.lunch_start_time || "",
      lunch_end_time: schedule.lunch_end_time || "",
      is_active: schedule.is_active,
    })
    setIsScheduleDialogOpen(true)
  }

  const openEditBlockDialog = (block: ScheduleBlock) => {
    setEditingBlock(block)
    setBlockFormData({
      professional_id: block.professional_id,
      blocked_date: block.blocked_date,
      start_time: block.start_time || "",
      end_time: block.end_time || "",
      reason: block.reason || "",
      is_full_day: block.is_full_day,
    })
    setIsBlockDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando horários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Horários</h2>
          <p className="text-gray-600">Configure horários de trabalho e bloqueios</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("schedules")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "schedules" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Horários de Trabalho
        </button>
        <button
          onClick={() => setActiveTab("blocks")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "blocks" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Ban className="w-4 h-4 inline mr-2" />
          Bloqueios
        </button>
      </div>

      {/* Schedules Tab */}
      {activeTab === "schedules" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetScheduleForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Horário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSchedule ? "Editar Horário" : "Novo Horário"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleScheduleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="professional">Profissional *</Label>
                    <Select
                      value={scheduleFormData.professional_id}
                      onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, professional_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="day_of_week">Dia da Semana *</Label>
                    <Select
                      value={scheduleFormData.day_of_week}
                      onValueChange={(value) => setScheduleFormData({ ...scheduleFormData, day_of_week: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time">Início *</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={scheduleFormData.start_time}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time">Fim *</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={scheduleFormData.end_time}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, end_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lunch_start">Almoço - Início</Label>
                      <Input
                        id="lunch_start"
                        type="time"
                        value={scheduleFormData.lunch_start_time}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, lunch_start_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lunch_end">Almoço - Fim</Label>
                      <Input
                        id="lunch_end"
                        type="time"
                        value={scheduleFormData.lunch_end_time}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, lunch_end_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={scheduleFormData.is_active}
                      onCheckedChange={(checked) => setScheduleFormData({ ...scheduleFormData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Horário ativo</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {editingSchedule ? "Atualizar" : "Criar"} Horário
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {schedules.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum horário cadastrado</h3>
                    <p className="text-gray-600 mb-4">Configure os horários de trabalho dos profissionais</p>
                    <Button onClick={() => setIsScheduleDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Horário
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              schedules.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{schedule.professional.name}</h3>
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <strong>{DAYS_OF_WEEK[schedule.day_of_week].label}</strong>
                          </p>
                          <p>
                            Trabalho: {schedule.start_time} - {schedule.end_time}
                          </p>
                          {schedule.lunch_start_time && schedule.lunch_end_time && (
                            <p>
                              Almoço: {schedule.lunch_start_time} - {schedule.lunch_end_time}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => openEditScheduleDialog(schedule)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Blocks Tab */}
      {activeTab === "blocks" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetBlockForm} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Bloqueio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingBlock ? "Editar Bloqueio" : "Novo Bloqueio"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBlockSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="professional">Profissional *</Label>
                    <Select
                      value={blockFormData.professional_id}
                      onValueChange={(value) => setBlockFormData({ ...blockFormData, professional_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="blocked_date">Data *</Label>
                    <Input
                      id="blocked_date"
                      type="date"
                      value={blockFormData.blocked_date}
                      onChange={(e) => setBlockFormData({ ...blockFormData, blocked_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_full_day"
                      checked={blockFormData.is_full_day}
                      onCheckedChange={(checked) => setBlockFormData({ ...blockFormData, is_full_day: checked })}
                    />
                    <Label htmlFor="is_full_day">Dia inteiro</Label>
                  </div>

                  {!blockFormData.is_full_day && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_time">Início</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={blockFormData.start_time}
                          onChange={(e) => setBlockFormData({ ...blockFormData, start_time: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">Fim</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={blockFormData.end_time}
                          onChange={(e) => setBlockFormData({ ...blockFormData, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reason">Motivo</Label>
                    <Textarea
                      id="reason"
                      value={blockFormData.reason}
                      onChange={(e) => setBlockFormData({ ...blockFormData, reason: e.target.value })}
                      placeholder="Ex: Férias, Folga, Compromisso pessoal..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                      {editingBlock ? "Atualizar" : "Criar"} Bloqueio
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {blocks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum bloqueio cadastrado</h3>
                    <p className="text-gray-600 mb-4">Bloqueie datas ou horários específicos quando necessário</p>
                    <Button onClick={() => setIsBlockDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Bloqueio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              blocks.map((block) => (
                <Card key={block.id} className="hover:shadow-md transition-shadow border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{block.professional.name}</h3>
                          <Badge variant="destructive">
                            {block.is_full_day ? "Dia Inteiro" : "Horário Específico"}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <strong>Data:</strong> {formatDate(block.blocked_date)}
                          </p>
                          {!block.is_full_day && block.start_time && block.end_time && (
                            <p>
                              <strong>Horário:</strong> {block.start_time} - {block.end_time}
                            </p>
                          )}
                          {block.reason && (
                            <p>
                              <strong>Motivo:</strong> {block.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => openEditBlockDialog(block)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
