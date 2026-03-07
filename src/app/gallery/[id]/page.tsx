
import { createClient } from "@/utils/supabase/server"
import GalleryView from "@/components/GalleryView"
import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"

export const revalidate = 0

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()

    const { data: gallery } = await supabase
        .from("galleries")
        .select("title")
        .eq("id", id)
        .single()

    if (!gallery) {
        return {
            title: "Galería no encontrada",
        }
    }

    return {
        title: gallery.title,
        description: gallery.title,
        openGraph: {
            title: gallery.title,
            description: gallery.title,
        },
        twitter: {
            title: gallery.title,
            description: gallery.title,
        }
    }
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
        <GalleryView
            gallery={gallery}
            initialAlbums={albums || []}
            isOwner={!!isOwner}
        />
    )
}
