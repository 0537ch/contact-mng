import { useState } from "react"
import type { Contact } from "@/lib/db"

export function useGenerateAccount() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertData, setAlertData] = useState({ title: '', description: '', variant: 'default' as 'default' | 'destructive' })

  const handleGenerateAccount = (contact: Contact) => {
    // Check if NIK exists
    if (!contact.nik) {
      setAlertData({
        title: 'Error',
        description: 'NIK wajib diisi untuk generate account',
        variant: 'destructive',
      })
      setAlertOpen(true)
      return
    }

    // Check if email exists
    if (!contact.email) {
      setAlertData({
        title: 'Error',
        description: 'Email wajib diisi untuk generate account',
        variant: 'destructive',
      })
      setAlertOpen(true)
      return
    }

    setSelectedContact(contact)
    setGenerateConfirmOpen(true)
  }

  const confirmGenerateAccount = async () => {
    if (!selectedContact) return

    setIsGenerating(true)
    setGenerateConfirmOpen(false)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GENERATE_ACCOUNT_API!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedContact.nik,
          password: selectedContact.nik,
          email: selectedContact.email,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      setAlertData({
        title: 'Berhasil',
        description: `Account berhasil dibuat untuk ${selectedContact.name}`,
        variant: 'default',
      })
      setAlertOpen(true)

      console.log('Account generated:', result)
    } catch (error) {
      console.error('Failed to generate account:', error)
      setAlertData({
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Gagal generate account. Silakan coba lagi.',
        variant: 'destructive',
      })
      setAlertOpen(true)
    } finally {
      setIsGenerating(false)
      setSelectedContact(null)
    }
  }

  return {
    isGenerating,
    handleGenerateAccount,
    confirmGenerateAccount,
    selectedContact,
    generateConfirmOpen,
    setGenerateConfirmOpen,
    alertData,
    alertOpen,
    setAlertOpen,
  }
}
