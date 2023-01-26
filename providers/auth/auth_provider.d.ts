interface LoginData {
  email: string
  password: string
}

interface AuthContextData {
  isAuthenticated: boolean
  currentUser: UserSession | null
  accessToken: string | null
  refreshToken: string | null
  logIn: (_data: LoginData) => Promise<void>
  logOut: () => void
  refreshSession: () => Promise<void>
  changePassword: (_otp: string, _newPassword: string) => Promise<void>
  hasRole: (_role: Role) => boolean
}

interface AuthProviderProps {
  children: React.ReactNode
}
