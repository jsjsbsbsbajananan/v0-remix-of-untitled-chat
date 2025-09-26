"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import LoadingSpinner from "@/components/loading-spinner"

export default function Dashboard() {
  const { state } = useAuth()
  const router = useRouter()
  const [hasNavigated, setHasNavigated] = useState(false)

  useEffect(() => {
    if (!state.isLoading && !hasNavigated) {
      if (!state.isAuthenticated) {
        setHasNavigated(true)
        router.push("/")
      } else if (state.user?.subscriptionStatus !== "active") {
        setHasNavigated(true)
        router.push("/payment")
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user, router, hasNavigated])

  if (state.isLoading || !state.user || state.user.subscriptionStatus !== "active") {
    return <LoadingSpinner />
  }

  return <DashboardLayout />
}
