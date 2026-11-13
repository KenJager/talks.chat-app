import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('chat-app-theme') || 'forest',
  setTheme: (newTheme) => {
    localStorage.setItem('chat-app-theme', newTheme)
    set({ theme: newTheme })
  },
  navBoutton: 1,
  setNavBoutton: (buttonId) => {
    set({ navBoutton: buttonId })
  }
}))