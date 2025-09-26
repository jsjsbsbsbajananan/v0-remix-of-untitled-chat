"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  email: string
  company: string
  modules: string[]
  subscriptionStatus: "pending" | "active" | "expired"
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGOUT" }

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id" | "subscriptionStatus"> & { password: string }) => Promise<boolean>
  logout: () => void
  updateSubscription: (status: User["subscriptionStatus"]) => void
} | null>(null)

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for stored user data on mount
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          dispatch({ type: "SET_USER", payload: user })
        }
      } catch {
        localStorage.removeItem("user")
      } finally {
        setTimeout(() => {
          dispatch({ type: "SET_LOADING", payload: false })
        }, 100)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - in real app, this would be an API call
    const mockUser: User = {
      id: "1",
      name: "João Silva",
      email,
      company: "Empresa Demo",
      modules: ["agendamento", "cardapio"],
      subscriptionStatus: "active",
    }

    localStorage.setItem("user", JSON.stringify(mockUser))
    dispatch({ type: "SET_USER", payload: mockUser })
    return true
  }

  const register = async (
    userData: Omit<User, "id" | "subscriptionStatus"> & { password: string },
  ): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      company: userData.company,
      modules: userData.modules,
      subscriptionStatus: "active",
    }

    localStorage.setItem("user", JSON.stringify(newUser))
    dispatch({ type: "SET_USER", payload: newUser })
    return true
  }

  const logout = () => {
    localStorage.removeItem("user")
    dispatch({ type: "LOGOUT" })
  }

  const updateSubscription = (status: User["subscriptionStatus"]) => {
    if (state.user) {
      const updatedUser = { ...state.user, subscriptionStatus: status }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      dispatch({ type: "SET_USER", payload: updatedUser })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        register,
        logout,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
