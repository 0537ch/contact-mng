
import type { Contact } from "@/lib/db";
import { useEffect, useState, useRef } from "react";

export function useContactData(){
    const[contact, setContact] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
        fetchContact()
    }, [])
    async function fetchContact() {
        try{
            setLoading(true)
            setError(null)
            const response = await fetch('/api/contact')

            if(!response.ok){
                throw new Error('Gagal mengambil data')
            }
            const data = await response.json()
            setContact(data)
        }
        catch(error){
            setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }
        return { contact, loading, error, fetchContact}
}
