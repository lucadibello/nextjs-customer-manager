import { useRouter } from "next/router"
import { createContext, useEffect } from "react"
import { useAuth } from "../auth/AuthProvider"

const IdleContext = createContext<{}>({})

let idleTimer: NodeJS.Timeout | null = null

export const IdleProvider = ({ children, timeout, callback, logoutOnTimeout, debug, disable }: IdleProviderProps) => {
  // Load useAuth hook to log out user if session expires
  const { logOut, isAuthenticated } = useAuth()
  const router = useRouter()

  // Simple arrow function to log messages
  const logMessage = (message: string) => console.log("[IdleProvider] " + message)

  // Timeout handler
  const handleIdleTimeout = () => {
    debug && logMessage("Idle timeout reached")

    // Call callback function
    callback && isAuthenticated && callback()

    // Log out user
    if (logoutOnTimeout && isAuthenticated) {
      logOut()
      router.push('/login')
    }

    // Reset idle timer
    idleTimer && clearTimeout(idleTimer)
  }

  // Reset idle timer
  const resetIdleTimer = () => {
    if (idleTimer) {
      debug && logMessage("Idle timer reset")
      clearTimeout(idleTimer)
    } else {
      debug && logMessage("Setting idle timer")
    }
    idleTimer = setTimeout(handleIdleTimeout, timeout)
  }

  useEffect(() => {
    // Disable kill switch
    if (disable) {
      debug && logMessage("IdleProvider disabled")
      return
    }

    // Set a timeout on initial load
    resetIdleTimer()

    // Add event listeners
    debug && logMessage("Set event listeners")

    document.addEventListener('mousemove', resetIdleTimer)
    document.addEventListener('mousedown', resetIdleTimer)
    document.addEventListener('keypress', resetIdleTimer)
    document.addEventListener('touchmove', resetIdleTimer)
    document.addEventListener('scroll', resetIdleTimer)

    // Remove event listeners on cleanup
    return () => {
      debug && logMessage("Remove event listeners")

      document.removeEventListener('mousemove', resetIdleTimer)
      document.removeEventListener('mousedown', resetIdleTimer)
      document.removeEventListener('keypress', resetIdleTimer)
      document.removeEventListener('touchmove', resetIdleTimer)
      document.removeEventListener('scroll', resetIdleTimer)
    }
  }, [router.pathname, isAuthenticated])

  return (
    <IdleContext.Provider value={{ idleTimer }}>
      {children}
    </IdleContext.Provider>
  )
}