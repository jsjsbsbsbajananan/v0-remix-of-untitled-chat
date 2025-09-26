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
import { createBrowserClient } from "@supabase/ssr"
import { Plus, Edit, Trash2, MapPin, DollarSign } from "lucide-react"

interface Court {
  id: string
  name: string
  description: string
  category: string
  price_per_hour: number
  photos: string[]
  status: "available" | "closed" | "maintenance"
  banner_url?: string
  created_at: string
}

const categories = [
  { value: "society", label: "Society" },
  { value: "futvolei", label: "Futvôlei" },
  { value: "tenis", label: "Tênis" },
  { value: "basquete", label: "Basquete" },
  { value: "volei", label: "Vôlei" },
  { value: "padel", label: "Padel" },
]

const statusOptions = [
  { value: "available", label: "Disponível", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "closed", label: "Fechada", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  { value: "maintenance", label: "Manutenção", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
]

export default function CourtsAdmin() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "society",
    price_per_hour: 50,
    status: "available" as const,
    banner_url: "",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchCourts()
  }, [])

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase.from("courts").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCourts(data || [])
    } catch (error) {
      console.error("[v0] Error fetching courts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCourt) {
        const { error } = await supabase.from("courts").update(formData).eq("id", editingCourt.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("courts").insert([formData])

        if (error) throw error
      }

      await fetchCourts()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving court:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta quadra?")) return

    try {
      const { error } = await supabase.from("courts").delete().eq("id", id)

      if (error) throw error
      await fetchCourts()
    } catch (error) {
      console.error("[v0] Error deleting court:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "society",
      price_per_hour: 50,
      status: "available",
      banner_url: "",
    })
    setEditingCourt(null)
  }

  const openEditDialog = (court: Court) => {
    setEditingCourt(court)
    setFormData({
      name: court.name,
      description: court.description,
      category: court.category,
      price_per_hour: court.price_per_hour,
      status: court.status,
      banner_url: court.banner_url || "",
    })
    setDialogOpen(true)
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
              <p className="text-muted-foreground">Carregando quadras...</p>
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
                <MapPin className="h-5 w-5" />
                Gerenciar Quadras
              </CardTitle>
              <CardDescription>Configure suas quadras esportivas, preços e disponibilidade</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Quadra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCourt ? "Editar Quadra" : "Nova Quadra"}</DialogTitle>
                  <DialogDescription>
                    {editingCourt ? "Atualize as informações da quadra" : "Adicione uma nova quadra ao sistema"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Quadra</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Quadra Society 1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva as características da quadra..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço por Hora (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price_per_hour}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price_per_hour: Number.parseFloat(e.target.value) || 0 }))
                        }
                        required
                      />
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
                    <Label htmlFor="banner">URL do Banner (opcional)</Label>
                    <Input
                      id="banner"
                      type="url"
                      value={formData.banner_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, banner_url: e.target.value }))}
                      placeholder="https://exemplo.com/banner.jpg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingCourt ? "Atualizar" : "Criar"} Quadra</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {courts.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma quadra cadastrada</h3>
              <p className="text-muted-foreground mb-4">Comece adicionando sua primeira quadra esportiva</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Quadra
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{court.name}</div>
                        {court.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{court.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categories.find((c) => c.value === court.category)?.label || court.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">R$ {court.price_per_hour.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(court.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(court)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(court.id)}
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
                <p className="text-sm text-muted-foreground">Total de Quadras</p>
                <p className="text-2xl font-bold text-foreground">{courts.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">
                  {courts.filter((c) => c.status === "available").length}
                </p>
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
                <p className="text-sm text-muted-foreground">Preço Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  R${" "}
                  {courts.length > 0
                    ? (courts.reduce((acc, c) => acc + c.price_per_hour, 0) / courts.length).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold text-foreground">{new Set(courts.map((c) => c.category)).size}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-purple-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
