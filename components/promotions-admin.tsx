"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Checkbox } from "@/components/ui/checkbox"
import { createBrowserClient } from "@supabase/ssr"
import { Target, Plus, Edit, Trash2, DollarSign, Calendar, Clock, Percent } from "lucide-react"

interface Court {
  id: string
  name: string
  category: string
  price_per_hour: number
}

interface Promotion {
  id: string
  court_id?: string
  title: string
  description?: string
  discount_percentage?: number
  fixed_price?: number
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  days_of_week?: number[]
  is_active: boolean
  created_at: string
  court?: Court
}

const daysOfWeek = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
]

export default function PromotionsAdmin() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    court_id: "all", // Updated default value to 'all'
    title: "",
    description: "",
    discount_percentage: 0,
    fixed_price: 0,
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    days_of_week: [] as number[],
    is_active: true,
    promotion_type: "percentage" as "percentage" | "fixed",
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
        .select("id, name, category, price_per_hour")
        .eq("status", "available")

      if (courtsError) throw courtsError
      setCourts(courtsData || [])

      // Fetch promotions with court info
      const { data: promotionsData, error: promotionsError } = await supabase
        .from("promotions")
        .select(`
          *,
          court:courts(id, name, category, price_per_hour)
        `)
        .order("created_at", { ascending: false })

      if (promotionsError) throw promotionsError
      setPromotions(promotionsData || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const promotionData = {
        court_id: formData.court_id === "all" ? null : formData.court_id,
        title: formData.title,
        description: formData.description || null,
        discount_percentage: formData.promotion_type === "percentage" ? formData.discount_percentage : null,
        fixed_price: formData.promotion_type === "fixed" ? formData.fixed_price : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        days_of_week: formData.days_of_week.length > 0 ? formData.days_of_week : null,
        is_active: formData.is_active,
      }

      if (editingPromotion) {
        const { error } = await supabase.from("promotions").update(promotionData).eq("id", editingPromotion.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("promotions").insert([promotionData])

        if (error) throw error
      }

      await fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving promotion:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta promoção?")) return

    try {
      const { error } = await supabase.from("promotions").delete().eq("id", id)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("[v0] Error deleting promotion:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      court_id: "all", // Updated default value to 'all'
      title: "",
      description: "",
      discount_percentage: 0,
      fixed_price: 0,
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      days_of_week: [],
      is_active: true,
      promotion_type: "percentage",
    })
    setEditingPromotion(null)
  }

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      court_id: promotion.court_id || "all", // Updated default value to 'all'
      title: promotion.title,
      description: promotion.description || "",
      discount_percentage: promotion.discount_percentage || 0,
      fixed_price: promotion.fixed_price || 0,
      start_date: promotion.start_date || "",
      end_date: promotion.end_date || "",
      start_time: promotion.start_time || "",
      end_time: promotion.end_time || "",
      days_of_week: promotion.days_of_week || [],
      is_active: promotion.is_active,
      promotion_type: promotion.discount_percentage ? "percentage" : "fixed",
    })
    setDialogOpen(true)
  }

  const handleDayToggle = (day: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: checked ? [...prev.days_of_week, day].sort() : prev.days_of_week.filter((d) => d !== day),
    }))
  }

  const formatPromotionValue = (promotion: Promotion) => {
    if (promotion.discount_percentage) {
      return `${promotion.discount_percentage}% OFF`
    }
    if (promotion.fixed_price) {
      return `R$ ${promotion.fixed_price.toFixed(2)}`
    }
    return "Sem desconto"
  }

  const formatDaysOfWeek = (days?: number[]) => {
    if (!days || days.length === 0) return "Todos os dias"
    if (days.length === 7) return "Todos os dias"
    return days.map((d) => daysOfWeek.find((day) => day.value === d)?.label).join(", ")
  }

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando promoções...</p>
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
                <Target className="h-5 w-5" />
                Precificação e Promoções
              </CardTitle>
              <CardDescription>Configure preços especiais e promoções para suas quadras</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Promoção
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPromotion ? "Editar Promoção" : "Nova Promoção"}</DialogTitle>
                  <DialogDescription>
                    {editingPromotion ? "Atualize a promoção" : "Crie uma nova promoção ou preço especial"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Promoção</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Promoção Horário Comercial"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva os detalhes da promoção..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="court">Quadra (Opcional)</Label>
                    <Select
                      value={formData.court_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, court_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as quadras" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as quadras</SelectItem> {/* Updated value prop to 'all' */}
                        {courts.map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name} - R$ {court.price_per_hour.toFixed(2)}/h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Tipo de Promoção</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="percentage"
                          name="promotion_type"
                          value="percentage"
                          checked={formData.promotion_type === "percentage"}
                          onChange={(e) => setFormData((prev) => ({ ...prev, promotion_type: e.target.value as any }))}
                        />
                        <Label htmlFor="percentage">Desconto Percentual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="fixed"
                          name="promotion_type"
                          value="fixed"
                          checked={formData.promotion_type === "fixed"}
                          onChange={(e) => setFormData((prev) => ({ ...prev, promotion_type: e.target.value as any }))}
                        />
                        <Label htmlFor="fixed">Preço Fixo</Label>
                      </div>
                    </div>

                    {formData.promotion_type === "percentage" ? (
                      <div className="space-y-2">
                        <Label htmlFor="discount">Desconto (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discount_percentage}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discount_percentage: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder="Ex: 20"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="fixed_price">Preço Fixo (R$)</Label>
                        <Input
                          id="fixed_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.fixed_price}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, fixed_price: Number.parseFloat(e.target.value) || 0 }))
                          }
                          placeholder="Ex: 40.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Data Início (Opcional)</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Data Fim (Opcional)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Horário Início (Opcional)</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">Horário Fim (Opcional)</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dias da Semana (Opcional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.days_of_week.includes(day.value)}
                            onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                          />
                          <Label htmlFor={`day-${day.value}`} className="text-sm">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="active">Promoção ativa</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingPromotion ? "Atualizar" : "Criar"} Promoção</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma promoção criada</h3>
              <p className="text-muted-foreground mb-4">
                Crie promoções para atrair mais clientes e otimizar a ocupação das quadras
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Promoção
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Quadra</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{promotion.title}</div>
                        {promotion.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{promotion.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {promotion.court ? (
                        <div>
                          <div className="font-medium text-sm">{promotion.court.name}</div>
                          <div className="text-xs text-muted-foreground">{promotion.court.category}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Todas as quadras</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {promotion.discount_percentage ? (
                          <>
                            <Percent className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">{promotion.discount_percentage}% OFF</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">R$ {promotion.fixed_price?.toFixed(2) || "0.00"}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {promotion.start_date && promotion.end_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(promotion.start_date).toLocaleDateString("pt-BR")} -{" "}
                              {new Date(promotion.end_date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sem limite</span>
                        )}
                        {promotion.start_time && promotion.end_time && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {promotion.start_time} - {promotion.end_time}
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDaysOfWeek(promotion.days_of_week)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          promotion.is_active
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        }
                      >
                        {promotion.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(promotion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promotion.id)}
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
                <p className="text-sm text-muted-foreground">Total de Promoções</p>
                <p className="text-2xl font-bold text-foreground">{promotions.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{promotions.filter((p) => p.is_active).length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Desconto Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  {promotions.filter((p) => p.discount_percentage).length > 0
                    ? `${(promotions.filter((p) => p.discount_percentage).reduce((acc, p) => acc + (p.discount_percentage || 0), 0) / promotions.filter((p) => p.discount_percentage).length).toFixed(0)}%`
                    : "0%"}
                </p>
              </div>
              <Percent className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preço Fixo Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  R${" "}
                  {promotions.filter((p) => p.fixed_price).length > 0
                    ? (
                        promotions.filter((p) => p.fixed_price).reduce((acc, p) => acc + (p.fixed_price || 0), 0) /
                        promotions.filter((p) => p.fixed_price).length
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
