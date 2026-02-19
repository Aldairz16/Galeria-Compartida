
import CreateAlbumForm from "@/components/CreateAlbumForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreatePage() {
    return (
        <div className="min-h-screen p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md mb-6">
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Back to Gallery
                </Link>
            </div>
            <CreateAlbumForm />
        </div>
    )
}
