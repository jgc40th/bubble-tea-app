// src/components/AuthModal.jsx
import { useState } from 'react'
import { signUpWithEmail, signInWithEmail, signInWithLine } from '../lib/supabase'

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  box: { background:'#fff', borderRadius:20, width:'100%', maxWidth:420, padding:32, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' },
  input: { width:'100%', padding:'11px 14px', border:'1.5px solid #E8D5B7', borderRadius:9, fontSize:14, outline:'none', boxSizing:'border-box', background:'#FDFAF5', marginBottom:12 },
  btn: { width:'100%', padding:'13px', border:'none', borderRadius:10, fontWeight:800, fontSize:15, cursor:'pointer' },
  err: { color:'#C53030', fontSize:13, marginBottom:10, background:'#FFF5F5', borderRadius:8, padding:'8px 12px' },
}

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login') // login | register
  const [form, setForm] = useState({ email:'', password:'', name:'' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    setErr(''); setLoading(true)
    let error
    if (mode === 'login') {
      ({ error } = await signInWithEmail(form.email, form.password))
    } else {
      if (!form.name) { setErr('請填寫姓名'); setLoading(false); return }
      ;({ error } = await signUpWithEmail(form.email, form.password, form.name))
      if (!error) { setErr(''); alert('註冊成功！請查收驗證信後登入。'); onClose(); return }
    }
    if (error) setErr(error.message)
    else onClose()
    setLoading(false)
  }

  const handleLine = async () => {
    await signInWithLine()
    // Redirects away — no need to close modal
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.box}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:'#2D1B0E' }}>
              {mode === 'login' ? '👋 歡迎回來' : '🎉 加入會員'}
            </div>
            <div style={{ fontSize:13, color:'#8B6A40', marginTop:4 }}>
              {mode === 'login' ? '登入以享受會員專屬優惠' : '立即加入，累積點數兌換好禮'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#EDF2F7', border:'none', borderRadius:50, width:34, height:34, cursor:'pointer', fontSize:18, color:'#4A5568' }}>×</button>
        </div>

        {/* LINE Login */}
        <button onClick={handleLine} style={{ ...S.btn, background:'#06C755', color:'#fff', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
          使用 LINE 帳號登入
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:'#E8D5B7' }}/>
          <span style={{ fontSize:12, color:'#8B6A40' }}>或使用 Email</span>
          <div style={{ flex:1, height:1, background:'#E8D5B7' }}/>
        </div>

        {err && <div style={S.err}>{err}</div>}

        {mode === 'register' && (
          <input style={S.input} placeholder="姓名" value={form.name} onChange={set('name')} />
        )}
        <input style={S.input} placeholder="Email" type="email" value={form.email} onChange={set('email')} />
        <input style={S.input} placeholder="密碼（至少6碼）" type="password" value={form.password} onChange={set('password')} />

        <button style={{ ...S.btn, background:'#F5A623', color:'#2D1B0E', marginBottom:14 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? '處理中...' : mode === 'login' ? '登入' : '註冊'}
        </button>

        <div style={{ textAlign:'center', fontSize:13, color:'#8B6A40' }}>
          {mode === 'login' ? (
            <>還沒有帳號？<button onClick={() => { setMode('register'); setErr('') }} style={{ background:'none', border:'none', color:'#C05621', fontWeight:700, cursor:'pointer' }}>立即註冊</button></>
          ) : (
            <>已有帳號？<button onClick={() => { setMode('login'); setErr('') }} style={{ background:'none', border:'none', color:'#C05621', fontWeight:700, cursor:'pointer' }}>返回登入</button></>
          )}
        </div>
      </div>
    </div>
  )
}
