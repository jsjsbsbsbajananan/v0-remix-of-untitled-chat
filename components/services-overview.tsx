"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, DollarSign, Clock, Eye } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  is_active: boolean
}

interface ServicesOverviewProps {
  onNavigateToServices: () => void
}

export default function ServicesOverview({ onNavigateToServices }: ServicesOverviewProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes, is_active")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Erro ao buscar serviços:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const activeServices = services.filter((service) => service.is_active)
  const totalServices = services.length
  const averagePrice =
    services.length > 0 ? services.reduce((sum, service) => sum + service.price, 0) / services.length : 0

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Serviços
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onNavigateToServices}>
            <Eye className="h-4 w-4 mr-1" />
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalServices}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeServices.length}</div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatPrice(averagePrice)}</div>
            <div className="text-xs text-muted-foreground">Preço Médio</div>
          </div>
        </div>

        {/* Recent Services */}
        {services.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Serviços Recentes</h4>
            {services.slice(0, 3).map((service) => (
              <div key={service.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{service.name}</span>
                    <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs">
                      {service.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(service.price)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(service.duration_minutes)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={onNavigateToServices}>
              Criar primeiro serviço
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
