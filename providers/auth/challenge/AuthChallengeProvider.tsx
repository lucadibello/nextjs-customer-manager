import { createContext, useContext, useState } from "react"
import AuthChallengeModal from "../../../components/AuthChallengeModal"

// Create context with default values
const AuthChallengeContext = createContext<AuthChallengeContextData>({
  triggerAuthChallenge: () => { },
  purgeAll: () => { },
  isPending: false,
  otp: undefined,
  errorMessage: undefined,
})


// Create provider component to wrap around app
const AuthChallengeProvider = ({ children }: AuthChallengeProviderProps) => {
  const [isPending, setIsPending] = useState(false)

  const [otp, setOtp] = useState<string | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const triggerAuthChallenge = () => {
    // Open the modal
    setIsPending(true)
  }

  const purgeAll = () => {
    setOtp(undefined)
    setErrorMessage(undefined)
  }

  return (
    <AuthChallengeContext.Provider value={{ isPending, triggerAuthChallenge, errorMessage, otp, purgeAll }}>
      {children}

      {/* Auth provider modal */}
      <AuthChallengeModal
        isOpen={isPending}
        onClose={() => {
          purgeAll()
          setIsPending(false)
        }}
        onSuccess={(otp: string) => {
          setErrorMessage(undefined)
          setOtp(otp)
          setIsPending(false)
        }}
        onError={(message: string) => {
          setErrorMessage(message)
          setOtp(undefined)
          setIsPending(false)
        }}
      />
    </AuthChallengeContext.Provider>
  )
}

// Custom hook to use auth context
const useAuthChallenge = () => {
  // Custom hook to use auth context
  const context = useContext(AuthChallengeContext)
  if (!context) {
    throw new Error('useAuthChallenge must be used within an AuthChallengeProvider')
  }
  return context
}

// Export provider and custom hook
export { AuthChallengeProvider, useAuthChallenge }
