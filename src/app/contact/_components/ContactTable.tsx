'use client'

import * as React from "react"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDotsVertical, IconPlus } from "@tabler/icons-react"
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

const createColumns = (onEdit?: (contact: Contact) => void, onDelete?: (id: number) => void, onViewDetails?: (contact: Contact) => void): ColumnDef<Contact>[] => [
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
        <DropdownMenuContent align="end" className="w-32">
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

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kontak ini?')) {
      try {
        await deleteContact(id)
      } catch (error) {
        console.error('Failed to delete contact:', error)
        alert('Gagal menghapus kontak. Silakan coba lagi.')
      }
    }
  }

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

  const columns = createColumns(handleEdit, handleDelete, handleViewDetails)

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
        className="overflow-hidden rounded-lg border"
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
                className="hidden size-8 p-0 lg:flex transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 transition-all duration-200 hover:scale-105 active:scale-95"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 transition-all duration-200 hover:scale-105 active:scale-95"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex transition-all duration-200 hover:scale-105 active:scale-95"
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
    </motion.div>
  )
}
