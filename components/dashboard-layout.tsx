"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useMobile } from "@/hooks/use-mobile"
import BannerAdmin from "./banner-admin"
import CourtsAdmin from "./courts-admin" // New import
import CourtSchedulesAdmin from "./court-schedules-admin" // New import
import ReservationsAdmin from "./reservations-admin" // New import
import BattlesAdmin from "./battles-admin" // New import
import PromotionsAdmin from "./promotions-admin" // New import
import RankingAdmin from "./ranking-admin" // New import
import CourtsOverview from "./courts-overview" // New import

import {
  Calendar,
  Menu,
  Package,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  MenuIcon,
  X,
  Bell,
  Search,
  Users,
  Clock,
  ShoppingCart,
  Edit,
  ImageIcon,
  ChevronDown,
  ChevronRight,
  Store,
  RotateCcw,
  Target,
  Award,
  Zap,
  Plus,
  Home,
  User,
  AlertTriangle,
  Link,
  ExternalLink,
  Eye,
} from "lucide-react"

const moduleInfo = {
  agendamento: {
    name: "Quadras Esportivas",
    description: "Sistema completo de quadras e batalhas",
    icon: Calendar,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  cardapio: {
    name: "Cardápio",
    description: "Gestão de cardápios e pedidos",
    icon: Menu,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  catalogo: {
    name: "Catálogo",
    description: "Catálogo de produtos e serviços",
    icon: Package,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
}

const getModuleSubmenus = (moduleId: string) => {
  switch (moduleId) {
    case "agendamento":
      return [
        { id: "dashboard", name: "Dashboard", icon: BarChart3 },
        { id: "courts", name: "Quadras", icon: Package }, // Changed from "services" to "courts"
        { id: "schedules", name: "Horários", icon: Clock }, // Changed from "professionals" to "schedules"
        { id: "reservations", name: "Reservas", icon: Calendar }, // Changed from "appointments" to "reservations"
        { id: "battles", name: "Batalhas", icon: Trophy }, // New battles section
        { id: "promotions", name: "Precificação", icon: Target }, // New promotions section
        { id: "ranking", name: "Ranking", icon: Award }, // New ranking section
        { id: "banner", name: "Sistema de Banner", icon: ImageIcon },
        { id: "url-config", name: "Configurar URL", icon: Link },
      ]
    case "catalogo":
      return [
        { id: "dashboard", name: "Dashboard", icon: BarChart3 },
        { id: "categories", name: "Categorias", icon: Package },
        { id: "products", name: "Produtos", icon: Package },
        { id: "orders", name: "Pedidos", icon: ShoppingCart },
        { id: "banner", name: "Sistema de Banner", icon: ImageIcon },
        { id: "customization", name: "Personalização da Loja", icon: Store },
        { id: "url-config", name: "Configurar URL", icon: Link },
      ]
    case "cardapio":
      return [
        { id: "dashboard", name: "Dashboard", icon: BarChart3 },
        { id: "categories", name: "Categorias", icon: Package },
        { id: "products", name: "Produtos", icon: Package },
        { id: "orders", name: "Pedidos", icon: ShoppingCart },
        { id: "banner", name: "Sistema de Banner", icon: ImageIcon },
        { id: "customization", name: "Personalização da Loja", icon: Store },
        { id: "url-config", name: "Configurar URL", icon: Link },
      ]
    default:
      return []
  }
}

const getRankingSubmenus = () => [
  { id: "dashboard", name: "Dashboard", icon: BarChart3 },
  { id: "global", name: "Ranking Global", icon: Trophy },
  { id: "rules", name: "Regras de Pontuação", icon: Target },
  { id: "reset", name: "Resetar Ranking", icon: RotateCcw },
]

const mockClients = [
  { id: 1, name: "João Silva", phone: "(11) 99999-9999", email: "joao@email.com", visits: 15, lastVisit: "Hoje" },
  { id: 2, name: "Maria Santos", phone: "(11) 88888-8888", email: "maria@email.com", visits: 8, lastVisit: "Ontem" },
  { id: 3, name: "Pedro Costa", phone: "(11) 77777-7777", email: "pedro@email.com", visits: 12, lastVisit: "2 dias" },
  { id: 4, name: "Ana Oliveira", phone: "(11) 66666-6666", email: "ana@email.com", visits: 20, lastVisit: "Hoje" },
]

const mockProfessionals = [
  { id: 1, name: "Dr. Carlos Mendes", specialty: "Clínico Geral", schedule: "08:00 - 18:00", status: "Ativo" },
  { id: 2, name: "Dra. Ana Paula", specialty: "Dermatologia", schedule: "14:00 - 20:00", status: "Ativo" },
  { id: 3, name: "Dr. Roberto Silva", specialty: "Cardiologia", schedule: "07:00 - 15:00", status: "Inativo" },
]

const mockOrders = [
  {
    id: "#001",
    client: "João Silva",
    product: "Pizza Margherita",
    status: "Entregue",
    value: "R$ 35,00",
    time: "14:30",
  },
  {
    id: "#002",
    client: "Maria Santos",
    product: "Hambúrguer Artesanal",
    status: "Preparando",
    value: "R$ 28,00",
    time: "15:15",
  },
  { id: "#003", client: "Pedro Costa", product: "Salada Caesar", status: "Pendente", value: "R$ 22,00", time: "15:45" },
  {
    id: "#004",
    client: "Ana Oliveira",
    product: "Lasanha Bolonhesa",
    status: "Pronto",
    value: "R$ 32,00",
    time: "16:00",
  },
]

const mockCategories = [
  { id: 1, name: "Pizzas", items: 12, status: "Ativa" },
  { id: 2, name: "Hambúrguers", items: 8, status: "Ativa" },
  { id: 3, name: "Saladas", items: 6, status: "Ativa" },
  { id: 4, name: "Bebidas", items: 15, status: "Ativa" },
  { id: 5, name: "Sobremesas", items: 4, status: "Inativa" },
]

const mockProducts = [
  { id: 1, name: "Pizza Margherita", price: "R$ 35,00", category: "Pizzas", stock: 25, status: "Ativo" },
  { id: 2, name: "Hambúrguer Clássico", price: "R$ 28,00", category: "Hambúrguers", stock: 18, status: "Ativo" },
  { id: 3, name: "Salada Caesar", price: "R$ 22,00", category: "Saladas", stock: 12, status: "Ativo" },
  { id: 4, name: "Coca-Cola 350ml", price: "R$ 5,00", category: "Bebidas", stock: 50, status: "Ativo" },
]

export default function DashboardLayout() {
  const { state, logout } = useAuth()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>("dashboard")
  const [rankingModule, setRankingModule] = useState<string | null>(null)

  const [slugs, setSlugs] = useState<Record<string, string>>({
    agendamento: "",
    cardapio: "",
    catalogo: "",
  })
  const [slugErrors, setSlugErrors] = useState<Record<string, string>>({})
  const [slugLoading, setSlugLoading] = useState<Record<string, boolean>>({})

  const user = state.user!
  const userModules = user.modules.map((moduleId) => ({
    id: moduleId,
    ...moduleInfo[moduleId as keyof typeof moduleInfo],
  }))

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const navigateToSection = (moduleId: string, sectionId: string, rankingModuleId?: string) => {
    setActiveModule(moduleId)
    setActiveSection(sectionId)
    if (rankingModuleId) {
      setRankingModule(rankingModuleId)
    } else {
      setRankingModule(null)
    }
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const navigateHome = () => {
    setActiveModule(null)
    setActiveSection("dashboard")
    setRankingModule(null)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const renderBreadcrumb = () => {
    const breadcrumbs = []

    breadcrumbs.push({ name: "Dashboard", onClick: navigateHome })

    if (activeModule) {
      const moduleName =
        activeModule === "ranking" ? "Ranking" : moduleInfo[activeModule as keyof typeof moduleInfo]?.name
      breadcrumbs.push({ name: moduleName })

      if (rankingModule) {
        breadcrumbs.push({ name: moduleInfo[rankingModule as keyof typeof moduleInfo]?.name })
      }

      if (activeSection !== "dashboard") {
        const submenus = activeModule === "ranking" ? getRankingSubmenus() : getModuleSubmenus(activeModule)
        const currentSubmenu = submenus.find((s) => s.id === activeSection)
        if (currentSubmenu) {
          breadcrumbs.push({ name: currentSubmenu.name })
        }
      }
    }

    return (
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
            {crumb.onClick ? (
              <button onClick={crumb.onClick} className="hover:text-foreground transition-colors">
                {crumb.name}
              </button>
            ) : (
              <span className="text-foreground font-medium">{crumb.name}</span>
            )}
          </div>
        ))}
      </nav>
    )
  }

  const validateSlug = (slug: string): boolean => {
    const slugRegex = /^[a-z0-9-]+$/
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
  }

  const checkSlugAvailability = async (slug: string, moduleId: string): Promise<boolean> => {
    // Simular verificação no banco de dados
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Slugs já em uso (simulação)
    const usedSlugs = ["maria-loja", "joao-agendamento", "teste-cardapio"]

    return !usedSlugs.includes(slug)
  }

  const handleSlugChange = (moduleId: string, value: string) => {
    const cleanSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
    setSlugs((prev) => ({ ...prev, [moduleId]: cleanSlug }))
    setSlugErrors((prev) => ({ ...prev, [moduleId]: "" }))
  }

  const handleSlugSave = async (moduleId: string) => {
    const slug = slugs[moduleId]

    if (!validateSlug(slug)) {
      setSlugErrors((prev) => ({
        ...prev,
        [moduleId]: "O slug deve ter entre 3-50 caracteres e conter apenas letras minúsculas, números e hífens",
      }))
      return
    }

    setSlugLoading((prev) => ({ ...prev, [moduleId]: true }))

    try {
      const isAvailable = await checkSlugAvailability(slug, moduleId)

      if (!isAvailable) {
        setSlugErrors((prev) => ({
          ...prev,
          [moduleId]: "Este subdomínio já está em uso, tente outro nome.",
        }))
      } else {
        // Simular salvamento no banco
        console.log(`Slug salvo: ${slug} para módulo ${moduleId}`)
        setSlugErrors((prev) => ({ ...prev, [moduleId]: "" }))
        // Aqui você salvaria no banco de dados real
      }
    } catch (error) {
      setSlugErrors((prev) => ({
        ...prev,
        [moduleId]: "Erro ao verificar disponibilidade. Tente novamente.",
      }))
    } finally {
      setSlugLoading((prev) => ({ ...prev, [moduleId]: false }))
    }
  }

  const getPublicUrl = (moduleId: string) => {
    const slug = slugs[moduleId]
    if (!slug) return ""
    return `https://v0-user-registration-and-payment.vercel.app/${slug}`
  }

  const renderContent = () => {
    if (!activeModule) {
      return (
        <div className="space-y-8">
          {renderBreadcrumb()}

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo, {user.name}!</h2>
                <p className="text-muted-foreground">Gerencie seus módulos e acompanhe o desempenho do seu negócio</p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Seus Módulos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userModules.map((module) => {
                const IconComponent = module.icon
                return (
                  <Card
                    key={module.id}
                    className={`hover:shadow-lg transition-all duration-200 border-0 ${module.bgColor} ${module.borderColor} border hover:scale-[1.02]`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} shadow-lg`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-foreground">{module.name}</CardTitle>
                          <CardDescription className="text-muted-foreground">{module.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Ativo
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigateToSection(module.id, "dashboard")}
                          className="flex-1 bg-primary hover:bg-primary/90"
                          size="sm"
                        >
                          Gerenciar
                        </Button>
                        <Button
                          onClick={() => window.open(`/preview/${module.id}`, "_blank")}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Ranking Module */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-yellow-500/10 border-yellow-500/20 border hover:scale-[1.02]"
                onClick={() => navigateToSection("ranking", "dashboard")}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">Ranking</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Sistema de pontuação e rankings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      Disponível
                    </Badge>
                    <span className="text-sm text-muted-foreground">Clique para acessar →</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Overview */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumo da Conta</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Módulos Ativos</p>
                      <p className="text-3xl font-bold text-foreground">{userModules.length}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Package className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-3xl font-bold text-green-500">Ativo</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <Zap className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Plano</p>
                      <p className="text-3xl font-bold text-purple-500">Pro</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Dias Restantes</p>
                      <p className="text-3xl font-bold text-orange-500">30</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-xl">
                      <Clock className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {renderBreadcrumb()}

        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeModule !== "ranking" && (
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${moduleInfo[activeModule as keyof typeof moduleInfo]?.color} shadow-lg`}
              >
                {(() => {
                  const IconComponent = moduleInfo[activeModule as keyof typeof moduleInfo]?.icon
                  return IconComponent ? <IconComponent className="h-6 w-6 text-white" /> : null
                })()}
              </div>
            )}
            {activeModule === "ranking" && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {activeModule === "ranking"
                  ? `Ranking${rankingModule ? ` - ${moduleInfo[rankingModule as keyof typeof moduleInfo]?.name}` : ""}`
                  : moduleInfo[activeModule as keyof typeof moduleInfo]?.name}
              </h1>
              <p className="text-muted-foreground">
                {activeModule === "ranking"
                  ? "Sistema de pontuação e rankings"
                  : moduleInfo[activeModule as keyof typeof moduleInfo]?.description}
              </p>
            </div>
          </div>

          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>

        {/* Content based on active section */}
        {renderSectionContent()}
      </div>
    )
  }

  const renderSectionContent = () => {
    if (activeModule === "ranking") {
      return renderRankingContent()
    }

    switch (activeSection) {
      case "dashboard":
        return renderModuleDashboard()
      case "clients":
        return renderClientsSection()
      case "courts": // Changed from "services" to "courts"
        return <CourtsAdmin />
      case "schedules": // Changed from "professionals" to "schedules"
        return <CourtSchedulesAdmin />
      case "reservations": // Changed from "appointments" to "reservations"
        return <ReservationsAdmin />
      case "battles": // New battles section
        return <BattlesAdmin />
      case "promotions": // New promotions section
        return <PromotionsAdmin />
      case "ranking": // New ranking section in module context
        return <RankingAdmin />
      case "banner":
        return <BannerAdmin />
      case "orders":
        return renderOrdersSection()
      case "categories":
        return renderCategoriesSection()
      case "products":
        return renderProductsSection()
      case "url-config":
        return renderUrlConfigSection()
      default:
        return (
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle>Seção em Desenvolvimento</CardTitle>
              <CardDescription>Esta seção está sendo desenvolvida e estará disponível em breve.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Conteúdo em construção...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  const renderModuleDashboard = () => {
    if (!activeModule) return null

    const module = moduleInfo[activeModule as keyof typeof moduleInfo]
    if (!module) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status do Módulo</p>
                  <p className="text-3xl font-bold text-green-500">Ativo</p>
                  <p className="text-xs text-green-500">Funcionando normalmente</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Última Atualização</p>
                  <p className="text-3xl font-bold text-blue-500">Hoje</p>
                  <p className="text-xs text-blue-500">Sistema atualizado</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Configuração</p>
                  <p className="text-3xl font-bold text-purple-500">100%</p>
                  <p className="text-xs text-purple-500">Totalmente configurado</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Settings className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="text-3xl font-bold text-orange-500">Ótima</p>
                  <p className="text-xs text-orange-500">Resposta rápida</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Award className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeModule === "agendamento" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourtsOverview onNavigateToCourts={() => navigateToSection("agendamento", "courts")} />{" "}
            {/* Changed from ServicesOverview to CourtsOverview */}
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horários das Quadras {/* Changed title */}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure os horários de funcionamento das quadras {/* Updated description */}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigateToSection("agendamento", "schedules")}>
                    Gerenciar Horários
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Navegue rapidamente para as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getModuleSubmenus(activeModule)
                .slice(1)
                .map((submenu) => {
                  const IconComponent = submenu.icon
                  return (
                    <Button
                      key={submenu.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      onClick={() => navigateToSection(activeModule, submenu.id)}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-xs text-center">{submenu.name}</span>
                    </Button>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderClientsSection = () => (
    <Card className="border-0 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Gerencie todos os seus clientes</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Visitas</TableHead>
              <TableHead>Última Visita</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{client.visits}</Badge>
                </TableCell>
                <TableCell>{client.lastVisit}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderProfessionalsSection = () => (
    <Card className="border-0 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>Gerencie sua equipe de profissionais</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Profissional
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProfessionals.map((professional) => (
              <TableRow key={professional.id}>
                <TableCell className="font-medium">{professional.name}</TableCell>
                <TableCell>{professional.specialty}</TableCell>
                <TableCell>{professional.schedule}</TableCell>
                <TableCell>
                  <Badge variant={professional.status === "Ativo" ? "default" : "secondary"}>
                    {professional.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderOrdersSection = () => (
    <Card className="border-0 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Acompanhe todos os pedidos em tempo real</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.client}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "Entregue"
                        ? "default"
                        : order.status === "Preparando"
                          ? "secondary"
                          : order.status === "Pronto"
                            ? "default"
                            : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.value}</TableCell>
                <TableCell>{order.time}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderCategoriesSection = () => (
    <Card className="border-0 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Organize seus produtos em categorias</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{category.items} itens</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={category.status === "Ativa" ? "default" : "secondary"}>{category.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderProductsSection = () => (
    <Card className="border-0 bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Gerencie seu catálogo de produtos</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.stock}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === "Ativo" ? "default" : "secondary"}>{product.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderUrlConfigSection = () => {
    if (!activeModule) return null

    const moduleInfo = {
      agendamento: { name: "Agendamento", description: "Configure a URL pública do seu sistema de agendamentos" },
      cardapio: { name: "Cardápio", description: "Configure a URL pública do seu cardápio online" },
      catalogo: { name: "Catálogo", description: "Configure a URL pública do seu catálogo de produtos" },
    }

    const currentModule = moduleInfo[activeModule as keyof typeof moduleInfo]
    const currentSlug = slugs[activeModule]
    const hasError = slugErrors[activeModule]
    const isLoading = slugLoading[activeModule]
    const publicUrl = getPublicUrl(activeModule)

    return (
      <div className="space-y-6">
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Configurar URL Personalizada
            </CardTitle>
            <CardDescription>{currentModule?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Slug Personalizado</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        https://v0-user-registration-and-payment.vercel.app/
                      </span>
                      <input
                        type="text"
                        value={currentSlug}
                        onChange={(e) => handleSlugChange(activeModule, e.target.value)}
                        placeholder="minha-loja"
                        className="flex-1 px-3 py-2 border border-input rounded-r-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    {hasError && <p className="text-red-500 text-sm mt-1">{hasError}</p>}
                    <p className="text-muted-foreground text-xs mt-1">
                      Use apenas letras minúsculas, números e hífens. Mínimo 3 caracteres.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleSlugSave(activeModule)}
                    disabled={!currentSlug || isLoading}
                    className="px-6"
                  >
                    {isLoading ? "Verificando..." : "Salvar"}
                  </Button>
                </div>
              </div>

              {publicUrl && !hasError && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">URL Configurada</p>
                      <p className="text-sm text-muted-foreground break-all">{publicUrl}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(publicUrl, "_blank")}
                      className="ml-4 bg-transparent border-green-500/20 text-green-600 hover:bg-green-500/10"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualizar Site
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-medium text-foreground mb-3">Informações Importantes</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Cada módulo pode ter sua própria URL personalizada</p>
                <p>• O slug deve ser único em todo o sistema</p>
                <p>• Após salvar, a URL ficará disponível publicamente</p>
                <p>• Você pode alterar o slug a qualquer momento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle>Prévia do Site</CardTitle>
            <CardDescription>Como seus clientes verão o {currentModule?.name.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {publicUrl ? "Prévia do site será exibida aqui" : "Configure um slug para ver a prévia"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRankingContent = () => {
    if (userModules.length > 1 && !rankingModule) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userModules.map((module) => {
            const IconComponent = module.icon
            return (
              <Card
                key={module.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-0 ${module.bgColor} ${module.borderColor} border hover:scale-[1.02]`}
                onClick={() => navigateToSection("ranking", "dashboard", module.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">Ranking - {module.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">Ver ranking deste módulo</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    Clique para acessar →
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )
    }

    // Render ranking sections
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                    <p className="text-3xl font-bold text-foreground">156</p>
                    <p className="text-xs text-green-500">+5% este mês</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pontuação Média</p>
                    <p className="text-3xl font-bold text-foreground">847</p>
                    <p className="text-xs text-green-500">+12% vs mês anterior</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Award className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Líder do Mês</p>
                    <p className="text-xl font-bold text-foreground">João Silva</p>
                    <p className="text-xs text-yellow-500">1,250 pontos</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-xl">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Atividade</p>
                    <p className="text-3xl font-bold text-foreground">+12%</p>
                    <p className="text-xs text-purple-500">vs semana anterior</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Zap className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "global":
        return (
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle>Ranking Global</CardTitle>
              <CardDescription>Top clientes por pontuação</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Última Atividade</TableHead>
                    <TableHead>Nível</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClients.map((client, index) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}º</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.visits * 10} pts</TableCell>
                      <TableCell>{client.lastVisit}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{index === 0 ? "Ouro" : index === 1 ? "Prata" : "Bronze"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )

      case "rules":
        return (
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle>Regras de Pontuação</CardTitle>
              <CardDescription>Configure como os pontos são atribuídos aos clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visit-points">Pontos por Visita</Label>
                  <Input id="visit-points" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-points">Pontos por R$ Gasto</Label>
                  <Input id="purchase-points" type="number" defaultValue="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referral-points">Pontos por Indicação</Label>
                  <Input id="referral-points" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonus-points">Bônus Mensal</Label>
                  <Input id="bonus-points" type="number" defaultValue="100" />
                </div>
              </div>
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Salvar Regras
              </Button>
            </CardContent>
          </Card>
        )

      case "reset":
        return (
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-red-500">Resetar Ranking</CardTitle>
              <CardDescription>
                Esta ação irá zerar todos os pontos dos clientes. Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Atenção!
                </h4>
                <p className="text-red-600 text-sm">
                  Ao resetar o ranking, todos os clientes terão sua pontuação zerada. Esta ação é irreversível e afetará
                  todo o histórico de pontuação.
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="destructive" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Confirmar Reset
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return renderModuleDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ${
          isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">S</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-sidebar-foreground">Sistema</h2>
                  <p className="text-sm text-sidebar-foreground/60">{user.company}</p>
                </div>
              </div>
              {isMobile && (
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Home */}
            <button
              onClick={navigateHome}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                !activeModule
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </button>

            <div className="my-4">
              <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3">
                Módulos ({userModules.length + 1})
              </h3>

              {/* User Modules */}
              {userModules.map((module) => {
                const IconComponent = module.icon
                const isExpanded = expandedModules.includes(module.id)
                const submenus = getModuleSubmenus(module.id)

                return (
                  <div key={module.id} className="space-y-1">
                    <button
                      onClick={() => toggleModuleExpansion(module.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <div className={`p-1.5 rounded-md bg-gradient-to-br ${module.color}`}>
                        <IconComponent className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium flex-1">{module.name}</span>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="ml-6 space-y-1">
                        {submenus.map((submenu) => {
                          const SubmenuIcon = submenu.icon
                          const isActive = activeModule === module.id && activeSection === submenu.id

                          return (
                            <button
                              key={submenu.id}
                              onClick={() => navigateToSection(module.id, submenu.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                                isActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                              }`}
                            >
                              <SubmenuIcon className="h-3 w-3" />
                              {submenu.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Ranking Module */}
              <div className="space-y-1">
                {userModules.length === 1 ? (
                  <div>
                    <button
                      onClick={() => toggleModuleExpansion("ranking")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-yellow-500 to-orange-500">
                        <Trophy className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium flex-1">Ranking</span>
                      {expandedModules.includes("ranking") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {expandedModules.includes("ranking") && (
                      <div className="ml-6 space-y-1">
                        {getRankingSubmenus().map((submenu) => {
                          const SubmenuIcon = submenu.icon
                          const isActive = activeModule === "ranking" && activeSection === submenu.id

                          return (
                            <button
                              key={submenu.id}
                              onClick={() => navigateToSection("ranking", submenu.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                                isActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                              }`}
                            >
                              <SubmenuIcon className="h-3 w-3" />
                              {submenu.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleModuleExpansion("ranking")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-yellow-500 to-orange-500">
                        <Trophy className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium flex-1">Ranking</span>
                      {expandedModules.includes("ranking") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {expandedModules.includes("ranking") && (
                      <div className="ml-6 space-y-1">
                        {userModules.map((module) => {
                          const ModuleIcon = module.icon
                          const isExpanded = expandedModules.includes(`ranking-${module.id}`)

                          return (
                            <div key={`ranking-${module.id}`} className="space-y-1">
                              <button
                                onClick={() => toggleModuleExpansion(`ranking-${module.id}`)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                              >
                                <ModuleIcon className="h-3 w-3" />
                                <span className="flex-1">{module.name}</span>
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="ml-4 space-y-1">
                                  {getRankingSubmenus().map((submenu) => {
                                    const SubmenuIcon = submenu.icon
                                    const isActive =
                                      activeModule === "ranking" &&
                                      activeSection === submenu.id &&
                                      rankingModule === module.id

                                    return (
                                      <button
                                        key={submenu.id}
                                        onClick={() => navigateToSection("ranking", submenu.id, module.id)}
                                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors text-xs ${
                                          isActive
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                            : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                        }`}
                                      >
                                        <SubmenuIcon className="h-3 w-3" />
                                        {submenu.name}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-sidebar-border pt-4 mt-4">
              <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3">
                Conta
              </h3>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Configurações</span>
              </button>
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${isMobile ? "" : "ml-72"} min-h-screen`}>
        <header className="bg-card border-b border-border p-4 sticky top-0 z-40 backdrop-blur-sm bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                  <MenuIcon className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {activeModule
                    ? `${activeModule === "ranking" ? "Ranking" : moduleInfo[activeModule as keyof typeof moduleInfo]?.name}${rankingModule ? ` - ${moduleInfo[rankingModule as keyof typeof moduleInfo]?.name}` : ""}`
                    : "Painel Administrativo"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {activeModule ? "Gerencie suas operações" : "Bem-vindo ao seu sistema de gestão"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {userModules.length} módulos
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  )
}
