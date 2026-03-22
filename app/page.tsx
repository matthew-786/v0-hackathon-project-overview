'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    const success = login(username, password)
    
    if (success) {
      // Get user to determine redirect
      const isAdvisor = username === 'finadv1'
      router.push(isAdvisor ? '/advisor' : '/compliance')
    } else {
      setError('Invalid username or password')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="w-full max-w-md px-8">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Compliant Prospector</h1>
          <p className="mt-2 text-[#64748b]">AI-powered compliant outreach platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#111827] rounded-2xl p-8 border border-[#1e293b]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#94a3b8] mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg text-white placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-[#7f1d1d]/30 border border-[#dc2626]/50 rounded-lg">
                <p className="text-sm text-[#f87171]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white font-medium rounded-lg hover:from-[#2563eb] hover:to-[#1e40af] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#111827] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[#1e293b]">
            <p className="text-xs text-[#64748b] text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[#0a0f1c] rounded-lg">
                <p className="text-[#94a3b8] font-medium">Financial Advisor</p>
                <p className="text-[#64748b] mt-1">finadv1 / 1234</p>
              </div>
              <div className="p-3 bg-[#0a0f1c] rounded-lg">
                <p className="text-[#94a3b8] font-medium">Compliance Officer</p>
                <p className="text-[#64748b] mt-1">compoff1 / 4321</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-[#475569]">
          Pulse Miami Hackathon 2025
        </p>
      </div>
    </div>
  )
}
