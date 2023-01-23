import { ReactNode } from 'react'
import { AuthChallengeProvider } from './auth/challenge/AuthChallengeProvider'
import { AuthProvider } from './auth/AuthProvider'

const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <AuthChallengeProvider>
        {children}
      </AuthChallengeProvider>
    </AuthProvider>
  )
}

export default AllProviders
