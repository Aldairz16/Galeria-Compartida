"use client"

import { useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, X, Upload, Calendar } from "lucide-react"
import { getCroppedBlob } from "@/utils/cropImage"

interface Album {
    id: string
    title: string
    cover_url: string
    external_link?: string
    album_date?: string
    created_at?: string
}

export default function EditAlbumDialog({ album, onClose }: { album: Album, onClose: () => void }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(album.title)
    // Use local date parts to avoid UTC shift with toISOString()
    const fallbackDate = album.created_at ? (() => { const d = new Date(album.created_at); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() : ''
    const [date, setDate] = useState(album.album_date || fallbackDate)
    const [externalLink, setExternalLink] = useState(album.external_link || "")

    // Image & Cropping State
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [coverChanged, setCoverChanged] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            setImageSrc(url)
            setCoverChanged(true)
            setZoom(1)
            setOffset({ x: 0, y: 0 })

            const img = new Image()
            img.src = url
            img.onload = () => setOriginalImage(img)
        }
    }

    // Drag Logic (mouse + touch)
    const handlePointerDown = (clientX: number, clientY: number) => {
        setIsDragging(true)
        setDragStart({ x: clientX - offset.x, y: clientY - offset.y })
    }

    const handlePointerMove = (clientX: number, clientY: number) => {
        if (!isDragging) return
        setOffset({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        })
    }

    const handlePointerEnd = () => setIsDragging(false)

    const handleMouseDown = (e: React.MouseEvent) => handlePointerDown(e.clientX, e.clientY)
    const handleMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY)

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault()
        const t = e.touches[0]
        handlePointerDown(t.clientX, t.clientY)
    }
    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault()
        const t = e.touches[0]
        handlePointerMove(t.clientX, t.clientY)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let newCoverUrl: string | undefined

            // If cover changed, process and upload new image
            if (coverChanged && originalImage && containerRef.current) {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error("Usuario no autenticado")

                const container = containerRef.current
                const croppedBlob = await getCroppedBlob({
                    image: originalImage,
                    containerWidth: container.clientWidth,
                    containerHeight: container.clientHeight,
                    zoom,
                    offsetX: offset.x,
                    offsetY: offset.y,
                })

                if (!croppedBlob) throw new Error("Error al procesar la imagen")

                const fileName = `${user.id}/${Date.now()}.jpg`

                const { error: uploadError } = await supabase.storage
                    .from("covers")
                    .upload(fileName, croppedBlob)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from("covers")
                    .getPublicUrl(fileName)

                newCoverUrl = publicUrl
            }

            // Update album
            const updateData: Record<string, unknown> = {
                title,
                external_link: externalLink || null,
                album_date: date || null
            }
            if (newCoverUrl) {
                updateData.cover_url = newCoverUrl
            }

            const { error } = await supabase
                .from('albums')
                .update(updateData)
                .eq('id', album.id)

            if (error) throw error

            router.refresh()
            onClose()
        } catch (err: unknown) {
            console.error(err)
            const msg = err instanceof Error ? err.message : "Error al actualizar"
            alert(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(74, 68, 88, 0.3)',
            backdropFilter: 'blur(6px)',
            padding: '16px'
        }}>
            <div style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                width: '100%',
                maxWidth: '420px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: 'var(--shadow-lg)',
                animation: 'fadeInScale 0.3s ease-out'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: 'none', border: 'none',
                    color: 'var(--text-tertiary)', cursor: 'pointer',
                    padding: '4px', borderRadius: '8px',
                    transition: 'color 0.2s'
                }}>
                    <X size={20} />
                </button>

                <h2 style={{
                    fontSize: '1.25rem', marginBottom: '24px',
                    fontWeight: 800, color: 'var(--foreground)'
                }}>
                    ✏️ Editar Álbum
                </h2>

                <form onSubmit={handleSave}>
                    {/* Cover Photo Editor */}
                    <div className="form-group">
                        <label className="label">Portada</label>
                        {!imageSrc ? (
                            <div style={{ position: 'relative' }}>
                                {/* Current cover preview */}
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '16/9',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border)',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={album.cover_url}
                                        alt={album.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                    />
                                    {/* Overlay with change button */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(0,0,0,0.35)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.25s',
                                        cursor: 'pointer'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                        />
                                        <div style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            gap: '6px', color: '#fff', pointerEvents: 'none'
                                        }}>
                                            <Upload size={24} />
                                            <span style={{ fontSize: '13px', fontWeight: 700 }}>Cambiar portada</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ width: '100%' }}>
                                <div
                                    ref={containerRef}
                                    style={{
                                        position: 'relative',
                                        borderRadius: 'var(--radius)',
                                        overflow: 'hidden',
                                        aspectRatio: '16/9',
                                        backgroundColor: 'var(--background)',
                                        cursor: isDragging ? 'grabbing' : 'grab',
                                        touchAction: 'none',
                                        border: '1px solid var(--border)'
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handlePointerEnd}
                                    onMouseLeave={handlePointerEnd}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handlePointerEnd}
                                >
                                    <img
                                        src={imageSrc}
                                        alt="Preview"
                                        draggable={false}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                            transition: isDragging ? 'none' : 'transform 0.1s',
                                            userSelect: 'none',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(126, 181, 168, 0.3)', pointerEvents: 'none', borderRadius: 'var(--radius)' }} />
                                </div>

                                {/* Zoom & Cancel */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Zoom:</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.1"
                                        value={zoom}
                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                        style={{ flex: 1, accentColor: 'var(--primary)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setImageSrc(null); setOriginalImage(null); setCoverChanged(false); }}
                                        style={{
                                            color: 'var(--error)', border: 'none', background: 'none',
                                            fontSize: '12px', cursor: 'pointer', fontWeight: 700
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
                        <div style={{ position: 'relative' }}>
                            <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                className="input"
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                style={{ paddingLeft: '38px', colorScheme: 'light' }}
                            />
                        </div>
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{
                            backgroundColor: 'var(--background)',
                            border: '1.5px solid var(--border)',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>
                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
