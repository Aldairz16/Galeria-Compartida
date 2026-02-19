
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const revalidate = 0

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const { data: album } = await supabase
        .from("albums")
        .select("title, cover_url")
        .eq("id", id)
        .single()

    if (!album) {
        return {
            title: "Album Not Found",
        }
    }

    return {
        title: album.title,
        openGraph: {
            title: album.title,
            images: [album.cover_url],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: album.title,
            images: [album.cover_url],
        },
    }
}

export default async function AlbumPage({ params }: Props) {
    const { id } = await params
    const { data: album } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .single()

    if (!album) {
        notFound()
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: 'white', position: 'relative' }}>
            {/* Background with blur */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    opacity: 0.3,
                    filter: 'blur(60px)',
                    backgroundImage: `url(${album.cover_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 16px' }}>
                <Link href="/" style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%', zIndex: 20 }}>
                    <ArrowLeft size={24} color="white" />
                </Link>

                <div style={{ maxWidth: '42rem', width: '100%', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#202124' }}>
                        <img
                            src={album.cover_url}
                            alt={album.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>

                    <div style={{ padding: '32px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '24px', background: 'linear-gradient(to bottom right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {album.title}
                        </h1>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {album.external_link && (
                                <a
                                    href={album.external_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ padding: '12px 32px', fontSize: '1.125rem' }}
                                >
                                    <ExternalLink size={20} style={{ marginRight: '8px' }} />
                                    Open Album
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
