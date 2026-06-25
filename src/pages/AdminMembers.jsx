// src/pages/AdminMembers.jsx
import { useState, useEffect } from 'react'
import { adminFetchMembers, adminGrantCoupon, adminGrantPoints, supabase } from '../lib/supabase'

const S = {
  card: { background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(45,27,14,0.08)', padding:20, marginBottom:12 },
  input: { padding:'8px 12px', border:'1.5px solid #E8D5B7', borderRadius:8, fontSize:13, outline:'none', background:'#FDFAF5' },
  btn: { background:'#F5A623', color:'#2D1B0E', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer', fontSize:13 },
  btnSm: { border:'none', borderRadius:6, padding:'5px 12px', fontWeight:700, cursor:'pointer', fontSize:12 },
  levelColor: { general:'#8B6A40', silver:'#718096', gold:'#B7791F', vip:'#6B46C1' },
  levelLabel: { general:'一般', silver:'銀卡', gold:'金卡', vip:'VIP' },
}

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [grantPoints, setGrantPoints] = useState('')
  const [grantReason, setGrantReason] = useState('活動贈點')
  const [coupons, setCoupons] = useState([])
  const [selCoupon, setSelCoupon] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    adminFetchMembers().then(r => setMembers(r.data || []))
    supabase.from('coupons').select('*').eq('active', true).then(r => setCoupons(r.data || []))
  }, [])

  const filtered = members.filter(m =>
    !search || (m.name||'').includes(search) || (m.email||'').includes(search) || (m.phone||'').includes(search)
  )

  const handleGrantPoints = async () => {
    if (!selected || !grantPoints) return
    await adminGrantPoints(selected.id, Number(grantPoints), grantReason)
    setMsg(`✅ 已給予 ${grantPoints} 點`)
    setGrantPoints('')
    adminFetchMembers().then(r => setMembers(r.data || []))
    setSelected(prev => ({ ...prev, points: (prev.points || 0) + Number(grantPoints) }))
  }

  const handleGrantCoupon = async () => {
    if (!selected || !selCoupon) return
    await adminGrantCoupon(selected.id, Number(selCoupon))
    setMsg('✅ 優惠券已發送')
  }

  return (
    <div>
      <div style={{ fontWeight:800, fontSize:18, marginBottom:16, color:'#2D1B0E' }}>👥 會員管理</div>

      <div style={{ display:'flex', gap:16 }}>
        {/* List */}
        <div style={{ flex:1 }}>
          <input style={{ ...S.input, width:'100%', marginBottom:12, boxSizing:'border-box' }}
            placeholder="搜尋姓名/Email/手機" value={search} onChange={e => setSearch(e.target.value)} />
          {filtered.map(m => (
            <div key={m.id} style={{ ...S.card, cursor:'pointer', border: selected?.id === m.id ? '2px solid #F5A623' : '2px solid transparent' }}
              onClick={() => { setSelected(m); setMsg('') }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:42, height:42, borderRadius:50, background:'#FDF0DC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {m.avatar_url ? <img src={m.avatar_url} style={{ width:42, height:42, borderRadius:50, objectFit:'cover' }} alt="" /> : '👤'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{m.name || '（未設定）'}</div>
                  <div style={{ fontSize:12, color:'#8B6A40' }}>{m.email}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ color: S.levelColor[m.level], fontWeight:700, fontSize:12 }}>
                    {S.levelLabel[m.level]}
                  </span>
                  <div style={{ fontSize:12, color:'#5D3A1A', marginTop:2 }}>⭐ {m.points || 0} 點</div>
                </div>
                {m.line_uid && <span title="LINE 已綁定" style={{ fontSize:18 }}>💚</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width:300, flexShrink:0 }}>
            <div style={{ ...S.card, position:'sticky', top:16 }}>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:12 }}>會員詳情</div>
              {msg && <div style={{ color: msg.startsWith('✅') ? '#276749' : '#C53030', fontSize:13, marginBottom:10 }}>{msg}</div>}

              <div style={{ fontSize:13, lineHeight:2, color:'#5D3A1A', marginBottom:16 }}>
                <div><b>姓名：</b>{selected.name}</div>
                <div><b>Email：</b>{selected.email}</div>
                <div><b>手機：</b>{selected.phone || '未設定'}</div>
                <div><b>生日：</b>{selected.birthday || '未設定'}</div>
                <div><b>點數：</b>{selected.points || 0}</div>
                <div><b>等級：</b>{S.levelLabel[selected.level]}</div>
                <div><b>LINE：</b>{selected.line_uid ? '已綁定' : '未綁定'}</div>
                <div><b>加入：</b>{new Date(selected.created_at).toLocaleDateString('zh-TW')}</div>
              </div>

              {/* Grant points */}
              <div style={{ borderTop:'1px solid #F0E4D0', paddingTop:14, marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>⭐ 手動給點</div>
                <input style={{ ...S.input, width:'100%', marginBottom:8, boxSizing:'border-box' }} type="number" placeholder="點數數量" value={grantPoints} onChange={e => setGrantPoints(e.target.value)} />
                <input style={{ ...S.input, width:'100%', marginBottom:8, boxSizing:'border-box' }} placeholder="原因" value={grantReason} onChange={e => setGrantReason(e.target.value)} />
                <button style={{ ...S.btn, width:'100%' }} onClick={handleGrantPoints}>給予點數</button>
              </div>

              {/* Grant coupon */}
              <div style={{ borderTop:'1px solid #F0E4D0', paddingTop:14 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:8 }}>🎫 發送優惠券</div>
                <select style={{ ...S.input, width:'100%', marginBottom:8, boxSizing:'border-box' }} value={selCoupon} onChange={e => setSelCoupon(e.target.value)}>
                  <option value="">選擇優惠券</option>
                  {coupons.map(c => <option key={c.id} value={c.id}>{c.code} — {c.description}</option>)}
                </select>
                <button style={{ ...S.btn, width:'100%' }} onClick={handleGrantCoupon}>發送優惠券</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
