"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateGalleryPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!title.trim()) {
            setError("Title required")
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error: insertError } = await supabase
                .from("galleries")
                .insert([{ title, user_id: user.id }])

            if (insertError) throw insertError

            router.push("/")
            router.refresh()
        } catch (err: unknown) {
            let msg = "Error creating gallery"
            if (err instanceof Error) msg = err.message
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container" style={{ padding: '0 16px', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '40px' }}>
            <div style={{ width: '100%', maxWidth: '400px', marginBottom: '24px' }}>
                <Link href="/" className="btn-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e8eaed' }}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="login-card">
                <h2 className="login-title" style={{ fontSize: '1.25rem', marginBottom: '24px' }}>New Gallery</h2>

                {error && <div className="message message-error">{error}</div>}

                <div className="form-group">
                    <label className="label">Gallery Name</label>
                    <input
                        className="input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Vacation 2024"
                        autoFocus
                    />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Create Gallery"}
                </button>
            </form>
        </div>
    )
}
