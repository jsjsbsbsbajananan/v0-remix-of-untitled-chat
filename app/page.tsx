"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthPage from "@/components/auth-page"
import LoadingSpinner from "@/components/loading-spinner"

export default function HomePage() {
  const { state } = useAuth()
  const router = useRouter()
  const [hasNavigated, setHasNavigated] = useState(false)

  useEffect(() => {
    if (!state.isLoading && !hasNavigated && state.isAuthenticated && state.user) {
      if (state.user.subscriptionStatus === "active") {
        setHasNavigated(true)
        router.push("/dashboard")
      } else if (state.user.subscriptionStatus === "pending") {
        setHasNavigated(true)
        router.push("/payment")
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user, router, hasNavigated])

  if (state.isLoading) {
    return <LoadingSpinner />
  }

  if (!state.isAuthenticated) {
    return <AuthPage />
  }

  return <LoadingSpinner />
}
