'use client'

import * as React from "react"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDotsVertical, IconPlus, IconUserPlus, IconAlertCircle, IconCheck } from "@tabler/icons-react"
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState } from "@tanstack/react-table"
import { useContactData } from "../_hooks/use-contact"
import { useCompanies } from "../_hooks/use-companies"
import { useContactMutations } from "../_hooks/use-contact-mutations"
import type { Contact } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ContactDialog } from "./ContactDialog"
import { ContactDetailDialog } from "./ContactDetailDialog"
import { ContactActions } from "./ContactActions"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"
import {  Dialog,  DialogContent,  DialogDescription,  DialogFooter,  DialogHeader,  DialogTitle,} from "@/components/ui/dialog"
import { useGenerateAccount } from "../_hooks/use-generate-account"

const createColumns = (onEdit?: (contact: Contact) => void, onDelete?: (id: number) => void, onViewDetails?: (contact: Contact) => void, onGenerateAccount?: (contact: Contact) => void): ColumnDef<Contact>[] => [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || '-',
  },
  {
    accessorKey: "phone",
    header: "Telepon",
    cell: ({ row }) => row.original.phone || '-',
  },
  {
    accessorKey: "parent_name",
    header: "Induk",
    cell: ({ row }) => row.original.parent_name || '-',
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          className="text-blue-600 flex size-8 shadow-neuro-button hover:shadow-neuro-button-active active:shadow-neuro-button-active bg-[#e0e5ec] border-0"
          size="icon"
          onClick={() => onGenerateAccount?.(row.original)}
          title="Generate Account"
        >
          <IconUserPlus className="h-4 w-4" />
          <span className="sr-only">Generate Account</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}>
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete?.(row.original.id)}
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export default function ContactTable({ showActions = true, contacts }: { showActions?: boolean; contacts?: Contact[] }) {
  const { contact, loading, error, fetchContact } = useContactData()
  const { companies, refetch: refetchCompanies } = useCompanies()
  const tableContacts = contacts || contact
  const { createContact, updateContact, deleteContact } = useContactMutations({
    onSuccess: () => {
      fetchContact()
      refetchCompanies()
    },
  })

  const [editingContact, setEditingContact] = React.useState<Contact | null>(null)
  const [viewingContact, setViewingContact] = React.useState<Contact | null>(null)
  const [addContactOpen, setAddContactOpen] = React.useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
  }

  const handleViewDetails = (contact: Contact) => {
    setViewingContact(contact)
  }

  const handleDelete = (id: number) => {
    setDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (deleteId === null) return
    try {
      await deleteContact(deleteId)
      setDeleteConfirmOpen(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to delete contact:', error)
      setDeleteAlertOpen(true)
    }
  }

  const {
    isGenerating,
    handleGenerateAccount,
    confirmGenerateAccount,
    selectedContact,
    generateConfirmOpen,
    setGenerateConfirmOpen,
    alertData,
    alertOpen,
    setAlertOpen,
  } = useGenerateAccount() 

  

  const handleCreate = async (data: Omit<Contact, 'id' | 'parent_name' | 'parent_email'>) => {
    await createContact(data)
  }

  const handleUpdate = async (data: Omit<Contact, 'id' | 'parent_name' | 'parent_email'>) => {
    if (editingContact) {
      await updateContact(editingContact.id, data)
      setEditingContact(null)
    }
  }

  const handleEditDialogClose = () => {
    setEditingContact(null)
  }

  const columns = createColumns(handleEdit, handleDelete, handleViewDetails, handleGenerateAccount)

  const table = useReactTable({
    data: tableContacts || [],
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Memuat kontak...</div>
      </div>
    )
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error: {error}</div>
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {showActions && (
        <ContactActions
          onSearchChange={(value) => table.getColumn("name")?.setFilterValue(value)}
          searchValue={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onAddContact={() => setAddContactOpen(true)}
          companies={companies}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-2xl bg-[#e0e5ec] shadow-neuro"
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-linear-to-r from-blue-600/10 via-blue-500/10 to-blue-400/10 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        header.column.getIsSorted() === 'asc'
                          ? 'ascending'
                          : header.column.getIsSorted() === 'desc'
                            ? 'descending'
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'flex h-full cursor-pointer items-center justify-between gap-2 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={e => {
                            if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {{
                            asc: <ChevronUp className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                            desc: <ChevronDown className="shrink-0 opacity-60" size={16} aria-hidden="true" />
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors duration-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada kontak ditemukan. Tambah kontak pertama Anda!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {showActions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between px-2"
        >
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredRowModel().rows.length} kontak total
          </div>
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex shadow-neuro-button hover:shadow-neuro-button-active active:shadow-neuro-button-active bg-[#e0e5ec] border-0 text-gray-700"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 shadow-neuro-button hover:shadow-neuro-button-active active:shadow-neuro-button-active bg-[#e0e5ec] border-0 text-gray-700"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 shadow-neuro-button hover:shadow-neuro-button-active active:shadow-neuro-button-active bg-[#e0e5ec] border-0 text-gray-700"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex shadow-neuro-button hover:shadow-neuro-button-active active:shadow-neuro-button-active bg-[#e0e5ec] border-0 text-gray-700"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Dialog */}
      {editingContact && (
        <ContactDialog
          contact={editingContact}
          onSubmit={handleUpdate}
          open={!!editingContact}
          onOpenChange={handleEditDialogClose}
          companies={companies}
          key={`edit-${editingContact.id}`}
        />
      )}

      {/* Add Contact Dialog */}
      {addContactOpen && (
        <ContactDialog
          onSubmit={handleCreate}
          open={addContactOpen}
          onOpenChange={setAddContactOpen}
          companies={companies}
        />
      )}

      {/* View Details Dialog */}
      <ContactDetailDialog
        contact={viewingContact}
        open={!!viewingContact}
        onOpenChange={(open) => !open && setViewingContact(null)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kontak</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kontak ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Account Confirmation Dialog */}
      <Dialog open={generateConfirmOpen} onOpenChange={setGenerateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Account</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Generate account untuk <strong>{selectedContact.name}</strong>?</p>
              <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                <p><strong>ID:</strong> {selectedContact.nik}</p>
                <p><strong>Password:</strong> {selectedContact.nik}</p>
                <p><strong>Email:</strong> {selectedContact.email}</p>
              </div>
              <p className="text-destructive text-xs">Pastikan data sudah benar.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateConfirmOpen(false)} disabled={isGenerating}>
              Batal
            </Button>
            <Button onClick={confirmGenerateAccount} disabled={isGenerating}>
              {isGenerating ? 'Memproses...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent>
          <div className="flex flex-col items-center gap-4 py-4">
            {alertData.variant === 'destructive' ? (
              <IconAlertCircle className="h-12 w-12 text-destructive" />
            ) : (
              <IconCheck className="h-12 w-12 text-green-500" />
            )}
            <DialogHeader className="text-center">
              <DialogTitle>{alertData.title}</DialogTitle>
              <DialogDescription>{alertData.description}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setAlertOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Error Alert Dialog */}
      <Dialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <DialogContent>
          <div className="flex flex-col items-center gap-4 py-4">
            <IconAlertCircle className="h-12 w-12 text-destructive" />
            <DialogHeader className="text-center">
              <DialogTitle>Gagal</DialogTitle>
              <DialogDescription>Gagal menghapus kontak. Silakan coba lagi.</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setDeleteAlertOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
