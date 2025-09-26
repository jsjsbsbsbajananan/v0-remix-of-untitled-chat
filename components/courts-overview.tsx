"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"
import { MapPin, Plus, DollarSign } from "lucide-react"

interface Court {
  id: string
  name: string
  description: string
  category: string
  price_per_hour: number
  status: string
}

interface CourtsOverviewProps {
  onNavigateToCourts: () => void
}

export default function CourtsOverview({ onNavigateToCourts }: CourtsOverviewProps) {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchCourts()
  }, [])

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .limit(3)
        .order("created_at", { ascending: false })

      if (error) throw error
      setCourts(data || [])
    } catch (error) {
      console.error("[v0] Error fetching courts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Quadras Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Quadras Cadastradas
        </CardTitle>
        <CardDescription>
          {courts.length === 0
            ? "Nenhuma quadra cadastrada"
            : `${courts.length} quadra${courts.length > 1 ? "s" : ""} recente${courts.length > 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {courts.length === 0 ? (
          <div className="text-center py-4">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Cadastre suas quadras esportivas</p>
            <Button variant="outline" size="sm" onClick={onNavigateToCourts}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Quadras
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {courts.map((court) => (
              <div key={court.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground">{court.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {court.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>R$ {court.price_per_hour.toFixed(2)}/hora</span>
                    <Badge
                      className={`text-xs ${
                        court.status === "available"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      {court.status === "available" ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={onNavigateToCourts} className="w-full bg-transparent">
              Ver Todas as Quadras
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
