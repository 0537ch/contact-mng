'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { Contact } from "@/lib/db"
import { cn } from "@/lib/utils"

interface ContactDetailDialogProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactDetailDialog({ contact, open, onOpenChange }: ContactDetailDialogProps) {
  if (!contact) return null

  const detailItems = [
    { label: "Nama", value: contact.name },
    { label: "Email", value: contact.email || '-' },
    { label: "Telepon", value: contact.phone || '-' },
    { label: "Alamat", value: contact.address || '-' },
    { label: "NIK", value: contact.nik || '-' },
    { label: "NPWP", value: contact.npwp || '-' },
    {
      label: "Tipe",
      value: contact.is_company ? 'Perusahaan' : 'Individu',
      badge: contact.is_company ? 'default' : 'secondary'
    },
    {
      label: "Koordinator",
      value: contact.is_coordinator ? 'Ya' : 'Tidak',
      badge: contact.is_coordinator ? 'default' : 'outline'
    },
    { label: "Perusahaan Induk", value: contact.parent_name || '-' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Detail Kontak</DialogTitle>
            <DialogDescription>
              Informasi lengkap untuk {contact.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            {detailItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="grid grid-cols-[120px_1fr] gap-2 items-center"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </span>
                <div>
                  {item.badge ? (
                    <Badge variant={item.badge as any}>{item.value}</Badge>
                  ) : (
                    <span className="text-sm">{item.value}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Tutup
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
