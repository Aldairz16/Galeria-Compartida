"use client"

import { createClient } from "@/utils/supabase/client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push("/login")
    }

    return (
        <button onClick={handleLogout} className="btn-link" style={{ color: '#9aa0a6', display: 'flex', alignItems: 'center' }} title="Log Out">
            <LogOut size={20} />
        </button>
    )
}
