"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Star } from "lucide-react"

interface MenuPageProps {
  userConfig: {
    companyName: string
    logo: string
    primaryColor: string
  }
  subdomain: string
}

export default function MenuPage({ userConfig, subdomain }: MenuPageProps) {
  const [cart, setCart] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("todos")

  // Mock data para cardápio
  const categories = [
    { id: "todos", name: "Todos" },
    { id: "lanches", name: "Lanches" },
    { id: "bebidas", name: "Bebidas" },
    { id: "sobremesas", name: "Sobremesas" },
  ]

  const products = [
    {
      id: 1,
      name: "Hambúrguer Clássico",
      description: "Pão, carne, queijo, alface, tomate",
      price: 25.9,
      category: "lanches",
      image: "/classic-beef-hamburger.png",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Refrigerante Lata",
      description: "Coca-Cola, Pepsi, Guaraná",
      price: 5.5,
      category: "bebidas",
      image: "/refreshing-soda.png",
      rating: 4.5,
    },
    {
      id: 3,
      name: "Brownie com Sorvete",
      description: "Brownie quente com sorvete de baunilha",
      price: 12.9,
      category: "sobremesas",
      image: "/chocolate-brownie.png",
      rating: 4.9,
    },
  ]

  const filteredProducts =
    selectedCategory === "todos" ? products : products.filter((p) => p.category === selectedCategory)

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={userConfig.logo || "/placeholder.svg"} alt="Logo" className="h-10 w-10 rounded-lg" />
              <h1 className="text-2xl font-bold text-foreground">{userConfig.companyName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="relative bg-transparent">
                <ShoppingCart className="h-4 w-4" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">{product.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{product.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                  <Button onClick={() => addToCart(product)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
            <CardHeader>
              <CardTitle>Seu Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mb-4">
                <div className="flex items-center justify-between font-bold">
                  <span>Total:</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full">Finalizar Pedido</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
