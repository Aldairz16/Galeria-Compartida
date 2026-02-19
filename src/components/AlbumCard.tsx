
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface Album {
    id: string
    title: string
    cover_url: string
    external_link?: string
}

export default function AlbumCard({ album }: { album: Album }) {
    return (
        <Link href={`/album/${album.id}`} className="group block relative aspect-square rounded-lg overflow-hidden bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <img
                src={album.cover_url}
                alt={album.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-90"
            />

            {/* Overlay Gradient - only visible on hover or focus mainly, but we keep title always visible for usability */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 opacity-100 transition-opacity">
                <h3 className="text-sm font-medium text-white truncate">{album.title}</h3>
            </div>
        </Link>
    )
}
