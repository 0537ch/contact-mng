'use client'

import * as React from "react"
import { IconLoader2, IconPlus } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import type { Contact } from "@/lib/db"

interface ContactDialogProps {
  contact?: Contact | null
  onSubmit: (data: Omit<Contact, 'id' | 'parent_name' | 'parent_email'>) => Promise<void>
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  companies?: Contact[]
}

export function ContactDialog({ contact, onSubmit, trigger, open: controlledOpen, onOpenChange, companies = [] }: ContactDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formData, setFormData] = React.useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    address: contact?.address || '',
    nik: contact?.nik || '',
    npwp: contact?.npwp || '',
    is_company: contact?.is_company || false,
    is_coordinator: contact?.is_coordinator || false,
    parent_id: contact?.parent_id || null,
  })

  // Update form data when contact changes (for edit mode)
  React.useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        nik: contact.nik || '',
        npwp: contact.npwp || '',
        is_company: contact.is_company,
        is_coordinator: contact.is_coordinator,
        parent_id: contact.parent_id,
      })
    }
  }, [contact])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi'
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    // Phone validation (Indonesian format: +62 or 0, followed by 9-11 digits)
    if (formData.phone && !/^(\+62|62|0)[0-9]{9,11}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Format telepon tidak valid (contoh: +6281234567890 atau 081234567890)'
    }

    // NIK validation (exactly 16 digits)
    if (formData.nik && !/^[0-9]{16}$/.test(formData.nik)) {
      newErrors.nik = 'NIK harus 16 digit angka'
    }

    // NPWP validation (15 digits with optional dashes)
    if (formData.npwp && !/^[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{1}[0-9]{3}[0-9]{3}$/.test(formData.npwp.replace(/[-.]/g, ''))) {
      newErrors.npwp = 'NPWP harus 15 digit angka'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await onSubmit(formData)
      setOpen(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        nik: '',
        npwp: '',
        is_company: false,
        is_coordinator: false,
        parent_id: null,
      })
      setErrors({})
    } catch (error) {
      console.error('Error submitting contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!contact

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {trigger || (
            <Button size="sm" className="transition-all duration-200 hover:scale-105 active:scale-95">
              <IconPlus className="mr-2 size-4" />
              Tambah Kontak
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-106.25">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Kontak' : 'Tambah Kontak Baru'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update detail kontak di bawah.'
                : 'Isi detail untuk menambah kontak baru.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: '' })
                  }}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  placeholder="john@example.com"
                  disabled={loading}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value })
                    if (errors.phone) setErrors({ ...errors, phone: '' })
                  }}
                  placeholder="+62 812 3456 7890"
                  disabled={loading}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Sudirman No. 123"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  value={formData.nik}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setFormData({ ...formData, nik: value })
                    if (errors.nik) setErrors({ ...errors, nik: '' })
                  }}
                  placeholder="16 digit NIK"
                  disabled={loading}
                  maxLength={16}
                  className={errors.nik ? 'border-destructive' : ''}
                />
                {errors.nik && <p className="text-xs text-destructive">{errors.nik}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="npwp">NPWP</Label>
                <Input
                  id="npwp"
                  value={formData.npwp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 15)
                    setFormData({ ...formData, npwp: value })
                    if (errors.npwp) setErrors({ ...errors, npwp: '' })
                  }}
                  placeholder="15 digit NPWP"
                  disabled={loading}
                  maxLength={15}
                  className={errors.npwp ? 'border-destructive' : ''}
                />
                {errors.npwp && <p className="text-xs text-destructive">{errors.npwp}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parent_id">Perusahaan Induk</Label>
                <Select
                  value={formData.parent_id?.toString() || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_id: value === "none" ? null : parseInt(value) })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih perusahaan induk (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {companies
                      .filter(c => c.id !== contact?.id) // Prevent self-reference
                      .map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_company"
                  checked={formData.is_company}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_company: checked as boolean })
                  }
                  disabled={loading}
                />
                <Label htmlFor="is_company" className="cursor-pointer">
                  Ini adalah perusahaan
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_coordinator"
                  checked={formData.is_coordinator}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_coordinator: checked as boolean })
                  }
                  disabled={loading}
                />
                <Label htmlFor="is_coordinator" className="cursor-pointer">
                  Adalah koordinator
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading || !formData.name}>
                {loading ? (
                  <>
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    {isEditing ? 'Mengupdate...' : 'Menambahkan...'}
                  </>
                ) : (
                  isEditing ? 'Update' : 'Tambah'
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
