
import CreateAlbumForm from "@/components/CreateAlbumForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreatePage() {
    return (
        <div className="login-container" style={{ padding: '0 16px', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px' }}>
            <div style={{ width: '100%', maxWidth: '400px', marginBottom: '24px' }}>
                <Link href="/" className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e8eaed' }}>
                    <ArrowLeft size={20} />
                    <span>Back to Gallery</span>
                </Link>
            </div>
            <CreateAlbumForm />
        </div>
    )
}
