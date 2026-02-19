
import { supabase } from "@/lib/supabaseClient"
import AlbumCard from "@/components/AlbumCard"
import Link from "next/link"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/LogoutButton"

export const revalidate = 0

export default async function Home() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect("/login")
    }

    const { data: albums } = await supabase
        .from("albums")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen pb-20">
            {/* Top Bar */}
            <header className="sticky top-0 z-30 bg-[#202124] flex items-center justify-between px-4 py-3 border-b border-[#5f6368]">
                <div className="flex items-center gap-4">
                    {/* Logo / Brand */}
                    <div className="text-xl font-medium text-white flex items-center gap-2">
                        <span className="text-blue-400 font-bold">Galeria</span> Photos
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <LogoutButton />
                    <Link href="/create" className="btn btn-primary btn-sm rounded-full px-4 ml-2">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container p-4">
                <h2 className="text-sm font-medium text-gray-400 mb-4 px-1">Albums</h2>

                {albums && albums.length > 0 ? (
                    <div className="photo-grid">
                        {albums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-32 h-32 bg-[#303134] rounded-full flex items-center justify-center mb-6">
                            <Plus size={48} className="text-[#9aa0a6]" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No albums yet</h3>
                        <p className="text-[#9aa0a6] mb-8 max-w-sm">
                            Your albums will appear here. Create one to get started!
                        </p>
                        <Link href="/create" className="btn btn-primary rounded-full">
                            Create album
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
