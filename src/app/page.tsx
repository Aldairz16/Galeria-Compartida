
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Plus, Folder } from "lucide-react"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/LogoutButton"

export const revalidate = 0

export default async function Home() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch Galleries instead of albums
    const { data: galleries } = await supabase
        .from("galleries")
        .select("*, albums(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <>
            <header className="app-header">
                <div className="logo">
                    <span>Galeria</span> Workspace
                </div>

                <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                    <LogoutButton />
                </div>
            </header>

            <main className="main-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#999',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        paddingLeft: '2px'
                    }}>
                        Mis Galerías
                    </h2>
                    <Link href="/create-gallery" className="btn btn-primary" style={{ height: '28px', fontSize: '13px' }}>
                        <Plus size={14} style={{ marginRight: '4px' }} />
                        <span>Nueva Galería</span>
                    </Link>
                </div>

                {galleries && galleries.length > 0 ? (
                    <div className="gallery-grid">
                        {galleries.map((gallery) => (
                            <Link key={gallery.id} href={`/gallery/${gallery.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    backgroundColor: '#252525',
                                    borderRadius: '3px',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px',
                                    transition: 'background-color 0.2s',
                                    height: '100%',
                                    minHeight: '120px'
                                }} className="hover:bg-[#2a2a2a]">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e8eaed' }}>
                                        <Folder size={18} fill="#e8eaed" fillOpacity={0.2} />
                                        <h3 style={{ fontSize: '15px', fontWeight: 500 }}>{gallery.title}</h3>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: 'auto' }}>
                                        {gallery.albums?.[0]?.count || 0} álbumes
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '64px 0',
                        opacity: 0.6
                    }}>
                        <div style={{ marginBottom: '16px' }}>
                            <Folder size={48} className="text-gray-500" />
                        </div>
                        <p style={{ marginBottom: '16px', fontSize: '14px' }}>No tienes galerías</p>
                        <Link href="/create-gallery" className="btn btn-primary">
                            Crear Galería
                        </Link>
                    </div>
                )}
            </main>
        </>
    )
}
