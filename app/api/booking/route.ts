import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, service, professional, date, time, name, phone, notes } = body

    // Aqui você integraria com seu banco de dados
    // Por enquanto, apenas simular o salvamento
    console.log("Novo agendamento:", {
      slug,
      service,
      professional,
      date,
      time,
      name,
      phone,
      notes,
      createdAt: new Date().toISOString(),
    })

    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Agendamento confirmado com sucesso!",
      bookingId: Math.random().toString(36).substr(2, 9),
    })
  } catch (error) {
    console.error("Erro ao processar agendamento:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
