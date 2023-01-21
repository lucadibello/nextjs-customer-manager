interface AuthChallengeContextData {
  triggerAuthChallenge: () => void
  purgeAll: () => void
  isPending: boolean
  otp?: string
  errorMessage?: string
}

interface AuthChallengeProviderProps {
  children: React.ReactNode
}
