"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-md p-8">
                <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>

                <form onSubmit={handleAuth} className="space-y-4">
                    {message && (
                        <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500' : 'bg-green-500/10 text-green-500 border border-green-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                            </div>
                        ) : (isSignUp ? "Sign Up" : "Log In")}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>{" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-blue-400 hover:text-blue-300 hover:underline ml-1"
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    )
}
