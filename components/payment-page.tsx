"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Calendar, Menu, Package, CreditCard, Smartphone, QrCode, CheckCircle, Clock } from "lucide-react"

const moduleInfo = {
  agendamento: {
    name: "Agendamento",
    description: "Sistema completo de agendamentos e reservas",
    icon: Calendar,
    price: 29.9,
  },
  cardapio: {
    name: "Cardápio",
    description: "Gestão de cardápios e pedidos online",
    icon: Menu,
    price: 24.9,
  },
  catalogo: {
    name: "Catálogo",
    description: "Catálogo de produtos e serviços",
    icon: Package,
    price: 19.9,
  },
}

const paymentMethods = [
  {
    id: "pix",
    name: "PIX",
    description: "Pagamento instantâneo",
    icon: QrCode,
    processingTime: "Imediato",
  },
  {
    id: "credit",
    name: "Cartão de Crédito",
    description: "Visa, Mastercard, Elo",
    icon: CreditCard,
    processingTime: "1-2 dias úteis",
  },
  {
    id: "debit",
    name: "Cartão de Débito",
    description: "Débito online",
    icon: Smartphone,
    processingTime: "Imediato",
  },
]

export default function PaymentPage() {
  const { state, updateSubscription } = useAuth()
  const router = useRouter()
  const [selectedPayment, setSelectedPayment] = useState("pix")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"select" | "processing" | "success">("select")

  const user = state.user!
  const userModules = user.modules.map((moduleId) => moduleInfo[moduleId as keyof typeof moduleInfo])

  const calculateTotal = () => {
    return userModules.reduce((total, module) => total + module.price, 0)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStep("processing")

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Update subscription status
    updateSubscription("active")
    setPaymentStep("success")

    // Redirect to dashboard after success
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  if (paymentStep === "processing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Processando pagamento...</h3>
                <p className="text-muted-foreground text-sm">Aguarde enquanto confirmamos seu pagamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStep === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">Pagamento confirmado!</h3>
                <p className="text-muted-foreground text-sm">Redirecionando para o painel administrativo...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Finalizar Assinatura</h1>
          <p className="text-muted-foreground">Complete o pagamento para ativar seus módulos</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
                <CardDescription>Módulos selecionados para {user.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userModules.map((module) => {
                  const IconComponent = module.icon
                  return (
                    <div key={module.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                      <span className="font-semibold">R$ {module.price.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )
                })}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {calculateTotal().toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto (Primeiro mês)</span>
                    <span>-R$ 0,00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total mensal</span>
                    <span className="text-primary">R$ {calculateTotal().toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Cobrança recorrente</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Você será cobrado mensalmente. Cancele a qualquer momento.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span>{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empresa:</span>
                  <span>{user.company}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>Escolha como deseja pagar sua assinatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon
                  const isSelected = selectedPayment === method.id

                  return (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{method.name}</h4>
                            {isSelected && <Badge variant="default">Selecionado</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Processamento: {method.processingTime}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {selectedPayment === "pix" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Pagamento via PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="bg-muted p-8 rounded-lg">
                    <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Chave PIX (simulada):</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426614174000
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Escaneie o QR Code ou copie a chave PIX para fazer o pagamento
                  </p>
                </CardContent>
              </Card>
            )}

            <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing}>
              {isProcessing
                ? "Processando..."
                : `Confirmar Pagamento - R$ ${calculateTotal().toFixed(2).replace(".", ",")}`}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <p>Ao confirmar o pagamento, você concorda com nossos</p>
              <p>
                <span className="underline cursor-pointer">Termos de Serviço</span> e{" "}
                <span className="underline cursor-pointer">Política de Privacidade</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
