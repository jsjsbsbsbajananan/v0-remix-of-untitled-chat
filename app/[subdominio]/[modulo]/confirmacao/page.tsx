import { notFound } from "next/navigation"
import BookingConfirmation from "@/components/booking-confirmation"

interface PageProps {
  params: {
    subdominio: string
    modulo: string
  }
  searchParams: {
    servico?: string
    profissional?: string
    data?: string
    horario?: string
    nome?: string
    telefone?: string
  }
}

export default function ConfirmationPage({ params, searchParams }: PageProps) {
  const { subdominio, modulo } = params

  // Verificar se é um módulo que tem confirmação
  if (modulo !== "agendamento") {
    notFound()
  }

  const userConfig = {
    companyName: `${subdominio.charAt(0).toUpperCase() + subdominio.slice(1)} - Empresa`,
    logo: "/generic-company-logo.png",
    primaryColor: "#3b82f6",
  }

  return <BookingConfirmation userConfig={userConfig} subdomain={subdominio} bookingData={searchParams} />
}
