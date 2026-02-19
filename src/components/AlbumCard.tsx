
import Link from "next/link"

interface Album {
    id: string
    title: string
    cover_url: string
    external_link?: string
}

export default function AlbumCard({ album }: { album: Album }) {
    return (
        <Link href={`/album/${album.id}`} className="group block" style={{ textDecoration: 'none' }}>
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
    )
}
