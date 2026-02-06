'use client'

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import type { Contact } from "@/lib/db"
import ContactTable from "@/app/contact/_components/ContactTable"
import {
  IconUsers,
  IconBuilding,
  IconUser,
  IconClock,
  IconMail,
  IconPhone,
} from "@tabler/icons-react"
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts"

export default function Page() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'companies' | 'individuals' | 'coordinators'>('all')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contact')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
        setFilteredContacts(data)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: contacts.length,
    companies: contacts.filter(c => c.is_company).length,
    individuals: contacts.filter(c => !c.is_company).length,
    coordinators: contacts.filter(c => c.is_coordinator).length,
  }

  const recentContacts = contacts.slice(0, 5)

  const chartData = [
    { name: 'Perusahaan', value: stats.companies, color: '#8b5cf6' },
    { name: 'Individu', value: stats.individuals, color: '#ec4899' },
  ]

  const COLORS = ['#8b5cf6', '#ec4899']

  const handleStatClick = (filter: 'all' | 'companies' | 'individuals' | 'coordinators') => {
    setActiveFilter(filter)
    if (filter === 'all') {
      setFilteredContacts(contacts)
    } else if (filter === 'companies') {
      setFilteredContacts(contacts.filter(c => c.is_company))
    } else if (filter === 'individuals') {
      setFilteredContacts(contacts.filter(c => !c.is_company))
    } else if (filter === 'coordinators') {
      setFilteredContacts(contacts.filter(c => c.is_coordinator))
    }
  }

  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center flex-1">
            <div className="text-muted-foreground">Memuat dashboard...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-6 space-y-4 overflow-auto">
            {/* Header with Quick Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-sm text-muted-foreground">Overview sistem manajemen kontak</p>
              </div>
              <Button onClick={() => router.push('/contact')} className="gap-2">
                <IconBuilding className="h-4 w-4" />
                Kelola Kontak
              </Button>
            </div>

            {/* Stats Row - White cards with blue borders */}
            <div className="grid grid-cols-4 gap-4">
              <div
                onClick={() => handleStatClick('all')}
                className="bg-gray-50/80 border-2 border-blue-500/50 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all"
              >
                <IconUsers className="h-6 w-6 text-blue-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600 mt-1">Total Kontak</div>
              </div>

              <div
                onClick={() => handleStatClick('companies')}
                className="bg-gray-50/80 border-2 border-blue-400/50 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all"
              >
                <IconBuilding className="h-6 w-6 text-blue-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stats.companies}</div>
                <div className="text-sm text-gray-600 mt-1">Perusahaan</div>
              </div>

              <div
                onClick={() => handleStatClick('individuals')}
                className="bg-gray-50/80 border-2 border-blue-300/50 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all"
              >
                <IconUser className="h-6 w-6 text-blue-400 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stats.individuals}</div>
                <div className="text-sm text-gray-600 mt-1">Individu</div>
              </div>

              <div
                onClick={() => handleStatClick('coordinators')}
                className="bg-gray-50/80 border-2 border-sky-400/50 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-sky-400 hover:bg-sky-50/50 transition-all"
              >
                <IconUsers className="h-6 w-6 text-sky-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stats.coordinators}</div>
                <div className="text-sm text-gray-600 mt-1">Koordinator</div>
              </div>
            </div>

            {/* Content Row: Recent + Quick Actions */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Recent Contacts - With style */}
              <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-base font-bold flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <IconClock className="h-4 w-4 text-blue-600" />
                    </div>
                    Kontak Terbaru
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/contact')} className="gap-2">
                    Lihat Semua
                    <IconBuilding className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentContacts.length > 0 ? (
                    recentContacts.slice(0, 6).map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                        onClick={() => router.push(`/contact?view=${contact.id}`)}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{contact.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {contact.email || contact.phone || 'Tidak ada kontak'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={contact.is_company ? "default" : "secondary"} className="text-xs font-medium">
                            {contact.is_company ? 'Perusahaan' : 'Individu'}
                          </Badge>
                          {contact.is_coordinator && (
                            <Badge variant="outline" className="text-xs font-medium">Koordinator</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-500">
                      Belum ada kontak. <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => router.push('/contact')}>Tambah kontak pertama</Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions & Chart */}
              <div className="space-y-4">
                {/* Quick Actions - Match blue border theme */}
                <div className="bg-gray-50/80 border-2 border-blue-600/50 rounded-xl p-5 shadow-sm">
                  <div className="text-base font-bold mb-4 text-gray-900">Quick Action</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all bg-white"
                      onClick={() => router.push('/contact')}
                    >
                      <IconBuilding className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Kelola Kontak</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all bg-white"
                      onClick={() => router.push('/contact?add=true')}
                    >
                      <IconUsers className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Tambah Baru</span>
                    </Button>
                  </div>
                </div>

                {/* Pie Chart - Blue theme */}
                <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="text-sm font-bold mb-4 flex items-center gap-2">
                    Distribusi Kontak
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#60a5fa" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
