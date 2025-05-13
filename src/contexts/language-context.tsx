'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './auth-context'

export interface Language {
  code: string
  name: string
  flag?: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

interface LanguageContextType {
  language: string
  setLanguage: (code: string) => Promise<void>
  languages: Language[]
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>('pt') // Default to Portuguese
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Fetch the user's language preference from the database
  useEffect(() => {
    const fetchLanguage = async () => {
      if (!user) {
        setLanguageState('pt') // Default if not logged in
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching language preference:', error)
          return
        }

        if (data?.language) {
          setLanguageState(data.language)
        }
      } catch (error) {
        console.error('Error fetching language preference:', error)
      }
    }

    fetchLanguage()
  }, [user])

  // Update the user's language preference in the database
  const setLanguage = async (code: string) => {
    setIsLoading(true)
    try {
      setLanguageState(code)

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            language: code,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) {
          console.error('Error updating language preference:', error)
          return
        }
      }
    } catch (error) {
      console.error('Error updating language preference:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: LANGUAGES,
        isLoading
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
