'use client'

import { useEffect } from 'react'

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadLinks = [
      { rel: 'preload', href: '/assets/logo.png', as: 'image' },
      { rel: 'preload', href: '/manifest.json', as: 'application/json' },
    ]

    preloadLinks.forEach(({ rel, href, as }) => {
      const link = document.createElement('link')
      link.rel = rel
      link.href = href
      if (as) link.setAttribute('as', as)
      document.head.appendChild(link)
    })

    // Add performance monitoring (apenas em desenvolvimento)
    if (typeof window !== 'undefined' && 'performance' in window && process.env.NODE_ENV === 'development') {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (perfData) {
          console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart)
          console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)
        }
      })
    }
  }, [])

  return null
} 