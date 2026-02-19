"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import AlbumCard from "@/components/AlbumCard"
import ShareButton from "@/components/ShareButton"
import Link from "next/link"
import { ArrowLeft, Plus, Search, Calendar, ChevronDown, Edit2, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface Album {
    id: string
    title: string
    cover_url: string
    created_at: string
    album_date?: string // New field for manual date
    external_link?: string
    gallery_id?: string
}

interface Gallery {
    id: string
    title: string
    is_public: boolean
    user_id: string
}

interface Props {
    gallery: Gallery
    initialAlbums: Album[]
    isOwner: boolean
}

type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'

export default function GalleryView({ gallery, initialAlbums, isOwner }: Props) {
    const router = useRouter()
    const supabase = createClient()

    // State
    const [albums, setAlbums] = useState(initialAlbums)

    // Sync state with props when router.refresh() happens
    useMemo(() => {
        setAlbums(initialAlbums)
    }, [initialAlbums])

    const [galleryTitle, setGalleryTitle] = useState(gallery.title)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>('date_desc')
    const [showSortMenu, setShowSortMenu] = useState(false)

    // Editing Gallery Title
    const handleSaveTitle = async () => {
        if (!galleryTitle.trim()) return

        const { error } = await supabase
            .from('galleries')
            .update({ title: galleryTitle })
            .eq('id', gallery.id)

        if (!error) {
            setIsEditingTitle(false)
            router.refresh()
        }
    }

    // Filtering & Sorting
    const processedAlbums = useMemo(() => {
        let result = [...albums]

        // 1. Search (Fuzzy -ish)
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(album =>
                album.title.toLowerCase().includes(query)
            )
        }

        // 2. Sort
        result.sort((a, b) => {
            // Use album_date if available, otherwise created_at
            const dateA = a.album_date ? new Date(a.album_date).getTime() : new Date(a.created_at).getTime()
            const dateB = b.album_date ? new Date(b.album_date).getTime() : new Date(b.created_at).getTime()

            switch (sortBy) {
                case 'date_desc':
                    return dateB - dateA
                case 'date_asc':
                    return dateA - dateB
                case 'name_asc':
                    return a.title.localeCompare(b.title)
                case 'name_desc':
                    return b.title.localeCompare(a.title)
                default:
                    return 0
            }
        })

        return result
    }, [albums, searchQuery, sortBy])

    // Grouping by Month/Year
    const groupedAlbums = useMemo(() => {
        const groups: { [key: string]: Album[] } = {}

        processedAlbums.forEach(album => {
            // Use album_date for grouping if available
            const date = album.album_date ? new Date(album.album_date) : new Date(album.created_at)
            // Helper for Spanish Month
            const months = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ]
            const monthName = months[date.getMonth()]
            const year = date.getFullYear()
            const key = `${monthName} ${year}`

            if (!groups[key]) groups[key] = []
            groups[key].push(album)
        })

        return groups
    }, [processedAlbums])

    return (
        <>
            <header className="app-header" style={{ height: 'auto', padding: '16px', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                        {isOwner && (
                            <Link href="/" style={{ color: '#999', display: 'flex', alignItems: 'center', padding: '4px' }}>
                                <ArrowLeft size={20} />
                            </Link>
                        )}

                        {isEditingTitle ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    value={galleryTitle}
                                    onChange={(e) => setGalleryTitle(e.target.value)}
                                    className="input"
                                    style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '4px 8px', width: 'auto', minWidth: '200px' }}
                                    autoFocus
                                />
                                <button onClick={handleSaveTitle} className="btn btn-primary" style={{ padding: '8px' }}><Check size={16} /></button>
                                <button onClick={() => { setIsEditingTitle(false); setGalleryTitle(gallery.title); }} className="btn" style={{ padding: '8px' }}><X size={16} /></button>
                            </div>
                        ) : (
                            <div className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{galleryTitle}</h1>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditingTitle(true)}
                                        className="btn"
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: '#999',
                                            border: '1px solid transparent',
                                            padding: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'color 0.2s, background-color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        title="Editar Título"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="header-actions">
                        {isOwner && (
                            <>
                                <ShareButton galleryId={gallery.id} initialIsPublic={gallery.is_public} />
                                <Link href={`/create?galleryId=${gallery.id}`} className="btn btn-primary" style={{ height: '32px' }}>
                                    <Plus size={16} style={{ marginRight: '4px' }} />
                                    <span>Nuevo Álbum</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar álbumes..."
                            className="input"
                            style={{ paddingLeft: '36px', height: '36px' }}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="btn"
                            style={{ height: '36px', backgroundColor: '#252525', border: '1px solid #333', paddingRight: '8px' }}
                        >
                            <span style={{ marginRight: '4px' }}>Ordenar por</span>
                            <ChevronDown size={14} />
                        </button>
                        {showSortMenu && (
                            <>
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                                    backgroundColor: '#252525', border: '1px solid #333', borderRadius: '4px',
                                    zIndex: 50, width: '180px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}>
                                    {[
                                        { label: 'Fecha (Reciente)', value: 'date_desc' },
                                        { label: 'Fecha (Antigua)', value: 'date_asc' },
                                        { label: 'Nombre (A-Z)', value: 'name_asc' },
                                        { label: 'Nombre (Z-A)', value: 'name_desc' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSortBy(opt.value as SortOption); setShowSortMenu(false); }}
                                            style={{
                                                display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                                                backgroundColor: sortBy === opt.value ? '#333' : 'transparent',
                                                border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div onClick={() => setShowSortMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="main-content">
                {Object.keys(groupedAlbums).length > 0 ? (
                    Object.entries(groupedAlbums).map(([groupTitle, groupAlbums]) => (
                        <div key={groupTitle} style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                marginBottom: '16px', color: '#999', fontSize: '14px', fontWeight: 600
                            }}>
                                <Calendar size={14} />
                                <span>{groupTitle}</span>
                                <div style={{ height: '1px', flex: 1, backgroundColor: '#333' }} />
                            </div>

                            {/* Bug Fix: Ensure this container has width/height and items are visible */}
                            <div className="gallery-grid" style={{ minHeight: '100px' }}>
                                {groupAlbums.map((album) => (
                                    <AlbumCard key={album.id} album={album} isOwner={isOwner} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '64px 0', opacity: 0.6 }}>
                        {searchQuery ? <p>No se encontraron álbumes "{searchQuery}"</p> : <p>No hay álbumes en esta galería.</p>}
                        {isOwner && !searchQuery && (
                            <Link href={`/create?galleryId=${gallery.id}`} style={{ color: 'var(--primary)', marginTop: '8px', display: 'inline-block' }}>
                                Crear Álbum
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </>
    )
}
