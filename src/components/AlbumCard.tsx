
import Link from "next/link"
import { MoreVertical, Edit2, Trash2, ExternalLink, Calendar } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import EditAlbumDialog from "./EditAlbumDialog"

interface Album {
    id: string
    title: string
    cover_url: string
    external_link?: string
    album_date?: string
    created_at?: string
}

export default function AlbumCard({ album, isOwner }: { album: Album, isOwner?: boolean }) {
    const router = useRouter()
    const supabase = createClient()
    const [showMenu, setShowMenu] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm("¿Estás seguro de que quieres eliminar este álbum? No se puede deshacer.")) return

        setIsDeleting(true)
        const { error } = await supabase.from('albums').delete().eq('id', album.id)

        if (!error) {
            router.refresh()
        } else {
            alert("Error al eliminar")
            setIsDeleting(false)
        }
    }

    // Format Date
    const dateStr = album.album_date || album.created_at
    const formattedDate = dateStr
        ? new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        : ''

    // Logic to determine Link behavior
    const hasExternalLink = !!album.external_link

    // Wrapper component to handle conditional linking
    const CardWrapper = ({ children }: { children: React.ReactNode }) => {
        if (hasExternalLink) {
            return (
                <a
                    href={album.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                    style={{ textDecoration: 'none' }}
                >
                    {children}
                </a>
            )
        }
        return (
            <Link href={`/album/${album.id}`} className="block h-full" style={{ textDecoration: 'none' }}>
                {children}
            </Link>
        )
    }

    return (
        <>
            <div className="relative group" style={{ height: '100%' }}>
                <CardWrapper>
                    <div
                        style={{
                            borderRadius: '3px', /* Notion radius */
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundColor: '#252525',
                            transition: 'background-color 0.2s',
                            /* Notion Card Shadow */
                            boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        className="hover:bg-[#2a2a2a]"
                    >
                        {/* Image Container - Aspect Ratio 16:9 for cover fit */}
                        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#202020', position: 'relative' }}>
                            <img
                                src={album.cover_url}
                                alt={album.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    transition: 'transform 0.4s ease',
                                    opacity: isDeleting ? 0.5 : 1
                                }}
                            />
                        </div>

                        {/* Content Container */}
                        <div style={{ padding: '8px 10px 10px 10px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: 'var(--foreground)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginBottom: '2px',
                                    flex: 1,
                                    marginRight: '24px' // Space for the menu button
                                }}>
                                    {album.title}
                                </h3>
                                {hasExternalLink && <ExternalLink size={12} style={{ color: '#666', minWidth: '12px' }} />}
                            </div>

                            {/* Date Display */}
                            {formattedDate && (
                                <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardWrapper>

                {/* Edit Menu Trigger - Positioned absolutely on top of the link */}
                {isOwner && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }}>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px',
                                cursor: 'pointer',
                                // Made always visible for better UX
                                opacity: 1,
                                transition: 'background-color 0.2s'
                            }}
                            className="hover:bg-black"
                            title="Opciones"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <>
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                                    backgroundColor: '#252525', border: '1px solid #333', borderRadius: '4px',
                                    padding: '4px', width: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    zIndex: 30
                                }}>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEditDialog(true); setShowMenu(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}
                                        className="hover:bg-[#333]"
                                    >
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px', border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}
                                        className="hover:bg-[#333]"
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                                {/* Improved backdrop with z-index */}
                                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} style={{ position: 'fixed', inset: 0, zIndex: 25 }} />
                            </>
                        )}
                    </div>
                )}
            </div>

            {showEditDialog && (
                <EditAlbumDialog album={album} onClose={() => setShowEditDialog(false)} />
            )}
        </>
    )
}
