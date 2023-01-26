export const startIdleCheck = (idleMs: number, callback: () => void) => {
  let idleTimer: NodeJS.Timeout | null = null
  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer)
    }
    idleTimer = setTimeout(callback, idleMs)
  }
  resetIdleTimer()
  document.addEventListener('mousemove', resetIdleTimer)
  document.addEventListener('keypress', resetIdleTimer)
  document.addEventListener('touchstart', resetIdleTimer)
}
