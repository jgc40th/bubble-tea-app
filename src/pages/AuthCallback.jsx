// src/pages/AuthCallback.jsx
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    // Supabase handles the OAuth code exchange automatically
    supabase.auth.getSession().then(() => {
      window.location.href = '/'
    })
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#FDF6ED', fontFamily:'Noto Sans TC, sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧋</div>
        <div style={{ fontSize: 18, fontWeight: 700, color:'#2D1B0E' }}>登入中，請稍候...</div>
      </div>
    </div>
  )
}
