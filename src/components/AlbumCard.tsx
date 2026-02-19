
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

    // Link component (reusable for image and title)
    const CardLink = ({ children, className }: { children: React.ReactNode, className?: string }) => {
        if (hasExternalLink) {
            return (
                <a
                    href={album.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    {children}
                </a>
            )
        }
        return (
            <Link
                href={`/album/${album.id}`}
                className={className}
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
                {children}
            </Link>
        )
    }

    return (
        <>
            <div
                style={{
                    borderRadius: '3px', /* Notion radius */
                    // overflow: 'hidden', /* REMOVED to allow menu to pop out */
                    backgroundColor: '#252525',
                    transition: 'background-color 0.2s',
                    boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                }}
                className="group hover:bg-[#2a2a2a]"
            >
                {/* Image Container - Clickable */}
                <CardLink className="block" >
                    <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        overflow: 'hidden',
                        backgroundColor: '#202020',
                        position: 'relative',
                        // Restore radius manually since parent overflow is visible
                        borderTopLeftRadius: '3px',
                        borderTopRightRadius: '3px'
                    }}>
                        <img
                            src={album.cover_url}
                            alt={album.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                transition: 'transform 0.4s ease',
                                opacity: isDeleting ? 0.5 : 1,
                                display: 'block'
                            }}
                        />
                    </div>
                </CardLink>

                {/* Content Container */}
                <div style={{ padding: '8px 10px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {/* Title and Date - Clickable */}
                        <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                            <CardLink className="block">
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: 'var(--foreground)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginBottom: '2px',
                                }}>
                                    {album.title}
                                </h3>
                                {formattedDate && (
                                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                        <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
                                    </div>
                                )}
                            </CardLink>
                        </div>

                        {/* Actions or Ext Link Icon - NOT wrapped in global link to prevent conflicts */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {hasExternalLink && !isOwner && <ExternalLink size={12} style={{ color: '#666' }} />}

                            {isOwner && (
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: '#999',
                                            border: 'none',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '4px'
                                        }}
                                        className="hover:bg-[#333] hover:text-white"
                                        title="Opciones"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {showMenu && (
                                        <>
                                            <div style={{
                                                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                                                backgroundColor: '#252525', border: '1px solid #333', borderRadius: '4px',
                                                padding: '4px', width: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                                zIndex: 100 // Increased zIndex
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
                                            {/* Backdrop */}
                                            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} style={{ position: 'fixed', inset: 0, zIndex: 90, cursor: 'default' }} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showEditDialog && (
                <EditAlbumDialog album={album} onClose={() => setShowEditDialog(false)} />
            )}
        </>
    )
}
