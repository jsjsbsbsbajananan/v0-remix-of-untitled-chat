import { notFound } from "next/navigation"
import SportsApp from "@/components/sports-app"

interface PageProps {
  params: {
    subdominio: string
    modulo: string
  }
}

export default async function PublicModulePage({ params }: PageProps) {
  const { subdominio, modulo } = params

  // Verificar se o subdomínio existe no banco de dados
  const validSubdomains = ["maria", "joao", "ana", "carlos", "admin", "demo"] // Mock data

  if (!validSubdomains.includes(subdominio)) {
    notFound()
  }

  // Verificar se o módulo é válido - focando apenas no sistema esportivo
  const validModules = ["esportes", "agendamento"]

  if (!validModules.includes(modulo)) {
    notFound()
  }

  // Buscar configurações do usuário baseado no subdomínio
  const userConfig = {
    companyName: `${subdominio.charAt(0).toUpperCase() + subdominio.slice(1)} Sports Center`,
    logo: "/car-logo.png",
    primaryColor: "#ef4444", // Sports red theme
    modules: ["esportes", "agendamento"],
  }

  // Verificar se o usuário tem acesso ao módulo solicitado
  if (!userConfig.modules.includes(modulo)) {
    notFound()
  }

  // Renderizar o sistema esportivo para ambos os módulos
  return <SportsApp />
}

export async function generateStaticParams() {
  // Em produção, isso buscaria todos os subdomínios e módulos do banco
  return []
}
