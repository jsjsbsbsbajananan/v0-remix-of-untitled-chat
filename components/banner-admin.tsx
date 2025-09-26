"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Plus, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Banner {
  id: string
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface EstablishmentSettings {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  operating_hours: string | null
  payment_methods: string[] | null
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export default function BannerAdmin() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [establishment, setEstablishment] = useState<EstablishmentSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"banners" | "establishment">("banners")

  // Banner Dialog States
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [bannerFormData, setBannerFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    is_active: true,
    display_order: 1,
  })

  // Establishment Dialog States
  const [isEstablishmentDialogOpen, setIsEstablishmentDialogOpen] = useState(false)
  const [establishmentFormData, setEstablishmentFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    banner_url: "",
    operating_hours: "",
    payment_methods: "",
    phone: "",
    email: "",
    address: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch banners
      const { data: bannersData, error: bannersError } = await supabase
        .from("banners")
        .select("*")
        .order("display_order")

      if (bannersError && bannersError.code !== "PGRST116") {
        // Table doesn't exist yet
        console.error("Erro ao buscar banners:", bannersError)
      } else {
        setBanners(bannersData || [])
      }

      // Fetch establishment settings
      const { data: establishmentData, error: establishmentError } = await supabase
        .from("establishment_settings")
        .select("*")
        .single()

      if (establishmentError && establishmentError.code !== "PGRST116") {
        // Table doesn't exist yet
        console.error("Erro ao buscar configurações:", establishmentError)
      } else {
        setEstablishment(establishmentData)
        if (establishmentData) {
          setEstablishmentFormData({
            name: establishmentData.name || "",
            description: establishmentData.description || "",
            logo_url: establishmentData.logo_url || "",
            banner_url: establishmentData.banner_url || "",
            operating_hours: establishmentData.operating_hours || "",
            payment_methods: establishmentData.payment_methods?.join(", ") || "",
            phone: establishmentData.phone || "",
            email: establishmentData.email || "",
            address: establishmentData.address || "",
          })
        }
      }
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

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bannerFormData.title || !bannerFormData.image_url) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      const bannerData = {
        title: bannerFormData.title,
        description: bannerFormData.description || null,
        image_url: bannerFormData.image_url,
        link_url: bannerFormData.link_url || null,
        is_active: bannerFormData.is_active,
        display_order: bannerFormData.display_order,
        updated_at: new Date().toISOString(),
      }

      if (editingBanner) {
        const { error } = await supabase.from("banners").update(bannerData).eq("id", editingBanner.id)

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Banner atualizado com sucesso!",
        })
      } else {
        const { error } = await supabase.from("banners").insert([bannerData])

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Banner criado com sucesso!",
        })
      }

      setIsBannerDialogOpen(false)
      resetBannerForm()
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar banner:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o banner",
        variant: "destructive",
      })
    }
  }

  const handleEstablishmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!establishmentFormData.name) {
      toast({
        title: "Erro",
        description: "O nome do estabelecimento é obrigatório",
        variant: "destructive",
      })
      return
    }

    try {
      const establishmentData = {
        name: establishmentFormData.name,
        description: establishmentFormData.description || null,
        logo_url: establishmentFormData.logo_url || null,
        banner_url: establishmentFormData.banner_url || null,
        operating_hours: establishmentFormData.operating_hours || null,
        payment_methods: establishmentFormData.payment_methods
          ? establishmentFormData.payment_methods
              .split(",")
              .map((method) => method.trim())
              .filter((method) => method)
          : null,
        phone: establishmentFormData.phone || null,
        email: establishmentFormData.email || null,
        address: establishmentFormData.address || null,
        updated_at: new Date().toISOString(),
      }

      if (establishment) {
        const { error } = await supabase
          .from("establishment_settings")
          .update(establishmentData)
          .eq("id", establishment.id)

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Configurações atualizadas com sucesso!",
        })
      } else {
        const { error } = await supabase.from("establishment_settings").insert([establishmentData])

        if (error) throw error
        toast({
          title: "Sucesso",
          description: "Configurações criadas com sucesso!",
        })
      }

      setIsEstablishmentDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Banner excluído com sucesso!",
      })
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir banner:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o banner",
        variant: "destructive",
      })
    }
  }

  const handleToggleBannerActive = async (banner: Banner) => {
    try {
      const { error } = await supabase.from("banners").update({ is_active: !banner.is_active }).eq("id", banner.id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Banner ${!banner.is_active ? "ativado" : "desativado"} com sucesso!`,
      })
      fetchData()
    } catch (error) {
      console.error("Erro ao alterar status do banner:", error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do banner",
        variant: "destructive",
      })
    }
  }

  const resetBannerForm = () => {
    setBannerFormData({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      is_active: true,
      display_order: 1,
    })
    setEditingBanner(null)
  }

  const openEditBannerDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setBannerFormData({
      title: banner.title,
      description: banner.description || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      is_active: banner.is_active,
      display_order: banner.display_order,
    })
    setIsBannerDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Banner e Configurações</h2>
          <p className="text-gray-600">Gerencie banners e informações do estabelecimento</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "banners" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Banners
        </button>
        <button
          onClick={() => setActiveTab("establishment")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "establishment" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Edit className="w-4 h-4 inline mr-2" />
          Estabelecimento
        </button>
      </div>

      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetBannerForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingBanner ? "Editar Banner" : "Novo Banner"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBannerSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={bannerFormData.title}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                      placeholder="Título do banner"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={bannerFormData.description}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                      placeholder="Descrição do banner..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">URL da Imagem *</Label>
                    <Input
                      id="image_url"
                      value={bannerFormData.image_url}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, image_url: e.target.value })}
                      placeholder="/images/banner.jpg"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="link_url">URL do Link</Label>
                    <Input
                      id="link_url"
                      value={bannerFormData.link_url}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, link_url: e.target.value })}
                      placeholder="https://exemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="display_order">Ordem de Exibição</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min="1"
                      value={bannerFormData.display_order}
                      onChange={(e) =>
                        setBannerFormData({ ...bannerFormData, display_order: Number.parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={bannerFormData.is_active}
                      onCheckedChange={(checked) => setBannerFormData({ ...bannerFormData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Banner ativo</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {editingBanner ? "Atualizar" : "Criar"} Banner
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsBannerDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {banners.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum banner cadastrado</h3>
                    <p className="text-gray-600 mb-4">Crie banners para exibir no seu site</p>
                    <Button onClick={() => setIsBannerDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Banner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              banners.map((banner) => (
                <Card key={banner.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={banner.image_url || "/placeholder.svg?height=64&width=96"}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                            <Badge variant={banner.is_active ? "default" : "secondary"}>
                              {banner.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge variant="outline">Ordem: {banner.display_order}</Badge>
                          </div>

                          {banner.description && <p className="text-gray-600 mb-2">{banner.description}</p>}

                          {banner.link_url && (
                            <p className="text-sm text-blue-600">
                              <strong>Link:</strong> {banner.link_url}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleToggleBannerActive(banner)}>
                          {banner.is_active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditBannerDialog(banner)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBanner(banner.id)}
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

      {/* Establishment Tab */}
      {activeTab === "establishment" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Estabelecimento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEstablishmentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Estabelecimento *</Label>
                    <Input
                      id="name"
                      value={establishmentFormData.name}
                      onChange={(e) => setEstablishmentFormData({ ...establishmentFormData, name: e.target.value })}
                      placeholder="Nome da sua empresa"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={establishmentFormData.phone}
                      onChange={(e) => setEstablishmentFormData({ ...establishmentFormData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={establishmentFormData.description}
                    onChange={(e) =>
                      setEstablishmentFormData({ ...establishmentFormData, description: e.target.value })
                    }
                    placeholder="Descrição do seu estabelecimento..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo_url">URL da Logo</Label>
                    <Input
                      id="logo_url"
                      value={establishmentFormData.logo_url}
                      onChange={(e) => setEstablishmentFormData({ ...establishmentFormData, logo_url: e.target.value })}
                      placeholder="/images/logo.png"
                    />
                  </div>

                  <div>
                    <Label htmlFor="banner_url">URL do Banner Principal</Label>
                    <Input
                      id="banner_url"
                      value={establishmentFormData.banner_url}
                      onChange={(e) =>
                        setEstablishmentFormData({ ...establishmentFormData, banner_url: e.target.value })
                      }
                      placeholder="/images/banner-principal.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={establishmentFormData.email}
                    onChange={(e) => setEstablishmentFormData({ ...establishmentFormData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={establishmentFormData.address}
                    onChange={(e) => setEstablishmentFormData({ ...establishmentFormData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="operating_hours">Horário de Funcionamento</Label>
                  <Input
                    id="operating_hours"
                    value={establishmentFormData.operating_hours}
                    onChange={(e) =>
                      setEstablishmentFormData({ ...establishmentFormData, operating_hours: e.target.value })
                    }
                    placeholder="Segunda a Sexta: 8h às 18h, Sábado: 8h às 12h"
                  />
                </div>

                <div>
                  <Label htmlFor="payment_methods">Métodos de Pagamento (separados por vírgula)</Label>
                  <Input
                    id="payment_methods"
                    value={establishmentFormData.payment_methods}
                    onChange={(e) =>
                      setEstablishmentFormData({ ...establishmentFormData, payment_methods: e.target.value })
                    }
                    placeholder="Dinheiro, Cartão de Crédito, Cartão de Débito, PIX"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
