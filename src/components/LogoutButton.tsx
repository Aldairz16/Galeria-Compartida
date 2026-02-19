"use client"

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="btn"
            style={{
                backgroundColor: 'transparent',
                color: '#999',
                border: '1px solid #333'
            }}
        >
            <LogOut size={14} style={{ marginRight: '6px' }} />
            <span>Salir</span>
        </button>
    )
}
