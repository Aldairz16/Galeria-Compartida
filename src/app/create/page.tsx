
import CreateAlbumForm from "@/components/CreateAlbumForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ galleryId?: string }> }) {
    const { galleryId } = await searchParams

    return (
        <div className="login-container" style={{ padding: '0 16px', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px' }}>
            <div style={{ width: '100%', maxWidth: '400px', marginBottom: '24px' }}>
                <Link href={galleryId ? `/gallery/${galleryId}` : "/"} className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e8eaed' }}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </Link>
            </div>
            <CreateAlbumForm />
        </div>
    )
}
