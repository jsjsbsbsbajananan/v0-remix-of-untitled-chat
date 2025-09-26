"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context" // Import the useAuth hook
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Calendar, Menu, Package, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

const modules = [
  {
    id: "agendamento",
    name: "Agendamento",
    description: "Sistema completo de agendamentos e reservas",
    icon: Calendar,
  },
  {
    id: "cardapio",
    name: "Cardápio",
    description: "Gestão de cardápios e pedidos online",
    icon: Menu,
  },
  {
    id: "catalogo",
    name: "Catálogo",
    description: "Catálogo de produtos e serviços",
    icon: Package,
  },
]

export default function AuthPage() {
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [error, setError] = useState("")

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(loginData.email, loginData.password)
      if (!success) {
        setError("Credenciais inválidas. Tente novamente.")
      }
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.")
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedModules.length === 0) {
      setError("Selecione pelo menos um módulo para continuar")
      return
    }

    if (registerData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const success = await register({
        ...registerData,
        modules: selectedModules,
      })
      if (!success) {
        setError("Erro ao criar conta. Tente novamente.")
      }
    } catch (error) {
      setError("Erro ao criar conta. Tente novamente.")
      console.error("Registration failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const calculateTotal = () => {
    const prices = {
      agendamento: 29.9,
      cardapio: 24.9,
      catalogo: 19.9,
    }

    return selectedModules.reduce((total, moduleId) => {
      return total + (prices[moduleId as keyof typeof prices] || 0)
    }, 0)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sistema Administrativo</h1>
          <p className="text-muted-foreground">Plataforma completa para gestão empresarial</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Fazer Login</CardTitle>
                <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={loginData.password}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Conta demo: qualquer email e senha</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>Crie sua conta e escolha os módulos desejados</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome</Label>
                      <Input
                        id="register-name"
                        placeholder="Seu nome"
                        value={registerData.name}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-company">Empresa</Label>
                      <Input
                        id="register-company"
                        placeholder="Nome da empresa"
                        value={registerData.company}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, company: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Crie uma senha (mín. 6 caracteres)"
                        value={registerData.password}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Escolha os módulos desejados:</Label>
                    <div className="space-y-3">
                      {modules.map((module) => {
                        const IconComponent = module.icon
                        const isSelected = selectedModules.includes(module.id)

                        return (
                          <div
                            key={module.id}
                            className={`border rounded-lg p-4 transition-all ${
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleModuleToggle(module.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 cursor-pointer" onClick={() => handleModuleToggle(module.id)}>
                                <div className="flex items-center gap-2 mb-1">
                                  <IconComponent className="h-4 w-4" />
                                  <h3 className="font-medium">{module.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{module.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {selectedModules.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            {selectedModules.length} módulo{selectedModules.length > 1 ? "s" : ""} selecionado
                            {selectedModules.length > 1 ? "s" : ""}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center mt-2">
                            {selectedModules.map((moduleId) => {
                              const module = modules.find((m) => m.id === moduleId)
                              return (
                                <Badge key={moduleId} variant="secondary">
                                  {module?.name}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || selectedModules.length === 0}>
                    {isLoading ? "Criando conta..." : "Criar conta e acessar painel"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
