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
import { Calendar, Plus, Edit, Trash2, Clock, DollarSign, User, Filter } from "lucide-react"

interface Court {
  id: string
  name: string
  category: string
  price_per_hour: number
}

interface Reservation {
  id: string
  user_id: string
  court_id: string
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status: "confirmed" | "pending" | "cancelled"
  created_at: string
  court?: Court
  user_email?: string
}

const statusOptions = [
  { value: "confirmed", label: "Confirmada", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "pending", label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { value: "cancelled", label: "Cancelada", color: "bg-red-500/10 text-red-600 border-red-500/20" },
]

export default function ReservationsAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    court_id: "",
    reservation_date: "",
    start_time: "08:00",
    end_time: "09:00",
    status: "confirmed" as const,
    user_email: "",
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

      // Fetch reservations with court info
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          *,
          court:courts(id, name, category, price_per_hour)
        `)
        .order("reservation_date", { ascending: false })
        .order("start_time", { ascending: false })

      if (reservationsError) throw reservationsError
      setReservations(reservationsData || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Calculate total price based on hours
      const startTime = new Date(`2000-01-01T${formData.start_time}:00`)
      const endTime = new Date(`2000-01-01T${formData.end_time}:00`)
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      const court = courts.find((c) => c.id === formData.court_id)
      const total_price = court ? hours * court.price_per_hour : 0

      const reservationData = {
        ...formData,
        total_price,
        user_id: "temp-user-id", // In real app, this would come from auth
      }

      if (editingReservation) {
        const { error } = await supabase.from("reservations").update(reservationData).eq("id", editingReservation.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("reservations").insert([reservationData])

        if (error) throw error
      }

      await fetchData()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error saving reservation:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return

    try {
      const { error } = await supabase.from("reservations").delete().eq("id", id)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error("[v0] Error deleting reservation:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      court_id: "",
      reservation_date: "",
      start_time: "08:00",
      end_time: "09:00",
      status: "confirmed",
      user_email: "",
    })
    setEditingReservation(null)
  }

  const openEditDialog = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setFormData({
      court_id: reservation.court_id,
      reservation_date: reservation.reservation_date,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      status: reservation.status,
      user_email: reservation.user_email || "",
    })
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status)
    return <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
  }

  const filteredReservations =
    statusFilter === "all" ? reservations : reservations.filter((r) => r.status === statusFilter)

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando reservas...</p>
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
                <Calendar className="h-5 w-5" />
                Gerenciar Reservas
              </CardTitle>
              <CardDescription>Acompanhe e gerencie todas as reservas das quadras</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingReservation ? "Editar Reserva" : "Nova Reserva"}</DialogTitle>
                    <DialogDescription>
                      {editingReservation ? "Atualize os dados da reserva" : "Crie uma nova reserva manualmente"}
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
                              {court.name} - R$ {court.price_per_hour.toFixed(2)}/h
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Data da Reserva</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.reservation_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, reservation_date: e.target.value }))}
                        required
                      />
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

                    <div className="space-y-2">
                      <Label htmlFor="email">Email do Cliente</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.user_email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, user_email: e.target.value }))}
                        placeholder="cliente@email.com"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">{editingReservation ? "Atualizar" : "Criar"} Reserva</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {statusFilter === "all"
                  ? "Nenhuma reserva encontrada"
                  : `Nenhuma reserva ${statusOptions.find((s) => s.value === statusFilter)?.label.toLowerCase()}`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all"
                  ? "As reservas aparecerão aqui conforme forem feitas"
                  : "Altere o filtro para ver outras reservas"}
              </p>
              {statusFilter === "all" && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Reserva
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Quadra</TableHead>
                  <TableHead>Data & Horário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{reservation.user_email || "Cliente não informado"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {reservation.court?.name || "Quadra não encontrada"}
                        </div>
                        <div className="text-sm text-muted-foreground">{reservation.court?.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {new Date(reservation.reservation_date).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reservation.start_time} - {reservation.end_time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">R$ {reservation.total_price.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(reservation)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(reservation.id)}
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
                <p className="text-sm text-muted-foreground">Total de Reservas</p>
                <p className="text-2xl font-bold text-foreground">{reservations.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter((r) => r.status === "confirmed").length}
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
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reservations.filter((r) => r.status === "pending").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-foreground">
                  R${" "}
                  {reservations
                    .filter((r) => r.status === "confirmed")
                    .reduce((acc, r) => acc + r.total_price, 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
