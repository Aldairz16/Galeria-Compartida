"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, X } from "lucide-react"

interface Album {
    id: string
    title: string
    external_link?: string
    album_date?: string
    created_at?: string
}

export default function EditAlbumDialog({ album, onClose }: { album: Album, onClose: () => void }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(album.title)
    const [date, setDate] = useState(album.album_date || (album.created_at ? new Date(album.created_at).toISOString().split('T')[0] : ''))
    const [externalLink, setExternalLink] = useState(album.external_link || "")

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase
            .from('albums')
            .update({
                title,
                external_link: externalLink || null,
                album_date: date || null
            })
            .eq('id', album.id)

        setLoading(false)

        if (!error) {
            router.refresh()
            onClose()
        } else {
            alert('Error al actualizar el álbum')
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div style={{ backgroundColor: '#191919', border: '1px solid #333', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '400px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 600 }}>Editar Álbum</h2>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="label">Título</label>
                        <input
                            className="input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Fecha</label>
                        <input
                            className="input"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Link Externo</label>
                        <input
                            className="input"
                            value={externalLink}
                            onChange={e => setExternalLink(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid #333' }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
