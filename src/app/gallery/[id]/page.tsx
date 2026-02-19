
import { createClient } from "@/utils/supabase/server"
import AlbumCard from "@/components/AlbumCard"
import ShareButton from "@/components/ShareButton"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { redirect, notFound } from "next/navigation"

export const revalidate = 0

type Props = {
    params: Promise<{ id: string }>
}

export default async function GalleryPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Gallery info
    const { data: gallery } = await supabase
        .from("galleries")
        .select("*")
        .eq("id", id)
        .single()

    if (!gallery) notFound()

    // Check access: Owner OR Public
    const isOwner = user && gallery.user_id === user.id
    if (!gallery.is_public && !isOwner) {
        if (!user) redirect("/login")
        notFound() // Authenticated but not owner
    }

    // Fetch Albums in this gallery
    const { data: albums } = await supabase
        .from("albums")
        .select("*")
        .eq("gallery_id", id)
        .order("created_at", { ascending: false })

    return (
        <>
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {isOwner && (
                        <Link href="/" style={{ color: '#999', display: 'flex', alignItems: 'center' }}>
                            <ArrowLeft size={16} />
                        </Link>
                    )}
                    <div className="logo">
                        <span>{gallery.title}</span>
                    </div>
                </div>

                <div className="header-actions">
                    {isOwner && (
                        <>
                            <ShareButton galleryId={gallery.id} initialIsPublic={gallery.is_public} />
                            <Link href={`/create?galleryId=${gallery.id}`} className="btn btn-primary" style={{ height: '28px', fontSize: '13px' }}>
                                <Plus size={14} style={{ marginRight: '4px' }} />
                                <span>Add Album</span>
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <main className="main-content">
                {albums && albums.length > 0 ? (
                    <div className="gallery-grid">
                        {albums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '64px 0', opacity: 0.6 }}>
                        <p>No albums in this gallery.</p>
                        {isOwner && (
                            <Link href={`/create?galleryId=${gallery.id}`} style={{ color: 'var(--primary)', marginTop: '8px', display: 'inline-block' }}>
                                Create album
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </>
    )
}
