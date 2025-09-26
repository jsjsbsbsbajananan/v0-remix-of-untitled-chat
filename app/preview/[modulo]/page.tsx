import { notFound } from "next/navigation"
import BookingWebsite from "@/components/booking-website"
import MenuPage from "@/components/menu-page"
import CatalogPage from "@/components/catalog-page"

interface PageProps {
  params: {
    modulo: string
  }
}

export default function PreviewPage({ params }: PageProps) {
  const { modulo } = params

  const validModules = ["agendamento", "cardapio", "catalogo"]

  if (!validModules.includes(modulo)) {
    notFound()
  }

  // Configuração de preview padrão
  const previewConfig = {
    companyName: "Empresa Demo - Preview",
    logo: "/generic-company-logo.png",
    primaryColor: "#3b82f6",
    modules: ["agendamento", "cardapio", "catalogo"],
  }

  // Renderizar o componente apropriado
  switch (modulo) {
    case "agendamento":
      return <BookingWebsite userConfig={previewConfig} subdomain="preview" />
    case "cardapio":
      return <MenuPage userConfig={previewConfig} subdomain="preview" />
    case "catalogo":
      return <CatalogPage userConfig={previewConfig} subdomain="preview" />
    default:
      notFound()
  }
}
