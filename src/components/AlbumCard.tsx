
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
        <div className="card group relative aspect-[3/4] overflow-hidden">
            <img
                src={album.cover_url}
                alt={album.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-xl font-bold text-white mb-2">{album.title}</h3>
                <div className="flex gap-2">
                    <Link href={`/album/${album.id}`} className="btn btn-primary text-sm py-2 px-3 flex-1">
                        View
                    </Link>
                    {album.external_link && (
                        <a href={album.external_link} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded text-white transition-colors">
                            <ExternalLink size={20} />
                        </a>
                    )}
                </div>
            </div>
            {/* Always visible title on mobile or if not hovering? Maybe simple overlay */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent md:hidden">
                <h3 className="text-white font-bold">{album.title}</h3>
            </div>
        </div>
    )
}
