"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ShoppingBag, Star, Filter } from "lucide-react"

interface CatalogPageProps {
  userConfig: {
    companyName: string
    logo: string
    primaryColor: string
  }
  subdomain: string
}

export default function CatalogPage({ userConfig, subdomain }: CatalogPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")

  // Mock data para catálogo
  const categories = [
    { id: "todos", name: "Todos os Produtos" },
    { id: "eletronicos", name: "Eletrônicos" },
    { id: "roupas", name: "Roupas" },
    { id: "casa", name: "Casa e Decoração" },
  ]

  const products = [
    {
      id: 1,
      name: "Smartphone Premium",
      description: "Smartphone com câmera de alta qualidade e bateria duradoura",
      price: 899.9,
      originalPrice: 1199.9,
      category: "eletronicos",
      image: "/modern-smartphone.png",
      rating: 4.7,
      reviews: 128,
      inStock: true,
    },
    {
      id: 2,
      name: "Camiseta Básica",
      description: "Camiseta 100% algodão, confortável e durável",
      price: 39.9,
      category: "roupas",
      image: "/plain-tshirt.png",
      rating: 4.5,
      reviews: 89,
      inStock: true,
    },
    {
      id: 3,
      name: "Luminária LED",
      description: "Luminária moderna com controle de intensidade",
      price: 129.9,
      category: "casa",
      image: "/luminaria.jpg",
      rating: 4.8,
      reviews: 45,
      inStock: false,
    },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "todos" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Ofertas Especiais</h2>
          <p className="text-lg opacity-90">Descontos de até 50% em produtos selecionados</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Categorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full justify-start"
                  >
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory === "todos"
                  ? "Todos os Produtos"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-muted-foreground">{filteredProducts.length} produtos encontrados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.originalPrice && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </Badge>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Esgotado</Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({product.reviews} avaliações)</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            R$ {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button className="w-full" disabled={!product.inStock}>
                      {product.inStock ? "Comprar Agora" : "Esgotado"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Nenhum produto encontrado</p>
                <p className="text-muted-foreground">Tente ajustar os filtros ou termo de busca</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
