
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
        <div className="min-h-screen bg-black text-white relative">
            {/* Background with blur */}
            <div
                className="absolute inset-0 z-0 opacity-30 blur-3xl"
                style={{
                    backgroundImage: `url(${album.cover_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div className="relative z-10 container flex flex-col items-center justify-center min-h-screen py-12">
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full z-20">
                    <ArrowLeft size={24} />
                </Link>

                <div className="card max-w-2xl w-full bg-black/80 backdrop-blur-md border border-white/10 p-1 animate-in fade-in zoom-in duration-500">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-900">
                        <img
                            src={album.cover_url}
                            alt={album.title}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="p-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                            {album.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {album.external_link && (
                                <a
                                    href={album.external_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary text-lg px-8 py-3"
                                >
                                    <ExternalLink size={20} />
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
