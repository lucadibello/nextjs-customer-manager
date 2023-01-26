interface IdleProviderProps {
  disable?: boolean
  children: React.ReactNode
  timeout: number
  callback?: () => void
  logoutOnTimeout?: boolean
  debug?: boolean
}
