"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import PaymentPage from "@/components/payment-page"
import LoadingSpinner from "@/components/loading-spinner"

export default function Payment() {
  const { state } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!state.isAuthenticated) {
      router.push("/")
    } else if (state.user?.subscriptionStatus === "active") {
      router.push("/dashboard")
    }
  }, [state.isAuthenticated, state.user, router])

  if (state.isLoading || !state.user) {
    return <LoadingSpinner />
  }

  return <PaymentPage />
}
