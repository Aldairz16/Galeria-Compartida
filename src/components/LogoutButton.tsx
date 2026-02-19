"use client"

import { supabase } from "@/lib/supabaseClient"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push("/login")
    }

    return (
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors" title="Log Out">
            <LogOut size={20} />
        </button>
    )
}
