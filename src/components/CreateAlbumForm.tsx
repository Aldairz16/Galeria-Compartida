"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2 } from "lucide-react"

export default function CreateAlbumForm() {
    const router = useRouter()
    const supabase = createClient()
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            const fileExt = file.name.split(".").pop()
            const fileName = `${user.id}/${Math.random()}.${fileExt}` // Organize by user ID
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from("covers")
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from("covers")
                .getPublicUrl(filePath)

            const { error: insertError } = await supabase
                .from("albums")
                .insert([
                    {
                        title,
                        external_link: externalLink || null,
                        cover_url: publicUrl,
                        user_id: user.id
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
        <form onSubmit={handleSubmit} className="login-card">
            <h2 className="login-title" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>New Album</h2>

            {error && (
                <div className="message message-error">
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="label">Cover Image</label>
                {!previewUrl ? (
                    <div style={{ border: '2px dashed #5f6368', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        <div className="flex-center" style={{ flexDirection: 'column', color: '#9aa0a6' }}>
                            <Upload size={24} />
                            <span>Click to upload cover</span>
                        </div>
                    </div>
                ) : (
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '192px' }}>
                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                            type="button"
                            onClick={removeFile}
                            style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: 'white', padding: '4px', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="label">Album Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Amazing Trip"
                    className="input"
                    required
                />
            </div>

            <div className="form-group">
                <label className="label">External Link (Optional)</label>
                <input
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://photos.google.com/..."
                    className="input"
                    type="url"
                />
                <p style={{ fontSize: '0.75rem', color: '#9aa0a6', marginTop: '4px' }}>
                    Link to where the full album is hosted
                </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4">
                {loading ? (
                    <div className="flex-center">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Creating...</span>
                    </div>
                ) : (
                    "Create Album"
                )}
            </button>
        </form>
    )
}
