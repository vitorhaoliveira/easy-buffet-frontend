import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setToken(storedToken)
      // For now, we'll just set a mock user when token exists
      setUser({
        id: '1',
        email: 'admin@easybuffet.com',
        name: 'Admin User',
        avatar: ''
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - accept only hardcoded credentials
    if (email === 'admin@easybuffet.com' && password === 'admin123') {
      const mockToken = 'mock-jwt-token-' + Date.now()
      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Admin User',
        avatar: ''
      }
      
      setToken(mockToken)
      setUser(mockUser)
      localStorage.setItem('authToken', mockToken)
      return true
    }
    return false
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
  }

  const signup = async (name: string, email: string, password: string, confirmPassword: string): Promise<boolean> => {
    // For now, just validate fields and return success
    if (!name || !email || !password || !confirmPassword) {
      return false
    }
    
    if (password !== confirmPassword) {
      return false
    }
    
    if (password.length < 6) {
      return false
    }
    
    // Mock successful signup - just return true for now
    // In a real app, this would create the user and log them in
    return true
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    signup,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
