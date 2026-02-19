"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2 } from "lucide-react"

export default function CreateAlbumForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [externalLink, setExternalLink] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            setPreviewUrl(URL.createObjectURL(selectedFile))
        }
    }

    const removeFile = () => {
        setFile(null)
        setPreviewUrl(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!file || !title) {
            setError("Please provide both a title and a cover image.")
            setLoading(false)
            return
        }

        try {
            // 1. Upload file to Supabase Storage
            const fileExt = file.name.split(".").pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from("covers")
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("covers")
                .getPublicUrl(filePath)

            // 3. Insert record into database
            const { error: insertError } = await supabase
                .from("albums")
                .insert([
                    {
                        title,
                        external_link: externalLink || null,
                        cover_url: publicUrl,
                    },
                ])

            if (insertError) throw insertError

            router.push("/")
            router.refresh()
        } catch (err: unknown) {
            console.error(err)
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError("Something went wrong")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">New Album</h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="input-group">
                <label className="label">Cover Image</label>
                {!previewUrl ? (
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Upload size={24} />
                            <span>Click to upload cover</span>
                        </div>
                    </div>
                ) : (
                    <div className="relative rounded-lg overflow-hidden h-48 group">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 p-1 rounded-full text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="input-group">
                <label className="label">Album Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Amazing Trip"
                    className="input"
                    required
                />
            </div>

            <div className="input-group">
                <label className="label">External Link (Optional)</label>
                <input
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://photos.google.com/..."
                    className="input"
                    type="url"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Link to where the full album is hosted (e.g. Google Photos, Dropbox)
                </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4">
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Creating...
                    </>
                ) : (
                    "Create Album"
                )}
            </button>
        </form>
    )
}
