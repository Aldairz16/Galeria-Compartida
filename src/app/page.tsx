
import { supabase } from "@/lib/supabaseClient"
import AlbumCard from "@/components/AlbumCard"
import Link from "next/link"
import { Plus } from "lucide-react"

export const revalidate = 0 // Disable caching for now to see updates immediately

export default async function Home() {
    const { data: albums } = await supabase
        .from("albums")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <main className="min-h-screen p-8 container">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Galeria
                </h1>
                <Link href="/create" className="btn btn-primary">
                    <Plus size={20} />
                    <span>New Album</span>
                </Link>
            </header>

            {albums && albums.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {albums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 opacity-50">
                    <p className="text-xl mb-4">No albums yet.</p>
                    <Link href="/create" className="text-blue-400 hover:underline">
                        Create your first album
                    </Link>
                </div>
            )}
        </main>
    )
}
