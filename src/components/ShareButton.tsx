"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Share2, Lock, Globe, Check, Loader2 } from "lucide-react"

export default function ShareButton({ galleryId, initialIsPublic }: { galleryId: string, initialIsPublic: boolean }) {
    const supabase = createClient()
    const [isPublic, setIsPublic] = useState(initialIsPublic)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const togglePublic = async () => {
        setLoading(true)
        const newValue = !isPublic
        const { error } = await supabase
            .from("galleries")
            .update({ is_public: newValue })
            .eq("id", galleryId)

        if (!error) setIsPublic(newValue)
        setLoading(false)
    }

    const copyLink = () => {
        const url = `${window.location.origin}/gallery/${galleryId}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn"
                style={{
                    backgroundColor: isPublic ? 'rgba(39, 174, 96, 0.1)' : 'transparent',
                    color: isPublic ? '#27ae60' : '#999',
                    border: isPublic ? '1px solid rgba(39, 174, 96, 0.2)' : '1px solid transparent'
                }}
            >
                {isPublic ? <Globe size={14} style={{ marginRight: '6px' }} /> : <Share2 size={14} style={{ marginRight: '6px' }} />}
                <span>Share</span>
            </button>

            {showMenu && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: '#252525',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '8px',
                    width: '280px',
                    zIndex: 200,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : (isPublic ? <Globe size={16} color="#27ae60" /> : <Lock size={16} color="#999" />)}
                                <div style={{ fontSize: '13px' }}>
                                    <div style={{ fontWeight: 500 }}>{isPublic ? 'Public Access' : 'Private'}</div>
                                    <div style={{ fontSize: '11px', color: '#888' }}>{isPublic ? 'Anyone with link can view' : 'Only you can view'}</div>
                                </div>
                            </div>
                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '32px', height: '18px' }}>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={togglePublic}
                                    disabled={loading}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: isPublic ? '#27ae60' : '#444',
                                    borderRadius: '18px', transition: '.4s'
                                }}>
                                    <span style={{
                                        position: 'absolute', content: '""', height: '14px', width: '14px', left: '2px', bottom: '2px',
                                        backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                                        transform: isPublic ? 'translateX(14px)' : 'translateX(0)'
                                    }} />
                                </span>
                            </label>
                        </div>

                        {isPublic && (
                            <div style={{ borderTop: '1px solid #333', paddingTop: '8px', marginTop: '4px' }}>
                                <input
                                    readOnly
                                    value={`${window.location.origin}/gallery/${galleryId}`}
                                    style={{ width: '100%', fontSize: '12px', padding: '6px', backgroundColor: '#191919', border: '1px solid #333', borderRadius: '3px', color: '#999', marginBottom: '8px' }}
                                />
                                <button
                                    onClick={copyLink}
                                    className="btn btn-full"
                                    style={{ backgroundColor: copied ? '#27ae60' : '#333', color: 'white', fontSize: '12px' }}
                                >
                                    {copied ? <><Check size={14} style={{ marginRight: '6px' }} /> Copied!</> : 'Copy Link'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Backdrop to close menu */}
            {showMenu && (
                <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
            )}
        </div>
    )
}
