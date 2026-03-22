'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { User, EmailRecord, EmailStatus } from './types'
import { users } from './data'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  emails: EmailRecord[]
  addEmail: (email: Omit<EmailRecord, 'id' | 'createdAt'>) => void
  updateEmailStatus: (
    emailId: string, 
    status: EmailStatus, 
    reviewedBy?: string, 
    denialReason?: string,
    complianceNotes?: string
  ) => void
  getEmailsByAdvisor: (advisorId: string) => EmailRecord[]
  getPendingEmails: () => EmailRecord[]
  deleteEmail: (emailId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [emails, setEmails] = useState<EmailRecord[]>([])

  const login = useCallback((username: string, password: string): boolean => {
    const foundUser = users.find(
      u => u.username === username && u.password === password
    )
    if (foundUser) {
      setUser(foundUser)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const addEmail = useCallback((email: Omit<EmailRecord, 'id' | 'createdAt'>) => {
    const newEmail: EmailRecord = {
      ...email,
      id: `email-${Date.now()}`,
      createdAt: new Date()
    }
    setEmails(prev => [...prev, newEmail])
  }, [])

  const updateEmailStatus = useCallback((
    emailId: string,
    status: EmailStatus,
    reviewedBy?: string,
    denialReason?: string,
    complianceNotes?: string
  ) => {
    setEmails(prev => prev.map(email => {
      if (email.id === emailId) {
        return {
          ...email,
          status,
          reviewedAt: new Date(),
          reviewedBy,
          denialReason,
          complianceNotes
        }
      }
      return email
    }))
  }, [])

  const getEmailsByAdvisor = useCallback((advisorId: string) => {
    return emails.filter(email => email.advisorId === advisorId)
  }, [emails])

  const getPendingEmails = useCallback(() => {
    return emails.filter(email => email.status === 'pending')
  }, [emails])

  const deleteEmail = useCallback((emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      emails,
      addEmail,
      updateEmailStatus,
      getEmailsByAdvisor,
      getPendingEmails,
      deleteEmail
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
