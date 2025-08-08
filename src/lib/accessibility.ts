// Accessibility utilities for military-grade applications
// Ensures compliance with Section 508 and WCAG 2.1 AA standards

import { useEffect, useRef, useCallback } from 'react'

// Focus management utilities
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      previousFocusRef.current = document.activeElement as HTMLElement
      element.focus()
      focusRef.current = element
    }
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable.focus()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { setFocus, restoreFocus, trapFocus, focusRef }
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault()
          onEnter()
        }
        break
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault()
          onArrowUp()
        }
        break
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault()
          onArrowDown()
        }
        break
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault()
          onArrowLeft()
        }
        break
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault()
          onArrowRight()
        }
        break
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Skip link utility
export function createSkipLink(targetId: string, text: string = 'Skip to main content') {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'skip-link'
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
    font-weight: bold;
  `

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px'
  })

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px'
  })

  return skipLink
}

// Color contrast checker
export function checkColorContrast(foreground: string, background: string): {
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
} {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Calculate relative luminance
  const getRelativeLuminance = (rgb: { r: number; g: number; b: number }) => {
    const sRGB = [rgb.r, rgb.g, rgb.b].map(channel => {
      channel = channel / 255
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }

  const fgRgb = hexToRgb(foreground)
  const bgRgb = hexToRgb(background)

  if (!fgRgb || !bgRgb) {
    return { ratio: 1, wcagAA: false, wcagAAA: false }
  }

  const fgLuminance = getRelativeLuminance(fgRgb)
  const bgLuminance = getRelativeLuminance(bgRgb)

  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)
  const ratio = (lighter + 0.05) / (darker + 0.05)

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7
  }
}

// ARIA utilities
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export function setAriaExpanded(element: HTMLElement, expanded: boolean) {
  element.setAttribute('aria-expanded', expanded.toString())
}

export function setAriaSelected(element: HTMLElement, selected: boolean) {
  element.setAttribute('aria-selected', selected.toString())
}

export function setAriaPressed(element: HTMLElement, pressed: boolean) {
  element.setAttribute('aria-pressed', pressed.toString())
}

// Form accessibility helpers
export function associateLabel(inputId: string, labelText: string): {
  inputProps: { id: string; 'aria-describedby'?: string }
  labelProps: { htmlFor: string }
} {
  return {
    inputProps: { id: inputId },
    labelProps: { htmlFor: inputId }
  }
}

export function createFieldDescription(inputId: string, description: string): {
  inputProps: { 'aria-describedby': string }
  descriptionProps: { id: string }
} {
  const descriptionId = `${inputId}-description`
  return {
    inputProps: { 'aria-describedby': descriptionId },
    descriptionProps: { id: descriptionId }
  }
}

export function createFieldError(inputId: string, error: string): {
  inputProps: { 'aria-describedby': string; 'aria-invalid': boolean }
  errorProps: { id: string; role: string }
} {
  const errorId = `${inputId}-error`
  return {
    inputProps: { 
      'aria-describedby': errorId,
      'aria-invalid': true
    },
    errorProps: { 
      id: errorId,
      role: 'alert'
    }
  }
}

// High contrast mode detection
export function useHighContrastMode(): boolean {
  const [isHighContrast, setIsHighContrast] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isHighContrast
}

// Reduced motion detection
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Voice control helpers
export function makeVoiceControlFriendly(element: HTMLElement, commands: string[]) {
  // Add data attributes for voice control software
  element.setAttribute('data-voice-commands', commands.join(','))
  
  // Ensure proper labeling
  if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    const text = element.textContent || element.getAttribute('title') || commands[0]
    element.setAttribute('aria-label', text)
  }
}

// Touch target size checker
export function checkTouchTargetSize(element: HTMLElement): {
  width: number
  height: number
  meetsMobileStandards: boolean
  meetsDesktopStandards: boolean
} {
  const rect = element.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  return {
    width,
    height,
    meetsMobileStandards: width >= 44 && height >= 44, // iOS guidelines
    meetsDesktopStandards: width >= 24 && height >= 24  // Desktop minimum
  }
}

// Accessibility testing utilities
export function auditAccessibility(container: HTMLElement): {
  issues: Array<{
    type: string
    element: Element
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  score: number
} {
  const issues: Array<{
    type: string
    element: Element
    message: string
    severity: 'error' | 'warning' | 'info'
  }> = []

  // Check for missing alt text on images
  const images = container.querySelectorAll('img')
  images.forEach(img => {
    if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
      issues.push({
        type: 'missing-alt-text',
        element: img as Element,
        message: 'Image is missing alt text',
        severity: 'error'
      })
    }
  })

  // Check for missing labels on form controls
  const inputs = container.querySelectorAll('input, select, textarea')
  inputs.forEach(input => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    container.querySelector(`label[for="${input.id}"]`)
    
    if (!hasLabel) {
      issues.push({
        type: 'missing-label',
        element: input as Element,
        message: 'Form control is missing a label',
        severity: 'error'
      })
    }
  })

  // Check for proper heading structure
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  let previousLevel = 0
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > previousLevel + 1) {
      issues.push({
        type: 'heading-skip',
        element: heading as Element,
        message: `Heading level skips from h${previousLevel} to h${level}`,
        severity: 'warning'
      })
    }
    previousLevel = level
  })

  // Calculate accessibility score
  const totalElements = container.querySelectorAll('*').length
  const errorCount = issues.filter(issue => issue.severity === 'error').length
  const warningCount = issues.filter(issue => issue.severity === 'warning').length
  
  const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5))

  return { issues, score }
}

// React import (since we're using React hooks)
import React from 'react'