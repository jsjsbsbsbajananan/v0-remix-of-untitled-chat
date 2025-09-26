"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Star } from "lucide-react"
import { toast } from "sonner"

interface Professional {
  id: string
  name: string
  description: string | null
  specialties: string[]
  experience_years: number
  photo_url: string | null
  phone: string | null
  email: string | null
  rating: number
  total_reviews: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ProfessionalsAdmin() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    specialties: "",
    experience_years: 0,
    photo_url: "",
    phone: "",
    email: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase.from("professionals").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProfessionals(data || [])
    } catch (error) {
      console.error("Error fetching professionals:", error)
      toast.error("Erro ao carregar profissionais")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const professionalData = {
        name: formData.name,
        description: formData.description || null,
        specialties: formData.specialties
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        experience_years: formData.experience_years,
        photo_url: formData.photo_url || null,
        phone: formData.phone || null,
        email: formData.email || null,
        updated_at: new Date().toISOString(),
      }

      if (editingProfessional) {
        const { error } = await supabase.from("professionals").update(professionalData).eq("id", editingProfessional.id)

        if (error) throw error
        toast.success("Profissional atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("professionals").insert([professionalData])

        if (error) throw error
        toast.success("Profissional cadastrado com sucesso!")
      }

      setIsModalOpen(false)
      setEditingProfessional(null)
      resetForm()
      fetchProfessionals()
    } catch (error) {
      console.error("Error saving professional:", error)
      toast.error("Erro ao salvar profissional")
    }
  }

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
    setFormData({
      name: professional.name,
      description: professional.description || "",
      specialties: professional.specialties.join(", "),
      experience_years: professional.experience_years,
      photo_url: professional.photo_url || "",
      phone: professional.phone || "",
      email: professional.email || "",
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return

    try {
      const { error } = await supabase.from("professionals").delete().eq("id", id)

      if (error) throw error
      toast.success("Profissional excluído com sucesso!")
      fetchProfessionals()
    } catch (error) {
      console.error("Error deleting professional:", error)
      toast.error("Erro ao excluir profissional")
    }
  }

  const toggleActive = async (professional: Professional) => {
    try {
      const { error } = await supabase
        .from("professionals")
        .update({ is_active: !professional.is_active })
        .eq("id", professional.id)

      if (error) throw error
      toast.success(`Profissional ${!professional.is_active ? "ativado" : "desativado"} com sucesso!`)
      fetchProfessionals()
    } catch (error) {
      console.error("Error toggling professional status:", error)
      toast.error("Erro ao alterar status do profissional")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      specialties: "",
      experience_years: 0,
      photo_url: "",
      phone: "",
      email: "",
    })
  }

  const openModal = () => {
    resetForm()
    setEditingProfessional(null)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Profissionais</h2>
        <Button onClick={openModal}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((professional) => (
          <Card key={professional.id} className={`${!professional.is_active ? "opacity-50" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                {professional.photo_url && (
                  <img
                    src={professional.photo_url || "/placeholder.svg"}
                    alt={professional.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg">{professional.name}</CardTitle>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {professional.rating} ({professional.total_reviews} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">{professional.description || "Sem descrição"}</p>

              <div className="flex flex-wrap gap-1">
                {professional.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-gray-500">{professional.experience_years} anos de experiência</div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  variant={professional.is_active ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleActive(professional)}
                >
                  {professional.is_active ? "Desativar" : "Ativar"}
                </Button>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(professional)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(professional.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingProfessional ? "Editar Profissional" : "Adicionar Profissional"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Especialidades (separadas por vírgula)</label>
                <Input
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Corte, Barba, Coloração"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Anos de Experiência</label>
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: Number.parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL da Foto</label>
                <Input
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="/path/to/photo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="profissional@email.com"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingProfessional ? "Atualizar" : "Cadastrar"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
