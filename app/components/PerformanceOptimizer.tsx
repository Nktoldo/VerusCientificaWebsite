'use client'

import { useEffect } from 'react'

export default function PerformanceOptimizer() {
  useEffect(() => {
    // monitoramento de performance apenas em desenvolvimento
    if (typeof window !== 'undefined' && 'performance' in window && process.env.NODE_ENV === 'development') {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (perfData) {
          // monitoramento de performance em desenvolvimento
        }
      })
    }
  }, [])

  return null
} 