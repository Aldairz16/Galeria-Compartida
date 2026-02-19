"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                })
                if (error) throw error
                setMessage({ text: "Check your email for the confirmation link!", type: "success" })
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.refresh()
                router.push("/")
            }
        } catch (err: unknown) {
            let errorMessage = "An error occurred"
            if (err instanceof Error) {
                errorMessage = err.message
            }
            setMessage({ text: errorMessage, type: "error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>

                <form onSubmit={handleAuth}>
                    {message && (
                        <div className={`message ${message.type === 'error' ? 'message-error' : 'message-success'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            required
                            minLength={6}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4">
                        {loading ? (
                            <div className="flex-center">
                                <Loader2 className="animate-spin" size={18} />
                                <span>Processing...</span>
                            </div>
                        ) : (isSignUp ? "Sign Up" : "Log In")}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray">
                    <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>{" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="btn-link"
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    )
}
