// app/page.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { SimpleThemeButton } from '@/app/components/theme/SetThemeButton'

export default function Page() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fixed Background with Animated Grid */}
      <div className="fixed inset-0 -z-10 bg-white dark:bg-[#010409]">
        <div
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08] transition-transform duration-300 ease-out"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0d1117]/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
                Four-Points
              </span>
            </Link>

            {/* Solo el botón de tema */}
            <SimpleThemeButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className="inline-block mb-6 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-all duration-700 ease-out"
            style={{
              opacity: Math.max(0.5, 1 - scrollY / 400),
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          >
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              ✨ Next-generation hotel management
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 transition-all duration-700 ease-out"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              opacity: Math.max(0.2, 1 - scrollY / 600),
            }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Hotel software
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              for desktop y mobile
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto transition-all duration-700 ease-out"
            style={{
              transform: `translateY(${scrollY * 0.15}px)`,
              opacity: Math.max(0.2, 1 - scrollY / 600),
            }}
          >
            Manage your hotel operations seamlessly across all devices.
            <br />
            One platform, infinite possibilities.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 ease-out"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
              opacity: Math.max(0.2, 1 - scrollY / 600),
            }}
          >
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-500/50 dark:hover:shadow-blue-400/30 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="https://www.stackbp.es/"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all transform hover:scale-105"
            >
              Live demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Desktop Preview Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative transition-all duration-1000 ease-out"
            style={{
              transform: `translateY(${Math.max(0, 30 - scrollY * 0.15)}px)`,
              opacity: Math.min(1, Math.max(0, (scrollY - 50) / 300)),
            }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-3xl blur-2xl" />

            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                  Desktop Application
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero-desktop.png"
                  alt="Desktop application preview"
                  width={1400}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="mt-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Desktop Experience
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Full-featured desktop application with advanced analytics, reporting, and management
                tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Preview Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="relative transition-all duration-1000 ease-out"
            style={{
              transform: `translateY(${Math.max(0, 50 - scrollY * 0.1)}px)`,
              opacity: Math.min(1, Math.max(0, (scrollY - 300) / 400)),
            }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-3xl blur-2xl" />

            <div className="relative flex justify-center">
              <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 dark:border-gray-700 max-w-sm">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 dark:bg-gray-900 rounded-b-3xl" />

                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <Image
                    src="/hero-mobile.png"
                    alt="Mobile application preview"
                    width={400}
                    height={800}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Mobile-First Design
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Mobile application for hotel operations management. Full feature access from any
                location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Optimized performance for instant responses',
              },
              {
                icon: '🔒',
                title: 'Secure by Default',
                description: 'Enterprise-grade security and data protection',
              },
              {
                icon: '🌍',
                title: 'Works Everywhere',
                description: 'Cloud-synced across all your devices',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-500 ease-out hover:shadow-xl transform hover:-translate-y-1"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 500) / 300)),
                  transform: `translateY(${Math.max(0, 30 - (scrollY - 500) * 0.05)}px)`,
                }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Project overview & Source Code
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Including design methodology and implementation details. Private backend repository,
            public frontend.
          </p>
          <Link
            href="https://github.com/bpstack"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 dark:hover:shadow-blue-400/30 transition-all transform hover:scale-105"
          >
            Source code available on GitHub
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">© 2025 for-Points. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
