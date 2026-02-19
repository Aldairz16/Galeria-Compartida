
import { createClient } from "@/utils/supabase/server"
import AlbumCard from "@/components/AlbumCard"
import Link from "next/link"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/LogoutButton"

export const revalidate = 0

export default async function Home() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: albums } = await supabase
        .from("albums")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <>
            <header className="app-header">
                <div className="logo">
                    <span>Galeria</span> Photos
                </div>

                <div className="header-actions">
                    <LogoutButton />
                    <Link href="/create" className="btn btn-primary">
                        <Plus size={18} style={{ marginRight: '4px' }} />
                        <span>Create</span>
                    </Link>
                </div>
            </header>

            <main className="main-content">
                <h2 className="label" style={{ marginBottom: '16px' }}>Albums</h2>

                {albums && albums.length > 0 ? (
                    <div className="photo-grid">
                        {albums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                ) : (
                    <div className="login-container" style={{ minHeight: '50vh', flexDirection: 'column' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#303134', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Plus size={32} color="#9aa0a6" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No albums yet</h3>
                        <p className="text-gray" style={{ marginBottom: '24px' }}>
                            Your private albums will appear here.
                        </p>
                        <Link href="/create" className="btn btn-primary">
                            Create album
                        </Link>
                    </div>
                )}
            </main>
        </>
    )
}
