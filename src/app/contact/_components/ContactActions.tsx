'use client'

import * as React from "react"
import { IconPlus, IconDownload, IconUpload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconSearch } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ContactDialog } from "./ContactDialog"
import type { Contact } from "@/lib/db"

interface ContactActionsProps {
  onSearchChange?: (value: string) => void
  searchValue?: string
  onAddContact?: () => void
  companies?: Contact[]
}

export function ContactActions({
  onSearchChange,
  searchValue = "",
  onAddContact,
  companies = [],
}: ContactActionsProps) {
  const [importResults, setImportResults] = React.useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const downloadTemplate = () => {
    const headers = ['nama', 'email', 'telepon', 'alamat', 'nik', 'npwp', 'perusahaan_induk', 'is_company', 'is_coordinator']
    const example = [
      'PT Contoh Indonesia',
      'info@contoh.co.id',
      '+622123456789',
      'Jl. Sudirman No. 123, Jakarta',
      '1234567890123456',
      '123456789012345',
      '',
      'true',
      'false'
    ]

    const csvContent = [
      headers.join(','),
      example.join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_kontak.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // This will be handled by the parent component
    // For now, just reset the input
    event.target.value = ''
  }

  return (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="relative w-72">
          <IconSearch className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kontak..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-8 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={downloadTemplate}
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <IconDownload className="mr-2 size-4" />
            Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById('csv-upload')?.click()}
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <IconUpload className="mr-2 size-4" />
            Import CSV
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          {onAddContact && (
            <Button
              size="sm"
              onClick={onAddContact}
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <IconPlus className="mr-2 size-4" />
              Tambah Kontak
            </Button>
          )}
        </div>
      </div>

      {/* Import Results Dialog */}
      <Dialog open={!!importResults} onOpenChange={(open) => !open && setImportResults(null)}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Hasil Import CSV</DialogTitle>
            <DialogDescription>
              {importResults && (
                <>
                  {importResults.success} kontak berhasil diimport
                  {importResults.failed > 0 && `, ${importResults.failed} gagal`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {importResults && importResults.errors.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              <p className="text-sm font-medium mb-2">Error:</p>
              <ul className="text-sm text-destructive space-y-1">
                {importResults.errors.slice(0, 10).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {importResults.errors.length > 10 && (
                  <li className="italic">...dan {importResults.errors.length - 10} error lainnya</li>
                )}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setImportResults(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
