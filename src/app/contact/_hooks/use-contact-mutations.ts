'use client'

import { useState } from 'react'
import type { Contact } from '@/lib/db'

interface UseContactMutationsProps {
  onSuccess?: () => void
}

export function useContactMutations({ onSuccess }: UseContactMutationsProps = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createContact = async (data: Omit<Contact, 'id' | 'parent_name' | 'parent_email'>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal membuat kontak')
      }

      const result = await response.json()
      onSuccess?.()
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membuat kontak'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateContact = async (id: number, data: Omit<Contact, 'id' | 'parent_name' | 'parent_email'>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengupdate kontak')
      }

      const result = await response.json()
      onSuccess?.()
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengupdate kontak'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteContact = async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menghapus kontak')
      }

      onSuccess?.()
      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus kontak'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createContact,
    updateContact,
    deleteContact,
    loading,
    error,
  }
}
