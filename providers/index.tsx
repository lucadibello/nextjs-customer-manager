import { ReactNode } from 'react'
import { AuthChallengeProvider } from './auth/challenge/AuthChallengeProvider'
import { AuthProvider } from './auth/AuthProvider'
import { IdleProvider } from './idle/IdleProvider'
import { useToast } from '@chakra-ui/react'

const DEFAULT_TIMEOUT = 2 * 60 * 1000 // Two minutes

const AllProviders = ({ children }: { children: ReactNode }) => {
  // Load useToast hook to show toast
  const toast = useToast()

  return (
    <AuthProvider>
      <AuthChallengeProvider>
        <IdleProvider
          disable={true}
          timeout={DEFAULT_TIMEOUT}
          debug={true}
          logoutOnTimeout={true}
          callback={() => {
            toast({
              title: "Session expired",
              description: "You have been logged out due to inactivity.",
              status: "warning",
              duration: 5000,
              isClosable: true,
            })
          }}>
          {children}
        </IdleProvider>
      </AuthChallengeProvider>
    </AuthProvider>
  )
}

export default AllProviders
