"use client"

import { Calendar, Clock, User, Phone, MessageSquare, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface BookingConfirmationProps {
  slug: string
  bookingData: {
    service?: string
    professional?: string
    date?: string
    time?: string
    name?: string
    phone?: string
    notes?: string
  }
}

export default function BookingConfirmation({ slug, bookingData }: BookingConfirmationProps) {
  const businessName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const generateGoogleCalendarUrl = () => {
    const startDate = new Date(`${bookingData.date}T${bookingData.time}:00`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 hora

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Agendamento - ${bookingData.service}`,
      dates: `${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      details: `Serviço: ${bookingData.service}\nProfissional: ${bookingData.professional}\nCliente: ${bookingData.name}\nTelefone: ${bookingData.phone}${bookingData.notes ? `\nObservações: ${bookingData.notes}` : ""}`,
      location: businessName,
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  const generateWhatsAppUrl = () => {
    const message =
      `🗓️ *Confirmação de Agendamento*\n\n` +
      `📋 *Serviço:* ${bookingData.service}\n` +
      `👨‍⚕️ *Profissional:* ${bookingData.professional}\n` +
      `📅 *Data:* ${formatDate(bookingData.date!)}\n` +
      `⏰ *Horário:* ${bookingData.time}\n` +
      `👤 *Cliente:* ${bookingData.name}\n` +
      `📱 *Telefone:* ${bookingData.phone}` +
      (bookingData.notes ? `\n📝 *Observações:* ${bookingData.notes}` : "") +
      `\n\n✅ Agendamento confirmado com ${businessName}!`

    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mensagem de Sucesso */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600">Seu horário foi reservado com sucesso.</p>
        </div>

        {/* Detalhes do Agendamento */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detalhes do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Serviço</p>
                  <p className="font-medium">{bookingData.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Profissional</p>
                  <p className="font-medium">{bookingData.professional}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-medium">{formatDate(bookingData.date!)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Horário</p>
                  <p className="font-medium">{bookingData.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{bookingData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{bookingData.phone}</p>
                </div>
              </div>
            </div>

            {bookingData.notes && (
              <div className="flex items-start gap-3 pt-4 border-t">
                <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="font-medium">{bookingData.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button asChild className="h-12 bg-transparent" variant="outline">
            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Adicionar ao Google Agenda
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          <Button asChild className="h-12">
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              Compartilhar no WhatsApp
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Informações Importantes */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">• Chegue com 10 minutos de antecedência</p>
            <p className="text-gray-600">• Em caso de cancelamento, avise com pelo menos 2 horas de antecedência</p>
            <p className="text-gray-600">• Traga um documento de identificação</p>
            <p className="text-gray-600">• Para reagendar, entre em contato pelo telefone {bookingData.phone}</p>
          </CardContent>
        </Card>

        {/* Voltar */}
        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href={`/${slug}`}>Fazer Novo Agendamento</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
