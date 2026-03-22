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

    // Simulate network delay for super slick UI
    await new Promise(resolve => setTimeout(resolve, 800))

    const success = login(username, password)

    if (success) {
      // Get user to determine redirect
      const isAdvisor = username === 'finadv1'
      router.push(isAdvisor ? '/advisor' : '/compliance')
    } else {
      setError('System rejected credential signature.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex bg-[#030712] text-white selection:bg-indigo-500/30 font-sans">

      {/* 
        =====================================================================================
        LEFT SIDE: VISUAL HERO
        Massive split-screen presence featuring advanced mesh gradients and grid patterns
        ===================================================================================== 
      */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#030712] items-center justify-center border-r border-white/5">
        {/* Animated Layered Lighting */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] rounded-full opacity-60 mix-blend-screen mix-blend-lighten"
            style={{ background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.15) 0%, transparent 60%)' }}
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[120%] rounded-full opacity-60 mix-blend-screen blur-3xl animate-pulse"
            style={{ background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 0%, transparent 70%)', animationDuration: '6s' }}
          />
          {/* High-tech Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_40%,#000_60%,transparent_100%)] mix-blend-overlay" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-12 max-w-3xl pr-24">

          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-sm font-semibold text-indigo-300 tracking-widest uppercase">AI Engine Online</span>
          </div>

          <h1 className="text-6xl xl:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            Outlance AI.
          </h1>

          <p className="text-2xl text-slate-400 font-light max-w-xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both leading-relaxed">
            Solve your financial outreach and compliance issues with ease.
          </p>

          {/* Floating Glass UI Element (Simulating the AI at work) */}
          <div className="rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both transform hover:scale-[1.02] transition-transform w-[400px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <div className="h-2.5 w-40 bg-white/20 rounded-full mb-2.5 animate-pulse" style={{ animationDuration: '3s' }} />
                  <div className="h-2 w-24 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                </div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Rule 2210 Validation</span>
                <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">100% Cleared</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        =====================================================================================
        RIGHT SIDE: LOGIN FORM
        Ultra-sleek, clean layout matching the most premium enterprise fintech interfaces
        ===================================================================================== 
      */}
      <div className="w-full lg:w-[480px] xl:w-[600px] flex items-center justify-center py-12 px-8 sm:px-16 relative z-10 bg-[#0a0f1c] shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="w-full max-w-sm">

          {/* Mobile Only Logo */}
          <div className="lg:hidden mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-[0_10px_30px_rgba(99,102,241,0.3)]">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Outlance AI</h2>
          </div>

          <div className="mb-10 text-center lg:text-left animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm font-light">Securely access your compliance dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Credential ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="w-full px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-medium backdrop-blur-sm"
                placeholder="Enter workspace username"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Security Key</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all font-medium backdrop-blur-sm tracking-widest"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-sm text-red-400 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 px-4 py-4 font-semibold text-white transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0f1c] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_10px_40px_rgba(79,70,229,0.3)] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite] group-hover:block hidden" />
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating Session...
                </span>
              ) : (
                'Initialize Terminal'
              )}
            </button>
          </form>

          {/* Quick Connect Demo Buttons */}
          <div className="mt-14 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick Access Demo Links</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setUsername('finadv1'); setPassword('1234') }}
                className="flex flex-col items-start px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all hover:-translate-y-0.5"
              >
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Financial Advisor
                </p>
                <p className="text-xs text-slate-300 font-mono">finadv1</p>
              </button>

              <button
                type="button"
                onClick={() => { setUsername('compoff1'); setPassword('4321') }}
                className="flex flex-col items-start px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all hover:-translate-y-0.5"
              >
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Compliance Dept
                </p>
                <p className="text-xs text-slate-300 font-mono">compoff1</p>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
