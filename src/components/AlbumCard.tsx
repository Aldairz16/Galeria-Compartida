
import Link from "next/link"
import { MoreVertical, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import EditAlbumDialog from "./EditAlbumDialog"

interface Album {
    id: string
    title: string
    cover_url: string
    external_link?: string
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
        if (!confirm("Are you sure you want to delete this album? This cannot be undone.")) return

        setIsDeleting(true)
        const { error } = await supabase.from('albums').delete().eq('id', album.id)

        if (!error) {
            router.refresh()
        } else {
            alert("Error deleting album")
            setIsDeleting(false)
        }
    }

    return (
        <>
            <div className="group block relative" style={{ textDecoration: 'none' }}>
                <Link href={`/album/${album.id}`} className="block">
                    <div
                        style={{
                            borderRadius: '3px', /* Notion radius */
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundColor: '#252525',
                            transition: 'background-color 0.2s',
                            /* Notion Card Shadow */
                            boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px',
                        }}
                        className="hover:bg-[#2a2a2a]"
                    >
                        {/* Image Container - Aspect Ratio 16:9 for cover fit */}
                        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#202020' }}>
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
                        <div style={{ padding: '8px 10px 10px 10px' }}>
                            <h3 style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'var(--foreground)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: '2px'
                            }}>
                                {album.title}
                            </h3>
                        </div>
                    </div>
                </Link>

                {/* Edit Menu Trigger */}
                {isOwner && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                        <button
                            onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px',
                                cursor: 'pointer',
                                opacity: showMenu ? 1 : 0,
                                transition: 'opacity 0.2s'
                            }}
                            className="group-hover:opacity-100"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <>
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                                    backgroundColor: '#252525', border: '1px solid #333', borderRadius: '4px',
                                    padding: '4px', width: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    zIndex: 20
                                }}>
                                    <button
                                        onClick={(e) => { e.preventDefault(); setShowEditDialog(true); setShowMenu(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}
                                        className="hover:bg-[#333]"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px', border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}
                                        className="hover:bg-[#333]"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                                <div onClick={(e) => { e.preventDefault(); setShowMenu(false); }} style={{ position: 'fixed', inset: 0, zIndex: 15 }} />
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
